-- +goose Up
-- Testkonten für die lokale Entwicklung (ARCHITECTURE.md, Abschnitt 13). Nur mit DEV_SEED=true.
-- Die Passwörter stehen in app/README.md. In Produktion legt `server user create` das erste Admin-Konto an.
--   redaktion@example.test  Rolle editor  Passwort redaktion-test
--   admin@example.test      Rolle admin   Passwort admin-test-123

INSERT INTO users (email, password_hash, role, active, created_at) VALUES
    ('redaktion@example.test', '$argon2id$v=19$m=65536,t=2,p=1$x15sswlicl+3wqx2liObtw$X2QTCxGJ+JAofLOOgE4pcnNCkQIhQCLYXT4GHu+mlVQ', 'editor', TRUE, '2026-11-06T09:00:00Z'),
    ('admin@example.test',     '$argon2id$v=19$m=65536,t=2,p=1$yCbUzeFxIAnPUcy6cMHssw$fgMK9S9BO7ak7Z7DhqH9EwadNGHSNwKAm1U6BGi1tFg', 'admin',  TRUE, '2026-11-06T09:00:00Z');

-- +goose Down
DELETE FROM users WHERE email IN ('redaktion@example.test', 'admin@example.test');
