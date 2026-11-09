package migrations_test

import (
	"context"
	"path/filepath"
	"reflect"
	"testing"

	"github.com/pressly/goose/v3"
	"ki-web/backend/internal/store"
	"ki-web/backend/migrations"
)

// Ticket #81: Das bestehende Thema muss nach Up/Down dieselben Texte und Beitragszuordnungen haben.
func TestDataAnalyticsUpgradeAndRollback(t *testing.T) {
	const version = 7
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
	if _, err := p.UpTo(ctx, version-1); err != nil {
		t.Fatal(err)
	}
	_, err = db.Exec(`INSERT INTO posts (id, slug, status, published_at, updated_at) VALUES (100, 'bestand', 'published', '2026-11-09T10:00:00Z', '2026-11-09T10:00:00Z');
		INSERT INTO post_topics (post_id, topic_id) VALUES (100, (SELECT id FROM topics WHERE slug = 'data-analytics'));`)
	if err != nil {
		t.Fatal(err)
	}
	read := func() map[string][4]string {
		rows, err := db.Query(`SELECT lang, title, label, summary, intro FROM topic_translations
			WHERE topic_id = (SELECT id FROM topics WHERE slug = 'data-analytics')`)
		if err != nil {
			t.Fatal(err)
		}
		defer rows.Close()
		result := map[string][4]string{}
		for rows.Next() {
			var lang string
			var text [4]string
			if err := rows.Scan(&lang, &text[0], &text[1], &text[2], &text[3]); err != nil {
				t.Fatal(err)
			}
			result[lang] = text
		}
		if err := rows.Err(); err != nil {
			t.Fatal(err)
		}
		return result
	}
	original := read()
	if original["de"][0] != "AI in Data Analytics" {
		t.Fatalf("Ausgangsstand unerwartet: %+v", original)
	}
	if _, err := p.UpTo(ctx, version); err != nil {
		t.Fatal(err)
	}
	updated := read()
	if updated["de"][0] != "KI in Data Analytics" || updated["de"][2] != "Wie aus einer schnellen KI-Antwort eine belastbare Analyse wird: Kennzahlen klären, Ergebnisse prüfen." ||
		updated["en"][0] != "AI in Data Analytics" || updated["en"][2] != "How a quick AI answer becomes a reliable analysis: clarify metrics, check results." {
		t.Fatalf("Metadaten nicht aktualisiert: %+v", updated)
	}
	if _, err := p.Down(ctx); err != nil {
		t.Fatal(err)
	}
	if restored := read(); !reflect.DeepEqual(restored, original) {
		t.Fatalf("Down stellt alte Texte nicht wieder her: %+v", restored)
	}
	var slug string
	if err := db.QueryRow("SELECT slug FROM topics JOIN post_topics ON topic_id = topics.id WHERE post_id = 100").Scan(&slug); err != nil || slug != "data-analytics" {
		t.Fatalf("Beitragszuordnung verloren: %s, %v", slug, err)
	}
	if _, err := p.UpTo(ctx, version); err != nil {
		t.Fatal(err)
	}
	if reapplied := read(); !reflect.DeepEqual(reapplied, updated) {
		t.Fatalf("Erneutes Up verändert Texte: %+v", reapplied)
	}
}
