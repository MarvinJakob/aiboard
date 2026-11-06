-- +goose Up
-- Testbeiträge für die lokale Entwicklung (ARCHITECTURE.md, Abschnitt 13).
-- Enthalten bewusst: Beiträge nur auf Deutsch (Hinweis bei fehlender Übersetzung, Anforderung 7),
-- einen Entwurf (darf nie öffentlich sein, Anforderung 4) und ein Thema ohne veröffentlichte Beiträge
-- (leerer Zustand, Anforderung 3). Alle Texte sind Beispielinhalte.

INSERT INTO posts (id, slug, status, published_at, featured, updated_at) VALUES
    (1, 'ki-veraendert-softwareteams', 'published', '2026-11-03T09:00:00Z', TRUE,  '2026-11-03T09:00:00Z'),
    (2, 'ai-audit-fuenf-fragen',       'published', '2026-10-28T09:00:00Z', TRUE,  '2026-10-28T09:00:00Z'),
    (3, 'was-ki-kostet',               'published', '2026-10-21T09:00:00Z', TRUE,  '2026-10-21T09:00:00Z'),
    (4, 'rechenzentren-energie',       'published', '2026-10-14T09:00:00Z', FALSE, '2026-10-14T09:00:00Z'),
    (5, 'code-review-mit-ki',          'published', '2026-10-02T09:00:00Z', FALSE, '2026-10-02T09:00:00Z'),
    (6, 'entwurf-ki-in-der-datenanalyse', 'draft',  NULL,                   TRUE,  '2026-11-05T09:00:00Z');

INSERT INTO post_topics (post_id, topic_id) VALUES
    (1, 1), (2, 2), (3, 2), (3, 1), (4, 2), (5, 1), (6, 3);

INSERT INTO post_translations (post_id, lang, title, summary, body_markdown) VALUES
(1, 'de', 'Wie KI die Arbeit in Softwareteams verändert',
 'Weniger Routine, mehr Review: Was sich für Entwicklerinnen und Entwickler im Alltag tatsächlich verschiebt.',
 'Kaum ein Werkzeug hat den Alltag in Softwareteams so schnell erreicht wie KI-Assistenten. Sie schlagen Code vor, erklären fremde Module und schreiben erste Tests. Doch was bedeutet das für die Arbeit selbst?

## Vom Schreiben zum Prüfen

Viele Teams beobachten eine Verschiebung: Weniger Zeit fließt in Routinecode, mehr in das Lesen, Bewerten und Zusammenführen von Vorschlägen. Gute Reviews werden damit wichtiger, nicht unwichtiger.

## Was gleich bleibt

Architekturentscheidungen, das Verständnis der Fachlichkeit und die Verantwortung für das Ergebnis bleiben beim Team. Ein Assistent kennt die Ziele eines Projekts nur so gut, wie sie ihm erklärt werden.

Unser Rat: klein anfangen, Erfahrungen im Team teilen und Regeln für den Einsatz gemeinsam festlegen – etwa, welche Daten ein Assistent sehen darf.'),
(1, 'en', 'How AI is changing work in software teams',
 'Less routine, more review: what is actually shifting in developers’ day-to-day work.',
 'Few tools have reached the everyday work of software teams as quickly as AI assistants. They suggest code, explain unfamiliar modules and write first tests. But what does that mean for the work itself?

## From writing to reviewing

Many teams notice a shift: less time goes into routine code, more into reading, assessing and merging suggestions. Good reviews become more important, not less.

## What stays the same

Architecture decisions, domain understanding and responsibility for the result remain with the team. An assistant only knows a project’s goals as well as they are explained to it.

Our advice: start small, share experiences within the team and agree on rules together – for example, which data an assistant may see.'),
(2, 'de', 'AI Audit: Fünf Fragen, die Unternehmen jetzt klären sollten',
 'Von der Bestandsaufnahme bis zur Verantwortung – ein kompakter Leitfaden für den Einstieg.',
 'Ein AI Audit schafft Überblick: Wo setzt ein Unternehmen KI bereits ein, wo ist es geplant und welche Risiken entstehen dabei? Fünf Fragen helfen beim Einstieg.

## 1. Wo nutzen wir KI heute?

Eine ehrliche Bestandsaufnahme schließt auch Werkzeuge ein, die einzelne Teams eigenständig eingeführt haben.

## 2. Welche Daten fließen hinein?

Personenbezogene oder vertrauliche Daten brauchen klare Regeln – und oft eine technische Absicherung.

## 3. Wer trägt Verantwortung?

Jede KI-Anwendung braucht eine zuständige Person, die Entscheidungen erklären und Fehler korrigieren kann.

## 4. Welche Vorgaben gelten?

Rechtliche Anforderungen, interne Richtlinien und Branchenstandards sollten früh zusammengetragen werden.

## 5. Wie messen wir den Nutzen?

Ohne Ziele lässt sich nicht bewerten, ob sich ein Einsatz lohnt. Messbare Kriterien machen Entscheidungen nachvollziehbar.'),
(2, 'en', 'AI audit: five questions companies should settle now',
 'From taking stock to accountability – a compact guide to getting started.',
 'An AI audit creates an overview: where does a company already use AI, where is it planned and which risks arise? Five questions help you get started.

## 1. Where do we use AI today?

An honest inventory also includes tools that individual teams have introduced on their own.

## 2. Which data goes in?

Personal or confidential data needs clear rules – and often technical safeguards.

## 3. Who is accountable?

Every AI application needs a responsible person who can explain decisions and correct mistakes.

## 4. Which requirements apply?

Legal requirements, internal policies and industry standards should be gathered early.

## 5. How do we measure value?

Without goals there is no way to judge whether a use case pays off. Measurable criteria make decisions traceable.'),
(3, 'de', 'Was KI wirklich kostet – aus Sicht der Nutzer',
 'Lizenzen sind nur der Anfang. Ein Blick auf Zeit, Daten und Lernkurve.',
 'Wer über die Kosten von KI spricht, denkt zuerst an Lizenzen und Abonnements. Für Nutzerinnen und Nutzer zeigt sich der Aufwand aber oft an anderer Stelle.

## Zeit für das Lernen

Gute Ergebnisse brauchen Übung: Aufgaben präzise formulieren, Antworten prüfen, Grenzen erkennen.

## Daten und Vertrauen

Jede Eingabe ist eine Entscheidung darüber, welche Informationen ein Dienst verarbeitet. Transparente Regeln senken die Unsicherheit.

Erst wenn diese Faktoren mitgedacht werden, lässt sich der Nutzen fair bewerten.'),
(4, 'de', 'Rechenzentren und KI: Der unterschätzte Energiefaktor',
 'Warum der Ressourcenbedarf von KI in die Bewertung von Projekten gehört.',
 'Hinter jeder KI-Anfrage steht Rechenleistung – und damit Energie. Mit der wachsenden Nutzung rückt der Betrieb von Rechenzentren stärker in den Blick.

## Warum das Projekte betrifft

Für Unternehmen wird der Ressourcenbedarf zu einem Kriterium bei der Auswahl von Modellen und Anbietern.

## Was Teams tun können

Passende Modellgrößen wählen, unnötige Anfragen vermeiden und Anbieter nach ihrer Energieversorgung fragen – kleine Schritte mit Wirkung.'),
(5, 'de', 'Code-Review mit KI-Assistenten: Erfahrungen aus Projekten',
 'Wo Assistenten helfen, wo sie täuschen – und wie Teams beides erkennen.',
 'KI-Assistenten können Pull Requests zusammenfassen, auf Auffälligkeiten hinweisen und Rückfragen vorbereiten. In unseren Projekten haben wir beides erlebt: echte Entlastung und überzeugend klingende Fehler.

## Wo Assistenten helfen

Bei großen Änderungen geben Zusammenfassungen schnell Orientierung. Hinweise auf fehlende Tests oder unklare Namen sind oft treffend.

## Wo Vorsicht nötig ist

Vorschläge zur Fachlogik klingen plausibel, sind aber nicht immer richtig. Die letzte Entscheidung trifft deshalb immer ein Mensch.'),
(5, 'en', 'Code review with AI assistants: lessons from projects',
 'Where assistants help, where they mislead – and how teams can tell the difference.',
 'AI assistants can summarise pull requests, point out anomalies and prepare questions. In our projects we have seen both: real relief and convincingly worded mistakes.

## Where assistants help

For large changes, summaries provide quick orientation. Hints about missing tests or unclear names are often on point.

## Where caution is needed

Suggestions about business logic sound plausible but are not always correct. That is why a human always makes the final call.'),
(6, 'de', 'Entwurf: KI in der Datenanalyse',
 'Dieser Entwurf darf öffentlich nicht sichtbar sein.',
 'Unveröffentlichter Entwurf. Er dient als Testfall für Anforderung 4.');

-- +goose Down
DELETE FROM post_translations WHERE post_id BETWEEN 1 AND 6;
DELETE FROM post_topics WHERE post_id BETWEEN 1 AND 6;
DELETE FROM posts WHERE id BETWEEN 1 AND 6;
