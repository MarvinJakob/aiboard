# Kosten von KI aus Nutzersicht

*Recherchestand 5. November 2026*

Die Recherche betrachtet Ausgaben und Arbeitsaufwand von Privatpersonen, Selbstständigen und Organisationen, die KI einsetzen. Der Schwerpunkt liegt auf generativen Assistenten und APIs. Dokumentenerkennung und der Betrieb am eigenen Arbeitsplatz zeigen weitere Abrechnungs- und Kostenmodelle. Die Preisbeispiele sind eine Auswahl öffentlich einsehbarer Tarife. Europreise stammen aus deutschen Angeboten, Dollarpreise aus den verlinkten Preislisten. Alle Beispielrechnungen verwenden die jeweils ausgewiesene Währung und ausdrücklich genannte Annahmen.

## 1. Abos und Lizenzen

| Angebot | Ausgewiesener Preis | Was den Aufwand bestimmt |
| --- | ---: | --- |
| Google Gemini, kostenlos | 0 € pro Monat | Google-Konto erforderlich, niedrigere Nutzungslimits als in den Bezahlstufen. [1] |
| Google AI Plus / Pro / Ultra | 4,99 € / 21,99 € / ab 99,99 € pro Monat | Die Stufen unterscheiden sich unter anderem bei Modellzugriff, Nutzungslimits, Flow-Credits und gebündeltem Cloud-Speicher. [1] |
| ChatGPT Plus | 20 US-Dollar pro Monat laut OpenAI-Hilfeseite | OpenAI zeigt den regionalen Preis im Checkout an. Für die API gilt eine eigene Abrechnung. [2] · [3] |
| Claude Pro | 20 US-Dollar bei monatlicher Zahlung oder 200 US-Dollar für ein Jahr im Voraus, jeweils zuzüglich anwendbarer Steuern | Zwölf Monatszahlungen ergeben 240 US-Dollar. Das Jahresabo kostet 40 US-Dollar weniger und ist im Voraus fällig. Nutzungsgrenzen gelten in beiden Varianten. [4] |
| Microsoft 365 Copilot Business | 21,84 € pro Person im Monatsabo, zzgl. MwSt. | Das Add-on setzt eine geeignete Basislizenz voraus. Ausgewählte erweiterte Funktionen werden nach Verbrauch abgerechnet. [5] · [6] |

Ein Abo kostet auch in Monaten mit geringer Nutzung den vollen Preis. Google AI Pro kostet bei zwölf Monaten zum ausgewiesenen Preis **263,88 €**. Bei Paketen mit Speicher oder Office-Apps ist für die persönliche Rechnung relevant, welche dieser Leistungen man ohnehin bezahlt hätte. Bei Teams zählen die gebuchten Plätze. Nutzt in einem Team mit 20 bezahlten Copilot-Plätzen nur die Hälfte den Dienst, verteilen sich 436,80 € Monatsgebühr rechnerisch auf zehn aktive Personen. Das ergibt 43,68 € pro aktiver Person vor Steuern und Zusatzverbrauch. [1] · [5]

## 2. Verbrauchsabhängige Kosten

### Text-APIs und Agenten

Text-APIs rechnen häufig in **Tokens** ab, also in Einheiten, in die das Modell Inhalte zerlegt. Zur Eingabe gehören je nach Anfrage auch Systemanweisungen, mitgesendeter Chatverlauf und Dokumentauszüge. Anbieter können interne Denkschritte als Ausgabetokens abrechnen. Je nach Tarif kommen Gebühren für Suche, Dateispeicher oder zwischengespeicherten Kontext hinzu. [7] · [17]

**Beispiel mit 10.000 Textaufrufen im Monat.** Jeder Aufruf umfasst annahmegemäß 2.000 Eingabe- und 500 abrechenbare Ausgabetokens. In Summe sind das 20 Mio. Eingabe- und 5 Mio. Ausgabetokens. Die Rechnung verwendet den bezahlten Standardtarif ohne Cache, externe Werkzeuge oder Steuern. [7]

| API-Modell | Eingabe je Mio. Tokens | Ausgabe je Mio. Tokens | Modellkosten für 10.000 Aufrufe |
| --- | ---: | ---: | ---: |
| Gemini 3.1 Flash-Lite | 0,25 US-Dollar | 1,50 US-Dollar | **12,50 US-Dollar** |
| Gemini 3.1 Pro Preview, bis 200.000 Eingabetokens je Anfrage | 2,00 US-Dollar | 12,00 US-Dollar | **100,00 US-Dollar** |

Die Rechnung zeigt den Preiseffekt bei identischem Tokenverbrauch. Ob die Modelle für eine konkrete Aufgabe gleich viele verwendbare Ergebnisse liefern, hängt von der Aufgabe ab. Bei einem Agenten kann ein einzelner Vorgang mehrere Modellaufrufe enthalten, etwa für Planung, Suche und die Auswertung der Treffer. Würden 10.000 Vorgänge je fünf gleich große Aufrufe wie oben auslösen, kostete Flash-Lite **62,50 US-Dollar** allein für die Modellaufrufe. Zusätzliche Suchanfragen können separat berechnet werden. Im Batch-Tarif kostet dieselbe Tokenmenge bei Flash-Lite halb so viel wie im Standardtarif, sofern sich die Aufgabe gesammelt verarbeiten lässt. [7]

### Medien, Dokumente und Guthaben

- **Video.** Die Gemini API berechnet bei Gemini Omni Flash im Standardtarif rund 0,10 US-Dollar je ausgegebener Sekunde in 720p. 30 generierte Clips à acht Sekunden kosten damit rund **24 US-Dollar für die Videoausgabe**. Werden davon zehn Clips verwendet, sind das **2,40 US-Dollar je verwendbarem Clip**. Eingaben und Bearbeitungszeit kommen gegebenenfalls hinzu. [7]
- **Dokumentenerkennung.** AWS nennt für die reine Texterkennung mit Amazon Textract in der Region US West (Oregon) 0,0015 US-Dollar je Seite in der ersten Preisstufe. 10.000 Seiten ergeben **15 US-Dollar** zum Listenpreis. Für Funktionen wie die Erkennung von Formularfeldern oder Tabellen gelten eigene Seitenpreise. [8]
- **Credits im Abo.** Google AI Pro enthält monatlich 1.000 zusätzliche Flow-Credits. Bei 20 Credits je Veo-3.1-Fast-Generierung für Pro-Abonnenten reicht allein dieses Monatskontingent für **50 Generierungen**. Ein Auftrag kann mehrere Generierungen auslösen. Ungenutzte monatliche Flow-Credits verfallen beim Wechsel des Abrechnungszeitraums. [9]

Für die Kostenplanung ist ein Budgetalarm von einer technischen Sperre zu unterscheiden. Azure Cost Management verschickt beim Erreichen der Schwelle eine Benachrichtigung und lässt die laufende Nutzung weiterlaufen. [10]

## 3. Kosten neben der Rechnung

| Kostenblock | Was bei Anwendern anfällt |
| --- | --- |
| Einrichtung und Einführung | Zeit für Auswahl, Pilot, Zugänge und Berechtigungen, Datenaufbereitung, Anbindung an bestehende Systeme und Schulung. [11] |
| Laufender Betrieb | Administration, Support, Überwachung der Nutzung und erneute Tests nach Änderungen an Modellen oder Arbeitsabläufen. [11] |
| Prüfung und Nacharbeit | Quellen nachschlagen, Ergebnisse freigeben, fehlerhafte Vorschläge korrigieren und unbrauchbare Ergebnisse erneut erstellen. Bei Fehlern, die in Folgeprozesse gelangen, kann zusätzlicher Aufwand für Korrekturen entstehen. [11] · [12] |
| Nutzung am eigenen Arbeitsplatz | Anschaffung oder Aufrüstung, zusätzlicher Stromverbrauch, Einrichtung und Updates. Bei lokalen Sprachmodellen erhöht ein größeres Kontextfenster den Speicherbedarf. [13] |

**Beispiel für einen lokalen Arbeitsplatz.** Bei angenommenen 150 W zusätzlicher Leistungsaufnahme, 40 Nutzungsstunden im Monat und 0,35 € je kWh fallen **2,10 € zusätzlicher Strom** pro Monat an. Ein eigens für KI beschafftes Upgrade für 900 € entspricht bei einer kalkulatorischen Verteilung über 36 Monate weiteren **25 € pro Monat** ohne angenommenen Restwert. Die Zahlung für das Upgrade fällt bei der Anschaffung an. Leistungsaufnahme und Strompreis sind Rechenannahmen.

Wie groß der Arbeitsaufwand ausfällt, hängt vom Einsatz ab. Brynjolfsson, Li und Raymond beobachteten bei 5.172 Beschäftigten im Kundensupport mit KI-Unterstützung im Mittel **15 % mehr gelöste Anliegen pro Stunde**, mit deutlichen Unterschieden nach Erfahrung. In einer randomisierten METR-Studie brauchten erfahrene Open-Source-Entwickler mit den getesteten Werkzeugen aus dem Frühjahr 2025 dagegen **19 % länger**. Bei einer Folgestudie hielt METR die neuere Effektschätzung wegen Verzerrungen bei der Teilnahme und Schwierigkeiten bei der Zeiterfassung für unzuverlässig. Die Befunde beschreiben den Aufwand in den jeweiligen Arbeitsabläufen. [14] · [15] · [16]

## 4. Gesamtkosten im ersten Jahr

Ein Beispiel für ein Team mit 20 Personen und vorhandenen geeigneten Microsoft-365-Basislizenzen. Der interne Stundensatz von 60 €, die 30 Stunden Einführung und die drei Stunden laufende Administration pro Monat sind Rechenannahmen. Die Rechnung unterstellt zwölf Monate zum ausgewiesenen Monatsabopreis und keinen separat berechneten Funktionsverbrauch. [5] · [6]

| Position | Rechnung | Erstes Jahr |
| --- | --- | ---: |
| 20 Copilot-Business-Plätze, zzgl. MwSt. | 20 × 21,84 € × 12 | 5.241,60 € |
| Einführung | 30 Std. × 60 € | 1.800,00 € |
| Laufende Administration | 3 Std. × 60 € × 12 | 2.160,00 € |
| **Summe** | | **9.201,60 €** |

Das entspricht im ersten Jahr rechnerisch **766,80 € je Monat**. Bei 60 € je Stunde müsste das Team im Schnitt **rund 38 Minuten Arbeitszeit je Person und Monat** einsparen, um diesen Betrag durch frei werdende Arbeitszeit auszugleichen. Die Zeit für Ergebnisprüfung und Korrekturen ist dabei bereits von der erzielten Zeitersparnis abzuziehen. Frei werdende Kapazität hat einen kalkulatorischen Wert. Ob auch die Ausgaben sinken, hängt davon ab, ob beispielsweise bezahlte Überstunden oder externe Aufträge entfallen.

Für wiederkehrende Aufgaben lässt sich der Vergleich in **Kosten je verwendbarem Ergebnis** ausdrücken. Dazu werden die zurechenbaren Lizenz- und Verbrauchskosten, anteilige Einführungskosten und der Arbeitsaufwand eines Zeitraums durch die Zahl der Ergebnisse geteilt, die die vereinbarten Qualitätskriterien erfüllen. Die Kosten für verworfene Versuche bleiben im Zähler. Bei einem Vergleich mit der bisherigen Bearbeitung gelten dieselben Qualitätskriterien und derselbe Zeitraum.

## Quellen

1. Google – Preise und Leistungsumfang der Privatkundentarife. [Gemini-Abos für Deutschland][1]
2. OpenAI – Monatspreis, Nutzungsgrenzen und separate API-Abrechnung. [What is ChatGPT Plus?][2]
3. OpenAI – lokalisierte Preise und Währung beim Kauf. [Multi-currency billing][3]
4. Anthropic – Monats- und Jahrespreis von Claude Pro, Steuern und Nutzungsgrenzen. [Claude Pricing][4]
5. Microsoft – Monatspreis je Person und verbrauchsabhängige Zusatzfunktionen. [Copilot-Pläne und Preise für Unternehmen in Deutschland][5]
6. Microsoft Learn – Voraussetzungen für die Zusatzlizenz. [Microsoft Copilot Business FAQ][6]
7. Google – Standard- und Batch-Preise für Flash-Lite, Standardpreise für Pro Preview, Videoausgabe mit Gemini Omni Flash und Gebühren für Zusatzfunktionen. [Gemini Developer API Pricing][7]
8. AWS – Seitenpreise nach Funktion und Region. [Amazon Textract Pricing][8]
9. Google – Monatsguthaben, Credits je Generierung und Verfall. [Manage your Google Flow credits][9]
10. Microsoft Learn – Verhalten von Budgetwarnungen. [Create and manage Azure Cost Management budgets][10]
11. UK Government Digital Service (2025) – Beschaffung, Schulung, Einführung, Qualitätssicherung und Betrieb. [Artificial Intelligence Playbook][11]
12. METR (2025) – zusätzliche Anforderungen an die Verwendbarkeit von KI-generiertem Code. [Algorithmic vs. Holistic Evaluation][12]
13. Ollama – Zusammenhang zwischen Kontextlänge und lokalem Speicherbedarf. [Context length][13]
14. Brynjolfsson, Li und Raymond (2025) – Produktivität beim Einsatz eines KI-Assistenten im Kundensupport. [Generative AI at Work][14]
15. METR (2025) – randomisiertes Experiment zum Zeitbedarf von Softwareentwicklern. [Measuring the Impact of Early-2025 AI on Experienced Open-Source Developer Productivity][15]
16. METR (2026) – methodische Einschränkungen der Folgestudie. [We are Changing our Developer Productivity Experiment Design][16]
17. Google – Tokenzählung für Eingaben, Chatverläufe und Systemanweisungen. [Understand and count tokens][17]

[1]: https://gemini.google/de/subscriptions/?hl=de
[2]: https://help.openai.com/en/articles/6950777-what-is-chatgpt-plus
[3]: https://help.openai.com/en/articles/10421635-multicurrency-billing
[4]: https://claude.com/pricing
[5]: https://www.microsoft.com/de-de/copilot/pricing/business
[6]: https://learn.microsoft.com/en-us/microsoft-365/copilot/copilot-business-faq
[7]: https://ai.google.dev/gemini-api/docs/pricing
[8]: https://aws.amazon.com/textract/pricing/
[9]: https://support.google.com/flow/answer/16526234?hl=en
[10]: https://learn.microsoft.com/en-us/azure/cost-management-billing/costs/tutorial-acm-create-budgets
[11]: https://www.gov.uk/government/publications/ai-playbook-for-the-uk-government/artificial-intelligence-playbook-for-the-uk-government-html
[12]: https://metr.org/blog/2025-08-12-research-update-towards-reconciling-slowdown-with-time-horizons/
[13]: https://docs.ollama.com/context-length
[14]: https://academic.oup.com/qje/article/140/2/889/7990658
[15]: https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/
[16]: https://metr.org/blog/2026-02-24-uplift-update/
[17]: https://ai.google.dev/gemini-api/docs/tokens
