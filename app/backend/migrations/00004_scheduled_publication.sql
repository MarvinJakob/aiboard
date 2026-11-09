-- +goose Up
-- Geplante Veröffentlichung (Ticket #23). Zeitpunkt in UTC im Format RFC 3339, NULL ohne Planung.
-- Nur Beiträge „In Arbeit“ (draft) können einen Zeitpunkt haben. Das Backend veröffentlicht sie, sobald er erreicht ist.
ALTER TABLE posts ADD COLUMN scheduled_at TEXT;

CREATE INDEX posts_scheduled_at ON posts (scheduled_at) WHERE scheduled_at IS NOT NULL;

-- +goose Down
DROP INDEX posts_scheduled_at;
ALTER TABLE posts DROP COLUMN scheduled_at;
