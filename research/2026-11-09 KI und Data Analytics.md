# KI und Data Analytics

*Recherchestand: 9. November 2026*

KI unterstützt die Datenanalyse auf zwei Wegen: Lernende Modelle erstellen Vorhersagen und erkennen Muster. Generative KI erleichtert zusätzlich den Zugang zu Daten, erzeugt Analysecode und erklärt Ergebnisse. Aktuelle Analyseplattformen verbinden diese Funktionen mit bestehenden Datenmodellen und Zugriffsrechten. Ob daraus bessere Entscheidungen entstehen, hängt von der fachlichen Definition der Fragen, der Datenqualität und der Prüfung der Ergebnisse ab. [1] · [3] · [4] · [13]

Diese Recherche betrachtet den Einsatz in Unternehmen: von Berichten und spontanen Datenfragen bis zu Prognosen und Analyseagenten. Sie stützt sich auf Forschungsarbeiten, technische Dokumentation und das Risikoprofil des NIST. Produktdokumentationen belegen verfügbare Funktionen und Voraussetzungen; sie sind kein unabhängiger Nachweis für Wirtschaftlichkeit oder Ergebnisqualität. Die Beispiele und der Pilotvorschlag sind eigene Ableitungen aus den Quellen.

## Was KI in der Datenanalyse verändert

Data Analytics bedeutet hier, Daten auszuwerten, um Entwicklungen zu verstehen und Entscheidungen vorzubereiten. Dabei lassen sich vier Fragen unterscheiden:

| Frage | Beispiel | Beitrag von KI |
| --- | --- | --- |
| Was ist passiert? | Wie hat sich der Umsatz entwickelt? | Datenfragen in Alltagssprache beantworten und Berichte zusammenfassen. [1] · [3] |
| Womit hängt eine Veränderung zusammen? | In welchen Produktgruppen ist der Umsatz gesunken? | Vergleichsabfragen und Analysecode erzeugen. Ein gefundener Zusammenhang belegt noch keine Ursache. [3] · [11] |
| Was könnte passieren? | Wie hoch wird die Nachfrage nächste Woche? | Modelle auf historischen Daten trainieren oder vortrainierte Zeitreihenmodelle einsetzen. [6] · [13] |
| Welche Maßnahme könnte helfen? | Würde ein Rabatt zusätzliche Käufe auslösen? | Effekte unter ausdrücklich formulierten Annahmen schätzen. Eine reine Verkaufsprognose beantwortet diese Frage nicht. [11] |

**Maschinelles Lernen und generative KI erfüllen unterschiedliche Aufgaben.** Ein Klassifikationsmodell ordnet etwa Geschäftsvorgänge einer Kategorie zu; ein Regressionsmodell schätzt einen Zahlenwert. Verfahren wie Entscheidungsbäume und Gradient Boosting gehören weiterhin zum Werkzeugkasten. Ein Sprachmodell kann dagegen die Frage aufnehmen, eine Abfrage entwerfen und das berechnete Ergebnis erläutern. Die passende Methode richtet sich nach der Aufgabe. [4] · [13]

## Konkrete Einsatzfelder

### Daten abfragen und Berichte erstellen

Beschäftigte können Fragen stellen wie: „Wie hat sich der Nettoumsatz im letzten abgeschlossenen Monat gegenüber dem Vorjahr verändert?“ Systeme für *Conversational Analytics* übersetzen solche Fragen in Abfragen und liefern Tabellen, Visualisierungen oder Erläuterungen. Microsoft dokumentiert für Power BI unter anderem Datenfragen, Berichtszusammenfassungen und die Erstellung von Berichtsseiten. Google beschreibt für Looker zusätzlich die Erzeugung und Ausführung von Python-Code für weitergehende Analysen. [1] · [3]

**Möglicher Nutzen:** Fachbereiche können einfache Anschlussfragen selbst bearbeiten; Analystinnen und Analysten erhalten schneller einen ersten Analyseentwurf. Das ist eine Nutzungshypothese. Wie viel Zeit tatsächlich gespart wird, muss einschließlich der notwendigen Kontrolle gemessen werden.

### Analysecode und Datenaufbereitung unterstützen

KI-Assistenten können bei der Arbeit mit SQL, Notebooks und Datenpipelines helfen. Databricks beschreibt dafür Genie Code als Assistenten für technische Anwender. Solche Werkzeuge können den Einstieg in eine Analyse erleichtern und wiederkehrende Arbeitsschritte unterstützen. [5]

**Beispiel, eigene Ableitung:** Eine Analystin lässt einen Entwurf für den Vergleich zweier Monatsbestände erstellen. Sie prüft anschließend Schlüssel, Dubletten, Datentypen und den Umgang mit fehlenden Werten. Dass ein Skript ohne Fehlermeldung läuft, genügt als fachliche Abnahme nicht.

### Texte für Auswertungen erschließen

KI kann Freitext in auswertbare Kategorien überführen. Snowflake bietet beispielsweise `AI_CLASSIFY`, um Texte, Bilder oder Dokumente vorgegebenen Kategorien zuzuordnen. Kategorien können durch Beschreibungen und Beispiele präzisiert werden. Die Dokumentation nennt zugleich Einschränkungen: Für Text empfiehlt sie englische Prosa; bei Dokumenten ist Englisch ausdrücklich vorgegeben. Sprachunterstützung und Qualität müssen deshalb für den konkreten Datenbestand geprüft werden. [14]

**Beispiel, eigene Ableitung:** Ein Unternehmen klassifiziert Supportnachrichten nach Anliegen und verbindet die Kategorien anschließend mit Bearbeitungszeit und Produktgruppe. So lässt sich untersuchen, welche Anliegen besonders häufig auftreten. Vor einer breiten Nutzung braucht es eine manuell geprüfte Stichprobe, einschließlich mehrdeutiger Nachrichten.

### Prognosen erstellen

Für Nachfrage, Auslastung oder andere zeitabhängige Größen kommen spezialisierte Prognosemodelle infrage. Die Chronos-Arbeit beschreibt vortrainierte Modelle für probabilistische Zeitreihenprognosen. In einem Vergleich über 42 Datensätze zeigten sie auf zuvor ungesehenen Datensätzen eine vergleichbare und teilweise bessere Leistung als eigens darauf trainierte Verfahren. Das ist ein Forschungsergebnis unter den dort beschriebenen Bedingungen. [6]

**Einordnung:** Vortrainierte Modelle können den Aufwand für erste Prognosen senken. Daraus folgt keine allgemeine Überlegenheit im eigenen Unternehmen. Ein Pilot sollte gegen eine einfache Referenz antreten, etwa den Wert der Vorwoche. Für eine Produktionsplanung sind neben dem Prognosefehler auch Unsicherheitsbereiche und die Kosten von Über- oder Unterplanung relevant. Dies sind Bewertungsvorschläge dieser Recherche.

### Mehrere Analyseschritte durch Agenten verbinden

Ein Analyseagent bearbeitet eine Aufgabe in mehreren Schritten: Daten und Dokumentation suchen, Code ausführen, Zwischenergebnisse prüfen und eine Antwort formulieren. DABstep untersucht genau solche Abläufe mit heterogenen Daten und fachlicher Dokumentation. Spider 2.0 betrachtet komplexe SQL-Arbeitsabläufe aus Unternehmensszenarien. Beide gehen damit über eine einzelne Übersetzung von Text nach SQL hinaus. [7] · [8]

**Möglicher Einsatz, eigene Ableitung:** Ein Agent untersucht einen Rückgang der Bestellungen nach Region, Kanal und Produkt und erstellt einen Bericht mit den verwendeten Abfragen. Die Freigabe von Maßnahmen sollte davon getrennt bleiben, solange seine fachliche Zuverlässigkeit nicht für diesen Prozess nachgewiesen ist.

## Warum Kennzahlendefinitionen entscheidend sind

„Umsatz“, „aktive Kunden“ oder „letzter Monat“ sind ohne Kontext mehrdeutig. Ein **semantisches Modell** hinterlegt die fachliche Bedeutung der Daten: Kennzahlen, Dimensionen und Beziehungen zwischen Tabellen. Snowflake beschreibt Semantic Views ausdrücklich als Verbindung zwischen Geschäftsbegriffen und gespeicherten Daten; Looker nutzt seine LookML-Definitionen als Grundlage für die Beantwortung von Datenfragen. [3] · [4]

**Beispiel, eigene Ableitung:** Für „Nettoumsatz im letzten Monat“ muss feststehen, ob Retouren abgezogen werden, welches Buchungsdatum zählt und ob der letzte abgeschlossene Kalendermonat gemeint ist. Eine technisch gültige Abfrage kann sonst eine fachlich andere Frage beantworten.

Microsoft bietet zur Vorbereitung von Daten für Copilot ein ausgewähltes Datenschema, KI-Anweisungen und geprüfte Antworten an. Änderungen lassen sich vor der Veröffentlichung testen. Microsoft weist darauf hin, dass diese Vorbereitung kein bestimmtes Ergebnis bei jeder Ausführung garantiert: Auch bei gleicher Eingabe können Antworten variieren. [2]

**Ableitung für Unternehmen:** Verantwortliche für Kennzahlen, gepflegte Beschreibungen und fachlich geprüfte Beispielfragen sind Teil des Betriebs einer KI-Analysefunktion. Ein Chatfenster allein schafft diese Grundlage nicht.

## Welche Werkzeuge diese Entwicklung zeigen

Die Auswahl illustriert unterschiedliche Ansätze und ist keine Rangliste. Verfügbarkeit und Umfang hängen unter anderem von Produktversion, Region, Berechtigungen und Vertrag ab.

| Werkzeug | Dokumentierter Schwerpunkt | Worauf bei der Bewertung zu achten ist |
| --- | --- | --- |
| Microsoft Power BI Copilot | Fragen zu Daten, Zusammenfassungen und Unterstützung beim Erstellen von Berichten. | Vorbereitung des semantischen Modells; administrative und kapazitätsbezogene Voraussetzungen. [1] · [2] |
| Google Looker Conversational Analytics | Datenfragen auf Basis von LookML; erweiterte Analysen mit Python. | Fachliche Definitionen und Prüfung der Ausgaben. Google warnt ausdrücklich vor plausibel wirkenden falschen Antworten. [3] |
| Snowflake Cortex Analyst / Cortex Agents | Natürlichsprachlicher Zugang zu strukturierten Daten und SQL-Erzeugung mit fachlichem Kontext. | Semantic Views und Rollenrechte. Die aktuelle Dokumentation empfiehlt den Übergang von Cortex Analyst zu Cortex Agents. [4] |
| Databricks Genie | Genie One für Datenfragen, Genie Agents für fachlich konfigurierte Datenumgebungen und Genie Code für technische Arbeit. | Konfiguration von Daten, Kennzahlen und Geschäftsregeln; Governance über Unity Catalog. [5] |

Die Produktunterlagen zeigen eine gemeinsame Richtung: Sprachmodelle werden mit kontrollierten Datenzugängen und fachlichen Definitionen verbunden. Das ist eine Einordnung der dokumentierten Funktionen, kein Beleg dafür, dass alle Produkte gleich zuverlässig arbeiten.

## Wie verlässlich sind die Ergebnisse?

### Was Benchmarks belegen – und was offenbleibt

| Untersuchung | Was geprüft wurde | Ergebnis im jeweiligen Veröffentlichungsstand |
| --- | --- | --- |
| Spider 2.0, Version vom 12. November 2024 | 632 Aufgaben aus komplexen Unternehmens-SQL-Arbeitsabläufen, teils mit mehr als 1.000 Spalten. | Das untersuchte Agentensystem löste 17,0 % der Aufgaben; auf Spider 1.0 erreichte es 91,2 %. [7] |
| DABstep, Version vom 30. Juni 2025 | Mehr als 450 mehrstufige Analyseaufgaben aus einer Finanzanalyseplattform. | Der beste in der Arbeit untersuchte Agent erreichte bei den schwierigsten Aufgaben 14,55 % Genauigkeit. [8] |

**Die Zahlen sind historische Versuchsergebnisse und keine Leistungsgrenze für November 2026.** Die Studien verwenden unterschiedliche Aufgaben und Testbedingungen; ihre Werte sind nicht direkt vergleichbar. Sie zeigen, warum gute Ergebnisse bei einfachen Abfragen keinen zuverlässigen Gesamtprozess belegen. Wie gut ein aktuelles System arbeitet, muss mit repräsentativen eigenen Aufgaben geprüft werden. Diese Schlussfolgerung ist eine Ableitung aus dem Versuchsaufbau beider Arbeiten.

### Typische Fehler und geeignete Kontrollen

| Risiko | Auswirkung auf die Analyse | Sinnvolle Kontrolle |
| --- | --- | --- |
| Überzeugend formulierte Falschaussage | Eine Erklärung wirkt belastbarer, als ihre Datengrundlage ist. | Zahlen und Aussagen mit Abfrage und Quelldaten abgleichen. NIST beschreibt dieses Risiko als „Confabulation“. [12] |
| Informationsleck im Modelltraining | Testdaten oder später verfügbare Informationen machen die gemessene Modellqualität unrealistisch gut. | Trainings- und Testdaten vor der Vorverarbeitung trennen; Transformationen nur auf Trainingsdaten lernen. [9] |
| Falsche zeitliche Prüfung | Ein Prognosemodell wird mit Zukunftsdaten trainiert und an früheren Daten bewertet. | Zeitlich geordnete Tests verwenden; scikit-learn beschreibt dafür `TimeSeriesSplit`. [10] |
| Zusammenhang wird als Ursache ausgelegt | Eine Maßnahme wird empfohlen, obwohl ihr Effekt nicht belegt ist. | Kausale Annahmen offenlegen und Robustheit prüfen. DoWhy strukturiert diese Arbeit in Modellierung, Identifikation, Schätzung und Widerlegungsversuche. [11] |
| Sensible Informationen gelangen in Ausgaben | Personen- oder Geschäftsdaten werden unzulässig offengelegt. | Datenumfang, Zugriff und Ausgaben kontrollieren. NIST nennt Datenoffenlegung und übermäßiges Vertrauen als eigenständige Risiken. [12] |

Der Vorschlag, diese Kontrollen in einem Unternehmensprozess zu kombinieren, ist eine eigene Ableitung. Zugriffsrechte sollten technisch durchgesetzt werden; Snowflake dokumentiert beispielsweise die Einbindung seiner rollenbasierten Rechte in Cortex Analyst. [4]

## Wie ein sinnvoller Pilot aussehen kann

Der folgende Vorschlag ist eine eigene Empfehlung, kein empirisch belegtes Erfolgsrezept. Er eignet sich etwa für die Unterstützung interner Vertriebsanalysen und lässt sich an die vorhandene Plattform anpassen.

1. **Eine Entscheidung und einen Datenbereich wählen.** Beispielsweise: monatliche Umsatzabweichungen erkennen und für das Vertriebsmeeting erklären. Kennzahlen, Datenstand und Zuständigkeiten vorab festhalten.
2. **Eine Referenz erstellen.** Fachleute beantworten beispielsweise 30 typische Fragen mit geprüften Abfragen. Dazu gehören schwierige Fälle wie Retouren, fehlende Werte und mehrdeutige Zeiträume. Die Zahl 30 ist ein Vorschlag für den Einstieg.
3. **Unbekannte Prüffragen zurückhalten.** Beispiele zur Einrichtung und Aufgaben zur Bewertung trennen, damit nicht nur hinterlegte Muster wiedererkannt werden. Bei Prognosen muss auch die zeitliche Reihenfolge erhalten bleiben. [9] · [10]
4. **Qualität und Gesamtaufwand vergleichen.** Fachliche Richtigkeit, Bearbeitungszeit einschließlich Kontrolle, Kosten und notwendige Korrekturen gegenüber dem bisherigen Ablauf messen. Eine richtige Antwort mit falschem Zeitraum gilt als Fehler.
5. **Freigabekriterien vor dem Versuch festlegen.** Beispielsweise: nach vier Wochen mindestens 95 % fachlich richtige Antworten im vereinbarten Testbestand, keine erfolgreiche unberechtigte Datenabfrage und mindestens 20 % weniger Gesamtbearbeitungszeit. Diese Werte sind vorgeschlagene Zielgrößen und müssen zum Risiko des Einsatzes passen.
6. **Änderungen erneut prüfen.** Den Testbestand bei Änderungen an Datenmodell, Kennzahlen, Anweisungen oder Modellversion wiederholen. Fehlerfälle ergänzen und im Betrieb eine verantwortliche Person benennen.

Ein bestandener Testbestand ist keine Garantie für alle späteren Fragen. Wirtschaftlich zählt der gesamte Ablauf: Einrichtung, Lizenzen, Datenbankabfragen, Betrieb und menschliche Kontrolle. Aus den hier geprüften Quellen lässt sich keine allgemeine Zeitersparnis oder Rendite für Data Analytics ableiten.

## Was sich für die Arbeit von Analystinnen und Analysten ableiten lässt

Die dokumentierten Funktionen unterstützen bereits den Zugang zu Daten und die technische Erstellung von Analysen. Gleichzeitig zeigen die methodischen Quellen, wie anspruchsvoll eine korrekte Prüfung bleibt. Eine plausible Entwicklung ist deshalb, dass sich Arbeit stärker auf gute Fragestellungen, verlässliche Kennzahlen und die Bewertung von Ergebnissen verlagert. Das ist eine fachliche Einordnung dieser Recherche und keine belegte Prognose zum Wegfall von Stellen. [1] · [5] · [9] · [11]

Für einen redaktionellen Beitrag bietet sich folgende Leitfrage an: **Wie wird aus einer schnellen KI-Antwort eine belastbare Analyse?** Daran lassen sich Nutzen, Voraussetzungen und Grenzen anhand eines verständlichen Unternehmensbeispiels erklären.

## Quellen

Alle Onlinequellen wurden am 9. November 2026 abgerufen. Bei laufend gepflegten Produktdokumentationen ist der Abrufstand maßgeblich. Die beiden Agenten-Benchmarks werden bewusst in festen Veröffentlichungsversionen zitiert.

1. Microsoft Learn, Produktdokumentation: [Copilot for Power BI overview][1]. Belegt Funktionen sowie Voraussetzungen und Grenzen des Einsatzes.
2. Microsoft Learn, Produktdokumentation, Aktualisierung vom 30. Mai 2026: [Prepare your data for AI to improve Copilot results (Preview)][2]. Belegt Datenschema, Anweisungen, geprüfte Antworten, Tests und nichtdeterministisches Verhalten.
3. Google Cloud, Produktdokumentation: [Conversational Analytics in Looker overview][3]. Belegt LookML als fachliche Grundlage, Datenfragen, Python-Analysen und die Warnung vor fehlerhaften Ausgaben.
4. Snowflake, Produktdokumentation: [Cortex Analyst][4]. Belegt SQL-Erzeugung, Semantic Views, Rollenrechte und die Empfehlung zum Übergang auf Cortex Agents.
5. Databricks, Produktdokumentation, Aktualisierung vom 27. Oktober 2026: [Genie][5]. Belegt Genie One, Genie Agents, Genie Code und die Einbindung von Unity Catalog.
6. Abdul Fatir Ansari et al. (2024), Forschungsarbeit, arXiv-Version 3 vom 4. November 2024: [Chronos: Learning the Language of Time Series][6]. Belegt vortrainierte probabilistische Zeitreihenmodelle und den Vergleich über 42 Datensätze.
7. Fangyu Lei et al. (2024), Benchmark-Arbeit, arXiv-Version 1 vom 12. November 2024: [Spider 2.0: Evaluating Language Models on Real-World Enterprise Text-to-SQL Workflows][7]. Belegt Umfang, Komplexität und die historischen Ergebnisse des untersuchten Systems.
8. Alex Egg et al. (2025), Benchmark-Arbeit, arXiv-Version 1 vom 30. Juni 2025: [DABstep: Data Agent Benchmark for Multi-step Reasoning][8]. Belegt Aufgabenart, Umfang und das historische Ergebnis auf den schwierigsten Aufgaben.
9. scikit-learn, technische Dokumentation: [Common pitfalls and recommended practices][9], insbesondere Abschnitt „Data leakage“. Belegt die Trennung von Trainings- und Testdaten sowie die korrekte Vorverarbeitung.
10. scikit-learn, technische Dokumentation: [TimeSeriesSplit][10]. Belegt zeitlich geordnete Trainings- und Testaufteilungen.
11. Amit Sharma und Emre Kiciman (2020), Methodenarbeit: [DoWhy: An End-to-End Library for Causal Inference][11]. Belegt die Rolle kausaler Annahmen und die vier Schritte einer Kausalanalyse.
12. NIST (Juli 2024), Risikoprofil NIST AI 600-1: [Artificial Intelligence Risk Management Framework: Generative Artificial Intelligence Profile (PDF)][12], insbesondere Abschnitte 2.2, 2.4 und 2.7. Belegt Falschaussagen, Datenschutzrisiken und Risiken menschlicher Überabhängigkeit.
13. scikit-learn, technische Dokumentation: [Supervised learning][13]. Belegt etablierte Verfahren wie Entscheidungsbäume, Random Forests und Gradient Boosting sowie Klassifikation und Regression.
14. Snowflake, Funktionsdokumentation: [AI_CLASSIFY][14]. Belegt die Klassifikation unstrukturierter Eingaben, die Nutzung von Kategorien und Beispielen sowie Sprachgrenzen.

[1]: https://learn.microsoft.com/en-us/power-bi/create-reports/copilot-introduction
[2]: https://learn.microsoft.com/en-us/power-bi/create-reports/copilot-prepare-data-ai
[3]: https://docs.cloud.google.com/looker/docs/conversational-analytics-overview
[4]: https://docs.snowflake.com/en/user-guide/snowflake-cortex/cortex-analyst
[5]: https://docs.databricks.com/aws/en/genie/
[6]: https://arxiv.org/abs/2403.07815v3
[7]: https://arxiv.org/abs/2411.07763v1
[8]: https://arxiv.org/abs/2506.23719v1
[9]: https://scikit-learn.org/stable/common_pitfalls.html
[10]: https://scikit-learn.org/stable/modules/generated/sklearn.model_selection.TimeSeriesSplit.html
[11]: https://arxiv.org/abs/2011.04216
[12]: https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf
[13]: https://scikit-learn.org/stable/supervised_learning.html
[14]: https://docs.snowflake.com/en/sql-reference/functions/ai_classify
