-- +goose Up
-- Grundschema für Themen, Beiträge und Medien (Anforderungen 1 bis 4 und 7).
-- Zeitpunkte werden als ISO-8601-Text in UTC gespeichert (Standard-SQL, später auch für PostgreSQL geeignet).

CREATE TABLE topics (
    id         INTEGER PRIMARY KEY,
    slug       TEXT    NOT NULL UNIQUE,
    sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE topic_translations (
    topic_id INTEGER NOT NULL REFERENCES topics (id) ON DELETE CASCADE,
    lang     TEXT    NOT NULL,
    title    TEXT    NOT NULL,
    label    TEXT    NOT NULL,
    summary  TEXT    NOT NULL,
    intro    TEXT    NOT NULL,
    PRIMARY KEY (topic_id, lang)
);

CREATE TABLE media (
    id          INTEGER PRIMARY KEY,
    storage_key TEXT    NOT NULL UNIQUE,
    mime_type   TEXT    NOT NULL,
    width       INTEGER NOT NULL,
    height      INTEGER NOT NULL,
    created_at  TEXT    NOT NULL
);

CREATE TABLE media_translations (
    media_id INTEGER NOT NULL REFERENCES media (id) ON DELETE CASCADE,
    lang     TEXT    NOT NULL,
    alt_text TEXT    NOT NULL,
    PRIMARY KEY (media_id, lang)
);

CREATE TABLE posts (
    id             INTEGER PRIMARY KEY,
    slug           TEXT    NOT NULL UNIQUE,
    status         TEXT    NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    published_at   TEXT,
    featured       BOOLEAN NOT NULL DEFAULT FALSE,
    cover_media_id INTEGER REFERENCES media (id) ON DELETE SET NULL,
    updated_at     TEXT    NOT NULL
);

CREATE INDEX posts_status_published_at ON posts (status, published_at);

CREATE TABLE post_translations (
    post_id       INTEGER NOT NULL REFERENCES posts (id) ON DELETE CASCADE,
    lang          TEXT    NOT NULL,
    title         TEXT    NOT NULL,
    summary       TEXT    NOT NULL,
    body_markdown TEXT    NOT NULL,
    PRIMARY KEY (post_id, lang)
);

CREATE TABLE post_topics (
    post_id  INTEGER NOT NULL REFERENCES posts (id) ON DELETE CASCADE,
    topic_id INTEGER NOT NULL REFERENCES topics (id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, topic_id)
);

CREATE INDEX post_topics_topic ON post_topics (topic_id);

-- +goose Down
DROP TABLE post_topics;
DROP TABLE post_translations;
DROP TABLE posts;
DROP TABLE media_translations;
DROP TABLE media;
DROP TABLE topic_translations;
DROP TABLE topics;
