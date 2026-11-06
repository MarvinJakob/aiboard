// Package web liefert die öffentliche Webseite aus und ergänzt Meta-Tags, Sitemap und robots.txt
// (ARCHITECTURE.md, Abschnitt 6).
package web

import (
	"embed"
	"errors"
	"io/fs"
	"log/slog"
	"net/http"
	"path"
	"strings"

	"ki-web/backend/internal/audit"
	"ki-web/backend/internal/service"
)

// dist enthält die Frontend-Builds. Vite schreibt die öffentliche Webseite nach dist/public.
// Das Redaktionsfrontend folgt in Sprint 3 unter dist/redaktion.
//
//go:embed all:dist
var dist embed.FS

// Site liefert die öffentliche Webseite aus.
type Site struct {
	svc     *service.Public
	audit   *audit.Catalog
	baseURL string
	files   fs.FS
	index   []byte
	log     *slog.Logger
}

// New erzeugt die Auslieferung. files ist optional (Tests); ohne Angabe gilt der eingebettete Build.
func New(svc *service.Public, catalog *audit.Catalog, baseURL string, files fs.FS, log *slog.Logger) *Site {
	if files == nil {
		files, _ = fs.Sub(dist, "dist/public")
	}
	index, err := fs.ReadFile(files, "index.html")
	if err != nil {
		log.Warn("frontend-build fehlt, es wird eine Platzhalterseite ausgeliefert", "fehler", err)
		index = []byte(fallbackIndex)
	}
	return &Site{svc: svc, audit: catalog, baseURL: strings.TrimRight(baseURL, "/"), files: files, index: index, log: log}
}

const fallbackIndex = `<!doctype html><html lang="de"><head><meta charset="utf-8"><!--app-head--><title>KI Perspektiven</title><!--/app-head--></head>
<body><p>Das Frontend ist noch nicht gebaut. Bitte <code>npm run build</code> im Ordner <code>frontend</code> ausführen.</p></body></html>`

// Register hängt alle Routen der Webseite an den Router.
func (s *Site) Register(mux *http.ServeMux) {
	mux.HandleFunc("GET /assets/", s.assets)
	mux.HandleFunc("GET /robots.txt", s.robots)
	mux.HandleFunc("GET /sitemap.xml", s.sitemap)
	mux.HandleFunc("GET /", s.page)
}

// assets liefert Dateien mit Hash im Namen, die sich nie ändern.
func (s *Site) assets(w http.ResponseWriter, r *http.Request) {
	name := strings.TrimPrefix(path.Clean(r.URL.Path), "/")
	if _, err := fs.Stat(s.files, name); err != nil {
		http.NotFound(w, r)
		return
	}
	w.Header().Set("Cache-Control", "public, max-age=31536000, immutable")
	http.ServeFileFS(w, r, s.files, name)
}

// page beantwortet alle übrigen GET-Anfragen: öffentliche Seiten, statische Dateien im Wurzelverzeichnis
// des Builds (z. B. favicon.svg) und unbekannte Pfade (404).
func (s *Site) page(w http.ResponseWriter, r *http.Request) {
	p := strings.Trim(r.URL.Path, "/")
	parts := strings.Split(p, "/")

	// Statische Datei im Wurzelverzeichnis, z. B. /favicon.svg
	if len(parts) == 1 && strings.Contains(parts[0], ".") && parts[0] != "index.html" {
		if _, err := fs.Stat(s.files, parts[0]); err == nil {
			w.Header().Set("Cache-Control", "public, max-age=3600")
			http.ServeFileFS(w, r, s.files, parts[0])
			return
		}
	}

	status, meta, err := s.resolve(r, parts)
	if err != nil {
		s.log.Error("seite aufbauen", "pfad", r.URL.Path, "fehler", err)
		status, meta = http.StatusInternalServerError, s.notFoundMeta(service.DE)
	}
	body, err := render(s.index, meta)
	if err != nil {
		s.log.Error("meta-tags rendern", "fehler", err)
		http.Error(w, "Interner Fehler", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	w.Header().Set("Cache-Control", "no-cache")
	w.WriteHeader(status)
	if r.Method != http.MethodHead {
		_, _ = w.Write(body)
	}
}

// resolve ordnet einen Pfad einer Ansicht zu (Routen aus ARCHITECTURE.md, Abschnitt 3).
func (s *Site) resolve(r *http.Request, parts []string) (int, Meta, error) {
	ctx := r.Context()
	if len(parts) == 1 && parts[0] == "" {
		// "/" leitet das Frontend auf die gespeicherte Sprache um. Kanonisch ist die deutsche Startseite.
		return http.StatusOK, s.homeMeta(service.DE), nil
	}
	lang, ok := service.ParseLang(parts[0])
	if !ok {
		return http.StatusNotFound, s.notFoundMeta(service.DE), nil
	}
	rest := parts[1:]
	switch {
	case len(rest) == 0:
		return http.StatusOK, s.homeMeta(lang), nil
	case len(rest) == 1 && rest[0] == "blog":
		return http.StatusOK, s.staticMeta(lang, "blog", "/blog"), nil
	case len(rest) == 1 && rest[0] == "impressum":
		return http.StatusOK, s.staticMeta(lang, "imprint", "/impressum"), nil
	case len(rest) == 1 && rest[0] == "datenschutz":
		return http.StatusOK, s.staticMeta(lang, "privacy", "/datenschutz"), nil
	case len(rest) == 2 && rest[0] == "blog":
		post, err := s.svc.Post(ctx, rest[1], lang)
		if errors.Is(err, service.ErrNotFound) {
			return http.StatusNotFound, s.notFoundMeta(lang), nil
		}
		if err != nil {
			return 0, Meta{}, err
		}
		return http.StatusOK, s.postMeta(lang, post), nil
	case len(rest) == 2 && rest[0] == "themen":
		topic, err := s.svc.Topic(ctx, rest[1], lang)
		if errors.Is(err, service.ErrNotFound) {
			return http.StatusNotFound, s.notFoundMeta(lang), nil
		}
		if err != nil {
			return 0, Meta{}, err
		}
		return http.StatusOK, s.topicMeta(lang, topic), nil
	case len(rest) == 3 && rest[0] == "themen" && rest[1] == audit.TopicSlug:
		// Dimensionsseite des KI-Audits (Anforderung 9)
		d, err := s.audit.Dimension(rest[2], lang)
		if errors.Is(err, service.ErrNotFound) {
			return http.StatusNotFound, s.notFoundMeta(lang), nil
		}
		if err != nil {
			return 0, Meta{}, err
		}
		return http.StatusOK, s.dimensionMeta(d), nil
	}
	return http.StatusNotFound, s.notFoundMeta(lang), nil
}

func dimensionPath(slug string) string { return "/themen/" + audit.TopicSlug + "/" + slug }

func (s *Site) dimensionMeta(d audit.Dimension) Meta {
	suffix := dimensionPath(d.Slug)
	return Meta{
		Lang: d.Lang, Title: pageTitle(d.Title), Description: excerpt(d.Summary+" "+strings.Join(d.Intro, " "), 160),
		OGType: "website", Canonical: s.url(d.Lang, suffix), Alternates: s.alternates(d.Translations, suffix),
	}
}

func (s *Site) url(lang service.Lang, suffix string) string {
	return s.baseURL + "/" + string(lang) + suffix
}

// alternates liefert hreflang-Verweise für alle vorhandenen Sprachen und x-default (Deutsch).
func (s *Site) alternates(langs []service.Lang, suffix string) []Alternate {
	out := make([]Alternate, 0, len(langs)+1)
	for _, l := range langs {
		out = append(out, Alternate{Hreflang: string(l), Href: s.url(l, suffix)})
	}
	def := service.DE
	if len(langs) > 0 && !contains(langs, service.DE) {
		def = langs[0]
	}
	return append(out, Alternate{Hreflang: "x-default", Href: s.url(def, suffix)})
}

func contains(ls []service.Lang, l service.Lang) bool {
	for _, x := range ls {
		if x == l {
			return true
		}
	}
	return false
}

func (s *Site) homeMeta(lang service.Lang) Meta {
	return Meta{
		Lang: lang, Title: SiteName, Description: text(lang, "home.desc"), OGType: "website",
		Canonical: s.url(lang, ""), Alternates: s.alternates(service.Langs, ""),
	}
}

func (s *Site) staticMeta(lang service.Lang, key, suffix string) Meta {
	return Meta{
		Lang: lang, Title: pageTitle(text(lang, key+".title")), Description: text(lang, key+".desc"), OGType: "website",
		Canonical: s.url(lang, suffix), Alternates: s.alternates(service.Langs, suffix),
	}
}

func (s *Site) topicMeta(lang service.Lang, t service.TopicDetail) Meta {
	suffix := "/themen/" + t.Slug
	return Meta{
		// Fehlt die Übersetzung, ist die vorhandene Fassung kanonisch.
		Lang: t.Lang, Title: pageTitle(t.Title), Description: excerpt(t.Intro, 160), OGType: "website",
		Canonical: s.url(t.Lang, suffix), Alternates: s.alternates(t.Translations, suffix),
	}
}

func (s *Site) postMeta(lang service.Lang, p service.Post) Meta {
	suffix := "/blog/" + p.Slug
	m := Meta{
		Lang: p.Lang, Title: pageTitle(p.Title), Description: excerpt(p.Summary, 160), OGType: "article",
		Canonical: s.url(p.Lang, suffix), Alternates: s.alternates(p.Translations, suffix),
	}
	if p.Cover != nil {
		m.OGImage = s.baseURL + p.Cover.OGImage
	}
	return m
}

func (s *Site) notFoundMeta(lang service.Lang) Meta {
	return Meta{
		Lang: lang, Title: pageTitle(text(lang, "notFound.title")), Description: text(lang, "notFound.desc"),
		OGType: "website", NoIndex: true,
	}
}

func (s *Site) robots(w http.ResponseWriter, _ *http.Request) {
	w.Header().Set("Content-Type", "text/plain; charset=utf-8")
	_, _ = w.Write([]byte("User-agent: *\nDisallow: /redaktion\nDisallow: /api\n\nSitemap: " + s.baseURL + "/sitemap.xml\n"))
}
