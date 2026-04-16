package repository

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestGetMetrics_Success(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"success","data":{"resultType":"vector","result":[{"metric":{"instance":"localhost:9100"},"value":[1234567890.0,"42.5"]}]}}`))
	}))
	defer server.Close()

	repo := NewRepository(server.URL + "?query=")
	result, err := repo.GetMetrics("up")

	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if result.Status != "success" {
		t.Errorf("expected status 'success', got %q", result.Status)
	}
}

func TestGetMetrics_NonOKStatus(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusInternalServerError)
	}))
	defer server.Close()

	repo := NewRepository(server.URL + "?query=")
	_, err := repo.GetMetrics("up")

	if err == nil {
		t.Error("expected error on non-200 status, got nil")
	}
}

func TestGetMetrics_InvalidJSON(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`not valid json`))
	}))
	defer server.Close()

	repo := NewRepository(server.URL + "?query=")
	_, err := repo.GetMetrics("up")

	if err == nil {
		t.Error("expected error on invalid JSON, got nil")
	}
}

func TestGetMetrics_ConnectionFailure(t *testing.T) {
	repo := NewRepository("http://localhost:1")
	_, err := repo.GetMetrics("up")

	if err == nil {
		t.Error("expected error on connection failure, got nil")
	}
}
