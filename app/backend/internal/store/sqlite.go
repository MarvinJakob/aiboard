package store

import (
	"context"
	"database/sql"
	"fmt"
	"io/fs"
	"log/slog"
	"net/url"
	"os"
	"path/filepath"

	"github.com/pressly/goose/v3"
	_ "modernc.org/sqlite" // reiner Go-Treiber, kein CGO

	"ki-web/backend/migrations"
)

// Open öffnet die SQLite-Datenbank mit den Einstellungen aus ARCHITECTURE.md, Abschnitt 8.
func Open(path string) (*sql.DB, error) {
	if dir := filepath.Dir(path); dir != "." {
		if err := os.MkdirAll(dir, 0o750); err != nil {
			return nil, fmt.Errorf("datenbankverzeichnis anlegen: %w", err)
		}
	}
	q := url.Values{}
	q.Add("_pragma", "journal_mode(WAL)")
	q.Add("_pragma", "foreign_keys(ON)")
	q.Add("_pragma", "busy_timeout(5000)")
	db, err := sql.Open("sqlite", "file:"+filepath.ToSlash(path)+"?"+q.Encode())
	if err != nil {
		return nil, err
	}
	if err := db.Ping(); err != nil {
		db.Close()
		return nil, fmt.Errorf("datenbank öffnen: %w", err)
	}
	return db, nil
}

// Migrate spielt alle Schema-Migrationen ein. Mit devSeed kommen Testinhalte für die Entwicklung hinzu.
// Die Testinhalte führen eine eigene Versionstabelle, damit sie nie mit dem Schema vermischt werden.
func Migrate(ctx context.Context, db *sql.DB, devSeed bool, log *slog.Logger) error {
	if err := up(ctx, db, migrations.Schema, ".", "goose_db_version", log); err != nil {
		return fmt.Errorf("schema-migrationen: %w", err)
	}
	if devSeed {
		if err := up(ctx, db, migrations.DevSeed, "dev", "goose_dev_seed_version", log); err != nil {
			return fmt.Errorf("testinhalte: %w", err)
		}
	}
	return nil
}

func up(ctx context.Context, db *sql.DB, fsys fs.FS, dir, table string, log *slog.Logger) error {
	sub, err := fs.Sub(fsys, dir)
	if err != nil {
		return err
	}
	p, err := goose.NewProvider(goose.DialectSQLite3, db, sub,
		goose.WithTableName(table),
		goose.WithDisableGlobalRegistry(true),
	)
	if err != nil {
		return err
	}
	results, err := p.Up(ctx)
	for _, r := range results {
		log.Info("migration eingespielt", "tabelle", table, "datei", r.Source.Path, "dauer", r.Duration.String())
	}
	return err
}

// Backup schreibt mit VACUUM INTO eine konsistente Kopie der Datenbank nach dest.
func Backup(ctx context.Context, db *sql.DB, dest string) error {
	if _, err := os.Stat(dest); err == nil {
		if err := os.Remove(dest); err != nil {
			return fmt.Errorf("alte sicherung entfernen: %w", err)
		}
	}
	_, err := db.ExecContext(ctx, "VACUUM INTO ?", dest)
	return err
}
