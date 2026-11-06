-- +goose Up
-- Die drei Startthemen (Anforderung 3), jeweils auf Deutsch und Englisch (Anforderung 7).

INSERT INTO topics (id, slug, sort_order) VALUES
    (1, 'softwareentwicklung', 1),
    (2, 'ai-audit', 2),
    (3, 'data-analytics', 3);

INSERT INTO topic_translations (topic_id, lang, title, label, summary, intro) VALUES
    (1, 'de', 'AI in der Softwareentwicklung', 'Softwareentwicklung',
     'Wie KI-Assistenten Planung, Code und Tests verändern.',
     'KI-Assistenten unterstützen heute in jeder Phase der Entwicklung – von der Anforderung bis zum Betrieb. Hier ordnen wir ein, wo sie Teams wirklich voranbringen, wo Grenzen liegen und wie ein verantwortungsvoller Einsatz gelingt.'),
    (1, 'en', 'AI in Software Development', 'Software Development',
     'How AI assistants change planning, code and testing.',
     'AI assistants now support every phase of development – from requirements to operations. Here we look at where they genuinely help teams, where their limits are and how to use them responsibly.'),
    (2, 'de', 'AI Audit für Unternehmen', 'AI Audit',
     'KI-Einsatz prüfen, Risiken bewerten, Regeln einhalten.',
     'Ein AI Audit zeigt, wo und wie ein Unternehmen KI einsetzt, welche Risiken bestehen und welche Regeln gelten. Die Beiträge geben Orientierung für Bestandsaufnahme, Bewertung und nächste Schritte.'),
    (2, 'en', 'AI Audit for Companies', 'AI Audit',
     'Review AI use, assess risks, stay compliant.',
     'An AI audit shows where and how a company uses AI, which risks exist and which rules apply. The articles offer guidance on taking stock, assessing and planning next steps.'),
    (3, 'de', 'AI in Data Analytics', 'Data Analytics',
     'Mit KI schneller von Daten zu belastbaren Erkenntnissen.',
     'KI verändert, wie Daten aufbereitet, ausgewertet und erklärt werden. Hier geht es um Methoden, Werkzeuge und die Frage, wie aus Analysen belastbare Entscheidungen werden.'),
    (3, 'en', 'AI in Data Analytics', 'Data Analytics',
     'Get from data to reliable insights faster with AI.',
     'AI is changing how data is prepared, analysed and explained. This topic covers methods, tools and how analyses turn into sound decisions.');

-- +goose Down
DELETE FROM topic_translations WHERE topic_id IN (1, 2, 3);
DELETE FROM topics WHERE id IN (1, 2, 3);
