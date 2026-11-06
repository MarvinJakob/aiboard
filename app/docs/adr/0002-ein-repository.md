# 0002 Ein gemeinsames Repository für Frontend, Backend und Betrieb

**Status:** angenommen · **Datum:** 2026-11-06

## Kontext

Frontend, Backend und Betriebskonfiguration ändern sich oft gemeinsam, etwa bei einer Änderung der Schnittstelle.

## Entscheidung

Alles liegt in einem Git-Repository: api, frontend, backend, deploy und docs. Ein Docker-Image enthält beide Teile in derselben Version.

## Konsequenzen

- Eine Änderung an openapi.yaml, Backend und Frontend ist ein Pull Request.
- Die CI prüft immer den Gesamtstand.
- Getrennte Release-Zyklen für Frontend und Backend sind bewusst nicht vorgesehen.
