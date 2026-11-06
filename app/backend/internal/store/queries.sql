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

-- name: ListMediaTranslations :many
SELECT media_id, lang, alt_text
FROM media_translations
WHERE media_id IN (sqlc.slice('media_ids'));
