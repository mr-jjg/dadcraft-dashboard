package handlers

import (
	"net/http"
)

func CorsMiddleware(allowedOrigin string, next http.Handler) http.Handler {
	if allowedOrigin == "" {
		allowedOrigin = "http://192.168.0.250:5173" // dev fallback
	}

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", allowedOrigin)
		w.Header().Set("Access-Control-Allow-Methods", "GET")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		next.ServeHTTP(w, r)
	})
}