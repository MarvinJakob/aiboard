-- +goose Up
-- Viertes Thema „Prozessautomatisierung“ (Ticket #77), auf Deutsch und Englisch.
-- Die Vorteile von n8n stehen mit Quellen im Frontend (frontend/src/i18n/automation.ts).

INSERT INTO topics (id, slug, sort_order) VALUES
    (4, 'prozessautomatisierung', 4);

INSERT INTO topic_translations (topic_id, lang, title, label, summary, intro) VALUES
    (4, 'de', 'Prozessautomatisierung', 'Prozessautomatisierung',
     'Wiederkehrende Abläufe mit n8n verbinden und automatisieren.',
     'Prozessautomatisierung lässt wiederkehrende Arbeitsschritte zwischen Anwendungen automatisch ablaufen: Daten übertragen, Vorgänge weiterleiten, Berichte zusammenstellen. Das Werkzeug n8n verbindet dafür Anwendungen und Datenquellen zu Workflows. Ob sich eine Automatisierung lohnt, zeigt die Messung am konkreten Prozess.'),
    (4, 'en', 'Process Automation', 'Process Automation',
     'Connect and automate recurring workflows with n8n.',
     'Process automation runs recurring steps between applications automatically: transferring data, routing requests, compiling reports. The tool n8n connects applications and data sources into workflows. Whether an automation pays off becomes clear by measuring the actual process.');

-- +goose Down
DELETE FROM topic_translations WHERE topic_id = 4;
DELETE FROM topics WHERE id = 4;
