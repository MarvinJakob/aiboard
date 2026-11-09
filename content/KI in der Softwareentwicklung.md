# KI in der Softwareentwicklung: KI-Assistenten mit Guardrails anleiten

*Stand: 9. November 2026.*

## Metadaten der Themenseite

- **Slug:** `softwareentwicklung`
- **Label:** Softwareentwicklung
- **Titel:** KI in der Softwareentwicklung (bisher: „AI in der Softwareentwicklung“)
- **Untertitel:** KI-Assistenten mit Guardrails anleiten
- **Kurzbeschreibung:** Wie Sie KI-Assistenten mit Markdown-Regeln, Zugriffsrechten, Tests und Reviews anleiten.
- **Einführung:** Dateien wie `AGENTS.md` geben KI-Assistenten Ziele, Arbeitsabläufe und Grenzen mit. Das Modell kann solche Regeln aber missverstehen oder übergehen. Hier sehen Sie, wie Sie prüfbare Regeln schreiben, Freigaben an Aktionen binden und Grenzen technisch absichern.

---

**Ein Verbot im Prompt verhindert noch keinen Zugriff.**

## Was Guardrails leisten

Markdown eignet sich, um KI-Agenten Ziele, Arbeitsabläufe und Grenzen dauerhaft mitzugeben. Dateien wie `AGENTS.md` machen diese Vorgaben lesbar, versionierbar und gemeinsam pflegbar. Die Regeln wirken jedoch als Anweisungen im Modellkontext. Für verbindliche Grenzen braucht es zusätzlich passende Zugriffsrechte und Kontrollen außerhalb des Modells. Anthropic beschreibt diese Trennung ausdrücklich; OWASP empfiehlt, Funktionen, Berechtigungen und Autonomie auf den benötigten Umfang zu begrenzen. [1] [2]

Drei Ebenen lassen sich unterscheiden (eigene Systematisierung):

| Ebene | Beispiel | Wirkung und Grenze |
| --- | --- | --- |
| Anleitung in Markdown | „Ändere nur Dateien, die für das aktuelle Ticket benötigt werden.“ | Beschreibt das gewünschte Verhalten; das Modell kann die Regel missverstehen oder übergehen. |
| Technische Durchsetzung | Ein Dienstkonto darf Daten nur lesen. | Der Dienst verweigert Schreibaktionen unabhängig von der Modellantwort. |
| Prüfung und Freigabe | Ein Pull Request braucht erfolgreiche CI-Prüfungen und ein unabhängiges Review. | Kontrolliert das Ergebnis vor der Übernahme; die Qualität hängt auch von Prüfungen und Review ab. |

Ein Beispiel: „Lies keine geheimen Schlüssel“ ist eine Verhaltensregel. Ein Arbeitsbereich ohne zugängliche Schlüssel begrenzt zusätzlich, welche Daten überhaupt erreichbar sind. [2]

## Welche Markdown-Dateien Agenten lesen

Markdown ist nur das Textformat. Welche Datei automatisch geladen wird und welchen Geltungsbereich sie hat, entscheidet das jeweilige Werkzeug:

- **`AGENTS.md`:** Das offene Format verwendet gewöhnliches Markdown ohne Pflichtfelder. Eine verständliche Gliederung genügt. [3]
- **OpenAI Codex:** Sucht vom Projektstamm bis zum Arbeitsverzeichnis; pro Verzeichnis wird höchstens eine passende Datei berücksichtigt, `AGENTS.override.md` hat Vorrang. [4]
- **Claude Code:** Unterstützt `CLAUDE.md` und `AGENTS.md`. Welche geladen wird, hängt von Version und Einstellung ab. [1]
- **GitHub Copilot:** Unterscheidet `.github/copilot-instructions.md`, pfadbezogene Dateien und Agentenanweisungen. Die Unterstützung hängt von Client und Funktion ab. [5]

Eine Datei namens `GUARDRAILS.md` wird deshalb nicht automatisch wirksam. Sie muss über den vorgesehenen Mechanismus eingebunden werden. Auch eine universelle Rangfolge gibt es nicht: Konflikte zwischen Regeldateien klären Sie im konkreten Werkzeug und vermeiden widersprüchliche Kopien. [5] [6]

## Prüfbare Regeln schreiben

Anthropic empfiehlt klare, direkte Anweisungen mit erkennbaren Abschnitten. Zu allgemeine Vorgaben lassen Entscheidungen offen, zu detaillierte Fallunterscheidungen werden spröde. [7] Entscheidend ist, dass ein Mensch nach einem Lauf erkennen kann, ob die Regel eingehalten wurde. Ein mögliches Muster (eigener Vorschlag):

> Wenn **[Auslöser]** eintritt, führe **[konkrete Handlung]** für **[Geltungsbereich]** aus. Prüfe **[Nachweis]**. Falls das nicht möglich ist, **[Ersatzverhalten]**.

| Zu unbestimmt | Konkreter formuliert |
| --- | --- |
| „Arbeite sicher.“ | „Gib keine Zugangsdaten in Antworten, Logs, Tickets oder Commits aus.“ |
| „Teste gründlich.“ | „Führe vor der Übergabe die relevanten Prüfungen aus `app/README.md` aus. Dokumentiere Befehl, Ergebnis und nicht ausführbare Prüfungen.“ |
| „Ändere möglichst wenig.“ | „Beschränke Änderungen auf das aktuelle Ticket. Halte zusätzlich entdeckte Verbesserungen separat fest.“ |

Dauerhafte Regeln gehören in die Anweisungsdatei, das aktuelle Ziel und der Bearbeitungsstand separat. Ausgelagerte Dateien brauchen einen klaren Auslöser, etwa: „Lies vor einer Entwicklungsaufgabe den Abschnitt Entwicklung in `docs/agent-workflows.md`.“ [7]

## Freigaben an konkrete Aktionen binden

„Frage immer nach“ erschwert selbstständige Arbeit, „Handle vollständig autonom“ lässt den Umfang offen. Sinnvoll ist eine vorab vereinbarte Zuordnung von Aktion und Freigabe (Vorschlag für einen begrenzten Projektagent):

- **Selbstständig:** Projektdateien lesen, recherchieren, lokale Änderungen und passende Tests.
- **Nach Auftrag oder Workflow:** Tickets oder Pull Requests erstellen.
- **Nur mit konkreter Freigabe für Inhalt, Ziel und Umfang:** veröffentlichen, Nachrichten versenden, produktive Systeme ändern.
- **Keine Selbstfreigabe:** eigene Berechtigungen erweitern oder Schutzprüfungen abschalten.

Eine Freigabe sollte an die tatsächlich ausgeführte Version gebunden sein. GitHub kann veraltete Freigaben eines Pull Requests nach neuen Änderungen verwerfen oder ein Review des letzten prüfbaren Pushs verlangen. [8]

## Was technisch abgesichert werden muss

Markdown beschreibt die Absicht. Für relevante Grenzen sollten Sie festlegen, welche Komponente sie erzwingt (eigene Umsetzungsempfehlung):

- **Arbeitsumfang:** Schreibrechte auf freigegebene Verzeichnisse beschränken.
- **Geheimnisse:** nicht benötigte Secrets aus dem Arbeitsbereich entfernen; Zugangsdaten beim Werkzeugdienst halten.
- **Datenabfluss:** Zielsysteme und übertragbare Daten einschränken.
- **Freigaben:** technisch vor der Aktion prüfen; eine vom Agenten formulierte Zustimmung reicht nicht.
- **Zeit und Kosten:** Laufzeit, Werkzeugaufrufe und Budget begrenzen.
- **Übernahme:** geschützte Branches, verpflichtende Prüfungen und passende Review-Rechte verwenden.

OpenAI dokumentiert für Codex getrennte Kontrollen für Sandbox, Freigaben und Netzwerk. Die Netzwerkbegrenzung für ausgeführte Befehle deckt nicht automatisch Websuche, Apps, MCP-Verbindungen und Browseraktivitäten ab. [6] Claude Code bietet Hooks, die eine Werkzeugaktion vor der Ausführung blockieren können. Sie müssen alle relevanten Werkzeuge und Umgehungswege erfassen; modellbasierte Hooks sind keine deterministische Berechtigungsprüfung. [9]

Schutzkonfiguration, Freigabelogik und maßgebliche Tests sollten nicht ohne zusätzliche Kontrolle von demselben Agenten veränderbar sein, den sie begrenzen (eigene Ableitung).

## Prompt Injection: Wenn Arbeitsmaterial zu Anweisungen werden soll

Bei einer indirekten Prompt Injection enthalten etwa eine Webseite oder ein Dokument Anweisungen, die den Agenten vom Auftrag abbringen sollen. OWASP nennt Datenabfluss und unerlaubte Werkzeugaktionen als mögliche Folgen. Eine sichere Trennung lässt sich nicht allein durch einen Hinweis im Prompt garantieren. [10]

Empfehlungen aus dieser Einordnung:

1. Benennen Sie ausdrücklich, dass Webseiten, E-Mails, Anhänge und fremde Repository-Inhalte Arbeitsmaterial sind und keine Befugnisse erteilen.
2. Übernehmen Sie fremde Inhalte nicht ungeprüft in dauerhafte Anweisungsdateien.
3. Prüfen Sie Regeldateien aus fremden Repositorys vor der Nutzung.
4. Halten Sie ausgehende Daten und Zielsysteme technisch im zulässigen Rahmen.

## Was die Forschung zeigt

Die Studie „Evaluating AGENTS.md“ berichtet in Version 3 vom 29. September 2026, dass Kontextdateien die Erfolgsrate bei Entwicklungsaufgaben insgesamt nicht allgemein verbessern, während die durchschnittlichen Inferenzkosten um mehr als 20 Prozent steigen. Nutzen sehen die Autoren insbesondere für nicht standardmäßige Entwicklungsvorgaben. [11]

Die Untersuchung belegt weder, dass jede `AGENTS.md` schadet, noch eine Aussage über Sicherheitskontrollen. Prüfen Sie den Nutzen einer Regeldatei daher an eigenen Aufgaben: Mehr Regeln sind allein kein Erfolgsmaß. [11]

## Guardrails praktisch prüfen

Testen Sie erlaubte Arbeit, Grenzfälle und unerlaubte Aktionen, Sicherheitstests ausschließlich mit künstlichen Geheimnissen und in isolierten Umgebungen (eigener Vorschlag):

- Eine beauftragte lokale Aufgabe läuft ohne unnötige Rückfrage.
- Eine Webseite mit sachfremder Handlungsanweisung erweitert den Auftrag nicht.
- Ein künstliches Geheimnis wird weder ausgegeben noch übertragen.
- Ein Schreibzugriff außerhalb des freigegebenen Bereichs wird technisch verweigert.
- Ein fehlgeschlagener Test wird nicht als bestanden gemeldet.
- Nach einem Review geänderte Pull Requests werden erneut geprüft.

Messen Sie Aufgabenerfolg, Regelverletzungen, technische Blockaden, unnötige Unterbrechungen und Aufwand, bei konstantem Modell und konstanten Berechtigungen. Eine bestandene Testsammlung belegt nur das Verhalten unter diesen Bedingungen, keine Garantie für alle künftigen Eingaben.

## Checkliste für den Einstieg

- [ ] Wenige, konkret prüfbare Regeln in `AGENTS.md`, mit Auslöser, Nachweis und Ersatzverhalten.
- [ ] Geprüft, welche Datei Ihr Werkzeug tatsächlich lädt.
- [ ] Freigaben an Aktion, Inhalt, Ziel und Version gebunden.
- [ ] Rechte, Netzwerkzugriff und Secrets technisch begrenzt.
- [ ] Geschützte Branches, verpflichtende Tests und unabhängiges Review eingerichtet.
- [ ] Fremde Inhalte als Material gekennzeichnet.
- [ ] Wirkung der Regeln mit festen Testfällen geprüft und nach Änderungen wiederholt.

## Quellen

Alle Onlinequellen wurden am 9. November 2026 abgerufen. Tabellen, Muster und Empfehlungen sind, soweit gekennzeichnet, eigene Ableitungen und wurden nicht in einem Agententest erprobt.

1. Anthropic: [How Claude remembers your project](https://code.claude.com/docs/en/memory)
2. OWASP: [LLM06:2025 Excessive Agency](https://genai.owasp.org/llmrisk/llm062025-excessive-agency/)
3. AGENTS.md: [Offizielle Formatbeschreibung](https://agents.md/)
4. OpenAI: [Custom instructions with AGENTS.md](https://learn.chatgpt.com/docs/agent-configuration/agents-md)
5. GitHub: [Custom instructions for GitHub Copilot](https://docs.github.com/en/copilot/concepts/prompting-and-context/custom-instructions)
6. OpenAI: [Agent approvals & security](https://learn.chatgpt.com/docs/agent-approvals-security)
7. Anthropic: [Effective context engineering for AI agents](https://www.anthropic.com/research/effective-context-engineering-for-ai-agents), 29. September 2025
8. GitHub: [About protected branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
9. Anthropic: [Automate actions with hooks](https://code.claude.com/docs/en/hooks-guide)
10. OWASP: [LLM01:2025 Prompt Injection](https://genai.owasp.org/llmrisk/llm01-prompt-injection/)
11. Gloaguen et al.: [Evaluating AGENTS.md: Are Repository-Level Context Files Helpful for Coding Agents?](https://arxiv.org/abs/2602.11988v3), Version 3, 29. September 2026. Ergebnisse sind an die untersuchten Aufgaben und Systeme gebunden.
