package handlers

import (
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"dadcraft-dashboard/models"
)

func TestProgressionExporter_Success(t *testing.T) {
	r := httptest.NewRequest("GET", "/metrics/progression", nil)
	w := httptest.NewRecorder()
	repo := &fakeDBRepo{queryDatabase: func(q string) (models.TableResult, error) {
		return models.TableResult{
			Columns: []string{"level", "Race", "Class", "online", "Count"},
			Rows: [][]string{
				{"60", "Human", "Warrior", "1", "2"},
				{"59", "Orc", "Hunter", "0", "1"},
			},
		}, nil
	}}

	handler := ProgressionExporter(repo)
	handler(w, r)

	if w.Code != http.StatusOK {
		t.Errorf("expected status %d, got %d", http.StatusOK, w.Code)
	}
	if !strings.Contains(w.Body.String(), "wow_characters_by_level") {
		t.Errorf("expected Prometheus metric name in response body")
	}
}

func TestProgressionExporter_RepoError(t *testing.T) {
	r := httptest.NewRequest("GET", "/metrics/progression", nil)
	w := httptest.NewRecorder()
	repo := &fakeDBRepo{queryDatabase: func(q string) (models.TableResult, error) {
		return models.TableResult{}, fmt.Errorf("db unavailable")
	}}

	handler := ProgressionExporter(repo)
	handler(w, r)

	if w.Code != http.StatusInternalServerError {
		t.Errorf("expected status %d, got %d", http.StatusInternalServerError, w.Code)
	}
}
