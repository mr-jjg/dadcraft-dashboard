package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"dadcraft-dashboard/models"
)

type fakePrometheusRepo struct{
	getMetrics func(string) (models.PrometheusResponse, error)
}

func (f *fakePrometheusRepo) GetMetrics(q string) (models.PrometheusResponse, error) {
	return f.getMetrics(q)
}

func TestHandleMetrics_Success(t *testing.T) {
	r := httptest.NewRequest("GET", "/metrics", nil)
	w := httptest.NewRecorder()
	repo := &fakePrometheusRepo{getMetrics: func(q string) (models.PrometheusResponse, error) {
		return models.PrometheusResponse{
			Status: "success",
			Data: models.Data{
				ResultType: "vector",
				Result: []models.Result{
					{
						Metric: models.Metric{Instance: "host.docker.internal:9100"},
						Value:  json.RawMessage(`[1234567890.123, "47.3"]`),
					},
				},
			},
		}, nil
	}}

	handler := GetMetric(repo, "some_query")
	handler(w, r)

	if w.Code != http.StatusOK {
		t.Errorf("expected status %d, got %d", http.StatusOK, w.Code)
	}
	if w.Header().Get("Content-Type") != "application/json" {
		t.Errorf("expected Content-Type application/json, got %q", w.Header().Get("Content-Type"))
	}

	var result models.MetricValue
	json.NewDecoder(w.Body).Decode(&result)
	if result.Value != 47.3 {
		t.Errorf("expected 47.3, got %f", result.Value)
	}
}

func TestHandleMetrics_RepoError(t *testing.T) {
	r := httptest.NewRequest("GET", "/metrics", nil)
	w := httptest.NewRecorder()
	repo := &fakePrometheusRepo{getMetrics: func(q string) (models.PrometheusResponse, error) {
		return models.PrometheusResponse{}, fmt.Errorf("prometheus unavailable")
	}}

	handler := GetMetric(repo, "some_query")
	handler(w, r)

	if w.Code != http.StatusInternalServerError {
		t.Errorf("expected status %d, got %d", http.StatusInternalServerError, w.Code)
	}
}

func TestGetMetric_ValueError(t *testing.T) {
	r := httptest.NewRequest("GET", "/api/cpu", nil)
	w := httptest.NewRecorder()
	repo := &fakePrometheusRepo{getMetrics: func(q string) (models.PrometheusResponse, error) {
		return models.PrometheusResponse{Status: "success"}, nil
	}}

	handler := GetMetric(repo, "some_query")
	handler(w, r)

	if w.Code != http.StatusInternalServerError {
		t.Errorf("expected status %d, got %d", http.StatusInternalServerError, w.Code)
	}
}
