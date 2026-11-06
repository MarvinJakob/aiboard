package httpserver_test

import (
	"context"
	"database/sql"
	"fmt"
	"net/http"
	"slices"
	"strings"
	"testing"
	"time"

	"ki-web/backend/internal/api"
	"ki-web/backend/internal/service"
)

// Ticket #23: Beitragsstatus und geplante Veröffentlichung.

type scheduleEnv struct {
	b      *browser
	db     *sql.DB
	public func(path string) (*http.Response, string)
}

func newScheduleEnv(t *testing.T) scheduleEnv {
	t.Helper()
	srv, db := newServerWithAccounts(t)
	b := newBrowser(t, srv)
	b.mustLogin(editorEmail)
	public := func(path string) (*http.Response, string) { return newBrowser(t, srv).do(http.MethodGet, path, nil) }
	return scheduleEnv{b: b, db: db, public: public}
}

func (b *browser) schedule(id int64, at time.Time, want int) (api.EditorPost, string) {
	b.t.Helper()
	resp, body := b.do(http.MethodPut, fmt.Sprintf("/api/admin/posts/%d/schedule", id), api.ScheduleInput{PublishAt: at})
	wantStatus(b.t, resp, body, want)
	if want != http.StatusOK {
		return api.EditorPost{}, body
	}
	return decode[api.EditorPost](b.t, body), body
}

func (b *browser) unschedule(id int64, want int) api.EditorPost {
	b.t.Helper()
	resp, body := b.do(http.MethodDelete, fmt.Sprintf("/api/admin/posts/%d/schedule", id), nil)
	wantStatus(b.t, resp, body, want)
	if want != http.StatusOK {
		return api.EditorPost{}
	}
	return decode[api.EditorPost](b.t, body)
}

// makeDue verschiebt den geplanten Zeitpunkt in die Vergangenheit, als wäre er gerade erreicht.
func (e scheduleEnv) makeDue(t *testing.T, id int64, at time.Time) {
	t.Helper()
	if _, err := e.db.Exec(`UPDATE posts SET scheduled_at = ? WHERE id = ?`, at.UTC().Format(time.RFC3339), id); err != nil {
		t.Fatal(err)
	}
}

func (e scheduleEnv) publishDue(t *testing.T) []int64 {
	t.Helper()
	published, _, err := service.NewEditorial(e.db).PublishDue(context.Background())
	if err != nil {
		t.Fatal(err)
	}
	return published
}

func (e scheduleEnv) wantPublic(t *testing.T, slug string, visible bool) {
	t.Helper()
	for _, path := range []string{"/api/posts", "/api/posts?featured=true", "/api/topics/ai-audit"} {
		if s := publicSlugs(t, e.public, path); slices.Contains(s, slug) != visible {
			t.Errorf("%s: sichtbar=%v erwartet, Liste %v", path, visible, s)
		}
	}
	want := http.StatusNotFound
	if visible {
		want = http.StatusOK
	}
	for _, path := range []string{"/api/posts/" + slug, "/de/blog/" + slug} {
		resp, body := e.public(path)
		wantStatus(t, resp, body, want)
	}
	if _, sitemap := e.public("/sitemap.xml"); strings.Contains(sitemap, "/de/blog/"+slug) != visible {
		t.Errorf("Sitemap: sichtbar=%v erwartet", visible)
	}
}

func TestScheduleSetChangeRemove(t *testing.T) {
	e := newScheduleEnv(t)
	p := e.b.createPost(draftInput("Geplant", "ai-audit"))

	at := time.Now().Add(48 * time.Hour).Truncate(time.Second)
	got, _ := e.b.schedule(p.Id, at, http.StatusOK)
	if got.Status != "draft" || got.ScheduledAt == nil || !got.ScheduledAt.Equal(at) {
		t.Fatalf("geplant: %+v", got)
	}
	if loc := got.ScheduledAt.Location(); loc != time.UTC {
		t.Errorf("Zeitpunkt nicht in UTC: %v", loc)
	}

	// Ändern, auch mit anderer Zeitzone im Eingang: gespeichert wird derselbe Zeitpunkt in UTC.
	berlin := time.FixedZone("MEZ", 3600)
	later := at.Add(3 * time.Hour).In(berlin)
	got, _ = e.b.schedule(p.Id, later, http.StatusOK)
	if !got.ScheduledAt.Equal(later) {
		t.Fatalf("geändert: %v, erwartet %v", got.ScheduledAt, later)
	}

	// Die Beitragsliste zeigt Status und Zeitpunkt.
	resp, body := e.b.do(http.MethodGet, "/api/admin/posts", nil)
	wantStatus(t, resp, body, http.StatusOK)
	list := decode[api.EditorPostList](t, body)
	idx := slices.IndexFunc(list.Items, func(s api.EditorPostSummary) bool { return s.Id == p.Id })
	if idx < 0 || list.Items[idx].Status != "draft" || list.Items[idx].ScheduledAt == nil || !list.Items[idx].ScheduledAt.Equal(later) {
		t.Fatalf("Liste: %+v", list.Items)
	}

	got = e.b.unschedule(p.Id, http.StatusOK)
	if got.ScheduledAt != nil || got.Status != "draft" {
		t.Fatalf("entfernt: %+v", got)
	}
	e.wantPublic(t, p.Slug, false)
}

func TestScheduleRejectsPastAndIncompleteAndPublished(t *testing.T) {
	e := newScheduleEnv(t)
	p := e.b.createPost(draftInput("Zeitpunkt prüfen"))

	_, body := e.b.schedule(p.Id, time.Now().Add(-time.Minute), http.StatusUnprocessableEntity)
	if !strings.Contains(body, "Vergangenheit") {
		t.Errorf("Meldung zu Zeitpunkt in der Vergangenheit: %s", body)
	}

	// Ohne Kurztext oder Beitragstext lässt sich kein Zeitpunkt speichern.
	for _, missing := range []string{"Kurztext", "Beitragstext"} {
		in := draftInput("Unvollständig")
		if missing == "Kurztext" {
			in.Texts[0].Summary = ""
		} else {
			in.Texts[0].BodyMarkdown = ""
		}
		q := e.b.createPost(in)
		_, body := e.b.schedule(q.Id, time.Now().Add(time.Hour), http.StatusUnprocessableEntity)
		if !strings.Contains(body, missing) {
			t.Errorf("Meldung nennt %s nicht: %s", missing, body)
		}
		resp, b := e.b.do(http.MethodGet, fmt.Sprintf("/api/admin/posts/%d", q.Id), nil)
		wantStatus(t, resp, b, http.StatusOK)
		if decode[api.EditorPost](t, b).ScheduledAt != nil {
			t.Errorf("Zeitpunkt trotz fehlendem %s gespeichert", missing)
		}
	}

	// Ein geplanter Beitrag lässt sich nicht unvollständig speichern.
	e.b.schedule(p.Id, time.Now().Add(time.Hour), http.StatusOK)
	in := draftInput("Zeitpunkt prüfen")
	in.Texts[0].Summary = ""
	_, body = e.b.savePost(p.Id, in, http.StatusUnprocessableEntity)
	if !strings.Contains(body, "geplant") || !strings.Contains(body, "Kurztext") {
		t.Errorf("Meldung beim unvollständigen Speichern: %s", body)
	}

	// Veröffentlichen entfernt den Zeitpunkt; danach ist keine Planung mehr möglich.
	pub := e.b.action(p.Id, "publish", http.StatusOK)
	if pub.ScheduledAt != nil {
		t.Errorf("Zeitpunkt nach Veröffentlichen: %v", pub.ScheduledAt)
	}
	_, body = e.b.schedule(p.Id, time.Now().Add(time.Hour), http.StatusUnprocessableEntity)
	if !strings.Contains(body, "bereits veröffentlicht") {
		t.Errorf("Meldung bei veröffentlichtem Beitrag: %s", body)
	}

	e.b.schedule(999999, time.Now().Add(time.Hour), http.StatusNotFound)
	e.b.unschedule(999999, http.StatusNotFound)

	resp, body := e.b.do(http.MethodPut, fmt.Sprintf("/api/admin/posts/%d/schedule", p.Id), map[string]string{"publishAt": "morgen"})
	wantStatus(t, resp, body, http.StatusBadRequest)
}

func TestScheduledPostAppearsWhenDue(t *testing.T) {
	e := newScheduleEnv(t)
	in := draftInput("Erscheint geplant", "ai-audit")
	in.Featured = true
	p := e.b.createPost(in)
	other := e.b.createPost(draftInput("Später geplant", "ai-audit"))

	e.b.schedule(p.Id, time.Now().Add(time.Hour), http.StatusOK)
	e.b.schedule(other.Id, time.Now().Add(time.Hour), http.StatusOK)

	// Vor dem Zeitpunkt: öffentlich nicht erreichbar und nicht in der Sitemap.
	if got := e.publishDue(t); len(got) != 0 {
		t.Fatalf("zu früh veröffentlicht: %v", got)
	}
	e.wantPublic(t, p.Slug, false)

	// Zeitpunkt erreicht: Der Beitrag erscheint überall, mit dem geplanten Zeitpunkt als Datum.
	due := time.Now().Add(-30 * time.Second).Truncate(time.Second)
	e.makeDue(t, p.Id, due)
	if got := e.publishDue(t); !slices.Equal(got, []int64{p.Id}) {
		t.Fatalf("veröffentlicht: %v", got)
	}
	resp, body := e.b.do(http.MethodGet, fmt.Sprintf("/api/admin/posts/%d", p.Id), nil)
	wantStatus(t, resp, body, http.StatusOK)
	got := decode[api.EditorPost](t, body)
	if got.Status != "published" || got.ScheduledAt != nil || got.PublishedAt == nil || !got.PublishedAt.Equal(due) {
		t.Fatalf("nach Fälligkeit: %+v", got)
	}
	e.wantPublic(t, p.Slug, true)
	e.wantPublic(t, other.Slug, false)

	// Ein zweiter Lauf veröffentlicht nichts doppelt.
	if got := e.publishDue(t); len(got) != 0 {
		t.Errorf("erneut veröffentlicht: %v", got)
	}
}

// Der Abgleich nutzt die echte Uhr: Ein Zeitpunkt kurz in der Zukunft wird nach Ablauf veröffentlicht.
func TestPublishDueUsesCurrentTime(t *testing.T) {
	e := newScheduleEnv(t)
	p := e.b.createPost(draftInput("Gleich", "ai-audit"))
	at := time.Now().Add(2 * time.Second)
	e.b.schedule(p.Id, at, http.StatusOK)
	if got := e.publishDue(t); len(got) != 0 {
		t.Fatalf("vor dem Zeitpunkt veröffentlicht: %v", got)
	}
	time.Sleep(time.Until(at.Truncate(time.Second).Add(time.Second)))
	if got := e.publishDue(t); !slices.Equal(got, []int64{p.Id}) {
		t.Fatalf("nach dem Zeitpunkt: %v", got)
	}
}

func TestScheduleRequiresEditorSessionAndCSRF(t *testing.T) {
	srv, _ := newServerWithAccounts(t)
	editor := newBrowser(t, srv)
	editor.mustLogin(editorEmail)
	p := editor.createPost(draftInput("Geschützt geplant"))
	path := fmt.Sprintf("/api/admin/posts/%d/schedule", p.Id)
	in := api.ScheduleInput{PublishAt: time.Now().Add(time.Hour)}

	anon := newBrowser(t, srv)
	for _, method := range []string{http.MethodPut, http.MethodDelete} {
		resp, body := anon.do(method, path, in)
		wantStatus(t, resp, body, http.StatusUnauthorized)
		token := editor.csrf
		editor.csrf = ""
		resp, body = editor.do(method, path, in)
		editor.csrf = token
		wantStatus(t, resp, body, http.StatusForbidden)
	}
	resp, body := editor.do(http.MethodGet, fmt.Sprintf("/api/admin/posts/%d", p.Id), nil)
	wantStatus(t, resp, body, http.StatusOK)
	if decode[api.EditorPost](t, body).ScheduledAt != nil {
		t.Fatal("Zeitpunkt ohne Berechtigung gespeichert")
	}
}
