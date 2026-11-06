# 0003 SQLite als erste Datenbank

**Status:** angenommen · **Datum:** 2026-11-06

## Kontext

Der Blog hat wenige schreibende Personen und viele Lesezugriffe. Betrieb und Sicherung sollen einfach bleiben.

## Entscheidung

Wir starten mit SQLite (Treiber modernc.org/sqlite ohne CGO) in einem Docker-Volume, mit WAL, foreign_keys und busy_timeout. Der Datenzugriff liegt hinter dem von sqlc erzeugten Querier-Interface, die Abfragen sind Standard-SQL, die Migrationen laufen mit goose.

## Konsequenzen

- Keine eigene Datenbank-Instanz, Sicherung mit VACUUM INTO.
- Nur eine Backend-Instanz kann schreiben.
- **Wechsel zu PostgreSQL**, sobald mehrere Backend-Instanzen nötig sind, die Schreiblast spürbar steigt (z. B. regelmäßige Wartezeiten durch busy_timeout) oder die Datenbank deutlich über 10 GB wächst.
