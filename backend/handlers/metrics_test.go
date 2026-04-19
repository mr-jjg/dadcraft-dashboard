package handlers

import (
	"fmt"
	"net/http/httptest"
	"testing"

	"dadcraft-dashboard/models"
)

type fakeRepo struct{}

func (f *fakeRepo) GetMetrics(q string) (models.PrometheusResponse, error) {
	return models.PrometheusResponse{Status: "success"}, nil
}

type fakeRepoError struct{}

func (f *fakeRepoError) GetMetrics(q string) (models.PrometheusResponse, error) {
	return models.PrometheusResponse{}, fmt.Errorf("prometheus unavailable")
}

func TestHandleMetrics_Success(t *testing.T) {
	r := httptest.NewRequest("GET", "/metrics", nil)
	w := httptest.NewRecorder()

	handler := NewMetricsHandler(&fakeRepo{})
	handler.HandleMetrics(w, r)

	if w.Code != 200 {
		t.Errorf("expected status 200, got %d", w.Code)
	}
	if w.Header().Get("Content-Type") != "application/json" {
		t.Errorf("expected Content-Type application/json, got %q", w.Header().Get("Content-Type"))
	}
}

func TestHandleMetrics_Error(t *testing.T) {
	r := httptest.NewRequest("GET", "/metrics", nil)
	w := httptest.NewRecorder()

	handler := NewMetricsHandler(&fakeRepoError{})
	handler.HandleMetrics(w, r)

	if w.Code != 500 {
		t.Errorf("expected status 500, got %d", w.Code)
	}
}
