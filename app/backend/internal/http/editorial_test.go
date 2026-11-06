package httpserver_test

import (
	"encoding/json"
	"fmt"
	"net/http"
	"slices"
	"strings"
	"testing"

	"ki-web/backend/internal/api"
)

func ptr[T any](v T) *T { return &v }

func decode[T any](t *testing.T, body string) T {
	t.Helper()
	var v T
	if err := json.Unmarshal([]byte(body), &v); err != nil {
		t.Fatalf("%v: %s", err, body)
	}
	return v
}

func editorBrowser(t *testing.T) (*browser, func(path string) (*http.Response, string)) {
	t.Helper()
	srv, _ := newServerWithAccounts(t)
	b := newBrowser(t, srv)
	b.mustLogin(editorEmail)
	public := func(path string) (*http.Response, string) { return newBrowser(t, srv).do(http.MethodGet, path, nil) }
	return b, public
}

func draftInput(title string, topics ...string) api.PostInput {
	return api.PostInput{
		Featured: false,
		Topics:   topics,
		Texts: []api.PostText{{
			Lang: "de", Title: title, Summary: "Kurztext zu " + title, BodyMarkdown: "Einleitung.\n\n## Abschnitt\n\nText zu " + title + ".",
		}},
	}
}

func (b *browser) createPost(in api.PostInput) api.EditorPost {
	b.t.Helper()
	resp, body := b.do(http.MethodPost, "/api/admin/posts", in)
	wantStatus(b.t, resp, body, http.StatusCreated)
	return decode[api.EditorPost](b.t, body)
}

func (b *browser) savePost(id int64, in api.PostInput, want int) (api.EditorPost, string) {
	b.t.Helper()
	resp, body := b.do(http.MethodPut, fmt.Sprintf("/api/admin/posts/%d", id), in)
	wantStatus(b.t, resp, body, want)
	if want != http.StatusOK {
		return api.EditorPost{}, body
	}
	return decode[api.EditorPost](b.t, body), body
}

func (b *browser) action(id int64, action string, want int) api.EditorPost {
	b.t.Helper()
	resp, body := b.do(http.MethodPost, fmt.Sprintf("/api/admin/posts/%d/%s", id, action), nil)
	wantStatus(b.t, resp, body, want)
	if want != http.StatusOK {
		return api.EditorPost{}
	}
	return decode[api.EditorPost](b.t, body)
}

func publicSlugs(t *testing.T, public func(string) (*http.Response, string), path string) []string {
	t.Helper()
	resp, body := public(path)
	wantStatus(t, resp, body, http.StatusOK)
	if strings.HasPrefix(path, "/api/topics/") {
		return slugs(decode[api.TopicDetail](t, body).Posts)
	}
	return slugs(decode[api.PostList](t, body).Items)
}

// Anforderung 5: Entwurf speichern, erneut öffnen und weiterbearbeiten. Entwürfe bleiben unsichtbar.
func TestDraftCanBeSavedReopenedAndEdited(t *testing.T) {
	b, public := editorBrowser(t)
	p := b.createPost(draftInput("Größere Modelle, größere Fragen", "softwareentwicklung"))
	if p.Status != "draft" || p.Slug != "groessere-modelle-groessere-fragen" || p.PublishedAt != nil {
		t.Fatalf("neuer Entwurf: %+v", p)
	}

	resp, body := b.do(http.MethodGet, fmt.Sprintf("/api/admin/posts/%d", p.Id), nil)
	wantStatus(t, resp, body, http.StatusOK)
	got := decode[api.EditorPost](t, body)
	if got.Texts[0].Title != "Größere Modelle, größere Fragen" || !slices.Equal(got.Topics, []string{"softwareentwicklung"}) {
		t.Fatalf("erneut geöffnet: %+v", got)
	}

	in := draftInput("Größere Modelle, größere Fragen", "softwareentwicklung")
	in.Texts[0].BodyMarkdown = "Überarbeitet."
	in.Texts = append(in.Texts, api.PostText{Lang: "en", Title: "Bigger models", Summary: "", BodyMarkdown: ""})
	edited, _ := b.savePost(p.Id, in, http.StatusOK)
	if len(edited.Texts) != 2 || edited.Texts[0].BodyMarkdown != "Überarbeitet." || edited.Status != "draft" || edited.Slug != p.Slug {
		t.Fatalf("bearbeitet: %+v", edited)
	}

	resp, body = b.do(http.MethodGet, "/api/admin/posts", nil)
	wantStatus(t, resp, body, http.StatusOK)
	list := decode[api.EditorPostList](t, body)
	if len(list.Items) != 1 || list.Items[0].Id != p.Id || list.Items[0].Status != "draft" || !slices.Equal(list.Items[0].Translations, []api.Lang{"de", "en"}) {
		t.Fatalf("Beitragsliste: %+v", list.Items)
	}

	if s := publicSlugs(t, public, "/api/posts"); len(s) != 0 {
		t.Fatalf("Entwurf öffentlich: %v", s)
	}
	resp, _ = public("/api/posts/" + p.Slug)
	wantStatus(t, resp, "", http.StatusNotFound)
}

// Anforderung 5: einem Beitrag eines oder mehrere Startthemen zuordnen und die Zuordnung ändern.
func TestTopicAssignment(t *testing.T) {
	b, public := editorBrowser(t)
	p := b.createPost(draftInput("Zwei Themen", "ai-audit", "data-analytics"))
	if !slices.Equal(p.Topics, []string{"ai-audit", "data-analytics"}) {
		t.Fatalf("Themen: %v", p.Topics)
	}
	b.action(p.Id, "publish", http.StatusOK)
	for _, tp := range []string{"ai-audit", "data-analytics"} {
		if s := publicSlugs(t, public, "/api/topics/"+tp); !slices.Contains(s, p.Slug) {
			t.Errorf("%s: %v", tp, s)
		}
	}

	changed, _ := b.savePost(p.Id, draftInput("Zwei Themen", "softwareentwicklung"), http.StatusOK)
	if !slices.Equal(changed.Topics, []string{"softwareentwicklung"}) {
		t.Fatalf("geänderte Themen: %v", changed.Topics)
	}
	if s := publicSlugs(t, public, "/api/topics/ai-audit"); slices.Contains(s, p.Slug) {
		t.Errorf("alte Zuordnung bleibt: %v", s)
	}
	if s := publicSlugs(t, public, "/api/topics/softwareentwicklung"); !slices.Contains(s, p.Slug) {
		t.Errorf("neue Zuordnung fehlt: %v", s)
	}

	_, body := b.savePost(p.Id, draftInput("Zwei Themen", "gibt-es-nicht"), http.StatusUnprocessableEntity)
	if !strings.Contains(body, "Unbekanntes Thema") {
		t.Errorf("Meldung: %s", body)
	}
}

// Anforderung 5: Veröffentlichen, Ändern und Zurücknehmen wirken sofort auf alle öffentlichen Seiten.
func TestPublishUpdateUnpublish(t *testing.T) {
	b, public := editorBrowser(t)
	in := draftInput("Neu in der Redaktion", "ai-audit")
	in.Featured = true
	p := b.createPost(in)

	pub := b.action(p.Id, "publish", http.StatusOK)
	if pub.Status != "published" || pub.PublishedAt == nil {
		t.Fatalf("veröffentlicht: %+v", pub)
	}
	for _, path := range []string{"/api/posts", "/api/posts?featured=true", "/api/topics/ai-audit"} {
		if s := publicSlugs(t, public, path); !slices.Contains(s, p.Slug) {
			t.Errorf("%s: %v", path, s)
		}
	}
	resp, html := public("/de/blog/" + p.Slug)
	wantStatus(t, resp, html, http.StatusOK)
	if !strings.Contains(html, "Neu in der Redaktion") {
		t.Errorf("Meta-Tags ohne Titel: %s", html)
	}
	if _, sitemap := public("/sitemap.xml"); !strings.Contains(sitemap, "/de/blog/"+p.Slug) {
		t.Errorf("Sitemap ohne Beitrag")
	}

	// Änderung an einem veröffentlichten Beitrag ist sofort öffentlich.
	upd := draftInput("Neu in der Redaktion", "ai-audit")
	upd.Featured = true
	upd.Texts[0].BodyMarkdown = "Aktualisierte Fassung."
	saved, _ := b.savePost(p.Id, upd, http.StatusOK)
	if saved.Status != "published" || !saved.PublishedAt.Equal(*pub.PublishedAt) {
		t.Fatalf("nach Speichern: %+v", saved)
	}
	resp, body := public("/api/posts/" + p.Slug + "?lang=de")
	wantStatus(t, resp, body, http.StatusOK)
	if got := decode[api.Post](t, body).BodyMarkdown; got != "Aktualisierte Fassung." {
		t.Errorf("öffentliche Fassung: %q", got)
	}

	// Zurücknehmen: verschwindet aus Blog, Startseite und Themenseiten, Beitragsseite liefert 404.
	un := b.action(p.Id, "unpublish", http.StatusOK)
	if un.Status != "draft" {
		t.Fatalf("zurückgenommen: %+v", un)
	}
	for _, path := range []string{"/api/posts", "/api/posts?featured=true", "/api/topics/ai-audit"} {
		if s := publicSlugs(t, public, path); slices.Contains(s, p.Slug) {
			t.Errorf("%s enthält zurückgenommenen Beitrag: %v", path, s)
		}
	}
	for _, path := range []string{"/api/posts/" + p.Slug, "/de/blog/" + p.Slug, "/en/blog/" + p.Slug} {
		resp, body := public(path)
		wantStatus(t, resp, body, http.StatusNotFound)
	}
	if _, sitemap := public("/sitemap.xml"); strings.Contains(sitemap, p.Slug) {
		t.Errorf("Sitemap enthält zurückgenommenen Beitrag")
	}

	// Erneut veröffentlichen behält das erste Datum (Rückgängig).
	again := b.action(p.Id, "publish", http.StatusOK)
	if !again.PublishedAt.Equal(*pub.PublishedAt) {
		t.Errorf("Datum geändert: %v -> %v", pub.PublishedAt, again.PublishedAt)
	}
}

// Anforderung 5: Veröffentlichen nur mit Titel, Kurztext und Beitragstext.
func TestPublishRequiresCompleteTexts(t *testing.T) {
	b, public := editorBrowser(t)
	in := draftInput("Unfertig")
	in.Texts[0].Summary = ""
	in.Texts[0].BodyMarkdown = ""
	p := b.createPost(in)
	resp, body := b.do(http.MethodPost, fmt.Sprintf("/api/admin/posts/%d/publish", p.Id), nil)
	wantStatus(t, resp, body, http.StatusUnprocessableEntity)
	if !strings.Contains(body, "Kurztext") || !strings.Contains(body, "Beitragstext") {
		t.Errorf("Meldung nennt die fehlenden Felder nicht: %s", body)
	}
	if s := publicSlugs(t, public, "/api/posts"); len(s) != 0 {
		t.Fatalf("unvollständiger Beitrag öffentlich: %v", s)
	}

	// Englische Fassung angefangen, aber unvollständig: ebenfalls kein Veröffentlichen.
	in = draftInput("Fast fertig")
	in.Texts = append(in.Texts, api.PostText{Lang: "en", Title: "Almost done", Summary: "", BodyMarkdown: ""})
	p2 := b.createPost(in)
	b.action(p2.Id, "publish", http.StatusUnprocessableEntity)

	// Ein veröffentlichter Beitrag lässt sich nicht leer speichern.
	p3 := b.createPost(draftInput("Fertig"))
	b.action(p3.Id, "publish", http.StatusOK)
	empty := draftInput("Fertig")
	empty.Texts[0].BodyMarkdown = "  "
	b.savePost(p3.Id, empty, http.StatusUnprocessableEntity)
}

func TestSlugRulesAndValidation(t *testing.T) {
	b, _ := editorBrowser(t)
	a := b.createPost(draftInput("Gleicher Titel"))
	c := b.createPost(draftInput("Gleicher Titel"))
	if a.Slug != "gleicher-titel" || c.Slug != "gleicher-titel-2" {
		t.Fatalf("Slugs: %q %q", a.Slug, c.Slug)
	}
	in := draftInput("Anderer Titel")
	in.Slug = ptr("gleicher-titel")
	resp, body := b.do(http.MethodPost, "/api/admin/posts", in)
	wantStatus(t, resp, body, http.StatusConflict)
	in.Slug = ptr("Kein Slug!")
	resp, body = b.do(http.MethodPost, "/api/admin/posts", in)
	wantStatus(t, resp, body, http.StatusUnprocessableEntity)
	in.Slug = ptr("eigenes-kuerzel")
	if p := b.createPost(in); p.Slug != "eigenes-kuerzel" {
		t.Errorf("eigener Slug: %q", p.Slug)
	}

	for _, bad := range []api.PostInput{
		{Topics: []string{}, Texts: []api.PostText{}},
		{Topics: []string{}, Texts: []api.PostText{{Lang: "fr", Title: "x"}}},
		{Topics: []string{}, Texts: []api.PostText{{Lang: "de", Title: "", Summary: "nur Kurztext"}}},
		{Topics: []string{}, Texts: []api.PostText{{Lang: "de", Title: "a"}, {Lang: "de", Title: "b"}}},
		{Topics: []string{}, Texts: []api.PostText{{Lang: "de", Title: strings.Repeat("x", 201)}}},
	} {
		resp, body := b.do(http.MethodPost, "/api/admin/posts", bad)
		wantStatus(t, resp, body, http.StatusUnprocessableEntity)
	}
	resp, body = b.do(http.MethodGet, "/api/admin/posts/999", nil)
	wantStatus(t, resp, body, http.StatusNotFound)
	b.action(999, "publish", http.StatusNotFound)
	b.action(999, "unpublish", http.StatusNotFound)
}

// Anforderung 6: Ohne Redaktionsberechtigung lassen sich keine Beiträge anlegen, ändern oder veröffentlichen.
func TestPostAPIRequiresEditorSessionAndCSRF(t *testing.T) {
	srv, _ := newServerWithAccounts(t)
	editor := newBrowser(t, srv)
	editor.mustLogin(editorEmail)
	p := editor.createPost(draftInput("Geschützt"))

	anon := newBrowser(t, srv)
	for _, c := range []struct{ method, path string }{
		{http.MethodPost, "/api/admin/posts"},
		{http.MethodPut, fmt.Sprintf("/api/admin/posts/%d", p.Id)},
		{http.MethodPost, fmt.Sprintf("/api/admin/posts/%d/publish", p.Id)},
		{http.MethodPost, fmt.Sprintf("/api/admin/posts/%d/unpublish", p.Id)},
	} {
		resp, body := anon.do(c.method, c.path, draftInput("Angriff"))
		wantStatus(t, resp, body, http.StatusUnauthorized)
		token := editor.csrf
		editor.csrf = ""
		resp, body = editor.do(c.method, c.path, draftInput("Ohne Token"))
		editor.csrf = token
		wantStatus(t, resp, body, http.StatusForbidden)
	}
	resp, body := editor.do(http.MethodGet, fmt.Sprintf("/api/admin/posts/%d", p.Id), nil)
	wantStatus(t, resp, body, http.StatusOK)
	if got := decode[api.EditorPost](t, body); got.Status != "draft" || got.Texts[0].Title != "Geschützt" {
		t.Fatalf("Beitrag verändert: %+v", got)
	}

	// Admin-Konten dürfen Beiträge ebenfalls verwalten.
	admin := newBrowser(t, srv)
	admin.mustLogin(adminEmail)
	admin.action(p.Id, "publish", http.StatusOK)
}

// Die Bearbeitungsseiten liefern das Redaktionsfrontend nur mit Sitzung aus.
func TestPostEditorPages(t *testing.T) {
	srv, _ := newServerWithAccounts(t)
	b := newBrowser(t, srv)
	for _, p := range []string{"/redaktion/beitraege/neu", "/redaktion/beitraege/7"} {
		resp, _ := b.do(http.MethodGet, p, nil)
		wantRedirect(t, resp, "/redaktion/anmelden")
	}
	b.mustLogin(editorEmail)
	for _, p := range []string{"/redaktion/beitraege/neu", "/redaktion/beitraege/7"} {
		resp, body := b.do(http.MethodGet, p, nil)
		wantStatus(t, resp, body, http.StatusOK)
	}
	for _, p := range []string{"/redaktion/beitraege/0", "/redaktion/beitraege/abc", "/redaktion/beitraege/1/2"} {
		resp, body := b.do(http.MethodGet, p, nil)
		wantStatus(t, resp, body, http.StatusNotFound)
	}
}

// Die Entwicklungsdaten erscheinen vollständig in der Beitragsliste der Redaktion, inklusive Entwurf.
func TestEditorListIncludesDrafts(t *testing.T) {
	srv, _ := newServer(t, true)
	b := newBrowser(t, srv)
	if status, _ := b.login("redaktion@example.test", "redaktion-test"); status != http.StatusOK {
		t.Fatal(status)
	}
	resp, body := b.do(http.MethodGet, "/api/admin/posts", nil)
	wantStatus(t, resp, body, http.StatusOK)
	list := decode[api.EditorPostList](t, body)
	var drafts int
	for _, p := range list.Items {
		if p.Status == "draft" {
			drafts++
		}
	}
	if len(list.Items) != 6 || drafts != 1 || list.Items[0].Slug != "entwurf-ki-in-der-datenanalyse" {
		t.Fatalf("Liste: %d Beiträge, %d Entwürfe, erster %q", len(list.Items), drafts, list.Items[0].Slug)
	}
}
