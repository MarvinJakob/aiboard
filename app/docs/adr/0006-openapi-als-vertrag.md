# 0006 OpenAPI als verbindlicher Schnittstellenvertrag

**Status:** angenommen · **Datum:** 2026-11-06

## Kontext

Frontend und Backend sollen nicht auseinanderlaufen. Fehler an der Schnittstelle sollen beim Bauen auffallen, nicht im Betrieb.

## Entscheidung

api/openapi.yaml ist die einzige Beschreibung der API. oapi-codegen erzeugt daraus das Go-Interface (strict server für net/http), openapi-typescript die TypeScript-Typen für openapi-fetch. Erzeugter Code wird eingecheckt.

## Konsequenzen

- Änderungen an der API beginnen in openapi.yaml, danach go generate ./... und npm run generate.
- Die CI erzeugt den Code neu und bricht bei Abweichungen ab.
