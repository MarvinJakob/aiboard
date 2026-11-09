# Betriebsprüfung des Zugangsschutzes (#54)

Geprüft am 2026-11-09 auf <https://78-47-14-178.sslip.io>.
Bereitgestellter Commit: `585a10c9a537c222485f7920fffa4ed6be314af8` (PR #50, bestehende Umsetzung aus #49).

## Konfiguration

Der laufende Backend-Container hatte bereits `REQUIRE_LOGIN=true`. Der Wert wurde zusätzlich ausdrücklich in `/opt/ki-web/.env` hinterlegt (Dateirechte `600`). Die bestehende Compose-Konfiguration reicht ihn an das Backend weiter. An der Anwendungslogik war für den Betrieb keine Korrektur erforderlich.

## Erfolgreiche Live-Prüfungen

- Ohne Sitzung: `/`, `/de`, `/en` sowie Blog, Profil, Themen und AI Audit einschließlich Dimensionslinks in beiden Sprachen liefern `303` zur Anmeldung mit dem ursprünglichen Pfad als `weiter`. Im Antworttext ist kein geschütztes Frontend enthalten.
- Die Inhalts-APIs für Themen, Beiträge und Audit liefern ohne Sitzung in beiden Sprachen `401`. Die geprüften Seiten- und API-Antworten tragen `X-Robots-Tag: noindex, nofollow`.
- `robots.txt` liefert `User-agent: *` und `Disallow: /`. Anmeldung, deren referenzierte Ressourcen und Healthcheck bleiben erreichbar.
- Anmeldung mit vorhandenem Betreiberkonto: Startseite, Blog, Profil und Audit in beiden Sprachen liefern `200`. Die Anmeldung führt zu internen Rücksprungzielen einschließlich Query-Parametern zurück. Absolute externe Ziele, `//host` und `/\host` führen ausschließlich zur internen rollenabhängigen Startseite.
- Nach Abmeldung wird auch das vorherige Sitzungscookie abgewiesen. Für die Ablaufprüfung wurde ausschließlich eine neue Prüfsitzung anhand ihres Hashs in der Datenbank auf einen Zeitpunkt in der Vergangenheit gesetzt. Danach waren Seiten und APIs erneut gesperrt.
- Nach `docker compose restart backend` und anschließendem Healthcheck wurden die Prüfungen erfolgreich wiederholt.
- Nach erneuter Bereitstellung derselben Version mit `deploy.sh switch 585a10c` wurden die Prüfungen erneut erfolgreich wiederholt. Dabei wurden Compose-Datei und Caddy-Konfiguration aus dem versionierten Build übernommen. Der Schutz blieb aktiv.

Die HTTP-Prüfungen verfolgten Weiterleitungen bewusst nicht automatisch und werteten Status, Ziel, Header und Antworttext aus. Es wurden keine Inhalte oder fremden Sitzungen verändert. Zugangsdaten und Sitzungstokens sind nicht Teil des Nachweises.

## Wiederholbare Regressionstests

`backend/internal/http/gate_test.go` ergänzt die bestehenden Zugangsschutztests um die Seitenmatrix DE/EN und den Zugriff nach serverseitigem Sitzungsablauf. Die bestehenden Frontendtests in `frontend-redaktion/src/access.test.tsx` prüfen die tatsächliche Zielwahl nach dem Absenden des Anmeldeformulars und die Ablehnung externer Ziele.

Ausgeführt gemäß [README](../README.md#code-erzeugen-und-testen): Backend `go vet ./...` und `go test ./...`; Redaktionsfrontend `npm run typecheck` und `npm test`. Ergebnisse und geprüfter Feature-Commit werden am [Ticket #54](https://github.com/MarvinJakob/aiboard/issues/54) dokumentiert.

Der Zugangsschutz bleibt bis zur ausdrücklichen öffentlichen Freigabe aktiv. Dauerhafte Konfiguration und Kontrollschritte stehen in der [Betriebsanleitung](betrieb.md#zugangsschutz-bis-zur-öffentlichen-freigabe).
