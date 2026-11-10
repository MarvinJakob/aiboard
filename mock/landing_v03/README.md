# Landingpage v0.3 · cimt-Mock

`index.html` direkt im Browser öffnen. Kein Build, Backend oder Paket erforderlich. Die vorhandene Repository-Struktur beibehalten: Der Mock verwendet die gemeinsamen Design-Tokens und Navigationsstile aus `../design_cimt/styles.css` sowie das lokale Profilbild.

## Grundlagen

- Inhalt: `content/Landingpage_v03.md` im lokalen Arbeitsverzeichnis, Stand 10. November 2026. Der vom Nutzer genannte Name `Landingpage_v0.3.md` entspricht dieser Datei.
- Design: [DESIGN_CIMT.md](../../DESIGN_CIMT.md) und [cimt-Designentwurf](../design_cimt/index.html). Orange `#dc6e14`, Dunkelblau, warme helle Flächen, Systemschrift und dauerhaft aktive Glasnavigation mit den bestehenden Barrierefreiheits-Fallbacks.
- Bild und persönliche Angaben: vorhandener [Profilentwurf](../profil/index.html) und `ressources/profil/MarvinJakob2.jpg`.

Hero und drei Themen übernehmen den vollständigen Vorlagentext. In den drei Textspalten stehen Leitfrage, sämtliche Absätze und Artikel-Verweis wortgetreu und direkt sichtbar auf der Seite; auch Zeichensetzung und Hervorhebungen bleiben erhalten. Zusätzliche Kurzzeilen in diesen Textspalten entfallen. Die Artikel-Verweise öffnen die vorhandenen Markdown-Artikel unter `content/`. Illustrationen, Spaltenaufbau, Farben, Typografie und Styles bleiben unverändert.

„News“ verlinkt entsprechend der Nutzervorgabe auf den bestehenden [Blog-Mock](../design/index.html#/blog). Der KI-Check führt zur bestehenden interaktiven Demo im cimt-Designentwurf. „Über mich“ führt zum Profil. Die laufende Anwendung wird nicht verändert.

## Bedienung

- Themenindex und Buttons springen zu den entsprechenden Abschnitten.
- Die vollständigen Thementexte sind ohne Aufklappen lesbar. Artikel-Verweise öffnen die zugehörigen lokalen Markdown-Dateien.
- Hell/Dunkel bleibt nur im Arbeitsspeicher erhalten.
- Das mobile Menü schließt bei Linkwahl, Klick außerhalb, Fokuswechsel aus dem Header und Escape. Escape gibt den Fokus an den Menübutton zurück.
- Keine externen Schriftarten, Bilder, Netzwerkaufrufe oder Speicherung von Nutzereingaben im neuen Mock.

## Prüfung

Die Anwendungstests aus `app/README.md` betreffen Frontend und Backend unter `app/`. Hier werden ausschließlich statische Mock-Dateien und die Ablageübersicht geändert. Relevant sind deshalb JavaScript-Syntax, Vollständigkeit der Texte, lokale Linkziele und Browserprüfungen von Layout und Bedienung.

Prüfstand und Ergebnisse werden im zugehörigen [Ticket #99](https://github.com/MarvinJakob/aiboard/issues/99) dokumentiert.
