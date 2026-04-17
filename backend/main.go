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
		prometheusURL = "http://prometheus:9090/api/v1/query?query="
	}

	allowedOrigin := os.Getenv("ALLOWED_ORIGIN")

	metricsHandler := handlers.NewMetricsHandler(repository.NewRepository(prometheusURL))

	mux := http.NewServeMux()
	mux.HandleFunc("/health", handlers.HandleHealth)
	mux.HandleFunc("/metrics", metricsHandler.HandleMetrics)

	http.ListenAndServe(":"+port, handlers.CorsMiddleware(allowedOrigin, mux))
}
