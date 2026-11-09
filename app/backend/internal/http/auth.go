package httpserver

import (
	"context"
	"errors"
	"log/slog"
	"net"
	"net/http"
	"net/url"
	"strings"
	"time"

	"ki-web/backend/internal/api"
	"ki-web/backend/internal/auth"
	"ki-web/backend/internal/service"
)

// Begrenzung der Anmeldeversuche je IP-Adresse (ARCHITECTURE.md, Abschnitt 4).
const (
	loginMaxFailures = 10
	loginWindow      = 15 * time.Minute
)

type ctxKey int

const (
	identityKey ctxKey = iota
	clientIPKey
)

func identityFrom(ctx context.Context) (service.Identity, bool) {
	id, ok := ctx.Value(identityKey).(service.Identity)
	return id, ok
}

func clientIPFrom(ctx context.Context) string {
	ip, _ := ctx.Value(clientIPKey).(string)
	return ip
}

// guard schützt die Redaktions-API. Die Entscheidung trifft ausschließlich das Backend
// (ARCHITECTURE.md, Abschnitt 1):
//   - /api/admin/*, /api/auth/me und /api/auth/logout verlangen eine gültige Sitzung (sonst 401).
//   - /api/admin/users* verlangt die Rolle admin, die übrigen /api/admin-Pfade eine Redaktionsrolle (sonst 403).
//   - Schreibende Aufrufe mit Sitzung verlangen das CSRF-Token der Sitzung im Header X-CSRF-Token (sonst 403).
//   - Schreibende API-Aufrufe von fremden Ursprüngen werden abgelehnt (403).
type guard struct {
	accounts   *service.Accounts
	trustProxy bool
	log        *slog.Logger
}

func unsafeMethod(m string) bool {
	return m != http.MethodGet && m != http.MethodHead && m != http.MethodOptions
}

func needsSession(p string) bool {
	return p == "/api/admin" || strings.HasPrefix(p, "/api/admin/") || p == "/api/auth/me" || p == "/api/auth/logout"
}

func (g *guard) wrap(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		p := r.URL.Path
		if !strings.HasPrefix(p, "/api/") {
			next.ServeHTTP(w, r)
			return
		}
		ctx := context.WithValue(r.Context(), clientIPKey, g.clientIP(r))
		if p == "/api/auth/login" {
			ctx = context.WithValue(ctx, previousSessionKey{}, sessionToken(r))
		}
		if unsafeMethod(r.Method) && !sameOrigin(r) {
			writeJSONError(w, http.StatusForbidden, "Anfrage von fremder Herkunft abgelehnt.")
			return
		}
		if !needsSession(p) {
			next.ServeHTTP(w, r.WithContext(ctx))
			return
		}
		id, err := g.accounts.Authenticate(ctx, sessionToken(r))
		if errors.Is(err, service.ErrUnauthenticated) {
			writeJSONError(w, http.StatusUnauthorized, "Anmeldung erforderlich.")
			return
		}
		if err != nil {
			g.log.Error("sitzung prüfen", "fehler", err)
			writeJSONError(w, http.StatusInternalServerError, "Interner Fehler.")
			return
		}
		if unsafeMethod(r.Method) && !auth.EqualTokens(r.Header.Get("X-CSRF-Token"), id.CSRFToken) {
			writeJSONError(w, http.StatusForbidden, "CSRF-Token fehlt oder ist ungültig. Bitte die Seite neu laden.")
			return
		}
		if !allowed(p, id.Role) {
			writeJSONError(w, http.StatusForbidden, "Keine Berechtigung für diesen Bereich.")
			return
		}
		next.ServeHTTP(w, r.WithContext(context.WithValue(ctx, identityKey, id)))
	})
}

// allowed prüft die Rolle für einen geschützten API-Pfad.
func allowed(p string, role service.Role) bool {
	switch {
	case p == "/api/admin/users" || strings.HasPrefix(p, "/api/admin/users/"):
		return role.CanManageUsers()
	case p == "/api/admin" || strings.HasPrefix(p, "/api/admin/"):
		return role.CanEdit()
	}
	return true // /api/auth/me und /api/auth/logout: jede gültige Sitzung
}

func sessionToken(r *http.Request) string {
	c, err := r.Cookie(auth.CookieName)
	if err != nil {
		return ""
	}
	return c.Value
}

// sameOrigin lehnt schreibende Anfragen ab, die ein Browser von einer fremden Seite schickt.
// Anfragen ohne Origin (z. B. von Werkzeugen) sind erlaubt; sie tragen kein Sitzungscookie des Browsers.
func sameOrigin(r *http.Request) bool {
	if o := r.Header.Get("Origin"); o != "" {
		u, err := url.Parse(o)
		return err == nil && strings.EqualFold(u.Host, r.Host)
	}
	return r.Header.Get("Sec-Fetch-Site") != "cross-site"
}

// clientIP ermittelt die IP-Adresse für die Begrenzung der Anmeldeversuche. Hinter Caddy steht sie im
// letzten Eintrag von X-Forwarded-For, den Caddy selbst setzt.
func (g *guard) clientIP(r *http.Request) string {
	if g.trustProxy {
		if xff := r.Header.Get("X-Forwarded-For"); xff != "" {
			parts := strings.Split(xff, ",")
			return strings.TrimSpace(parts[len(parts)-1])
		}
	}
	host, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		return r.RemoteAddr
	}
	return host
}

// ---------------------------------------------------------------------------
// Handler für /api/auth
// ---------------------------------------------------------------------------

func (s *apiServer) sessionCookie(value string, maxAge int, expires time.Time) string {
	c := &http.Cookie{
		Name:     auth.CookieName,
		Value:    value,
		Path:     "/",
		MaxAge:   maxAge,
		Expires:  expires,
		HttpOnly: true,
		Secure:   s.secureCookies,
		SameSite: http.SameSiteLaxMode,
	}
	return c.String()
}

func toMe(id service.Identity) api.Me {
	return api.Me{Id: id.UserID, Email: id.Email, Role: api.Role(id.Role), CsrfToken: id.CSRFToken}
}

func (s *apiServer) Login(ctx context.Context, req api.LoginRequestObject) (api.LoginResponseObject, error) {
	ip := clientIPFrom(ctx)
	if !s.limiter.Allowed(ip) {
		return api.Login429JSONResponse{Message: "Zu viele Fehlversuche. Bitte in 15 Minuten erneut versuchen."}, nil
	}
	if req.Body == nil || strings.TrimSpace(req.Body.Email) == "" || req.Body.Password == "" {
		return api.Login400JSONResponse{BadRequestJSONResponse: api.BadRequestJSONResponse{
			Message: "Bitte E-Mail-Adresse und Passwort angeben.",
		}}, nil
	}
	sess, err := s.accounts.Login(ctx, req.Body.Email, req.Body.Password)
	if errors.Is(err, service.ErrInvalidCredentials) {
		s.limiter.Fail(ip)
		return api.Login401JSONResponse{UnauthorizedJSONResponse: api.UnauthorizedJSONResponse{
			Message: "E-Mail-Adresse oder Passwort ist falsch, oder das Konto ist deaktiviert.",
		}}, nil
	}
	if err != nil {
		return nil, err
	}
	s.limiter.Reset(ip)
	// Eine vorherige Sitzung desselben Browsers wird ersetzt.
	if old, ok := ctx.Value(previousSessionKey{}).(string); ok && old != "" {
		_ = s.accounts.Logout(ctx, auth.HashToken(old))
	}
	cookie := s.sessionCookie(sess.Token, int(service.SessionTTL.Seconds()), sess.ExpiresAt)
	return api.Login200JSONResponse{Body: toMe(sess.Identity), Headers: api.Login200ResponseHeaders{SetCookie: &cookie}}, nil
}

// previousSessionKey trägt das Cookie einer bestehenden Sitzung zum Login-Handler.
type previousSessionKey struct{}

func (s *apiServer) Logout(ctx context.Context, _ api.LogoutRequestObject) (api.LogoutResponseObject, error) {
	id, ok := identityFrom(ctx)
	if !ok {
		return api.Logout401JSONResponse{UnauthorizedJSONResponse: api.UnauthorizedJSONResponse{Message: "Anmeldung erforderlich."}}, nil
	}
	if err := s.accounts.Logout(ctx, id.SessionID); err != nil {
		return nil, err
	}
	cookie := s.sessionCookie("", -1, time.Unix(0, 0))
	return api.Logout204Response{Headers: api.Logout204ResponseHeaders{SetCookie: &cookie}}, nil
}

func (s *apiServer) GetMe(ctx context.Context, _ api.GetMeRequestObject) (api.GetMeResponseObject, error) {
	id, ok := identityFrom(ctx)
	if !ok {
		return api.GetMe401JSONResponse{UnauthorizedJSONResponse: api.UnauthorizedJSONResponse{Message: "Anmeldung erforderlich."}}, nil
	}
	return api.GetMe200JSONResponse(toMe(id)), nil
}
