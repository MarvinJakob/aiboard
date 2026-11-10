-- +goose Up
-- Ticket #102: Die Themen „Prozessautomatisierung“ (#77, Migration 00005) und „KI-Tipps und Tricks“
-- (#82, Migration 00008) werden nicht mehr angeboten. Die bestehenden Migrationen bleiben unverändert;
-- diese Migration entfernt die Themen in bestehenden Datenbanken und bei Neuinstallationen.
--
-- Gelöscht werden nur die Themen. Ihre Sprachfassungen und die Zuordnungen in post_topics entfernt die
-- Datenbank per ON DELETE CASCADE. Beiträge, Entwürfe und ihre übrigen Themenzuordnungen bleiben erhalten.
DELETE FROM topics WHERE slug IN ('prozessautomatisierung', 'ki-tipps-und-tricks');

-- +goose Down
-- Stellt die Metadaten aus 00005 und 00008 wieder her. Frühere Beitragszuordnungen lassen sich nicht
-- wiederherstellen. Migration 00005 löscht beim Rollback die feste ID 4; deshalb muss sie erhalten bleiben.
-- Ist sie inzwischen anderweitig belegt, schlägt das Rollback fehl, statt fremde Daten zu überschreiben.
INSERT INTO topics (id, slug, sort_order) VALUES (4, 'prozessautomatisierung', 4);
INSERT INTO topics (slug, sort_order) VALUES ('ki-tipps-und-tricks', 5);

INSERT INTO topic_translations (topic_id, lang, title, label, summary, intro)
SELECT id, 'de', 'Prozessautomatisierung', 'Prozessautomatisierung',
    'Wiederkehrende Abläufe mit n8n verbinden und automatisieren.',
    'Prozessautomatisierung lässt wiederkehrende Arbeitsschritte zwischen Anwendungen automatisch ablaufen: Daten übertragen, Vorgänge weiterleiten, Berichte zusammenstellen. Das Werkzeug n8n verbindet dafür Anwendungen und Datenquellen zu Workflows. Ob sich eine Automatisierung lohnt, zeigt die Messung am konkreten Prozess.'
FROM topics WHERE slug = 'prozessautomatisierung';

INSERT INTO topic_translations (topic_id, lang, title, label, summary, intro)
SELECT id, 'en', 'Process Automation', 'Process Automation',
    'Connect and automate recurring workflows with n8n.',
    'Process automation runs recurring steps between applications automatically: transferring data, routing requests, compiling reports. The tool n8n connects applications and data sources into workflows. Whether an automation pays off becomes clear by measuring the actual process.'
FROM topics WHERE slug = 'prozessautomatisierung';

INSERT INTO topic_translations (topic_id, lang, title, label, summary, intro)
SELECT id, 'de', 'KI-Tipps und Tricks', 'KI-Tipps und Tricks',
    'Welche Skills KI-Agenten wirklich helfen und wie belastbar der Nutzen ist.',
    'Skills halten wiederkehrende Arbeitsabläufe für KI-Agenten fest, etwa für Excel-Auswertungen oder die systematische Fehlersuche. Wir ordnen ein, was Studien zeigen, welche Skills sich für einen Test lohnen und wie Sie den Nutzen in Ihrem eigenen Arbeitsablauf prüfen.'
FROM topics WHERE slug = 'ki-tipps-und-tricks';

INSERT INTO topic_translations (topic_id, lang, title, label, summary, intro)
SELECT id, 'en', 'AI Tips and Tricks', 'AI Tips and Tricks',
    'Which skills actually help AI agents and how strong the evidence is.',
    'Skills capture recurring workflows for AI agents, such as analysing Excel files or investigating bugs systematically. We explain what studies show, which skills are worth testing and how to assess their value in your own workflow.'
FROM topics WHERE slug = 'ki-tipps-und-tricks';
