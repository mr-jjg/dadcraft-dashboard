#!/bin/bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d prometheus
(cd backend && PORT=8082 PROMETHEUS_URL=http://localhost:9090/api/v1/query?query= go run main.go) &
(cd frontend && npm run dev -- --host)
