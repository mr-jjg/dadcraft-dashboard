package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"dadcraft-dashboard/models"
)

type fakePrometheusRepo struct{
	getMetrics func(string) (models.PrometheusResponse, error)
	getMetricsRange func(string, int64, int64, int) (models.PrometheusResponse, error)
	getMetricsAt func(string, int64) (models.PrometheusResponse, error)
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
						Metric:  models.Metric{"instance": "host.docker.internal:9100"},
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

func TestGetProgression_DefaultTimestamp(t *testing.T) {
	r := httptest.NewRequest("GET", "/api/progression", nil)
	w := httptest.NewRecorder()
	repo := &fakePrometheusRepo{getMetricsAt: func(q string, ts int64) (models.PrometheusResponse, error) {
		if ts == 0 {
			t.Errorf("expected non-zero timestamp, got 0")
		}
		return successResponse([]models.Result{
			{
				Metric: models.Metric{"level": "60", "class": "Warrior"},
				Value:  json.RawMessage(`[1746100000, "2"]`),
			},
		})
	}}

	handler := GetProgression(repo)
	handler(w, r)

	if w.Code != http.StatusOK {
		t.Errorf("expected status %d, got %d", http.StatusOK, w.Code)
	}
}

func TestGetProgression_ExplicitTimestamp(t *testing.T) {
	r := httptest.NewRequest("GET", "/api/progression?time=1746100000", nil)
	w := httptest.NewRecorder()
	repo := &fakePrometheusRepo{getMetricsAt: func(q string, ts int64) (models.PrometheusResponse, error) {
		if ts != 1746100000 {
			t.Errorf("expected ts 1746100000, got %d", ts)
		}
		return successResponse([]models.Result{
			{
				Metric: models.Metric{"level": "60", "class": "Warrior"},
				Value:  json.RawMessage(`[1746100000, "2"]`),
			},
		})
	}}

	handler := GetProgression(repo)
	handler(w, r)

	if w.Code != http.StatusOK {
		t.Errorf("expected status %d, got %d", http.StatusOK, w.Code)
	}
}

func TestGetProgression_InvalidTimestamp(t *testing.T) {
	r := httptest.NewRequest("GET", "/api/progression?time=notanumber", nil)
	w := httptest.NewRecorder()
	repo := &fakePrometheusRepo{}

	handler := GetProgression(repo)
	handler(w, r)

	if w.Code != http.StatusBadRequest {
		t.Errorf("expected status %d, got %d", http.StatusBadRequest, w.Code)
	}
}

func TestGetProgression_OnlineFilter(t *testing.T) {
	r := httptest.NewRequest("GET", "/api/progression?online=true", nil)
	w := httptest.NewRecorder()
	repo := &fakePrometheusRepo{getMetricsAt: func(q string, ts int64) (models.PrometheusResponse, error) {
		if !strings.Contains(q, `online="true"`) {
			t.Errorf("expected online filter in query, got %s", q)
		}
		return successResponse([]models.Result{
			{
				Metric: models.Metric{"level": "60", "class": "Warrior"},
				Value:  json.RawMessage(`[1746100000, "1"]`),
			},
		})
	}}

	handler := GetProgression(repo)
	handler(w, r)

	if w.Code != http.StatusOK {
		t.Errorf("expected status %d, got %d", http.StatusOK, w.Code)
	}
}

func TestGetProgression_FactionAlliance(t *testing.T) {
	r := httptest.NewRequest("GET", "/api/progression?faction=alliance", nil)
	w := httptest.NewRecorder()
	repo := &fakePrometheusRepo{getMetricsAt: func(q string, ts int64) (models.PrometheusResponse, error) {
		if !strings.Contains(q, "Human|Dwarf|Night Elf|Gnome") {
			t.Errorf("expected alliance races in query, got %s", q)
		}
		return successResponse([]models.Result{
			{
				Metric: models.Metric{"level": "60", "class": "Paladin"},
				Value:  json.RawMessage(`[1746100000, "1"]`),
			},
		})
	}}

	handler := GetProgression(repo)
	handler(w, r)

	if w.Code != http.StatusOK {
		t.Errorf("expected status %d, got %d", http.StatusOK, w.Code)
	}
}

func TestGetProgression_FactionHorde(t *testing.T) {
	r := httptest.NewRequest("GET", "/api/progression?faction=horde", nil)
	w := httptest.NewRecorder()
	repo := &fakePrometheusRepo{getMetricsAt: func(q string, ts int64) (models.PrometheusResponse, error) {
		if !strings.Contains(q, "Orc|Undead|Tauren|Troll") {
			t.Errorf("expected horde races in query, got %s", q)
		}
		return successResponse([]models.Result{
			{
				Metric: models.Metric{"level": "60", "class": "Shaman"},
				Value:  json.RawMessage(`[1746100000, "1"]`),
			},
		})
	}}

	handler := GetProgression(repo)
	handler(w, r)

	if w.Code != http.StatusOK {
		t.Errorf("expected status %d, got %d", http.StatusOK, w.Code)
	}
}

func TestGetProgression_RaceOverridesFaction(t *testing.T) {
	r := httptest.NewRequest("GET", "/api/progression?faction=alliance&race=Orc,Troll", nil)
	w := httptest.NewRecorder()
	repo := &fakePrometheusRepo{getMetricsAt: func(q string, ts int64) (models.PrometheusResponse, error) {
		if strings.Contains(q, "Human|Dwarf|Night Elf|Gnome") {
			t.Errorf("faction should be overridden by race param, got %s", q)
		}
		if !strings.Contains(q, "Orc|Troll") {
			t.Errorf("expected race filter in query, got %s", q)
		}
		return successResponse([]models.Result{
			{
				Metric: models.Metric{"level": "60", "class": "Shaman"},
				Value:  json.RawMessage(`[1746100000, "1"]`),
			},
		})
	}}

	handler := GetProgression(repo)
	handler(w, r)

	if w.Code != http.StatusOK {
		t.Errorf("expected status %d, got %d", http.StatusOK, w.Code)
	}
}

func TestGetProgression_ClassFilter(t *testing.T) {
	r := httptest.NewRequest("GET", "/api/progression?class=Warrior,Mage", nil)
	w := httptest.NewRecorder()
	repo := &fakePrometheusRepo{getMetricsAt: func(q string, ts int64) (models.PrometheusResponse, error) {
		if !strings.Contains(q, "Warrior|Mage") {
			t.Errorf("expected class filter in query, got %s", q)
		}
		return successResponse([]models.Result{
			{
				Metric: models.Metric{"level": "60", "class": "Warrior"},
				Value:  json.RawMessage(`[1746100000, "1"]`),
			},
		})
	}}

	handler := GetProgression(repo)
	handler(w, r)

	if w.Code != http.StatusOK {
		t.Errorf("expected status %d, got %d", http.StatusOK, w.Code)
	}
}

func TestGetProgression_RepoError(t *testing.T) {
	r := httptest.NewRequest("GET", "/api/progression", nil)
	w := httptest.NewRecorder()
	repo := &fakePrometheusRepo{getMetricsAt: func(q string, ts int64) (models.PrometheusResponse, error) {
		return models.PrometheusResponse{}, fmt.Errorf("prometheus unavailable")
	}}

	handler := GetProgression(repo)
	handler(w, r)

	if w.Code != http.StatusInternalServerError {
		t.Errorf("expected status %d, got %d", http.StatusInternalServerError, w.Code)
	}
}

func TestGetProgression_EmptyResult(t *testing.T) {
	r := httptest.NewRequest("GET", "/api/progression", nil)
	w := httptest.NewRecorder()
	repo := &fakePrometheusRepo{getMetricsAt: func(q string, ts int64) (models.PrometheusResponse, error) {
		return models.PrometheusResponse{
			Status: "success",
			Data:   models.Data{ResultType: "vector", Result: []models.Result{}},
		}, nil
	}}

	handler := GetProgression(repo)
	handler(w, r)

	if w.Code != http.StatusOK {
		t.Errorf("expected status %d, got %d", http.StatusOK, w.Code)
	}

	var result []models.LabeledValue
	json.NewDecoder(w.Body).Decode(&result)
	if len(result) != 0 {
		t.Errorf("expected empty array, got %d items", len(result))
	}
}

func TestGetProgressionTimestamps_Success(t *testing.T) {
	r := httptest.NewRequest("GET", "/api/progression/timestamps", nil)
	w := httptest.NewRecorder()
	repo := &fakePrometheusRepo{getMetricsRange: func(q string, start, end int64, step int) (models.PrometheusResponse, error) {
		return models.PrometheusResponse{
			Status: "success",
			Data: models.Data{
				ResultType: "matrix",
				Result: []models.Result{
					{
						Values: json.RawMessage(`[[1777865100,"192"],[1777871040,"191"]]`),
					},
				},
			},
		}, nil
	}}

	handler := GetProgressionTimestamps(repo)
	handler(w, r)

	if w.Code != http.StatusOK {
		t.Errorf("expected status %d, got %d", http.StatusOK, w.Code)
	}

	var timestamps []int64
	json.NewDecoder(w.Body).Decode(&timestamps)
	if len(timestamps) != 2 {
		t.Fatalf("expected 2 timestamps, got %d", len(timestamps))
	}
	if timestamps[0] != 1777865100 {
		t.Errorf("expected 1777865100, got %d", timestamps[0])
	}
}

func TestGetProgressionTimestamps_RepoError(t *testing.T) {
	r := httptest.NewRequest("GET", "/api/progression/timestamps", nil)
	w := httptest.NewRecorder()
	repo := &fakePrometheusRepo{getMetricsRange: func(q string, start, end int64, step int) (models.PrometheusResponse, error) {
		return models.PrometheusResponse{}, fmt.Errorf("prometheus unavailable")
	}}

	handler := GetProgressionTimestamps(repo)
	handler(w, r)

	if w.Code != http.StatusInternalServerError {
		t.Errorf("expected status %d, got %d", http.StatusInternalServerError, w.Code)
	}
}

func TestGetProgressionTimestamps_EmptyResult(t *testing.T) {
	r := httptest.NewRequest("GET", "/api/progression/timestamps", nil)
	w := httptest.NewRecorder()
	repo := &fakePrometheusRepo{getMetricsRange: func(q string, start, end int64, step int) (models.PrometheusResponse, error) {
		return models.PrometheusResponse{
			Status: "success",
			Data:   models.Data{ResultType: "matrix", Result: []models.Result{}},
		}, nil
	}}

	handler := GetProgressionTimestamps(repo)
	handler(w, r)

	if w.Code != http.StatusInternalServerError {
		t.Errorf("expected status %d, got %d", http.StatusInternalServerError, w.Code)
	}
}
