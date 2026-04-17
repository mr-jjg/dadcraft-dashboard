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
