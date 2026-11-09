# Schrift beim Scrollen prüfen

Zu [Ticket #72](https://github.com/MarvinJakob/aiboard/issues/72).

## Änderung und Eingrenzung

Die feste `.scroll-edge` lag mit `backdrop-filter: blur(10px)` über den obersten 120 px des Seiteninhalts. Dieser Filter verwischt den darunter vorbeiscrollenden Text bestimmungsgemäß: Backdrop-Filter verarbeiten den zuvor gezeichneten Hintergrund ([CSSWG, Filter Effects Level 2, Abschnitt 2.1](https://drafts.csswg.org/filter-effects-2/#backdrop-filter-operation)). Die Scroll-Kante verwendet deshalb nur noch ihren getönten Verlauf und die vorhandene Überblendung.

Die drei Hintergrundflecken bewegen sich weiterhin, werden aber nicht mehr skaliert. Dies vereinfacht die Animation; ein Einfluss der Skalierung auf die gemeldete verzögerte Schärfe wurde nicht separat nachgewiesen. Glas, Glanz, Lichtkanten und Schatten der Bedienelemente bleiben erhalten. Die Redaktion enthält dieselben CSS-Muster, verwendet die Scroll-Kante und die Hintergrundflecken derzeit jedoch nicht im Layout.

## Manuelle Abnahme

Die gebaute Anwendung mit Testdaten starten (siehe [README](../README.md#lokal-entwickeln)). Je aktuellem Chrome, Edge, Firefox und Safari prüfen; Browser-Version, Betriebssystem und Ergebnis im Ticket festhalten. Unter Windows bei 100 % und 150 % Anzeigeskalierung prüfen, jeweils bei 100 % und 125 % Browser-Zoom. Safari auf einem unterstützten Apple-System separat prüfen.

1. Startseite, Profil, Blog, einen langen Beitrag sowie Audit-Übersicht und eine Dimensionsseite öffnen.
2. Mehrfach langsam und schnell nach unten und oben scrollen. Schrift in Karten, Fließtext und Kopfzeile während der Bewegung sowie unmittelbar nach dem Anhalten beobachten. Es darf keine verzögerte Schärfung und kein sichtbares Ruckeln auftreten.
3. Insbesondere den Bereich direkt unterhalb der Kopfzeile beobachten und dort das Themenmenü öffnen. Glasflächen müssen weiterhin getönt, mit Glanz und Lichtkante erscheinen; Schrift und Fokusmarkierungen bleiben lesbar.
4. In heller und dunkler Darstellung wiederholen. Auf schmalem Bildschirm die zweizeilige Kopfzeile prüfen.
5. Redaktion anmelden, Beitragsliste, langen Beitrag im Editor und Benutzerverwaltung prüfen. Kopfzeile und schwebende Werkzeugleiste beim Scrollen beobachten.
6. Reduzierte Bewegung, reduzierte Transparenz und erhöhten Kontrast prüfen, soweit der Browser diese Einstellungen unterstützt. Bei reduzierter Transparenz müssen die Glasflächen opak sein, bei reduzierter Bewegung die Hintergrundflecken stillstehen.

Automatische Komponenten-Tests und Builds prüfen Verhalten und Kompilierung, können die GPU-Schriftdarstellung während des Scrollens jedoch nicht nachweisen. Eine Geräte- und Browserabnahme bleibt deshalb erforderlich.
