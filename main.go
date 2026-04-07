package main

import (
	"fmt"
	"net/http"
)

func handleHealth(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "OK")
}

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("/health", handleHealth)

	http.ListenAndServe(":8081", mux)
}
