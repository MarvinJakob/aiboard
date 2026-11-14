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

// Anforderung 3 und Tickets #83/#102: vier Themen mit Titel und Einführung, auch ohne Beiträge.
func TestTopicsAreSeeded(t *testing.T) {
	srv, _ := newServer(t, false)
	list := getJSON[api.TopicList](t, srv, "/api/topics?lang=de", 200)
	want := []string{"KI in der Softwareentwicklung", "KI Readiness", "KI in Data Analytics", "Modelle und Kosten: Wie finde ich das beste Preis-/Leistungsverhältnis?"}
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

// Ticket #102: Die Themen „Prozessautomatisierung“ und „KI-Tipps und Tricks“ fehlen in Themenliste und
// Sitemap; ihre Seiten und API-Einzelabrufe liefern in beiden Sprachen 404. Beiträge bleiben erreichbar.
func TestRemovedTopics(t *testing.T) {
	srv, _ := newServer(t, true)
	removed := []string{"prozessautomatisierung", "ki-tipps-und-tricks"}
	_, sitemap := get(t, srv, "/sitemap.xml")
	for _, lang := range []string{"de", "en"} {
		list := getJSON[api.TopicList](t, srv, "/api/topics?lang="+lang, 200)
		for _, tp := range list.Items {
			for _, slug := range removed {
				if tp.Slug == slug {
					t.Errorf("%s: %s noch in /api/topics", lang, slug)
				}
			}
		}
		for _, slug := range removed {
			getJSON[api.Error](t, srv, "/api/topics/"+slug+"?lang="+lang, 404)
			path := "/" + lang + "/themen/" + slug
			if resp, _ := get(t, srv, path); resp.StatusCode != 404 {
				t.Errorf("%s: Status %d, erwartet 404", path, resp.StatusCode)
			}
			if strings.Contains(sitemap, path) {
				t.Errorf("%s noch in der Sitemap", path)
			}
		}
	}
	// Die Testbeiträge bleiben veröffentlicht und erreichbar.
	posts := getJSON[api.PostList](t, srv, "/api/posts?lang=de", 200)
	if len(posts.Items) == 0 {
		t.Fatal("veröffentlichte Beiträge fehlen")
	}
	if resp, _ := get(t, srv, "/de/blog/"+posts.Items[0].Slug); resp.StatusCode != 200 {
		t.Errorf("Beitragsseite: %d", resp.StatusCode)
	}
}

// Ticket #81: neue Metadaten in beiden Sprachen, Slug und zugeordnete Beiträge bleiben erhalten.
func TestDataAnalyticsTopicMetadata(t *testing.T) {
	srv, db := newServer(t, false)
	_, err := db.Exec(`INSERT INTO posts (id, slug, status, published_at, updated_at) VALUES (100, 'daten-beitrag', 'published', '2026-11-09T10:00:00Z', '2026-11-09T10:00:00Z');
		INSERT INTO post_translations (post_id, lang, title, summary, body_markdown) VALUES (100, 'de', 'Datenbeitrag', 'Kurz', 'Text');
		INSERT INTO post_topics (post_id, topic_id) VALUES (100, (SELECT id FROM topics WHERE slug = 'data-analytics'));`)
	if err != nil {
		t.Fatal(err)
	}
	want := map[string][4]string{
		"de": {"KI in Data Analytics", "Data Analytics",
			"Wie aus einer schnellen KI-Antwort eine belastbare Analyse wird: Kennzahlen klären, Ergebnisse prüfen.",
			"KI beantwortet Datenfragen in Alltagssprache, schreibt Analysecode und unterstützt Prognosen. Belastbar werden die Ergebnisse erst, wenn Kennzahlen eindeutig definiert sind und Antworten mit den Quelldaten abgeglichen werden. Diese Seite zeigt Einsatzfelder, Grenzen und einen Pilot."},
		"en": {"AI in Data Analytics", "Data Analytics",
			"How a quick AI answer becomes a reliable analysis: clarify metrics, check results.",
			"AI answers data questions in everyday language, writes analysis code and supports forecasts. The results only become reliable once metrics are clearly defined and answers are checked against the source data. This page covers use cases, limits and a pilot."},
	}
	for lang, w := range want {
		d := getJSON[api.TopicDetail](t, srv, "/api/topics/data-analytics?lang="+lang, 200)
		if got := [4]string{d.Title, d.Label, d.Summary, d.Intro}; got != w || d.Slug != "data-analytics" || string(d.Lang) != lang {
			t.Errorf("%s: %+v", lang, d)
		}
		if len(d.Posts) != 1 || d.Posts[0].Slug != "daten-beitrag" {
			t.Errorf("%s: Beitrag fehlt: %+v", lang, d.Posts)
		}
	}
}

// Ticket #83: Die Themenseite Modelle und Kosten gibt es auf Deutsch und Englisch,
// mit Metadaten aus content/Modelle und Kosten.md, Sitemap-Eintrag und veröffentlichten Beiträgen.
func TestModelsAndCostsTopic(t *testing.T) {
	srv, db := newServer(t, false)
	want := map[string][4]string{
		"de": {"Modelle und Kosten: Wie finde ich das beste Preis-/Leistungsverhältnis?", "Modelle und Kosten",
			"Warum das günstigste Modell nicht automatisch die beste Wahl ist und wie Sie Preis und Leistung selbst vergleichen.",
			"Ein niedriger Preis je Token sagt wenig darüber aus, was ein brauchbares Ergebnis kostet. Diese Seite zeigt, welche Kosten in die Rechnung gehören, was öffentliche Vergleiche leisten und wie Sie mit eigenen Testaufgaben das passende Modell finden."},
		"en": {"Models and Costs: How do I find the best price-performance ratio?", "Models and Costs",
			"Why the cheapest model is not automatically the best choice and how to compare price and performance yourself.",
			"A low price per token says little about what a usable result costs. This page shows which costs belong in the calculation, what public comparisons can and cannot do, and how to find the right model with your own test tasks."},
	}
	for lang, w := range want {
		list := getJSON[api.TopicList](t, srv, "/api/topics?lang="+lang, 200)
		var found bool
		for _, tp := range list.Items {
			if tp.Slug == "modelle-und-kosten" {
				found = tp.Label == w[1] && tp.Summary == w[2]
			}
		}
		if !found {
			t.Errorf("%s: Thema fehlt in /api/topics oder hat falsche Metadaten", lang)
		}
		d := getJSON[api.TopicDetail](t, srv, "/api/topics/modelle-und-kosten?lang="+lang, 200)
		if d.Title != w[0] || d.Label != w[1] || d.Summary != w[2] || d.Intro != w[3] || string(d.Lang) != lang || len(d.Posts) != 0 {
			t.Errorf("%s: %+v", lang, d)
		}
		if resp, body := get(t, srv, "/"+lang+"/themen/modelle-und-kosten"); resp.StatusCode != 200 || !strings.Contains(body, w[0]) {
			t.Errorf("%s: Seite %d", lang, resp.StatusCode)
		}
	}
	if _, sitemap := get(t, srv, "/sitemap.xml"); !strings.Contains(sitemap, "/de/themen/modelle-und-kosten") || !strings.Contains(sitemap, "/en/themen/modelle-und-kosten") {
		t.Error("Themenseite fehlt in der Sitemap")
	}

	_, err := db.Exec(`INSERT INTO posts (id, slug, status, published_at, featured, updated_at)
		VALUES (100, 'modellwahl', 'published', '2026-11-06T08:00:00Z', FALSE, '2026-11-06T08:00:00Z');
		INSERT INTO posts (id, slug, status, updated_at) VALUES (101, 'entwurf', 'draft', '2026-11-06T08:00:00Z');
		INSERT INTO post_translations (post_id, lang, title, summary, body_markdown) VALUES (100, 'de', 'Modellwahl', 'Kurz', 'Text'), (101, 'de', 'Entwurf', 'Kurz', 'Text');
		INSERT INTO post_topics (post_id, topic_id) SELECT id, (SELECT id FROM topics WHERE slug = 'modelle-und-kosten') FROM posts WHERE id IN (100, 101);`)
	if err != nil {
		t.Fatal(err)
	}
	d := getJSON[api.TopicDetail](t, srv, "/api/topics/modelle-und-kosten?lang=de", 200)
	if got := strings.Join(slugs(d.Posts), ","); got != "modellwahl" || d.PostCount != 1 {
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

// Ticket #80: Metadaten stimmen mit der verbindlichen deutschen Textvorlage überein.
func TestSoftwareGuardrailsMetadata(t *testing.T) {
	srv, _ := newServer(t, true)
	source, err := os.ReadFile("../../../../content/KI in der Softwareentwicklung.md")
	if err != nil {
		t.Fatal(err)
	}
	d := getJSON[api.TopicDetail](t, srv, "/api/topics/softwareentwicklung?lang=de", 200)
	for name, value := range map[string]string{"Titel": d.Title, "Label": d.Label, "Kurzbeschreibung": d.Summary, "Einführung": d.Intro} {
		prefix := "- **" + name + ":** "
		found := false
		for _, line := range strings.Split(string(source), "\n") {
			if !strings.HasPrefix(line, prefix) {
				continue
			}
			expected := strings.TrimSpace(strings.TrimPrefix(line, prefix))
			if name == "Titel" {
				expected = strings.Split(expected, " (bisher:")[0]
			}
			if value != expected {
				t.Errorf("%s: %q, erwartet %q", name, value, expected)
			}
			found = true
		}
		if !found {
			t.Fatalf("%s fehlt in der Vorlage", name)
		}
	}
	en := getJSON[api.TopicDetail](t, srv, "/api/topics/softwareentwicklung?lang=en", 200)
	if en.Lang != "en" || en.Summary != "How to guide AI assistants with Markdown rules, access permissions, tests and reviews." || !strings.Contains(en.Intro, "verifiable rules") {
		t.Fatalf("Englische Metadaten: %+v", en)
	}
	resp, html := get(t, srv, "/de/themen/softwareentwicklung")
	if resp.StatusCode != 200 || !strings.Contains(html, "<title>KI in der Softwareentwicklung · KI Perspektiven</title>") {
		t.Fatalf("Metadaten bei Direktaufruf: %d, %s", resp.StatusCode, html)
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
	if !strings.Contains(body, "<title>KI Readiness · KI Perspektiven</title>") {
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
	if !strings.Contains(o.Guidance, "Gesamtauswertung") || !strings.Contains(o.Guidance, "Entscheidungshilfe") {
		t.Fatalf("Readiness-Anleitung fehlt: %s", o.Guidance)
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
	if en := getJSON[api.AuditOverview](t, srv, "/api/audit?lang=en", 200); en.Lang != "de" || len(en.Translations) != 1 || en.Guidance != o.Guidance {
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
