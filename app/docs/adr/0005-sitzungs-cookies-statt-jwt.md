# 0005 Sitzungs-Cookies statt JWT für die Redaktion

**Status:** angenommen · **Datum:** 2026-11-06

## Kontext

Die Redaktion (ab Sprint 3) braucht eine Anmeldung. Beim Abmelden und beim Deaktivieren eines Kontos muss der Zugriff sofort enden.

## Entscheidung

Sitzungen liegen in der Datenbank. Das Cookie ist HttpOnly, Secure und SameSite=Lax. Schreibende Anfragen tragen zusätzlich ein CSRF-Token im Header.

## Konsequenzen

- Sitzungen lassen sich serverseitig sofort beenden, anders als bei JWT.
- Je geschütztem Aufruf eine Datenbankabfrage, bei der erwarteten Last unkritisch.
- Umsetzung folgt mit den Anforderungen 6 und 11.
