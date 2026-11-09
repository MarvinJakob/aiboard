# Projektstruktur und wichtige Dateien

Dieses Repository enthält die Webseite „KI Perspektiven“, einen klickbaren Designentwurf sowie redaktionelle Inhalte und Recherchen rund um KI.

## Orientierung

| Datei oder Ordner | Was dort zu finden ist |
| --- | --- |
| [README.md](README.md) | Kurzüberblick über das Repository. |
| [AGENTS.md](AGENTS.md) | Arbeitsregeln für das Repository, etwa für Recherchen und Anforderungen. |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Technisches Konzept: Frontend und Backend, API, Datenmodell und Betrieb. |
| [DESIGN.md](DESIGN.md) | Gestaltungskonzept mit Farben, Typografie, Komponenten und Vorgaben zur Barrierefreiheit. |
| [DESIGN_CIMT.md](DESIGN_CIMT.md) | Anleitung zum cimt × Apple-Layout: Design-Tokens, Seitenaufbau, dauerhaft aktive Liquid-Glass-Navigation, Bedienlogik, responsive Regeln und Quellen. |
| [mock/design/index.html](mock/design/index.html) | Klickbarer HTML-Entwurf zur Vorschau des Designs. |
| [mock/design_cimt/index.html](mock/design_cimt/index.html) | cimt × Apple-HIG-Designvariante mit `#dc6e14`, Systemtypografie, opaken Inhaltsflächen und dauerhaft aktiver Liquid-Glass-Navigation mit Vorrang für Barrierefreiheit. Themenauswahl, Beitragsfilter und Demo-KI-Check; Quellen im Footer. Direkt ohne Build im Browser nutzbar. |
| [mock/landing/index.html](mock/landing/index.html) | Landing-Page-Entwurf mit Einordnung „Was ist KI?“, Themen, interaktivem KI-Audit-Teaser und Blog. |
| [mock/profil/index.html](mock/profil/index.html) | Profilentwurf für Marvin Jakob mit AI-Schwerpunkten und Projekterfahrung. |
| [ressources/profil/](ressources/profil/) | Porträtbilder für den Profilentwurf. |
| [app/README.md](app/README.md) | Einstieg in die lokale Entwicklung: Anwendung starten, Tests ausführen, Code erzeugen und Konfiguration nachschlagen. |
| [app/docs/adr/](app/docs/adr/) | Dokumentierte Architekturentscheidungen und ihre Begründungen. |
| [app/docs/audit-abnahme.md](app/docs/audit-abnahme.md) | Abnahmedokumentation zum KI-Audit. |
| [LICENSE](LICENSE) | Lizenz des Repositorys. |

## Anwendung unter `app/`

| Gesucht | Hier nachschauen |
| --- | --- |
| Seiten und gemeinsame UI | [frontend/src/App.tsx](app/frontend/src/App.tsx) für die Routen, [frontend/src/pages/](app/frontend/src/pages/) für die Seiten und [frontend/src/components/](app/frontend/src/components/) für wiederverwendbare Komponenten. |
| Redaktionsfrontend | [frontend-redaktion/](app/frontend-redaktion/) ist eine eigene React-Anwendung unter `/redaktion`: [src/App.tsx](app/frontend-redaktion/src/App.tsx) für Routen, [src/pages/](app/frontend-redaktion/src/pages/) für Anmeldung und Verwaltungsseiten. |
| Anmeldung, Sitzungen und Rollen | [backend/internal/auth/](app/backend/internal/auth/) für Passwörter und Tokens, [backend/internal/service/accounts.go](app/backend/internal/service/accounts.go) für Konten und Sitzungen, [backend/internal/http/auth.go](app/backend/internal/http/auth.go) für die Prüfung von Sitzung, Rolle und CSRF-Token, [backend/internal/web/editorial.go](app/backend/internal/web/editorial.go) für die Auslieferung der Redaktionsseiten. |
| KI-Audit | [backend/internal/audit/](app/backend/internal/audit/) enthält Logik und die Inhalte ([content.json](app/backend/internal/audit/content.json)). Im Frontend: [lib/audit.ts](app/frontend/src/lib/audit.ts), [AuditOverview.tsx](app/frontend/src/components/AuditOverview.tsx), [AuditQuiz.tsx](app/frontend/src/components/AuditQuiz.tsx) und [pages/AuditDimension.tsx](app/frontend/src/pages/AuditDimension.tsx). |
| Redaktionelle Verwaltung | [backend/internal/http/editorial.go](app/backend/internal/http/editorial.go) und [users.go](app/backend/internal/http/users.go) für die Schnittstellen, [service/editorial.go](app/backend/internal/service/editorial.go) für die Fachlogik, [backend/internal/media/](app/backend/internal/media/) für Medien. |
| Gestaltung, Sprache und Rechtstexte | [frontend/src/styles.css](app/frontend/src/styles.css) für die Styles, [frontend/src/i18n/](app/frontend/src/i18n/) für deutsche und englische UI-Texte und [frontend/src/content/legal/](app/frontend/src/content/legal/) für Impressum und Datenschutz. |
| API-Vertrag und Client | [api/openapi.yaml](app/api/openapi.yaml) definiert Endpunkte und Datenformate. [frontend/src/api/client.ts](app/frontend/src/api/client.ts) bindet die API im Frontend an. Die [TypeScript-Typen](app/frontend/src/api/schema.d.ts) und der [Go-Schnittstellencode](app/backend/internal/api/api.gen.go) werden aus dem Vertrag erzeugt. |
| Server und Fachlogik | [backend/cmd/server/main.go](app/backend/cmd/server/main.go) ist der Einstiegspunkt. [backend/internal/http/](app/backend/internal/http/) enthält Routing und API-Handler. [backend/internal/service/public.go](app/backend/internal/service/public.go) regelt die Auswahl veröffentlichter Inhalte und ihrer Sprachfassungen. |
| Seitenauslieferung und Suchmaschinen | [backend/internal/web/](app/backend/internal/web/) liefert das gebaute Frontend aus und erzeugt Metadaten, Sitemap und `robots.txt`. |
| Datenbank | [backend/migrations/](app/backend/migrations/) enthält das SQLite-Schema, Startthemen, Konten und geplante Veröffentlichung sowie unter `dev/` Testbeiträge. Die SQL-Abfragen stehen in [backend/internal/store/queries.sql](app/backend/internal/store/queries.sql); daraus erzeugt sqlc Go-Code. |
| Tests | [frontend/src/app.test.tsx](app/frontend/src/app.test.tsx) prüft das Verhalten der Webseite; [frontend-redaktion/src/](app/frontend-redaktion/src/) enthält die `*.test.tsx` des Redaktionsfrontends; [backend/internal/http/](app/backend/internal/http/) enthält die `*_test.go` für HTTP-Schnittstellen, Seitenauslieferung, Anmeldung und Terminveröffentlichung. |
| Build, Konfiguration und Betrieb | [Makefile](app/Makefile) bündelt häufige Entwicklungsaufgaben, [.env.example](app/.env.example) zeigt die Umgebungsvariablen. [Dockerfile](app/Dockerfile), [compose.yaml](app/compose.yaml) und [compose.dev.yaml](app/compose.dev.yaml) beschreiben Build und Betrieb mit Docker. Unter [deploy/](app/deploy/) liegen die Caddy-Konfiguration, das Deployment-Skript und das Skript zur Datensicherung. Der Workflow [.github/workflows/deploy.yml](.github/workflows/deploy.yml) prüft Pull Requests und stellt gemergte Stände automatisch bereit. Die [Betriebsanleitung](app/docs/betrieb.md) beschreibt Deployment, Rollback, Logs und Sicherung auf dem Hetzner-Server. |

## Inhalte und Anforderungen

| Ablage | Was dort zu finden ist |
| --- | --- |
| [content/](content/) | Redaktionelle Entwürfe und Arbeitsmaterial, etwa zu KI-Audits, Datenanalyse und Softwareentwicklung. |
| [research/](research/) | Datierte Recherchen mit Quellen für die jeweiligen Aussagen. [research/SOURCES.md](research/SOURCES.md) sammelt Anlaufstellen für weitere Recherchen. |
| [mock/](mock/) | Klickbarer HTML-Designentwurf. |
| `requirements/` | Vorgesehene Ablage für neue Anforderungen als Markdown-Dateien (noch nicht angelegt). Das Format steht in [AGENTS.md](AGENTS.md). |
