# Abnahme des Quiz zur Selbsteinschätzung

Stand: 2026-11-06 · Anforderung 10 · Inhalte: `backend/internal/audit/content.json` (Grundlage `content/KI Audit.docx`, Version 1.0)

## Regeln für die Zuordnung

Die Regeln stammen aus dem Fachdokument, Kapitel „Regeln für die Bewertung“.

1. **Pflichtfragen.** Alle Fragen einer Dimension sind Pflichtfragen. Fehlt eine Antwort, zeigt das Quiz nur, wie viele Fragen noch offen sind.
2. **Binär.** Jede Frage wird mit Ja oder Nein beantwortet. Bedingte Fragen haben zusätzlich „Trifft nicht zu“, zum Beispiel „Bei Agenten: …“. Diese Auswahl setzt eine begründet dokumentierte Nichtanwendbarkeit voraus; darauf weist das Quiz hin. Die Begründung wird außerhalb des Quiz dokumentiert.
3. **Erfüllt.** Eine Frage gilt als erfüllt bei „Ja“. Bei einer bedingten Frage gilt auch „Trifft nicht zu“ als erfüllt.
4. **Kumulativ.** Ein Reifegrad gilt nur, wenn alle seine Fragen und alle Fragen der darunterliegenden Reifegrade erfüllt sind. Sprünge sind nicht möglich.
5. **Reifegrad 0.** Ist Stufe 1 nicht vollständig erfüllt, zeigt das Quiz „Nicht angewendet“.
6. **Nächster Schritt.** Unter dem Ergebnis stehen die nicht erfüllten Fragen des nächsthöheren Reifegrads.

## Antwortsätze

Die Antwortsätze gelten für jede Dimension. Die Fragen sind je Reifegrad nummeriert, zum Beispiel 2.3.

| Erwartetes Ergebnis | Stufe 1 | Stufe 2 | Stufe 3 |
|---|---|---|---|
| Nicht angewendet | alle Nein | alle Nein | alle Nein |
| Einfach | alle Ja | alle Nein | alle Nein |
| Strukturiert | alle Ja | alle Ja | alle Nein |
| Intelligent | alle Ja | alle Ja | alle Ja |

Zusätzlich gilt für jede Dimension mit bedingten Fragen: Werden im Antwortsatz „Intelligent“ alle bedingten Fragen mit „Trifft nicht zu“ beantwortet, bleibt das Ergebnis „Intelligent“.

Zwei Gegenproben zeigen die kumulative Regel:

- Alle Fragen Ja, nur Frage 1.1 Nein: Ergebnis „Nicht angewendet“.
- Alle Fragen Ja, nur Frage 2.1 Nein: Ergebnis „Einfach“. Als nächster Schritt erscheint Frage 2.1.

## Fragen je Dimension

| Dimension | Seite | Stufe 1 | Stufe 2 | Stufe 3 | Bedingte Fragen |
|---|---|---|---|---|---|
| Strategie und Wirtschaftlichkeit | `/de/themen/ai-audit/strategie-und-wirtschaftlichkeit` | 3 | 7 | 5 | keine |
| Ressourcenplanung und Kompetenzen | `/de/themen/ai-audit/ressourcenplanung-und-kompetenzen` | 2 | 7 | 5 | keine |
| Betrieb | `/de/themen/ai-audit/betrieb` | 3 | 14 | 8 | 1.3, 2.4, 2.5, 2.8, 2.9, 2.10 |
| Governance und Compliance | `/de/themen/ai-audit/governance-und-compliance` | 2 | 7 | 5 | 2.4 |
| Agenten und Prozesse | `/de/themen/ai-audit/agenten-und-prozesse` | 2 | 8 | 5 | keine |
| Technologie und Infrastruktur | `/de/themen/ai-audit/technologie-und-infrastruktur` | 2 | 8 | 5 | 2.4 |
| Daten und Wissen | `/de/themen/ai-audit/daten-und-wissen` | 2 | 7 | 5 | 2.3 |
| Sicherheit und Zuverlässigkeit | `/de/themen/ai-audit/sicherheit-und-zuverlaessigkeit` | 2 | 8 | 5 | keine |

## Automatische Prüfung

`frontend/src/lib/audit.content.test.ts` wendet alle Antwortsätze auf jede freigegebene Dimension in `content.json` an. Ändern sich Fragen oder Dimensionen, schlägt der Test fehl, sobald ein Antwortsatz nicht mehr das erwartete Ergebnis liefert. Ausführen mit `cd frontend && npm test`.

## Abgleich für den Review-Rücklauf von Ticket 10

Am 2026-11-06 wurden die 127 Fragen in acht Dimensionen mit [KI Audit.docx](../../content/KI%20Audit.docx), Version 1.0 vom 23.10.2026, abgeglichen. SHA-256 der geprüften Quelldatei: `D36CA21532BA0FCC5F4BC985732540CD224F627679B999859EF983A607380C6B`.

Die Kapitel „Fähigkeitslevel“ und „Regeln für die Bewertung“ beschreiben Stufe 0 und die kumulative Bewertung. Die Audit-Abschnitte der Dimensionen verlangen bei bedingten Fragen eine begründet dokumentierte Nichtanwendbarkeit. Der Hinweis im Quiz wurde entsprechend ergänzt. Bei Betrieb 3.1 wurde der ausgelassene Bezug „aus Level 2“ wiederhergestellt.

118 Fragen stimmen danach im Wortlaut mit dem Fachdokument überein (Leerraum am Absatzende ausgenommen). Die neun verbleibenden redaktionellen Abweichungen sind:

| Dimension und Frage | Anpassung gegenüber dem Fachdokument |
|---|---|
| Strategie 1.2 | „KI Strategie“ wird als „KI-Strategie“ geschrieben. |
| Strategie 2.3 | Der Doppelpunkt nach „Kriterien“ entfällt. |
| Strategie 2.4 | „festgelegt, den Beteiligten bekannt“ wird zu „festgelegt und den Beteiligten bekannt“. |
| Strategie 3.4 | Die zwei Sätze zur Pflege der Risikoanalyse werden zu einer Frage verbunden; eingetretene Ereignisse, Wirksamkeitsprüfung und erledigte Risiken bleiben enthalten. |
| Strategie 3.5 | Das fehlende Subjekt „sie“ vor „belegbar“ wird ergänzt. |
| Governance 2.1 | „EU KI Act“ wird als „EU AI Act“ bezeichnet. |
| Governance 2.4 | Die Voraussetzung „bei personenbezogenen Daten“ steht am Anfang der Frage. |
| Technologie 2.4 | Die Voraussetzung „für Anwendungen mit eigenen Änderungen“ steht am Anfang der Frage. |
| Daten 2.3 | Die Voraussetzung „bei Trainings- oder Bewertungsdaten“ steht am Anfang der Frage. |

Die neun bedingten Fragen sind in der Tabelle „Fragen je Dimension“ vollständig aufgeführt. Alle anderen Fragen bieten ausschließlich Ja und Nein an. „Trifft nicht zu“ zählt bei einer bedingten Frage als erfüllt und ist kein Ersatz für eine fehlende Antwort oder einen fehlenden Nachweis.

### Fachliche Entscheidung noch offen

Der [Review-Rücklauf](https://github.com/MarvinJakob/aiboard/issues/10#issuecomment-6681820472) verlangt eine verbindliche Abstimmung des Akzeptanzkriteriums sowie die Freigabe von Fragen, Antwortoptionen und Regeln. Der technische Abgleich ersetzt diese Freigabe nicht.

Vorschlag für Akzeptanzkriterium 2: Sobald alle Pflichtfragen beantwortet sind, zeigt das Quiz „Nicht angewendet“ (0), „Einfach“ (1), „Strukturiert“ (2) oder „Intelligent“ (3). Ein Reifegrad gilt nur, wenn alle Fragen dieser und aller darunterliegenden Stufen erfüllt sind. Ist Stufe 1 nicht vollständig erfüllt, gilt Stufe 0. Vor vollständiger Beantwortung erscheint nur ein Hinweis auf die fehlenden Antworten.

Der Vorschlag und die Freigabe der oben abgeglichenen Fragen einschließlich der redaktionellen Anpassungen sind am [Ticket 10](https://github.com/MarvinJakob/aiboard/issues/10) zu bestätigen. Die separaten Freigaben für Übersicht und Dimensionsseiten in Tickets 14 und 15 bleiben davon unberührt.
