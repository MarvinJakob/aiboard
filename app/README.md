# KI Perspektiven – Webseite

Öffentliche Webseite mit Themenseiten und Blog rund um KI. Grundlage sind die [Architektur](../requirements/ARCHITECTURE.md), das [Design-Konzept](../Design.md) und die [Tickets](../requirements/Tickets).

## Stand: Sprint 1

| Ticket | Umgesetzt |
|---|---|
| [1 Startseite](../requirements/Tickets/1%20Startseite.md) | Karussell (neuester Beitrag zuerst, Positionspunkte, Pfeile, Wischen, kein Autoplay), Themenkarten mit Blätterpfeilen, „Mehr aus dem Blog“. Ohne Beiträge bleiben die Themenkarten sichtbar. |
| [2 Navigation](../requirements/Tickets/2%20Navigation.md) | Gemeinsame Kopfzeile mit aufklappbarem Themenmenü (schließt per Klick daneben, `Esc` oder Tab) und Bloglink |
| [3 Themenseiten](../requirements/Tickets/3%20Themenseiten.md) | Drei Startthemen per Migration, Seite mit Titel, Einführung und zugeordneten Beiträgen, leerer Zustand |
| [4 Öffentlicher Blog](../requirements/Tickets/4%20%C3%96ffentlicher%20Blog.md) | Übersicht (neueste zuerst) und Beitragsseite. Entwürfe liefern überall `404` und fehlen in der Sitemap. |
| [7 Sprachwechsel](../requirements/Tickets/7%20Sprachwechsel.md) | DE/EN über das URL-Präfix, Sprache bleibt beim Navigieren erhalten und wird lokal gespeichert, Hinweis bei fehlender Übersetzung |

Noch nicht enthalten (Sprint 2 und 3): KI-Audit-Seiten und Quiz, Redaktionsfrontend, Anmeldung, Benutzerverwaltung, Bild-Upload. Bis dahin legt eine Entwicklungs-Migration Testbeiträge an (`DEV_SEED=true`), darunter ein Entwurf und Beiträge ohne englische Fassung.

## Aufbau

```
api/openapi.yaml        Verbindlicher Vertrag zwischen Frontend und Backend
frontend/               Öffentliche Webseite (React, TypeScript, Vite)
  src/api/schema.d.ts   Aus openapi.yaml erzeugt (nicht von Hand ändern)
backend/                Go-Modul
  cmd/server/           Einstiegspunkt: server, server healthcheck, server backup
  internal/api/         Aus openapi.yaml erzeugt (nicht von Hand ändern)
  internal/http/        Handler, Routing, Middleware
  internal/service/     Fachlogik: Sichtbarkeit und Sprachauswahl
  internal/store/       Datenzugriff, von sqlc aus queries.sql erzeugt
  internal/web/         Auslieferung des Frontends, Meta-Tags, Sitemap, robots.txt
  internal/media/       Bild-URLs (Upload folgt in Sprint 3)
  migrations/           Schema und Startthemen; dev/ enthält Testbeiträge
deploy/                 Caddyfile und Sicherungsskript
docs/adr/               Architekturentscheidungen
```

## Lokal entwickeln

Voraussetzungen: Go 1.27, Node 24 oder neuer. Docker ist nur für die Compose-Variante nötig.

**Gebaute Anwendung starten** (Frontend eingebettet, Meta-Tags vom Backend):

```bash
cd frontend && npm install && npm run build
```

```bash
cd backend && DEV_SEED=true DATABASE_PATH=../.build/dev.db go run ./cmd/server
```

Danach ist die Seite unter <http://localhost:8080> erreichbar. Unter PowerShell die Variablen vorher mit `$env:DEV_SEED="true"` setzen.

**Schnelle Iteration am Frontend:** Backend wie oben starten und zusätzlich

```bash
cd frontend && npm run dev
```

Vite leitet `/api` und `/media` an das Backend weiter (<http://localhost:5173>).

**Wie in Produktion, ohne TLS:**

```bash
docker compose -f compose.yaml -f compose.dev.yaml up --build
```

## Code erzeugen und testen

Nach Änderungen an `api/openapi.yaml` oder `backend/internal/store/queries.sql`:

```bash
cd backend && go generate ./...
```

```bash
cd frontend && npm run generate
```

Tests:

```bash
cd backend && go vet ./... && go test ./...
```

```bash
cd frontend && npm run typecheck && npm test
```

Mit `make` stehen dieselben Schritte als `make generate`, `make test`, `make build` und `make run` bereit.

Hinweise:

- `npm install` nutzt `legacy-peer-deps` (siehe `frontend/.npmrc`), weil npm 11.1 bei der Auflösung optionaler Peer-Abhängigkeiten abbricht.
- In `queries.sql` keine Umlaute verwenden. sqlc verrechnet sich sonst bei `sqlc.slice` in den Byte-Positionen.

## Konfiguration

Umgebungsvariablen, siehe [.env.example](.env.example):

| Variable | Standard | Zweck |
|---|---|---|
| `ADDR` | `:8080` | Adresse des HTTP-Servers |
| `DATABASE_PATH` | `data/app.db` | SQLite-Datei |
| `MEDIA_PATH` | `data/media` | Ablage hochgeladener Bilder |
| `PUBLIC_BASE_URL` | `http://localhost:8080` | Basis für canonical, hreflang, Open Graph und Sitemap |
| `DEV_SEED` | aus | Testbeiträge einspielen (nur Entwicklung) |
| `SERVE_MEDIA` | aus | `/media/*` ohne Caddy direkt ausliefern (nur Entwicklung) |

## Abweichungen von ARCHITECTURE.md

- **Datenmodell:** `topic_translations` hat zusätzlich `label` (Kurzname für Themen-Chips) und `summary` (eine Zeile Beschreibung für Themenmenü und Karten). Beides verlangt das Design-Konzept, das Datenmodell sah es nicht vor.
- **Karussell:** `GET /api/posts?featured=true` liefert höchstens drei Beiträge. An erster Stelle steht immer der zuletzt veröffentlichte Beitrag, auch wenn er nicht hervorgehoben ist (Akzeptanzkriterium von Anforderung 1). Danach folgen die neuesten hervorgehobenen Beiträge.
- **Kontoeinstieg:** Das Kontosymbol in der Kopfzeile fehlt noch. Es kommt mit der Anmeldung in Sprint 3 (Anforderung 6).
- **Schriften:** Es werden keine WOFF2-Dateien ausgeliefert, weil das Design-Konzept System-Schriften vorsieht.
- **Impressum und Datenschutz** sind Platzhalter in `frontend/src/content/legal` und müssen vor dem Livegang ersetzt werden.
