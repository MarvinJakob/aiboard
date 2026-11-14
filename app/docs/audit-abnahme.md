# Abnahme der KI-Readiness-Selbsteinschätzung

Stand: 2026-11-14 · Ticket [#113](https://github.com/MarvinJakob/aiboard/issues/113) · Inhalte: `backend/internal/audit/content.json`

Seit #113 wählen Nutzer je Dimension bewusst genau einen Reifegrad. Diese Wahl ersetzt den Ja/Nein-Fragebogen aus Anforderung 10 mit automatischer Ableitung, „Trifft nicht zu“ und Reifegrad 0 „Nicht angewendet“. Die Abschnitte ab „Abgleich für den Review-Rücklauf von Ticket 10“ belegen weiter die Herkunft und den Wortlaut der Prüffragen. Für die Bewertung gelten sie nicht mehr.

## Regeln des Ablaufs

1. **Einstieg und Reihenfolge.** „Selbsteinschätzung starten“ auf der Übersicht öffnet die erste freigegebene Dimension. Der Ablauf folgt der Reihenfolge der Übersicht, also der Reihenfolge in `content.json`. Jeder Schritt behält seine bisherige Dimensions-URL `/{lang}/themen/ai-audit/{dimension}`.
2. **Genau ein Reifegrad.** Je Dimension stehen „Einfach“ (1), „Strukturiert“ (2) und „Intelligent“ (3) als Radiogruppe zur Wahl. Anfangs ist nichts ausgewählt. Einen Reifegrad 0 gibt es nicht.
3. **Prüffragen als Entscheidungshilfe.** Jede Reifegradkarte zeigt die Beschreibung der Stufe und alle ihre Prüffragen als Liste, ohne Antwortfelder. Die Fragen beeinflussen die Auswahl nicht. Die Bewertung entspricht immer der bewussten Wahl.
4. **Weiter.** Ohne Auswahl ist „Weiter“ gesperrt (`aria-disabled`, bleibt fokussierbar). Der Hinweis „Wählen Sie einen Reifegrad, um fortzufahren.“ ist mit dem Button verknüpft und erscheint hervorgehoben, wenn man es trotzdem versucht; der Fokus springt dann zur ersten Stufe. Eine Auswahl allein wechselt den Schritt nicht.
5. **Korrekturen.** „Zurück“ führt zur vorherigen Dimension, auf der ersten zur Übersicht. Die Schrittliste verlinkt alle bewerteten Dimensionen und die nächste offene. Alle Bewertungen bleiben dabei erhalten.
6. **Fortschritt.** Die nummerierte Schrittliste unterscheidet aktuelle (gefüllter Kreis, Rahmen, „Aktuell“, `aria-current="step"`), bewertete (Häkchen, „Bewertet: …“) und offene Dimensionen (gestrichelter Kreis, „Offen“), also auch ohne Farberkennung. Dazu nennt jeder Schritt „Dimension X von N“ und die Liste „X von N bewertet“.
7. **Auswertung.** Auf der letzten Dimension heißt der Button „Auswertung anzeigen“. Er führt nur zur Auswertung, wenn alle Dimensionen bewertet sind; sonst nennt der Hinweis die fehlenden Dimensionen und verlinkt die nächste offene. `/{lang}/themen/ai-audit/auswertung` zeigt ohne vollständige Bewertung kein Ergebnis, sondern die offenen Dimensionen. Sind alle bewertet, führt auch die Schrittliste zur Auswertung.
8. **Datenschutz.** Die Auswahl liegt nur im Arbeitsspeicher der Seite (`lib/assessment.tsx`). Sie wird weder übertragen noch im Browser gespeichert und beginnt nach dem Neuladen neu.

## Vollständiger Durchlauf (2026-11-14)

Geprüft im gebauten Stand mit `DEV_SEED=true` (headless Edge, 1280 px; Screenshots unter [screenshots/113](screenshots/113/)):

| Schritt | Aktion | Ergebnis |
|---|---|---|
| 1 | Übersicht → „Selbsteinschätzung starten“ | Strategie und Wirtschaftlichkeit, „Dimension 1 von 8“, keine Vorauswahl |
| 2 | „Weiter“ ohne Auswahl | Seite bleibt, Hinweis „Wählen Sie einen Reifegrad, um fortzufahren.“ |
| 3 | Je Dimension wählen und „Weiter“: 2, 1, 3, 2, 1, 2, 3, 1 | Jeder Schritt zeigt „Gewählt: …“, dann die nächste Dimension |
| 4 | Auf Dimension 8 „Zurück“ | Dimension 7, Auswahl „Intelligent“ erhalten |
| 5 | Schrittliste → Dimension 8 → „Auswertung anzeigen“ | Auswertung mit allen acht Werten in Ablaufreihenfolge |
| 6 | In der Auswertung „Ändern“ bei Betrieb, „Einfach“ statt „Intelligent“, über die Schrittliste zurück zur Auswertung | Betrieb zeigt „1 – Einfach“; alle übrigen Werte unverändert |

Bei 320 und 1280 px gibt es in heller und dunkler Darstellung keinen horizontalen Seitenscroll.

## Fragen je Dimension

Die Spalte „Bedingte Fragen“ nennt Fragen mit Voraussetzung (zum Beispiel „Bei Agenten: …“). Sie stammt aus dem früheren Fragebogen und hat im neuen Ablauf keine Auswirkung.

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

`frontend/src/app.test.tsx` (Abschnitt „Ticket #113“) prüft Einstieg, Schrittliste, fehlende Vorauswahl, Prüffragen ohne Antwortfelder, gesperrtes „Weiter“ samt Hinweis, Zurück und Rücksprung mit erhaltenen Bewertungen, die gesperrte und die vollständige Auswertung sowie die Tastaturbedienung. `lib/audit.test.ts` prüft die Fortschrittsberechnung. Die API-Tests stellen sicher, dass Reifegrad 0 und „conditional“ nicht mehr ausgeliefert werden. Ausführen mit `cd frontend && npm test` und `cd backend && go test ./...`.

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

## Abgleich der Dimensionsseiten für Ticket 15

Im Vorläufer-Commit [06aeb9a](https://github.com/MarvinJakob/aiboard/commit/06aeb9a4a27138b51dd73fdeb2a71ab9f3ba13a6) wurde folgender Abgleich vom 2026-11-06 dokumentiert: Es wurden Kurzbeschreibung, Einführung, Vorteile und die Erläuterungen zu den Reifegraden aller acht Dimensionsseiten mit [KI Audit.docx](../../content/KI%20Audit.docx), Version 1.0 vom 23.10.2026, abgeglichen (SHA-256 `D36CA21532BA0FCC5F4BC985732540CD224F627679B999859EF983A607380C6B`). Grundlage sind die Abschnitte der Dimensionen mit Einführung und Audit (Level 0 bis 3).

Jede Seite enthält eine Einführung, drei Vorteile und je eine Erläuterung zu „Nicht angewendet“ und zu den drei Reifegraden. `audit_test.go` verlangt mindestens zwei Vorteile je freigegebener Dimension.

| Inhalt | Verhältnis zum Fachdokument |
|---|---|
| Einführung | Gekürzte Fassung der zwei bis drei Einführungsabsätze der Dimension; keine neuen Aussagen. |
| Kurzbeschreibung und Vorteile | Redaktionell aus den Einführungsabsätzen abgeleitet (zum Beispiel Wirkungen wie „Engpässe werden sichtbar“, „Lernzeit wird eingeplant“). Das Fachdokument enthält sie nicht als eigene Liste. |
| Reifegrade | Gekürzte Fassung der Beschreibungen zu Level 0 bis 3; Beispiele und Abgrenzungen wurden teilweise weggelassen, Bedeutung unverändert. |

Abweichungen und Korrekturen:

- Strategie, Vorteil 2: „statt des nächsten Piloten aus dem Bauch heraus“ hatte keinen Beleg im Dokument. Ersetzt durch „statt dass Vorhaben entstehen, weil jemand Lust darauf hatte“ (Level 2, Strategie).
- Governance und Compliance: Das Fachdokument nennt die Dimension in der Überschrift „Gouvernance und Compliance“ und im Einführungstext „Recht und Compliance“. Die Seite verwendet „Governance und Compliance“ wie Inhaltsverzeichnis, Quiz und Adresse. Diese Abweichung ist in der unten dokumentierten Freigabe eingeschlossen.
- Agenten und Prozesse: Das Fachdokument beginnt mit „Die Dimension Prozesse“. Die Seite verwendet den Titel „Agenten und Prozesse“.

### Freigabe

Die technische Gegenprüfung ersetzt die fachliche Freigabe nicht. Marvin Jakob hat am 2026-11-06 alle acht Dimensionen einschließlich der dokumentierten Abweichungen ausdrücklich fachlich freigegeben (Implementierungsauftrag zu [Ticket 29](https://github.com/MarvinJakob/aiboard/issues/29)). Die vollständige [Freigabevorlage](audit-dimensionsfreigabe.md) enthält die aktuellen Texte und den zugehörigen SHA-256. Seiten ohne Freigabe können über `"released": false` in `content.json` ausgeblendet werden.
