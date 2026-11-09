# Betrieb auf Hetzner

Die Anwendung läuft mit Docker Compose auf dem Hetzner-Cloud-Server `docker-ce-ubuntu-2gb-nbg1-1`. Caddy nimmt HTTPS-Anfragen an und leitet sie an das Backend weiter (siehe [ARCHITECTURE.md, Abschnitt 9](../../ARCHITECTURE.md) und [ADR 0007](adr/0007-docker-compose-auf-hetzner.md)).

| | |
|---|---|
| Server | `docker-ce-ubuntu-2gb-nbg1-1`, IPv4 `78.47.14.178`, Nürnberg, 1 vCPU, 2 GB RAM, 2 GB Swap |
| Adresse | <https://marvinjakob.de> seit 2026-11-09. `www.marvinjakob.de` und die frühere Adresse `78-47-14-178.sslip.io` leiten dorthin um, siehe [Domain](#domain). |
| Projektverzeichnis | `/opt/ki-web` |
| Container | `caddy` (TLS, Medien) und `backend` (Image `ghcr.io/marvinjakob/ki-web:<VERSION>`) |
| Daten | Docker-Volumes `ki-web_app_db` (SQLite), `ki-web_app_media` (Bilder), `ki-web_caddy_data` (Zertifikate, Zugriffsprotokoll) |

## Voraussetzungen

- **Server:** Ubuntu mit Docker CE und Compose-Plugin. Docker startet beim Systemstart (`systemctl is-enabled docker` ergibt `enabled`). Wegen des Image-Builds auf dem Server ist ein Swap von 2 GB eingerichtet (`/swapfile`, Eintrag in `/etc/fstab`).
- **Netz:** Die Ports 80 und 443 sind öffentlich erreichbar. Caddy holt das Zertifikat bei Let's Encrypt und leitet HTTP auf HTTPS um.
- **Domain:** Die Domain löst auf die IP des Servers auf.
- **Zugang:** SSH als `root` mit Schlüssel. Schlüssel und Tokens liegen nur lokal (z. B. in `.ssh/` und `.token/` im Projektordner, beide nicht im Repository) und auf dem Server in `/opt/ki-web/.env`.
- **Lokal:** Git, Bash und `ssh`. Unter Windows genügt Git Bash.

## Konfiguration

Die Datei `/opt/ki-web/.env` (Rechte `600`) enthält die Werte für den Betrieb. Vorlage: [.env.example](../.env.example).

| Variable | Wert | Zweck |
|---|---|---|
| `DOMAIN` | `marvinjakob.de` | Domain für Caddy und `PUBLIC_BASE_URL` |
| `REDIRECT_DOMAINS` | `"www.marvinjakob.de 78-47-14-178.sslip.io"` | Weitere Adressen, durch Leerzeichen getrennt. Caddy holt auch für sie Zertifikate und leitet dauerhaft (`301`) mit Pfad und Query auf `DOMAIN` um. Ohne Eintrag leitet nichts um. |
| `REGISTRY` | `ghcr.io/marvinjakob` | Präfix des Image-Namens |
| `VERSION` | z. B. `a1b2c3d` | Laufende Version, setzt `deploy.sh` |
| `PREVIOUS_VERSION` | z. B. `9d034c1` | Vorherige Version für den Rollback, setzt `deploy.sh` |
| `REQUIRE_LOGIN` | `true` | Zugangsschutz der Entwicklungswebseite; bleibt bis zur ausdrücklich beschlossenen öffentlichen Freigabe aktiv |

`DEV_SEED` wird im Betrieb nie gesetzt. `compose.yaml` setzt die Variable nicht, deshalb landen keine Testbeiträge und keine Testkonten in der Produktivdatenbank.

## Zugangsschutz bis zur öffentlichen Freigabe

In `/opt/ki-web/.env` bleibt ausdrücklich `REQUIRE_LOGIN=true` gesetzt. Compose verwendet auch ohne Eintrag den Wert `true`. Die Datei liegt außerhalb der versionierten Builds und wird beim Deployment nicht ersetzt; `deploy.sh` ändert nur die Versionsfelder. Ein Containerneustart übernimmt die bestehende Containerkonfiguration. Nach einer Änderung an `.env` ist dagegen `docker compose up -d --wait` nötig; `docker compose restart` liest die Umgebungsvariablen nicht neu ein.

Nach jedem Deployment und Neustart ohne Sitzung prüfen:

```bash
curl -sS -D - -o /dev/null https://marvinjakob.de/en/profil
curl -sS -D - https://marvinjakob.de/api/posts?lang=de
curl -fsS https://marvinjakob.de/robots.txt
```

Erwartet werden `303` zur Anmeldung mit internem Rücksprungziel, `401` ohne Inhaltsdaten und `Disallow: /`. Die Antworten des Backends tragen `X-Robots-Tag: noindex, nofollow`. Anmeldung samt Ressourcen und `/api/health` bleiben erreichbar. Mit einem gültigen Konto muss nach dem Login das ursprüngliche interne Ziel erscheinen; nach Abmeldung oder Sitzungsablauf ist es wieder gesperrt. Die Prüfung umfasst Startseite, Themen, Blog, Profil und AI Audit in beiden Sprachen. Medien liefert Caddy wie bisher direkt aus (siehe [README](../README.md#zugangsschutz-vor-dem-livegang)).

Erst nach ausdrücklich beschlossener öffentlicher Freigabe und Fertigstellung der Rechtstexte darf der Betreiber `REQUIRE_LOGIN=false` setzen und die Container mit `docker compose up -d --wait` aktualisieren. Vor einem Rollback muss auch die Zielversion den Zugangsschutz aus #49 enthalten. Der Betriebsnachweis für #54 steht in [zugangsschutz-abnahme.md](zugangsschutz-abnahme.md).

Aufbau des Projektverzeichnisses:

```
/opt/ki-web/
  .env               Konfiguration, nicht im Repository
  compose.yaml       aus der laufenden Version kopiert
  deploy/Caddyfile   aus der laufenden Version kopiert
  build/<VERSION>/   Inhalt von app/ des jeweiligen Commits, die fünf jüngsten bleiben erhalten
```

## Ersteinrichtung

Einmalig auf dem Server:

```bash
mkdir -p /opt/ki-web/build && cd /opt/ki-web
umask 077 && printf 'DOMAIN=marvinjakob.de\nREDIRECT_DOMAINS="www.marvinjakob.de"\nREGISTRY=ghcr.io/marvinjakob\nVERSION=\nPREVIOUS_VERSION=\n' > .env
```

Danach die erste Version wie unter [Neue Version bereitstellen](#neue-version-bereitstellen) ausliefern und das erste Admin-Konto anlegen. Das Passwort wird verdeckt abgefragt:

```bash
cd /opt/ki-web && docker compose exec -it backend /server user create --email ADRESSE --role admin
```

## Automatisches Deployment

Nach jedem Merge in `main` wird der aktuelle Stand von `main` automatisch bereitgestellt. Das übernimmt der Workflow [.github/workflows/deploy.yml](../../.github/workflows/deploy.yml):

1. **Prüfungen im Pull Request:** Bei jedem Pull Request in `main` (Öffnen, neue Commits) laufen `go vet`, `go test` sowie Typprüfung und Tests beider Frontends wie in [README.md](../README.md#code-erzeugen-und-testen). Die Schritte stehen in [.github/actions/pruefungen](../../.github/actions/pruefungen/action.yml).
2. **Stand bestimmen:** Nach einem Merge checkt der Deploy-Job den aktuellen Stand von `main` aus, nicht den Merge-Commit des Pull Requests. Läuft genau dieser Commit schon auf dem Server (`deploy/deploy.sh current`), endet der Lauf ohne Build und Neustart erfolgreich. Geschlossene, nicht gemergte Pull Requests lösen nichts aus.
3. **Prüfungen vor dem Deployment:** Der Deploy-Job führt dieselben Prüfungen für den auszuliefernden Stand aus. Schlägt eine Prüfung fehl, wird nicht deployed.
4. **Deployment:** Der Job ruft `deploy/deploy.sh release <Commit>` auf, wie unter [Neue Version bereitstellen](#neue-version-bereitstellen) beschrieben.
5. **Healthcheck:** Ist die neue Version nicht gesund, startet `deploy.sh` wieder die bisherige Version und der Lauf schlägt fehl. Anschließend prüft der Workflow `DEPLOY_URL/api/health` von außen.
6. **Protokoll:** Pull Request, sein Merge-Commit, der bereitgestellte Stand von `main`, die Image-Version und ob das Deployment übersprungen wurde, stehen im Protokoll und in der Zusammenfassung des Laufs unter *Actions*.

**Mehrere Merges kurz nacheinander:** Läufe für die Umgebung `production` laufen nacheinander (`concurrency`). Ein laufendes Deployment wird nicht abgebrochen. Sie starten aber nicht unbedingt in der Reihenfolge der Merges, und GitHub behält nur den zuletzt wartenden Lauf, ältere wartende Läufe werden abgebrochen („Canceling since a higher priority waiting request for deploy-production exists“). Das ist gewollt: Jeder Lauf liefert den Stand von `main` zu seinem Start aus. Deshalb enthält das letzte Deployment immer alle Merges, und ein später startender Lauf eines früheren Merges kann keine ältere Version ausliefern. Ein abgebrochener Lauf muss nicht wiederholt werden.

Einstellungen unter *Settings → Secrets and variables → Actions* des Repositorys:

| Name | Art | Inhalt |
|---|---|---|
| `DEPLOY_HOST` | Secret | `root@78.47.14.178` |
| `DEPLOY_SSH_KEY` | Secret | Privater Schlüssel nur für dieses Deployment (ed25519). Der öffentliche Teil steht auf dem Server in `/root/.ssh/authorized_keys`. |
| `DEPLOY_KNOWN_HOSTS` | Secret | Host-Schlüssel des Servers, z. B. aus `ssh-keyscan -t ed25519 78.47.14.178` nach Abgleich des Fingerprints |
| `DEPLOY_URL` | Variable | `https://marvinjakob.de` |

Eine Registry ist nicht nötig, weil das Image auf dem Server gebaut wird. Den Schlüssel bei Verdacht auf Missbrauch auf dem Server aus `authorized_keys` löschen und neu erzeugen.

## Neue Version bereitstellen

Ohne Pull Request, etwa für einen erneuten Versuch, lokal im Repository mit dem eingecheckten Stand des gewünschten Commits:

```bash
export DEPLOY_HOST=root@78.47.14.178 DEPLOY_SSH_KEY=.ssh/hetzner
app/deploy/deploy.sh release origin/main
```

Das Skript [deploy/deploy.sh](../deploy/deploy.sh)

1. überträgt `app/` des Commits per `git archive` nach `/opt/ki-web/build/<VERSION>`. `VERSION` ist der kurze Commit-Hash, ein drittes Argument legt einen anderen Namen fest.
2. baut darauf das Image `ghcr.io/marvinjakob/ki-web:<VERSION>` mit den Labels `org.opencontainers.image.revision` (Commit) und `org.opencontainers.image.version`.
3. kopiert `compose.yaml` und `deploy/Caddyfile` der Version nach `/opt/ki-web` und setzt `VERSION`.
4. startet die Container mit `docker compose up -d --wait` und prüft danach `https://DOMAIN/api/health`. Erst wenn beides erfolgreich ist, wird die bisherige Version zu `PREVIOUS_VERSION`.
5. startet bei einem Fehler wieder die bisherige Version und endet mit Fehler. Schlägt schon der Build fehl, läuft die bisherige Version ohne Unterbrechung weiter.
6. lädt die Caddy-Konfiguration neu, zeigt den Status und räumt Builds älter als die fünf jüngsten auf.

Ein Build dauert auf dem Server einige Minuten. Beim Austausch des Backend-Containers ist die Seite wenige Sekunden nicht erreichbar. Datenbank und Medien liegen in Volumes und bleiben erhalten.

Die Migrationen laufen beim Start des Backends automatisch.

## Rückkehr zur vorherigen Version

```bash
app/deploy/deploy.sh rollback
```

Das Skript startet `PREVIOUS_VERSION` mit dem vorhandenen Image und der zugehörigen `compose.yaml`. Jede der fünf jüngsten Versionen lässt sich auch gezielt starten:

```bash
app/deploy/deploy.sh switch VERSION
```

**Bei Datenbankänderungen:** Migrationen laufen nur vorwärts. Sie müssen additiv sein (neue Tabellen oder Spalten, keine Umbenennung, kein Löschen), damit die vorherige Version mit dem neuen Schema weiterläuft ([ADR 0007](adr/0007-docker-compose-auf-hetzner.md)). Vor einem Release mit neuer Datei in `backend/migrations/` deshalb:

1. Im Pull Request prüfen, dass die Migration additiv ist.
2. Vor dem Release eine Kopie der Datenbank anlegen:
   `cd /opt/ki-web && docker compose exec -T backend /server backup /data/db/vor-VERSION.db`
3. Ist eine Migration nicht additiv oder startet die alte Version nach dem Rollback nicht, die Kopie wie unter [Sicherung und Wiederherstellung](#sicherung-und-wiederherstellung) einspielen. Änderungen seit dem Release gehen dabei verloren.

## Healthcheck und Status

```bash
app/deploy/deploy.sh status
```

zeigt laufende und vorherige Version, den Commit des Images, den Zustand der Container und das Ergebnis von `https://DOMAIN/api/health`. `app/deploy/deploy.sh current` gibt nur den Commit der laufenden Version aus.

- Docker prüft das Backend alle 30 Sekunden mit `/server healthcheck`. Nach dem Start prüft es alle 2 Sekunden, bis der erste Check erfolgreich ist.
- Beide Container haben `restart: unless-stopped`. Nach einem Neustart des Servers starten sie automatisch, Caddy erst, wenn das Backend gesund ist.
- Von außen: `curl -fsS https://marvinjakob.de/api/health`

## Logs

Auf dem Server im Verzeichnis `/opt/ki-web`:

```bash
docker compose logs --since 1h backend
```

```bash
docker compose logs --since 1h caddy
```

```bash
docker compose exec caddy tail -n 50 /data/logs/access.log
```

Das Backend schreibt JSON-Zeilen. Docker hält je Container höchstens fünf Dateien mit 10 MB. Das Zugriffsprotokoll von Caddy kürzt IP-Adressen und behält sieben Tage.

## Sicherung und Wiederherstellung

**Stand: noch nicht eingerichtet.** Die nächtliche Sicherung wird später eingerichtet (Entscheidung vom 2026-11-09). Bis dahin vor riskanten Änderungen eine Kopie von Hand anlegen:

```bash
cd /opt/ki-web && ziel=/root/sicherung/$(date +%F-%H%M) && mkdir -p "$ziel" \
  && docker compose exec -T backend /server backup /data/db/backup.db \
  && docker compose cp backend:/data/db/backup.db "$ziel/app.db" \
  && docker compose cp backend:/data/media "$ziel/media"
```

Wiederherstellung einer solchen Kopie (`QUELLE` ist das Verzeichnis der Sicherung):

```bash
cd /opt/ki-web && docker compose stop backend
docker run --rm -v ki-web_app_db:/data/db -v ki-web_app_media:/data/media -v QUELLE:/src:ro alpine sh -c \
  'rm -f /data/db/app.db-wal /data/db/app.db-shm && cp /src/app.db /data/db/app.db && rm -rf /data/media/* && cp -a /src/media/. /data/media/ && chown -R 65532:65532 /data/db /data/media'
docker compose up -d --wait
```

Vorbereitet ist die automatische Sicherung mit restic in Hetzner Object Storage: [deploy/backup/backup.sh](../deploy/backup/backup.sh) mit den Variablen `RESTIC_*`, `AWS_*` und `HEARTBEAT_URL` aus [.env.example](../.env.example) und einem Cron-Eintrag. Wiederherstellung und Prüfung in einer getrennten Testablage folgen mit der Einrichtung.

## Domain

Die Webseite läuft seit 2026-11-09 unter `marvinjakob.de`. Die Domain liegt bei Strato. Die DNS-Einträge zeigen auf den Server:

| Name | Typ | Ziel |
|---|---|---|
| `marvinjakob.de` | A | `78.47.14.178` |
| `marvinjakob.de` | AAAA | `2a01:4f8:1c16:81b6::1`, die Adresse von `eth0`. Das Netz `2a01:4f8:1c16:81b6::` allein ist nicht erreichbar. |
| `www.marvinjakob.de` | CNAME | `marvinjakob.de` |

`www.marvinjakob.de` und die frühere Adresse `78-47-14-178.sslip.io` stehen in `REDIRECT_DOMAINS`. Sie leiten mit Pfad und Query dauerhaft auf `https://marvinjakob.de` um, damit alte Links weiter funktionieren. Die sslip.io-Adresse braucht keinen DNS-Eintrag, sie löst über den Dienst sslip.io auf die IP auf.

So wechselst du die Domain:

1. A-Eintrag und optional AAAA-Eintrag der neuen Domain auf den Server setzen.
2. In `/opt/ki-web/.env` `DOMAIN` ändern und die bisherige Domain in `REDIRECT_DOMAINS` aufnehmen.
3. `cd /opt/ki-web && docker compose up -d --wait` ausführen. Caddy holt die neuen Zertifikate. canonical-Links und Sitemap verwenden die neue Domain.
4. In GitHub die Variable `DEPLOY_URL` auf die neue Adresse setzen.
5. Prüfen: `curl -fsS https://DOMAIN/api/health` und `curl -sS -D - -o /dev/null https://www.DOMAIN/`. Erwartet wird `301` mit `Location: https://DOMAIN/`.
