package httpserver

import (
	"errors"
	"log/slog"
	"net/http"
	"net/url"
	"strings"

	"ki-web/backend/internal/service"
	"ki-web/backend/internal/web"
)

// gate ist der Zugangsschutz vor dem Livegang (Ticket #49). Ist er aktiv, sieht nur, wer mit einem
// Konto angemeldet ist, die öffentliche Webseite. Ohne Sitzung führen Seitenaufrufe zur Anmeldung der
// Redaktion, die öffentliche API antwortet mit 401. Suchmaschinen sollen nichts indexieren.
type gate struct {
	accounts *service.Accounts
	log      *slog.Logger
}

// robotsClosed sperrt die ganze Webseite für Suchmaschinen.
const robotsClosed = "User-agent: *\nDisallow: /\n"

// gateOpen nennt die Pfade, die ohne Anmeldung erreichbar bleiben: die Anmeldung selbst samt
// Redaktionsfrontend, die Anmelde-API, die Redaktions-API mit eigener Prüfung und der Healthcheck.
func gateOpen(p string) bool {
	switch {
	case p == web.Base || strings.HasPrefix(p, web.Base+"/"):
		return true
	case strings.HasPrefix(p, "/api/auth/"), p == "/api/admin", strings.HasPrefix(p, "/api/admin/"):
		return true
	case p == "/api/health":
		return true
	}
	return false
}

func (g *gate) wrap(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("X-Robots-Tag", "noindex, nofollow")
		p := r.URL.Path
		if p == "/robots.txt" {
			w.Header().Set("Content-Type", "text/plain; charset=utf-8")
			w.Header().Set("Cache-Control", "no-store")
			_, _ = w.Write([]byte(robotsClosed))
			return
		}
		if gateOpen(p) {
			next.ServeHTTP(w, r)
			return
		}
		_, err := g.accounts.Authenticate(r.Context(), sessionToken(r))
		switch {
		case err == nil:
			next.ServeHTTP(w, r)
		case !errors.Is(err, service.ErrUnauthenticated):
			g.log.Error("sitzung prüfen", "fehler", err)
			http.Error(w, "Interner Fehler", http.StatusInternalServerError)
		case strings.HasPrefix(p, "/api/"):
			writeJSONError(w, http.StatusUnauthorized, "Anmeldung erforderlich.")
		case r.Method == http.MethodGet || r.Method == http.MethodHead:
			w.Header().Set("Cache-Control", "no-store")
			http.Redirect(w, r, LoginURL(r.URL.RequestURI()), http.StatusSeeOther)
		default:
			http.Error(w, "Anmeldung erforderlich", http.StatusUnauthorized)
		}
	})
}

// LoginURL führt zur Anmeldung und merkt sich im Parameter „weiter“ die aufgerufene Seite.
func LoginURL(target string) string {
	return web.LoginPath + "?weiter=" + url.QueryEscape(target)
}
