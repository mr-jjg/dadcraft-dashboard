package repository

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestGetMetrics_Success(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"success","data":{"resultType":"vector","result":[{"metric":{"instance":"localhost:9100"},"value":[1234567890.0,"42.5"]}]}}`))
	}))
	defer server.Close()

	repo := NewPrometheusRepository(server.URL + "?query=")
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

	repo := NewPrometheusRepository(server.URL + "?query=")
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

	repo := NewPrometheusRepository(server.URL + "?query=")
	_, err := repo.GetMetrics("up")

	if err == nil {
		t.Error("expected error on invalid JSON, got nil")
	}
}

func TestGetMetrics_ConnectionFailure(t *testing.T) {
	repo := NewPrometheusRepository("http://localhost:1")
	_, err := repo.GetMetrics("up")

	if err == nil {
		t.Error("expected error on connection failure, got nil")
	}
}

func TestGetMetrics_QueryIsEncoded(t *testing.T) {
	var receivedQuery string
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		receivedQuery = r.URL.RawQuery
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"success","data":{"resultType":"vector","result":[{"metric":{"instance":"localhost:9100"},"value":[1234567890.0,"42.5"]}]}}`))
	}))
	defer server.Close()

	repo := NewPrometheusRepository(server.URL + "?query=")
	repo.GetMetrics(`rate(node_cpu_seconds_total{mode="idle"}[5m])`)

	if receivedQuery == "" {
		t.Fatal("no query received")
	}
	if strings.Contains(receivedQuery, "{") || strings.Contains(receivedQuery, "}") {
		t.Errorf("query was not encoded, raw characters found in: %s", receivedQuery)
	}
}
