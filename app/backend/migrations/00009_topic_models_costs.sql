-- +goose Up
-- Ticket #83; Textvorlage: content/Modelle und Kosten.md, Stand 2026-11-09.
-- 00007 und 00008 sind für die parallelen Thementickets #81 und #82 reserviert.
-- Das Thema wird über den Slug angelegt und verknüpft, damit keine feste ID vorausgesetzt wird.
INSERT INTO topics (slug, sort_order) VALUES ('modelle-und-kosten', 6);

INSERT INTO topic_translations (topic_id, lang, title, label, summary, intro)
SELECT id, 'de', 'Modelle und Kosten: Wie finde ich das beste Preis-/Leistungsverhältnis?', 'Modelle und Kosten',
    'Warum das günstigste Modell nicht automatisch die beste Wahl ist und wie Sie Preis und Leistung selbst vergleichen.',
    'Ein niedriger Preis je Token sagt wenig darüber aus, was ein brauchbares Ergebnis kostet. Diese Seite zeigt, welche Kosten in die Rechnung gehören, was öffentliche Vergleiche leisten und wie Sie mit eigenen Testaufgaben das passende Modell finden.'
FROM topics WHERE slug = 'modelle-und-kosten';

INSERT INTO topic_translations (topic_id, lang, title, label, summary, intro)
SELECT id, 'en', 'Models and Costs: How do I find the best price-performance ratio?', 'Models and Costs',
    'Why the cheapest model is not automatically the best choice and how to compare price and performance yourself.',
    'A low price per token says little about what a usable result costs. This page shows which costs belong in the calculation, what public comparisons can and cannot do, and how to find the right model with your own test tasks.'
FROM topics WHERE slug = 'modelle-und-kosten';

-- +goose Down
DELETE FROM topic_translations WHERE topic_id IN (SELECT id FROM topics WHERE slug = 'modelle-und-kosten');
DELETE FROM topics WHERE slug = 'modelle-und-kosten';
