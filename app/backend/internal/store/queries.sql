-- name: Ping :one
SELECT 1;

-- name: ListTopics :many
SELECT id, slug, sort_order FROM topics ORDER BY sort_order, id;

-- name: GetTopicBySlug :one
SELECT id, slug, sort_order FROM topics WHERE slug = ?;

-- name: ListTopicTranslations :many
SELECT topic_id, lang, title, label, summary, intro
FROM topic_translations
ORDER BY topic_id, lang;

-- name: CountPublishedPostsByTopic :many
SELECT pt.topic_id, COUNT(*) AS post_count
FROM post_topics pt
JOIN posts p ON p.id = pt.post_id
WHERE p.status = 'published'
GROUP BY pt.topic_id;

-- name: ListPublishedPosts :many
SELECT *
FROM posts
WHERE status = 'published'
ORDER BY published_at DESC, id DESC;

-- name: ListPublishedPostsByTopic :many
SELECT p.*
FROM posts p
JOIN post_topics pt ON pt.post_id = p.id
WHERE pt.topic_id = ? AND p.status = 'published'
ORDER BY p.published_at DESC, p.id DESC;

-- name: GetPublishedPostBySlug :one
SELECT *
FROM posts
WHERE slug = ? AND status = 'published';

-- name: ListPostTranslationSummaries :many
SELECT post_id, lang, title, summary
FROM post_translations
WHERE post_id IN (sqlc.slice('post_ids'))
ORDER BY post_id, lang;

-- name: ListPostTranslations :many
SELECT post_id, lang, title, summary, body_markdown
FROM post_translations
WHERE post_id = ?
ORDER BY lang;

-- name: ListPostTopics :many
SELECT pt.post_id, pt.topic_id
FROM post_topics pt
JOIN topics t ON t.id = pt.topic_id
WHERE pt.post_id IN (sqlc.slice('post_ids'))
ORDER BY pt.post_id, t.sort_order, t.id;

-- name: ListMedia :many
SELECT id, storage_key, mime_type, width, height
FROM media
WHERE id IN (sqlc.slice('media_ids'));

-- name: GetMedia :one
SELECT id, storage_key, mime_type, width, height FROM media WHERE id = ?;

-- name: CreateMedia :execlastid
INSERT INTO media (storage_key, mime_type, width, height, created_at) VALUES (?, ?, ?, ?, ?);

-- name: DeleteMedia :exec
DELETE FROM media WHERE id = ?;

-- name: DeleteMediaTranslations :exec
DELETE FROM media_translations WHERE media_id = ?;

-- name: InsertMediaTranslation :exec
INSERT INTO media_translations (media_id, lang, alt_text) VALUES (?, ?, ?);

-- name: SetPostCover :execrows
UPDATE posts SET cover_media_id = ?, updated_at = ? WHERE id = ?;

-- name: ListMediaTranslations :many
SELECT media_id, lang, alt_text
FROM media_translations
WHERE media_id IN (sqlc.slice('media_ids'));

-- ---------------------------------------------------------------------------
-- Konten und Sitzungen der Redaktion (Anforderungen 6 und 11)
-- ---------------------------------------------------------------------------

-- name: CreateUser :execlastid
INSERT INTO users (email, password_hash, role, active, created_at)
VALUES (?, ?, ?, TRUE, ?);

-- name: GetUserByEmail :one
SELECT * FROM users WHERE email = ?;

-- name: GetUserByID :one
SELECT * FROM users WHERE id = ?;

-- name: ListUsers :many
SELECT * FROM users ORDER BY email;

-- name: SetUserActive :execrows
UPDATE users SET active = ? WHERE id = ?;

-- name: CreateSession :exec
INSERT INTO sessions (id, user_id, csrf_token, expires_at, created_at)
VALUES (?, ?, ?, ?, ?);

-- name: GetSession :one
SELECT s.id, s.user_id, s.csrf_token, s.expires_at, u.email, u.role, u.active
FROM sessions s
JOIN users u ON u.id = s.user_id
WHERE s.id = ?;

-- name: DeleteSession :exec
DELETE FROM sessions WHERE id = ?;

-- name: DeleteUserSessions :exec
DELETE FROM sessions WHERE user_id = ?;

-- name: DeleteExpiredSessions :execrows
DELETE FROM sessions WHERE expires_at <= ?;

-- ---------------------------------------------------------------------------
-- Redaktion: Beitraege verwalten (Anforderung 5)
-- ---------------------------------------------------------------------------

-- name: ListAllPosts :many
SELECT * FROM posts ORDER BY updated_at DESC, id DESC;

-- name: GetPostByID :one
SELECT * FROM posts WHERE id = ?;

-- name: GetPostIDBySlug :one
SELECT id FROM posts WHERE slug = ?;

-- name: CreatePost :execlastid
INSERT INTO posts (slug, status, featured, updated_at) VALUES (?, 'draft', ?, ?);

-- name: UpdatePost :execrows
UPDATE posts SET slug = ?, featured = ?, updated_at = ? WHERE id = ?;

-- Loeschen eines Beitrags (Ticket #24). Sprachfassungen und Themenzuordnungen entfernt ON DELETE CASCADE.
-- name: DeletePost :execrows
DELETE FROM posts WHERE id = ?;

-- name: DeletePostTranslations :exec
DELETE FROM post_translations WHERE post_id = ?;

-- name: InsertPostTranslation :exec
INSERT INTO post_translations (post_id, lang, title, summary, body_markdown) VALUES (?, ?, ?, ?, ?);

-- name: DeletePostTopics :exec
DELETE FROM post_topics WHERE post_id = ?;

-- name: InsertPostTopic :exec
INSERT INTO post_topics (post_id, topic_id) VALUES (?, ?);

-- name: PublishPost :execrows
UPDATE posts
SET status = 'published',
    published_at = COALESCE(published_at, sqlc.arg(published_at)),
    scheduled_at = NULL,
    updated_at = sqlc.arg(updated_at)
WHERE id = sqlc.arg(id);

-- name: UnpublishPost :execrows
UPDATE posts SET status = 'draft', updated_at = ? WHERE id = ?;

-- Geplante Veroeffentlichung (Ticket #23). Zeitpunkte in UTC, RFC 3339 ohne Sekundenbruchteile,
-- damit der Textvergleich der zeitlichen Reihenfolge entspricht.

-- name: SchedulePost :execrows
UPDATE posts SET scheduled_at = ?, updated_at = ? WHERE id = ? AND status = 'draft';

-- name: UnschedulePost :execrows
UPDATE posts SET scheduled_at = NULL, updated_at = ? WHERE id = ?;

-- name: ListDuePosts :many
SELECT id, scheduled_at FROM posts
WHERE status = 'draft' AND scheduled_at IS NOT NULL AND scheduled_at <= ?
ORDER BY scheduled_at, id;

-- Ticket #31: Eine automatische Veroeffentlichung traegt immer den geplanten Zeitpunkt als Datum,
-- auch wenn der Beitrag frueher schon einmal veroeffentlicht war.
-- name: PublishScheduledPost :execrows
UPDATE posts
SET status = 'published',
    published_at = scheduled_at,
    scheduled_at = NULL,
    updated_at = sqlc.arg(updated_at)
WHERE id = sqlc.arg(id) AND status = 'draft' AND scheduled_at IS NOT NULL
  -- Ticket #30: Der Termin muss beim Schreiben noch faellig sein. Wurde er nach dem Einlesen
  -- verschoben, aendert sich nichts.
  AND scheduled_at <= sqlc.arg(now);

-- name: UnscheduleDuePost :execrows
UPDATE posts SET scheduled_at = NULL, updated_at = sqlc.arg(updated_at)
WHERE id = sqlc.arg(id) AND status = 'draft' AND scheduled_at <= sqlc.arg(now);
