# Landing-Page-Entwurf KI Perspektiven

`index.html` direkt im Browser öffnen. Die Seite braucht keinen Build und keine externen Dienste. Das Porträt wird relativ aus `../../ressources/profil/MarvinJakob.jpg` geladen. Links zu Themen und Blog führen in den [bestehenden Designentwurf](../design/index.html), der Profil-Link in den [Profilentwurf](../profil/index.html).

Der Entwurf folgt [DESIGN.md](../../DESIGN.md): Glas nur für Kopfzeile, Anmeldedialog und Hinweis, opake Inhaltsflächen, Design-Tokens für Hell und Dunkel, Fallbacks für reduzierte Transparenz, Bewegung und erhöhten Kontrast.

## Aufbau

1. **Hero** mit Nutzenversprechen, einem Primärbutton zum KI-Audit und einer Grafik aus drei Kreisen für die Themen. Die Kreise verlinken auf die Themenkarten und heben sie beim Überfahren hervor.
2. **Kennzahlen** zur KI-Nutzung in Deutschland 2025.
3. **Was ist KI?** mit Definition, den sieben typischen Aufgaben als Tabs mit belegtem Beispiel und drei Grenzen von KI.
4. **Themen** als drei Karten.
5. **KI-Audit** mit acht Dimensionen zum Anklicken. Je Dimension zeigt die Seite, was die Reifegrade Einfach, Strukturiert und Intelligent bedeuten.
6. **Neu im Blog** mit drei Beiträgen.
7. **Profil-Teaser** und **Quellen**.
8. **Footer** mit Prototyp-Einstellungen für Darstellung und reduzierte Transparenz.

## Grundlage der Texte

- [Was ist KI und was man damit machen kann](../../research/2026-11-09%20Was%20ist%20KI%20und%20was%20man%20damit%20machen%20kann.md): Definition, sieben Aufgaben mit Beispielen, Kennzahlen und Grenzen. Die Quellen stehen nummeriert am Ende der Seite.
- [content.json des KI-Audits](../../app/backend/internal/audit/content.json): Namen der Dimensionen, Leitsätze der Reifegrade und jeweils der erste Satz der Reifegradbeschreibung.
- [Startthemen](../../app/backend/migrations/00002_start_topics.sql) und [Testbeiträge](../../app/backend/migrations/dev/00001_dev_posts.sql): Titel und Kurztexte von Themen und Beiträgen.

## Nicht enthalten

- Englische Fassung. Der Sprachschalter zeigt einen Hinweis.
- Echte Anmeldung und das Quiz selbst. Der Audit-Button führt zur Audit-Themenseite des Designentwurfs.
- Impressum, Datenschutz und Barrierefreiheitserklärung.
