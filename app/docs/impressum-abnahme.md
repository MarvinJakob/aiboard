# Impressum: Freigabe und Abnahme zu Ticket #103

Stand: 10. November 2026. [Ticket #103](https://github.com/MarvinJakob/aiboard/issues/103).

## Betreiberfreigabe

Marvin Jakob hat am 10. November 2026 im zugehörigen Chat die Verwendung seiner
Privatanschrift im Impressum ausdrücklich beauftragt und folgende Angaben geliefert:

- Persönlicher Diensteanbieter: Marvin Jakob.
- Anschrift: Danzigerstr. 2, 65527 Niedernhausen, Deutschland.
- Telefon: +49 175 1964719.
- E-Mail: mail@marvinjakob.de.
- Für journalistisch-redaktionelle Inhalte verantwortlich: Marvin Jakob unter
  derselben Anschrift.

Diese Angaben ersetzen den früheren Entwurf mit einer c/o-Anschrift. Eine
Empfangsberechtigung von cimt ist damit nicht mehr erforderlich; Angaben des
Arbeitgebers werden im Impressum nicht veröffentlicht.

Auf die Nachfrage zu eigenen Register-/USt-/Wirtschafts-ID-Angaben,
erlaubnispflichtigen oder reglementierten Leistungen sowie Verbraucherschlichtung
antwortete der Betreiber: „eine pflicht besteht nicht.“ Auf Grundlage dieser
Betreiberauskunft sind keine zusätzlichen Pflichtangaben oder pauschalen
Schlichtungserklärungen aufgenommen. Es wird damit keine konkrete Register- oder
steuerliche Nummer und keine bestimmte Beschäftigtenzahl behauptet.

Die Beauftragung mit den vollständig gelieferten Daten gilt als Freigabe ihrer
Verwendung. Die englische Fassung übersetzt die deutschen Bezeichnungen; Namen,
Straße, Ort und Kontaktdaten sind identisch. Für spätere Änderungen der Angaben
müssen beide Markdown-Dateien gemeinsam aktualisiert werden.

## Rechtliche Einordnung und Quellen

Geprüft am 10. November 2026; die Prüfung des Angebots wird mit den bestätigten
Betreiberangaben verbunden:

- [§ 5 DDG](https://www.gesetze-im-internet.de/ddg/__5.html): Grundlage für
  Anbietername, Anschrift und direkte elektronische Kontaktaufnahme sowie die
  Prüfung fallabhängiger Register-, Identifikations-, Aufsichts- und Berufsangaben.
  Das Impressum enthält die freigegebenen Kontaktangaben der natürlichen Person.
- [Medienanstalt Hessen: Impressumspflicht](https://www.medienanstalt-hessen.de/aufsicht/telemedien-digitale-dienste-internetaufsicht/impressumspflicht/):
  Name, ladungsfähige Anschrift sowie E-Mail und eine weitere unmittelbare
  Kontaktmöglichkeit. Die Privatanschrift ersetzt die zuvor ungeklärte c/o-Lösung;
  die bestätigte Telefonnummer ergänzt die E-Mail-Adresse.
- [§ 18 Abs. 1 und 2 MStV, Seite 27](https://www.medienanstalt-hessen.de/fileadmin/dokumente/Rechtsgrundlagen/MStV.pdf#page=27):
  Das Angebot enthält ausgewählte Fachthemen, Einordnungen und einen redaktionell
  betreuten Blog. Dies wird als journalistisch-redaktionelles Angebot eingeordnet.
  Der Betreiber hat Marvin Jakob ausdrücklich als verantwortliche Person mit
  Anschrift benannt; diese Rolle wird zusätzlich zur Diensteanbieterrolle angegeben.
- [§ 36 VSBG](https://www.gesetze-im-internet.de/vsbg/__36.html): mögliche
  Informationspflichten zur Verbraucherschlichtung. Der Betreiber verneint eine
  zusätzliche Pflicht; es wird keine ungefragte Teilnahme- oder
  Nichtteilnahmeerklärung ergänzt. Die Ausnahme bei höchstens zehn Beschäftigten
  betrifft ausschließlich Absatz 1 Nummer 1 und wird hier nicht als Tatsache über
  den Betreiber vorausgesetzt.

## Technische Umsetzung und Prüfung

Die Laufzeitdateien sind `frontend/src/content/legal/impressum.de.md` und
`impressum.en.md`. `Legal.tsx` rendert sie unter `/de/impressum` und `/en/impressum`.
Der gemeinsame Footer verlinkt direkt zur Sprachfassung der aktuellen Seite.
Telefon und E-Mail verwenden `tel:+491751964719` und `mailto:mail@marvinjakob.de`.
Adresszeilen verwenden explizite Markdown-Zeilenumbrüche (Backslash) statt HTML,
da der Renderer HTML aus Sicherheitsgründen nicht übernimmt. Eine eng begrenzte
URL-Erweiterung in `Legal.tsx` erlaubt Telefonlinks mit Ziffern und üblichen
Trennzeichen; alle anderen URLs durchlaufen weiter `defaultUrlTransform`.

Prüfung am 10. November 2026 mit den freigegebenen Texten:

| Prüfung | Ergebnis |
| --- | --- |
| Frontend `npm run typecheck` | Erfolgreich |
| Frontend `npm test` | 11 Testdateien, 188 Tests erfolgreich |
| Frontend `npm run build` | Erfolgreich; bestehender Hinweis zu Chunks über 500 kB |
| Backend `go test ./internal/http -run 'Test(StatusCodesAndFiles\|Gate\|NoGateByDefault)' -count=1` | Erfolgreich; öffentliche Routen und konfigurierbarer Zugangsschutz |
| Browser, DE und EN | Direkte Impressumsrouten erreichbar; freigegebene Angaben sichtbar, Telefon- und E-Mail-Ziele korrekt |
| Desktop und 320 px Breite | Lesbar, kein horizontaler Überlauf im Impressum; Footer-Link in beiden Sprachen mit Tab erreichbar und mit Enter aktiviert, Fokus anschließend auf der Seitenüberschrift |

Der Regressionstest `frontend/src/pages/Legal.test.tsx` prüft beide Sprachfassungen,
die echte Tastaturaktivierung des Footer-Links, den Seitenfokus, die Adressblöcke,
Kontaktziele und das Entfernen der Platzhalter. Der zuvor standardmäßig entfernte
`tel:`-Link ist damit abgedeckt. Die frühere Vorprüfung mit Platzhaltern ist im
Ticket ausdrücklich als solche dokumentiert.

Der bestehende Vorab-Zugangsschutz bleibt unverändert. Im öffentlichen Betrieb
(`REQUIRE_LOGIN=false`) gelten die bestehenden öffentlichen Routen. Das Ticket
schaltet die Website nicht frei und ändert die Datenschutzerklärung nicht.
