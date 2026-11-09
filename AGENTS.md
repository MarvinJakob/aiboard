# Orientierung im Projekt

Schau bei der Suche nach Dateien, Code oder Dokumentation zuerst in [RESSOURCES.md](RESSOURCES.md). Dort stehen die wichtigsten Ablageorte und wofür sie gedacht sind.

# Regeln für Recherchen

- **Datum im Dateinamen.** Jede Recherchedatei muss mit dem Datum ihres Recherchestands im Format `JJJJ-MM-TT` beginnen, gefolgt von einem Leerzeichen und dem Titel. Beispiel `2026-11-05 AI Slop.md`.
- **Quellen angeben.** Jede Recherche muss die verwendeten Quellen im Dokument aufführen. Verlinke die konkrete Quelle, sofern sie online verfügbar ist, und ordne sie den Aussagen zu, die sie belegt.

# Regeln für Anforderungen

Formuliere jede Anforderung so einfach wie möglich.

- **Ablage.** Lege für jede neue Anforderung eine eigene Markdown-Datei im Ordner `requirements` an.
- **Dateiname.** Beginne den Dateinamen mit der nächsten fortlaufenden Nummer. Verwende die höchste vorhandene Anforderungsnummer plus eins. Beginne bei `1`, wenn es noch keine Anforderungen gibt.
- **Sprint.** Trage direkt unter der Überschrift `**Sprint N**` ein. Verwende für jede neue Anforderung die höchste vorhandene Sprintnummer plus eins. Beginne bei Sprint 1, wenn noch keine Sprintnummer vergeben ist.
- **User Story.** Beschreibe aus Sicht der Nutzerinnen und Nutzer, was sie mit dem Feature erreichen möchten und welchen Mehrwert es ihnen bietet.
- **Fachliche Beschreibung.** Beschreibe kurz und verständlich, was das Feature aus fachlicher Sicht leistet.
- **Akzeptanzkriterien.** Formuliere für jede Anforderung kurze, leicht verständliche Kriterien nach dem SMART-Prinzip. Sie sollen spezifisch, messbar, erreichbar, relevant und terminiert sein.
- **Technische Details.** Ergänze bei Bedarf einen eigenen Abschnitt mit den für die Umsetzung relevanten technischen Details.

# Entwicklungsworkflow im GitHub-Projekt AI Board

Der Entwicklungsagent setzt Tickets um. Ein separater Review-Agent prüft die Umsetzung und entscheidet über `Done`. Beide arbeiten im [AI Board](https://github.com/users/MarvinJakob/projects/1).

`Backlog` → `In Progress` → `Review` → `Done`. Bei Mängeln geht das Ticket von `Review` zurück nach `In Progress` und nach der Korrektur erneut nach `Review`.

## Entwicklungsagent

1. **Ein Ticket übernehmen.** Bearbeite jeweils nur ein Ticket. Setze zuerst dein laufendes Ticket fort und priorisiere Rückläufer aus dem Review vor neuen Tickets. Wähle sonst das nächste umsetzbare Ticket nach Backlog-Reihenfolge. Lies Beschreibung und Akzeptanzkriterien und verschiebe ein neu übernommenes Ticket vor der Umsetzung nach `In Progress`.
2. **Umsetzen und testen.** Arbeite in einem eigenen Branch und führe die relevanten Prüfungen aus [app/README.md](app/README.md) aus. Halte Blocker im Ticket fest. Bei Rückläufern behebe die dokumentierten Mängel im zugehörigen Pull Request und wiederhole die betroffenen Prüfungen.
3. **An Review übergeben.** Wenn die Umsetzung vollständig ist und die relevanten Prüfungen erfolgreich waren, veröffentliche den Branch, verknüpfe den prüfbereiten Pull Request mit dem Ticket und dokumentiere den Commit sowie die ausgeführten Prüfungen und ihre Ergebnisse. Verschiebe das Ticket nach `Review` und kontrolliere den Status im Board. Danach kannst du das nächste Ticket übernehmen.

## Review-Agent

1. **Tickets auswählen.** Öffne [AI Board](https://github.com/users/MarvinJakob/projects/1) und prüfe die Spalte `Review`. Lies für jedes Ticket die Beschreibung, die Akzeptanzkriterien und verknüpfte Pull Requests.
2. **Prüfstand bestimmen.** Verwende den zugehörigen PR-Stand oder den Zielbranch, wenn die Umsetzung bereits dort liegt. Halte den geprüften Commit fest.
3. **Umsetzung prüfen.** Gleiche den Code mit den Akzeptanzkriterien ab, führe die relevanten Tests gemäß `app/README.md` aus und prüfe sichtbares Verhalten bei Bedarf in der laufenden Anwendung. Halte je Ticket die Prüfschritte, Ergebnisse und bei Fehlern die Schritte zur Reproduktion fest.
4. **Status setzen.** Verschiebe das Ticket nach `Done`, wenn alle Akzeptanzkriterien nachweislich erfüllt sind. Verschiebe es nach `In Progress`, wenn ein Kriterium nicht erfüllt ist. Fehlt nur der Zugriff oder eine Prüfvoraussetzung, belasse das Ticket in `Review` und benenne den konkreten Blocker im Review-Ergebnis. Wird ein Pull Request nach `main` gemerged, lösche den zugehörigen Branch danach auf GitHub (z. B. `gh pr merge --delete-branch`) und lokal.5. **Ergebnis übergeben.** Halte das Ergebnis am Ticket fest. Nenne bei einer Rückgabe das nicht erfüllte Akzeptanzkriterium und die Schritte zur Reproduktion, damit der Entwicklungsagent die Korrektur übernehmen kann. Prüfe den Status im Board und fasse die Ergebnisse mit Ticket-Links zusammen.
