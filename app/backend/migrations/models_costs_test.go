package migrations_test

import (
	"context"
	"path/filepath"
	"testing"

	"github.com/pressly/goose/v3"
	"ki-web/backend/internal/store"
	"ki-web/backend/migrations"
)

// Ticket #83: Das Thema „Modelle und Kosten“ wird ohne feste ID angelegt und lässt sich sauber zurücknehmen.
func TestModelsCostsTopicUpgradeAndRollback(t *testing.T) {
	db, err := store.Open(filepath.Join(t.TempDir(), "migration.db"))
	if err != nil {
		t.Fatal(err)
	}
	defer db.Close()
	p, err := goose.NewProvider(goose.DialectSQLite3, db, migrations.Schema, goose.WithDisableGlobalRegistry(true))
	if err != nil {
		t.Fatal(err)
	}
	ctx := context.Background()
	if _, err = p.UpTo(ctx, 6); err != nil {
		t.Fatal(err)
	}
	// Ein vorhandenes Thema mit hoher ID darf weder kollidieren noch seine Zuordnungen verlieren.
	_, err = db.Exec(`INSERT INTO topics (id, slug, sort_order) VALUES (42, 'bestand', 42);
        INSERT INTO posts (id, slug, status, updated_at) VALUES (100, 'bestand', 'draft', '2026-11-09T10:00:00Z');
        INSERT INTO post_topics (post_id, topic_id) VALUES (100, 42);`)
	if err != nil {
		t.Fatal(err)
	}
	for i := 0; i < 2; i++ {
		if _, err = p.UpTo(ctx, 9); err != nil {
			t.Fatal(err)
		}
		var count, sortOrder int
		if err = db.QueryRow(`SELECT COUNT(*) FROM topic_translations JOIN topics ON topic_id = topics.id WHERE slug = 'modelle-und-kosten' AND lang IN ('de', 'en')`).Scan(&count); err != nil || count != 2 {
			t.Fatalf("Sprachfassungen: %d, %v", count, err)
		}
		if err = db.QueryRow(`SELECT sort_order FROM topics WHERE slug = 'modelle-und-kosten'`).Scan(&sortOrder); err != nil || sortOrder != 6 {
			t.Fatalf("Reihenfolge: %d, %v", sortOrder, err)
		}
		if _, err = p.Down(ctx); err != nil {
			t.Fatal(err)
		}
		if err = db.QueryRow(`SELECT COUNT(*) FROM topics WHERE slug = 'modelle-und-kosten'`).Scan(&count); err != nil || count != 0 {
			t.Fatalf("Rollback: %d, %v", count, err)
		}
		if err = db.QueryRow(`SELECT COUNT(*) FROM post_topics WHERE post_id = 100 AND topic_id = 42`).Scan(&count); err != nil || count != 1 {
			t.Fatalf("Bestandszuordnung: %d, %v", count, err)
		}
	}
}
