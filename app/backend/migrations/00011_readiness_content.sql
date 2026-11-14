-- +goose Up
-- Ticket #111, Textstand content/KI Readiness.md vom 14.11.2026.
-- Slug und Themenzuordnungen bleiben erhalten; Metadaten gelten auch für SEO und Sitemap.
UPDATE topic_translations
SET title = 'KI Readiness', label = 'KI Readiness',
    summary = 'Wie bereit sind wir für den professionellen Einsatz von KI?',
    intro = 'KI-Readiness einschätzen. Nächste Schritte erkennen. Eine strukturierte Selbsteinschätzung in acht Dimensionen. Sie zeigt, was schon gut funktioniert und wo sich der nächste Schritt lohnt.'
WHERE topic_id IN (SELECT id FROM topics WHERE slug = 'ai-audit') AND lang = 'de';

UPDATE topic_translations
SET title = 'AI Readiness', label = 'AI Readiness',
    summary = 'How ready are we to use AI professionally?',
    intro = 'Assess AI readiness. Identify next steps. A structured self-assessment across eight dimensions. It shows what already works well and where the next step is worthwhile.'
WHERE topic_id IN (SELECT id FROM topics WHERE slug = 'ai-audit') AND lang = 'en';

-- +goose Down
UPDATE topic_translations
SET title = 'AI Audit für Unternehmen', label = 'AI Audit',
    summary = 'KI-Einsatz prüfen, Risiken bewerten, Regeln einhalten.',
    intro = 'Ein AI Audit zeigt, wo und wie ein Unternehmen KI einsetzt, welche Risiken bestehen und welche Regeln gelten. Die Beiträge geben Orientierung für Bestandsaufnahme, Bewertung und nächste Schritte.'
WHERE topic_id IN (SELECT id FROM topics WHERE slug = 'ai-audit') AND lang = 'de';

UPDATE topic_translations
SET title = 'AI Audit for Companies', label = 'AI Audit',
    summary = 'Review AI use, assess risks, stay compliant.',
    intro = 'An AI audit shows where and how a company uses AI, which risks exist and which rules apply. The articles offer guidance on taking stock, assessing and planning next steps.'
WHERE topic_id IN (SELECT id FROM topics WHERE slug = 'ai-audit') AND lang = 'en';
