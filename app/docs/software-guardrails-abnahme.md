# Themenseite Softwareentwicklung – Prüfung zu Ticket #80

Stand: 9. November 2026. Prüfstand: Feature-Branch `codex/80-software-guardrails`.

## Inhalt und Verhalten

- Die deutsche Veröffentlichungskopie unter `frontend/src/content/topics/softwareentwicklung.de.md` stimmt vollständig mit `content/KI in der Softwareentwicklung.md` im Repository-Stamm überein. Der automatisierte Vergleich schützt auch Aussagen, Zahlen und Quellen.
- Titel, Label, Kurzbeschreibung und Einführung der deutschen API stimmen mit den Metadaten der Vorlage überein. Slug, URL und bestehende Beitragszuordnungen bleiben erhalten. Die englische API liefert englische Metadaten.
- Der Untertitel ist in beiden Sprachen vorhanden. Der englische Aufruf zeigt den deutschen Haupttext mit `lang="de"` und dem vorhandenen englischen Übersetzungshinweis.
- Der Aufhänger ist hervorgehoben. Alle zehn nachfolgenden Abschnitte, beide Tabellen und sieben beschriftete Checklistenfelder werden dargestellt.
- Alle elf Quellen sind externe Links. Sämtliche nummerierten Belege führen zur passenden Quelle. Alle elf Quellenziele wurden mit Enter angesprungen; der Fokus wechselt auf den jeweiligen Listeneintrag, die Seitenadresse bleibt erhalten.
- Die gebaute Anwendung mit Entwicklungsdaten zeigt weiterhin die drei zugeordneten veröffentlichten Beiträge.

## Automatisierte Prüfungen

| Bereich | Prüfung | Ergebnis |
| --- | --- | --- |
| Backend | `go vet ./...` und `go test ./...` | Erfolgreich, einschließlich API-Metadaten und Migration Up/Down/erneutes Up mit bestehenden Beitragszuordnungen |
| Öffentliches Frontend | `npm run typecheck`, `npm test`, `npm run build` | Erfolgreich, 147 Tests |
| Redaktion | `npm run typecheck`, `npm test`, `npm run build` | Erfolgreich, 70 Tests |
| Git | `git diff --check` | Erfolgreich |

Die Windows-Sandbox kann temporäre Vite-Module und SQLite-Testdatenbanken nicht zuverlässig öffnen. Die erfolgreichen vollständigen Läufe erfolgten außerhalb der Sandbox. Der Frontend-Build weist auf das JavaScript-Bundle über 500 kB hin; der Build ist erfolgreich.

## Browserprüfung

Die gebaute Anwendung wurde lokal mit Entwicklungsdaten in Microsoft Edge (Chromium), Playwright und Axe geprüft. Für jede Kombination wurden Bildschirmaufnahmen des Kopfbereichs und des Inhalts kontrolliert.

| Breite | Darstellung | Seitenüberlauf | Axe WCAG 2 A/AA und 2.1 AA im Hauptinhalt | JavaScript-Fehler |
| --- | --- | --- | --- | --- |
| 375 px | Hell | keiner | keine gemeldeten Verstöße | keine |
| 375 px | Dunkel | keiner | keine gemeldeten Verstöße | keine |
| 768 px | Hell | keiner | keine gemeldeten Verstöße | keine |
| 768 px | Dunkel | keiner | keine gemeldeten Verstöße | keine |
| 1280 px | Hell | keiner | keine gemeldeten Verstöße | keine |
| 1280 px | Dunkel | keiner | keine gemeldeten Verstöße | keine |

Die Tabellen scrollen bei 375 px innerhalb ihres eigenen Bereichs. Der Bereich ist per Tab erreichbar und beschriftet. Überschriften, Text und Quellen bleiben innerhalb der Seitenbreite. Die Prüfung ersetzt keinen vollständigen Screenreader-Test.

Zum manuellen Wiederholen `/de/themen/softwareentwicklung` in den drei Breiten und beiden Darstellungen öffnen, Tabellen per Tastatur scrollen, die Belege mit Tab und Enter anspringen und die Beitragslinks unterhalb des Textes prüfen. Unter `/en/themen/softwareentwicklung` englische Metadaten, deutschen Haupttext und Übersetzungshinweis kontrollieren.

## Abstimmung mit Ticket #77

Der parallel offene Pull Request #84 nutzt Migration `00005` und ändert ebenfalls die Themenseiten. Dieses Ticket verwendet deshalb `00006`. Beim Review #84 zuerst mergen und anschließend `main` in diesen Branch übernehmen, Konflikte auflösen und die betroffenen Prüfungen wiederholen. So wird keine niedrigere Migration nach einer bereits ausgerollten höheren Version eingeführt.
