package httpserver_test

import (
	"context"
	"database/sql"
	"encoding/json"
	"io"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"sync"
	"testing"
	"testing/fstest"

	"ki-web/backend/internal/api"
	"ki-web/backend/internal/audit"
	httpserver "ki-web/backend/internal/http"
	"ki-web/backend/internal/media"
	"ki-web/backend/internal/service"
	"ki-web/backend/internal/store"
	"ki-web/backend/internal/web"
)

const testIndex = `<!doctype html><html lang="de"><head><!--app-head--><title>KI Perspektiven</title><!--/app-head--></head><body><div id="root"></div></body></html>`

const testEditorialIndex = `<!doctype html><html lang="de"><head><title>Redaktion</title></head><body><div id="redaktion"></div></body></html>`

// newServer startet die Anwendung mit einer temporären SQLite-Datenbank je Test.
// opts passen die Konfiguration an, z. B. für den Zugangsschutz (Ticket #49).
func newServer(t *testing.T, devSeed bool, opts ...func(*httpserver.Config)) (*httptest.Server, *sql.DB) {
	t.Helper()
	log := slog.New(slog.NewTextHandler(io.Discard, nil))
	db, err := store.Open(filepath.Join(t.TempDir(), "test.db"))
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { db.Close() })
	if err := store.Migrate(context.Background(), db, devSeed, log); err != nil {
		t.Fatal(err)
	}
	catalog, err := audit.Load()
	if err != nil {
		t.Fatal(err)
	}
	public := service.NewPublic(store.New(db))
	mediaDir := t.TempDir()
	files := fstest.MapFS{
		"index.html":        {Data: []byte(testIndex)},
		"favicon.svg":       {Data: []byte("<svg/>")},
		"assets/app-abc.js": {Data: []byte("console.log(1)")},
	}
	accounts := service.NewAccounts(db)
	editorialFiles := fstest.MapFS{
		"index.html":            {Data: []byte(testEditorialIndex)},
		"favicon.svg":           {Data: []byte("<svg/>")},
		"assets/redaktion-1.js": {Data: []byte("console.log(2)")},
	}
	cfg := httpserver.Config{
		Public:        public,
		Audit:         catalog,
		Accounts:      accounts,
		Site:          web.New(public, catalog, "https://example.test", files, log),
		Editorial:     service.NewEditorial(db),
		EditorialSite: web.NewEditorial(accounts, editorialFiles, log),
		Media:         media.NewStore(mediaDir),
		MediaPath:     mediaDir,
		Log:           log,
	}
	for _, o := range opts {
		o(&cfg)
	}
	srv := httptest.NewServer(httpserver.New(cfg))
	t.Cleanup(srv.Close)
	mediaDirs.Store(srv.URL, mediaDir)
	return srv, db
}

// mediaDirs merkt sich je Testserver sein Medienverzeichnis (Ticket #25).
var mediaDirs sync.Map

func mediaDirOf(srv *httptest.Server) string {
	d, _ := mediaDirs.Load(srv.URL)
	return d.(string)
}

func get(t *testing.T, srv *httptest.Server, path string) (*http.Response, string) {
	t.Helper()
	resp, err := http.Get(srv.URL + path)
	if err != nil {
		t.Fatal(err)
	}
	defer resp.Body.Close()
	body, _ := io.ReadAll(resp.Body)
	return resp, string(body)
}

func getJSON[T any](t *testing.T, srv *httptest.Server, path string, wantStatus int) T {
	t.Helper()
	resp, body := get(t, srv, path)
	if resp.StatusCode != wantStatus {
		t.Fatalf("GET %s: status %d, erwartet %d (%s)", path, resp.StatusCode, wantStatus, body)
	}
	var v T
	if err := json.Unmarshal([]byte(body), &v); err != nil {
		t.Fatalf("GET %s: %v", path, err)
	}
	return v
}

func slugs(ps []api.PostSummary) []string {
	out := make([]string, 0, len(ps))
	for _, p := range ps {
		out = append(out, p.Slug)
	}
	return out
}

func TestHealth(t *testing.T) {
	srv, _ := newServer(t, false)
	h := getJSON[api.Health](t, srv, "/api/health", 200)
	if h.Status != "ok" || h.Database != "ok" {
		t.Fatalf("unerwartet: %+v", h)
	}
}

// Anforderung 3 und Tickets #77/#82: fünf Themen mit Titel und Einführung, auch ohne Beiträge.
func TestTopicsAreSeeded(t *testing.T) {
	srv, _ := newServer(t, false)
	list := getJSON[api.TopicList](t, srv, "/api/topics?lang=de", 200)
	want := []string{"AI in der Softwareentwicklung", "AI Audit für Unternehmen", "AI in Data Analytics", "Prozessautomatisierung", "KI-Tipps und Tricks"}
	if len(list.Items) != len(want) {
		t.Fatalf("%d Themen, erwartet %d", len(list.Items), len(want))
	}
	for i, tp := range list.Items {
		if tp.Title != want[i] || tp.Intro == "" || tp.PostCount != 0 {
			t.Errorf("Thema %d: %+v", i, tp)
		}
	}
	for _, tp := range list.Items {
		d := getJSON[api.TopicDetail](t, srv, "/api/topics/"+tp.Slug+"?lang=de", 200)
		if d.Intro == "" || len(d.Posts) != 0 {
			t.Errorf("Themenseite %s ohne Beiträge: %+v", tp.Slug, d)
		}
	}
}

// Ticket #82: echte Migration, Metadaten, Seiten, Sitemap und Sichtbarkeit zugeordneter Beiträge.
func TestSkillsTopic(t *testing.T) {
	srv, db := newServer(t, true)
	source, err := os.ReadFile("../../../../content/KI Tipps und Tricks.md")
	if err != nil {
		t.Fatal(err)
	}
	metadata := func(key string) string {
		t.Helper()
		match := regexp.MustCompile(`\*\*` + key + `:\*\* (.+)`).FindStringSubmatch(string(source))
		if len(match) != 2 {
			t.Fatalf("Metadatum %s fehlt", key)
		}
		return strings.TrimSpace(match[1])
	}
	const slug = "ki-tipps-und-tricks"
	for _, lang := range []string{"de", "en"} {
		list := getJSON[api.TopicList](t, srv, "/api/topics?lang="+lang, 200)
		found := false
		for _, item := range list.Items {
			if item.Slug == slug {
				found = true
			}
		}
		if !found {
			t.Fatalf("Neues Thema fehlt in /api/topics (%s)", lang)
		}
		d := getJSON[api.TopicDetail](t, srv, "/api/topics/"+slug+"?lang="+lang, 200)
		if string(d.Lang) != lang || len(d.Translations) != 2 || d.PostCount != 0 || len(d.Posts) != 0 {
			t.Fatalf("Metadaten: %+v", d)
		}
		if lang == "de" {
			if d.Title != metadata("Titel") || d.Label != metadata("Label") || d.Summary != metadata("Kurzbeschreibung") || d.Intro != metadata("Einführung") {
				t.Fatalf("Abweichung von Textvorlage: %+v", d)
			}
		} else if d.Title != "AI Tips and Tricks" || d.Label != "AI Tips and Tricks" || d.Summary == "" || !strings.HasPrefix(d.Intro, "Skills capture recurring workflows") {
			t.Fatalf("Englische Metadaten: %+v", d)
		}
		resp, page := get(t, srv, "/"+lang+"/themen/"+slug)
		if resp.StatusCode != 200 || !strings.Contains(page, d.Title) || !strings.Contains(page, `hreflang="`+lang+`"`) {
			t.Fatalf("Themenseite %s: %d %s", lang, resp.StatusCode, page)
		}
		_, sitemap := get(t, srv, "/sitemap.xml")
		if !strings.Contains(sitemap, "/"+lang+"/themen/"+slug) {
			t.Fatalf("Thema fehlt in Sitemap (%s)", lang)
		}
	}
	_, err = db.Exec(`INSERT INTO post_topics (post_id, topic_id)
		SELECT posts.id, topics.id FROM posts CROSS JOIN topics
		WHERE posts.slug IN ('ki-veraendert-softwareteams', 'entwurf-ki-in-der-datenanalyse') AND topics.slug = ?`, slug)
	if err != nil {
		t.Fatal(err)
	}
	d := getJSON[api.TopicDetail](t, srv, "/api/topics/"+slug+"?lang=de", 200)
	if d.PostCount != 1 || strings.Join(slugs(d.Posts), ",") != "ki-veraendert-softwareteams" {
		t.Fatalf("Veröffentlichte Beiträge und Entwurfsfilter: %+v", d)
	}
}

// Ticket #77: Die Themenseite Prozessautomatisierung gibt es auf Deutsch und Englisch,
// mit Seite, Sitemap-Eintrag und veröffentlichten Beiträgen zum Thema.
func TestProcessAutomationTopic(t *testing.T) {
	srv, db := newServer(t, false)
	for lang, title := range map[string]string{"de": "Prozessautomatisierung", "en": "Process Automation"} {
		d := getJSON[api.TopicDetail](t, srv, "/api/topics/prozessautomatisierung?lang="+lang, 200)
		if d.Title != title || string(d.Lang) != lang || d.Intro == "" || d.Summary == "" || len(d.Posts) != 0 {
			t.Errorf("%s: %+v", lang, d)
		}
		if !strings.Contains(d.Intro, "n8n") {
			t.Errorf("%s: Einführung nennt n8n nicht: %q", lang, d.Intro)
		}
		if resp, body := get(t, srv, "/"+lang+"/themen/prozessautomatisierung"); resp.StatusCode != 200 || !strings.Contains(body, title) {
			t.Errorf("%s: Seite %d", lang, resp.StatusCode)
		}
	}
	if _, sitemap := get(t, srv, "/sitemap.xml"); !strings.Contains(sitemap, "/de/themen/prozessautomatisierung") {
		t.Error("Themenseite fehlt in der Sitemap")
	}

	_, err := db.Exec(`INSERT INTO posts (id, slug, status, published_at, featured, updated_at)
		VALUES (100, 'erster-workflow', 'published', '2026-11-06T08:00:00Z', FALSE, '2026-11-06T08:00:00Z');
		INSERT INTO post_translations (post_id, lang, title, summary, body_markdown) VALUES (100, 'de', 'Erster Workflow', 'Kurz', 'Text');
		INSERT INTO post_topics (post_id, topic_id) SELECT 100, id FROM topics WHERE slug = 'prozessautomatisierung';`)
	if err != nil {
		t.Fatal(err)
	}
	d := getJSON[api.TopicDetail](t, srv, "/api/topics/prozessautomatisierung?lang=de", 200)
	if got := strings.Join(slugs(d.Posts), ","); got != "erster-workflow" || d.PostCount != 1 {
		t.Fatalf("Beiträge: %s (%d)", got, d.PostCount)
	}
}

// Anforderung 1: Ohne veröffentlichte Beiträge bleibt das Karussell leer, Themen sind da.
func TestNoPostsYet(t *testing.T) {
	srv, _ := newServer(t, false)
	featured := getJSON[api.PostList](t, srv, "/api/posts?featured=true", 200)
	if len(featured.Items) != 0 {
		t.Fatalf("erwartet leeres Karussell, erhalten %v", slugs(featured.Items))
	}
	if resp, _ := get(t, srv, "/de"); resp.StatusCode != 200 {
		t.Fatalf("Startseite: %d", resp.StatusCode)
	}
}

// Anforderung 4: Übersicht nur mit veröffentlichten Beiträgen, neueste zuerst.
func TestPostsNewestFirstWithoutDrafts(t *testing.T) {
	srv, _ := newServer(t, true)
	list := getJSON[api.PostList](t, srv, "/api/posts?lang=de", 200)
	got := strings.Join(slugs(list.Items), ",")
	want := "ki-veraendert-softwareteams,ai-audit-fuenf-fragen,was-ki-kostet,rechenzentren-energie,code-review-mit-ki"
	if got != want {
		t.Fatalf("Reihenfolge\n got: %s\nwant: %s", got, want)
	}
	for i := 1; i < len(list.Items); i++ {
		if list.Items[i].PublishedAt.After(list.Items[i-1].PublishedAt) {
			t.Fatalf("nicht absteigend sortiert bei %d", i)
		}
	}
	for _, p := range list.Items {
		if p.Title == "" || p.Summary == "" || p.PublishedAt.IsZero() {
			t.Errorf("unvollständig: %+v", p)
		}
	}
}

// Anforderung 4: Entwürfe sind auch per direktem Aufruf nicht erreichbar.
func TestDraftIsNotPublic(t *testing.T) {
	srv, _ := newServer(t, true)
	const draft = "entwurf-ki-in-der-datenanalyse"
	getJSON[api.Error](t, srv, "/api/posts/"+draft, 404)
	resp, body := get(t, srv, "/de/blog/"+draft)
	if resp.StatusCode != 404 {
		t.Fatalf("Beitragsseite des Entwurfs: %d", resp.StatusCode)
	}
	if strings.Contains(body, "Entwurf: KI") {
		t.Fatal("Titel des Entwurfs in der Seite enthalten")
	}
	_, sitemap := get(t, srv, "/sitemap.xml")
	if strings.Contains(sitemap, draft) {
		t.Fatal("Entwurf in der Sitemap")
	}
	d := getJSON[api.TopicDetail](t, srv, "/api/topics/data-analytics", 200)
	if len(d.Posts) != 0 || d.PostCount != 0 {
		t.Fatalf("Entwurf auf der Themenseite: %+v", d.Posts)
	}
}

// Anforderung 1: Der zuletzt veröffentlichte Beitrag steht an erster Stelle, höchstens drei.
func TestFeaturedStartsWithLatest(t *testing.T) {
	srv, db := newServer(t, true)
	list := getJSON[api.PostList](t, srv, "/api/posts?featured=true&lang=de", 200)
	if got := strings.Join(slugs(list.Items), ","); got != "ki-veraendert-softwareteams,ai-audit-fuenf-fragen,was-ki-kostet" {
		t.Fatalf("Karussell: %s", got)
	}

	// Ein neuer, nicht hervorgehobener Beitrag steht trotzdem vorn.
	_, err := db.Exec(`INSERT INTO posts (id, slug, status, published_at, featured, updated_at)
		VALUES (100, 'ganz-neu', 'published', '2026-11-06T08:00:00Z', FALSE, '2026-11-06T08:00:00Z');
		INSERT INTO post_translations (post_id, lang, title, summary, body_markdown) VALUES (100, 'de', 'Neu', 'Kurz', 'Text');`)
	if err != nil {
		t.Fatal(err)
	}
	list = getJSON[api.PostList](t, srv, "/api/posts?featured=true&lang=de", 200)
	if got := strings.Join(slugs(list.Items), ","); got != "ganz-neu,ki-veraendert-softwareteams,ai-audit-fuenf-fragen" {
		t.Fatalf("Karussell nach neuem Beitrag: %s", got)
	}
}

// Anforderung 3: Veröffentlichte Beiträge erscheinen auf ihren Themenseiten.
func TestTopicShowsAssignedPosts(t *testing.T) {
	srv, _ := newServer(t, true)
	d := getJSON[api.TopicDetail](t, srv, "/api/topics/softwareentwicklung?lang=de", 200)
	if got := strings.Join(slugs(d.Posts), ","); got != "ki-veraendert-softwareteams,was-ki-kostet,code-review-mit-ki" {
		t.Fatalf("Beiträge: %s", got)
	}
	if d.PostCount != 3 {
		t.Fatalf("postCount %d", d.PostCount)
	}
	getJSON[api.Error](t, srv, "/api/topics/gibt-es-nicht", 404)
	if resp, _ := get(t, srv, "/de/themen/gibt-es-nicht"); resp.StatusCode != 404 {
		t.Fatalf("unbekanntes Thema: %d", resp.StatusCode)
	}
}

// Anforderung 7: übersetzte Fassung oder vorhandene Fassung mit ihrer Sprache.
func TestLanguageSelection(t *testing.T) {
	srv, _ := newServer(t, true)

	en := getJSON[api.Post](t, srv, "/api/posts/ki-veraendert-softwareteams?lang=en", 200)
	if en.Lang != "en" || en.Title != "How AI is changing work in software teams" || en.ReadingMinutes < 1 {
		t.Fatalf("englische Fassung: %+v", en)
	}
	if len(en.Translations) != 2 {
		t.Fatalf("Übersetzungen: %v", en.Translations)
	}

	fb := getJSON[api.Post](t, srv, "/api/posts/was-ki-kostet?lang=en", 200)
	if fb.Lang != "de" || !strings.HasPrefix(fb.Title, "Was KI wirklich kostet") || fb.BodyMarkdown == "" {
		t.Fatalf("Rückfall auf Deutsch: %+v", fb)
	}

	topics := getJSON[api.TopicList](t, srv, "/api/topics?lang=en", 200)
	if topics.Items[0].Title != "AI in Software Development" || topics.Items[0].Lang != "en" {
		t.Fatalf("englische Themen: %+v", topics.Items[0])
	}

	getJSON[api.Error](t, srv, "/api/posts?lang=fr", 400)
}

// ARCHITECTURE.md, Abschnitt 6: Meta-Tags beim ersten Aufruf.
func TestMetaTags(t *testing.T) {
	srv, _ := newServer(t, true)

	resp, body := get(t, srv, "/en/blog/ki-veraendert-softwareteams")
	if resp.StatusCode != 200 || resp.Header.Get("Cache-Control") != "no-cache" {
		t.Fatalf("status %d, cache %q", resp.StatusCode, resp.Header.Get("Cache-Control"))
	}
	for _, want := range []string{
		`<html lang="en"`,
		`<title>How AI is changing work in software teams · KI Perspektiven</title>`,
		`<meta property="og:type" content="article">`,
		`<meta property="og:locale" content="en_GB">`,
		`<link rel="canonical" href="https://example.test/en/blog/ki-veraendert-softwareteams">`,
		`<link rel="alternate" hreflang="de" href="https://example.test/de/blog/ki-veraendert-softwareteams">`,
		`<link rel="alternate" hreflang="x-default" href="https://example.test/de/blog/ki-veraendert-softwareteams">`,
	} {
		if !strings.Contains(body, want) {
			t.Errorf("fehlt: %s", want)
		}
	}
	if strings.Count(body, "<title>") != 1 {
		t.Error("Standardtitel wurde nicht ersetzt")
	}

	// Fehlende Übersetzung: deutsche Fassung ist kanonisch, kein englisches hreflang.
	_, body = get(t, srv, "/en/blog/was-ki-kostet")
	if !strings.Contains(body, `<html lang="de"`) ||
		!strings.Contains(body, `<link rel="canonical" href="https://example.test/de/blog/was-ki-kostet">`) ||
		strings.Contains(body, `hreflang="en"`) {
		t.Errorf("Rückfall-Meta falsch:\n%s", body)
	}

	_, body = get(t, srv, "/de/themen/ai-audit")
	if !strings.Contains(body, "<title>AI Audit für Unternehmen · KI Perspektiven</title>") {
		t.Errorf("Themen-Titel fehlt:\n%s", body)
	}
}

func TestStatusCodesAndFiles(t *testing.T) {
	srv, _ := newServer(t, true)
	for path, want := range map[string]int{
		"/":               200,
		"/de":             200,
		"/en/":            200,
		"/de/blog":        200,
		"/en/impressum":   200,
		"/de/datenschutz": 200,
		"/fr":             404,
		"/de/unbekannt":   404,
		"/irgendwas":      404,
		"/api/unbekannt":  404,
		"/favicon.svg":    200,
	} {
		if resp, _ := get(t, srv, path); resp.StatusCode != want {
			t.Errorf("%s: %d, erwartet %d", path, resp.StatusCode, want)
		}
	}
	resp, _ := get(t, srv, "/assets/app-abc.js")
	if resp.StatusCode != 200 || resp.Header.Get("Cache-Control") != "public, max-age=31536000, immutable" {
		t.Errorf("assets: %d %q", resp.StatusCode, resp.Header.Get("Cache-Control"))
	}
	if resp, _ := get(t, srv, "/assets/fehlt.js"); resp.StatusCode != 404 {
		t.Errorf("fehlendes Asset: %d", resp.StatusCode)
	}
	_, robots := get(t, srv, "/robots.txt")
	if !strings.Contains(robots, "Disallow: /redaktion") || !strings.Contains(robots, "Sitemap: https://example.test/sitemap.xml") {
		t.Errorf("robots.txt: %s", robots)
	}
}

func TestSitemap(t *testing.T) {
	srv, _ := newServer(t, true)
	resp, body := get(t, srv, "/sitemap.xml")
	if resp.StatusCode != 200 {
		t.Fatal(resp.StatusCode)
	}
	for _, want := range []string{
		"<loc>https://example.test/de</loc>",
		"<loc>https://example.test/en/blog</loc>",
		"<loc>https://example.test/en/themen/ai-audit</loc>",
		"<loc>https://example.test/en/blog/ki-veraendert-softwareteams</loc>",
		"<loc>https://example.test/de/blog/was-ki-kostet</loc>",
		`hreflang="x-default"`,
		"<lastmod>2026-11-03T09:00:00Z</lastmod>",
	} {
		if !strings.Contains(body, want) {
			t.Errorf("fehlt: %s", want)
		}
	}
	if strings.Contains(body, "<loc>https://example.test/en/blog/was-ki-kostet</loc>") {
		t.Error("nicht übersetzter Beitrag mit englischer URL in der Sitemap")
	}
}

// Anforderung 8: Audit-Übersicht mit allen freigegebenen Dimensionen.
func TestAuditOverview(t *testing.T) {
	srv, _ := newServer(t, false)
	o := getJSON[api.AuditOverview](t, srv, "/api/audit", 200)
	if o.Lang != "de" || len(o.Intro) == 0 || len(o.Dimensions) != 8 {
		t.Fatalf("übersicht: lang=%s intro=%d dimensionen=%d", o.Lang, len(o.Intro), len(o.Dimensions))
	}
	if d := o.Dimensions[0]; d.Slug != "strategie-und-wirtschaftlichkeit" || d.Title != "Strategie und Wirtschaftlichkeit" || d.Category != "organizational" {
		t.Fatalf("erste dimension: %+v", d)
	}
	names := []string{}
	for _, l := range o.Levels {
		names = append(names, l.Name)
	}
	if strings.Join(names, ",") != "Einfach,Strukturiert,Intelligent" {
		t.Fatalf("reifegrade: %v", names)
	}
	// Ohne englische Fassung liefert das Backend Deutsch und nennt die Sprache.
	if en := getJSON[api.AuditOverview](t, srv, "/api/audit?lang=en", 200); en.Lang != "de" || len(en.Translations) != 1 {
		t.Fatalf("rückfall: lang=%s translations=%v", en.Lang, en.Translations)
	}
	getJSON[api.Error](t, srv, "/api/audit?lang=fr", 400)
}

// Anforderungen 9 und 10: Dimension mit Vorteilen, drei Reifegraden und Prüffragen.
func TestAuditDimension(t *testing.T) {
	srv, _ := newServer(t, false)
	d := getJSON[api.AuditDimension](t, srv, "/api/audit/dimensions/strategie-und-wirtschaftlichkeit", 200)
	if d.Title != "Strategie und Wirtschaftlichkeit" || len(d.Benefits) < 2 || len(d.Intro) == 0 {
		t.Fatalf("dimension: %+v", d)
	}
	if len(d.Levels) != 3 || d.Levels[0].Name != "Einfach" || d.Levels[2].Name != "Intelligent" || d.NotApplied.Level != 0 {
		t.Fatalf("reifegrade: %+v", d.Levels)
	}
	if q := d.Levels[0].Questions[0]; q.Id != "1.1" || q.Text == "" || q.Conditional {
		t.Fatalf("erste frage: %+v", q)
	}
	b := getJSON[api.AuditDimension](t, srv, "/api/audit/dimensions/betrieb", 200)
	if !b.Levels[0].Questions[2].Conditional {
		t.Fatal("bedingte frage nicht gekennzeichnet")
	}
	getJSON[api.Error](t, srv, "/api/audit/dimensions/gibt-es-nicht", 404)
	getJSON[api.Error](t, srv, "/api/audit/dimensions/betrieb?lang=xx", 400)
}

func TestAuditPages(t *testing.T) {
	srv, _ := newServer(t, false)
	for path, want := range map[string]int{
		"/de/themen/ai-audit/strategie-und-wirtschaftlichkeit": 200,
		"/en/themen/ai-audit/sicherheit-und-zuverlaessigkeit":  200,
		"/de/themen/ai-audit/gibt-es-nicht":                    404,
		"/de/themen/softwareentwicklung/betrieb":               404,
		"/de/themen/ai-audit/betrieb/mehr":                     404,
	} {
		if resp, _ := get(t, srv, path); resp.StatusCode != want {
			t.Errorf("%s: %d, erwartet %d", path, resp.StatusCode, want)
		}
	}
	_, body := get(t, srv, "/en/themen/ai-audit/daten-und-wissen")
	for _, want := range []string{
		`<html lang="de"`,
		`<title>Daten und Wissen · KI Perspektiven</title>`,
		`<link rel="canonical" href="https://example.test/de/themen/ai-audit/daten-und-wissen">`,
	} {
		if !strings.Contains(body, want) {
			t.Errorf("fehlt: %s", want)
		}
	}
	if strings.Contains(body, `hreflang="en"`) {
		t.Error("englisches hreflang ohne englische Fassung")
	}

	_, sitemap := get(t, srv, "/sitemap.xml")
	if !strings.Contains(sitemap, "<loc>https://example.test/de/themen/ai-audit/betrieb</loc>") {
		t.Error("dimensionsseite fehlt in der sitemap")
	}
	if strings.Contains(sitemap, "<loc>https://example.test/en/themen/ai-audit/betrieb</loc>") {
		t.Error("nicht übersetzte dimensionsseite mit englischer URL in der sitemap")
	}
}
