# Nützliche Skills für KI-Agenten: Caveman und weitere Empfehlungen

*Recherchestand: 9. November 2026*

Skills halten wiederkehrende Arbeitsabläufe für KI-Agenten fest. Sie können beispielsweise vorgeben, wie ein Agent Dokumente erstellt, Fehler untersucht oder eine Webseite prüft. Ihr Nutzen liegt vor allem darin, konkrete Arbeitsschritte, Fachwissen und überprüfbare Ergebnisse miteinander zu verbinden. Ein Skill trainiert das zugrunde liegende Modell dabei nicht neu. [1]

**Empfehlung dieser Recherche:** Mit wenigen Skills für häufige Aufgaben beginnen. Für den Projektalltag sind Dokumentverarbeitung, systematische Fehlersuche, Webtests und eigene Arbeitsabläufe die ersten Kandidaten. Caveman ist als optionaler Stil für knappe Antworten interessant; eine pauschale Ersparnis von 65 Prozent für vollständige Agentensitzungen lässt sich daraus nicht ableiten. [6] Die Priorisierung ist eine eigene Bewertung anhand der nachfolgenden Quellen.

## Gegenstand und Bewertungsmaßstab

Gemeint sind hier **Agent Skills** für Anwendungen wie Claude Code und Codex. Die Recherche betrachtet Caveman und elf weitere Skills beziehungsweise Skill-Gruppen für Wissensarbeit, Softwareentwicklung, Daten und Automatisierung. Grundlage sind Original-Repositories, die jeweiligen `SKILL.md`-Dateien, offizielle Dokumentation und veröffentlichte Untersuchungen. Die Pakete wurden für diese Recherche nicht installiert oder praktisch gegeneinander getestet. Aussagen der Herausgeber über Funktionen werden deshalb von gemessenen Ergebnissen und eigenen Empfehlungen getrennt.

Bewertet werden Aufgabenbezug, überprüfbare Ergebnisse, benötigte Werkzeuge, Grenzen und die Passung zum vorhandenen Projekt. GitHub-Sterne und Downloadzahlen dienen nicht als Qualitätsnachweis. Verlinkte Entwicklungsstände auf `main` oder `master` können sich ändern; vor einer Einführung sollte der geprüfte Commit beziehungsweise Release festgehalten werden.

## Wie Skills funktionieren

Ein Skill besteht mindestens aus einer `SKILL.md` mit Name, Beschreibung und Anweisungen. Hinzukommen können Skripte, Referenzen und Vorlagen. Beim üblichen schrittweisen Laden sieht der Agent zunächst die Metadaten und liest die ausführlichen Anweisungen erst bei Bedarf. Eine präzise Beschreibung entscheidet deshalb mit darüber, ob der passende Skill ausgewählt wird. [1]

| Baustein | Aufgabe | Beispiel |
| --- | --- | --- |
| Prompt | Beschreibt den aktuellen Auftrag. | „Prüfe das Anmeldeformular.“ |
| Projektanweisungen wie `AGENTS.md` | Halten projektweite Regeln fest. | Ticketstatus, Branches und Testbefehle. |
| Skill | Beschreibt einen wiederverwendbaren Ablauf. | Formularzustände testen und Befunde dokumentieren. |
| Werkzeug oder MCP-Server | Liefert Daten oder führt Aktionen aus. | Browser bedienen oder ein GitHub-Ticket lesen. |
| Plugin | Bündelt unter anderem Skills und optional Werkzeuganbindungen. | Mehrere Arbeitsabläufe mit einem gemeinsamen Connector. |

Die Beispiele sind eigene Veranschaulichungen. Die Unterscheidung zwischen Skill, Werkzeug und Plugin folgt der offiziellen OpenAI-Dokumentation. **Ein Skill allein schafft keinen Zugriff auf einen Browser, ein Konto oder eine Datenbank.** Die benötigten Werkzeuge und Rechte müssen vorhanden sein. [3]

## Caveman im Detail

### Welches Caveman ist gemeint?

Untersucht wird **`JuliusBrussee/caveman`**. Der dortige Skill `caveman` lässt Antworten kürzer ausfallen: Ergebnis zuerst, weniger Floskeln und knappe Sätze. Technische Angaben, Zahlen, Einheiten, Negationen, Code und Befehle sollen erhalten bleiben. Der Modus ist laut Skill bis zum ausdrücklichen Ausschalten vorgesehen. [4]

Das aktuelle Repository geht deutlich darüber hinaus. Es enthält inzwischen unter anderem Proxy-, Eingabekompressions- und Modellwahlfunktionen. Diese Komponenten und ihre Sparangaben sind getrennt vom Sprachstil-Skill zu bewerten. Die aktuelle Dokumentation bietet den Skill auch ohne Proxy an. [5]

### Was ist von den Sparversprechen belegt?

| Quelle und Versuch | Ergebnis | Aussagegrenze |
| --- | --- | --- |
| Eigenmessung im Caveman-Repository: zehn Entwicklerfragen | Für den normalen Caveman-Modus nennt der Herausgeber gegenüber der einfachen Aufforderung zu knappen Antworten nur 3 % zusätzliche Einsparung im Median. Die Anweisungen verursachen selbst Eingabetokens. [5] | Kleine Eigenmessung; kein unabhängiger Produktivnachweis. |
| JetBrains: gepaarter A/B-Test auf SkillsBench mit Claude Code und `claude-sonnet-5` | Im großen Lauf über 82 gepaarte Aufgaben sanken die Ausgabetokens um etwa **8,5 %**. Ein statistisch nachweisbarer Qualitätsunterschied wurde nicht gefunden. [6] | Caveman wurde erzwungen aktiviert. Das Ergebnis gilt für diesen Versuchsaufbau und den damaligen Skillstand. |
| CAVEWOMAN-Preprint: acht Modelle, fünf Datensätze | Sprachliche Ausgabekompression senkte die gemessenen Kosten in vielen getesteten Konfigurationen. Eingabekompression verschlechterte in diesem Versuch dagegen Kosten und Genauigkeit. [7] | Untersuchung einer Kompressionsstrategie; keine Validierung des heutigen gesamten Caveman-Pakets. |

**Einordnung:** Kurze Chatantworten und mehrstufige Programmieraufgaben haben unterschiedliche Tokenanteile. Bei Letzteren bleiben Code und Werkzeugaufrufe weitgehend unverändert. JetBrains führt die begrenzte Ersparnis auf diesen Unterschied zurück. Dass kein Qualitätsunterschied nachgewiesen wurde, beweist keine Gleichwertigkeit für jede Aufgabe. [6]

Auch Ausgabetoken-Ersparnis und Gesamtkosten-Ersparnis sind verschiedene Größen. **Rechenbeispiel, keine Messung:** Wenn die beeinflussbare Ausgabe 20 % der bisherigen Kosten ausmacht und um 10 % sinkt, beträgt die Bruttoersparnis insgesamt 2 %. Zusätzliche Skill-Anweisungen und Wiederholungen können sie weiter verringern. Bei einem festen Abonnement entsteht daraus nicht automatisch eine niedrigere Rechnung.

### Wo Caveman nützlich sein kann

Eigene Bewertung: geeignet für kurze Statusmeldungen, technische Rückfragen und kompakte Zusammenfassungen, wenn die Lesenden den Kontext kennen. Weniger passend für ausführliche Recherchen, Lernmaterial und Texte für Kundinnen und Kunden, deren Verständlichkeit an vollständigen Erläuterungen hängt. Zunächst sollte die einfache Anweisung „Antworte knapp und vollständig“ als Vergleich dienen.

Der reine Skill und der zusätzliche Laufzeitbetrieb haben außerdem verschiedene Datenflüsse: Laut Sicherheitsdokumentation ruft der Skill selbst keinen Caveman-Dienst auf. Ein verwaltetes Gateway leitet dagegen Anfragen und Antworten über Caveman Cloud weiter. Ein lokaler Proxy verarbeitet ebenfalls Anfragen und Zugangsdaten auf dem Weg zum Anbieter. Die Betriebsart ist daher Teil der Bewertung. [8]

Nach der aktuellen Lizenzdokumentation steht das Repository ab Version 3.0.0 unter Apache-2.0; Caveman Cloud ist davon getrennte kommerzielle Software. [9]

**Urteil:** Als bewusst gewählter Antwortstil einen Versuch wert. Für eine allgemeine Kostenoptimierung erst den tatsächlichen Tokenverbrauch und den eigenen Abrechnungsmodus prüfen. Der JetBrains-Test des Sprachstils belegt die neueren Proxy- und Routingfunktionen nicht.

## Weitere nützliche Skills im Vergleich

Die folgenden Bewertungen sind Empfehlungen für einen Pilotversuch. Die Quellen belegen die beschriebenen Abläufe, aber keine garantierte Zeitersparnis im eigenen Unternehmen.

| Skill oder Gruppe | Konkreter Nutzen | Voraussetzungen und Grenzen | Empfehlung |
| --- | --- | --- | --- |
| **Dokumentskills `docx`, `xlsx`, `pptx`, `pdf`** von Anthropic | Word-Dateien, Tabellen, Präsentationen und PDFs erstellen oder bearbeiten. Die Skills enthalten Regeln zur Dateistruktur und Ergebnisprüfung. [10–13] | Benötigen passende Bibliotheken und teils Renderer. Die öffentliche Implementierung kann vom eingebauten Produktverhalten abweichen. [14] | Hohe Priorität für Wissensarbeit. Vorhandene Dokumentskills der eigenen Anwendung zuerst nutzen. |
| **`skill-creator`** von Anthropic beziehungsweise der eingebaute Codex-Skill gleichen Namens | Eigene Abläufe in Skills überführen. Die Anthropic-Variante beschreibt außerdem Testfälle, Vergleiche und Verbesserung der Auslösung. [2] · [15] | Zwei verschiedene Implementierungen. Ein erzeugter Skill muss fachlich geprüft und mit realen Aufgaben getestet werden. | Hohe Priorität für wiederkehrende Teamarbeit. |
| **`systematic-debugging` und `verification-before-completion`** aus Superpowers | Fehler reproduzieren, Ursachen untersuchen und Erfolg mit ausgeführten Prüfungen belegen. [16] · [17] | Zugriff auf Anwendung, Logs und Tests nötig. Der vollständige Superpowers-Prozess ist umfangreicher als diese beiden Skills. [18] | Hohe Priorität für Entwicklung; gezielt übernehmen. |
| **`planning-with-files`** von OthmanAdi | Plan, Erkenntnisse und Fortschritt in Dateien festhalten und nach Unterbrechungen wieder aufnehmen. [19] | Schreibzugriff erforderlich. Automatische Wiedereinblendung hängt von Hooks und dem Agenten ab. | Sinnvoll bei langen Recherchen und Umsetzungen. |
| **`vercel-react-best-practices`** von Vercel | React- und Next.js-Code auf typische Leistungsprobleme prüfen, etwa Datenabruf, Bündelgröße und unnötige Renderarbeit. [20] | Frameworkbezogen. Nicht jede Next.js-Regel passt zu einer React-Anwendung mit anderem Aufbau. | Hohe Priorität bei passendem Frontend. |
| **`web-design-guidelines`** von Vercel | Oberflächen auf konkrete Regeln für Bedienbarkeit, Fokus, Formulare und Barrierefreiheit prüfen. [21] · [22] | Lädt aktuelle Richtlinien nach; braucht Webzugriff. Codeprüfung ersetzt keine Prüfung der laufenden Oberfläche. | Gute Ergänzung zum UI-Review. |
| **`webapp-testing`** von Anthropic | Lokale Webanwendungen mit Python und Playwright bedienen; Verhalten, Screenshots und Browsermeldungen prüfen. [23] | Laufende Anwendung, Python, Playwright und Browser nötig. Bestehende projektspezifische Tests berücksichtigen. | Hohe Priorität für sichtbare Nutzerabläufe. |
| **`humanizer`** von blader | Texte auf stereotype KI-Formulierungen prüfen und überarbeiten; vorhandene Aussagen sollen erhalten bleiben. [24] | Sprachliche Redaktion, keine Faktenprüfung. Viele Beispiele sind englisch; Deutsch gesondert beurteilen. | Nützlich für Redaktion, selektiv einsetzen. |
| **`n8n-skills`** von czlonkowski | n8n-Ausdrücke, Workflowmuster, Knotenkonfiguration und Validierungsfehler bearbeiten. [25] | Community-Projekt; besonders auf `n8n-mcp` ausgerichtet. Passende Anbindung und Versionsabgleich nötig. | Hohe Priorität, wenn n8n konkret eingesetzt wird. |
| **`huggingface-datasets`** von Hugging Face | Datenbestände über die Dataset-Viewer-API erkunden: Splits, Zeilen, Suche, Filter und Statistiken. [26] | Netzwerkzugriff; für geschützte Daten ein Token. Kein allgemeiner Skill für beliebige Unternehmensdatenbanken. | Für Daten- und ML-Projekte gezielt auswählen. |
| **`huggingface-community-evals`** von Hugging Face | Modelle mit `inspect-ai` oder `lighteval` evaluieren und ein passendes Inferenz-Backend wählen. [27] | Python-Umgebung, Modellzugang und je nach Weg GPU oder Inferenzanbieter nötig. | Für Teams mit systematischer Modellbewertung. |

### Dokumente: Der Prüfablauf ist der wesentliche Mehrwert

Die Dokumentskills sind besonders greifbar, weil sie ein nutzbares Artefakt erzeugen. `docx` verlangt nach der Erstellung eine gerenderte Sichtprüfung. `xlsx` fordert unter anderem berechenbare Formeln, dokumentierte Annahmen und die Prüfung auf Formelfehler. `pptx` enthält Werkzeuge zum Prüfen der Präsentationsstruktur. `pdf` deckt unter anderem Extraktion, Zusammenführen, Formulare und OCR ab. [10–13]

**Beispielauftrag, eigene Ableitung:** „Erstelle aus diesen Monatsdaten eine Excel-Auswertung. Verwende Formeln für Summen, dokumentiere Annahmen und prüfe das Ergebnis.“ Die Abnahme sollte zusätzlich die fachliche Richtigkeit der Kennzahlen kontrollieren. Ein formal gültiges Dokument kann inhaltlich falsch sein.

### Superpowers: Einzelne Abläufe passend zum Projekt übernehmen

Superpowers ist eine Sammlung und Entwicklungsmethodik mit Entwurf, Planung, Umsetzung und Review. [18] Für das vorhandene Projekt sind die beiden genannten Prüfskills besonders anschlussfähig: `systematic-debugging` verlangt Ursachenklärung vor Korrekturen; `verification-before-completion` bindet Erfolgsaussagen an aktuelle Prüfergebnisse. [16] · [17]

**Eigene Bewertung:** Den vollständigen Prozess nicht zusätzlich über den vorhandenen GitHub-Workflow legen. Zuerst klären, welche Regeln bereits durch `AGENTS.md` abgedeckt sind. Sonst können doppelte Planungsschritte, Freigaben und Statusabläufe entstehen. Die Trennung von Entwicklung und Review bleibt eine Projektentscheidung und wird durch einen Skill nicht ersetzt.

### Planung und Redaktion: Eng begrenzte Aufgaben wählen

`planning-with-files` arbeitet mit `task_plan.md`, `findings.md` und `progress.md`. Der schriftliche Stand kann bei langen Aufgaben helfen; die automatische Wiederaufnahme hängt vom jeweiligen Host ab. [19] **Eigene Bewertung:** Für kleine Änderungen ist diese zusätzliche Dokumentation häufig unnötig. Bei Recherchen muss klar bleiben, welche Datei der Arbeitsstand und welche das abgenommene Ergebnis ist.

`humanizer` beschreibt einen Ablauf aus Erkennen, Überarbeiten und Gegenprüfen. Die aktuelle Fassung untersagt unbelegte Ergänzungen und verlangt die Kontrolle auf verlorene Aussagen. [24] **Eigene Bewertung:** Für deutsche Texte mit eigenen Vorher-nachher-Beispielen erproben. Natürlich klingende Sprache liefert keinen Beleg für die Richtigkeit oder menschliche Urheberschaft eines Textes.

### n8n und Hugging Face: Fachwissen mit Werkzeugzugriff verbinden

Die n8n-Sammlung erklärt beispielsweise Ausdruckssyntax, passende Workflowmuster und den Umgang mit Validierungsfehlern. Die Anbindung an `n8n-mcp` ist ein zentraler Bestandteil des vorgesehenen Einsatzes. [25] **Eigene Bewertung:** Ein technisch validierter Workflow braucht zusätzlich einen Test mit Beispieldaten, Fehlerfällen und erwarteten fachlichen Ergebnissen.

Bei Hugging Face sind Datenerkundung und Modellevaluation getrennte Skills. Der Dataset-Skill liefert API-Abläufe; der Evaluationsskill beschreibt Frameworks, Backends und kleine Probeläufe vor größeren Auswertungen. [26] · [27] **Eigene Bewertung:** Eine angebundene Datenquelle oder ein Modellkatalog ist noch keine Bewertungsmethode. Aufgabenauswahl, Vergleichsmaßstab und fachliche Abnahme müssen zum eigenen Einsatz passen.

## Wie belastbar ist der Nutzen von Skills insgesamt?

Die Forschung liefert unterschiedliche Ergebnisse:

- **SkillsBench, Version 4 vom 14. Juni 2026:** Auf 87 Aufgaben und 18 Modell-Agent-Konfigurationen stieg die durchschnittliche Erfolgsquote mit kuratierten Skills von 33,9 % auf 50,5 %. Kleine, fokussierte Skills mit höchstens drei Modulen schnitten besser ab als umfangreiche Sammlungen. [28]
- **SWE-Skills-Bench, Version 2 vom 27. Oktober 2026:** In einer anderen Untersuchung von 98 öffentlichen Entwicklungsskills hatten 92 keinen statistisch signifikanten Effekt. Die mittlere Erfolgsquote änderte sich von 76,6 % auf 76,9 %. Einzelne hilfreiche Skills ergänzten sonst ausgelassene Verfahren; schädliche Skills lenkten den Agenten auf unpassende Vorlagen. [29]

Die Untersuchungen verwenden unterschiedliche Aufgaben, Auswahlverfahren und Ausgangsleistungen. Die Zahlen sind deshalb nicht direkt vergleichbar. Beide sind veröffentlichte Preprints; ihre Ergebnisse gelten für die untersuchten Konfigurationen. Sie belegen weder, dass jeder Skill hilft, noch dass Skills generell wirkungslos sind.

**Eigene Schlussfolgerung:** Besonders aussichtsreich sind Skills, die fehlendes Projektwissen oder einen konkret benötigten Prüfablauf liefern. Allgemeine Anweisungen zu guter Arbeit müssen sich dagegen gegenüber einem guten Prompt und den vorhandenen Agentenfähigkeiten beweisen.

## Einführung und Kompatibilität

Das gemeinsame Dateiformat erleichtert die Übernahme. Es garantiert aber nicht, dass Shellskripte, Browser, Hooks oder Werkzeugnamen in einer anderen Anwendung gleich funktionieren. Diese Abhängigkeiten sind für den gewählten Skill zu prüfen. [1] · [19] · [23]

Für Codex nennt die aktuelle offizielle Dokumentation projektbezogene Skills unter `.agents/skills` und nutzerbezogene Skills unter `~/.agents/skills`. Eingebaute Skills umfassen `skill-creator` und `skill-installer`. Der Installer kann auch Skills aus anderen Repositories beziehen. [2] Die eingebauten Varianten sollten bei gleichen Namen zuerst geprüft werden, um doppelte oder widersprüchliche Anweisungen zu vermeiden.

Für einen überschaubaren Pilotversuch empfiehlt sich:

1. Einen wiederkehrenden Anwendungsfall und einen dafür passenden Skill auswählen.
2. Den vollständigen Skill einschließlich Skripten, benötigten Konten und Netzwerkzielen lesen; Version und Lizenz festhalten. Für Caveman insbesondere Sprachstil, lokalen Proxy und Cloud-Betrieb unterscheiden. [8]
3. Zunächst im Projekt erproben. Zusätzliche Laufzeiten und Rechte nur dann einrichten, wenn der ausgewählte Ablauf sie benötigt.
4. Dieselben Aufgaben mit und ohne Skill vergleichen und auch Aufgaben einbeziehen, bei denen er nicht auslösen sollte. Die offizielle OpenAI-Anleitung zu Skill-Evaluationen beschreibt solche positiven und negativen Auslösefälle. [30]
5. Nach Modell- oder Skill-Updates die betroffenen Vergleichsfälle erneut prüfen.

Das ist ein vorgeschlagener Einführungsablauf, kein Ergebnis einer hier durchgeführten Installation.

## Vorschlag für dieses Projekt

Aus den vorhandenen Arbeitsbereichen ergeben sich folgende Prioritäten. Die Zuordnung ist eine eigene Empfehlung auf Basis von `RESSOURCES.md` und `AGENTS.md`.

| Arbeitsbereich | Zuerst erproben | Abnahme im Pilot |
| --- | --- | --- |
| Recherche und Redaktion | Eigener Recherche-Skill, anschließend bei Bedarf `humanizer` | Datierter Dateiname, Aussagen mit konkreten Quellen, erhaltene Zahlen und Einschränkungen. |
| Dokumente für Beratung und Präsentation | Bereits verfügbare Dokument-, Tabellen- und Präsentationsskills | Datei öffnet; Berechnungen sind korrekt; alle Seiten beziehungsweise Folien wurden geprüft. |
| Entwicklung und Review | Systematische Fehlersuche, belegte Abschlussprüfung und Webtests | Fehler reproduziert; relevanter Test erfolgreich; Ergebnisse am richtigen Ticket dokumentiert. |
| React-Oberflächen | React Best Practices und Web Design Guidelines | Befunde passen zur verwendeten Architektur; bestehende Tests und sichtbare Nutzerabläufe bestehen. |
| Automatisierung | n8n-Skills bei einem konkreten n8n-Vorhaben | Workflow verarbeitet Beispieldaten korrekt und behandelt definierte Fehlerfälle. |
| Knappere technische Kommunikation | Caveman als optionaler Modus | Verständlichkeit bleibt erhalten; messbarer Vorteil gegenüber einer einfachen Kürze-Anweisung. |

**Ein eigener Recherche-Skill wäre besonders passend:** Er könnte die vorhandenen Regeln für Ablage, Datum, Quellenzuordnung und verständliche Sprache bündeln und um eine Abschlussprüfung ergänzen. Das ist ein Vorschlag für einen neuen Skill; diese Recherche legt ihn nicht an.

### Kleiner Vergleichstest

**Eigener Pilotvorschlag:** Je Anwendungsfall fünf typische Aufgaben auswählen und in frischen Sitzungen mit gleichem Modell und gleichen Werkzeugen bearbeiten. Ausgangsdateien, Modellstand, Skill-Version und Einstellungen festhalten. Die Varianten in wechselnder Reihenfolge ausführen; bei knappen Ergebnissen Wiederholungen vorsehen. Fünf Aufgaben liefern eine erste Entscheidungshilfe, keinen belastbaren allgemeinen Wirksamkeitsnachweis.

| Messgröße | Erfassung |
| --- | --- |
| Ergebnisqualität | Vorab definierte fachliche Kriterien vollständig, teilweise oder nicht erfüllt. |
| Nacharbeit | Benötigte menschliche Korrekturzeit in Minuten. |
| Aufwand | Gesamtdauer, Werkzeugaufrufe und gegebenenfalls tatsächliche API-Kosten. |
| Tokenverbrauch | Eingabe und Ausgabe getrennt; verfügbare Cache- und Reasoning-Angaben mitführen. |
| Auslösung | Skill bei passenden Aufgaben gewählt und bei unpassenden Aufgaben ausgelassen. |

Bei Caveman drei Varianten vergleichen: Standardantwort, einfache Kürze-Anweisung und Caveman. Übernehmen würde ich einen Skill erst, wenn er bei gleicher fachlicher Qualität weniger Nacharbeit oder einen wiederkehrenden, nachvollziehbaren Vorteil bringt.

## Quellen

Alle Onlinequellen wurden am 9. November 2026 geprüft. Repository-Dateien beschreiben den zu diesem Zeitpunkt abrufbaren Entwicklungsstand. Forschungsfassungen sind ausdrücklich angegeben; Installations- und Lizenzangaben sollten für den tatsächlich gewählten Release erneut kontrolliert werden.

1. [Agent Skills: Specification](https://agentskills.io/specification) – Dateistruktur, Metadaten und schrittweises Laden.
2. [OpenAI: Build skills](https://learn.chatgpt.com/docs/build-skills) – Skills, lokale Codex-Ablage, eingebaute Erstellungs- und Installationsskills.
3. [OpenAI: Plugin architecture](https://developers.openai.com/plugins/concepts/plugins) – Aufgaben von Skills, MCP und Plugins.
4. [Caveman: eigentliche Skill-Anweisungen](https://github.com/JuliusBrussee/caveman/blob/main/skills/caveman/SKILL.md) – Sprachstil, Aktivierung und Erhalt technischer Inhalte.
5. [JuliusBrussee/caveman: README](https://github.com/JuliusBrussee/caveman) – aktueller Funktionsumfang, getrennte Skill-Nutzung und Eigenmessung gegenüber knappen Antworten.
6. [JetBrains: Does Speaking to Agents Like Cavemen Really Save 65% of Tokens? We Test](https://blog.jetbrains.com/ai/2026/07/speak-to-ai-agents-like-cavemen-tosave-tokens/) – unabhängiger A/B-Test des damaligen Caveman-Skills, Versuchsaufbau und Ergebnisse.
7. [Adeyemi, Rossi und Dernoncourt: CAVEWOMAN, Version 1](https://arxiv.org/abs/2606.24083v1) – Preprint vom 23. Juni 2026 zu sprachlicher Eingabe- und Ausgabekompression.
8. [Caveman: Security and privacy](https://github.com/JuliusBrussee/caveman/blob/main/SECURITY.md) – Datenflüsse von Skill, Proxy und Cloud.
9. [Caveman: Licensing](https://github.com/JuliusBrussee/caveman/blob/main/LICENSING.md) – aktuelle Lizenzierung des Repositorys und Abgrenzung zum Cloud-Dienst.
10. [Anthropic: docx](https://github.com/anthropics/skills/blob/main/skills/docx/SKILL.md) – Word-Verarbeitung und gerenderte Sichtprüfung.
11. [Anthropic: xlsx](https://github.com/anthropics/skills/blob/main/skills/xlsx/SKILL.md) – Tabellen, Formeln, Annahmen und Fehlerprüfung.
12. [Anthropic: pptx](https://github.com/anthropics/skills/blob/main/skills/pptx/SKILL.md) – Präsentationserstellung, Bearbeitung und Validierung.
13. [Anthropic: pdf](https://github.com/anthropics/skills/blob/main/skills/pdf/SKILL.md) – PDF-Verarbeitung, Formulare und OCR.
14. [Anthropic: öffentliches Skills-Repository](https://github.com/anthropics/skills) – Einordnung als Beispiele und Hinweise auf Unterschiede zur Produktimplementierung.
15. [Anthropic: skill-creator](https://github.com/anthropics/skills/blob/main/skills/skill-creator/SKILL.md) – Erstellung, Testfälle, Vergleiche und Verbesserung von Skills.
16. [Superpowers: systematic-debugging](https://github.com/obra/superpowers/blob/main/skills/systematic-debugging/SKILL.md) – Reproduktion und Ursachenklärung vor Korrekturen.
17. [Superpowers: verification-before-completion](https://github.com/obra/superpowers/blob/main/skills/verification-before-completion/SKILL.md) – aktuelle Nachweise vor Erfolgsaussagen.
18. [obra/superpowers](https://github.com/obra/superpowers) – vollständige Entwicklungsmethodik und Agentenintegration.
19. [Planning with Files: Codex-Skill](https://github.com/OthmanAdi/planning-with-files/blob/master/.codex/skills/planning-with-files/SKILL.md) – Planungsdateien und Hook-Abhängigkeiten.
20. [Vercel: React Best Practices](https://github.com/vercel-labs/agent-skills/blob/main/skills/react-best-practices/SKILL.md) – frameworkbezogene Leistungsregeln; interner Skill-Name `vercel-react-best-practices`.
21. [Vercel: web-design-guidelines](https://github.com/vercel-labs/agent-skills/blob/main/skills/web-design-guidelines/SKILL.md) – Ablauf und Nachladen der Richtlinien.
22. [Vercel: Web Interface Guidelines](https://github.com/vercel-labs/web-interface-guidelines/blob/main/command.md) – konkrete Regeln zu Barrierefreiheit, Fokus, Formularen und weiteren Oberflächeneigenschaften.
23. [Anthropic: webapp-testing](https://github.com/anthropics/skills/blob/main/skills/webapp-testing/SKILL.md) – lokales Testen mit Python und Playwright.
24. [blader: humanizer](https://github.com/blader/humanizer/blob/main/SKILL.md) – redaktioneller Ablauf und Schutz vor hinzugefügten beziehungsweise verlorenen Aussagen.
25. [czlonkowski/n8n-skills](https://github.com/czlonkowski/n8n-skills) – Community-Sammlung, Fachabläufe und Integration mit n8n-mcp.
26. [Hugging Face: huggingface-datasets](https://github.com/huggingface/skills/blob/main/skills/huggingface-datasets/SKILL.md) – Dataset-Viewer-API und Datenerkundung.
27. [Hugging Face: huggingface-community-evals](https://github.com/huggingface/skills/blob/main/skills/huggingface-community-evals/SKILL.md) – Modellbewertung, Voraussetzungen und Backends.
28. [Li et al.: SkillsBench, Version 4](https://arxiv.org/abs/2602.12670v4) – Preprint-Fassung vom 14. Juni 2026; 87 Aufgaben und aggregierter Nutzen kuratierter Skills.
29. [Han et al.: SWE-Skills-Bench, Version 2](https://arxiv.org/abs/2603.15401v2) – Preprint-Fassung vom 27. Oktober 2026; Nutzen und Grenzen von 98 öffentlichen Entwicklungsskills.
30. [OpenAI: Testing Agent Skills Systematically with Evals](https://developers.openai.com/blog/eval-skills) – Prüfung von Auslösung und Verhalten mit positiven und negativen Fällen.
