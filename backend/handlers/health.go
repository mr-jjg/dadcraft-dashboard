package handlers

import (
	"fmt"
	"net/http"
)

func HandleHealth(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "OK")
}
