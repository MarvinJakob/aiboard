# Fortschritte durch KI in der Wissenschaft

*Recherchestand 5. November 2026*

Diese Recherche vergleicht sieben Forschungsfelder anhand ausgewählter Originalarbeiten und der Betriebsdokumentation des Europäischen Zentrums für mittelfristige Wettervorhersage (ECMWF). Berücksichtigt sind Beispiele von 2021 bis 2026, bei denen sich der Beitrag der KI und die Art der Überprüfung konkret benennen lassen. Die Auswahl ist fachübergreifend und exemplarisch.

| Forschungsfeld | Beitrag der KI | Art des Nachweises |
| --- | --- | --- |
| Strukturbiologie | Dreidimensionale Strukturen von Proteinen und molekularen Komplexen vorhersagen | Vergleich mit experimentell bestimmten Strukturen [1, 2] |
| Antibiotikaforschung | Kandidaten für Labortests priorisieren | Bakterienkulturen und Mausmodelle [3, 4] |
| Klinische Wirkstoffentwicklung | Ein molekulares Ziel identifizieren und einen Wirkstoffkandidaten entwerfen | Randomisierte Phase-2a-Studie [5] |
| Wetterforschung | Wahrscheinlichkeitsprognosen aus historischen Wetterdaten lernen | Rückblickender Modellvergleich und operationeller Betrieb eines eigenständigen Systems [6, 7] |
| Materialwissenschaft | Kandidaten für stabile Kristallstrukturen vorsortieren | Quantenmechanische Rechnungen und Abgleich mit experimentellen Strukturen [8] |
| Fusionsforschung | Magnetisch eingeschlossenes Plasma in Echtzeit regeln | Versuche an den Tokamaks TCV und DIII-D [9, 10] |
| Mathematik | Programme zur Konstruktion großer kombinatorischer Mengen suchen | Überprüfbare Konstruktionen und verbesserte untere Schranke [11] |

## 1. Strukturbiologie – AlphaFold

AlphaFold 2 sagte aus Aminosäuresequenzen die räumliche Struktur von Proteinen voraus. Im Blindtest CASP14 wurden die Modelle mit experimentell bestimmten Zielstrukturen verglichen. Bei der Auswertung über alle Atome lag die mediane Strukturabweichung (RMSD₉₅) bei **1,5 Å gegenüber 3,5 Å** für die beste alternative Methode. AlphaFold 3 erweiterte den Ansatz 2024 auf Komplexe, etwa aus Proteinen, DNA, RNA und kleinen Molekülen. In den veröffentlichten Tests verbesserte das Modell unter anderem die Vorhersage von Bindepositionen kleiner Moleküle gegenüber den verwendeten Vergleichsverfahren. [1, 2]

Strukturmodelle liefern räumliche Hypothesen für weitere Experimente. Die Benchmarks messen geometrische Übereinstimmung mit Referenzstrukturen. Aussagen über Bindungsstärke, biologische Funktion oder die Bewegung eines Komplexes erfordern zusätzliche Daten. [1, 2]

## 2. Antibiotikaforschung – Abaucin

Ein Deep-Learning-Modell lernte aus Messungen zur Hemmung des Bakterienwachstums und priorisierte weitere Moleküle für Versuche gegen *Acinetobacter baumannii*. Die anschließenden Tests identifizierten Abaucin als Kandidaten mit engem Wirkspektrum. Das Team zeigte 2023 eine Wirkung in einem Mausmodell für Wundinfektionen. Eine Folgestudie von 2026 prüfte die Substanz auch an resistenten klinischen Isolaten im Labor und in einem Mausmodell für Lungeninfektionen. Die Ergebnisse stammen aus präklinischen Untersuchungen. [3, 4]

## 3. Klinische Wirkstoffentwicklung – Rentosertib

Die Wirkstoffentwicklung nutzte KI zur Auswahl des Zielproteins TNIK und zum Entwurf von Rentosertib, einem Hemmstoff für dieses Protein. In einer 2025 veröffentlichten doppelblinden Studie wurden **71 Personen** mit idiopathischer Lungenfibrose zufällig auf drei Dosisgruppen und eine Placebogruppe verteilt. Die Behandlung dauerte bis zu zwölf Wochen. Primär untersuchte das Team unerwünschte Ereignisse. Bei der höchsten Dosis beobachtete es ein Signal für eine Verbesserung der forcierten Vitalkapazität, eines Maßes der Lungenfunktion. Die kleine Stichprobe und die kurze Dauer begrenzen die Aussage zur langfristigen Wirksamkeit und Sicherheit. Die Studie prüfte den Wirkstoff und liefert keinen direkten Vergleich der Entwicklungsdauer mit herkömmlichen Verfahren. [5]

## 4. Wetterforschung – GenCast und AIFS

GenCast erzeugt mehrere mögliche Wetterverläufe für bis zu 15 Tage. Diese sogenannten Ensembleprognosen bilden ab, welche Entwicklungen wahrscheinlicher sind. Im veröffentlichten rückblickenden Vergleich war das Modell bei **97,2 % von 1.320 Prüfkriterien** besser als die in der Studie verwendete Version des ECMWF-Ensembles ENS. Das ist der Anteil der Prüfkriterien mit besserer Leistung. Die Zahl bezieht sich auf den historischen Test und dessen Referenzsystem. [6]

Ein eigenständiges KI-System, AIFS, ging beim ECMWF im Februar 2025 als Einzelprognose und im Juli 2025 als Ensemble in den Regelbetrieb. Im Mai 2026 aktualisierte das ECMWF beide Varianten auf Version 2. Damit ist der Einsatz von KI-Vorhersagen im laufenden Betrieb neben dem physikbasierten IFS dokumentiert. [7]

## 5. Materialwissenschaft – GNoME

GNoME setzte neuronale Netze ein, um Kristallstrukturen für weitere Rechnungen zu priorisieren. Anschließend bewerteten die Forschenden die Kandidaten mit Dichtefunktionaltheorie, einer quantenmechanischen Rechenmethode. So identifizierten sie rund **381.000 zusätzliche Strukturen**, die im verwendeten Rechenmodell gegenüber konkurrierenden Phasen stabil waren. Für **736 vorhergesagte Strukturen** fand die Studie eine Übereinstimmung mit unabhängigen experimentellen Ergebnissen. Die Studie dokumentiert damit eine größere Auswahl an Kandidaten für die Materialsynthese. Ob sich ein einzelner Kandidat unter praktikablen Bedingungen herstellen lässt oder eine gewünschte Eigenschaft besitzt, erfordert eigene Tests. [8]

## 6. Fusionsforschung – Plasmaregelung

2022 steuerte eine in einer Simulation trainierte Regelung die Magnetspulen des Schweizer Forschungstokamaks TCV. In der Anlage erzeugte und hielt sie verschiedene Plasmaformen, darunter eine Konfiguration mit zwei getrennten Plasmabereichen für ein Regelungsfenster von 200 Millisekunden. 2024 zeigte ein anderes Team am US-Tokamak DIII-D, dass eine lernbasierte Regelung unter den getesteten Bedingungen bestimmte Instabilitäten des Plasmas vermeiden konnte. Gemessen wurde die Regelbarkeit konkreter Plasmaentladungen. Die Übertragbarkeit auf andere Anlagen und längere Betriebszeiten ist eine separate Forschungsfrage. [9, 10]

## 7. Mathematik – FunSearch

FunSearch kombinierte ein Sprachmodell, das Programmvarianten vorschlug, mit einem Bewertungsverfahren, das die damit erzeugten mathematischen Konstruktionen prüfte. Beim *Cap-Set-Problem* geht es um möglichst große Mengen in einem endlichen Raum, die keine drei verschiedenen Punkte auf einer Geraden enthalten. FunSearch lieferte neue Konstruktionen und verbesserte eine asymptotische **untere Schranke von 2,2180 auf 2,2184** für die Wachstumsrate der maximalen Mengengröße. Der Fortschritt beruht auf einer überprüfbaren Konstruktion. Wie groß die maximal möglichen Mengen genau sind, bleibt offen. [11]

## Forschungsassistenten – Co-Scientist (2026)

Sprachmodelle werden inzwischen auch zur Formulierung und Auswahl von Hypothesen eingesetzt. In einer 2026 veröffentlichten Studie schlug Co-Scientist Wirkstoffkombinationen für die akute myeloische Leukämie vor. Forschende testeten sieben Kombinationen an zwei Zelllinien. In einer Zelllinie verstärkten sich die Wirkstoffe überwiegend gegenseitig, in der anderen traten je nach Kombination sowohl verstärkende als auch abschwächende Effekte auf. Das Beispiel zeigt, wie KI die Auswahl von Experimenten beeinflusst und wie stark die Ergebnisse vom biologischen Kontext abhängen können. Die Studie berichtet ausgewählte Laborprüfungen. Eine allgemeine Erfolgsquote für KI-generierte Hypothesen lässt sich daraus nicht ableiten. [12]

## Vergleich der Nachweise

Die Art der Überprüfung entscheidet, wie weit ein Ergebnis trägt. Bei GNoME geben die Rechnungen vor, welche Kristalle sich zu untersuchen lohnen. Bei FunSearch genügt eine gültige Konstruktion, um eine untere Schranke anzuheben. Bei Abaucin und Rentosertib beantworten Zelltests, Tiermodelle und klinische Studien unterschiedliche Fragen. Für die Wettervorhersage dokumentiert der ECMWF-Regelbetrieb den Übergang von der Forschung zur laufenden Anwendung. Die Kennzahlen dieser Beispiele messen entsprechend unterschiedliche Fortschritte und lassen sich nicht zu einer gemeinsamen Erfolgsquote zusammenfassen. [3–8, 11]

## Quellen

1. Jumper et al. (2021). [Highly accurate protein structure prediction with AlphaFold](https://www.nature.com/articles/s41586-021-03819-2). *Nature*.
2. Abramson et al. (2024). [Accurate structure prediction of biomolecular interactions with AlphaFold 3](https://www.nature.com/articles/s41586-024-07487-w). *Nature*.
3. Liu et al. (2023). [Deep learning-guided discovery of an antibiotic targeting Acinetobacter baumannii](https://www.nature.com/articles/s41589-023-01349-8). *Nature Chemical Biology*.
4. [Conformational hijacking of lipoprotein transporter LolDF enables precision antimicrobial activity against Acinetobacter baumannii](https://www.nature.com/articles/s41467-026-75428-4) (2026). *Nature Communications*.
5. [A generative AI-discovered TNIK inhibitor for idiopathic pulmonary fibrosis: a randomized phase 2a trial](https://www.nature.com/articles/s41591-025-03743-2) (2025). *Nature Medicine*.
6. Price et al. (online 2024). [Probabilistic weather forecasting with machine learning](https://doi.org/10.1038/s41586-024-08252-9). *Nature*.
7. ECMWF. [AIFS Machine Learning data](https://www.ecmwf.int/en/forecasts/datasets/aifs-machine-learning-data) und [ECMWF’s ensemble AI forecasts become operational](https://www.ecmwf.int/en/about/media-centre/news/2025/ecmwfs-ensemble-ai-forecasts-become-operational) (2025). Betriebsdokumentation.
8. Merchant et al. (2023). [Scaling deep learning for materials discovery](https://www.nature.com/articles/s41586-023-06735-9). *Nature*.
9. Degrave et al. (2022). [Magnetic control of tokamak plasmas through deep reinforcement learning](https://www.nature.com/articles/s41586-021-04301-9). *Nature*.
10. Seo et al. (2024). [Avoiding fusion plasma tearing instability with deep reinforcement learning](https://www.nature.com/articles/s41586-024-07024-9). *Nature*.
11. Romera-Paredes et al. (online 2023). [Mathematical discoveries from program search with large language models](https://www.nature.com/articles/s41586-023-06924-6). *Nature*.
12. Gottweis et al. (2026). [Accelerating scientific discovery with Co-Scientist](https://www.nature.com/articles/s41586-026-10644-y). *Nature*.
