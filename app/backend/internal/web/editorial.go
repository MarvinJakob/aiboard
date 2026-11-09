package web

import (
	"context"
	"errors"
	"io/fs"
	"log/slog"
	"net/http"
	"path"
	"regexp"
	"strings"

	"ki-web/backend/internal/auth"
	"ki-web/backend/internal/service"
)

// Authenticator prüft ein Sitzungscookie.
type Authenticator interface {
	Authenticate(ctx context.Context, token string) (service.Identity, error)
}

// Editorial liefert das Redaktionsfrontend unter /redaktion aus (ARCHITECTURE.md, Abschnitt 6, Schritt 5).
// Die Anmeldeseite ist öffentlich. Alle anderen Seiten prüfen Sitzung und Rolle, bevor die App
// ausgeliefert wird. Ohne Sitzung leitet das Backend auf die Anmeldung um.
type Editorial struct {
	accounts Authenticator
	files    fs.FS
	index    []byte
	log      *slog.Logger
}

// Base ist der Basispfad des Redaktionsfrontends.
const Base = "/redaktion"

// LoginPath ist die Anmeldeseite im Redaktionsfrontend.
const LoginPath = Base + "/anmelden"

// NewEditorial erzeugt die Auslieferung. files ist optional (Tests); ohne Angabe gilt der eingebettete Build.
func NewEditorial(accounts Authenticator, files fs.FS, log *slog.Logger) *Editorial {
	if files == nil {
		files, _ = fs.Sub(dist, "dist/redaktion")
	}
	index, err := fs.ReadFile(files, "index.html")
	if err != nil {
		log.Warn("build des redaktionsfrontends fehlt, es wird eine platzhalterseite ausgeliefert", "fehler", err)
		index = []byte(editorialFallback)
	}
	return &Editorial{accounts: accounts, files: files, index: index, log: log}
}

const editorialFallback = `<!doctype html><html lang="de"><head><meta charset="utf-8"><title>Redaktion – KI Perspektiven</title></head>
<body><p>Das Redaktionsfrontend ist noch nicht gebaut. Bitte <code>npm run build</code> im Ordner <code>frontend-redaktion</code> ausführen.</p></body></html>`

// Register hängt die Routen des Redaktionsfrontends an den Router.
func (e *Editorial) Register(mux *http.ServeMux) {
	mux.HandleFunc("GET "+Base+"/assets/", e.assets)
	mux.HandleFunc("GET "+Base, e.page)
	mux.HandleFunc("GET "+Base+"/", e.page)
}

// HomeFor ist die Startseite nach der Anmeldung: Beitragsliste für die Redaktion,
// Benutzerverwaltung für Admin-Konten (Anforderung 6).
func HomeFor(role service.Role) string {
	if role.CanManageUsers() {
		return Base + "/benutzer"
	}
	return Base
}

// SafeTarget prüft ein Ziel nach der Anmeldung (Parameter „weiter“, Ticket #49). Erlaubt sind nur
// Pfade derselben Webseite. Ziele wie //andere.example oder /\andere.example würden Browser auf eine
// fremde Seite führen und werden abgelehnt.
func SafeTarget(t string) (string, bool) {
	if !strings.HasPrefix(t, "/") || strings.HasPrefix(t, "//") || strings.HasPrefix(t, "/\\") {
		return "", false
	}
	if strings.ContainsAny(t, "\r\n\t") {
		return "", false
	}
	return t, true
}

func (e *Editorial) assets(w http.ResponseWriter, r *http.Request) {
	name := strings.TrimPrefix(path.Clean(r.URL.Path), Base+"/")
	if _, err := fs.Stat(e.files, name); err != nil {
		http.NotFound(w, r)
		return
	}
	w.Header().Set("Cache-Control", "public, max-age=31536000, immutable")
	http.ServeFileFS(w, r, e.files, name)
}

// access beschreibt, wer eine Seite des Redaktionsfrontends öffnen darf.
type access int

const (
	accessUnknown access = iota // unbekannte Seite
	accessPublic                // Anmeldung
	accessEditor                // Beiträge
	accessAdmin                 // Benutzerverwaltung
)

// postPath erkennt die Bearbeitungsseite eines Beitrags, z. B. beitraege/12.
var postPath = regexp.MustCompile(`^beitraege/[1-9][0-9]{0,17}$`)

// route ordnet einen Pfad unterhalb von /redaktion einer Zugriffsstufe zu (ARCHITECTURE.md, Abschnitt 3).
func route(rest string) access {
	switch {
	case rest == "anmelden":
		return accessPublic
	case rest == "":
		return accessEditor
	case rest == "beitraege/neu" || postPath.MatchString(rest):
		return accessEditor
	case rest == "benutzer":
		return accessAdmin
	}
	return accessUnknown
}

func (e *Editorial) page(w http.ResponseWriter, r *http.Request) {
	rest := strings.Trim(strings.TrimPrefix(r.URL.Path, Base), "/")

	// Statische Datei im Wurzelverzeichnis des Builds, z. B. /redaktion/favicon.svg
	if !strings.Contains(rest, "/") && strings.Contains(rest, ".") && rest != "index.html" {
		if _, err := fs.Stat(e.files, rest); err == nil {
			w.Header().Set("Cache-Control", "public, max-age=3600")
			http.ServeFileFS(w, r, e.files, rest)
			return
		}
	}

	w.Header().Set("Cache-Control", "no-store")
	w.Header().Set("X-Robots-Tag", "noindex")

	id, err := e.accounts.Authenticate(r.Context(), sessionCookie(r))
	loggedIn := err == nil
	if err != nil && !errors.Is(err, service.ErrUnauthenticated) {
		e.log.Error("sitzung prüfen", "fehler", err)
		http.Error(w, "Interner Fehler", http.StatusInternalServerError)
		return
	}

	need := route(rest)
	switch {
	case need == accessPublic && loggedIn:
		// Bereits angemeldet: direkt zum gemerkten Ziel (Ticket #49) oder zur passenden Startseite.
		dest := HomeFor(id.Role)
		if t, ok := SafeTarget(r.URL.Query().Get("weiter")); ok {
			dest = t
		}
		http.Redirect(w, r, dest, http.StatusSeeOther)
		return
	case need == accessPublic:
		e.serve(w, r, http.StatusOK)
		return
	case !loggedIn:
		http.Redirect(w, r, LoginPath, http.StatusSeeOther)
		return
	case need == accessUnknown:
		e.serve(w, r, http.StatusNotFound)
	case need == accessAdmin && !id.Role.CanManageUsers(), need == accessEditor && !id.Role.CanEdit():
		e.serve(w, r, http.StatusForbidden)
	default:
		e.serve(w, r, http.StatusOK)
	}
}

func (e *Editorial) serve(w http.ResponseWriter, r *http.Request, status int) {
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	w.WriteHeader(status)
	if r.Method != http.MethodHead {
		_, _ = w.Write(e.index)
	}
}

func sessionCookie(r *http.Request) string {
	c, err := r.Cookie(auth.CookieName)
	if err != nil {
		return ""
	}
	return c.Value
}
