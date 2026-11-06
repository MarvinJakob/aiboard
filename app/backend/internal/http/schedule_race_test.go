package httpserver_test

import (
	"context"
	"database/sql"
	"fmt"
	"net/http"
	"testing"
	"time"

	"ki-web/backend/internal/api"
	"ki-web/backend/internal/store"
)

// Ticket #30: Wird ein fälliger Termin zwischen Einlesen und Schreiben des Hintergrundjobs in die
// Zukunft verschoben, darf der Beitrag nicht erscheinen.
func TestRescheduledBetweenReadAndWriteStaysHidden(t *testing.T) {
	e := newScheduleEnv(t)
	p := e.b.createPost(draftInput("Verschoben", "ai-audit"))
	e.b.schedule(p.Id, time.Now().Add(time.Hour), http.StatusOK)

	// 12:00 fällig, eingelesen um 12:00:05.
	due := time.Now().Add(-5 * time.Second).UTC().Truncate(time.Second)
	e.makeDue(t, p.Id, due)
	now := sql.NullString{String: time.Now().UTC().Format(time.RFC3339), Valid: true}
	q := store.New(e.db)
	rows, err := q.ListDuePosts(context.Background(), now)
	if err != nil {
		t.Fatal(err)
	}
	if len(rows) != 1 || rows[0].ID != p.Id {
		t.Fatalf("eingelesen: %+v", rows)
	}

	// Dazwischen verschiebt die Redaktion den Termin um eine Stunde.
	later := time.Now().Add(time.Hour).Truncate(time.Second)
	e.b.schedule(p.Id, later, http.StatusOK)

	// Der Job schreibt mit dem eingelesenen Eintrag: Es darf nichts passieren.
	n, err := q.PublishScheduledPost(context.Background(), store.PublishScheduledPostParams{
		UpdatedAt: now.String, ID: rows[0].ID, Now: now,
	})
	if err != nil {
		t.Fatal(err)
	}
	if n != 0 {
		t.Fatalf("%d Beitrag veröffentlicht, erwartet keiner", n)
	}
	// Auch das Entfernen unvollständiger Termine lässt den neuen Termin stehen.
	if n, err := q.UnscheduleDuePost(context.Background(), store.UnscheduleDuePostParams{UpdatedAt: now.String, ID: p.Id, Now: now}); err != nil || n != 0 {
		t.Fatalf("Termin entfernt: n=%d, err=%v", n, err)
	}

	resp, body := e.b.do(http.MethodGet, fmt.Sprintf("/api/admin/posts/%d", p.Id), nil)
	wantStatus(t, resp, body, http.StatusOK)
	got := decode[api.EditorPost](t, body)
	if got.Status != "draft" || got.PublishedAt != nil || got.ScheduledAt == nil || !got.ScheduledAt.Equal(later) {
		t.Fatalf("nach dem Schreibversuch: %+v", got)
	}
	e.wantPublic(t, p.Slug, false)

	// Ein weiterer Lauf vor dem neuen Termin veröffentlicht ebenfalls nichts.
	if got := e.publishDue(t); len(got) != 0 {
		t.Fatalf("vor dem neuen Termin veröffentlicht: %v", got)
	}
	e.wantPublic(t, p.Slug, false)

	// Zum neuen Termin erscheint der Beitrag.
	e.makeDue(t, p.Id, time.Now().Add(-time.Second))
	if got := e.publishDue(t); len(got) != 1 {
		t.Fatalf("zum neuen Termin nicht veröffentlicht: %v", got)
	}
	e.wantPublic(t, p.Slug, true)
}
