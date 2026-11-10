package httpserver

import (
	"log/slog"
	"net/http"
	"os"
	"path"
	"path/filepath"
	"time"

	"ki-web/backend/internal/audit"
	"ki-web/backend/internal/auth"
	"ki-web/backend/internal/media"
	"ki-web/backend/internal/service"
	"ki-web/backend/internal/web"
)

// Config enthält alles, was der Router braucht.
type Config struct {
	Public        *service.Public
	Audit         *audit.Catalog
	Accounts      *service.Accounts
	Editorial     *service.Editorial
	Site          *web.Site
	EditorialSite *web.Editorial
	MediaPath     string // optional: liefert /media/* lokal aus (in Produktion übernimmt das Caddy)
	// Media speichert hochgeladene Bilder (Ticket #25). Ohne Media lehnt das Backend Uploads ab.
	Media *media.Store
	// SecureCookies setzt das Secure-Attribut am Sitzungscookie (bei HTTPS).
	SecureCookies bool
	// TrustProxy liest die IP-Adresse aus X-Forwarded-For (hinter Caddy).
	TrustProxy bool
	// RequireLogin zeigt die öffentliche Webseite nur angemeldeten Konten (optionaler Zugangsschutz, Ticket #49).
	// Standardmäßig aus: Die Webseite ist öffentlich (Ticket #108). Redaktions-API (guard) und Redaktionsseiten
	// (web.Editorial) prüfen Sitzung und Rolle unabhängig davon.
	RequireLogin bool
	Log          *slog.Logger
}

// New baut den vollständigen HTTP-Handler aus API, Medien und Webseite.
func New(cfg Config) http.Handler {
	mux := http.NewServeMux()
	registerAPI(mux, &apiServer{
		svc:           cfg.Public,
		audit:         cfg.Audit,
		accounts:      cfg.Accounts,
		editorial:     cfg.Editorial,
		media:         cfg.Media,
		limiter:       auth.NewLimiter(loginMaxFailures, loginWindow),
		secureCookies: cfg.SecureCookies,
		log:           cfg.Log,
	}, cfg.Log)
	if cfg.MediaPath != "" {
		mux.Handle("GET /media/", mediaHandler(cfg.MediaPath))
	}
	cfg.EditorialSite.Register(mux)
	cfg.Site.Register(mux)
	g := &guard{accounts: cfg.Accounts, trustProxy: cfg.TrustProxy, log: cfg.Log}
	h := g.wrap(mux)
	if cfg.RequireLogin {
		h = (&gate{accounts: cfg.Accounts, log: cfg.Log}).wrap(h)
	}
	return recoverer(cfg.Log, logRequests(cfg.Log, hardenResponses(limitBody(h))))
}

// maxRequestBytes begrenzt jeden Anfragetext. Er liegt über dem größten Bild-Upload (media.MaxUploadBytes)
// samt Multipart-Rahmen und schützt JSON-Endpunkte vor überlangen Anfragen.
const maxRequestBytes = media.MaxUploadBytes + 1<<20

// limitBody lässt höchstens maxRequestBytes aus dem Anfragetext lesen. Größere Anfragen scheitern beim Lesen.
func limitBody(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		r.Body = http.MaxBytesReader(w, r.Body, maxRequestBytes)
		next.ServeHTTP(w, r)
	})
}

// hardenResponses setzt Sicherheits-Header, damit der Schutz auch ohne vorgeschalteten Proxy (z. B. in der
// Entwicklung) gilt. Der Proxy in deploy/Caddyfile ergänzt CSP und HSTS.
func hardenResponses(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		h := w.Header()
		h.Set("X-Content-Type-Options", "nosniff")
		h.Set("X-Frame-Options", "DENY")
		h.Set("Referrer-Policy", "strict-origin-when-cross-origin")
		next.ServeHTTP(w, r)
	})
}

// mediaHandler liefert hochgeladene Bilder aus. Dateinamen ändern sich nie, daher ein Jahr Cache.
func mediaHandler(dir string) http.Handler {
	files := http.FileServer(http.Dir(dir))
	return http.StripPrefix("/media", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		clean := path.Clean(r.URL.Path)
		if clean == "/" {
			http.NotFound(w, r)
			return
		}
		if fi, err := os.Stat(filepath.Join(dir, filepath.FromSlash(clean))); err != nil || fi.IsDir() {
			http.NotFound(w, r)
			return
		}
		w.Header().Set("Cache-Control", "public, max-age=31536000, immutable")
		files.ServeHTTP(w, r)
	}))
}

// statusWriter merkt sich den Antwortstatus für das Protokoll.
type statusWriter struct {
	http.ResponseWriter
	status int
}

func (w *statusWriter) WriteHeader(code int) {
	w.status = code
	w.ResponseWriter.WriteHeader(code)
}

// logRequests protokolliert Methode, Pfad, Status und Dauer. IP-Adressen und Inhalte werden
// bewusst nicht protokolliert (ARCHITECTURE.md, Abschnitt 10).
func logRequests(log *slog.Logger, next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		sw := &statusWriter{ResponseWriter: w, status: http.StatusOK}
		next.ServeHTTP(sw, r)
		if r.URL.Path == "/api/health" && sw.status == http.StatusOK {
			return // Healthchecks nicht protokollieren
		}
		log.Info("anfrage", "methode", r.Method, "pfad", r.URL.Path, "status", sw.status,
			"dauer_ms", time.Since(start).Milliseconds())
	})
}

// recoverer fängt Panics ab, protokolliert sie und antwortet mit 500, damit der Server weiterläuft.
func recoverer(log *slog.Logger, next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		defer func() {
			if v := recover(); v != nil {
				log.Error("panik im handler", "pfad", r.URL.Path, "wert", v)
				http.Error(w, "Interner Fehler", http.StatusInternalServerError)
			}
		}()
		next.ServeHTTP(w, r)
	})
}
