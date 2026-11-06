# Abnahme des Quiz zur Selbsteinschätzung

Stand: 2026-11-06 · Anforderung 10 · Inhalte: `backend/internal/audit/content.json` (Grundlage `content/KI Audit.docx`, Version 1.0)

## Regeln für die Zuordnung

Die Regeln stammen aus dem Fachdokument, Kapitel „Regeln für die Bewertung“.

1. **Pflichtfragen.** Alle Fragen einer Dimension sind Pflichtfragen. Fehlt eine Antwort, zeigt das Quiz nur, wie viele Fragen noch offen sind.
2. **Binär.** Jede Frage wird mit Ja oder Nein beantwortet. Bedingte Fragen haben zusätzlich „Trifft nicht zu“, zum Beispiel „Bei Agenten: …“.
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
