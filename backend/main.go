package main

import (
	"net/http"
	"os"

	"dadcraft-dashboard/handlers"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8081" // default fallback
	}

	mux := http.NewServeMux()

	mux.HandleFunc("/health", handlers.HandleHealth)
	mux.HandleFunc("/metrics", handlers.HandleMetrics)

	http.ListenAndServe(":"+port, mux)
}
