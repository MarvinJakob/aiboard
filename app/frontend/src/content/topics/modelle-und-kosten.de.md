# Modelle und Kosten: Wie finde ich das beste Preis-/Leistungsverhältnis?

*Stand: 9. November 2026.*

## Metadaten der Themenseite

- **Slug:** `modelle-und-kosten`
- **Label:** Modelle und Kosten
- **Titel:** Modelle und Kosten: Wie finde ich das beste Preis-/Leistungsverhältnis?
- **Untertitel:** Wie finde ich das beste Preis-/Leistungsverhältnis?
- **Kurzbeschreibung:** Warum das günstigste Modell nicht automatisch die beste Wahl ist und wie Sie Preis und Leistung selbst vergleichen.
- **Einführung:** Ein niedriger Preis je Token sagt wenig darüber aus, was ein brauchbares Ergebnis kostet. Diese Seite zeigt, welche Kosten in die Rechnung gehören, was öffentliche Vergleiche leisten und wie Sie mit eigenen Testaufgaben das passende Modell finden.

---

**4,50 oder 450 US-Dollar?**

So weit liegen die Modellkosten für dieselben 10.000 Textaufrufe je nach Modell auseinander (Preisbeispiel, Stand 9. November 2026). Trotzdem ist das günstigste Modell nicht automatisch die beste Wahl: Ein teureres Modell kann insgesamt weniger kosten, wenn es Korrekturarbeit spart. Entscheidend sind die Gesamtkosten je akzeptiertem Ergebnis.

---

## Was „bestes Preis-Leistungs-Verhältnis“ bedeutet

Die entscheidende Frage lautet: **Was kostet eine erfolgreich erledigte Aufgabe in der benötigten Qualität?** Dazu gehören Modellaufrufe, Werkzeuge, Prüfung, Korrekturen und der anteilige Betrieb. Der Preis je Token ist nur ein Teil dieser Rechnung.

Als Entscheidungsregel bietet sich an:

1. Qualität, Datenschutz, benötigte Funktionen und Wartezeit müssen die Mindestanforderungen erfüllen.
2. Unter den geeigneten Varianten gewinnt diejenige mit den niedrigsten Gesamtkosten je akzeptiertem Ergebnis.

Das ist ein Vorschlag, kein Branchenstandard. Er deckt sich mit der Empfehlung von OpenAI, Qualitätskriterien vorab festzulegen und auch Prüf- und Korrekturzeit zu vergleichen. [1] [2]

## Was öffentliche Vergleiche leisten – und was nicht

Ranglisten und Benchmarks helfen bei der Vorauswahl:

- **Artificial Analysis** vergleicht Fähigkeiten, Preise und API-Leistung. [3]
- **Arena** wertet menschliche Präferenzen aus und weist Rangspannen aus. Überlappen sie sich, spricht das gegen einen eindeutigen Rangunterschied. [4] [5]
- **LiveBench** nutzt aktualisierte, objektiv auswertbare Aufgaben, um den Einfluss bekannter Trainingsaufgaben zu begrenzen. [6]
- **OpenRouter** zeigt Modelle, Anbieter und Preise auf einer gemeinsamen Plattform. [7]

Was sie nicht leisten: Ihre eigenen Aufgaben abbilden. Gute Mathematikergebnisse belegen noch keine gute deutsche Geschäftskorrespondenz. Achten Sie auf Modellversion, Testdatum und Verfügbarkeit in Ihrem Tarif und Ihrer Region. Für Beschaffung oder Modellwechsel brauchen Sie eigene Testaufgaben mit klaren Erfolgskriterien.

## Welche Kosten in die Rechnung gehören

**API-Kosten** setzen sich aus Eingabe- und Ausgabetokens zusammen, je nach Anbieter zusätzlich aus Cache-, Werkzeug- und Plattformgebühren. [8] [9] [10] Bei Agenten zählt die gesamte Aufgabe inklusive Werkzeugergebnissen, Wiederholungen und Eskalationen. Auch eine Zugangsplattform kann kosten: OpenRouter nennt beim Guthabenkauf 5,5 % (Standard) bzw. 8 % (Business). [7]

**Gesamtkosten** sind der weitere Rahmen (eigener Vorschlag):

```text
Gesamtkosten = Lizenz- und API-Kosten
  + Infrastruktur und Betrieb
  + anteilige Einführung und Integration
  + menschliche Bearbeitungs-, Prüf- und Korrekturzeit × Stundensatz
  + zurechenbare Fehlerfolgekosten

Kosten je akzeptiertem Ergebnis = Gesamtkosten / akzeptierte Ergebnisse
```

Verworfene Versuche bleiben in den Gesamtkosten; weisen Sie zusätzlich die Erledigungsquote aus. Fehler, die einen Einsatz ausschließen, sind ein Ausschlusskriterium. Ausführlicher zu Abos, Lizenzen und Einführungskosten: [Kosten von KI aus Nutzersicht](../research/2026-11-05%20Kosten%20von%20KI%20aus%20Nutzersicht.md).

## Preisbeispiele: eine Momentaufnahme

Die Tabelle zeigt Preisunterschiede. Sie ist weder eine Marktübersicht noch eine Qualitätsrangliste. **Preisstand: 9. November 2026**, US-Dollar je Million Tokens, direkte bezahlte Standard-API, nur Text, ohne Cache, Werkzeuge und Rabatte. [8] [9] [10]

| Modell | Eingabe | Ausgabe | Modellkosten für 10.000 Aufrufe (Annahme) |
| --- | ---: | ---: | ---: |
| OpenAI `gpt-6-luna` | 0,10 $ | 0,50 $ | **4,50 $** |
| Anthropic Claude Haiku 5.5 | 0,10 $ | 0,50 $ | **4,50 $** |
| Google `gemini-3.1-flash-lite` | 0,25 $ | 1,50 $ | **12,50 $** |
| OpenAI `gpt-6.1-terra` | 1,00 $ | 5,00 $ | **45,00 $** |
| Anthropic Claude Sonnet 5.5 | 2,00 $ | 10,00 $ | **90,00 $** |
| Anthropic Claude Opus 5.5 | 4,00 $ | 20,00 $ | **180,00 $** |
| OpenAI `gpt-6-astra` | 10,00 $ | 50,00 $ | **450,00 $** |

**Annahme:** 10.000 Aufrufe mit je 2.000 Eingabe- und 500 abrechenbaren Ausgabetokens, also 20 Mio. Eingabe- und 5 Mio. Ausgabetokens. Für `gpt-6-astra`: 20 × 10 $ + 5 × 50 $ = 450 $. OpenAI jeweils mit kurzer Kontextstufe, Claude Haiku 5.5 bis 100.000 Eingabetokens je Anfrage.

**Aussagegrenzen:** Die Tabelle setzt gleiche Tokenmengen voraus. In der Praxis unterscheiden sich Antwortlänge, interner Rechenaufwand, Tokenisierung und Zahl der Versuche. [3] Prüfen Sie Preise vor einer Entscheidung neu. Ein Wechselkurs wurde nicht unterstellt.

## Wann ein höherer Modellpreis wirtschaftlicher ist

**Hypothetisches Beispiel, keine gemessenen Leistungen:** Zwei Varianten bearbeiten dieselben 100 Aufgaben, alle Ergebnisse werden nach Prüfung akzeptiert. Angenommener Stundensatz: 60 $, also 1 $ je Minute.

| 100 Aufgaben | Variante A | Variante B |
| --- | ---: | ---: |
| API-Verbrauch inklusive aller Versuche | 2 $ | 20 $ |
| Menschliche Prüfung | 20 $ | 20 $ |
| Zusätzliche Korrekturarbeit | 60 $ (60 Min.) | 15 $ (15 Min.) |
| **Gesamtkosten** | **82 $** | **55 $** |
| **Kosten je akzeptiertem Ergebnis** | **0,82 $** | **0,55 $** |

Variante B kostet bei der API das Zehnfache, insgesamt aber rund 33 % weniger. Der API-Aufpreis von 18 $ rechnet sich ab mehr als 18 Minuten eingesparter Arbeitszeit je 100 Aufgaben. Rechnerisch eingesparte Zeit ist allerdings nicht automatisch eine gesunkene Zahlung.

## So vergleichen Sie Modelle selbst

Die folgenden Schritte sind ein Vorschlag für einen Pilotvergleich, abgeleitet aus HELM und der Dokumentation von OpenAI. Alle Zahlen sind Beispiele, keine Qualitätsstandards. [1] [11]

1. **Aufgabe und Mindestqualität festlegen.** Wählen Sie eine konkrete Aufgabe, etwa „Rechnungsdaten in ein JSON-Schema übertragen“, und legen Sie vorab fest, was als Erfolg gilt, zum Beispiel mindestens 95 von 100 vollständig korrekten Testfällen. Datenschutz, Lizenz und Region sind Eignungskriterien.
2. **Eigene Testfälle sammeln.** Zum Beispiel 30 Fälle für den Überblick und 100 zurückgehaltene Fälle für den Pilot, darunter gezielt schwierige: fehlende oder widersprüchliche Angaben, lange Dokumente, ungewohnte Formate.
3. **Drei bis fünf Kandidaten testen.** Eine günstige, eine mittlere und eine leistungsstarke Variante, bei Bedarf eine selbst betriebene. Gleiche Anweisungen, Daten und Limits; jede Variante vollständig dokumentiert (Modellversion, Zugang, Einstellungen, Arbeitsablauf).
4. **Ergebnis und Aufwand gemeinsam messen.** Erfolg im ersten Versuch, Erledigungsquote, kritische Fehler je Aufgabengruppe, Dauer (Median und 95. Perzentil), abgerechneter Verbrauch und aktive menschliche Minuten.
5. **Qualität nachvollziehbar bewerten.** Prüfen Sie automatisch, was sich automatisch prüfen lässt, und blenden Sie bei manuellen Vergleichen die Modellnamen aus. KI-Bewerter kalibrieren Sie an fachlich bewerteten Beispielen. [11] Kleine Unterschiede belegen nichts: 94 gegenüber 95 Erfolgen ist noch kein Vorteil. Und null Fehler in 100 Fällen sind keine Fehlerfreiheit; bei unabhängigen Fällen liegt die obere 95-%-Grenze der Fehlerwahrscheinlichkeit bei rund 3 % (eigene Berechnung).
6. **Entscheiden und erneut prüfen.** Ungeeignete Varianten aussortieren, die übrigen nach Kosten je akzeptiertem Ergebnis vergleichen, die Entscheidung dokumentieren und nach Änderungen an Modell, Prompt oder Ablauf erneut testen.

## Wie sich Kosten senken lassen

Jeder Hebel ist ein Versuch, der die Qualität nicht verschlechtern darf:

- **Günstigeres Modell oder weniger Denkaufwand** bei gleichem Input testen. [2]
- **Kürzere Ein- und Ausgaben:** nur relevante Auszüge senden.
- **Prompt-Cache** für wiederkehrenden Kontext; Trefferquote und Cache-Kosten mitrechnen. [8] [9] [10]
- **Batch-Verarbeitung** für zeitunkritische Aufgaben. Anthropic nennt dafür 50 % Rabatt auf Ein- und Ausgabetokens. [9]
- **Regeln vor dem Modell:** eindeutige Berechnungen und Validierungen mit klassischer Software erledigen.
- **Routing und Eskalation:** einfache Fälle an günstige Modelle, nachgewiesene Fehler an ein stärkeres Modell oder einen Menschen. RouteLLM untersucht das Routing; eine allgemeine Einspargarantie folgt daraus nicht. [12]

Setzen Sie außerdem technische Limits für Aufrufe, Schritte und Verbrauch.

## Wann sich Eigenbetrieb rechnen kann

Öffentlich verfügbare Modellgewichte sind nicht automatisch Open Source; prüfen Sie die Nutzungsrechte. [3] In die Rechnung gehören Hardware oder GPU-Miete, Strom, Administration, Updates, Überwachung und Ausfallreserve. Messen Sie Qualität und Geschwindigkeit mit der tatsächlich eingesetzten Variante.

**Eigene Beispielrechnung, keine Hardwareempfehlung:** Ein selbst betriebener Dienst kostet 300 € monatlich fix und 0,005 € je Aufgabe. Eine gleich geeignete API kostet 0,02 € je Aufgabe. Der Schnittpunkt liegt bei 300 € / (0,02 € − 0,005 €) = **20.000 Aufgaben pro Monat**. Darunter ist in diesem Beispiel die API günstiger, darüber der Eigenbetrieb. Das gilt nur, wenn die Infrastruktur diese Menge in geforderter Qualität und Zeit bewältigt.

## Checkliste für die Entscheidung

Füllen Sie für jeden Kandidaten und den bisherigen Prozess dieselben Punkte aus:

- [ ] Modell- bzw. Prozessversion und Testdatum
- [ ] Mindestanforderungen erfüllt (Qualität, Datenschutz, Funktionen, Wartezeit)?
- [ ] Erfolg im ersten Versuch
- [ ] Endgültig akzeptierte Ergebnisse je Aufgabe
- [ ] Kritische Fehler nach Kategorie
- [ ] Fertigstellungszeit: Median und 95. Perzentil
- [ ] Aktive menschliche Minuten je Aufgabe
- [ ] Direkte Kosten im Testzeitraum
- [ ] Gesamtkosten je akzeptiertem Ergebnis
- [ ] Erwartete Monatskosten bei Zielmenge
- [ ] Unsicherheiten und Einschränkungen

Ein belastbarer Vergleich entsteht erst aus Mindestqualität, eigenen Testaufgaben und vollständig erfassten Kosten. Bis diese Messwerte vorliegen, bleibt die Modellwahl vorläufig.

## Quellen

Alle Quellen wurden am 9. November 2026 recherchiert. Preislisten sind veränderlich. Anbieterquellen belegen ihre eigenen Tarife, nicht eine überlegene Modellqualität.

1. Stanford CRFM (2022): [Language Models are Changing AI: The Need for Holistic Evaluation](https://crfm.stanford.edu/2022/11/17/helm.html)
2. OpenAI: [Model selection](https://developers.openai.com/api/docs/guides/model-selection)
3. Artificial Analysis: [Benchmarking Methodology](https://artificialanalysis.ai/methodology/)
4. Arena: [How to see AI Rankings in Arena Leaderboards](https://help.arena.ai/articles/7011479247-how-to-see-ai-rankings-in-arena-leaderboards)
5. Arena (2026): [Arena’s Ranking Method](https://arena.ai/blog/ranking-method)
6. White et al. (2024, überarbeitet 2025): [LiveBench: A Challenging, Contamination-Limited LLM Benchmark](https://arxiv.org/abs/2406.19314)
7. OpenRouter: [Pricing](https://openrouter.ai/pricing)
8. OpenAI: [API Pricing](https://developers.openai.com/api/docs/pricing)
9. Anthropic: [Pricing – Claude Platform Docs](https://platform.claude.com/docs/en/about-claude/pricing)
10. Google: [Gemini Developer API Pricing](https://ai.google.dev/gemini-api/docs/pricing) (über den Suchindex der offiziellen Preisdokumentation ausgewertet, direkter Abruf technisch eingeschränkt; nur das Flash-Lite-Preisbeispiel übernommen)
11. OpenAI: [Evaluation best practices](https://developers.openai.com/api/docs/guides/evaluation-best-practices)
12. Ong et al. / LMSYS (2024): [RouteLLM: An Open-Source Framework for Cost-Effective LLM Routing](https://www.lmsys.org/blog/2024-07-01-routellm/)
