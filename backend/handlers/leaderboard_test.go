package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"dadcraft-dashboard/models"
)

func TestGetLeaderboard_Success(t *testing.T) {
	r := httptest.NewRequest("GET", "/api/leaderboard", nil)
	w := httptest.NewRecorder()

	promRepo := &fakePrometheusRepo{getMetricsRange: func(q string, start, end int64, step int) (models.PrometheusResponse, error) {
		return models.PrometheusResponse{
			Status: "success",
			Data: models.Data{
				ResultType: "matrix",
				Result: []models.Result{
					{
						Metric: models.Metric{"guid": "1555"},
						Values: json.RawMessage(`[[1746100000,"59"],[1746103600,"60"]]`),
					},
					{
						Metric: models.Metric{"guid": "1568"},
						Values: json.RawMessage(`[[1746100000,"59"],[1746107200,"60"]]`),
					},
				},
			},
		}, nil
	}}

	dbRepo := &fakeDBRepo{queryDatabase: func(q string) (models.TableResult, error) {
		return models.TableResult{
			Columns: []string{"guid", "name", "level", "race", "class", "online", "totaltime", "leveltime"},
			Rows: [][]string{
				{"1555", "Keekus", "60", "1", "1", "0", "1301536", "194253"},
				{"1568", "Joana", "60", "7", "8", "1", "1304554", "141404"},
			},
		}, nil
	}}

	handler := GetLeaderboard(promRepo, dbRepo)
	handler(w, r)

	if w.Code != http.StatusOK {
		t.Errorf("expected status %d, got %d", http.StatusOK, w.Code)
	}

	var entries []models.LeaderboardEntry
	json.NewDecoder(w.Body).Decode(&entries)

	if len(entries) != 2 {
		t.Fatalf("expected 2 entries, got %d", len(entries))
	}
	if entries[0].Name != "Keekus" {
		t.Errorf("expected Keekus first, got %s", entries[0].Name)
	}
	if entries[0].DingTime != 1746103600 {
		t.Errorf("expected ding time 1746103600, got %d", entries[0].DingTime)
	}
}

func TestGetLeaderboard_EmptyPrometheus(t *testing.T) {
	r := httptest.NewRequest("GET", "/api/leaderboard", nil)
	w := httptest.NewRecorder()

	promRepo := &fakePrometheusRepo{getMetricsRange: func(q string, start, end int64, step int) (models.PrometheusResponse, error) {
		return models.PrometheusResponse{
			Status: "success",
			Data:   models.Data{ResultType: "matrix", Result: []models.Result{}},
		}, nil
	}}

	dbRepo := &fakeDBRepo{}

	handler := GetLeaderboard(promRepo, dbRepo)
	handler(w, r)

	if w.Code != http.StatusOK {
		t.Errorf("expected status %d, got %d", http.StatusOK, w.Code)
	}

	var entries []models.LeaderboardEntry
	json.NewDecoder(w.Body).Decode(&entries)
	if len(entries) != 0 {
		t.Errorf("expected empty array, got %d entries", len(entries))
	}
}

func TestGetLeaderboard_PrometheusError(t *testing.T) {
	r := httptest.NewRequest("GET", "/api/leaderboard", nil)
	w := httptest.NewRecorder()

	promRepo := &fakePrometheusRepo{getMetricsRange: func(q string, start, end int64, step int) (models.PrometheusResponse, error) {
		return models.PrometheusResponse{}, fmt.Errorf("prometheus unavailable")
	}}

	dbRepo := &fakeDBRepo{}

	handler := GetLeaderboard(promRepo, dbRepo)
	handler(w, r)

	if w.Code != http.StatusInternalServerError {
		t.Errorf("expected status %d, got %d", http.StatusInternalServerError, w.Code)
	}
}

func TestGetLeaderboard_EfficiencyTiebreak(t *testing.T) {
	r := httptest.NewRequest("GET", "/api/leaderboard", nil)
	w := httptest.NewRecorder()

	promRepo := &fakePrometheusRepo{getMetricsRange: func(q string, start, end int64, step int) (models.PrometheusResponse, error) {
		return models.PrometheusResponse{
			Status: "success",
			Data: models.Data{
				ResultType: "matrix",
				Result: []models.Result{
					{
						Metric: models.Metric{"guid": "1555"},
						Values: json.RawMessage(`[[1746103600,"60"]]`),
					},
					{
						Metric: models.Metric{"guid": "1568"},
						Values: json.RawMessage(`[[1746103600,"60"]]`),
					},
				},
			},
		}, nil
	}}

	dbRepo := &fakeDBRepo{queryDatabase: func(q string) (models.TableResult, error) {
		return models.TableResult{
			Columns: []string{"guid", "name", "level", "race", "class", "online", "totaltime", "leveltime"},
			Rows: [][]string{
				{"1555", "Keekus", "60", "1", "1", "0", "1301536", "194253"}, // efficiency: 1107283
				{"1568", "Joana", "60", "7", "8", "1", "1000000", "900000"},  // efficiency: 100000
			},
		}, nil
	}}

	handler := GetLeaderboard(promRepo, dbRepo)
	handler(w, r)

	var entries []models.LeaderboardEntry
	json.NewDecoder(w.Body).Decode(&entries)

	if len(entries) != 2 {
		t.Fatalf("expected 2 entries, got %d", len(entries))
	}
	if entries[0].Name != "Joana" {
		t.Errorf("expected Joana first (more efficient), got %s", entries[0].Name)
	}
}