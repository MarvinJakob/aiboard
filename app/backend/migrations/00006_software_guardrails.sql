-- +goose Up
-- Bestehendes Thema beibehalten, nur die Metadaten aktualisieren (Ticket #80).
UPDATE topic_translations SET
    title = 'KI in der Softwareentwicklung',
    label = 'Softwareentwicklung',
    summary = 'Wie Sie KI-Assistenten mit Markdown-Regeln, Zugriffsrechten, Tests und Reviews anleiten.',
    intro = 'Dateien wie `AGENTS.md` geben KI-Assistenten Ziele, Arbeitsabläufe und Grenzen mit. Das Modell kann solche Regeln aber missverstehen oder übergehen. Hier sehen Sie, wie Sie prüfbare Regeln schreiben, Freigaben an Aktionen binden und Grenzen technisch absichern.'
WHERE topic_id = (SELECT id FROM topics WHERE slug = 'softwareentwicklung') AND lang = 'de';

UPDATE topic_translations SET
    title = 'AI in Software Development',
    label = 'Software Development',
    summary = 'How to guide AI assistants with Markdown rules, access permissions, tests and reviews.',
    intro = 'Files such as `AGENTS.md` give AI assistants goals, workflows and boundaries. However, the model can misunderstand or disregard these rules. Here you can learn how to write verifiable rules, tie approvals to actions and enforce boundaries through technical controls.'
WHERE topic_id = (SELECT id FROM topics WHERE slug = 'softwareentwicklung') AND lang = 'en';

-- +goose Down
UPDATE topic_translations SET
    title = 'AI in der Softwareentwicklung',
    label = 'Softwareentwicklung',
    summary = 'Wie KI-Assistenten Planung, Code und Tests verändern.',
    intro = 'KI-Assistenten unterstützen heute in jeder Phase der Entwicklung – von der Anforderung bis zum Betrieb. Hier ordnen wir ein, wo sie Teams wirklich voranbringen, wo Grenzen liegen und wie ein verantwortungsvoller Einsatz gelingt.'
WHERE topic_id = (SELECT id FROM topics WHERE slug = 'softwareentwicklung') AND lang = 'de';

UPDATE topic_translations SET
    title = 'AI in Software Development',
    label = 'Software Development',
    summary = 'How AI assistants change planning, code and testing.',
    intro = 'AI assistants now support every phase of development – from requirements to operations. Here we look at where they genuinely help teams, where their limits are and how to use them responsibly.'
WHERE topic_id = (SELECT id FROM topics WHERE slug = 'softwareentwicklung') AND lang = 'en';
