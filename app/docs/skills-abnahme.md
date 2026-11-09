# Themenseite KI-Tipps und Tricks – Ticket #82

Stand: 9. November 2026. Branch: `codex/82-skills`.

## Inhalt und Aufbau

Verbindliche Vorlage: [content/KI Tipps und Tricks.md](../../content/KI%20Tipps%20und%20Tricks.md). Die Veröffentlichungskopie unter `frontend/src/content/topics/ki-tipps-und-tricks.de.md` wird automatisiert auf vollständige Übereinstimmung geprüft. Deutsche API-Metadaten werden gegen die Metadaten der Vorlage geprüft. Die englischen Metadaten sind übersetzt; der deutsche Seiteninhalt trägt `lang="de"` und den vorhandenen englischen Übersetzungshinweis.

Der Aufhänger ist hervorgehoben. Die sieben folgenden Abschnitte erscheinen in der Reihenfolge der Vorlage. Alle 22 Quellen sind anklickbar. Quellenbereiche wie `[8–11]` werden zur Bedienung in einzelne Verweise `[8] [9] [10] [11]` aufgelöst. Aussagen, Zahlen und Kennzeichnungen von Herstellerangaben bleiben erhalten. Quellenverweise versetzen Scrollposition und Tastaturfokus zum passenden Listeneintrag, ohne die Seitenadresse zu ändern.

Der Markdown-Mechanismus übernimmt die gemeinsamen Dateien aus dem parallel offenen Ticket #80, ergänzt um Quellenbereiche. Themen ohne Markdown und die Audit-Übersicht behalten ihren Aufbau. `remark-gfm` ermöglicht Tabellen; der beschriftete Tabellenbereich ist per Tab erreichbar und bei schmalen Ansichten horizontal scrollbar.

Themenmenü und Footer verwenden die API und erhalten das neue Thema automatisch. Die drei Kreise im Startseiten-Hero stellen die ursprünglichen drei Perspektiven dar; die drei Profilkarten stehen für konkrete fachliche Erfahrungen. Beide sind keine vollständigen Themenlisten und erhalten daher keine zusätzliche Karte. Das neue Thema ist auch vom Profil über das Themenmenü erreichbar und dafür in beiden Sprachen getestet. Die Startseitenkarte nutzt vorerst die bestehende allgemeine Kartendarstellung; ihre redaktionelle Überarbeitung gehört zu #78.

## Automatisierte Prüfungen

- Öffentliches Frontend: `npm run typecheck`, `npm test`, `npm run build`.
- Backend: `go vet ./...`, `go test ./...`.
- Redaktion: `npm run typecheck`, `npm test`, `npm run build`.
- Git: `git diff --check`.

Die neuen Tests decken Vorlage, Abschnittsreihenfolge, Zahlen, Tabelle, Quellenziele, Tastaturfokus, Übersetzungshinweis, eigene Themenpalette, Beitragszuordnung, API, HTTP 200, Sitemap und Migration Up/Down/erneutes Up ab. Der Migrationstest bewahrt die Beitragszuordnung eines vorhandenen Themas und verlangt keine feste ID für das neue Thema.

Ergebnisse: Backend-Vet und alle Go-Tests erfolgreich; öffentliches Frontend mit 150 erfolgreichen Tests, Redaktion mit 70 erfolgreichen Tests; beide Typprüfungen und Builds erfolgreich. `git diff --check` erfolgreich. Der Frontend-Build meldet das bestehende Bundle-Limit über 500 kB, der Redaktions-Build einen Hinweis zum unveränderten `theme.js`-Skript.

Die erfolgreichen Testläufe liefen außerhalb der Windows-Sandbox: Im ersten Frontend-Lauf waren temporäre Vite-Dateien nicht lesbar. Ein bestehender Redaktionstest überschritt bei paralleler Ausführung fünf Sekunden; der vollständige Wiederholungslauf mit `npm test -- --maxWorkers=1 --testTimeout=15000` bestand. Die Testkonfiguration im Repository wurde nicht verändert.

## Browserprüfung

Die gebaute Anwendung wurde lokal mit Entwicklungsdaten in Microsoft Edge, Playwright und Axe geprüft. Bildschirmaufnahmen des Kopfbereichs und des Inhalts wurden visuell geprüft.

| Breite | Darstellung | Seitenüberlauf | Axe im Hauptinhalt (WCAG 2 A/AA, 2.1 AA) | JavaScript-Fehler |
| --- | --- | --- | --- | --- |
| 375 px | Hell | keiner | keine gemeldeten Verstöße | keine |
| 375 px | Dunkel | keiner | keine gemeldeten Verstöße | keine |
| 768 px | Hell | keiner | keine gemeldeten Verstöße | keine |
| 768 px | Dunkel | keiner | keine gemeldeten Verstöße | keine |
| 1280 px | Hell | keiner | keine gemeldeten Verstöße | keine |
| 1280 px | Dunkel | keiner | keine gemeldeten Verstöße | keine |

Bei 375 px misst die Tabelle 560 px und scrollt innerhalb ihres 341 px breiten Bereichs. Alle 22 Quellen wurden im Browser mit Enter angesprungen; der Fokus wechselte jedes Mal zum passenden Listeneintrag. Der englische Aufruf zeigt englische Metadaten, den deutschen Inhalt und den Übersetzungshinweis. Das neue Thema ist ohne zugeordnete Beiträge erreichbar; veröffentlichte Beiträge und das Ausblenden von Entwürfen sind zusätzlich mit echten Datenbankzuordnungen im HTTP-Test nachgewiesen. Die Prüfung ersetzt keinen vollständigen Screenreader-Test.

Zum Wiederholen `/de/themen/ki-tipps-und-tricks` in den drei Breiten und beiden Darstellungen öffnen, Tabelle per Tastatur scrollen, Quellenverweise mit Enter anspringen und unter `/en/themen/ki-tipps-und-tricks` Sprachkennzeichnung und Übersetzungshinweis kontrollieren.

## Merge-Reihenfolge

Die parallelen Tickets #77, #80 und #81 verwenden Migrationen `00005`, `00006` und `00007`. Dieses Ticket verwendet `00008`. Vor dem Merge von #82 müssen diese niedrigeren Migrationen in `main` liegen. Danach `main` in den Feature-Branch übernehmen, gemeinsame Renderer-Änderungen zusammenführen, alle Themen im Backend-Test berücksichtigen und die betroffenen Prüfungen wiederholen. Eine niedrigere Migration darf nicht erst nach der Auslieferung von `00008` eingeführt werden. Die getrennten Feature-Tickets bleiben unabhängig im Review.
