# Betrieb auf Hetzner

Die Anwendung läuft mit Docker Compose auf dem Hetzner-Cloud-Server `docker-ce-ubuntu-2gb-nbg1-1`. Caddy nimmt HTTPS-Anfragen an und leitet sie an das Backend weiter (siehe [ARCHITECTURE.md, Abschnitt 9](../../ARCHITECTURE.md) und [ADR 0007](adr/0007-docker-compose-auf-hetzner.md)).

| | |
|---|---|
| Server | `docker-ce-ubuntu-2gb-nbg1-1`, IPv4 `78.47.14.178`, Nürnberg, 1 vCPU, 2 GB RAM, 2 GB Swap |
| Adresse | <https://78-47-14-178.sslip.io> (vorläufig, siehe [Domain wechseln](#domain-wechseln)) |
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
| `DOMAIN` | `78-47-14-178.sslip.io` | Domain für Caddy und `PUBLIC_BASE_URL` |
| `REGISTRY` | `ghcr.io/marvinjakob` | Präfix des Image-Namens |
| `VERSION` | z. B. `a1b2c3d` | Laufende Version, setzt `deploy.sh` |
| `PREVIOUS_VERSION` | z. B. `9d034c1` | Vorherige Version für den Rollback, setzt `deploy.sh` |

`DEV_SEED` wird im Betrieb nie gesetzt. `compose.yaml` setzt die Variable nicht, deshalb landen keine Testbeiträge und keine Testkonten in der Produktivdatenbank.

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
umask 077 && printf 'DOMAIN=78-47-14-178.sslip.io\nREGISTRY=ghcr.io/marvinjakob\nVERSION=\nPREVIOUS_VERSION=\n' > .env
```

Danach die erste Version wie unter [Neue Version bereitstellen](#neue-version-bereitstellen) ausliefern und das erste Admin-Konto anlegen. Das Passwort wird verdeckt abgefragt:

```bash
cd /opt/ki-web && docker compose exec -it backend /server user create --email ADRESSE --role admin
```

## Neue Version bereitstellen

Lokal im Repository, mit dem eingecheckten Stand des gewünschten Commits:

```bash
export DEPLOY_HOST=root@78.47.14.178 DEPLOY_SSH_KEY=.ssh/hetzner
app/deploy/deploy.sh release origin/main
```

Das Skript [deploy/deploy.sh](../deploy/deploy.sh)

1. überträgt `app/` des Commits per `git archive` nach `/opt/ki-web/build/<VERSION>`. `VERSION` ist der kurze Commit-Hash, ein drittes Argument legt einen anderen Namen fest.
2. baut darauf das Image `ghcr.io/marvinjakob/ki-web:<VERSION>` mit den Labels `org.opencontainers.image.revision` (Commit) und `org.opencontainers.image.version`.
3. kopiert `compose.yaml` und `deploy/Caddyfile` der Version nach `/opt/ki-web`, merkt sich die bisherige Version als `PREVIOUS_VERSION` und setzt `VERSION`.
4. startet die Container mit `docker compose up -d --wait`. Das Kommando endet erst, wenn der Healthcheck des Backends erfolgreich ist, sonst mit Fehler.
5. lädt die Caddy-Konfiguration neu, zeigt den Status und räumt Builds älter als die fünf jüngsten auf.

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

zeigt laufende und vorherige Version, den Commit des Images, den Zustand der Container und das Ergebnis von `https://DOMAIN/api/health`.

- Docker prüft das Backend alle 30 Sekunden mit `/server healthcheck`. Nach dem Start prüft es alle 2 Sekunden, bis der erste Check erfolgreich ist.
- Beide Container haben `restart: unless-stopped`. Nach einem Neustart des Servers starten sie automatisch, Caddy erst, wenn das Backend gesund ist.
- Von außen: `curl -fsS https://78-47-14-178.sslip.io/api/health`

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

## Domain wechseln

Die Adresse `78-47-14-178.sslip.io` braucht keinen DNS-Eintrag, sie löst über den Dienst sslip.io auf die IP auf. Für eine eigene Domain:

1. A-Eintrag auf `78.47.14.178` setzen (optional AAAA auf `2a01:4f8:1c16:81b6::1`).
2. In `/opt/ki-web/.env` `DOMAIN` ändern.
3. `app/deploy/deploy.sh switch VERSION` mit der laufenden Version ausführen. Caddy holt das neue Zertifikat, canonical-Links und Sitemap verwenden die neue Domain.
