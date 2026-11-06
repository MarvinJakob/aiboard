# 0008 Medien im Docker-Volume statt in Object Storage

**Status:** angenommen · **Datum:** 2026-11-06

## Kontext

Hochgeladene Bilder (ab Sprint 3) brauchen einen Speicherort. Object Storage wäre skalierbarer, bringt aber einen weiteren Dienst und Zugangsdaten mit.

## Entscheidung

Bilder liegen im Volume app_media unter zufälligen, unveränderlichen Schlüsseln. Caddy liefert sie nur lesend mit einem Jahr Cache aus; schreiben darf nur das Backend. Die nächtliche Sicherung schließt das Volume ein.

## Konsequenzen

- Kein zusätzlicher Dienst.
- Speicherplatz ist an den Server gebunden. Ein Umzug nach Object Storage ist möglich, weil die URLs nur den Schlüssel enthalten.
