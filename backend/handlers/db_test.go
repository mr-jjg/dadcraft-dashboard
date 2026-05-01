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
	queryDatabase func(string) (models.TableResult, error)
}

func (f *fakeDBRepo) QueryDatabase(q string) (models.TableResult, error) {
	return f.queryDatabase(q)
}

func TestGetDBQuery_Success(t *testing.T) {
	r := httptest.NewRequest("GET", "/scalar", nil)
	w := httptest.NewRecorder()
	repo := &fakeDBRepo{queryDatabase: func(q string) (models.TableResult, error) {
		return models.TableResult{
			Columns: []string{"race", "count"},
			Rows: [][]string{
				{"Human", "42"},
				{"Orc", "38"},
			},
		}, nil
	}}

	handler := GetDBQuery(repo, "some_query")
	handler(w, r)

	if w.Code != http.StatusOK {
		t.Errorf("expected status %d, got %d", http.StatusOK, w.Code)
	}
	if w.Header().Get("Content-Type") != "application/json" {
		t.Errorf("expected Content-Type application/json, got %q", w.Header().Get("Content-Type"))
	}

	var result models.TableResult
	json.NewDecoder(w.Body).Decode(&result)
	if len(result.Columns) != 2 {
		t.Errorf("expected 2 columns, got %d", len(result.Columns))
	}
	if len(result.Rows) != 2 {
		t.Errorf("expected 2 rows, got %d", len(result.Rows))
	}
	if result.Rows[0][0] != "Human" {
		t.Errorf("expected Human, got %s", result.Rows[0][0])
	}
	if result.Rows[0][1] != "42" {
		t.Errorf("expected 42, got %s", result.Rows[0][1])
	}
}

func TestGetDBQuery_RepoError(t *testing.T) {
	r := httptest.NewRequest("GET", "/scalar", nil)
	w := httptest.NewRecorder()
	repo := &fakeDBRepo{queryDatabase: func(q string) (models.TableResult, error) {
		return models.TableResult{}, fmt.Errorf("db unavailable")
	}}

	handler := GetDBQuery(repo, "some_query")
	handler(w, r)

	if w.Code != http.StatusInternalServerError {
		t.Errorf("expected status %d, got %d", http.StatusInternalServerError, w.Code)
	}
}
