-- +goose Up
-- Bestehendes Thema beibehalten, nur die Metadaten aktualisieren (Ticket #81).
UPDATE topic_translations SET
    title = 'KI in Data Analytics',
    label = 'Data Analytics',
    summary = 'Wie aus einer schnellen KI-Antwort eine belastbare Analyse wird: Kennzahlen klären, Ergebnisse prüfen.',
    intro = 'KI beantwortet Datenfragen in Alltagssprache, schreibt Analysecode und unterstützt Prognosen. Belastbar werden die Ergebnisse erst, wenn Kennzahlen eindeutig definiert sind und Antworten mit den Quelldaten abgeglichen werden. Diese Seite zeigt Einsatzfelder, Grenzen und einen Pilot.'
WHERE topic_id = (SELECT id FROM topics WHERE slug = 'data-analytics') AND lang = 'de';

UPDATE topic_translations SET
    title = 'AI in Data Analytics',
    label = 'Data Analytics',
    summary = 'How a quick AI answer becomes a reliable analysis: clarify metrics, check results.',
    intro = 'AI answers data questions in everyday language, writes analysis code and supports forecasts. The results only become reliable once metrics are clearly defined and answers are checked against the source data. This page covers use cases, limits and a pilot.'
WHERE topic_id = (SELECT id FROM topics WHERE slug = 'data-analytics') AND lang = 'en';

-- +goose Down
UPDATE topic_translations SET
    title = 'AI in Data Analytics',
    label = 'Data Analytics',
    summary = 'Mit KI schneller von Daten zu belastbaren Erkenntnissen.',
    intro = 'KI verändert, wie Daten aufbereitet, ausgewertet und erklärt werden. Hier geht es um Methoden, Werkzeuge und die Frage, wie aus Analysen belastbare Entscheidungen werden.'
WHERE topic_id = (SELECT id FROM topics WHERE slug = 'data-analytics') AND lang = 'de';

UPDATE topic_translations SET
    title = 'AI in Data Analytics',
    label = 'Data Analytics',
    summary = 'Get from data to reliable insights faster with AI.',
    intro = 'AI is changing how data is prepared, analysed and explained. This topic covers methods, tools and how analyses turn into sound decisions.'
WHERE topic_id = (SELECT id FROM topics WHERE slug = 'data-analytics') AND lang = 'en';
