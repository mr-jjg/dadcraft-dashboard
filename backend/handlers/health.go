package handlers

import (
	"fmt"
	"net/http"
	"os"
)

func enableCors(w http.ResponseWriter) {
	allowedOrigin := os.Getenv("ALLOWED_ORIGIN")
	if allowedOrigin == "" {
		allowedOrigin = "http://192.168.0.250:5173" // dev fallback
	}

	w.Header().Set("Access-Control-Allow-Origin", allowedOrigin)
	w.Header().Set("Access-Control-Allow-Methods", "GET")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
}

func HandleHealth(w http.ResponseWriter, r *http.Request) {
	enableCors(w)
	fmt.Fprintf(w, "OK")
}
