#!/bin/bash

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DB_DSN="$(grep '^DB_DSN=' "$ROOT/.env" | cut -d= -f2-)"

docker compose -f "$ROOT/docker-compose.yml" -f "$ROOT/docker-compose.dev.yml" up -d prometheus
(
    cd "$ROOT/backend" &&
    PORT=8082 \
    PROMETHEUS_URL=http://localhost:9090/api/v1/ \
    DB_DSN="$DB_DSN" \
    go run main.go
) &
(cd "$ROOT/frontend" && npm run dev -- --host)
