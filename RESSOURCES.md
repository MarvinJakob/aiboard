# Projektstruktur und wichtige Dateien

Dieses Repository enthält die Webseite „KI Perspektiven“, einen klickbaren Designentwurf sowie redaktionelle Inhalte und Recherchen rund um KI.

## Orientierung

| Datei oder Ordner | Was dort zu finden ist |
| --- | --- |
| [AGENTS.md](AGENTS.md) | Arbeitsregeln für das Repository, etwa für Recherchen und Anforderungen. |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Technisches Konzept: Frontend und Backend, API, Datenmodell und Betrieb. |
| [DESIGN.md](DESIGN.md) | Gestaltungskonzept mit Farben, Typografie, Komponenten und Vorgaben zur Barrierefreiheit. |
| [mock/index.html](mock/index.html) | Klickbarer HTML-Entwurf zur Vorschau des Designs. |
| [app/README.md](app/README.md) | Einstieg in die lokale Entwicklung: Anwendung starten, Tests ausführen, Code erzeugen und Konfiguration nachschlagen. |
| [app/docs/adr/](app/docs/adr/) | Dokumentierte Architekturentscheidungen und ihre Begründungen. |
| [LICENSE](LICENSE) | Lizenz des Repositorys. |

## Anwendung unter `app/`

| Gesucht | Hier nachschauen |
| --- | --- |
| Seiten und gemeinsame UI | [frontend/src/App.tsx](app/frontend/src/App.tsx) für die Routen, [frontend/src/pages/](app/frontend/src/pages/) für die Seiten und [frontend/src/components/](app/frontend/src/components/) für wiederverwendbare Komponenten. |
| Gestaltung, Sprache und Rechtstexte | [frontend/src/styles.css](app/frontend/src/styles.css) für die Styles, [frontend/src/i18n/](app/frontend/src/i18n/) für deutsche und englische UI-Texte und [frontend/src/content/legal/](app/frontend/src/content/legal/) für Impressum und Datenschutz. |
| API-Vertrag und Client | [api/openapi.yaml](app/api/openapi.yaml) definiert Endpunkte und Datenformate. [frontend/src/api/client.ts](app/frontend/src/api/client.ts) bindet die API im Frontend an. Die [TypeScript-Typen](app/frontend/src/api/schema.d.ts) und der [Go-Schnittstellencode](app/backend/internal/api/api.gen.go) werden aus dem Vertrag erzeugt. |
| Server und Fachlogik | [backend/cmd/server/main.go](app/backend/cmd/server/main.go) ist der Einstiegspunkt. [backend/internal/http/](app/backend/internal/http/) enthält Routing und API-Handler. [backend/internal/service/public.go](app/backend/internal/service/public.go) regelt die Auswahl veröffentlichter Inhalte und ihrer Sprachfassungen. |
| Seitenauslieferung und Suchmaschinen | [backend/internal/web/](app/backend/internal/web/) liefert das gebaute Frontend aus und erzeugt Metadaten, Sitemap und `robots.txt`. |
| Datenbank | [backend/migrations/](app/backend/migrations/) enthält das SQLite-Schema, Startthemen und unter `dev/` Testbeiträge. Die SQL-Abfragen stehen in [backend/internal/store/queries.sql](app/backend/internal/store/queries.sql); daraus erzeugt sqlc Go-Code. |
| Tests | [frontend/src/app.test.tsx](app/frontend/src/app.test.tsx) prüft das Verhalten der Webseite; [backend/internal/http/server_test.go](app/backend/internal/http/server_test.go) prüft die HTTP-Schnittstellen und Seitenauslieferung. |
| Build, Konfiguration und Betrieb | [Makefile](app/Makefile) bündelt häufige Entwicklungsaufgaben, [.env.example](app/.env.example) zeigt die Umgebungsvariablen. [Dockerfile](app/Dockerfile), [compose.yaml](app/compose.yaml) und [compose.dev.yaml](app/compose.dev.yaml) beschreiben Build und Betrieb mit Docker. Unter [deploy/](app/deploy/) liegen die Caddy-Konfiguration und das Skript zur Datensicherung. |

## Inhalte und Anforderungen

| Ablage | Was dort zu finden ist |
| --- | --- |
| [content/](content/) | Redaktionelle Entwürfe und Arbeitsmaterial, etwa zu KI-Audits, Datenanalyse und Softwareentwicklung. |
| [research/](research/) | Datierte Recherchen mit Quellen für die jeweiligen Aussagen. [research/SOURCES.md](research/SOURCES.md) sammelt Anlaufstellen für weitere Recherchen. |
| `requirements/` | Vorgesehene Ablage für neue Anforderungen als Markdown-Dateien. Das Format steht in [AGENTS.md](AGENTS.md). |
