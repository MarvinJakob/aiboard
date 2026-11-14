# KI Readiness: Inhaltsstand für Ticket #111

Quelle: [`content/KI Readiness.md`](../../content/KI%20Readiness.md), Stand **14. November 2026**, unveränderte Kopie der bereitgestellten Datei. SHA-256: `67f31c2c8ab615a2a35857f4fc600d1e731afab7e853932d57642a36abf7bd8d`.

## Übernahme und Herkunft

| Inhalt | Umsetzung |
| --- | --- |
| Titel und Kurzbeschreibung | Seitentitel „KI Readiness“, Leitfrage der Vorlage als Untertitel, Einstiegstext aus dem Titelabschnitt. Migration `00011` aktualisiert beide Sprachfassungen und damit auch Metadaten und Themenverweise. Der Slug `ai-audit` bleibt erhalten. |
| „Warum eine Selbsteinschätzung?“ | Vollständig und wörtlich in `overview.de.intro` des Audit-Katalogs, vor den Dimensionslinks. Listen und Hervorhebungen bleiben sichtbar. |
| Acht Dimensionen | Titel, Leitfrage als Kurzbeschreibung und Erklärung wörtlich aus „Die Dimensionen“, Reihenfolge unverändert. Die Einzelbeschreibungen erscheinen auf den Dimensionsseiten und seit #112 aufklappbar in der Übersicht. |
| Reifegrade | Namen und Leitsätze 1–3 sowie Unterschiede und Beispiel „Daten und Wissen“ aus der Vorlage. |
| Einordnung | „Nicht überall auf der höchsten Stufe“ vollständig übernommen. |
| Prüffragen, dimensionsspezifische Stufen und Vorteile | Nicht in der Vorlage ausgeschrieben. Unverändert aus `app/backend/internal/audit/content.json`, Basiscommit `3ef126e` (fachliche Herkunft: `content/KI Audit.docx`, Freigabe aus #29). Die Vorlage verweist ausdrücklich auf diesen Katalog. Es wurden keine neuen Fragen erfunden. |
| Englisch | Titel und Bedienelemente übersetzt; für die deutschen Fachtexte bleibt der API-Fallback mit sichtbarem Hinweis und `lang="de"` erhalten. |

## Bewusste Anpassungen gegenüber der Vorlage

Die Vorlage beschreibt noch den früheren Ja/Nein-Ablauf und Reifegrad 0. Der Auftraggeber hat am 14.11.2026 im Chat bestätigt: **Ticket befolgen, drei Reifegrade direkt wählen**.

Deshalb erklärt die Anleitung die bewusste Wahl von „Einfach“, „Strukturiert“ oder „Intelligent“ je Dimension. Prüffragen dienen nur als Entscheidungshilfe; danach folgt die gemeinsame Auswertung ohne Gesamtnote. Unternehmen und Projekte werden als mögliche Betrachtungsbereiche ausdrücklich genannt. Automatische Ableitung, Pflicht zur Einzelbeantwortung und Reifegrad 0 entfallen aus dieser neuen Anleitung. „Von 0 zu 1“ heißt hier „Einfach: Wir fangen an“, die Beispielzeile für Stufe 0 entfällt. Die bereitgestellte Quelldatei bleibt zur Nachvollziehbarkeit unverändert.

## Integration mit den weiteren Tickets

- #110 benennt die Hauptnavigation um; dessen separater PR bleibt zuständig.
- #112 (umgesetzt) zeigt die Dimensionsbeschreibungen aufklappbar in der Übersicht und ergänzt „Selbsteinschätzung starten“.
- #113 (umgesetzt) ersetzt den bisherigen Fragebogen auf den Dimensionsseiten durch die direkte Reifegradwahl und den geführten Ablauf. Die alten Quiztexte und die Stufe 0 sind entfernt.
- #114 (umgesetzt) ergänzt die Gesamtauswertung als Netzdiagramm. Deren Einordnung verwendet den hier übernommenen Text „Nicht überall auf der höchsten Stufe“: Er steht in `content.json` als `overview.de.classification`, die API liefert ihn als `classification` und weiterhin am Ende von `guidance`.

**Gemeinsame Veröffentlichung:** Diese Inhaltsänderung beschreibt den Zielablauf aus #112–#114. Sie darf erst zusammen mit diesem Ablauf veröffentlicht werden, damit Anleitung und Bedienung übereinstimmen. Der PR zu #111 ist separat inhaltlich prüfbar; der Review-Agent muss diese Integrationsvoraussetzung vor einem Merge mit automatischem Deployment beachten.

## Prüfungen

`readinessContent.test.tsx` vergleicht Einleitung, sämtliche Dimensionsbeschreibungen und Leitsätze mit der versionierten Vorlage. Die Darstellungstests verwenden die echten Katalogtexte in beiden Sprachen und prüfen Reihenfolge, Anleitung, Tabellen, Fallback-Hinweis und Sprachmarkierung. Die API-Tests prüfen die Auslieferung der Anleitung und den identischen deutschen Fallback. Seit #113 prüfen die Tests den geführten Ablauf (siehe [audit-abnahme.md](audit-abnahme.md)).
