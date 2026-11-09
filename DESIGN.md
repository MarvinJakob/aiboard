# Design-Konzept: KI-Webseite im Liquid-Glass-Stil

> **Stand:** 2026-11-05 · **Arbeitstitel:** „KI Perspektiven“ (Platzhalter für Name und Logo) · **Mock:** [mock/design/index.html](mock/design/index.html)

Dieses Dokument beschreibt Gestaltung und Bedienlogik der neuen KI-Webseite. Es überträgt die acht Design-Prinzipien aus Apples Human Interface Guidelines (HIG) auf eine Webseite und legt fest, wie das Liquid-Glass-Layout im Browser umgesetzt wird. Fachliche Grundlage sind die Anforderungen 1 bis 7 im Ordner [requirements](requirements).

---

## 1 Leitidee

**Inhalte zuerst – die Bedienung schwebt darüber.**

- Die Seite besteht aus zwei klar getrennten Ebenen: **Inhalt** (Beiträge, Themen, Bilder) und **Funktion** (Navigation, Sprachwahl, Konto, Steuerelemente). Nur die Funktionsebene besteht aus Liquid Glass. Inhalte scrollen darunter hindurch und bleiben sichtbar. [Q2]
- **Angestrebtes Gefühl:** ruhig, klar, zuversichtlich. Besucherinnen und Besucher sollen KI als verständliches Werkzeug erleben, nicht als Hype. Die HIG empfehlen, das gewünschte Gefühl bewusst festzulegen und die Gestaltung daran auszurichten. [Q1]
- **Zielgruppen:** Fach- und Führungskräfte, Entwicklungsteams und die interessierte Öffentlichkeit. Die Redaktion ist eine interne Zielgruppe (Anforderungen 5 und 6).

---

## 2 Die HIG-Prinzipien auf die Webseite übertragen

Die HIG nennen acht Prinzipien. Sie verstehen sich als Werkzeuge zum Abwägen, nicht als starre Regeln. [Q1]

| Prinzip | Kernaussage (sinngemäß) [Q1] | Konsequenz für die Webseite |
|---|---|---|
| **Purpose** | Etwas Bedeutsames schaffen und sich auf das Wichtigste konzentrieren. | Die Startseite zeigt genau zwei Dinge: aktuelle Beiträge und die drei Themen (Anf. 1). Keine Werbeflächen, keine Newsletter-Popups. |
| **Agency** | Menschen ihren eigenen Weg lassen, sie informiert halten und Fehler leicht korrigierbar machen. | Kein Autoplay im Karussell. Wischen, Positionspunkte und Pfeile sind gleichwertig. Menüs schließen per Klick daneben oder mit `Esc`. Jede Ansicht hat eine echte URL, daher funktioniert die Zurück-Taste des Browsers immer. |
| **Responsibility** | Im Interesse der Menschen handeln, transparent sein und Daten schützen. | Keine Tracking-Cookies ohne Einwilligung. Ein Datenschutzhinweis in Klartext steht im Footer. Der Kontoeinstieg ist klar als „Anmeldung für die Redaktion“ benannt (Anf. 6). Entwürfe sind nie öffentlich (Anf. 4). |
| **Familiarity** | Auf Bekanntem aufbauen, konsistent bleiben und klares Feedback geben. | Klassische Kopfzeile: Logo links, Navigation in der Mitte, Sprache und Konto rechts. Karten, Brotkrumen und Zurück-Link. Jeder Zustand (Hover, gedrückt, aktiv, deaktiviert) ist sichtbar. |
| **Flexibility** | Für alle gestalten, den Kontext bewahren und viele Eingabearten unterstützen. | Responsiv ab 320 px Breite. Hell- und Dunkelmodus folgen dem System. Die Seite reagiert auf die Systemeinstellungen für reduzierte Transparenz, reduzierte Bewegung und erhöhten Kontrast. Bedienbar mit Maus, Touch, Tastatur und Screenreader. |
| **Simplicity** | Klar und direkt sein, nur das Nötige zeigen und eine Hierarchie schaffen. | Nur zwei Navigationspunkte (Themen, Blog). Höchstens ein Primärbutton pro Ansicht. Kurze Beschriftungen und eine klare typografische Hierarchie. |
| **Craft** | Auf jedes Detail achten, früh prototypen und die Qualität dauerhaft pflegen. | Konzentrische Radien, 4/8-px-Raster und abgestimmte Übergänge. Design-Tokens als einzige Quelle für Farben und Maße. Der Mock dient zum frühen Testen. |
| **Delight** | Menschlich gestalten, prägende Momente schaffen und Freude nicht mit Dekoration verwechseln. | Ein Lichtreflex auf dem Glas folgt dem Mauszeiger. Das Themenmenü „wächst“ aus seinem Button. Der Sprachschalter gleitet federnd. Jeder Effekt hat eine Funktion und lässt sich über Systemeinstellungen abschalten. |

---

## 3 Ebenenmodell (Liquid Glass)

```
Ebene 3  Overlays      Themenmenü, Anmeldedialog                 Liquid Glass, regular (dichter getönt)
Ebene 2  Funktion      Kopfzeile, Sprachwahl, Konto,              Liquid Glass, regular
                       Pfeile der Themenkarten
                       Steuerung des Beitrags-Karussells          Liquid Glass, clear (über Bildern)
Ebene 1  Inhalt        Karten, Beitragslisten, Artikel, Formulare opake Flächen
Ebene 0  Hintergrund   ruhiger, langsam wandernder Farbverlauf    –
```

### Regeln

1. **Glas nur für Funktion, nie für Inhalt.** Karten, Beitragslisten und Artikel nutzen opake Flächen. Glas im Inhalt verwischt die Hierarchie. [Q2]
2. **Sparsam einsetzen.** Pro Ansicht gibt es die Kopfzeile und höchstens zwei weitere Glaselemente. Glas soll den Blick auf den Inhalt lenken, nicht von ihm ablenken. [Q2]
3. **Regular ist der Standard.** Die Variante weichzeichnet den Hintergrund und gleicht die Helligkeit an. Sie eignet sich für Kopfzeile, Menü und Dialog, also für Elemente mit viel Text. [Q2]
4. **Clear nur über bildstarken Flächen.** Auf der Webseite betrifft das nur die Steuerung im Beitrags-Karussell. Liegt Clear-Glas über hellem Bildmaterial, kommt eine dunkle Abdunklung mit etwa 35 % Deckkraft darunter. [Q2]
5. **Kein Glas auf Glas.** Ein Element mit `backdrop-filter` bildet eine *Backdrop Root*. Verschachteltes Glas sieht dann nur noch den Inhalt seines Elternelements und wirkt falsch. Deshalb liegt das Glas der Kopfzeile auf einer eigenen Hintergrundschicht und das Themenmenü daneben (siehe Abschnitt 5). [Q7]
6. **Scroll-Kanten-Effekt.** Unter der Kopfzeile blendet ein weicher Farbverlauf den Inhalt beim Scrollen ab, damit die Kopfzeile lesbar bleibt. Die Scroll-Kante verwendet keinen Blur-Filter über dem Text (Ticket [#72](https://github.com/MarvinJakob/aiboard/issues/72)). Die Glasflächen der Bedienelemente behalten ihren Backdrop-Blur. Dies passt den aus [Q2] abgeleiteten Effekt zugunsten scharfer Schrift an.
7. **Systemeinstellungen haben Vorrang.** Bei reduzierter Transparenz oder erhöhtem Kontrast wird Glas zu einer opaken Fläche. [Q2] [Q4] [Q5]

### Inventar

| Element | Ebene | Material |
|---|---|---|
| Kopfzeile (Kapsel) | Funktion | Glas regular |
| Themenmenü (Popover) | Overlay | Glas regular, dichter getönt |
| Anmeldedialog | Overlay | Glas regular, dichter getönt, mit Abdunklung dahinter |
| Pfeile der Themenkarten | Funktion | Glas regular, rund |
| Steuerung des Karussells (Punkte, Pfeile) | Funktion | Glas clear mit Abdunklung |
| Themenkarten, Beitragszeilen, Artikel, Footer | Inhalt | opak (`--surface`) |

---

## 4 Design-Tokens

Alle Werte stehen als CSS-Variablen in `:root` und werden im Dunkelmodus überschrieben. Der Mock enthält die vollständige Liste.

### Farben

| Token | Hell | Dunkel | Verwendung |
|---|---|---|---|
| `--bg` | `#EEF1F6` | `#0A0C11` | Seitenhintergrund |
| `--surface` | `#FFFFFF` | `#151922` | Karten, Listen, Artikel |
| `--text` | `#0D1320` | `#F1F3F7` | Haupttext |
| `--text-2` | `#4A5466` | `#AAB2C0` | Sekundärtext |
| `--accent` | `#0A5FD6` | `#5EA3FF` | Links, Primärbutton, Fokus |
| `--border` | `rgba(13,19,32,.08)` | `rgba(255,255,255,.08)` | Kartenränder |
| `--fill` | `rgba(13,19,32,.06)` | `rgba(255,255,255,.07)` | Hover, Chips, Schalter |

**Themenfarben** dienen nur Grafiken, Icons und Farbpunkten, nicht als Textfarbe:

| Thema | Farbe | Verlauf |
|---|---|---|
| AI in der Softwareentwicklung | Indigo `#6366F1` | Indigo → Violett → Cyan |
| AI Audit für Unternehmen | Petrol `#0D9488` | Petrol → Grün → Himmelblau |
| AI in Data Analytics | Orange `#EA580C` | Orange → Rosa → Gelb |

### Glas

| Token | Hell | Dunkel |
|---|---|---|
| `--glass-tint` (regular) | `rgba(255,255,255,.52)` | `rgba(28,32,42,.48)` |
| `--glass-tint-strong` (Overlays) | `rgba(255,255,255,.72)` | `rgba(28,32,42,.72)` |
| `--glass-filter` | `blur(22px) saturate(180%)` | gleich |
| `--glass-edge` (Rand) | `rgba(255,255,255,.65)` | `rgba(255,255,255,.14)` |
| Clear-Variante | `rgba(255,255,255,.14)`, `blur(10px) saturate(170%)` | gleich |

### Typografie

- **Schriften:** System-Schriften: `-apple-system, BlinkMacSystemFont, "Segoe UI Variable", "Segoe UI", Inter, Roboto, sans-serif`. Auf Apple-Geräten erscheint so automatisch San Francisco. SF Pro wird nicht als Webfont ausgeliefert; die Lizenz ist vor jedem Einsatz zu prüfen.
- **Skala:**

| Stil | Größe | Gewicht | Zeilenhöhe |
|---|---|---|---|
| Display (Startseite) | `clamp(40px … 72px)` | 750 | 1.02 |
| H1 (Seiten, Artikel) | `clamp(34px … 56px)` | 750 | 1.06 |
| H2 (Abschnitte) | `clamp(26px … 36px)` | 720 | 1.1 |
| H3 (Karten, Listen) | 20–21 px | 700 | 1.2 |
| Fließtext | 17 px | 400 | 1.55 |
| Artikeltext | 18 px | 400 | 1.7 |
| Klein (Meta, Chips) | 12–15 px | 600–650 | 1.35 |

- Überschriften erhalten eine leicht negative Laufweite (−0,02 bis −0,035 em) und `text-wrap: balance`.

### Abstände, Radien, Schatten

- **Raster:** 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96 px.
- **Radien:** 12 / 20 / 28 / 36 px und Kapsel (`999px`).
- **Konzentrisch:** Innerer Radius = äußerer Radius − Innenabstand. Beispiel: Themenkarte 28 px mit 8 px Innenabstand ergibt 20 px für das Bild. Bedienelemente sind Kapseln oder Kreise.
- **Schatten:** weich und weit, nie hart. Glas bekommt zusätzlich eine helle Innenkante oben (Lichtkante).

### Bewegung

| Token | Wert | Einsatz |
|---|---|---|
| `--dur-fast` | 160 ms | Drücken, Hover |
| `--dur-base` | 300 ms | Menü, Schalter, Punkte |
| `--dur-slow` | 500 ms | Kopfzeile schrumpft, Dialog erscheint |
| `--ease-out` | `cubic-bezier(.22,1,.36,1)` | Ein- und Ausblenden |
| `--ease-spring` | `cubic-bezier(.34,1.36,.64,1)` | federnde Bewegung bei Bedienelementen |

Gedrückte Bedienelemente skalieren kurz auf 95 %. Bei `prefers-reduced-motion: reduce` entfallen alle Animationen. [Q6]

---

## 5 Liquid Glass im Browser umsetzen

### Grundrezept

```css
.glass {
  position: relative;
  background-color: var(--glass-tint);
  background-image:
    radial-gradient(160px circle at var(--mx, 50%) var(--my, -120px),
                    var(--glass-hl-color), transparent 70%),   /* Lichtreflex am Mauszeiger */
    var(--glass-sheen);                                        /* diagonaler Glanz */
  -webkit-backdrop-filter: var(--glass-filter);
  backdrop-filter: var(--glass-filter);                        /* blur + saturate [Q3] */
  border: 1px solid var(--glass-edge);
  box-shadow:
    inset 0 1px 0 var(--glass-rim),                            /* Lichtkante oben */
    var(--glass-shadow);                                       /* weicher Schwebeschatten */
}
```

### Hinweise

- **Glas auf eigener Schicht.** Die Kopfzeile trägt ihr Glas auf einem absolut positionierten Kindelement (`.bar-glass`). So kann das Themenmenü als Geschwisterelement eigenes Glas zeigen, ohne in einer Backdrop Root zu landen. [Q7]
- **Lichtreflex:** JavaScript setzt `--mx` und `--my` nur für Mauszeiger (`pointerType === "mouse"`). Bei Touch bleibt der statische Glanz.
- **Fallbacks:**
  - Ohne `backdrop-filter`-Unterstützung (`@supports not`) nutzt das Glas die dichtere Tönung.
  - Bei `prefers-reduced-transparency: reduce` wird Glas zur opaken Fläche `--surface`. [Q4] Weil noch nicht alle Browser diese Abfrage unterstützen, bietet der Mock zusätzlich einen Schalter.
  - Bei `prefers-contrast: more` werden Tönung, Ränder und Sekundärtext kräftiger. [Q5]
  - Bei `forced-colors: active` erhält Glas die Systemfarben `Canvas` und `CanvasText`.
- **Lesbarkeit prüfen:** Text auf Glas muss auch über dem ungünstigsten Hintergrund mindestens 4,5:1 Kontrast erreichen. Das gilt besonders für helle Bilder im Karussell. [Q8]
- **Performance:**
  - `backdrop-filter` ist rechenintensiv. Deshalb gibt es nur wenige und kleine Glasflächen und keine Animation des Blur-Radius.
  - Die Hintergrundflecken sind reine `radial-gradient`-Verläufe ohne `filter: blur()`.
  - Auf älteren Android-Geräten testen.
- **Optional, nicht im MVP:** Echte Lichtbrechung am Glasrand ist per SVG-`feDisplacementMap` in `backdrop-filter: url(#…)` möglich. Das funktioniert derzeit nur in Chromium. Wenn überhaupt, kommt es als Progressive Enhancement.

---

## 6 Layout und Raster

- **Container:** maximal 1120 px breit, mit mindestens 16 px Seitenrand.
- **Breakpoints:** kompakt bis 600 px, mittel bis 760 px (Kopfzeile ohne Markennamen), breit darüber.
- **Kopfzeile:** schwebende Kapsel, 12 px vom oberen Rand und 60 px hoch. Beim Scrollen wird sie schmaler (1120 → 920 px). Sie bleibt immer an derselben Stelle (HIG Flexibility: Kontext bewahren). [Q1]
- **Inhaltsbeginn:** Kopfzeilenhöhe plus 48 px.
- **Touch-Ziele:** mindestens 44 × 44 px. WCAG 2.2 fordert mindestens 24 × 24 px. [Q8]
- **Lesebreite:** Artikeltext höchstens 720 px, Einleitungen höchstens 640 px.

---

## 7 Komponenten und Seiten

### Kopfzeile (Anf. 2, 6, 7)

- **Aufbau:** Logo und Markenname links, `Themen ▾` und `Blog` in der Mitte, Sprachschalter `DE | EN` und Kontosymbol rechts.
- **Aktiver Zustand:** Der aktive Bereich hat eine dezente Füllung (`aria-current="page"`).
- **Mobil:** Der Markenname entfällt, die Reihenfolge bleibt. Es gibt kein Hamburger-Menü, weil nur zwei Navigationspunkte nötig sind (Simplicity).

### Themenmenü (Anf. 2)

- **Muster:** Disclosure (`<button aria-expanded>` mit Linkliste), kein ARIA-Menü.
- **Inhalt:** je Thema ein Farb-Icon, der Titel und eine Zeile Beschreibung.
- **Öffnen und Schließen:** Das Menü wächst federnd aus dem Button. Es schließt per Klick daneben, mit `Esc` (der Fokus springt zurück zum Button) und beim Verlassen per Tab.

### Sprachschalter (Anf. 7)

- **Bedienung:** Segment mit gleitender Markierung. Ein Wechsel lädt dieselbe Seite in der neuen Sprache. URL und Scrollposition bleiben erhalten.
- **Speicherung:** Die gewählte Sprache wird lokal gespeichert und gilt für alle weiteren Seiten.
- **Fehlende Übersetzung:** Die Originalfassung bleibt lesbar. Ein Hinweis nennt die Sprache, in Listen als Chip „Nur auf Deutsch“ und im Artikel als Hinweisbox. Der Inhalt erhält `lang="de"`.

### Konto und Anmeldung (Anf. 6)

- **Einstieg:** Das Kontosymbol öffnet einen modalen Dialog aus Glas mit E-Mail, Passwort und „Anmelden“.
- **Klarheit:** Der Text sagt klar, dass der Zugang nur für die Redaktion gilt (Responsibility).
- **Fehlermeldungen** sind konkret und bieten einen nächsten Schritt.

### Startseite (Anf. 1, Ticket #73)

Vorlage ist der Landing-Page-Entwurf [mock/landing/index.html](mock/landing/index.html). Er ersetzt das frühere Karussell und die Themenleiste.

1. **Hero:** Überschrift mit Verlauf in der zweiten Zeile, ein Satz Nutzenversprechen, Primärbutton zum KI-Audit, Textlink zu „Was ist KI?“ und eine Grafik aus drei Kreisen, je einer pro Thema. Die Kreise führen zur Themenseite und heben die passende Themenkarte hervor.
2. **Kennzahlen:** drei Werte zur KI-Nutzung in Deutschland mit Quellenverweis.
3. **Was ist KI?:** Definition, die sieben typischen Aufgaben als Tabs (Pfeiltasten, Pos1, Ende) mit Beispiel und drei Grenzen von KI.
4. **Themen:** drei opake Karten im Raster.
5. **KI-Audit:** dunkle Fläche in beiden Darstellungen. Dimension wählen, die drei Reifegrade zeigen ihre Bedeutung für diese Dimension, der Button führt zur Selbsteinschätzung.
6. **Neu im Blog:** die drei neuesten Beiträge als Karten und ein Link „Alle Beiträge“. Ohne veröffentlichte Beiträge entfällt der Abschnitt.
7. **Profil-Teaser** und **Quellen** mit nummerierten Verweisen aus dem Text.

### Themenseite (Anf. 3)

- **Aufbau:** Brotkrumen, Eyebrow „Thema“, Titel, Einführung und eine große Themengrafik. Darunter folgt die Liste der zugeordneten Beiträge.
- **Leerer Zustand:** freundlicher Hinweis mit Link zum Blog. Die Einführung bleibt sichtbar.

### Blogübersicht (Anf. 4)

- **Liste:** neueste Beiträge zuerst. Jede Zeile zeigt Vorschaubild, Datum, Themen-Chips, Titel und Kurztext. Die ganze Zeile ist ein Link.

### Beitragsseite (Anf. 4, 7)

- **Kopf:** Zurück-Link „Zurück zum Blog“, Themen-Chips, Titel, Datum und Lesezeit.
- **Inhalt:** breite Titelgrafik, Artikeltext mit 720 px Lesebreite und am Ende „Mehr zum Thema“.

### Redaktionssystem (Anf. 5, nicht im Mock)

- **Material:** Der Arbeitsbereich ist opaker Inhalt. Die Werkzeugleiste („Speichern“, „Veröffentlichen“, Themen) schwebt als Glas-Kapsel.
- **Status:** „Entwurf“ oder „Veröffentlicht“ steht immer sichtbar als Badge.
- **Primäraktion:** „Veröffentlichen“ ist der einzige Primärbutton.
- **Zurücknehmen:** Das Zurücknehmen einer Veröffentlichung braucht eine Bestätigung und bietet danach „Rückgängig“ (Agency).

### Footer

- **Inhalt:** Marke mit Kurzbeschreibung, Themenlinks und Rechtliches (Impressum, Datenschutz, Barrierefreiheit).
- **Datenschutz:** ein Hinweis in Klartext.
- **Mock:** Ein Prototyp-Panel schaltet Darstellung, reduzierte Transparenz und erhöhten Kontrast. Es gehört nicht in die Live-Seite.

---

## 8 Barrierefreiheit (Checkliste)

- [ ] Textkontrast mindestens 4,5:1, große Schrift sowie Icons und Bedienelemente mindestens 3:1, auch auf Glas. [Q8]
- [ ] Systemeinstellungen werden berücksichtigt: `prefers-reduced-transparency`, `prefers-contrast`, `prefers-reduced-motion`, `prefers-color-scheme` und `forced-colors`. [Q4] [Q5] [Q6]
- [ ] Ein Skip-Link „Zum Inhalt springen“ ist vorhanden. Der Fokus ist sichtbar (3 px, Akzentfarbe).
- [ ] Nach jedem Seitenwechsel springt der Fokus auf die H1 und der Seitentitel wird aktualisiert.
- [ ] Tabs und Auswahlschalter der Startseite sind per Tastatur bedienbar und melden ihren Zustand (`aria-selected`, `aria-pressed`). Zahlen, die hochzählen, lesen Screenreader nur als Endwert.
- [ ] `lang` ist für die Seite und für nicht übersetzte Abschnitte gesetzt.
- [ ] Touch-Ziele sind mindestens 44 px groß.
- [ ] Informationen hängen nie nur an Farbe: Themen-Chips haben immer einen Text.

---

## 9 Sprache und Texte

- So kurz wie möglich (Simplicity: „Be concise“). [Q1]
- Aktionen mit Verben beschriften: „Anmelden“, „Zum Thema“, „Weiterlesen“.
- Personenbezeichnungen in Paarform, wie in den Anforderungen („Redakteurinnen und Redakteure“).
- Jede deutsche Beschriftung hat ein englisches Gegenstück (siehe `I18N` im Mock).

---

## 10 Do & Don't

| Do | Don't |
|---|---|
| Glas für Kopfzeile, Menü, Dialog und Steuerung | Glas für Karten, Listen oder Artikeltext |
| Ein Glaselement pro Funktion | Glas auf Glas stapeln |
| Clear-Glas nur über Bildern, mit Abdunklung | Clear-Glas über unruhigem Text |
| Bewegung, die Ursache und Wirkung zeigt | Bewegung als reine Dekoration oder Autoplay |
| Gleiche Positionen auf allen Seiten | Kopfzeile je nach Seite umbauen |
| Opake Fallbacks für Barrierefreiheit | Lesbarkeit der Optik opfern |

---

## 11 Mock

- **Datei:** [mock/design/index.html](mock/design/index.html). Sie ist eigenständig, ohne Build und ohne externe Abhängigkeiten. Ein Doppelklick öffnet sie im Browser.
- **Profilentwurf:** [mock/profil/index.html](mock/profil/index.html) zeigt Marvin Jakob, seine fachlichen Schwerpunkte und ausgewählte Projekte.
- **Ansichten:**

| Ansicht | URL |
|---|---|
| Startseite | `#/` |
| Themenseiten | `#/thema/software`, `#/thema/audit`, `#/thema/data` |
| Blog | `#/blog` |
| Beiträge | `#/beitrag/<id>` |

- **Bedienbar:**
  - Themenmenü, Sprachwechsel DE/EN mit Hinweis bei fehlender Übersetzung und Anmeldedialog (ohne echte Anmeldung).
  - Beitrags-Karussell und Themenkarten-Leiste.
  - Prototyp-Einstellungen im Footer.
- **Beispielinhalte:** Alle Texte sind Platzhalter. „AI in Data Analytics“ hat absichtlich keine Beiträge, um den leeren Zustand zu zeigen.
- **Nicht enthalten:** Redaktionssystem und echte Authentifizierung.

---

## 12 Offene Punkte

- Name, Logo und Markenfarben festlegen. Der Akzent ist derzeit Blau `#0A5FD6`.
- Bildsprache klären (Illustration oder Foto). Derzeit dienen generierte Farbverläufe als Platzhalter.
- Rechtstexte erstellen (Impressum, Datenschutz, Barrierefreiheitserklärung).
- Performance von `backdrop-filter` auf älteren Geräten messen.
- Redaktionssystem als eigenen Mock ausarbeiten.

---

## Quellen

| Nr. | Quelle | Belegt |
|---|---|---|
| Q1 | Apple: *Human Interface Guidelines – Design principles* (Stand der Seite: 8. Juni 2026), <https://developer.apple.com/design/human-interface-guidelines/design-principles> | Die acht Prinzipien und ihre Kernaussagen (Abschnitt 2), das bewusst gewählte Gefühl (Abschnitt 1), Kontext bewahren (Abschnitt 6), knappe Sprache (Abschnitt 9) |
| Q2 | Apple: *Human Interface Guidelines – Materials* (Liquid Glass, Stand 9. September 2025), <https://developer.apple.com/design/human-interface-guidelines/materials> | Funktionsebene und Inhaltsebene, sparsamer Einsatz, regular und clear, 35 % Abdunklung, Scroll-Kanten-Effekt, Systemeinstellungen (Abschnitte 1, 3 und 5) |
| Q3 | MDN: *backdrop-filter*, <https://developer.mozilla.org/en-US/docs/Web/CSS/backdrop-filter> | Technische Umsetzung des Glaseffekts (Abschnitt 5) |
| Q4 | MDN: *prefers-reduced-transparency*, <https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-transparency> | Opaker Fallback bei reduzierter Transparenz (Abschnitte 3, 5 und 8) |
| Q5 | MDN: *prefers-contrast*, <https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-contrast> | Erhöhter Kontrast (Abschnitte 3, 5 und 8) |
| Q6 | MDN: *prefers-reduced-motion*, <https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion> | Reduzierte Bewegung (Abschnitte 4 und 8) |
| Q7 | W3C: *Filter Effects Module Level 2*, Abschnitt „Backdrop Root“, <https://drafts.fxtf.org/filter-effects-2/> | Warum Glas nicht verschachtelt werden soll (Abschnitte 3 und 5) |
| Q8 | W3C: *Web Content Accessibility Guidelines (WCAG) 2.2*, <https://www.w3.org/TR/WCAG22/> | Kontrast 1.4.3 und 1.4.11, Zielgröße 2.5.8 (Abschnitte 5, 6 und 8) |
