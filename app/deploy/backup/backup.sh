#!/usr/bin/env bash
# Nächtliche Sicherung (ARCHITECTURE.md, Abschnitt 9). Aufruf per Cron im Projektverzeichnis auf dem Server:
#   15 3 * * * cd /opt/ki-web && ./deploy/backup/backup.sh >> /var/log/ki-web-backup.log 2>&1
# Benötigt restic sowie RESTIC_REPOSITORY, RESTIC_PASSWORD, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY
# und optional HEARTBEAT_URL in .env.
set -euo pipefail

cd "$(dirname "$0")/../.."
set -a; . ./.env; set +a

STAGING=$(mktemp -d)
trap 'rm -rf "$STAGING"' EXIT

# 1. Konsistente Kopie der Datenbank im Volume schreiben
docker compose exec -T backend /server backup /data/db/backup.db

# 2. Kopie und Medien aus den Volumes holen und verschlüsselt sichern
docker compose cp backend:/data/db/backup.db "$STAGING/app.db"
docker compose cp backend:/data/media "$STAGING/media"
restic backup --host ki-web --tag nightly "$STAGING"

# 3. 30 tägliche Stände behalten
restic forget --keep-daily 30 --prune

# 4. Erfolg an die Überwachung melden
if [[ -n "${HEARTBEAT_URL:-}" ]]; then
  curl -fsS -m 10 --retry 3 "$HEARTBEAT_URL" > /dev/null
fi
echo "Sicherung abgeschlossen: $(date -Is)"
