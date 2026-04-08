package main

import (
	"dadcraft-dashboard/handlers"
	"net/http"
)

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("/health", handlers.HandleHealth)

	http.ListenAndServe(":8081", mux)
}
