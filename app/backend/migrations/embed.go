// Package migrations bettet die SQL-Migrationen in das Binary ein.
//
// Das Verzeichnis selbst enthält das Schema und die Startdaten für den Betrieb.
// Das Unterverzeichnis dev enthält Testinhalte, die nur mit DEV_SEED=true eingespielt werden.
package migrations

import "embed"

// Schema enthält die Migrationen für jede Umgebung.
//
//go:embed *.sql
var Schema embed.FS

// DevSeed enthält Testbeiträge für die lokale Entwicklung.
//
//go:embed dev/*.sql
var DevSeed embed.FS
