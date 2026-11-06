// Befehl server startet die KI-Webseite.
//
//	server              startet die Anwendung (Standard)
//	server healthcheck  ruft /api/health auf (für den Docker-Healthcheck, das Image enthält kein curl)
//	server backup [ZIEL] schreibt mit VACUUM INTO eine konsistente Kopie der Datenbank
//	server user create --email ADRESSE [--role admin|editor]
//	                    legt ein Konto an, z. B. das erste Admin-Konto bei der Inbetriebnahme.
//	                    Das Passwort kommt aus USER_PASSWORD oder wird abgefragt.
//
// Konfiguration über Umgebungsvariablen, siehe .env.example.
package main

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"path/filepath"
	"strings"
	"syscall"
	"time"

	"ki-web/backend/internal/audit"
	httpserver "ki-web/backend/internal/http"
	"ki-web/backend/internal/media"
	"ki-web/backend/internal/service"
	"ki-web/backend/internal/store"
	"ki-web/backend/internal/web"
)

type config struct {
	addr         string
	databasePath string
	mediaPath    string
	baseURL      string
	devSeed      bool
	serveMedia   bool
	trustProxy   bool
}

func env(key, def string) string {
	if v := strings.TrimSpace(os.Getenv(key)); v != "" {
		return v
	}
	return def
}

func envBool(key string) bool {
	switch strings.ToLower(os.Getenv(key)) {
	case "1", "true", "yes", "ja":
		return true
	}
	return false
}

func loadConfig() config {
	return config{
		addr:         env("ADDR", ":8080"),
		databasePath: env("DATABASE_PATH", filepath.Join("data", "app.db")),
		mediaPath:    env("MEDIA_PATH", filepath.Join("data", "media")),
		baseURL:      env("PUBLIC_BASE_URL", "http://localhost:8080"),
		devSeed:      envBool("DEV_SEED"),
		serveMedia:   envBool("SERVE_MEDIA"),
		trustProxy:   envBool("TRUST_PROXY"),
	}
}

func main() {
	log := slog.New(slog.NewJSONHandler(os.Stdout, nil))
	cfg := loadConfig()

	cmd := "server"
	if len(os.Args) > 1 {
		cmd = os.Args[1]
	}
	var err error
	switch cmd {
	case "server":
		err = runServer(cfg, log)
	case "healthcheck":
		err = healthcheck(cfg)
	case "backup":
		dest := filepath.Join(filepath.Dir(cfg.databasePath), "backup.db")
		if len(os.Args) > 2 {
			dest = os.Args[2]
		}
		err = backup(cfg, dest, log)
	case "user":
		err = userCommand(cfg, os.Args[2:], log)
	default:
		err = fmt.Errorf("unbekannter befehl %q (erlaubt: server, healthcheck, backup, user)", cmd)
	}
	if err != nil {
		log.Error("abbruch", "befehl", cmd, "fehler", err)
		os.Exit(1)
	}
}

func runServer(cfg config, log *slog.Logger) error {
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	db, err := store.Open(cfg.databasePath)
	if err != nil {
		return err
	}
	defer db.Close()
	if err := store.Migrate(ctx, db, cfg.devSeed, log); err != nil {
		return err
	}

	catalog, err := audit.Load()
	if err != nil {
		return err
	}

	public := service.NewPublic(store.New(db))
	accounts := service.NewAccounts(db)
	go cleanupSessions(ctx, accounts, log)
	editorial := service.NewEditorial(db)
	go publishScheduled(ctx, editorial, log)
	hcfg := httpserver.Config{
		Public:        public,
		Audit:         catalog,
		Accounts:      accounts,
		Site:          web.New(public, catalog, cfg.baseURL, nil, log),
		Editorial:     editorial,
		Media:         media.NewStore(cfg.mediaPath),
		EditorialSite: web.NewEditorial(accounts, nil, log),
		SecureCookies: strings.HasPrefix(cfg.baseURL, "https://"),
		TrustProxy:    cfg.trustProxy,
		Log:           log,
	}
	if cfg.serveMedia {
		hcfg.MediaPath = cfg.mediaPath
	}
	srv := &http.Server{
		Addr:              cfg.addr,
		Handler:           httpserver.New(hcfg),
		ReadHeaderTimeout: 10 * time.Second,
		ReadTimeout:       30 * time.Second,
		WriteTimeout:      60 * time.Second,
		IdleTimeout:       120 * time.Second,
	}

	errc := make(chan error, 1)
	go func() {
		log.Info("server gestartet", "adresse", cfg.addr, "basis_url", cfg.baseURL, "testinhalte", cfg.devSeed)
		errc <- srv.ListenAndServe()
	}()

	select {
	case err := <-errc:
		if !errors.Is(err, http.ErrServerClosed) {
			return err
		}
	case <-ctx.Done():
		log.Info("server wird beendet")
		shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()
		return srv.Shutdown(shutdownCtx)
	}
	return nil
}

// publishInterval bestimmt, wie oft fällige Beiträge veröffentlicht werden. Ticket #23 erlaubt
// höchstens eine Minute Abweichung vom geplanten Zeitpunkt.
const publishInterval = 15 * time.Second

// publishScheduled veröffentlicht beim Start und danach regelmäßig alle Beiträge, deren geplanter
// Zeitpunkt erreicht ist (Ticket #23).
func publishScheduled(ctx context.Context, editorial *service.Editorial, log *slog.Logger) {
	t := time.NewTicker(publishInterval)
	defer t.Stop()
	for {
		published, skipped, err := editorial.PublishDue(ctx)
		if err != nil && ctx.Err() == nil {
			log.Error("geplante beiträge veröffentlichen", "fehler", err)
		}
		for _, id := range published {
			log.Info("geplanten beitrag veröffentlicht", "id", id)
		}
		for _, id := range skipped {
			log.Warn("geplanter beitrag unvollständig, zeitpunkt entfernt", "id", id)
		}
		select {
		case <-ctx.Done():
			return
		case <-t.C:
		}
	}
}

// cleanupSessions löscht abgelaufene Sitzungen beim Start und danach täglich (ARCHITECTURE.md, Abschnitt 4).
func cleanupSessions(ctx context.Context, accounts *service.Accounts, log *slog.Logger) {
	t := time.NewTicker(24 * time.Hour)
	defer t.Stop()
	for {
		if n, err := accounts.CleanupSessions(ctx); err != nil && ctx.Err() == nil {
			log.Error("abgelaufene sitzungen löschen", "fehler", err)
		} else if n > 0 {
			log.Info("abgelaufene sitzungen gelöscht", "anzahl", n)
		}
		select {
		case <-ctx.Done():
			return
		case <-t.C:
		}
	}
}

func healthcheck(cfg config) error {
	port := cfg.addr
	if i := strings.LastIndex(port, ":"); i >= 0 {
		port = port[i+1:]
	}
	client := http.Client{Timeout: 4 * time.Second}
	resp, err := client.Get("http://127.0.0.1:" + port + "/api/health")
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("health antwortet mit %d", resp.StatusCode)
	}
	return nil
}

func backup(cfg config, dest string, log *slog.Logger) error {
	db, err := store.Open(cfg.databasePath)
	if err != nil {
		return err
	}
	defer db.Close()
	if err := store.Backup(context.Background(), db, dest); err != nil {
		return err
	}
	log.Info("sicherung geschrieben", "ziel", dest)
	return nil
}
