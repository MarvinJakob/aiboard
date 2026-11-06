# 0009 Audit-Inhalte als Datei im Repository, Auswertung im Browser

**Status:** angenommen · **Datum:** 2026-11-06

## Kontext

Die KI-Audit-Seiten (Anforderungen 8 bis 10) zeigen Dimensionen, Vorteile, Reifegrade und Prüffragen. Grundlage ist das Fachdokument `content/KI Audit.docx`. Die Inhalte ändern sich selten und nur nach fachlicher Freigabe. Das Redaktionsfrontend (Sprint 3) pflegt Beiträge, keine Audit-Inhalte. Das Backend braucht die Inhalte trotzdem für Statuscodes, Meta-Tags und die Sitemap.

## Entscheidung

- Die Audit-Inhalte liegen versioniert in `backend/internal/audit/content.json` und werden mit `go:embed` in das Binary eingebettet. Es gibt keine Datenbanktabellen dafür.
- Das Backend prüft die Datei beim Start: drei Reifegrade je Dimension, mindestens zwei Vorteile, mindestens eine Frage je Reifegrad, gleiche Fragen in allen Sprachen. Fehlerhafte Inhalte verhindern den Start.
- Jede Dimension hat das Feld `released`. Nur freigegebene Dimensionen erscheinen in API, Webseite und Sitemap. Alle anderen liefern `404`.
- Die API liefert die Inhalte über `GET /api/audit` und `GET /api/audit/dimensions/{slug}` (OpenAPI-Vertrag, ADR 0006).
- Das Quiz wertet die Antworten im Browser aus. Antworten werden weder gesendet noch gespeichert.

## Konsequenzen

- Inhaltliche Änderungen laufen über einen Pull Request und ein neues Release. Das ist für fachlich freigegebene Inhalte gewollt.
- Keine personenbezogenen Daten, keine neue Datenschutzprüfung für das Quiz.
- Sollen Audit-Inhalte später in der Redaktion gepflegt werden, wird die Datei durch Tabellen ersetzt. API und Frontend bleiben gleich.
- Die Frontend-Tests lesen dieselbe Datei und prüfen die dokumentierten Antwortsätze (`docs/audit-abnahme.md`).
