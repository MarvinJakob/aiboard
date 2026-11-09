# KI-Tipps und Tricks: Skills you need to know

*Stand: 9. November 2026.*

## Metadaten der Themenseite

- **Slug:** `ki-tipps-und-tricks`
- **Label:** KI-Tipps und Tricks
- **Titel:** KI-Tipps und Tricks
- **Untertitel:** Skills you need to know
- **Kurzbeschreibung:** Welche Skills KI-Agenten wirklich helfen und wie belastbar der Nutzen ist.
- **Einführung:** Skills halten wiederkehrende Arbeitsabläufe für KI-Agenten fest, etwa für Excel-Auswertungen oder die systematische Fehlersuche. Wir ordnen ein, was Studien zeigen, welche Skills sich für einen Test lohnen und wie Sie den Nutzen in Ihrem eigenen Arbeitsablauf prüfen.

---

**50,5 statt 33,9 Prozent. So viel mehr Aufgaben lösten KI-Agenten in einer Studie, wenn sie kuratierte Skills nutzen konnten. Aber nicht jeder Skill hilft: Kleine, fokussierte Skills schneiden besser ab als umfangreiche Sammlungen.**

## Was Skills sind und wie sie funktionieren

Ein Skill hält einen wiederkehrenden Arbeitsablauf für einen KI-Agenten fest. Er kann zum Beispiel vorgeben, wie ein Agent Dokumente erstellt, Fehler untersucht oder eine Webseite prüft. Das zugrunde liegende Modell trainiert er dabei nicht neu. [1]

Ein Skill besteht mindestens aus einer Datei `SKILL.md` mit Name, Beschreibung und Anweisungen. Dazu können Skripte, Referenzen und Vorlagen kommen. Der Agent sieht zunächst nur die Metadaten und liest die ausführlichen Anweisungen erst bei Bedarf. Eine präzise Beschreibung entscheidet deshalb mit darüber, ob der passende Skill ausgewählt wird. [1]

Zur Abgrenzung (die Beispiele sind eigene Veranschaulichungen):

- **Prompt:** der aktuelle Auftrag, etwa „Prüfe das Anmeldeformular.“
- **Projektanweisungen wie `AGENTS.md`:** projektweite Regeln, etwa Testbefehle.
- **Skill:** ein wiederverwendbarer Ablauf, etwa Formularzustände testen und Befunde dokumentieren.
- **Werkzeug oder MCP-Server:** liefert Daten oder führt Aktionen aus, etwa einen Browser bedienen.
- **Plugin:** bündelt unter anderem Skills und optional Werkzeuganbindungen.

**Ein Skill allein schafft keinen Zugriff auf einen Browser, ein Konto oder eine Datenbank.** Die nötigen Werkzeuge und Rechte müssen vorhanden sein. [2]

## Caveman: Was belegt ist und was nicht

Caveman (`JuliusBrussee/caveman`) lässt Antworten kürzer ausfallen: Ergebnis zuerst, weniger Floskeln, knappe Sätze. Technische Angaben, Zahlen, Einheiten, Negationen, Code und Befehle sollen erhalten bleiben. [3] Das aktuelle Repository enthält darüber hinaus Proxy-, Eingabekompressions- und Modellwahlfunktionen, die getrennt vom Sprachstil-Skill zu bewerten sind. [4]

Was die Quellen zur Ersparnis zeigen:

- **Herstellerangabe:** In einer kleinen Eigenmessung mit zehn Entwicklerfragen nennt der Herausgeber für den normalen Modus nur 3 % zusätzliche Einsparung im Median gegenüber der einfachen Aufforderung zu knappen Antworten. Ein unabhängiger Produktivnachweis ist das nicht. [4]
- **JetBrains:** Im großen Lauf über 82 gepaarte Aufgaben mit Claude Code sanken die Ausgabetokens um etwa 8,5 %. Ein statistisch nachweisbarer Qualitätsunterschied wurde nicht gefunden. Das gilt für diesen Versuchsaufbau, in dem Caveman erzwungen aktiviert war. Gleichwertigkeit für jede Aufgabe beweist es nicht. [5]
- **Preprint CAVEWOMAN:** Sprachliche Ausgabekompression senkte die Kosten in vielen getesteten Konfigurationen; Eingabekompression verschlechterte in diesem Versuch Kosten und Genauigkeit. Das Paket in seiner heutigen Form wurde nicht validiert. [6]

Eine pauschale Ersparnis von 65 Prozent für vollständige Agentensitzungen lässt sich daraus nicht ableiten. [5] Ausgabetoken-Ersparnis und Gesamtkosten-Ersparnis sind außerdem verschiedene Größen. Rechenbeispiel, keine Messung: Macht die beeinflussbare Ausgabe 20 % der bisherigen Kosten aus und sinkt um 10 %, beträgt die Ersparnis insgesamt 2 %.

**Wo Caveman nützlich sein kann (eigene Bewertung):** bei kurzen Statusmeldungen, technischen Rückfragen und kompakten Zusammenfassungen, wenn die Lesenden den Kontext kennen. Weniger passend ist er für ausführliche Recherchen, Lernmaterial und Kundentexte. Vergleichsmaßstab sollte die einfache Anweisung „Antworte knapp und vollständig“ sein.

Auch die Betriebsart zählt: Laut Sicherheitsdokumentation ruft der Skill selbst keinen Caveman-Dienst auf. Ein verwaltetes Gateway leitet Anfragen und Antworten dagegen über Caveman Cloud, und ein lokaler Proxy verarbeitet Anfragen und Zugangsdaten auf dem Weg zum Anbieter. [7]

## Weitere nützliche Skills im Überblick

Die Auswahl ist eine Empfehlung für einen Pilotversuch. Die Quellen belegen die beschriebenen Abläufe, aber keine garantierte Zeitersparnis in Ihrem Unternehmen.

| Skill | Wofür | Worauf achten |
| --- | --- | --- |
| `docx`, `xlsx`, `pptx`, `pdf` (Anthropic) | Word-Dateien, Tabellen, Präsentationen und PDFs erstellen oder bearbeiten, mit Regeln zur Ergebnisprüfung [8–11] | Benötigt passende Bibliotheken; zuerst vorhandene Dokumentskills der eigenen Anwendung nutzen |
| `skill-creator` (Anthropic) | Eigene Abläufe in Skills überführen, inklusive Testfällen und Vergleichen [12] | Erzeugte Skills fachlich prüfen und mit realen Aufgaben testen |
| `systematic-debugging`, `verification-before-completion` (Superpowers) | Fehler reproduzieren, Ursachen klären, Erfolg mit ausgeführten Prüfungen belegen [13] [14] | Zugriff auf Anwendung, Logs und Tests nötig; gezielt übernehmen statt den ganzen Prozess |
| `webapp-testing` (Anthropic) | Lokale Webanwendungen bedienen, Verhalten, Screenshots und Browsermeldungen prüfen [15] | Laufende Anwendung, Python, Playwright und Browser nötig |
| `planning-with-files` (OthmanAdi) | Plan, Erkenntnisse und Fortschritt in Dateien festhalten [16] | Schreibzugriff nötig; Wiederaufnahme hängt von Hooks und Agent ab |
| `n8n-skills` (czlonkowski) | n8n-Ausdrücke, Workflowmuster und Validierungsfehler bearbeiten [17] | Community-Projekt; auf `n8n-mcp` ausgerichtet |
| `humanizer` (blader) | Texte auf stereotype KI-Formulierungen prüfen und überarbeiten [18] | Sprachliche Redaktion, keine Faktenprüfung; Deutsch gesondert beurteilen |

Bei Dokumenten liegt der Mehrwert im Prüfablauf: `xlsx` fordert unter anderem berechenbare Formeln, dokumentierte Annahmen und die Prüfung auf Formelfehler, `docx` eine gerenderte Sichtprüfung. [8–11] Ein formal gültiges Dokument kann trotzdem inhaltlich falsch sein; die fachliche Richtigkeit bleibt Ihre Aufgabe.

## Wie belastbar ist der Nutzen insgesamt?

Die Forschung liefert uneinheitliche Ergebnisse:

- **SkillsBench (Preprint):** Auf 87 Aufgaben und 18 Modell-Agent-Konfigurationen stieg die durchschnittliche Erfolgsquote mit kuratierten Skills von 33,9 % auf 50,5 %. Kleine, fokussierte Skills mit höchstens drei Modulen schnitten besser ab als umfangreiche Sammlungen. [19]
- **SWE-Skills-Bench (Preprint):** Von 98 öffentlichen Entwicklungsskills hatten 92 keinen statistisch signifikanten Effekt. Die mittlere Erfolgsquote änderte sich von 76,6 % auf 76,9 %. Einzelne Skills halfen; schädliche lenkten den Agenten auf unpassende Vorlagen. [20]

Aufgaben, Auswahlverfahren und Ausgangsleistungen unterscheiden sich, die Zahlen sind daher nicht direkt vergleichbar. Weder belegen die Studien, dass jeder Skill hilft, noch dass Skills wirkungslos sind.

**Unsere Schlussfolgerung:** Aussichtsreich sind Skills, die fehlendes Projektwissen oder einen konkreten Prüfablauf liefern. Allgemeine Anweisungen zu guter Arbeit müssen sich dagegen gegen einen guten Prompt behaupten.

## Einführung und Kompatibilität

Das gemeinsame Dateiformat erleichtert die Übernahme. Es garantiert aber nicht, dass Shellskripte, Browser, Hooks oder Werkzeugnamen in einer anderen Anwendung gleich funktionieren. [1] Für Codex nennt die offizielle Dokumentation projektbezogene Skills unter `.agents/skills` und nutzerbezogene unter `~/.agents/skills`; eingebaut sind unter anderem `skill-creator` und `skill-installer`. [21]

Ein überschaubarer Einstieg (vorgeschlagener Ablauf, keine durchgeführte Installation):

1. Einen wiederkehrenden Anwendungsfall und einen passenden Skill auswählen.
2. Den Skill vollständig lesen, auch Skripte, Konten und Netzwerkziele; Version und Lizenz festhalten.
3. Zunächst im Projekt erproben und zusätzliche Rechte nur bei Bedarf einrichten.
4. Dieselben Aufgaben mit und ohne Skill vergleichen, auch solche, bei denen er nicht auslösen sollte. [22]
5. Nach Modell- oder Skill-Updates die Vergleichsfälle erneut prüfen.

## Ein kleiner eigener Vergleichstest

Wählen Sie je Anwendungsfall fünf typische Aufgaben und bearbeiten Sie sie in frischen Sitzungen mit gleichem Modell und gleichen Werkzeugen. Halten Sie Ausgangsdateien, Modellstand, Skill-Version und Einstellungen fest, führen Sie die Varianten in wechselnder Reihenfolge aus und wiederholen Sie knappe Fälle. Fünf Aufgaben sind eine erste Entscheidungshilfe, kein allgemeiner Wirksamkeitsnachweis.

- **Ergebnisqualität:** Vorab definierte Kriterien: vollständig, teilweise oder nicht erfüllt.
- **Nacharbeit:** Menschliche Korrekturzeit in Minuten.
- **Aufwand:** Gesamtdauer, Werkzeugaufrufe, gegebenenfalls API-Kosten.
- **Tokenverbrauch:** Eingabe und Ausgabe getrennt erfassen.
- **Auslösung:** Skill bei passenden Aufgaben gewählt, bei unpassenden ausgelassen.

Bei Caveman vergleichen Sie drei Varianten: Standardantwort, einfache Kürze-Anweisung und Caveman. Übernehmen Sie einen Skill erst, wenn er bei gleicher fachlicher Qualität weniger Nacharbeit oder einen wiederkehrenden, nachvollziehbaren Vorteil bringt.

## Quellen

Alle Onlinequellen wurden am 9. November 2026 geprüft. Repository-Dateien beschreiben den zu diesem Zeitpunkt abrufbaren Entwicklungsstand; vor einer Einführung sollten Release und Lizenz des gewählten Skills erneut kontrolliert werden.

1. [Agent Skills: Specification](https://agentskills.io/specification) – Dateistruktur, Metadaten und schrittweises Laden.
2. [OpenAI: Plugin architecture](https://developers.openai.com/plugins/concepts/plugins) – Aufgaben von Skills, MCP und Plugins.
3. [Caveman: eigentliche Skill-Anweisungen](https://github.com/JuliusBrussee/caveman/blob/main/skills/caveman/SKILL.md) – Sprachstil, Aktivierung und Erhalt technischer Inhalte.
4. [JuliusBrussee/caveman: README](https://github.com/JuliusBrussee/caveman) – aktueller Funktionsumfang, getrennte Skill-Nutzung und Eigenmessung des Herausgebers.
5. [JetBrains: Does Speaking to Agents Like Cavemen Really Save 65% of Tokens? We Test](https://blog.jetbrains.com/ai/2026/07/speak-to-ai-agents-like-cavemen-tosave-tokens/) – A/B-Test des damaligen Caveman-Skills.
6. [Adeyemi, Rossi und Dernoncourt: CAVEWOMAN, Version 1](https://arxiv.org/abs/2606.24083v1) – Preprint vom 23. Juni 2026 zu sprachlicher Eingabe- und Ausgabekompression.
7. [Caveman: Security and privacy](https://github.com/JuliusBrussee/caveman/blob/main/SECURITY.md) – Datenflüsse von Skill, Proxy und Cloud.
8. [Anthropic: docx](https://github.com/anthropics/skills/blob/main/skills/docx/SKILL.md) – Word-Verarbeitung und gerenderte Sichtprüfung.
9. [Anthropic: xlsx](https://github.com/anthropics/skills/blob/main/skills/xlsx/SKILL.md) – Tabellen, Formeln, Annahmen und Fehlerprüfung.
10. [Anthropic: pptx](https://github.com/anthropics/skills/blob/main/skills/pptx/SKILL.md) – Präsentationserstellung, Bearbeitung und Validierung.
11. [Anthropic: pdf](https://github.com/anthropics/skills/blob/main/skills/pdf/SKILL.md) – PDF-Verarbeitung, Formulare und OCR.
12. [Anthropic: skill-creator](https://github.com/anthropics/skills/blob/main/skills/skill-creator/SKILL.md) – Erstellung, Testfälle, Vergleiche und Verbesserung von Skills.
13. [Superpowers: systematic-debugging](https://github.com/obra/superpowers/blob/main/skills/systematic-debugging/SKILL.md) – Reproduktion und Ursachenklärung vor Korrekturen.
14. [Superpowers: verification-before-completion](https://github.com/obra/superpowers/blob/main/skills/verification-before-completion/SKILL.md) – aktuelle Nachweise vor Erfolgsaussagen.
15. [Anthropic: webapp-testing](https://github.com/anthropics/skills/blob/main/skills/webapp-testing/SKILL.md) – lokales Testen mit Python und Playwright.
16. [Planning with Files: Codex-Skill](https://github.com/OthmanAdi/planning-with-files/blob/master/.codex/skills/planning-with-files/SKILL.md) – Planungsdateien und Hook-Abhängigkeiten.
17. [czlonkowski/n8n-skills](https://github.com/czlonkowski/n8n-skills) – Community-Sammlung, Fachabläufe und Integration mit n8n-mcp.
18. [blader: humanizer](https://github.com/blader/humanizer/blob/main/SKILL.md) – redaktioneller Ablauf und Schutz vor hinzugefügten beziehungsweise verlorenen Aussagen.
19. [Li et al.: SkillsBench, Version 4](https://arxiv.org/abs/2602.12670v4) – Preprint-Fassung vom 14. Juni 2026; 87 Aufgaben und aggregierter Nutzen kuratierter Skills.
20. [Han et al.: SWE-Skills-Bench, Version 2](https://arxiv.org/abs/2603.15401v2) – Preprint-Fassung vom 27. Oktober 2026; Nutzen und Grenzen von 98 öffentlichen Entwicklungsskills.
21. [OpenAI: Build skills](https://learn.chatgpt.com/docs/build-skills) – Skills, lokale Codex-Ablage, eingebaute Erstellungs- und Installationsskills.
22. [OpenAI: Testing Agent Skills Systematically with Evals](https://developers.openai.com/blog/eval-skills) – Prüfung von Auslösung und Verhalten mit positiven und negativen Fällen.
