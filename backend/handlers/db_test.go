package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"dadcraft-dashboard/models"
)

type fakeDBRepo struct{
	queryScalar       func(string) (float64, error)
	queryDistribution func(string) ([]models.LabeledValue, error)
}

func (f *fakeDBRepo) QueryScalar(q string) (float64, error) {
	return f.queryScalar(q)
}

func (f *fakeDBRepo) QueryDistribution(q string) ([]models.LabeledValue, error) {
    return f.queryDistribution(q)
}

func TestGetDBScalar_Success(t *testing.T) {
	r := httptest.NewRequest("GET", "/scalar", nil)
	w := httptest.NewRecorder()
	repo := &fakeDBRepo{queryScalar: func(q string) (float64, error) {
		return 427.26, nil
	}}

	handler := GetDBScalar(repo, "some_query")
	handler(w, r)

	if w.Code != http.StatusOK {
		t.Errorf("expected status %d, got %d", http.StatusOK, w.Code)
	}
	if w.Header().Get("Content-Type") != "application/json" {
		t.Errorf("expected Content-Type application/json, got %q", w.Header().Get("Content-Type"))
	}

	var result models.MetricValue
	json.NewDecoder(w.Body).Decode(&result)
	if result.Value != 427.26 {
		t.Errorf("expected 427.26, got %f", result.Value)
	}
}

func TestGetDBScalar_RepoError(t *testing.T) {
	r := httptest.NewRequest("GET", "/scalar", nil)
	w := httptest.NewRecorder()
	repo := &fakeDBRepo{queryScalar: func(q string) (float64, error) {
		return 0, fmt.Errorf("db unavailable")
	}}

	handler := GetDBScalar(repo, "some_query")
	handler(w, r)

	if w.Code != http.StatusInternalServerError {
		t.Errorf("expected status %d, got %d", http.StatusInternalServerError, w.Code)
	}
}

func TestGetDBDistribution_Success(t *testing.T) {
	r := httptest.NewRequest("GET", "/distribution", nil)
	w := httptest.NewRecorder()
	repo := &fakeDBRepo{queryDistribution: func(q string) ([]models.LabeledValue, error) {
		return []models.LabeledValue{
			{Label: "Human", Value: 42},
			{Label: "Orc", Value: 38},
		}, nil
	}}

	handler := GetDBDistribution(repo, "some_query")
	handler(w, r)

	if w.Code != http.StatusOK {
		t.Errorf("expected status %d, got %d", http.StatusOK, w.Code)
	}
	if w.Header().Get("Content-Type") != "application/json" {
		t.Errorf("expected Content-Type application/json, got %q", w.Header().Get("Content-Type"))
	}

	var result []models.LabeledValue
	json.NewDecoder(w.Body).Decode(&result)
	if len(result) != 2 {
		t.Errorf("expected 2 rows, got %d", len(result))
	}
	if result[0].Label != "Human" {
		t.Errorf("expected Human, got %s", result[0].Label)
	}
	if result[0].Value != 42 {
		t.Errorf("expected 42, got %f", result[0].Value)
	}
}

func TestGetDBDistribution_RepoError(t *testing.T) {
	r := httptest.NewRequest("GET", "/distribution", nil)
	w := httptest.NewRecorder()
	repo := &fakeDBRepo{queryDistribution: func(q string) ([]models.LabeledValue, error) {
		return nil, fmt.Errorf("db unavailable")
	}}

	handler := GetDBDistribution(repo, "some_query")
	handler(w, r)

	if w.Code != http.StatusInternalServerError {
		t.Errorf("expected status %d, got %d", http.StatusInternalServerError, w.Code)
	}
}
