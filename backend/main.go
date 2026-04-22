package main

import (
	"net/http"
	"os"

	"dadcraft-dashboard/handlers"
	"dadcraft-dashboard/repository"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8081" // default fallback
	}

	prometheusURL := os.Getenv("PROMETHEUS_URL")
	if prometheusURL == "" {
		prometheusURL = "http://prometheus:9090/api/v1/query?query=" // default fallback (Docker service name)
	}

	allowedOrigin := os.Getenv("ALLOWED_ORIGIN")

	repo := repository.NewRepository(prometheusURL)

	mux := http.NewServeMux()
	mux.HandleFunc("/api/health", handlers.HandleHealth)
	mux.HandleFunc("/api/cpu", handlers.GetMetric(repo, `100 - (avg by (instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)`))

	http.ListenAndServe(":"+port, handlers.CorsMiddleware(allowedOrigin, mux))
}
