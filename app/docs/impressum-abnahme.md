# Impressum: Entwurf und Freigabe zu Ticket #103

Stand: 10. November 2026. [Ticket #103](https://github.com/MarvinJakob/aiboard/issues/103).

**Arbeitsentwurf, nicht zur Veröffentlichung freigegeben.** Die Laufzeitdateien
`frontend/src/content/legal/impressum.de.md` und `impressum.en.md` bleiben bis zur
Klärung der Pflichtangaben als Platzhalter erhalten. Das Ticket bleibt `In Progress`.

## Bestätigte Angaben

- Marvin Jakob betreibt „KI Perspektiven“ persönlich als natürliche Person.
- Kontaktadresse: `mail@marvinjakob.de`.
- Die cimt Objects AG ist nicht Diensteanbieter dieser Website.

Nachweis: Beschreibung von Ticket #103, abgerufen am 10. November 2026.

## Offene Freigaben

| Angabe | Status und erforderliche Klärung |
| --- | --- |
| Zustellanschrift | Offen. Die im Ticket vorgeschlagene Anschrift ist noch nicht freigegeben. Zustimmung des Unternehmens, Empfangsberechtigung und zuverlässige Weiterleitung rechtserheblicher Schreiben bestätigen. Den genauen Namen des Zustellungsbevollmächtigten bestätigen. |
| Zusätzlicher Kontaktweg | Offen. Veröffentlichbare Telefonnummer oder anderer geeigneter, schnell erreichbarer Kontaktweg fehlt. Ein neues Kontaktformular ist nicht beauftragt. |
| Redaktionelle Verantwortung | Offen. Das Angebot enthält ausgewählte Fachthemen, Einordnungen und einen Blog mit Veröffentlichungsablauf. Das spricht für eine journalistisch-redaktionelle Gestaltung; dies ist eine Einordnung anhand des Angebots, keine bestätigte Betreiberangabe. Anwendbarkeit und verantwortliche Person einschließlich der Voraussetzungen nach § 18 Abs. 2 MStV bestätigen. |
| Eigene Register- und Identifikationsangaben | Offen. Bestehen für den persönlichen Diensteanbieter relevante Registereinträge, eine USt-IdNr. oder Wirtschafts-Identifikationsnummer? Fehlende Angaben sind kein Nachweis der Nichtanwendbarkeit. |
| Erlaubnis und Berufsrecht | Offen. Bestätigen, ob erlaubnispflichtige oder reglementierte Leistungen angeboten werden. |
| Verbraucherschlichtung | Offen. Unternehmereigenschaft, Beschäftigtenzahl zum 31. Dezember 2025 sowie eine etwaige Teilnahmeverpflichtung oder Zusage klären. Keine Nichtteilnahmeerklärung ohne Bestätigung ergänzen. |
| Textfreigabe | Offen. Erst den vervollständigten deutschen und englischen Text durch den Betreiber freigeben lassen; Datum und Nachweis im Ticket festhalten. |

## Deutscher Textentwurf

Die eckigen Klammern sind ausschließlich Bearbeitungshinweise für diesen Entwurf.
Die vorgeschlagene Anschrift darf erst nach der oben genannten Bestätigung in die
Website übernommen werden. Weitere einschlägige Pflichtangaben nach Klärung ergänzen.

```markdown
## Diensteanbieter

Marvin Jakob betreibt die Website „KI Perspektiven“ als natürliche Person.

Marvin Jakob  
c/o [bestätigter Name des Zustellungsbevollmächtigten]  
Hanauer Landstraße 121  
60314 Frankfurt am Main  
Deutschland

## Kontakt

E-Mail: [mail@marvinjakob.de](mailto:mail@marvinjakob.de)

[Bestätigten zusätzlichen Kontaktweg mit funktionierendem Link ergänzen.]
```

Bei bestätigter Anwendbarkeit und freigegebener Person ergänzen:

```markdown
## Redaktionell verantwortlich gemäß § 18 Abs. 2 MStV

[Vollständiger Name und freigegebene Anschrift der verantwortlichen Person.]
```

## English draft

```markdown
## Service provider

Marvin Jakob operates the website “KI Perspektiven” as an individual.

Marvin Jakob  
c/o [confirmed name of the authorised recipient for service]  
Hanauer Landstraße 121  
60314 Frankfurt am Main  
Germany

## Contact

Email: [mail@marvinjakob.de](mailto:mail@marvinjakob.de)

[Add the confirmed additional means of contact with a working link.]
```

If applicable and confirmed, add:

```markdown
## Responsible for editorial content pursuant to section 18(2) MStV

[Full name and approved address of the person responsible.]
```

## Rechtsgrundlagen

Am 10. November 2026 abgerufen; jeweils den Angaben oben zugeordnet:

- [§ 5 DDG](https://www.gesetze-im-internet.de/ddg/__5.html): Name, Anschrift,
  elektronische Kontaktaufnahme sowie fallabhängige Register-, Identifikations-,
  Aufsichts- und Berufsangaben. Grundlage für die Prüfung des persönlichen Anbieters;
  Unternehmensangaben des Arbeitgebers werden nicht übernommen.
- [Medienanstalt Hessen: Impressumspflicht](https://www.medienanstalt-hessen.de/aufsicht/telemedien-digitale-dienste-internetaufsicht/impressumspflicht/):
  zusätzliche direkte Kontaktmöglichkeit und Anforderungen an die c/o-Zustellung.
  Die Empfangsberechtigung kann mit Unterschriften beider Seiten dokumentiert werden.
- [§ 18 Abs. 1 und 2 MStV, Seite 27](https://www.medienanstalt-hessen.de/fileadmin/dokumente/Rechtsgrundlagen/MStV.pdf#page=27):
  Anbieterangaben und redaktionelle Verantwortlichkeit; Grundlage für die oben als
  vorläufig gekennzeichnete Einordnung des Blogs und die Bestätigung der Person.
- [§ 36 VSBG](https://www.gesetze-im-internet.de/vsbg/__36.html):
  Die Informationspflichten hängen vom Betreiber und einer Teilnahmeverpflichtung ab.
  Die Ausnahme für höchstens zehn Beschäftigte zum Ende des Vorjahres betrifft
  Absatz 1 Nummer 1; sie beseitigt keine etwaige Pflicht nach Nummer 2.

## Technische Prüfung und verbleibende Abnahme

Vorprüfung am 10. November 2026 auf Basis von `origin/main` (`fb75138`), noch mit
den unveränderten Impressumsplatzhaltern:

| Prüfung | Ergebnis |
| --- | --- |
| `npm run typecheck` in `app/frontend` | Erfolgreich |
| `npm test` in `app/frontend` | 10 Testdateien, 182 Tests erfolgreich |
| `npm run build` in `app/frontend` | Erfolgreich; bestehender Hinweis zu JavaScript-Chunks über 500 kB |

- `Legal.tsx` lädt die Markdown-Dateien getrennt je Sprache; bestehende Routen:
  `/de/impressum` und `/en/impressum`.
- `Layout.tsx` enthält direkte Links aus dem gemeinsamen Footer zur aktuellen
  Sprachfassung. Native Links und der globale `:focus-visible`-Stil bilden die
  Grundlage der Tastaturbedienung. Eine Sichtprüfung auf Desktop und Mobilgerät
  mit dem endgültigen Text steht noch aus.
- Der Vorab-Zugangsschutz bleibt aktiv, soweit konfiguriert. Im öffentlichen Betrieb
  müssen die Seiten ohne Anmeldung erreichbar sein; `REQUIRE_LOGIN` wird in diesem
  Ticket nicht umgestellt.
- Nach Vervollständigung: beide Markdown-Dateien ersetzen, keine Platzhalter belassen,
  Mail- und weitere Kontaktlinks prüfen, deutsche und englische Angaben abgleichen,
  Frontend-Typecheck, Tests und Build ausführen und Sichtprüfung dokumentieren.
- Anschließend die README-Aussage zum Impressumsplatzhalter aktualisieren. Die
  Datenschutzerklärung bleibt außerhalb dieses Tickets.

Eine erfolgreiche technische Vorprüfung ersetzt weder die offenen Betreiberangaben
noch die Freigabe des vervollständigten Textes. Ohne diese Nachweise kein prüfbereiter
PR und keine Übergabe auf `Review`.
