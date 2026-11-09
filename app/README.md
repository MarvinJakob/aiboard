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

## Stand: Sprint 3

| Ticket | Umgesetzt |
|---|---|
| [6 Zugang zur Redaktion](https://github.com/MarvinJakob/aiboard/issues/6) | Kontosymbol in der Kopfzeile führt zu `/redaktion/anmelden`. Anmeldung mit E-Mail-Adresse und Passwort ohne Selbstregistrierung. Danach führt die Redaktion zur Beitragsliste und Admin-Konten zur Benutzerverwaltung. Sitzungen liegen in der Datenbank. Das Backend prüft Sitzung, Rolle und CSRF-Token bei jeder Redaktionsseite und jedem Aufruf unter `/api/admin`. Abmelden löscht die Sitzung serverseitig. |
| [5 Redaktionssystem](https://github.com/MarvinJakob/aiboard/issues/5) | Beitragsliste mit Entwürfen und Status unter `/redaktion`. Editor unter `/redaktion/beitraege/{id}` mit deutscher und englischer Fassung (Titel, Kurztext, Markdown-Text), Themenzuordnung, Karussell-Markierung und URL-Kürzel. Veröffentlichen verlangt Titel, Kurztext und Beitragstext in jeder angefangenen Fassung. Änderungen an veröffentlichten Beiträgen sind sofort öffentlich. Zurücknehmen braucht eine Bestätigung, bietet danach „Rückgängig“ und macht den Beitrag überall unsichtbar (`404`). |
| [11 Benutzerverwaltung der Redaktion](https://github.com/MarvinJakob/aiboard/issues/11) | Unter `/redaktion/benutzer` sehen Admin-Konten alle Konten mit Rolle und Status, legen Redaktionskonten mit eindeutiger E-Mail-Adresse und Startpasswort an und deaktivieren oder reaktivieren sie. Deaktivieren löscht alle Sitzungen des Kontos in derselben Transaktion. `/api/admin/users` antwortet Konten ohne Admin-Rolle mit `403`. |

Noch nicht enthalten: eine eigene Medienverwaltung (`/redaktion/medien`). Titelbilder lädt die Redaktion seit Ticket #25 direkt im Beitrag hoch. Eine Entwicklungs-Migration legt Testbeiträge und Testkonten an (`DEV_SEED=true`), darunter ein Entwurf und Beiträge ohne englische Fassung.

## Stand: Sprint 4

| Ticket | Umgesetzt |
|---|---|
| [23 Beitragsstatus und geplante Veröffentlichung](https://github.com/MarvinJakob/aiboard/issues/23) | Beitragsliste und Editor zeigen „In Arbeit“ oder „Veröffentlicht“. Im Editor lässt sich für Beiträge „In Arbeit“ ein Zeitpunkt in Ortszeit eintragen, ändern und entfernen (`PUT`/`DELETE /api/admin/posts/{id}/schedule`). Gespeichert wird UTC. Zeitpunkte in der Vergangenheit und unvollständige Beiträge lehnt das Backend mit `422` ab. Ein Hintergrundjob prüft alle 15 Sekunden und veröffentlicht fällige Beiträge. Bis dahin liefern sie `404` und fehlen in der Sitemap. |
| [20 Helle und dunkle Darstellung](https://github.com/MarvinJakob/aiboard/issues/20) | Schalter „Dunkle Darstellung“ in der Kopfzeile der Webseite, auf der Anmeldeseite und in der Kopfzeile der Redaktion. Die Wahl gilt sofort und für beide Frontends, sie bleibt im Browser gespeichert (`localStorage`, Schlüssel `ki-perspektiven.theme`). Ohne gespeicherte Wahl gilt die Systemeinstellung, sonst hell. `public/theme.js` setzt `data-theme` vor dem ersten Zeichnen, damit nichts aufblitzt. |
| [21 AI Audit als eigener Navigationseintrag](https://github.com/MarvinJakob/aiboard/issues/21) | Eintrag „AI Audit“ in der Hauptnavigation neben „Themen“ und „Blog“, führt zur Audit-Übersicht in der aktuellen Sprache. Das Themenmenü zeigt das Audit nicht mehr. Auf der Übersicht und allen Dimensionsseiten ist „AI Audit“ aktiv, „Themen“ nicht. Die URLs unter `/{lang}/themen/ai-audit` bleiben unverändert. |
| [24 Beitragsaktionen in der Beitragsübersicht](https://github.com/MarvinJakob/aiboard/issues/24) | Jede Zeile der Beitragsliste bietet „Veröffentlichen“ (nur für Entwürfe) und „Löschen“, beschriftet mit dem Beitragstitel. Fehlen Texte, bleibt der Beitrag unverändert und die Übersicht nennt den Grund. Löschen verlangt eine Bestätigung in der Zeile und nutzt `DELETE /api/admin/posts/{id}`. Sprachfassungen und Themenzuordnungen entfernt die Datenbank mit (`ON DELETE CASCADE`). |
| [25 Titelbild für Beiträge](https://github.com/MarvinJakob/aiboard/issues/25) | Im Editor lässt sich pro Beitrag ein Titelbild (JPEG, PNG oder WebP bis 5 MB) hochladen, in der Vorschau ansehen, ersetzen und entfernen (`PUT`/`DELETE /api/admin/posts/{id}/cover`). Je Sprachfassung gibt es einen Alternativtext; ohne ihn lässt sich der Beitrag nicht veröffentlichen, und öffentlich erscheint das Bild erst mit Alternativtext. Das Backend erkennt den Typ am Inhalt, kodiert neu (ohne EXIF/GPS), vergibt den Dateinamen und legt die Varianten 480, 960, 1600 und `og` (1200 × 630) an. Die Beitragsseite zeigt das Bild unter der Überschrift mit festem Seitenverhältnis; `og:image` zeigt auf die `og`-Variante. |
| [22 Anwendung auf Hetzner mit Docker deployen](https://github.com/MarvinJakob/aiboard/issues/22) | Die Anwendung läuft mit Docker Compose auf `docker-ce-ubuntu-2gb-nbg1-1` unter <https://78-47-14-178.sslip.io>. `deploy/deploy.sh` baut das Image eines Commits auf dem Server, startet es mit Healthcheck und kehrt per `rollback` zur vorherigen Version zurück. Die [Betriebsanleitung](docs/betrieb.md) beschreibt Voraussetzungen, Konfiguration, Deployment, Healthcheck, Logs, Rollback und Sicherung. Die automatische Sicherung ist noch nicht eingerichtet. |
| [45 Automatisches Deployment nach Pull-Request-Merge](https://github.com/MarvinJakob/aiboard/issues/45) | `.github/workflows/deploy.yml` führt bei jedem Pull Request in `main` die Prüfungen aus. Nach einem Merge stellt es den Merge-Commit mit `deploy/deploy.sh` auf dem Hetzner-Server bereit, nacheinander und mit Healthcheck. Ist die neue Version nicht gesund, läuft wieder die bisherige. Secrets und Ablauf: [Betriebsanleitung](docs/betrieb.md#automatisches-deployment). |

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
  internal/audit/       Inhalte des KI-Audits (content.json, eingebettet) und ihre Prüfung
  internal/service/     Fachlogik: Sichtbarkeit, Sprachauswahl, Konten und Sitzungen
  internal/store/       Datenzugriff, von sqlc aus queries.sql erzeugt
  internal/web/         Auslieferung beider Frontends mit Zugriffskontrolle, Meta-Tags, Sitemap, robots.txt
  internal/media/       Bild-URLs, Prüfen, Neukodieren und Speichern hochgeladener Bilder
  migrations/           Schema und Startthemen; dev/ enthält Testbeiträge und Testkonten
deploy/                 Caddyfile, Deployment-Skript (deploy.sh) und Sicherungsskript
docs/betrieb.md         Betriebsanleitung für den Hetzner-Server
docs/adr/               Architekturentscheidungen
docs/audit-abnahme.md   Regeln und Antwortsätze für die Abnahme des Quiz
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
- **Beiträge:** Leere Sprachfassungen werden nicht gespeichert. Zum Speichern eines Entwurfs reicht ein Titel. Ein veröffentlichter Beitrag lässt sich nur vollständig speichern, damit die öffentliche Seite nie leer ist. Erneutes Veröffentlichen nach dem Zurücknehmen behält das erste Veröffentlichungsdatum. Fehlt das URL-Kürzel, entsteht es aus dem Titel (Umlaute werden umschrieben, bei Dopplungen folgt eine Nummer).
- **Benutzerverwaltung:** Über die Oberfläche entstehen nur Konten mit der Rolle `editor`. Weitere Admin-Konten legt `server user create --role admin` an. Das eigene Konto lässt sich nicht deaktivieren, damit sich ein Admin nicht versehentlich aussperrt. Startpasswörter brauchen mindestens 10 Zeichen. Eine Pflicht zum Ändern des Startpassworts gibt es noch nicht.
- **Anmeldeversuche:** Nach 10 Fehlversuchen von einer IP-Adresse sperrt das Backend weitere Versuche für 15 Minuten (`429`).
- **Status „In Arbeit“:** Intern heißt der Status weiter `draft`, die Redaktion zeigt „In Arbeit“. Ein geplanter Beitrag bleibt bis zum Zeitpunkt `draft` und erhält dann den geplanten Zeitpunkt als Veröffentlichungsdatum, auch wenn er früher schon einmal veröffentlicht war (Ticket #31). Nur manuelles Wiederveröffentlichen („Rückgängig“) behält das erste Datum. Manuelles Veröffentlichen entfernt einen geplanten Zeitpunkt. Solange ein Zeitpunkt geplant ist, lässt sich der Beitrag nur vollständig speichern.
- **AI Audit in Themenkarten und Pfadnavigation:** Die Themenkarten der Startseite und die Pfadnavigation („Start / Themen / AI Audit für Unternehmen“) führen das Audit weiter als Thema. Ticket #21 verlangt die Änderung nur für das Themenmenü.
- **Kopfzeile auf schmalen Bildschirmen:** Bis 600 px Breite hat die Kopfzeile zwei Zeilen: oben Marke, Sprache, Darstellung und Konto, darunter die Navigation. Der Darstellungsschalter und der Eintrag „AI Audit“ passen auf 375 px nicht mehr zusammen in eine Zeile.
- **Darstellungsschalter als eigene Datei:** `theme.js` liegt in `public/` statt inline im HTML, weil die Content-Security-Policy in `deploy/Caddyfile` Inline-Skripte verbietet.
- **Titelbilder:** Erlaubt sind höchstens 5 MB (Ticket #25) statt der 10 MB aus ARCHITECTURE.md, Abschnitt 7. Ein Titelbild gehört genau zu einem Beitrag: Beim Ersetzen oder Entfernen löscht das Backend das alte Bild samt Dateien sofort, statt auf einen späteren Aufräumjob zu warten. Die Alternativtexte bleiben beim Ersetzen erhalten. Lokal ohne Caddy liefert `SERVE_MEDIA=true` die Bilder unter `/media/*` aus.
- **Zeitumstellung:** Der Editor nennt zu jedem Termin Zeitzone und UTC. Eine wegen der Sommerzeit nicht existierende Uhrzeit lehnt er ab, bei einer doppelt vorkommenden Uhrzeit muss die Redaktion wählen, welche gilt (Ticket #32).
- **Schriften:** Es werden keine WOFF2-Dateien ausgeliefert, weil das Design-Konzept System-Schriften vorsieht.
- **Impressum und Datenschutz** sind Platzhalter in `frontend/src/content/legal` und müssen vor dem Livegang ersetzt werden.
- **Images und Domain im Betrieb:** Das Image wird auf dem Server gebaut und nicht aus einer Registry gezogen. `REGISTRY` legt nur den Namen fest. Statt einer eigenen Domain dient vorläufig `78-47-14-178.sslip.io`. Details in der [Betriebsanleitung](docs/betrieb.md).
- **KI-Audit-Inhalte:** Die Inhalte stehen nicht in der Datenbank, sondern in `backend/internal/audit/content.json` (ADR 0009). Eine Dimension erscheint nur mit `"released": true`. Die Texte folgen `content/KI Audit.docx`. Daraus abgeleitet sind die Kurzbeschreibungen und die Vorteile je Dimension, die das Dokument nicht ausdrücklich nennt. Marvin Jakob hat die Texte aller acht Dimensionsseiten einschließlich der dokumentierten Abweichungen am 2026-11-06 fachlich freigegeben; Textstand und Nachweis stehen in [docs/audit-dimensionsfreigabe.md](docs/audit-dimensionsfreigabe.md) (Ticket #29).
- **Reifegrad 0:** Ist Stufe 1 nicht erfüllt, zeigt das Quiz „Nicht angewendet“. Anforderung 10 nennt nur die drei Reifegrade, das Fachdokument sieht diesen Fall aber vor.
- **Bedingte Prüffragen:** Fragen wie „Bei Agenten: …“ lassen sich mit „Trifft nicht zu“ beantworten und gelten dann als erfüllt (Fachdokument: begründete Nichtanwendbarkeit).
- **Sprache der Audit-Inhalte:** Die Audit-Inhalte liegen nur auf Deutsch vor. Unter `/en/…` erscheint die deutsche Fassung mit Hinweis, wie bei nicht übersetzten Beiträgen. Die Bedienelemente sind übersetzt.
- **Redaktionelle Anpassungen am Fachdokument:** „Gouvernance“ heißt „Governance“, „EU KI Act“ heißt „EU AI Act“. Die Einleitungen von „Governance und Compliance“ und „Agenten und Prozesse“ nennen jetzt den Namen ihrer Dimension (im Dokument „Recht und Compliance“ bzw. „Prozesse“). Einige Einleitungen sind gekürzt, bedingte Fragen beginnen einheitlich mit ihrer Voraussetzung.
