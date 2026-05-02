#!/bin/bash

DB_DSN="$(grep '^DB_DSN=' .env | cut -d= -f2-)"

docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d prometheus
(
    cd backend &&
    PORT=8082 \
    PROMETHEUS_URL=http://localhost:9090/api/v1/ \
    DB_DSN="$DB_DSN" \
    go run main.go
) &
(cd frontend && npm run dev -- --host)
