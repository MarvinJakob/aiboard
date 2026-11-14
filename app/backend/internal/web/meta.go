package web

import (
	"bytes"
	"html/template"
	"strings"
	"unicode/utf8"

	"ki-web/backend/internal/service"
)

// SiteName ist der Arbeitstitel der Webseite (Design.md: Platzhalter für Name und Logo).
const SiteName = "KI Perspektiven"

// Meta beschreibt die Angaben im <head> einer öffentlichen Seite (ARCHITECTURE.md, Abschnitt 6).
type Meta struct {
	Lang        service.Lang
	Title       string
	Description string
	Canonical   string
	OGType      string
	OGImage     string
	Alternates  []Alternate
	NoIndex     bool
}

// Alternate ist ein Verweis auf eine Übersetzung (hreflang).
type Alternate struct {
	Hreflang string
	Href     string
}

func (m Meta) OGLocale() string {
	if m.Lang == service.EN {
		return "en_GB"
	}
	return "de_DE"
}

var headTmpl = template.Must(template.New("head").Parse(`<title>{{.Title}}</title>
    <meta name="description" content="{{.Description}}">
{{- if .NoIndex}}
    <meta name="robots" content="noindex">
{{- end}}
{{- if .Canonical}}
    <link rel="canonical" href="{{.Canonical}}">
{{- end}}
{{- range .Alternates}}
    <link rel="alternate" hreflang="{{.Hreflang}}" href="{{.Href}}">
{{- end}}
    <meta property="og:site_name" content="` + SiteName + `">
    <meta property="og:type" content="{{.OGType}}">
    <meta property="og:title" content="{{.Title}}">
    <meta property="og:description" content="{{.Description}}">
{{- if .Canonical}}
    <meta property="og:url" content="{{.Canonical}}">
{{- end}}
    <meta property="og:locale" content="{{.OGLocale}}">
{{- if .OGImage}}
    <meta property="og:image" content="{{.OGImage}}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:image" content="{{.OGImage}}">
{{- else}}
    <meta name="twitter:card" content="summary">
{{- end}}
    <meta name="twitter:title" content="{{.Title}}">
    <meta name="twitter:description" content="{{.Description}}">`))

const (
	headStart = "<!--app-head-->"
	headEnd   = "<!--/app-head-->"
)

// render setzt die Meta-Angaben in die index.html des Frontend-Builds ein.
// Die Vorlage enthält zwischen <!--app-head--> und <!--/app-head--> einen Standardtitel,
// der ersetzt wird, sowie <html lang="de">.
func render(index []byte, m Meta) ([]byte, error) {
	var head bytes.Buffer
	if err := headTmpl.Execute(&head, m); err != nil {
		return nil, err
	}
	s := string(index)
	if i, j := strings.Index(s, headStart), strings.Index(s, headEnd); i >= 0 && j > i {
		s = s[:i] + head.String() + s[j+len(headEnd):]
	}
	s = strings.Replace(s, `<html lang="de"`, `<html lang="`+string(m.Lang)+`"`, 1)
	return []byte(s), nil
}

// texts enthält die Seitentitel und Beschreibungen für Seiten ohne Datenbankinhalt.
// Die Startseitentexte stehen gleichlautend in frontend/src/i18n/home.ts (title, description), die Texte der
// Readiness-Auswertung in frontend/src/i18n/{de,en}.ts (assess.resultTitle, assess.resultMeta). Tests prüfen das,
// damit der Seitentitel nach dem Laden nicht wechselt (Bug #126).
var texts = map[service.Lang]map[string]string{
	service.DE: {
		"profile.title":         "Marvin Jakob – Profil",
		"profile.desc":          "Marvin Jakob: IT-Berater und Full-Stack-Entwickler. Mein Hintergrund und meine Fragen zu KI in Softwareentwicklung, Data Analytics und AI Audit.",
		"home.title":            "KI verstehen. Sinnvoll einsetzen.",
		"home.desc":             "Praxiswissen für den professionellen Einsatz von KI. Mit klarem Blick auf Nutzen, Grenzen und Verantwortung.",
		"aiUses.title":          "Wofür KI heute eingesetzt wird",
		"aiUses.desc":           "Sieben typische Aufgaben von KI mit belegten Beispielen und Zahlen zur KI-Nutzung in Deutschland.",
		"blog.title":            "Blog",
		"blog.desc":             "Alle veröffentlichten Beiträge rund um KI – die neuesten zuerst.",
		"imprint.title":         "Impressum",
		"imprint.desc":          "Impressum von " + SiteName + ".",
		"privacy.title":         "Datenschutz",
		"privacy.desc":          "Datenschutzerklärung von " + SiteName + ".",
		"readinessResult.title": "Auswertung der Selbsteinschätzung",
		"readinessResult.desc":  "Die gewählten Reifegrade aller Dimensionen der KI-Readiness-Selbsteinschätzung.",
		"notFound.title":        "Seite nicht gefunden",
		"notFound.desc":         "Diese Seite gibt es nicht oder sie ist nicht öffentlich.",
	},
	service.EN: {
		"profile.title":         "Marvin Jakob – Profile",
		"profile.desc":          "Marvin Jakob: IT consultant and full-stack developer. My background and questions about AI in software development, data analytics and AI audit.",
		"home.title":            "Understand AI. Use it wisely.",
		"home.desc":             "Practical knowledge for the professional use of AI. With a clear view of benefits, limits and responsibility.",
		"aiUses.title":          "What AI is used for today",
		"aiUses.desc":           "Seven typical tasks of AI with documented examples and figures on AI use in Germany.",
		"blog.title":            "Blog",
		"blog.desc":             "All published articles about AI – newest first.",
		"imprint.title":         "Legal notice",
		"imprint.desc":          "Legal notice of " + SiteName + ".",
		"privacy.title":         "Privacy",
		"privacy.desc":          "Privacy policy of " + SiteName + ".",
		"readinessResult.title": "Self-assessment results",
		"readinessResult.desc":  "The chosen maturity levels of all dimensions of the AI readiness self-assessment.",
		"notFound.title":        "Page not found",
		"notFound.desc":         "This page does not exist or is not public.",
	},
}

func text(l service.Lang, key string) string { return texts[l][key] }

func pageTitle(t string) string { return t + " · " + SiteName }

// excerpt kürzt einen Text für die Meta-Beschreibung an einer Wortgrenze.
func excerpt(s string, limit int) string {
	s = strings.Join(strings.Fields(s), " ")
	if utf8.RuneCountInString(s) <= limit {
		return s
	}
	r := []rune(s)[:limit]
	cut := string(r)
	if i := strings.LastIndex(cut, " "); i > limit/2 {
		cut = cut[:i]
	}
	return strings.TrimRight(cut, " ,.;:–-") + " …"
}
