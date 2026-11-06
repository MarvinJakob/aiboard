# syntax=docker/dockerfile:1
# Baut das Frontend und das Backend zu einem Image (ARCHITECTURE.md, Abschnitt 9).
# Renovate hält die Basis-Images aktuell; in Produktion per Digest festlegen.

FROM node:24-alpine AS frontend
WORKDIR /src/frontend
COPY frontend/package.json frontend/package-lock.json frontend/.npmrc ./
RUN npm ci
COPY api /src/api
COPY frontend ./
# Vite schreibt nach ../backend/internal/web/dist/public
RUN npm run build

FROM golang:1.27-alpine AS backend
WORKDIR /src/backend
COPY backend/go.mod backend/go.sum ./
RUN go mod download
COPY backend ./
COPY --from=frontend /src/backend/internal/web/dist/public ./internal/web/dist/public
RUN CGO_ENABLED=0 go build -trimpath -ldflags="-s -w" -o /out/server ./cmd/server \
 && mkdir -p /out/data/db /out/data/media

FROM gcr.io/distroless/static:nonroot
COPY --from=backend /out/server /server
COPY --from=backend --chown=nonroot:nonroot /out/data /data
USER nonroot
ENV ADDR=:8080 \
    DATABASE_PATH=/data/db/app.db \
    MEDIA_PATH=/data/media
EXPOSE 8080
ENTRYPOINT ["/server"]
