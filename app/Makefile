# Häufige Aufgaben. Unter Windows ohne make die Befehle direkt ausführen (siehe README).

.PHONY: generate test build run dev

## Code aus api/openapi.yaml und den SQL-Abfragen neu erzeugen
generate:
	cd backend && go generate ./...
	cd frontend && npm run generate

## Alle Tests und Typprüfungen
test:
	cd backend && go vet ./... && go test ./...
	cd frontend && npm run typecheck && npm test

## Frontend bauen und in das Backend-Binary einbetten
build:
	cd frontend && npm run build
	cd backend && CGO_ENABLED=0 go build -o ../.build/server ./cmd/server

## Gebaute Anwendung mit Testbeiträgen starten (http://localhost:8080)
run: build
	DEV_SEED=true DATABASE_PATH=.build/dev.db ./.build/server

## Docker-Variante wie in Produktion, ohne TLS (http://localhost)
dev:
	docker compose -f compose.yaml -f compose.dev.yaml up --build
