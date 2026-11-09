# Orientierung

Lies vor der Suche nach Dateien, Code oder Dokumentation [RESSOURCES.md](RESSOURCES.md): Ablageorte und ihr Zweck.

# Recherchen

- Dateiname: Datum des Recherchestands als `JJJJ-MM-TT`, Leerzeichen, Titel; z. B. `2026-11-05 AI Slop.md`.
- Führe die verwendeten Quellen im Dokument auf, ordne sie den belegten Aussagen zu und verlinke konkrete Onlinequellen.

# Anforderungen

Formuliere Anforderungen so einfach wie möglich. Lege Tickets in GitHub an und ordne sie dem [AI Board](https://github.com/users/MarvinJakob/projects/1) zu. Jedes Ticket enthält:

- **User Story:** Nutzerperspektive, gewünschtes Ziel und Mehrwert.
- **Fachliche Beschreibung:** kurz und verständlich, was das Feature leistet.
- **Akzeptanzkriterien:** kurz, verständlich und SMART (spezifisch, messbar, erreichbar, relevant, terminiert).
- **Technische Details:** bei Bedarf als eigener Abschnitt mit umsetzungsrelevanten Angaben.

# Entwicklungsworkflow: AI Board

Der Entwicklungsagent implementiert; ein separater Review-Agent prüft im Feature-Branch, erfasst Bugs und mergt nach erfolgreicher Prüfung in `main`. Erst nach bestätigtem Merge setzt er das Feature-Ticket auf `Done`. Beide arbeiten im oben verlinkten AI Board.

Statusfolge: `Todo` → `In Progress` → `Review` → `Done`. Bei Mängeln: `Review` → `In Progress` → nach Korrektur erneut `Review`.

## Board-Zugriff

Nutze die GitHub CLI (`gh`) mit dem Token aus `.token/github`. Die Datei enthält nur den Token und bleibt lokal. Gib den Token nicht aus und committe ihn nicht. Authentifiziere über `GH_TOKEN`, ohne Speicherung per `gh auth login`.

Führe diese lesende Prüfung in PowerShell im Repository-Stamm aus:

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

Ausgabe `AI Board` bestätigt den Zugriff. Besitzer: `MarvinJakob`, Projektnummer: `1` (aus der Board-URL). Führe weitere Board-Abfragen im selben `try`-Block mit gesetztem Token aus. Klassische persönliche Zugriffstoken benötigen `read:project` zum Lesen bzw. `project` für Board-Änderungen ([GitHub-Dokumentation](https://docs.github.com/en/issues/planning-and-tracking-with-projects/automating-your-project/using-the-api-to-manage-projects#authentication)).

## Entwicklungsagent

1. **Ticket übernehmen:** Bearbeite nur ein Ticket gleichzeitig. Setze zuerst dein laufendes Ticket fort; Rückläufer haben Vorrang vor neuen Tickets. Wähle sonst das nächste umsetzbare `Todo`-Ticket in Board-Reihenfolge. Lies Beschreibung und Akzeptanzkriterien; setze es vor Arbeitsbeginn von `Todo` auf `In Progress`.
2. **Implementieren und testen:** Erstelle nach Übernahme und vor Umsetzung für jedes Feature einen eigenen Branch aus `main`; implementiere dort. Führe die relevanten Prüfungen aus [app/README.md](app/README.md) aus und dokumentiere Blocker im Ticket. Bei Rückläufern: Behebe dokumentierte Mängel und verknüpfte Bugs im bestehenden PR-Branch; wiederhole betroffene Prüfungen. Setze jedes bearbeitete Bug-Ticket vor Korrektur auf `In Progress`, danach mit dokumentiertem Commit und Testergebnis auf `Review`.
3. **Pull Request (PR):** Erst bei vollständiger Umsetzung und erfolgreichen relevanten Prüfungen den Branch veröffentlichen und einen PR nach `main` eröffnen. Bei Rückläufern den bestehenden PR verwenden. Verknüpfe den prüfbereiten PR mit dem Ticket; dokumentiere Commit, ausgeführte Prüfungen und Ergebnisse.
4. **Übergeben:** Setze das Feature-Ticket von `In Progress` auf `Review` und kontrolliere den Board-Status. Danach darfst du das nächste Ticket übernehmen.

**Nach jeder Ticket-Umsetzung und vor dem PR:** Prüfe, dass der Code klar strukturiert, verständlich und wartbar ist. Entferne unnötigen Code und vermeidbare Duplikate. Ergänze/aktualisiere verständliche Codedokumentation, besonders zu nicht offensichtlichen Zusammenhängen und Entscheidungen. Behebe erkannte technische Schulden im geänderten Code; vermeide neue.

**Vor jedem Push:** Hole mit `git pull` den aktuellen Stand des Remote-Branches und führe ihn bei Bedarf mit lokalen Änderungen zusammen. Hole auch den aktuellen Stand von `main` und merge ihn bei Bedarf in den Feature-Branch. Beim ersten Push genügt der Pull von `main`, da der Remote-Feature-Branch noch nicht existiert. Löse Konflikte und wiederhole betroffene Prüfungen vor dem Push.

## Review-Agent

Bei Auftrag **„Review durchführen“**: Prüfe alle Tickets in `Review` nach den folgenden Schritten, einschließlich Feature-Tests, Bug-Erfassung, sämtlicher Fehlerkorrekturen und bei Erfolg Merge in `main`. Beschränke dich nicht auf zuletzt erstellte Ticketbeschreibungen oder lokale Änderungen. Ist `Review` leer, melde dies.

1. **Auswählen:** Öffne das AI Board, prüfe `Review` und lies je Ticket Beschreibung, Akzeptanzkriterien, verknüpfte PRs und alle zugehörigen Bug-Tickets.
2. **Prüfstand:** Checke den aktuellen Feature-Branch aus und halte den geprüften Commit fest. Prüfe nur dann auf `main`, wenn die Umsetzung bereits dorthin gemergt ist.
3. **Testen:** Prüfe alle Akzeptanzkriterien im Feature-Branch, führe relevante Tests gemäß [app/README.md](app/README.md) aus und prüfe bei Bedarf sichtbares Verhalten in der laufenden Anwendung. Dokumentiere je Ticket Prüfschritte und Ergebnisse.
4. **Bugs und Rückgabe:** Nutze bestehende Bug-Tickets; erstelle für jeden neuen Bug ein GitHub-Ticket im AI Board mit Status `Todo`. Verknüpfe es mit Feature-Ticket und PR. Beschreibe betroffenes Akzeptanzkriterium, Reproduktionsschritte, erwartetes und tatsächliches Verhalten. Bei Bugs oder unerfüllten Kriterien: Feature-Ticket zurück auf `In Progress`, kein Merge.
5. **Alle Bug-Korrekturen prüfen:** Prüfe vor dem Merge sämtliche zugehörigen Bugs anhand ihrer Reproduktionsschritte im aktuellen Feature-Branch; wiederhole relevante Feature-Tests. Geschlossene Tickets allein sind kein Nachweis. Dokumentiere Ergebnisse je Bug-Ticket: erfolgreich geprüft → `Done` und schließen; weiterhin fehlerhaft → `In Progress`. Solange ein Bug offen oder seine Behebung nicht nachgewiesen ist, bleibt der Merge gesperrt.
6. **Mergen:** Nur wenn alle Akzeptanzkriterien erfüllt, relevante Tests erfolgreich und sämtliche Bugs nachweislich behoben sind: vorhandenen PR nach `main` nutzen oder erstellen. Prüfe, dass er den geprüften Commit enthält und erforderliche PR-Prüfungen erfolgreich sind. Prüfe zwischenzeitliche Änderungen erneut. Merge nach `main`, bestätige den Erfolg und setze erst dann das Feature-Ticket auf `Done`. Ist die Umsetzung bereits in `main`, entfallen weiterer PR und Merge.
7. **Aufräumen:** Lösche nach bestätigtem Merge jeden Arbeitsbranch remote und lokal; behalte `main`. Prüfe vorher, dass alle Änderungen übernommen wurden und der Branch keine zusätzlichen, ungemergten Änderungen enthält. Wechsle vor lokalem Löschen auf `main` und aktualisiere ihn. Lösche lokale Branches nur, wenn sie in keinem Worktree ausgecheckt sind. Bewahre ungesicherte Änderungen; dokumentiere Aufräumblocker im Ticket.
8. **Abschluss und Blocker:** Dokumentiere am Feature-Ticket geprüften Commit, Tests/Ergebnisse und verknüpfte Bugs; bei Erfolg auch PR, Merge-Commit und Branch-Aufräumen. Fehlen nur Zugriff, Prüfvoraussetzung oder Merge-Möglichkeit, belasse das Ticket in `Review` und benenne den konkreten Blocker. Kontrolliere die Board-Status und fasse Ergebnisse mit Ticket-Links zusammen.
