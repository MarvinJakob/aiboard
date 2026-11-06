// Package backend bündelt die Code-Erzeugung. Aufruf: go generate ./...
package backend

//go:generate go tool oapi-codegen -config internal/api/oapi-codegen.yaml -o internal/api/api.gen.go ../api/openapi.yaml
//go:generate go tool sqlc generate
