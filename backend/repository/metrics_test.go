package repository

import (
	"fmt"
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

func TestGetMetricsAt_Success(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if !strings.Contains(r.URL.RawQuery, "time=") {
			t.Errorf("expected time parameter in query, got %s", r.URL.RawQuery)
		}
		w.WriteHeader(http.StatusOK)
		fmt.Fprintln(w, `{"status":"success","data":{"resultType":"vector","result":[{"metric":{"level":"60","class":"Warrior"},"value":[1746100000,"2"]}]}}`)
	}))
	defer server.Close()

	repo := NewPrometheusRepository(server.URL + "/")
	result, err := repo.GetMetricsAt("wow_characters_by_level", 1746100000)

	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if result.Status != "success" {
		t.Errorf("expected status success, got %s", result.Status)
	}
}

func TestGetMetricsAt_NonOKStatus(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusInternalServerError)
	}))
	defer server.Close()

	repo := NewPrometheusRepository(server.URL + "/")
	_, err := repo.GetMetricsAt("wow_characters_by_level", 1746100000)

	if err == nil {
		t.Error("expected error for non-OK status, got nil")
	}
}

func TestGetMetricsAt_ConnectionFailure(t *testing.T) {
	repo := NewPrometheusRepository("http://localhost:0/")
	_, err := repo.GetMetricsAt("wow_characters_by_level", 1746100000)

	if err == nil {
		t.Error("expected error for connection failure, got nil")
	}
}

func TestGetMetricsAt_QueryIsEncoded(t *testing.T) {
	var capturedQuery string
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		capturedQuery = r.URL.RawQuery
		w.WriteHeader(http.StatusOK)
		fmt.Fprintln(w, `{"status":"success","data":{"resultType":"vector","result":[]}}`)
	}))
	defer server.Close()

	repo := NewPrometheusRepository(server.URL + "/")
	repo.GetMetricsAt(`wow_characters_by_level{class="Warrior"}`, 1746100000)

	if !strings.Contains(capturedQuery, "wow_characters_by_level") {
		t.Errorf("expected encoded query in request, got %s", capturedQuery)
	}
	if !strings.Contains(capturedQuery, "time=1746100000") {
		t.Errorf("expected time parameter in request, got %s", capturedQuery)
	}
}
