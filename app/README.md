# KI Perspektiven – Webseite

Öffentliche Webseite mit Themenseiten und Blog rund um KI. Grundlage sind die [Architektur](../requirements/ARCHITECTURE.md), das [Design-Konzept](../Design.md) und die [Tickets](../requirements/Tickets).

## Stand: Sprint 2

| Ticket | Umgesetzt |
|---|---|
| [1 Startseite](../requirements/Tickets/1%20Startseite.md) | Karussell (neuester Beitrag zuerst, Positionspunkte, Pfeile, Wischen, kein Autoplay), Themenkarten mit Blätterpfeilen, „Mehr aus dem Blog“. Ohne Beiträge bleiben die Themenkarten sichtbar. |
| [2 Navigation](../requirements/Tickets/2%20Navigation.md) | Gemeinsame Kopfzeile mit aufklappbarem Themenmenü (schließt per Klick daneben, `Esc` oder Tab) und Bloglink |
| [3 Themenseiten](../requirements/Tickets/3%20Themenseiten.md) | Drei Startthemen per Migration, Seite mit Titel, Einführung und zugeordneten Beiträgen, leerer Zustand |
| [4 Öffentlicher Blog](../requirements/Tickets/4%20%C3%96ffentlicher%20Blog.md) | Übersicht (neueste zuerst) und Beitragsseite. Entwürfe liefern überall `404` und fehlen in der Sitemap. |
| [7 Sprachwechsel](../requirements/Tickets/7%20Sprachwechsel.md) | DE/EN über das URL-Präfix, Sprache bleibt beim Navigieren erhalten und wird lokal gespeichert, Hinweis bei fehlender Übersetzung |
| [8 KI-Audit-Übersicht](../requirements/Tickets/8%20KI-Audit-%C3%9Cbersicht.md) | Die Themenseite „AI Audit für Unternehmen“ zeigt Einführung, die drei Reifegrade und alle freigegebenen Dimensionen mit Link zu ihrer Seite. |
| [9 Seiten für die Audit-Dimensionen](../requirements/Tickets/9%20Seiten%20f%C3%BCr%20die%20Audit-Dimensionen.md) | Acht Dimensionen aus `content/KI Audit.docx` unter `/{lang}/themen/ai-audit/{dimension}`, je mit Einführung, hervorgehobenen Vorteilen und den Reifegraden Einfach, Strukturiert und Intelligent. Meta-Tags und Sitemap sind ergänzt. |
| [10 Quiz zur Selbsteinschätzung](../requirements/Tickets/10%20Quiz%20zur%20Selbsteinsch%C3%A4tzung.md) | Ja/Nein-Prüffragen je Dimension, Hinweis auf offene Fragen, Ergebnis mit nächstem Schritt, Auswertung nur im Browser. Regeln und Antwortsätze für die Abnahme: [docs/audit-abnahme.md](docs/audit-abnahme.md). |

Noch nicht enthalten (Sprint 3): Redaktionsfrontend, Anmeldung, Benutzerverwaltung, Bild-Upload. Bis dahin legt eine Entwicklungs-Migration Testbeiträge an (`DEV_SEED=true`), darunter ein Entwurf und Beiträge ohne englische Fassung.

## Aufbau

```
api/openapi.yaml        Verbindlicher Vertrag zwischen Frontend und Backend
frontend/               Öffentliche Webseite (React, TypeScript, Vite)
  src/api/schema.d.ts   Aus openapi.yaml erzeugt (nicht von Hand ändern)
backend/                Go-Modul
  cmd/server/           Einstiegspunkt: server, server healthcheck, server backup
  internal/api/         Aus openapi.yaml erzeugt (nicht von Hand ändern)
  internal/http/        Handler, Routing, Middleware
  internal/audit/       Inhalte des KI-Audits (content.json, eingebettet) und ihre Prüfung
  internal/service/     Fachlogik: Sichtbarkeit und Sprachauswahl
  internal/store/       Datenzugriff, von sqlc aus queries.sql erzeugt
  internal/web/         Auslieferung des Frontends, Meta-Tags, Sitemap, robots.txt
  internal/media/       Bild-URLs (Upload folgt in Sprint 3)
  migrations/           Schema und Startthemen; dev/ enthält Testbeiträge
deploy/                 Caddyfile und Sicherungsskript
docs/adr/               Architekturentscheidungen
docs/audit-abnahme.md   Regeln und Antwortsätze für die Abnahme des Quiz
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
- **KI-Audit-Inhalte:** Die Inhalte stehen nicht in der Datenbank, sondern in `backend/internal/audit/content.json` (ADR 0009). Eine Dimension erscheint nur mit `"released": true`. Die Texte folgen `content/KI Audit.docx`. Daraus abgeleitet sind die Kurzbeschreibungen und die Vorteile je Dimension, die das Dokument nicht ausdrücklich nennt. Sie müssen fachlich bestätigt werden.
- **Reifegrad 0:** Ist Stufe 1 nicht erfüllt, zeigt das Quiz „Nicht angewendet“. Anforderung 10 nennt nur die drei Reifegrade, das Fachdokument sieht diesen Fall aber vor.
- **Bedingte Prüffragen:** Fragen wie „Bei Agenten: …“ lassen sich mit „Trifft nicht zu“ beantworten und gelten dann als erfüllt (Fachdokument: begründete Nichtanwendbarkeit).
- **Sprache der Audit-Inhalte:** Die Audit-Inhalte liegen nur auf Deutsch vor. Unter `/en/…` erscheint die deutsche Fassung mit Hinweis, wie bei nicht übersetzten Beiträgen. Die Bedienelemente sind übersetzt.
- **Redaktionelle Anpassungen am Fachdokument:** „Gouvernance“ heißt „Governance“, „EU KI Act“ heißt „EU AI Act“. Die Einleitungen von „Governance und Compliance“ und „Agenten und Prozesse“ nennen jetzt den Namen ihrer Dimension (im Dokument „Recht und Compliance“ bzw. „Prozesse“). Einige Einleitungen sind gekürzt, bedingte Fragen beginnen einheitlich mit ihrer Voraussetzung.
