package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"dadcraft-dashboard/models"
)

type fakePrometheusRepo struct {
	getMetrics      func(string) (models.PrometheusResponse, error)
	getMetricsRange func(string, int64, int64, int) (models.PrometheusResponse, error)
	getMetricsAt    func(string, int64) (models.PrometheusResponse, error)
}

func (f *fakePrometheusRepo) GetMetrics(q string) (models.PrometheusResponse, error) {
	return f.getMetrics(q)
}

func (f *fakePrometheusRepo) GetMetricsRange(q string, start, end int64, step int) (models.PrometheusResponse, error) {
	return f.getMetricsRange(q, start, end, step)
}

func (f *fakePrometheusRepo) GetMetricsAt(q string, ts int64) (models.PrometheusResponse, error) {
	return f.getMetricsAt(q, ts)
}

func TestParseInt64Param_ValidParam(t *testing.T) {
	r := httptest.NewRequest("GET", "/?start=1234567890", nil)
	result := parseInt64Param(r, "start", 0)
	if result != 1234567890 {
		t.Errorf("expected 1234567890, got %d", result)
	}
}

func TestParseInt64Param_MissingParam(t *testing.T) {
	r := httptest.NewRequest("GET", "/", nil)
	result := parseInt64Param(r, "start", 999)
	if result != 999 {
		t.Errorf("expected default 999, got %d", result)
	}
}

func TestParseInt64Param_InvalidParam(t *testing.T) {
	r := httptest.NewRequest("GET", "/?start=notanumber", nil)
	result := parseInt64Param(r, "start", 999)
	if result != 999 {
		t.Errorf("expected default 999, got %d", result)
	}
}

func successResponse(results []models.Result) (models.PrometheusResponse, error) {
	return models.PrometheusResponse{
		Status: "success",
		Data:   models.Data{ResultType: "vector", Result: results},
	}, nil
}

func TestHandleMetrics_Success(t *testing.T) {
	r := httptest.NewRequest("GET", "/metrics", nil)
	w := httptest.NewRecorder()
	repo := &fakePrometheusRepo{getMetrics: func(q string) (models.PrometheusResponse, error) {
		return successResponse([]models.Result{
			{
				Metric: models.Metric{"instance": "host.docker.internal:9100"},
				Value:  json.RawMessage(`[1234567890.123, "47.3"]`),
			},
		})
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

func TestGetMetricRange_Success(t *testing.T) {
	r := httptest.NewRequest("GET", "/api/system/load1/range", nil)
	w := httptest.NewRecorder()
	repo := &fakePrometheusRepo{getMetricsRange: func(q string, start, end int64, step int) (models.PrometheusResponse, error) {
		return models.PrometheusResponse{
			Status: "success",
			Data: models.Data{
				ResultType: "matrix",
				Result: []models.Result{
					{
						Metric: models.Metric{"instance": "host.docker.internal:9100"},
						Values: json.RawMessage(`[[1714500000,"74.2"],[1714500060,"75.1"]]`),
					},
				},
			},
		}, nil
	}}

	handler := GetMetricRange(repo, "node_load1")
	handler(w, r)

	if w.Code != http.StatusOK {
		t.Errorf("expected status %d, got %d", http.StatusOK, w.Code)
	}
}

func TestGetMetricRange_ParamsPassedToRepo(t *testing.T) {
	var capturedStart, capturedEnd int64
	var capturedStep int

	repo := &fakePrometheusRepo{getMetricsRange: func(q string, start, end int64, step int) (models.PrometheusResponse, error) {
		capturedStart = start
		capturedEnd = end
		capturedStep = step
		return models.PrometheusResponse{
			Status: "success",
			Data: models.Data{
				ResultType: "matrix",
				Result: []models.Result{
					{
						Metric: models.Metric{"instance": "host.docker.internal:9100"},
						Values: json.RawMessage(`[[1714500000,"74.2"]]`),
					},
				},
			},
		}, nil
	}}

	r := httptest.NewRequest("GET", "/api/system/load1/range?start=1000&end=2000&step=60", nil)
	w := httptest.NewRecorder()

	handler := GetMetricRange(repo, "node_load1")
	handler(w, r)

	if w.Code != http.StatusOK {
		t.Errorf("expected status %d, got %d", http.StatusOK, w.Code)
	}
	if capturedStart != 1000 {
		t.Errorf("expected start 1000, got %d", capturedStart)
	}
	if capturedEnd != 2000 {
		t.Errorf("expected end 2000, got %d", capturedEnd)
	}
	if capturedStep != 60 {
		t.Errorf("expected step 60, got %d", capturedStep)
	}
}

func TestGetMetricRange_EmptyResult(t *testing.T) {
	repo := &fakePrometheusRepo{getMetricsRange: func(q string, start, end int64, step int) (models.PrometheusResponse, error) {
		return models.PrometheusResponse{
			Status: "success",
			Data:   models.Data{ResultType: "matrix", Result: []models.Result{}},
		}, nil
	}}

	r := httptest.NewRequest("GET", "/api/system/load1/range", nil)
	w := httptest.NewRecorder()

	handler := GetMetricRange(repo, "node_load1")
	handler(w, r)

	if w.Code != http.StatusOK {
		t.Errorf("expected status %d, got %d", http.StatusOK, w.Code)
	}

	var result [][2]float64
	json.NewDecoder(w.Body).Decode(&result)
	if len(result) != 0 {
		t.Errorf("expected empty array, got %v", result)
	}
}

func TestGetMetricRange_RepoError(t *testing.T) {
	r := httptest.NewRequest("GET", "/api/system/load1/range", nil)
	w := httptest.NewRecorder()
	repo := &fakePrometheusRepo{getMetricsRange: func(q string, start, end int64, step int) (models.PrometheusResponse, error) {
		return models.PrometheusResponse{}, fmt.Errorf("prometheus down")
	}}

	handler := GetMetricRange(repo, "node_load1")
	handler(w, r)

	if w.Code != http.StatusInternalServerError {
		t.Errorf("expected status %d, got %d", http.StatusInternalServerError, w.Code)
	}
}
