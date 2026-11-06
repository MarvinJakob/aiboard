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

## Stand: Sprint 3

| Ticket | Umgesetzt |
|---|---|
| [6 Zugang zur Redaktion](https://github.com/MarvinJakob/aiboard/issues/6) | Kontosymbol in der Kopfzeile führt zu `/redaktion/anmelden`. Anmeldung mit E-Mail-Adresse und Passwort ohne Selbstregistrierung. Danach führt die Redaktion zur Beitragsliste und Admin-Konten zur Benutzerverwaltung. Sitzungen liegen in der Datenbank. Das Backend prüft Sitzung, Rolle und CSRF-Token bei jeder Redaktionsseite und jedem Aufruf unter `/api/admin`. Abmelden löscht die Sitzung serverseitig. |

Noch nicht enthalten: KI-Audit-Seiten und Quiz (Sprint 2, eigener Pull Request), Bild-Upload. Eine Entwicklungs-Migration legt Testbeiträge und Testkonten an (`DEV_SEED=true`), darunter ein Entwurf und Beiträge ohne englische Fassung.

## Aufbau

```
api/openapi.yaml        Verbindlicher Vertrag zwischen Frontend und Backend
frontend/               Öffentliche Webseite (React, TypeScript, Vite)
  src/api/schema.d.ts   Aus openapi.yaml erzeugt (nicht von Hand ändern)
frontend-redaktion/     Redaktionsfrontend unter /redaktion, eigene Vite-Anwendung
  src/api/schema.d.ts   Aus openapi.yaml erzeugt (nicht von Hand ändern)
backend/                Go-Modul
  cmd/server/           Einstiegspunkt: server, server healthcheck, server backup, server user create
  internal/auth/        Passwort-Hashing (Argon2id), Sitzungs-Tokens, Begrenzung der Anmeldeversuche
  internal/api/         Aus openapi.yaml erzeugt (nicht von Hand ändern)
  internal/http/        Handler, Routing, Middleware
  internal/service/     Fachlogik: Sichtbarkeit, Sprachauswahl, Konten und Sitzungen
  internal/store/       Datenzugriff, von sqlc aus queries.sql erzeugt
  internal/web/         Auslieferung beider Frontends mit Zugriffskontrolle, Meta-Tags, Sitemap, robots.txt
  internal/media/       Bild-URLs (Upload folgt in Sprint 3)
  migrations/           Schema und Startthemen; dev/ enthält Testbeiträge und Testkonten
deploy/                 Caddyfile und Sicherungsskript
docs/adr/               Architekturentscheidungen
```

## Lokal entwickeln

Voraussetzungen: Go 1.27, Node 24 oder neuer. Docker ist nur für die Compose-Variante nötig.

**Gebaute Anwendung starten** (beide Frontends eingebettet, Meta-Tags vom Backend):

```bash
cd frontend && npm install && npm run build
```

```bash
cd frontend-redaktion && npm install && npm run build
```

```bash
cd backend && DEV_SEED=true DATABASE_PATH=../.build/dev.db go run ./cmd/server
```

Danach ist die Seite unter <http://localhost:8080> erreichbar. Unter PowerShell die Variablen vorher mit `$env:DEV_SEED="true"` setzen.

**Schnelle Iteration am Frontend:** Backend wie oben starten und zusätzlich

```bash
cd frontend && npm run dev
```

Vite leitet `/api` und `/media` an das Backend weiter (<http://localhost:5173>). Das Redaktionsfrontend startet ebenso mit `npm run dev` im Ordner `frontend-redaktion` und ist dann unter <http://localhost:5174/redaktion/> erreichbar.

**Testkonten** (nur mit `DEV_SEED=true`):

| E-Mail-Adresse | Passwort | Rolle |
|---|---|---|
| `redaktion@example.test` | `redaktion-test` | `editor`, landet nach der Anmeldung in der Beitragsliste |
| `admin@example.test` | `admin-test-123` | `admin`, landet nach der Anmeldung in der Benutzerverwaltung |

**Erstes Admin-Konto bei der Inbetriebnahme:** Das Passwort wird verdeckt abgefragt oder aus `USER_PASSWORD` gelesen.

```bash
docker compose exec -it backend /server user create --email admin@example.de --role admin
```

Lokal ohne Docker: `go run ./cmd/server user create --email admin@example.de` im Ordner `backend`. Weitere Konten legt ein Admin-Konto im Redaktionsfrontend an.

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

```bash
cd frontend-redaktion && npm run generate
```

Tests:

```bash
cd backend && go vet ./... && go test ./...
```

```bash
cd frontend && npm run typecheck && npm test
```

```bash
cd frontend-redaktion && npm run typecheck && npm test
```

Mit `make` stehen dieselben Schritte als `make generate`, `make test`, `make build` und `make run` bereit.

Hinweise:

- `npm install` nutzt in beiden Frontends `legacy-peer-deps` (siehe `.npmrc`), weil npm 11.1 bei der Auflösung optionaler Peer-Abhängigkeiten abbricht.
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
| `TRUST_PROXY` | aus | IP-Adresse für die Begrenzung der Anmeldeversuche aus `X-Forwarded-For` lesen. Nur hinter Caddy setzen (in `compose.yaml` aktiv). |
| `USER_PASSWORD` | – | Nur für `server user create`: Passwort ohne Abfrage übergeben |

Das Sitzungscookie erhält das Attribut `Secure`, wenn `PUBLIC_BASE_URL` mit `https://` beginnt.

## Abweichungen von ARCHITECTURE.md

- **Datenmodell:** `topic_translations` hat zusätzlich `label` (Kurzname für Themen-Chips) und `summary` (eine Zeile Beschreibung für Themenmenü und Karten). Beides verlangt das Design-Konzept, das Datenmodell sah es nicht vor.
- **Karussell:** `GET /api/posts?featured=true` liefert höchstens drei Beiträge. An erster Stelle steht immer der zuletzt veröffentlichte Beitrag, auch wenn er nicht hervorgehoben ist (Akzeptanzkriterium von Anforderung 1). Danach folgen die neuesten hervorgehobenen Beiträge.
- **Kontoeinstieg:** Das Kontosymbol führt zur Anmeldeseite `/redaktion/anmelden` im Redaktionsfrontend statt zu einem Dialog auf der öffentlichen Seite (Design-Konzept). So verlangt es Anforderung 6, und das Sitzungscookie entsteht nur in der Redaktion.
- **Sitzungen:** Das Cookie enthält einen zufälligen Wert mit 256 Bit, die Datenbank speichert nur dessen SHA-256-Hash. Ein `SESSION_SECRET` ist dafür nicht nötig und entfällt. Eine Sitzung gilt 12 Stunden ab der Anmeldung. Das CSRF-Token gehört zur Sitzung und kommt aus `GET /api/auth/me`. Zusätzlich lehnt das Backend schreibende Aufrufe mit fremdem `Origin` ab.
- **Rollen:** Admin-Konten dürfen neben der Benutzerverwaltung auch Beiträge verwalten. Redaktionskonten (`editor`) haben keinen Zugriff auf die Benutzerverwaltung.
- **Anmeldeversuche:** Nach 10 Fehlversuchen von einer IP-Adresse sperrt das Backend weitere Versuche für 15 Minuten (`429`).
- **Schriften:** Es werden keine WOFF2-Dateien ausgeliefert, weil das Design-Konzept System-Schriften vorsieht.
- **Impressum und Datenschutz** sind Platzhalter in `frontend/src/content/legal` und müssen vor dem Livegang ersetzt werden.
