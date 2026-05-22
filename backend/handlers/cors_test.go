package handlers

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestCorsMiddleware(t *testing.T) {
	expectedOrigin := "http://example.com"

	dummy := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {})
	handler := CorsMiddleware(expectedOrigin, dummy)

	r := httptest.NewRequest("GET", "/", nil)
	w := httptest.NewRecorder()

	handler.ServeHTTP(w, r)

	returnedOrigin := w.Header().Get("Access-Control-Allow-Origin")
	if returnedOrigin != expectedOrigin {
		t.Errorf("expected %q but got %q", expectedOrigin, returnedOrigin)
	}
}
