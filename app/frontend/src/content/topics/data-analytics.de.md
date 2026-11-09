# KI in Data Analytics: Daten verstehen und auswerten

*Stand: 9. November 2026.*

## Metadaten der Themenseite

- **Slug:** `data-analytics`
- **Label:** Data Analytics
- **Titel:** KI in Data Analytics
- **Untertitel:** Daten verstehen und auswerten
- **Kurzbeschreibung:** Wie aus einer schnellen KI-Antwort eine belastbare Analyse wird: Kennzahlen klären, Ergebnisse prüfen.
- **Einführung:** KI beantwortet Datenfragen in Alltagssprache, schreibt Analysecode und unterstützt Prognosen. Belastbar werden die Ergebnisse erst, wenn Kennzahlen eindeutig definiert sind und Antworten mit den Quelldaten abgeglichen werden. Diese Seite zeigt Einsatzfelder, Grenzen und einen Pilot.

---

**Was genau ist eigentlich „der Umsatz im letzten Monat“?**

## Was sich ändert

KI unterstützt die Datenanalyse auf zwei Wegen. Lernende Modelle erstellen Vorhersagen und erkennen Muster. Generative KI erleichtert zusätzlich den Zugang zu Daten, erzeugt Analysecode und erklärt Ergebnisse. [1] [3] [4] [13]

Ob daraus bessere Entscheidungen entstehen, hängt von drei Dingen ab: von der fachlichen Definition der Fragen, von der Datenqualität und von der Prüfung der Ergebnisse. Die Methode richtet sich nach der Aufgabe: Ein Sprachmodell nimmt eine Frage auf, entwirft eine Abfrage und erläutert das Ergebnis. Klassifikations- und Regressionsmodelle ordnen Vorgänge einer Kategorie zu oder schätzen Zahlenwerte. [4] [13]

## Wo KI heute eingesetzt wird

- **Daten abfragen und Berichte erstellen.** Systeme für Conversational Analytics übersetzen Fragen wie „Wie hat sich der Nettoumsatz im letzten abgeschlossenen Monat gegenüber dem Vorjahr verändert?“ in Abfragen. Microsoft dokumentiert für Power BI Datenfragen und Berichtszusammenfassungen, Google für Looker zusätzlich Python-Analysen. Fachbereiche könnten einfache Anschlussfragen selbst klären. Das ist eine Hypothese; der tatsächliche Zeitgewinn muss inklusive Kontrolle gemessen werden. [1] [3]
- **Analysecode und Datenaufbereitung.** Assistenten wie Genie Code von Databricks unterstützen bei SQL, Notebooks und Datenpipelines. Dass ein Skript ohne Fehlermeldung läuft, ersetzt keine fachliche Abnahme: Schlüssel, Dubletten, Datentypen und fehlende Werte bleiben zu prüfen. [5]
- **Texte auswertbar machen.** Snowflake bietet mit `AI_CLASSIFY` die Zuordnung von Texten zu vorgegebenen Kategorien. Die Dokumentation empfiehlt für Text englische Prosa. Qualität und Sprachunterstützung sind deshalb am eigenen Datenbestand zu prüfen, etwa mit einer manuell kontrollierten Stichprobe. [14]
- **Prognosen.** Die Chronos-Arbeit beschreibt vortrainierte Zeitreihenmodelle. In einem Vergleich über 42 Datensätze zeigten sie auf zuvor ungesehenen Datensätzen eine vergleichbare und teilweise bessere Leistung als eigens darauf trainierte Verfahren. Das ist ein Forschungsergebnis unter den dort beschriebenen Bedingungen, keine allgemeine Überlegenheit im eigenen Unternehmen. Ein Pilot sollte gegen eine einfache Referenz antreten, etwa den Wert der Vorwoche. [6]
- **Analyseagenten.** Ein Agent bearbeitet eine Aufgabe in mehreren Schritten: Daten und Dokumentation suchen, Code ausführen, Zwischenergebnisse prüfen, Antwort formulieren. Die Benchmarks DABstep und Spider 2.0 untersuchen genau solche Abläufe. Die Freigabe von Maßnahmen sollte getrennt bleiben, bis die Zuverlässigkeit für den Prozess nachgewiesen ist. [7] [8]

Auch ein gefundener Zusammenhang belegt noch keine Ursache. Ob ein Rabatt zusätzliche Käufe auslöst, beantwortet keine Verkaufsprognose; dafür sind ausdrücklich formulierte Annahmen nötig. [11]

## Warum Kennzahlendefinitionen entscheidend sind

„Umsatz“, „aktive Kunden“ oder „letzter Monat“ sind ohne Kontext mehrdeutig. Für „Nettoumsatz im letzten Monat“ muss feststehen, ob Retouren abgezogen werden, welches Buchungsdatum zählt und ob der letzte abgeschlossene Kalendermonat gemeint ist. Sonst beantwortet eine technisch gültige Abfrage eine fachlich andere Frage.

Ein **semantisches Modell** hält die fachliche Bedeutung fest: Kennzahlen, Dimensionen und Beziehungen zwischen Tabellen. Snowflake beschreibt Semantic Views als Verbindung zwischen Geschäftsbegriffen und gespeicherten Daten, Looker nutzt LookML-Definitionen als Grundlage für Antworten. Microsoft bietet für Power BI Copilot ein ausgewähltes Datenschema, KI-Anweisungen und geprüfte Antworten an und lässt Änderungen vor der Veröffentlichung testen. Auch dann können Antworten bei gleicher Eingabe variieren. [2] [3] [4]

Verantwortliche für Kennzahlen, gepflegte Beschreibungen und fachlich geprüfte Beispielfragen gehören daher zum Betrieb einer KI-Analysefunktion. Ein Chatfenster allein schafft diese Grundlage nicht.

## Wie verlässlich sind die Ergebnisse?

Zwei Benchmarks zeigen, wie anspruchsvoll realistische Aufgaben sind:

| Untersuchung | Was geprüft wurde | Ergebnis im Veröffentlichungsstand |
| --- | --- | --- |
| Spider 2.0, Version vom 12. November 2024 | 632 Aufgaben aus komplexen Unternehmens-SQL-Arbeitsabläufen, teils mit mehr als 1.000 Spalten | Das untersuchte Agentensystem löste 17,0 % der Aufgaben; auf Spider 1.0 erreichte es 91,2 %. [7] |
| DABstep, Version vom 30. Juni 2025 | Mehr als 450 mehrstufige Analyseaufgaben aus einer Finanzanalyseplattform | Der beste untersuchte Agent erreichte bei den schwierigsten Aufgaben 14,55 % Genauigkeit. [8] |

Das sind historische Versuchsergebnisse und keine Leistungsgrenze für November 2026. Die Aufgaben und Testbedingungen unterscheiden sich, die Werte sind nicht direkt vergleichbar. Sie zeigen, dass gute Ergebnisse bei einfachen Abfragen keinen zuverlässigen Gesamtprozess belegen. Wie gut ein aktuelles System arbeitet, zeigen nur repräsentative eigene Aufgaben.

Typische Fehler und mögliche Kontrollen:

- **Überzeugend formulierte Falschaussage.** NIST beschreibt dieses Risiko als „Confabulation“. Kontrolle: Zahlen und Aussagen mit Abfrage und Quelldaten abgleichen. [12]
- **Informationsleck im Modelltraining.** Testdaten machen die gemessene Qualität unrealistisch gut. Kontrolle: Trainings- und Testdaten vor der Vorverarbeitung trennen. [9]
- **Falsche zeitliche Prüfung.** Ein Prognosemodell wird mit Zukunftsdaten trainiert. Kontrolle: zeitlich geordnete Tests, etwa mit `TimeSeriesSplit`. [10]
- **Zusammenhang wird als Ursache gelesen.** Kontrolle: kausale Annahmen offenlegen und Robustheit prüfen. [11]
- **Sensible Informationen in Ausgaben.** Kontrolle: Datenumfang, Zugriff und Ausgaben steuern. Snowflake dokumentiert die Einbindung rollenbasierter Rechte in Cortex Analyst. [4] [12]

## Ein sinnvoller Pilot

Der folgende Ablauf ist ein Vorschlag, kein empirisch belegtes Erfolgsrezept. Er eignet sich etwa für interne Vertriebsanalysen.

1. **Eine Entscheidung und einen Datenbereich wählen,** zum Beispiel monatliche Umsatzabweichungen für das Vertriebsmeeting. Kennzahlen, Datenstand und Zuständigkeiten vorab festhalten.
2. **Eine Referenz erstellen.** Fachleute beantworten etwa 30 typische Fragen mit geprüften Abfragen, darunter schwierige Fälle wie Retouren, fehlende Werte und mehrdeutige Zeiträume.
3. **Prüffragen zurückhalten.** Beispiele zur Einrichtung und Aufgaben zur Bewertung trennen. Bei Prognosen die zeitliche Reihenfolge erhalten. [9] [10]
4. **Qualität und Gesamtaufwand messen:** fachliche Richtigkeit, Bearbeitungszeit inklusive Kontrolle, Kosten und Korrekturen. Eine richtige Antwort mit falschem Zeitraum zählt als Fehler.
5. **Freigabekriterien vorher festlegen,** zum Beispiel nach vier Wochen mindestens 95 % fachlich richtige Antworten, keine erfolgreiche unberechtigte Datenabfrage und mindestens 20 % weniger Gesamtbearbeitungszeit. Diese Werte sind Vorschläge und müssen zum Risiko passen.
6. **Bei Änderungen erneut prüfen,** etwa an Datenmodell, Kennzahlen, Anweisungen oder Modellversion, und eine verantwortliche Person benennen.

Ein bestandener Testbestand garantiert nicht alle späteren Fragen. Wirtschaftlich zählt der gesamte Ablauf aus Einrichtung, Lizenzen, Abfragen, Betrieb und menschlicher Kontrolle. Eine allgemeine Zeitersparnis oder Rendite lässt sich aus den hier genutzten Quellen nicht ableiten.

## Was das für Analystinnen und Analysten bedeutet

Die dokumentierten Funktionen unterstützen bereits den Zugang zu Daten und die technische Erstellung von Analysen. Die Prüfung bleibt anspruchsvoll. Plausibel ist deshalb, dass sich Arbeit stärker auf gute Fragestellungen, verlässliche Kennzahlen und die Bewertung von Ergebnissen verlagert. Das ist eine fachliche Einordnung und keine belegte Prognose zum Wegfall von Stellen. [1] [5] [9] [11]

Die Leitfrage lautet: Wie wird aus einer schnellen KI-Antwort eine belastbare Analyse?

## Quellen

Alle Onlinequellen wurden am 9. November 2026 abgerufen. Bei laufend gepflegten Produktdokumentationen ist der Abrufstand maßgeblich.

1. Microsoft Learn: [Copilot for Power BI overview](https://learn.microsoft.com/en-us/power-bi/create-reports/copilot-introduction)
2. Microsoft Learn, Aktualisierung vom 30. Mai 2026: [Prepare your data for AI to improve Copilot results (Preview)](https://learn.microsoft.com/en-us/power-bi/create-reports/copilot-prepare-data-ai)
3. Google Cloud: [Conversational Analytics in Looker overview](https://docs.cloud.google.com/looker/docs/conversational-analytics-overview)
4. Snowflake: [Cortex Analyst](https://docs.snowflake.com/en/user-guide/snowflake-cortex/cortex-analyst)
5. Databricks, Aktualisierung vom 27. Oktober 2026: [Genie](https://docs.databricks.com/aws/en/genie/)
6. Abdul Fatir Ansari et al. (2024), arXiv-Version 3 vom 4. November 2024: [Chronos: Learning the Language of Time Series](https://arxiv.org/abs/2403.07815v3)
7. Fangyu Lei et al. (2024), arXiv-Version 1 vom 12. November 2024: [Spider 2.0: Evaluating Language Models on Real-World Enterprise Text-to-SQL Workflows](https://arxiv.org/abs/2411.07763v1)
8. Alex Egg et al. (2025), arXiv-Version 1 vom 30. Juni 2025: [DABstep: Data Agent Benchmark for Multi-step Reasoning](https://arxiv.org/abs/2506.23719v1)
9. scikit-learn: [Common pitfalls and recommended practices](https://scikit-learn.org/stable/common_pitfalls.html), Abschnitt „Data leakage“
10. scikit-learn: [TimeSeriesSplit](https://scikit-learn.org/stable/modules/generated/sklearn.model_selection.TimeSeriesSplit.html)
11. Amit Sharma und Emre Kiciman (2020): [DoWhy: An End-to-End Library for Causal Inference](https://arxiv.org/abs/2011.04216)
12. NIST (Juli 2024), NIST AI 600-1: [Artificial Intelligence Risk Management Framework: Generative Artificial Intelligence Profile (PDF)](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf), Abschnitte 2.2, 2.4 und 2.7
13. scikit-learn: [Supervised learning](https://scikit-learn.org/stable/supervised_learning.html)
14. Snowflake: [AI_CLASSIFY](https://docs.snowflake.com/en/sql-reference/functions/ai_classify)
