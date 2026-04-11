package handlers

import (
	"fmt"
	"net/http"
)

func enableCors(w http.ResponseWriter) {
	w.Header().Set("Access-Control-Allow-Origin", "http://192.168.0.250:5173")
	w.Header().Set("Access-Control-Allow-Methods", "GET")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
}

func HandleHealth(w http.ResponseWriter, r *http.Request) {
	enableCors(w)
	fmt.Fprintf(w, "OK")
}
