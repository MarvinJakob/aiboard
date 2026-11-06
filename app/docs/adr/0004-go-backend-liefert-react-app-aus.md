# 0004 Go-Backend liefert die React-App aus und setzt Meta-Tags

**Status:** angenommen · **Datum:** 2026-11-06

## Kontext

Jede öffentliche URL soll beim ersten Aufruf passende Titel und Vorschau-Informationen liefern. Alternativen waren eine reine Single-Page-App (keine Meta-Tags für Link-Vorschauen) und Server-Side-Rendering mit Node (zweite Laufzeitumgebung).

## Entscheidung

Vite baut statische Dateien, die das Go-Backend mit go:embed einbettet. Für öffentliche Seiten ersetzt das Backend in der index.html den Bereich zwischen <!--app-head--> und <!--/app-head--> durch Titel, Beschreibung, Open-Graph-Tags, canonical und hreflang und setzt den passenden HTTP-Status (404 für Entwürfe und unbekannte Seiten).

## Konsequenzen

- Ein Binary, eine Laufzeitumgebung.
- Der Inhalt selbst wird im Browser gerendert; für Suchmaschinen reicht das, für Link-Vorschauen sorgen die Meta-Tags.
- Routen müssen im Backend (internal/web) und im Frontend (App.tsx) übereinstimmen.
