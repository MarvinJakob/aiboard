-- +goose Up
-- Ticket #82; Textvorlage: content/KI Tipps und Tricks.md, Stand 2026-11-09.
-- 00005 bis 00007 sind für die parallelen Thementickets #77, #80 und #81 reserviert.
INSERT INTO topics (slug, sort_order) VALUES ('ki-tipps-und-tricks', 5);

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

-- +goose Down
DELETE FROM topic_translations WHERE topic_id IN (SELECT id FROM topics WHERE slug = 'ki-tipps-und-tricks');
DELETE FROM topics WHERE slug = 'ki-tipps-und-tricks';
