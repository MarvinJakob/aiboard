# Orientierung im Projekt

Schau bei der Suche nach Dateien, Code oder Dokumentation zuerst in [RESSOURCES.md](RESSOURCES.md). Dort stehen die wichtigsten Ablageorte und wofür sie gedacht sind.

# Regeln für Recherchen

- **Datum im Dateinamen.** Jede Recherchedatei muss mit dem Datum ihres Recherchestands im Format `JJJJ-MM-TT` beginnen, gefolgt von einem Leerzeichen und dem Titel. Beispiel `2026-11-05 AI Slop.md`.
- **Quellen angeben.** Jede Recherche muss die verwendeten Quellen im Dokument aufführen. Verlinke die konkrete Quelle, sofern sie online verfügbar ist, und ordne sie den Aussagen zu, die sie belegt.

# Regeln für Anforderungen

Formuliere jede Anforderung so einfach wie möglich.

- **Tickets in GitHub.** Lege Tickets in GitHub an und ordne sie dem Projekt [AI Board](https://github.com/users/MarvinJakob/projects/1) zu.
- **User Story.** Beschreibe aus Sicht der Nutzerinnen und Nutzer, was sie mit dem Feature erreichen möchten und welchen Mehrwert es ihnen bietet.
- **Fachliche Beschreibung.** Beschreibe kurz und verständlich, was das Feature aus fachlicher Sicht leistet.
- **Akzeptanzkriterien.** Formuliere für jede Anforderung kurze, leicht verständliche Kriterien nach dem SMART-Prinzip. Sie sollen spezifisch, messbar, erreichbar, relevant und terminiert sein.
- **Technische Details.** Ergänze bei Bedarf einen eigenen Abschnitt mit den für die Umsetzung relevanten technischen Details.

# Entwicklungsworkflow im GitHub-Projekt AI Board

Der Entwicklungsagent setzt Tickets um. Ein separater Review-Agent prüft die Umsetzung im Feature-Branch, erfasst Bugs und mergt das Feature nach erfolgreicher Prüfung in `main`. Erst danach setzt er das Feature-Ticket auf `Done`. Beide arbeiten im [AI Board](https://github.com/users/MarvinJakob/projects/1).

`Todo` → `In Progress` → `Review` → `Done`. Bei Mängeln geht das Ticket von `Review` zurück nach `In Progress` und nach der Korrektur erneut nach `Review`.

**Branches nach dem Merge löschen.** Lösche jeden Arbeitsbranch nach dem bestätigten Merge in `main` auf dem Remote und lokal. Behalte `main`. Prüfe vorher, dass alle Änderungen übernommen wurden. Lösche lokale Branches erst, wenn sie in keinem Worktree mehr ausgecheckt sind, und bewahre ungesicherte Änderungen.

## Mit dem AI Board verbinden

Verwende die GitHub CLI (`gh`) und lade den GitHub-Token aus `.token/github`. Die Datei enthält nur den Token und bleibt lokal. Gib den Token nicht aus und nimm ihn nicht in Commits auf. `GH_TOKEN` authentifiziert `gh`, ohne den Token über `gh auth login` zu speichern.

Führe vom Stammverzeichnis des Repositorys aus diese lesende Prüfung in PowerShell aus:

```powershell
$vorherigerGhToken = $env:GH_TOKEN
try {
    $env:GH_TOKEN = (Get-Content -LiteralPath '.token/github' -Raw -ErrorAction Stop).Trim()
    if (-not $env:GH_TOKEN) { throw 'Die Datei .token/github ist leer.' }

    gh api --hostname github.com graphql -f 'query=query { user(login: "MarvinJakob") { projectV2(number: 1) { title } } }' --jq '.data.user.projectV2.title'
    if ($LASTEXITCODE -ne 0) { throw 'Der Zugriff auf das AI Board ist fehlgeschlagen.' }
} finally {
    $env:GH_TOKEN = $vorherigerGhToken
}
```

Wenn die Abfrage `AI Board` ausgibt, steht die Verbindung. `MarvinJakob` ist der Besitzer und `1` die Projektnummer aus der Board-URL. Führe weitere Board-Abfragen innerhalb desselben `try`-Blocks aus, solange der Token gesetzt ist. Ein klassischer persönlicher Zugriffstoken braucht laut [GitHub-Dokumentation](https://docs.github.com/en/issues/planning-and-tracking-with-projects/automating-your-project/using-the-api-to-manage-projects#authentication) `read:project` zum Lesen oder `project` für Änderungen am Board.

## Entwicklungsagent

**Vor jedem Push.** Hole mit `git pull` den aktuellen Stand des Remote-Branches und führe ihn bei Bedarf lokal mit deinen Änderungen zusammen. Hole auch den aktuellen Stand von `main` und merge ihn bei Bedarf in deinen Feature-Branch. Beim ersten Push eines neuen Feature-Branches genügt der Pull von `main`, da der Feature-Branch auf dem Remote noch nicht existiert. Löse etwaige Merge-Konflikte und wiederhole die betroffenen Prüfungen vor dem Push.

1. **Ein Ticket übernehmen.** Bearbeite jeweils nur ein Ticket. Setze zuerst dein laufendes Ticket fort und priorisiere Rückläufer aus dem Review vor neuen Tickets. Wähle sonst das nächste umsetzbare Ticket aus `Todo` nach der Reihenfolge im Board. Lies Beschreibung und Akzeptanzkriterien und verschiebe das Ticket zuerst von `Todo` nach `In Progress`.
2. **Feature-Branch erstellen, umsetzen und testen.** Lege nach der Übernahme und vor der Umsetzung für jedes Feature einen eigenen Feature-Branch auf Basis von `main` an. Implementiere das Feature in diesem Branch. Führe die relevanten Prüfungen aus [app/README.md](app/README.md) aus und halte Blocker im Ticket fest. Bei Rückläufern behebe die dokumentierten Mängel und verknüpften Bug-Tickets im bestehenden Feature-Branch des Pull Requests und wiederhole die betroffenen Prüfungen. Verschiebe das jeweils bearbeitete Bug-Ticket vor der Korrektur nach `In Progress` und nach der Korrektur mit dokumentiertem Commit und Testergebnis nach `Review`.
3. **Pull Request erstellen.** Wenn das Feature vollständig implementiert ist und die relevanten Prüfungen erfolgreich waren, veröffentliche den Feature-Branch und eröffne einen Pull Request, um das Feature in `main` zu mergen. Verwende bei Rückläufern den bestehenden Pull Request. Verknüpfe den prüfbereiten Pull Request mit dem Ticket und dokumentiere den Commit sowie die ausgeführten Prüfungen und ihre Ergebnisse.
4. **An Review übergeben.** Verschiebe das Ticket anschließend von `In Progress` nach `Review` und kontrolliere den Status im Board. Danach kannst du das nächste Ticket übernehmen.

## Review-Agent

**Auftrag „Review durchführen“.** Prüfe alle Tickets, die im [AI Board](https://github.com/users/MarvinJakob/projects/1) in der Spalte `Review` stehen, nach den folgenden Schritten. Dazu gehören die Tests im Feature-Branch, das Anlegen von Bug-Tickets, die Prüfung aller zum Feature gehörenden Fehlerkorrekturen und bei erfolgreicher Prüfung der Merge in `main`. Prüfe nicht nur die zuletzt erstellten Ticketbeschreibungen oder lokalen Änderungen. Ist die Spalte leer, melde, dass keine Tickets zur Prüfung vorliegen.

1. **Tickets auswählen.** Öffne [AI Board](https://github.com/users/MarvinJakob/projects/1) und prüfe die Spalte `Review`. Lies für jedes Ticket die Beschreibung, die Akzeptanzkriterien, verknüpfte Pull Requests und alle zugehörigen Bug-Tickets.
2. **Feature-Branch prüfen.** Checke den aktuellen Stand des zugehörigen Feature-Branches aus und halte den geprüften Commit fest. Verwende `main` nur dann als Prüfstand, wenn die Umsetzung bereits dorthin gemergt wurde.
3. **Umsetzung testen.** Prüfe im Feature-Branch, ob das Feature alle Akzeptanzkriterien erfüllt. Führe die relevanten Tests gemäß [app/README.md](app/README.md) aus und prüfe sichtbares Verhalten bei Bedarf in der laufenden Anwendung. Halte je Ticket die Prüfschritte und Ergebnisse fest.
4. **Bugs erfassen und zurückgeben.** Lege für jeden gefundenen Bug ein GitHub-Ticket an, ordne es dem AI Board im Status `Todo` zu und verknüpfe es mit dem Feature-Ticket und dem Pull Request. Beschreibe das betroffene Akzeptanzkriterium, Schritte zur Reproduktion sowie erwartetes und tatsächliches Verhalten. Verwende bei bereits erfassten Bugs das bestehende Ticket. Setze das Feature-Ticket bei Bugs oder nicht erfüllten Akzeptanzkriterien zurück auf `In Progress`. Merge das Feature noch nicht.
5. **Alle Fehlerkorrekturen prüfen.** Prüfe vor dem Merge sämtliche Bug-Tickets des Features. Ein geschlossenes Ticket allein genügt nicht: Teste anhand der Reproduktionsschritte im aktuellen Feature-Branch, ob jeder Bug behoben ist, und wiederhole die relevanten Tests des Features. Dokumentiere das Ergebnis am jeweiligen Bug-Ticket. Setze erfolgreich geprüfte Bug-Tickets auf `Done` und schließe sie; gib weiterhin fehlerhafte Bug-Tickets nach `In Progress` zurück. Solange ein Bug offen oder seine Behebung nicht nachgewiesen ist, bleibt der Merge gesperrt.
6. **Pull Request erstellen und mergen.** Wenn alle Akzeptanzkriterien erfüllt sind, die relevanten Tests erfolgreich waren und alle zugehörigen Bugs nachweislich behoben sind, erstelle einen Pull Request vom Feature-Branch nach `main`, sofern noch keiner existiert. Verwende andernfalls den vorhandenen Pull Request. Prüfe, dass er den geprüften Commit enthält und die erforderlichen PR-Prüfungen erfolgreich sind. Bei zwischenzeitlichen Änderungen prüfe den neuen Stand erneut. Merge anschließend den Pull Request in `main`, kontrolliere den erfolgreichen Merge und setze erst dann das Feature-Ticket auf `Done`. Liegt die Umsetzung bereits in `main`, entfällt ein weiterer Pull Request und Merge.
7. **Feature-Branch aufräumen.** Lösche nach dem bestätigten Merge in `main` den zugehörigen Feature-Branch auf dem Remote und lokal. Wechsle vor dem lokalen Löschen auf `main` und aktualisiere ihn. Stelle vorher sicher, dass der Feature-Branch keine zusätzlichen, noch nicht übernommenen Änderungen enthält und nicht mehr in einem anderen Worktree verwendet wird. Bewahre ungesicherte Änderungen und dokumentiere mögliche Blocker beim Aufräumen am Ticket.
8. **Ergebnis übergeben und Blocker festhalten.** Dokumentiere am Feature-Ticket den geprüften Commit, die Tests und Ergebnisse, verknüpfte Bug-Tickets sowie bei Erfolg den Pull Request, den Merge-Commit und das Aufräumen des Feature-Branches. Fehlt nur der Zugriff, eine Prüfvoraussetzung oder die Möglichkeit zum Merge, belasse das betroffene Ticket in `Review` und benenne den konkreten Blocker. Prüfe die Status im Board und fasse die Ergebnisse mit Ticket-Links zusammen.
