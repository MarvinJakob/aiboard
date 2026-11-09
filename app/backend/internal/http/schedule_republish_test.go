package httpserver_test

import (
	"fmt"
	"net/http"
	"testing"
	"time"

	"ki-web/backend/internal/api"
)

// Ticket #31: Ein zurückgenommener und erneut geplanter Beitrag trägt nach der automatischen
// Veröffentlichung den neuen Zeitpunkt, öffentlich und in der Sortierung.
func TestRescheduledRepublishUsesNewDate(t *testing.T) {
	e := newScheduleEnv(t)
	old := e.b.createPost(draftInput("Alter Beitrag", "ai-audit"))
	e.b.action(old.Id, "publish", http.StatusOK)
	middle := e.b.createPost(draftInput("Beitrag dazwischen", "ai-audit"))
	e.b.action(middle.Id, "publish", http.StatusOK)

	// Erstveröffentlichung im Oktober, der andere Beitrag Mitte Oktober.
	for id, at := range map[int64]string{old.Id: "2026-10-01T08:00:00Z", middle.Id: "2026-10-15T08:00:00Z"} {
		if _, err := e.db.Exec(`UPDATE posts SET published_at = ? WHERE id = ?`, at, id); err != nil {
			t.Fatal(err)
		}
	}

	// Zurücknehmen, neu planen, Termin erreicht.
	e.b.action(old.Id, "unpublish", http.StatusOK)
	e.b.schedule(old.Id, time.Now().Add(time.Hour), http.StatusOK)
	due := time.Now().Add(-10 * time.Second).UTC().Truncate(time.Second)
	e.makeDue(t, old.Id, due)
	if got := e.publishDue(t); len(got) != 1 {
		t.Fatalf("veröffentlicht: %v", got)
	}

	// Redaktion und Öffentlichkeit zeigen den neuen Zeitpunkt.
	resp, body := e.b.do(http.MethodGet, fmt.Sprintf("/api/admin/posts/%d", old.Id), nil)
	wantStatus(t, resp, body, http.StatusOK)
	if got := decode[api.EditorPost](t, body); got.PublishedAt == nil || !got.PublishedAt.Equal(due) {
		t.Fatalf("Redaktion: publishedAt %v, erwartet %v", got.PublishedAt, due)
	}
	resp, body = e.public("/api/posts/" + old.Slug)
	wantStatus(t, resp, body, http.StatusOK)
	if got := decode[api.Post](t, body).PublishedAt; !got.Equal(due) {
		t.Fatalf("öffentlich: publishedAt %v, erwartet %v", got, due)
	}

	// Chronologische Listen: der erneut veröffentlichte Beitrag steht vor dem Oktober-Beitrag.
	for _, path := range []string{"/api/posts", "/api/topics/ai-audit"} {
		s := publicSlugs(t, e.public, path)
		if len(s) < 2 || s[0] != old.Slug || s[1] != middle.Slug {
			t.Errorf("%s: Reihenfolge %v", path, s)
		}
	}

	// Manuelles Wiederveröffentlichen („Rückgängig“) behält dagegen das bisherige Datum.
	e.b.action(old.Id, "unpublish", http.StatusOK)
	again := e.b.action(old.Id, "publish", http.StatusOK)
	if again.PublishedAt == nil || !again.PublishedAt.Equal(due) {
		t.Errorf("Rückgängig: publishedAt %v, erwartet %v", again.PublishedAt, due)
	}
}
