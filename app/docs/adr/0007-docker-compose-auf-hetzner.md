# 0007 Hosting mit Docker Compose auf einem Hetzner-Cloud-Server

**Status:** angenommen · **Datum:** 2026-11-06

## Kontext

Die Seite soll günstig, datenschutzfreundlich in der EU und ohne Kubernetes-Kenntnisse betreibbar sein.

## Entscheidung

Ein Hetzner-Cloud-Server in Deutschland mit Docker Compose: Caddy für TLS, Kompression, Sicherheits-Header und Medien, dahinter das Backend-Image. Deployment per SSH mit docker compose pull und up -d.

## Konsequenzen

- Einfacher Betrieb, Rollback durch Setzen der vorherigen VERSION.
- Kein automatisches Skalieren und keine Hochverfügbarkeit; Ausfälle meldet die externe Überwachung.
- Migrationen müssen additiv sein, damit ein Rollback möglich bleibt.
