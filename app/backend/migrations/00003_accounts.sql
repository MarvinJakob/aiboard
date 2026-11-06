-- +goose Up
-- Konten und Sitzungen der Redaktion (Anforderungen 6 und 11, ARCHITECTURE.md, Abschnitte 4 und 8).
-- E-Mail-Adressen werden kleingeschrieben gespeichert. Sitzungen speichern nur den SHA-256-Hash des
-- Cookie-Werts, damit eine Kopie der Datenbank keine gültigen Sitzungen enthält.

CREATE TABLE users (
    id            INTEGER PRIMARY KEY,
    email         TEXT    NOT NULL UNIQUE,
    password_hash TEXT    NOT NULL,
    role          TEXT    NOT NULL CHECK (role IN ('editor', 'admin')),
    active        BOOLEAN NOT NULL DEFAULT TRUE,
    created_at    TEXT    NOT NULL
);

CREATE TABLE sessions (
    id         TEXT    PRIMARY KEY,
    user_id    INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    csrf_token TEXT    NOT NULL,
    expires_at TEXT    NOT NULL,
    created_at TEXT    NOT NULL
);

CREATE INDEX sessions_user ON sessions (user_id);
CREATE INDEX sessions_expires_at ON sessions (expires_at);

-- +goose Down
DROP TABLE sessions;
DROP TABLE users;
