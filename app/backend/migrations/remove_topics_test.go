package migrations_test

import (
	"context"
	"path/filepath"
	"testing"

	"github.com/pressly/goose/v3"
	"ki-web/backend/internal/store"
	"ki-web/backend/migrations"
)

// Ticket #102: Eine bestehende Datenbank verliert die beiden Themen, behält aber Beiträge und übrige
// Zuordnungen. Ein erneutes Einspielen der Migrationen bringt die Themen nicht zurück.
func TestRemoveAutomationAndSkillsTopics(t *testing.T) {
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
	if _, err = p.UpTo(ctx, 9); err != nil {
		t.Fatal(err)
	}
	// Bestand vor dem Update: ein veröffentlichter Beitrag und ein Entwurf, beide auch einem bleibenden Thema zugeordnet.
	_, err = db.Exec(`INSERT INTO posts (id, slug, status, published_at, updated_at) VALUES
            (100, 'workflow', 'published', '2026-11-09T10:00:00Z', '2026-11-09T10:00:00Z'),
            (101, 'skill-entwurf', 'draft', NULL, '2026-11-09T10:00:00Z');
        INSERT INTO post_translations (post_id, lang, title, summary, body_markdown) VALUES
            (100, 'de', 'Workflow', 'Kurz', 'Text'), (101, 'de', 'Skill', 'Kurz', 'Text');
        INSERT INTO post_topics (post_id, topic_id)
            SELECT p.id, t.id FROM posts p CROSS JOIN topics t
            WHERE p.id IN (100, 101) AND t.slug IN ('prozessautomatisierung', 'ki-tipps-und-tricks', 'softwareentwicklung');`)
	if err != nil {
		t.Fatal(err)
	}

	count := func(query string) int {
		t.Helper()
		var n int
		if err := db.QueryRow(query).Scan(&n); err != nil {
			t.Fatal(err)
		}
		return n
	}
	const removed = `SELECT COUNT(*) FROM topics WHERE slug IN ('prozessautomatisierung', 'ki-tipps-und-tricks')`
	for i := 0; i < 2; i++ {
		if _, err = p.Up(ctx); err != nil {
			t.Fatal(err)
		}
		if n := count(removed); n != 0 {
			t.Fatalf("Durchlauf %d: %d entfernte Themen vorhanden", i, n)
		}
		if n := count(`SELECT COUNT(*) FROM topic_translations WHERE topic_id NOT IN (SELECT id FROM topics)`); n != 0 {
			t.Fatalf("verwaiste Sprachfassungen: %d", n)
		}
		if n := count(`SELECT COUNT(*) FROM posts p JOIN post_translations pt ON pt.post_id = p.id WHERE p.id IN (100, 101)`); n != 2 {
			t.Fatalf("Beiträge und Entwürfe müssen erhalten bleiben: %d", n)
		}
		if n := count(`SELECT COUNT(*) FROM post_topics pt JOIN topics t ON t.id = pt.topic_id WHERE t.slug = 'softwareentwicklung' AND pt.post_id IN (100, 101)`); n != 2 {
			t.Fatalf("übrige Zuordnungen: %d", n)
		}
		if n := count(`SELECT COUNT(*) FROM topics`); n != 4 {
			t.Fatalf("verbleibende Themen: %d", n)
		}
		// Rücknahme stellt die Metadaten wieder her, danach entfernt das erneute Up sie wieder.
		if _, err = p.Down(ctx); err != nil {
			t.Fatal(err)
		}
		if n := count(`SELECT COUNT(*) FROM topic_translations tt JOIN topics t ON t.id = tt.topic_id WHERE t.slug IN ('prozessautomatisierung', 'ki-tipps-und-tricks')`); n != 4 {
			t.Fatalf("Rollback: %d Sprachfassungen", n)
		}
	}
}
