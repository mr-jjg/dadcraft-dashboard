package handlers

import (
	"net/http/httptest"
	"testing"
)

func TestHandleHealth(t *testing.T) {
	expectedHealth := "OK"
	r := httptest.NewRequest("GET", "/health", nil)
	w := httptest.NewRecorder()

	HandleHealth(w, r)

	returnedHealth := w.Body.String()
	if returnedHealth != expectedHealth {
		t.Errorf(`HandleHealth(w http.ResponseWriter, r *http.Request) did not return expected: %q`, expectedHealth)
		t.Errorf(`but returns %q`, returnedHealth)
	}
}

func TestEnableCors(t *testing.T) {
	expectedOrigin := "http://192.168.0.250:5173"
	w := httptest.NewRecorder()

	enableCors(w)

	returnedOrigin := w.Header().Get("Access-Control-Allow-Origin")

	if returnedOrigin != expectedOrigin {
		t.Errorf(`enableCors(w http.ResponseWriter) did not return expected: %q`, expectedOrigin)
		t.Errorf(`but returns %q`, returnedOrigin)
	}
}
