package web

import (
	"encoding/xml"
	"net/http"
	"time"

	"ki-web/backend/internal/service"
)

type xmlURLSet struct {
	XMLName xml.Name `xml:"urlset"`
	NS      string   `xml:"xmlns,attr"`
	XHTML   string   `xml:"xmlns:xhtml,attr"`
	URLs    []xmlURL `xml:"url"`
}

type xmlURL struct {
	Loc     string    `xml:"loc"`
	LastMod string    `xml:"lastmod,omitempty"`
	Links   []xmlLink `xml:"xhtml:link"`
}

type xmlLink struct {
	Rel      string `xml:"rel,attr"`
	Hreflang string `xml:"hreflang,attr"`
	Href     string `xml:"href,attr"`
}

// sitemap erzeugt die Sitemap aus der Datenbank. Sie enthält nur veröffentlichte Beiträge und
// je Seite nur die Sprachen, in denen sie tatsächlich vorliegt.
func (s *Site) sitemap(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	posts, err := s.svc.Posts(ctx, service.DE)
	if err != nil {
		s.fail(w, err)
		return
	}
	topics, err := s.svc.Topics(ctx, service.DE)
	if err != nil {
		s.fail(w, err)
		return
	}

	var latest time.Time
	topicLatest := map[string]time.Time{}
	for _, p := range posts {
		latest = later(latest, p.UpdatedAt)
		for _, t := range p.Topics {
			topicLatest[t.Slug] = later(topicLatest[t.Slug], p.UpdatedAt)
		}
	}

	set := xmlURLSet{NS: "http://www.sitemaps.org/schemas/sitemap/0.9", XHTML: "http://www.w3.org/1999/xhtml"}
	add := func(langs []service.Lang, suffix string, mod time.Time) {
		links := make([]xmlLink, 0, len(langs)+1)
		for _, a := range s.alternates(langs, suffix) {
			links = append(links, xmlLink{Rel: "alternate", Hreflang: a.Hreflang, Href: a.Href})
		}
		for _, l := range langs {
			u := xmlURL{Loc: s.url(l, suffix), Links: links}
			if !mod.IsZero() {
				u.LastMod = mod.UTC().Format(time.RFC3339)
			}
			set.URLs = append(set.URLs, u)
		}
	}

	add(service.Langs, "", latest)
	add(service.Langs, "/blog", latest)
	add(service.Langs, "/profil", time.Time{})
	add(service.Langs, "/ki-einsatzfelder", time.Time{})
	for _, t := range topics {
		add(t.Translations, "/themen/"+t.Slug, topicLatest[t.Slug])
	}
	for _, p := range posts {
		add(p.Translations, "/blog/"+p.Slug, p.UpdatedAt)
	}
	// Dimensionsseiten des KI-Audits: Inhalte aus dem Repository, daher ohne lastmod
	for _, slug := range s.audit.Slugs() {
		d, err := s.audit.Dimension(slug, service.DE)
		if err != nil {
			s.fail(w, err)
			return
		}
		add(d.Translations, dimensionPath(slug), time.Time{})
	}

	w.Header().Set("Content-Type", "application/xml; charset=utf-8")
	w.Header().Set("Cache-Control", "public, max-age=3600")
	_, _ = w.Write([]byte(xml.Header))
	enc := xml.NewEncoder(w)
	enc.Indent("", "  ")
	if err := enc.Encode(set); err != nil {
		s.log.Error("sitemap schreiben", "fehler", err)
	}
}

func later(a, b time.Time) time.Time {
	if b.After(a) {
		return b
	}
	return a
}

func (s *Site) fail(w http.ResponseWriter, err error) {
	s.log.Error("sitemap aufbauen", "fehler", err)
	http.Error(w, "Interner Fehler", http.StatusInternalServerError)
}
