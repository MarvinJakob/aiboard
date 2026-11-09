# Modelle und Kosten: Wie finde ich das beste Preis-Leistungs-Verhältnis?

*Recherchestand: 9. November 2026*

## 1. Was „bestes Preis-Leistungs-Verhältnis“ bedeutet

Für die Auswahl eines KI-Modells ist die entscheidende Frage: **Was kostet mich eine erfolgreich erledigte Aufgabe in der benötigten Qualität?** Dazu gehören Modellaufrufe, Werkzeuge, Prüfung, Korrekturen und der anteilige Betrieb. Ein niedriger Tokenpreis ist nur ein Teil dieser Rechnung.

Diese Recherche konzentriert sich auf generative Sprachmodelle für Schreiben, Wissensarbeit, Datenverarbeitung und Softwareentwicklung. Sie verbindet aktuelle Preisbeispiele mit einer Methode für eigene Vergleiche. Es wurden keine eigenen Modelltests durchgeführt. Die Beispielrechnungen und das Bewertungsraster sind eigene Vorschläge; ihre Annahmen sind ausdrücklich gekennzeichnet.

Die methodische Grundlage: Stanford empfiehlt mit HELM, mehrere Eigenschaften unter vergleichbaren Bedingungen zu messen. Die offizielle OpenAI-Dokumentation zur Modellwahl empfiehlt, Qualitätskriterien vorher festzulegen und neben der Ergebnisqualität auch Bearbeitungs-, Prüf- und Korrekturzeit zu vergleichen. [1] · [2]

**Abgeleitete Entscheidungsregel:** Zuerst müssen Qualität, Datenschutz, benötigte Funktionen und Wartezeit die Mindestanforderungen erfüllen. Unter den geeigneten Varianten wird diejenige mit den niedrigsten Gesamtkosten pro akzeptiertem Ergebnis gewählt. Ein Modell mit besseren Antworten kann wirtschaftlicher sein, obwohl seine API mehr kostet.

Ergänzend behandelt die vorhandene Recherche [Kosten von KI aus Nutzersicht](2026-11-05%20Kosten%20von%20KI%20aus%20Nutzersicht.md) Abos, Lizenzen und Einführungskosten ausführlicher. Die vorliegende Recherche vertieft die Modellauswahl.

## 2. Was genau verglichen wird

Ein Modellname allein beschreibt das eingesetzte Angebot nicht vollständig. Artificial Analysis unterscheidet zwischen Modell, Anbieter und API-Endpunkt. Ein Modell kann über mehrere Anbieter erreichbar sein; unterschiedliche Tokenizer zerlegen denselben Text in unterschiedlich viele Tokens. [3]

Für einen nachvollziehbaren Vergleich sollte deshalb jede Variante als vollständige Konfiguration dokumentiert werden:

| Bestandteil | Was festgehalten wird |
| --- | --- |
| Modell | Exakte Modell-ID, Version bzw. Snapshot und Testdatum |
| Zugang | Chat-Anwendung, direkte API, Cloud-Plattform, Vermittler oder eigener Betrieb |
| Endpunkt | Anbieter, Verarbeitungsregion und Tarif bzw. Geschwindigkeitsstufe |
| Einstellungen | Denkaufwand, Ausgabelimit und verfügbare Sampling-Einstellungen |
| Arbeitsablauf | Prompt, Dokumentensuche, Werkzeuge, erlaubte Schritte und Wiederholungen |
| Betrieb | Cache-Nutzung, Parallelität und bei eigenem Hosting Hardware, Laufzeit und Quantisierung |

Die Tabelle ist ein vorgeschlagenes Testprotokoll. Sie verhindert beispielsweise, dass ein einfaches Chat-Modell mit einem Agenten verglichen wird, der zusätzlich recherchiert und Code ausführt, ohne diesen Unterschied auszuweisen.

**Für Abos:** Verglichen wird das gesamte Produkt im eigenen Arbeitsablauf. Prüfen, welche Modelle und Funktionen enthalten sind, welche Nutzungslimits gelten und ob API-Nutzung oder API-Guthaben abgedeckt sind. Für die Kostenrechnung die tatsächliche monatliche Rechnung durch die akzeptierten Ergebnisse teilen. Bereits bezahlte, aber ungenutzte Plätze erhöhen die Kosten pro aktivem Nutzer.

**Für APIs:** Modellqualität und Verbrauch je Aufgabe messen. Den Tokenpreis anschließend auf den tatsächlich gemessenen Verbrauch anwenden.

**Für selbst betriebene Modelle:** Die konkrete Betriebsvariante testen. Ein Modell auf eigener Hardware muss dieselben Qualitäts- und Zeitziele erfüllen wie die API-Alternativen.

## 3. Was öffentliche Vergleiche leisten

| Quelle | Wofür sie hilfreich ist | Was für die eigene Entscheidung offenbleibt |
| --- | --- | --- |
| [Artificial Analysis](https://artificialanalysis.ai/methodology/) | Vergleicht Fähigkeiten, Preise und API-Leistung. Die Methodik erläutert auch Kosten je Benchmark-Aufgabe und die Annahmen hinter Mischpreisen. [3] | Die Aufgabenverteilung und Cache-Nutzung des eigenen Unternehmens können anders aussehen. |
| [Arena](https://help.arena.ai/articles/7011479247-how-to-see-ai-rankings-in-arena-leaderboards) | Menschliche Präferenzen aus direkten Antwortvergleichen; Ranglisten mit Unsicherheitsangaben. [4] · [5] | Eine bevorzugte Antwort ist noch kein Nachweis, dass sie alle fachlichen Kriterien des eigenen Prozesses erfüllt. |
| [HELM](https://crfm.stanford.edu/2022/11/17/helm.html) | Methodischer Rahmen für standardisierte Tests über mehrere Aufgaben und Eigenschaften. [1] | Man muss die passende Testsammlung auswählen und die Abdeckung der eigenen Sprache und Domäne prüfen. |
| [LiveBench](https://arxiv.org/abs/2406.19314) | Aktualisierte Aufgaben und objektiv auswertbare Antworten sollen den Einfluss bekannter Trainingsaufgaben und subjektiver Bewertung begrenzen. [6] | Auch diese Aufgaben bilden nur einen Ausschnitt realer Arbeit ab. |
| [OpenRouter](https://openrouter.ai/) | Einstieg in Modell- und Anbieterangebote sowie deren Preise; Zugang über eine gemeinsame Plattform. [7] | Zugangskosten, gewählter Anbieter und tatsächliche Leistung im eigenen Workflow müssen mitverglichen werden. |

**So lassen sich Ranglisten sinnvoll lesen:**

- Die zur Aufgabe passende Kategorie ansehen: Gute Mathematikergebnisse belegen beispielsweise noch keine gute deutsche Geschäftskorrespondenz.
- Exakte Modellversion, Denkaufwand, Werkzeuge, Testdatum und Benchmark-Version vergleichen. Änderungen an der Methodik können die Vergleichbarkeit beeinflussen.
- Unsicherheit beachten. Arena weist neben dem rechnerischen Rang eine Rangspanne aus; überlappende Spannen sprechen gegen einen eindeutigen Rangunterschied nach dieser Methode. [5]
- Verfügbarkeit und Bedingungen prüfen: Ein Benchmark-Ergebnis sagt nicht, dass dieselbe Variante im eigenen Tarif oder in der benötigten Region verfügbar ist.
- Keine Kennzahl wie „Arena-Punkte pro Dollar“ als alleinige Entscheidung verwenden. Ein Ranglistenscore ist keine Zahl erfolgreich erledigter eigener Aufgaben.

Diese Leseregeln sind methodische Schlussfolgerungen. Öffentliche Tests helfen bei der Vorauswahl. Für eine Beschaffung oder einen Modellwechsel braucht es zusätzlich eigene Aufgaben mit klaren Erfolgskriterien. LiveBench beschreibt ausdrücklich das Problem der Testdatenkontamination: Gelangen Benchmark-Aufgaben ins Training, kann das einen fairen Leistungsvergleich beeinträchtigen. Aktualisierung soll dieses Risiko reduzieren. [6]

## 4. Welche Kosten in die Rechnung gehören

### 4.1 Direkte API-Kosten

Die Preislisten von OpenAI, Anthropic und Google unterscheiden Eingabe- und Ausgabetokens sowie Cache- und Zusatzleistungen. Bei Google umfasst der ausgewiesene Ausgabepreis auch Thinking-Tokens. Anthropic dokumentiert zusätzlich Tokenverbrauch durch Werkzeugdefinitionen und Werkzeugergebnisse. [8] · [9] · [10]

Für eine reine Textanfrage lässt sich daraus folgendes Rechenschema ableiten:

```text
Modellkosten =
  (ungecachte Eingabetokens × Eingabepreis
   + Cache-Lesetokens × Cache-Lesepreis
   + Cache-Schreibtokens × Cache-Schreibpreis
   + abrechenbare Ausgabetokens × Ausgabepreis) / 1.000.000

API-Kosten = Summe aller Modellkosten
            + Werkzeuggebühren + Cache-Speichergebühren
            + sonstige Plattform- und Verarbeitungsgebühren
```

Die Preise sind hier jeweils Preise pro Million Tokens. Eingabekategorien müssen sich gegenseitig ausschließen. Cache-Schreiben nur getrennt ansetzen, wenn der Tarif es so abrechnet; keinen vollständigen Eingabepreis zusätzlich auf dieselben Tokens anwenden. Ebenso interne Denktokens nicht ein zweites Mal addieren, wenn sie bereits in den gemeldeten Ausgabetokens enthalten sind. Maßgeblich bleiben die Abrechnungsfelder und Regeln des konkreten Anbieters.

Bei einem Agenten ist die **gesamte Aufgabe** die Recheneinheit: Planung, Suche, Werkzeugergebnisse, Folgeschritte, Wiederholungen und gegebenenfalls die Eskalation an ein weiteres Modell zusammenzählen. Auch fachlich unbrauchbare, aber technisch erfolgreich erzeugte Antworten verursachen Verbrauch.

OpenRouter nennt beispielsweise eine Gebühr beim Guthabenkauf von 5,5 % für Standard und 8 % für Business; die Inferenzpreise werden laut Anbieter ohne Aufschlag weitergereicht. Diese Zugangsgebühr gehört zusätzlich in den Vergleich mit einer direkten API. [7]

### 4.2 Gesamtkosten

Das folgende Schema ist ein eigener betriebswirtschaftlicher Vorschlag:

```text
Gesamtkosten im Zeitraum =
  Lizenz- und API-Kosten
  + Infrastruktur und laufender Betrieb
  + anteilige Einführung und Integration
  + menschliche Bearbeitungs-, Prüf- und Korrekturzeit × Stundensatz
  + zurechenbare Fehlerfolgekosten

Kosten pro akzeptiertem Ergebnis =
  Gesamtkosten / Zahl der Ergebnisse, die die festgelegten Kriterien erfüllen
```

Verworfene Versuche bleiben im Zähler. Wenn kein Ergebnis akzeptiert wird, lässt sich kein endlicher Stückpreis berechnen. Zusätzlich die Erledigungsquote ausweisen, damit ein Modell mit wenigen gelungenen Ergebnissen nicht wirtschaftlicher erscheint, als es ist. Bei Vergleichen mit dem bisherigen Prozess dieselben Aufgaben und dieselben Qualitätsanforderungen verwenden.

Wartezeit und aktive Arbeitszeit getrennt erfassen: Wenn eine Person während der Modellausführung andere Arbeit erledigt, sollte die gesamte Wartezeit nicht automatisch als voller Personalaufwand angesetzt werden. Blockiert die Wartezeit den Prozess, muss ihr wirtschaftlicher Effekt gesondert bewertet werden.

Fehler, die einen Einsatz ausschließen, als Ausschlusskriterium behandeln. Andere Fehlerfolgen lassen sich in Szenarien bewerten, etwa mit einer angenommenen Fehlerhäufigkeit und durchschnittlichen Korrekturkosten. Solche Annahmen getrennt von gemessenen Ausgaben ausweisen und keine Genauigkeit vortäuschen.

## 5. Aktuelle Preisbeispiele und ihre Aussagegrenzen

Die folgende Auswahl illustriert Preisunterschiede, sie ist keine vollständige Marktübersicht oder Qualitätsrangliste. **US-Dollar je Million Tokens, direkte bezahlte Standard-API, Text, ohne Cache, Werkzeuge, Sonderrabatte und zusätzliche regionale Gebühren.** OpenAI: kurze Kontextstufe; Claude Haiku 5.5: bis 100.000 Eingabetokens je Anfrage. Preisstand laut den am 9. November 2026 recherchierten Quellen. [8] · [9] · [10]

| Modell-ID bzw. Modellbezeichnung | Eingabe je Mio. Tokens | Ausgabe je Mio. Tokens | Modellkosten für das Beispielszenario |
| --- | ---: | ---: | ---: |
| OpenAI `gpt-6-luna` | 0,10 $ | 0,50 $ | **4,50 $** |
| OpenAI `gpt-6.1-terra` | 1,00 $ | 5,00 $ | **45,00 $** |
| OpenAI `gpt-6.1-sol` | 2,00 $ | 10,00 $ | **90,00 $** |
| OpenAI `gpt-6-astra` | 10,00 $ | 50,00 $ | **450,00 $** |
| Anthropic Claude Haiku 5.5 | 0,10 $ | 0,50 $ | **4,50 $** |
| Anthropic Claude Sonnet 5.5 | 2,00 $ | 10,00 $ | **90,00 $** |
| Anthropic Claude Opus 5.5 | 4,00 $ | 20,00 $ | **180,00 $** |
| Google `gemini-3.1-flash-lite` | 0,25 $ | 1,50 $ | **12,50 $** |

**Eigene Rechenannahme:** 10.000 Aufrufe mit jeweils 2.000 Eingabe- und 500 insgesamt abrechenbaren Ausgabetokens. Das ergibt 20 Mio. Eingabe- und 5 Mio. Ausgabetokens. Beispiel Sol: `20 × 2 $ + 5 × 10 $ = 90 $`.

Die Tabelle isoliert den Preiseffekt bei identischer Tokenmenge. In der Praxis können Modelle unterschiedlich lange antworten, unterschiedlich viel intern rechnen und unterschiedlich viele Versuche benötigen. Auch die Tokenisierung kann abweichen. [3] Deshalb ist die Tabelle eine Budgetillustration; die tatsächlichen Kosten müssen aus den Messwerten eigener Aufgaben entstehen.

Für eine Entscheidung in Euro sind ein dokumentierter Umrechnungskurs, gegebenenfalls Wechselgebühren und die einheitliche Behandlung von Steuern nötig. Hier wurde kein Wechselkurs unterstellt. Vor Einkauf oder Produktivbetrieb Preise und Tarifbedingungen erneut prüfen.

**Transparenz zur Google-Quelle:** Die Preisangaben waren über den Suchindex der offiziellen Preisdokumentation lesbar. Der direkte Seitenabruf scheiterte im Recherchewerkzeug am ausgelieferten Markdown-Inhalt. Google wurde deshalb nur mit dem eindeutig zugeordneten Flash-Lite-Preisbeispiel aufgenommen. [10]

## 6. Wann ein höherer Modellpreis wirtschaftlicher ist

**Vollständig hypothetisches Beispiel, keine gemessenen Modellleistungen:** Zwei Varianten bearbeiten dieselben 100 Aufgaben. Nach menschlicher Prüfung und Korrektur werden in beiden Fällen alle 100 Ergebnisse akzeptiert. Der kalkulatorische Stundensatz beträgt 60 US-Dollar; damit kostet eine Minute Arbeitszeit 1 US-Dollar. Gemeinsame Fixkosten werden in diesem Vergleich weggelassen.

| Position für 100 Aufgaben | Variante A | Variante B |
| --- | ---: | ---: |
| API-Verbrauch einschließlich aller Versuche | 2 $ | 20 $ |
| Menschliche Prüfung | 20 Minuten = 20 $ | 20 Minuten = 20 $ |
| Zusätzliche Korrekturarbeit | 60 Minuten = 60 $ | 15 Minuten = 15 $ |
| **Gesamtkosten** | **82 $** | **55 $** |
| **Kosten pro akzeptiertem Ergebnis** | **0,82 $** | **0,55 $** |

Variante B kostet in diesem Beispiel bei der API das Zehnfache, insgesamt aber rund **33 % weniger**. Die Erklärung ist die angenommene Einsparung von 45 Minuten Korrekturarbeit.

Für die Entscheidung genügt folgende eigene Schwellenrechnung: Der API-Aufpreis beträgt 18 $. Bei 60 $ je Stunde muss B mehr als 18 Minuten Arbeitszeit pro 100 Aufgaben sparen, damit es wirtschaftlicher wird. Weitere Qualitäts-, Betriebs- und Fehlerkosten müssen dabei gleich sein oder zusätzlich eingerechnet werden.

Der kalkulatorische Wert eingesparter Zeit ist nicht automatisch eine gesunkene Zahlung. Ob Ausgaben entfallen oder zusätzliche Kapazität entsteht, hängt vom tatsächlichen Arbeitseinsatz ab.

## 7. Ein praktikabler eigener Modellvergleich

Die offizielle OpenAI-Dokumentation empfiehlt aufgabenspezifische Tests, repräsentative Daten, Protokollierung und die Abstimmung automatischer Bewertungen mit menschlichen Urteilen. Sie weist außerdem auf Reihenfolge- und Längenverzerrungen bei bewertenden Sprachmodellen hin. [11]

Der folgende Ablauf ist ein daraus und aus HELM abgeleiteter Vorschlag für einen Pilotvergleich. Zahlen und Grenzwerte sind **Beispiele**, keine allgemein gültigen Qualitätsstandards. [1]

### Schritt 1: Aufgabe und Mindestqualität festlegen

Eine konkrete Aufgabe auswählen, etwa „Rechnungsdaten in das vorgegebene JSON-Schema übertragen“. Vor dem Test schriftlich festlegen, was als Erfolg zählt. Beispiel für eine Pilotfreigabe:

- Mindestens 95 von 100 unabhängig zurückgehaltenen Testfällen sind vollständig korrekt.
- Bei fehlenden Pflichtangaben wird eine Prüfung angefordert, statt Werte zu erfinden.
- Keine unbemerkte falsche Bankverbindung in den Testfällen.
- 95 % der Vorgänge liefern innerhalb von zehn Sekunden das vollständige Ergebnis.
- Die Gesamtkosten liegen bei höchstens 0,10 € pro akzeptiertem Ergebnis unter den dokumentierten Pilotannahmen.

Datenverarbeitung, Lizenz, Funktionen und benötigte Region vorab als Eignungskriterien prüfen. Die fachlich passende Akzeptanzschwelle bestimmt der Prozessverantwortliche.

### Schritt 2: Eigene Testfälle zusammenstellen

Für einen ersten Überblick beispielsweise 30 Fälle verwenden, für den eigentlichen Pilot anschließend 100 neue, zurückgehaltene Fälle. Typische Mengenverhältnisse abbilden und schwierige Fälle zusätzlich als eigene Gruppe auswerten: deutsche Texte, kurze und lange Dokumente, fehlende Informationen, widersprüchliche Angaben und ungewohnte Formate. Referenzantworten fachlich prüfen. Kundendaten nur unter den dafür freigegebenen Bedingungen verwenden.

Die Zahlen sind ein praktikabler Startpunkt. Die nötige Stichprobengröße hängt von Fehlertoleranz und gewünschter Sicherheit ab. Wiederholungen derselben Fälle ersetzen keine Vielfalt unabhängiger Aufgaben.

### Schritt 3: Drei bis fünf Kandidaten testen

Eine kostengünstige, eine mittlere und eine leistungsorientierte Variante sowie bei Bedarf eine selbst betriebene Variante auswählen. Zunächst dieselben fachlichen Anweisungen, Quelldaten und Werkzeuge verwenden. Zeit-, Kosten- und Schrittlimits vorab festlegen. Einstellungen nur dort gleichsetzen, wo sie tatsächlich vergleichbar sind; ein herstellerübergreifendes „medium“ garantiert keinen identischen Denkaufwand.

Danach für aussichtsreiche Kandidaten eine zweite Runde mit jeweils sinnvoll angepassten Prompts und Einstellungen durchführen. Allen dasselbe Optimierungsbudget geben, etwa zwei Stunden. Die endgültigen Varianten am zurückgehaltenen Testsatz prüfen. So werden sowohl die Ausgangsleistung als auch die erreichbare Leistung der optimierten Lösung sichtbar.

### Schritt 4: Ergebnis und Aufwand gemeinsam messen

| Messgröße | Praktische Erfassung |
| --- | --- |
| Erfolg im ersten Versuch | Vollständig richtige Ergebnisse geteilt durch alle Aufgaben |
| Endgültige Erledigungsquote | Nach erlaubten Wiederholungen und Korrekturen akzeptierte Ergebnisse geteilt durch alle Aufgaben |
| Kritische Fehler | Anzahl und Art je Aufgabengruppe; nicht im Durchschnitt verstecken |
| Format und Werkzeuge | Schema-, Validierungs- und Funktionstests sowie korrekt ausgeführte Aktionen |
| Geschwindigkeit | Zeit bis zur ersten nutzbaren Antwort und bis zum fertigen Ergebnis; Median und 95. Perzentil |
| Verbrauch | Tatsächlich abgerechnete Tokens, Cache, Werkzeuge und alle Folgeaufrufe |
| Menschlicher Aufwand | Aktive Minuten für Bearbeitung, Prüfung, Korrektur und Freigabe |
| Zuverlässigkeit | Timeouts, Rate Limits, Abbrüche und unvollständige Vorgänge |
| Wirtschaftlichkeit | Gesamtkosten je akzeptiertem Ergebnis und erwartete Monatskosten |

Das 95. Perzentil bedeutet: 95 % der gemessenen Vorgänge sind höchstens so langsam wie dieser Wert. Eine einzelne Geschwindigkeitszahl reicht nicht aus. Artificial Analysis unterscheidet unter anderem zwischen Zeit bis zum ersten Token und bis zum ersten Antworttoken; bei Reasoning-Modellen kann dazwischen Denkzeit liegen. Die Methodik weist zudem auf Einflüsse von Standort, Last und Quantisierung hin. [12]

Für die eigene Prozesszeit auch Werkzeuglaufzeiten, Warteschlangen und Wiederholungen einbeziehen. Bei schwankenden Ergebnissen ausgewählte Fälle beispielsweise dreimal ausführen. Läufe zeitlich mischen, um einen Anbieter nicht nur in einer günstigen Lastsituation zu messen.

### Schritt 5: Qualität nachvollziehbar bewerten

Wo möglich, automatisch prüfen: Pflichtfelder, Rechenergebnisse, Quellenabgleich oder erfolgreiche Softwaretests. Bei Schreibaufgaben Kriterien wie Faktentreue, Vollständigkeit und Zielgruppenpassung getrennt beurteilen. Modellnamen bei manuellen Vergleichen ausblenden und die Reihenfolge wechseln. Einen KI-Bewerter zunächst an fachlich bewerteten Beispielen kalibrieren und kritische Fälle menschlich prüfen. [11]

Kleine Unterschiede vorsichtig behandeln. 94 gegenüber 95 Erfolgen bei 100 Aufgaben belegt allein noch keinen stabilen Vorteil. Auch null beobachtete kritische Fehler garantieren keine Fehlerfreiheit: Unter der vereinfachenden Annahme unabhängiger Fälle liegt bei null Fehlern in 100 Fällen die einseitige obere 95-%-Grenze der Fehlerwahrscheinlichkeit bei rund 3 %. Eigene Berechnung: `1 − 0,05^(1/100) ≈ 2,95 %`. Für sehr seltene, schwerwiegende Fehler sind entsprechend umfangreichere Prüfungen nötig.

### Schritt 6: Entscheiden und später erneut prüfen

Zunächst ungeeignete Varianten aussortieren. Dann Kosten je akzeptiertem Ergebnis vergleichen. Bleibt ein Zielkonflikt, etwa zwischen Qualität und Wartezeit, die Alternativen sichtbar nebeneinanderstellen. Eine Variante kann entfallen, wenn eine andere bei allen relevanten Kriterien mindestens gleich gut und bei mindestens einem besser ist. Das ist die Idee eines Pareto-Vergleichs.

Für die Freigabe einen kurzen Entscheidungsvermerk führen: gewählte Konfiguration, Testdatum, Datensatzversion, Ergebnisse nach Aufgabengruppe, Gesamtkosten, Einschränkungen und Wechselkriterien. Nach Modell-, Prompt- oder Workflowänderungen betroffene Fälle erneut testen. Beispielsweise monatlich die tatsächlichen Stückkosten und Fehlerklassen kontrollieren; der passende Rhythmus hängt vom Einsatz ab.

## 8. Welche Optimierungen sich prüfen lassen

| Hebel | Konkreter Versuch | Was mitgeprüft werden muss |
| --- | --- | --- |
| Günstigere Variante | Ein günstigeres Modell oder weniger Denkaufwand testen | Besteht es dieselben Qualitätskriterien? OpenAI empfiehlt Vergleiche bei gleichem Input und anschließende Variation des Denkaufwands. [2] |
| Kürzere Ein- und Ausgaben | Nur relevante Dokumentauszüge senden und das benötigte Antwortformat festlegen | Bleiben wesentliche Informationen und Begründungen erhalten? |
| Prompt-Cache | Wiederkehrenden Kontext im geeigneten Cache-Verfahren verarbeiten | Tatsächliche Trefferquote sowie Schreib-, Lese- und Speicherkosten; bei seltenen Wiederholungen gesondert rechnen. [8] · [9] · [10] |
| Batch-Verarbeitung | Zeitunkritische Aufgaben gesammelt ausführen | Passt die längere Bereitstellungszeit zum Prozess? Anthropic nennt 50 % Rabatt auf Ein- und Ausgabetokens im Batch-Verfahren. [9] |
| Regeln vor dem Modell | Eindeutige Berechnungen und Validierungen mit klassischer Software erledigen | Wartungsaufwand und Randfälle der Regeln mitberücksichtigen. |
| Routing | Aufgaben nach gemessener Eignung an unterschiedliche Modelle verteilen | Routerkosten, Fehlzuordnungen und Ergebnisqualität der gesamten Lösung testen. RouteLLM untersucht diesen Ansatz. [13] |
| Begrenzte Eskalation | Bei nachgewiesenem Fehler an ein anderes Modell oder einen Menschen übergeben | Alle Versuche und Kontrollen addieren; Selbsteinschätzungen des Modells nicht ungeprüft als Fehlererkennung verwenden. |

Die praktischen Versuche sind eigene Empfehlungen. Die Arbeit zu RouteLLM zeigt das Potenzial der Modellverteilung unter ihren jeweiligen Testbedingungen. Daraus folgt keine allgemeine Einspargarantie für heutige Modelle oder eigene Prozesse. [13]

Für ein Budget zusätzlich Normalbetrieb, niedrige Cache-Trefferquote sowie Spitzenlast mit mehr Wiederholungen kalkulieren. Ein technisches Limit für Aufrufe, Schritte und Verbrauch im eigenen Workflow sollte separat von Kostenbenachrichtigungen definiert und getestet werden.

## 9. Wann sich eigener Betrieb rechnen kann

Die eigenen Modellgewichte zu betreiben ist eine weitere Beschaffungsvariante. Artificial Analysis weist darauf hin, dass öffentlich verfügbare Gewichte nicht automatisch einer Open-Source-Lizenz entsprechen. Die konkreten Nutzungsrechte müssen geprüft werden. [3] Bei lokaler Inferenz verlangt mehr Kontext zusätzlichen Speicher; Ollama dokumentiert diesen Zusammenhang ausdrücklich. [14]

Für einen wirtschaftlichen Vergleich folgende Positionen ansetzen: anteilige Anschaffung oder GPU-Miete, Strom, Speicher, Administration, Updates, Überwachung und benötigte Ausfallreserve. Qualität und Geschwindigkeit mit der tatsächlich eingesetzten Quantisierung messen. Hoher theoretischer Token-Durchsatz hilft der Rechnung nur, wenn ausreichend geeignete Aufgaben anfallen und die Latenzziele unter Last erreicht werden.

**Eigene Beispielrechnung, keine Hardwareempfehlung:** Ein selbst betriebener Dienst kostet monatlich 300 € fix und 0,005 € variabel je Aufgabe. Eine gleich geeignete API kostet 0,02 € je Aufgabe. Bei gleichem menschlichem Aufwand liegt der rechnerische Schnittpunkt bei:

```text
300 € / (0,02 € − 0,005 €) = 20.000 Aufgaben pro Monat
```

Unterhalb dieser Menge wäre die API in diesem Beispiel günstiger, oberhalb der eigene Betrieb. Die Aussage gilt nur, wenn 20.000 Aufgaben in der geforderten Qualität und Zeit auf der kalkulierten Infrastruktur verarbeitet werden können. Mehr Administration oder benötigte Reserve verschieben den Schnittpunkt. Sind die variablen Kosten des eigenen Betriebs bereits höher als die der API, gibt es unter diesen Annahmen keinen solchen Schnittpunkt.

## 10. Vorlage für eine Entscheidung

Die folgende Tabelle kann für einen Pilot ausgefüllt werden. Für alle Kandidaten dieselben Aufgaben, Bewertungsregeln und Kostenabgrenzungen verwenden.

| Kriterium | Bisheriger Prozess | Kandidat A | Kandidat B | Kandidat C |
| --- | --- | --- | --- | --- |
| Modell-/Prozessversion und Datum | offen | offen | offen | offen |
| Mindestanforderungen erfüllt? | offen | offen | offen | offen |
| Erfolg im ersten Versuch | offen | offen | offen | offen |
| Endgültig akzeptierte Ergebnisse / Aufgaben | offen | offen | offen | offen |
| Kritische Fehler nach Kategorie | offen | offen | offen | offen |
| Fertigstellungszeit: Median / p95 | offen | offen | offen | offen |
| Aktive menschliche Minuten je Aufgabe | offen | offen | offen | offen |
| Direkte Kosten im Testzeitraum | offen | offen | offen | offen |
| Gesamtkosten je akzeptiertem Ergebnis | offen | offen | offen | offen |
| Erwartete Monatskosten bei Zielmenge | offen | offen | offen | offen |
| Unsicherheiten und Einschränkungen | offen | offen | offen | offen |

**Ergebnis der Recherche:** Ein belastbarer Preis-Leistungs-Vergleich entsteht aus Mindestqualität, eigenen Testaufgaben und vollständig erfassten Kosten. Die Modellauswahl bleibt vorläufig, bis diese Messwerte vorliegen. Für viele Prozesse ist außerdem eine Kombination aus Regeln, günstigen Modellen und gezielter Eskalation eine prüfenswerte Alternative zum einheitlichen Einsatz eines Modells.

## Quellen

Alle Quellen wurden am 9. November 2026 recherchiert. Preislisten sind veränderlich. Anbieterquellen belegen ihre eigenen Tarife und Verfahren; sie sind kein unabhängiger Nachweis einer überlegenen Modellqualität. Die Benchmark-Quellen beschreiben die jeweils eigene Methodik.

1. Stanford CRFM (2022): Standardisierte Aufgaben, mehrere Qualitätsdimensionen und offengelegte Abdeckung. [Language Models are Changing AI: The Need for Holistic Evaluation][1]
2. OpenAI: Auswahl nach Aufgabe, Qualität, Zeit einschließlich Nacharbeit und Denkaufwand. [Model selection][2]
3. Artificial Analysis: Begriffe für Modelle und Endpunkte, native Tokens, Mischpreise, Kosten pro Aufgabe und Open Weights. [Benchmarking Methodology][3]
4. Arena: Ranglisten auf Grundlage menschlicher Präferenzvergleiche. [How to see AI Rankings in Arena Leaderboards][4]
5. Arena (aktualisiert 2026): Konfidenzintervalle und Rangspannen. [Arena’s Ranking Method][5]
6. White et al. (2024, überarbeitet 2025): Testdatenkontamination, aktualisierte Aufgaben und objektive Bewertung. [LiveBench: A Challenging, Contamination-Limited LLM Benchmark][6]
7. OpenRouter: Plattformtarife, Guthabengebühren und Weitergabe der Inferenzpreise. [Pricing][7]
8. OpenAI: Modellpreise, Verarbeitungsstufen, Cache und Werkzeuggebühren. [API Pricing][8]
9. Anthropic: Claude-Preise, Kontextgrenzen, Cache, Batch und Werkzeugverbrauch. [Pricing – Claude Platform Docs][9]
10. Google: Gemini-3.1-Flash-Lite-Preise für Standard, Batch, Cache sowie abrechenbare Thinking-Tokens. Offizielle Preisdokumentation über den Suchindex ausgewertet; direkter Abruf technisch eingeschränkt. [Gemini Developer API Pricing][10]
11. OpenAI: Aufgabenspezifische Evaluation, repräsentative Fälle, menschliche Kalibrierung und Verzerrungen bei KI-Bewertern. Die Recherche verwendet die allgemeinen methodischen Hinweise, keine Empfehlung der dort ebenfalls beschriebenen Evals-Plattform. [Evaluation best practices][11]
12. Artificial Analysis (Methodik-Version vom 3. November 2026): Antwortlatenz, Gesamtdauer, Last, Fehler und Grenzen der Messung. [Language Model API Performance Benchmarking][12]
13. Ong et al. / LMSYS (2024): Modellrouting als Ansatz zur Kosten-Qualitäts-Optimierung. [RouteLLM: An Open-Source Framework for Cost-Effective LLM Routing][13]
14. Ollama: Zusammenhang zwischen Kontextlänge und Speicherbedarf. [Context length][14]

[1]: https://crfm.stanford.edu/2022/11/17/helm.html
[2]: https://developers.openai.com/api/docs/guides/model-selection
[3]: https://artificialanalysis.ai/methodology/
[4]: https://help.arena.ai/articles/7011479247-how-to-see-ai-rankings-in-arena-leaderboards
[5]: https://arena.ai/blog/ranking-method
[6]: https://arxiv.org/abs/2406.19314
[7]: https://openrouter.ai/pricing
[8]: https://developers.openai.com/api/docs/pricing
[9]: https://platform.claude.com/docs/en/about-claude/pricing
[10]: https://ai.google.dev/gemini-api/docs/pricing
[11]: https://developers.openai.com/api/docs/guides/evaluation-best-practices
[12]: https://artificialanalysis.ai/methodology/performance-benchmarking
[13]: https://www.lmsys.org/blog/2024-07-01-routellm/
[14]: https://docs.ollama.com/context-length
