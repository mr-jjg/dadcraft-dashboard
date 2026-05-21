package handlers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"dadcraft-dashboard/models"
)

// ---------------------------------------------------------------------------
// GetCharacterFields
// ---------------------------------------------------------------------------

func TestGetCharacterFields_ReturnsOK(t *testing.T) {
	r := httptest.NewRequest(http.MethodGet, "/api/character/fields", nil)
	w := httptest.NewRecorder()

	GetCharacterFields()(w, r)

	if w.Code != http.StatusOK {
		t.Errorf("expected status %d, got %d", http.StatusOK, w.Code)
	}
}

func TestGetCharacterFields_ContentType(t *testing.T) {
	r := httptest.NewRequest(http.MethodGet, "/api/character/fields", nil)
	w := httptest.NewRecorder()

	GetCharacterFields()(w, r)

	if w.Header().Get("Content-Type") != "application/json" {
		t.Errorf("expected Content-Type application/json, got %q", w.Header().Get("Content-Type"))
	}
}

func TestGetCharacterFields_DecodesAsFieldDefs(t *testing.T) {
	r := httptest.NewRequest(http.MethodGet, "/api/character/fields", nil)
	w := httptest.NewRecorder()

	GetCharacterFields()(w, r)

	var fields []models.FieldDef
	if err := json.NewDecoder(w.Body).Decode(&fields); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}
	if len(fields) == 0 {
		t.Error("expected at least one field definition in response")
	}
}

func TestGetCharacterFields_ContainsExpectedFields(t *testing.T) {
	r := httptest.NewRequest(http.MethodGet, "/api/character/fields", nil)
	w := httptest.NewRecorder()

	GetCharacterFields()(w, r)

	var fields []models.FieldDef
	json.NewDecoder(w.Body).Decode(&fields)

	fieldNames := make(map[string]bool)
	for _, f := range fields {
		fieldNames[f.Field] = true
	}

	required := []string{"name", "level", "race", "class", "guild", "online"}
	for _, name := range required {
		if !fieldNames[name] {
			t.Errorf("expected field %q in response", name)
		}
	}
}

// ---------------------------------------------------------------------------
// PostCharacterSearch - method guard
// ---------------------------------------------------------------------------

func TestPostCharacterSearch_RejectsGET(t *testing.T) {
	repo := &fakeDBRepo{}
	r := httptest.NewRequest(http.MethodGet, "/api/character/search", nil)
	w := httptest.NewRecorder()

	PostCharacterSearch(repo)(w, r)

	if w.Code != http.StatusMethodNotAllowed {
		t.Errorf("expected status %d, got %d", http.StatusMethodNotAllowed, w.Code)
	}
}

// ---------------------------------------------------------------------------
// PostCharacterSearch - request validation
// ---------------------------------------------------------------------------

func TestPostCharacterSearch_RejectsMalformedJSON(t *testing.T) {
	repo := &fakeDBRepo{}
	r := httptest.NewRequest(http.MethodPost, "/api/character/search", strings.NewReader("{bad json"))
	w := httptest.NewRecorder()

	PostCharacterSearch(repo)(w, r)

	if w.Code != http.StatusBadRequest {
		t.Errorf("expected status %d, got %d", http.StatusBadRequest, w.Code)
	}
}

func TestPostCharacterSearch_RejectsUnknownField(t *testing.T) {
	repo := &fakeDBRepo{}
	body := searchBody(t, []models.CharacterFilter{
		{Field: "nonexistent_column", Op: "like", Value: "test"},
	}, 10)
	r := httptest.NewRequest(http.MethodPost, "/api/character/search", body)
	w := httptest.NewRecorder()

	PostCharacterSearch(repo)(w, r)

	if w.Code != http.StatusBadRequest {
		t.Errorf("expected status %d, got %d", http.StatusBadRequest, w.Code)
	}
}

func TestPostCharacterSearch_RejectsEmptyStringValue(t *testing.T) {
	repo := &fakeDBRepo{}
	body := searchBody(t, []models.CharacterFilter{
		{Field: "name", Op: "like", Value: ""},
	}, 10)
	r := httptest.NewRequest(http.MethodPost, "/api/character/search", body)
	w := httptest.NewRecorder()

	PostCharacterSearch(repo)(w, r)

	if w.Code != http.StatusBadRequest {
		t.Errorf("expected status %d, got %d", http.StatusBadRequest, w.Code)
	}
}

func TestPostCharacterSearch_RejectsRangeWithNoMinOrMax(t *testing.T) {
	repo := &fakeDBRepo{}
	body := searchBody(t, []models.CharacterFilter{
		{Field: "level", Op: "range"},
	}, 10)
	r := httptest.NewRequest(http.MethodPost, "/api/character/search", body)
	w := httptest.NewRecorder()

	PostCharacterSearch(repo)(w, r)

	if w.Code != http.StatusBadRequest {
		t.Errorf("expected status %d, got %d", http.StatusBadRequest, w.Code)
	}
}

func TestPostCharacterSearch_RejectsRangeWithMinGreaterThanMax(t *testing.T) {
	repo := &fakeDBRepo{}
	min, max := 60, 1
	body := searchBody(t, []models.CharacterFilter{
		{Field: "level", Op: "range", Min: &min, Max: &max},
	}, 10)
	r := httptest.NewRequest(http.MethodPost, "/api/character/search", body)
	w := httptest.NewRecorder()

	PostCharacterSearch(repo)(w, r)

	if w.Code != http.StatusBadRequest {
		t.Errorf("expected status %d, got %d", http.StatusBadRequest, w.Code)
	}
}

func TestPostCharacterSearch_RejectsEnumWithNoValues(t *testing.T) {
	repo := &fakeDBRepo{}
	body := searchBody(t, []models.CharacterFilter{
		{Field: "race", Op: "in", Values: []string{}},
	}, 10)
	r := httptest.NewRequest(http.MethodPost, "/api/character/search", body)
	w := httptest.NewRecorder()

	PostCharacterSearch(repo)(w, r)

	if w.Code != http.StatusBadRequest {
		t.Errorf("expected status %d, got %d", http.StatusBadRequest, w.Code)
	}
}

func TestPostCharacterSearch_RejectsEnumWithInvalidValue(t *testing.T) {
	repo := &fakeDBRepo{}
	body := searchBody(t, []models.CharacterFilter{
		{Field: "race", Op: "in", Values: []string{"Vulpera"}},
	}, 10)
	r := httptest.NewRequest(http.MethodPost, "/api/character/search", body)
	w := httptest.NewRecorder()

	PostCharacterSearch(repo)(w, r)

	if w.Code != http.StatusBadRequest {
		t.Errorf("expected status %d, got %d", http.StatusBadRequest, w.Code)
	}
}

func TestPostCharacterSearch_RejectsBooleanInvalidValue(t *testing.T) {
	repo := &fakeDBRepo{}
	body := searchBody(t, []models.CharacterFilter{
		{Field: "online", Op: "eq", Value: "yes"},
	}, 10)
	r := httptest.NewRequest(http.MethodPost, "/api/character/search", body)
	w := httptest.NewRecorder()

	PostCharacterSearch(repo)(w, r)

	if w.Code != http.StatusBadRequest {
		t.Errorf("expected status %d, got %d", http.StatusBadRequest, w.Code)
	}
}

// ---------------------------------------------------------------------------
// PostCharacterSearch - ORDER BY
// ---------------------------------------------------------------------------

func TestPostCharacterSearch_OrderByValidField(t *testing.T) {
	var capturedQuery string
	repo := &fakeDBRepo{queryDatabase: func(q string, args ...any) (models.TableResult, error) {
		capturedQuery = q
		return models.TableResult{}, nil
	}}

	req := models.CharacterSearchRequest{Limit: 10, OrderBy: "level", OrderDir: "asc"}
	b, _ := json.Marshal(req)
	r := httptest.NewRequest(http.MethodPost, "/api/character/search", bytes.NewBuffer(b))
	w := httptest.NewRecorder()

	PostCharacterSearch(repo)(w, r)

	if w.Code != http.StatusOK {
		t.Errorf("expected status %d, got %d", http.StatusOK, w.Code)
	}
	if !strings.Contains(capturedQuery, "ORDER BY level ASC") {
		t.Errorf("expected ORDER BY level ASC in query, got: %s", capturedQuery)
	}
}

func TestPostCharacterSearch_OrderByDesc(t *testing.T) {
	var capturedQuery string
	repo := &fakeDBRepo{queryDatabase: func(q string, args ...any) (models.TableResult, error) {
		capturedQuery = q
		return models.TableResult{}, nil
	}}

	req := models.CharacterSearchRequest{Limit: 10, OrderBy: "level", OrderDir: "desc"}
	b, _ := json.Marshal(req)
	r := httptest.NewRequest(http.MethodPost, "/api/character/search", bytes.NewBuffer(b))
	w := httptest.NewRecorder()

	PostCharacterSearch(repo)(w, r)

	if !strings.Contains(capturedQuery, "ORDER BY level DESC") {
		t.Errorf("expected ORDER BY level DESC in query, got: %s", capturedQuery)
	}
}

func TestPostCharacterSearch_OrderByUnknownFieldIgnored(t *testing.T) {
	var capturedQuery string
	repo := &fakeDBRepo{queryDatabase: func(q string, args ...any) (models.TableResult, error) {
		capturedQuery = q
		return models.TableResult{}, nil
	}}

	req := models.CharacterSearchRequest{Limit: 10, OrderBy: "nonexistent_column", OrderDir: "asc"}
	b, _ := json.Marshal(req)
	r := httptest.NewRequest(http.MethodPost, "/api/character/search", bytes.NewBuffer(b))
	w := httptest.NewRecorder()

	PostCharacterSearch(repo)(w, r)

	if w.Code != http.StatusOK {
		t.Errorf("expected status %d, got %d", http.StatusOK, w.Code)
	}
	if strings.Contains(capturedQuery, "ORDER BY") {
		t.Errorf("expected no ORDER BY for unknown field, got: %s", capturedQuery)
	}
}

func TestPostCharacterSearch_NoOrderByProducesNoOrderClause(t *testing.T) {
	var capturedQuery string
	repo := &fakeDBRepo{queryDatabase: func(q string, args ...any) (models.TableResult, error) {
		capturedQuery = q
		return models.TableResult{}, nil
	}}

	body := searchBody(t, nil, 10)
	r := httptest.NewRequest(http.MethodPost, "/api/character/search", body)
	w := httptest.NewRecorder()

	PostCharacterSearch(repo)(w, r)

	if strings.Contains(capturedQuery, "ORDER BY") {
		t.Errorf("expected no ORDER BY in query, got: %s", capturedQuery)
	}
}

// ---------------------------------------------------------------------------
// PostCharacterSearch - happy paths
// ---------------------------------------------------------------------------

func TestPostCharacterSearch_NoFiltersCallsRepo(t *testing.T) {
	called := false
	repo := &fakeDBRepo{queryDatabase: func(q string, args ...any) (models.TableResult, error) {
		called = true
		return models.TableResult{Columns: []string{"name"}, Rows: [][]string{}}, nil
	}}

	body := searchBody(t, nil, 10)
	r := httptest.NewRequest(http.MethodPost, "/api/character/search", body)
	w := httptest.NewRecorder()

	PostCharacterSearch(repo)(w, r)

	if w.Code != http.StatusOK {
		t.Errorf("expected status %d, got %d", http.StatusOK, w.Code)
	}
	if !called {
		t.Error("expected repo.QueryDatabase to be called")
	}
}

func TestPostCharacterSearch_StringFilter(t *testing.T) {
	var capturedQuery string
	var capturedArgs []any
	repo := &fakeDBRepo{queryDatabase: func(q string, args ...any) (models.TableResult, error) {
		capturedQuery = q
		capturedArgs = args
		return models.TableResult{Columns: []string{"name"}, Rows: [][]string{}}, nil
	}}

	body := searchBody(t, []models.CharacterFilter{
		{Field: "name", Op: "like", Value: "Aeth"},
	}, 10)
	r := httptest.NewRequest(http.MethodPost, "/api/character/search", body)
	w := httptest.NewRecorder()

	PostCharacterSearch(repo)(w, r)

	if w.Code != http.StatusOK {
		t.Errorf("expected status %d, got %d", http.StatusOK, w.Code)
	}
	if !strings.Contains(capturedQuery, "name LIKE ?") {
		t.Errorf("expected LIKE clause in query, got: %s", capturedQuery)
	}
	if len(capturedArgs) != 1 || capturedArgs[0] != "%Aeth%" {
		t.Errorf("expected arg %%Aeth%%, got %v", capturedArgs)
	}
}

func TestPostCharacterSearch_StringInFilter_SingleZone(t *testing.T) {
	var capturedQuery string
	var capturedArgs []any
	repo := &fakeDBRepo{queryDatabase: func(q string, args ...any) (models.TableResult, error) {
		capturedQuery = q
		capturedArgs = args
		return models.TableResult{}, nil
	}}

	body := searchBody(t, []models.CharacterFilter{
		{Field: "zone", Op: "in", Values: []string{"Stranglethorn"}},
	}, 10)
	r := httptest.NewRequest(http.MethodPost, "/api/character/search", body)
	w := httptest.NewRecorder()

	PostCharacterSearch(repo)(w, r)

	if w.Code != http.StatusOK {
		t.Errorf("expected status %d, got %d", http.StatusOK, w.Code)
	}
	if !strings.Contains(capturedQuery, "zone LIKE ?") {
		t.Errorf("expected LIKE clause, got: %s", capturedQuery)
	}
	if len(capturedArgs) != 1 || capturedArgs[0] != "%Stranglethorn%" {
		t.Errorf("expected arg %%Stranglethorn%%, got %v", capturedArgs)
	}
}

func TestPostCharacterSearch_StringInFilter_MultipleZones(t *testing.T) {
	var capturedQuery string
	var capturedArgs []any
	repo := &fakeDBRepo{queryDatabase: func(q string, args ...any) (models.TableResult, error) {
		capturedQuery = q
		capturedArgs = args
		return models.TableResult{}, nil
	}}

	body := searchBody(t, []models.CharacterFilter{
		{Field: "zone", Op: "in", Values: []string{"Stranglethorn", "Ironforge"}},
	}, 10)
	r := httptest.NewRequest(http.MethodPost, "/api/character/search", body)
	w := httptest.NewRecorder()

	PostCharacterSearch(repo)(w, r)

	if w.Code != http.StatusOK {
		t.Errorf("expected status %d, got %d", http.StatusOK, w.Code)
	}
	if !strings.Contains(capturedQuery, "(zone LIKE ? OR zone LIKE ?)") {
		t.Errorf("expected OR LIKE clause, got: %s", capturedQuery)
	}
	if len(capturedArgs) != 2 {
		t.Errorf("expected 2 args, got %d", len(capturedArgs))
	}
	if capturedArgs[0] != "%Stranglethorn%" || capturedArgs[1] != "%Ironforge%" {
		t.Errorf("unexpected args: %v", capturedArgs)
	}
}

func TestPostCharacterSearch_StringInFilter_EmptyValuesRejected(t *testing.T) {
	repo := &fakeDBRepo{}
	body := searchBody(t, []models.CharacterFilter{
		{Field: "zone", Op: "in", Values: []string{}},
	}, 10)
	r := httptest.NewRequest(http.MethodPost, "/api/character/search", body)
	w := httptest.NewRecorder()

	PostCharacterSearch(repo)(w, r)

	if w.Code != http.StatusBadRequest {
		t.Errorf("expected status %d, got %d", http.StatusBadRequest, w.Code)
	}
}

func TestPostCharacterSearch_RangeFilter_BothBounds(t *testing.T) {
	var capturedQuery string
	var capturedArgs []any
	repo := &fakeDBRepo{queryDatabase: func(q string, args ...any) (models.TableResult, error) {
		capturedQuery = q
		capturedArgs = args
		return models.TableResult{Columns: []string{"name"}, Rows: [][]string{}}, nil
	}}

	min, max := 20, 40
	body := searchBody(t, []models.CharacterFilter{
		{Field: "level", Op: "range", Min: &min, Max: &max},
	}, 10)
	r := httptest.NewRequest(http.MethodPost, "/api/character/search", body)
	w := httptest.NewRecorder()

	PostCharacterSearch(repo)(w, r)

	if w.Code != http.StatusOK {
		t.Errorf("expected status %d, got %d", http.StatusOK, w.Code)
	}
	if !strings.Contains(capturedQuery, "level >= ?") {
		t.Errorf("expected >= clause, got: %s", capturedQuery)
	}
	if !strings.Contains(capturedQuery, "level <= ?") {
		t.Errorf("expected <= clause, got: %s", capturedQuery)
	}
	if len(capturedArgs) != 2 {
		t.Errorf("expected 2 args, got %d", len(capturedArgs))
	}
}

func TestPostCharacterSearch_RangeFilter_MinOnly(t *testing.T) {
	var capturedQuery string
	repo := &fakeDBRepo{queryDatabase: func(q string, args ...any) (models.TableResult, error) {
		capturedQuery = q
		return models.TableResult{}, nil
	}}

	min := 30
	body := searchBody(t, []models.CharacterFilter{
		{Field: "level", Op: "range", Min: &min},
	}, 10)
	r := httptest.NewRequest(http.MethodPost, "/api/character/search", body)
	w := httptest.NewRecorder()

	PostCharacterSearch(repo)(w, r)

	if w.Code != http.StatusOK {
		t.Errorf("expected status %d, got %d", http.StatusOK, w.Code)
	}
	if strings.Contains(capturedQuery, "<=") {
		t.Errorf("did not expect <= clause with min-only range, got: %s", capturedQuery)
	}
}

func TestPostCharacterSearch_EnumFilter(t *testing.T) {
	var capturedQuery string
	var capturedArgs []any
	repo := &fakeDBRepo{queryDatabase: func(q string, args ...any) (models.TableResult, error) {
		capturedQuery = q
		capturedArgs = args
		return models.TableResult{}, nil
	}}

	body := searchBody(t, []models.CharacterFilter{
		{Field: "race", Op: "in", Values: []string{"Human", "Dwarf"}},
	}, 10)
	r := httptest.NewRequest(http.MethodPost, "/api/character/search", body)
	w := httptest.NewRecorder()

	PostCharacterSearch(repo)(w, r)

	if w.Code != http.StatusOK {
		t.Errorf("expected status %d, got %d", http.StatusOK, w.Code)
	}
	if !strings.Contains(capturedQuery, "race IN (?,?)") {
		t.Errorf("expected IN clause, got: %s", capturedQuery)
	}
	if len(capturedArgs) != 2 {
		t.Errorf("expected 2 args, got %d", len(capturedArgs))
	}
}

func TestPostCharacterSearch_BooleanFilter(t *testing.T) {
	var capturedQuery string
	var capturedArgs []any
	repo := &fakeDBRepo{queryDatabase: func(q string, args ...any) (models.TableResult, error) {
		capturedQuery = q
		capturedArgs = args
		return models.TableResult{}, nil
	}}

	body := searchBody(t, []models.CharacterFilter{
		{Field: "online", Op: "eq", Value: "1"},
	}, 10)
	r := httptest.NewRequest(http.MethodPost, "/api/character/search", body)
	w := httptest.NewRecorder()

	PostCharacterSearch(repo)(w, r)

	if w.Code != http.StatusOK {
		t.Errorf("expected status %d, got %d", http.StatusOK, w.Code)
	}
	if !strings.Contains(capturedQuery, "online = ?") {
		t.Errorf("expected = clause, got: %s", capturedQuery)
	}
	if len(capturedArgs) != 1 || capturedArgs[0] != "1" {
		t.Errorf("expected arg \"1\", got %v", capturedArgs)
	}
}

func TestPostCharacterSearch_MultipleFilters(t *testing.T) {
	var capturedArgs []any
	repo := &fakeDBRepo{queryDatabase: func(q string, args ...any) (models.TableResult, error) {
		capturedArgs = args
		return models.TableResult{}, nil
	}}

	min := 20
	body := searchBody(t, []models.CharacterFilter{
		{Field: "name", Op: "like", Value: "Aeth"},
		{Field: "level", Op: "range", Min: &min},
		{Field: "online", Op: "eq", Value: "1"},
	}, 10)
	r := httptest.NewRequest(http.MethodPost, "/api/character/search", body)
	w := httptest.NewRecorder()

	PostCharacterSearch(repo)(w, r)

	if w.Code != http.StatusOK {
		t.Errorf("expected status %d, got %d", http.StatusOK, w.Code)
	}
	if len(capturedArgs) != 3 {
		t.Errorf("expected 3 args for 3 filters, got %d", len(capturedArgs))
	}
}

// ---------------------------------------------------------------------------
// PostCharacterSearch - limit enforcement
// ---------------------------------------------------------------------------

func TestPostCharacterSearch_DefaultLimitApplied(t *testing.T) {
	var capturedQuery string
	repo := &fakeDBRepo{queryDatabase: func(q string, args ...any) (models.TableResult, error) {
		capturedQuery = q
		return models.TableResult{}, nil
	}}

	body := searchBody(t, nil, 0) // limit 0 should default
	r := httptest.NewRequest(http.MethodPost, "/api/character/search", body)
	w := httptest.NewRecorder()

	PostCharacterSearch(repo)(w, r)

	if !strings.Contains(capturedQuery, fmt.Sprintf("LIMIT %d", characterSearchDefaultLimit)) {
		t.Errorf("expected default LIMIT %d in query, got: %s", characterSearchDefaultLimit, capturedQuery)
	}
}

func TestPostCharacterSearch_LimitCappedAtMax(t *testing.T) {
	var capturedQuery string
	repo := &fakeDBRepo{queryDatabase: func(q string, args ...any) (models.TableResult, error) {
		capturedQuery = q
		return models.TableResult{}, nil
	}}

	body := searchBody(t, nil, 99999) // absurd limit
	r := httptest.NewRequest(http.MethodPost, "/api/character/search", body)
	w := httptest.NewRecorder()

	PostCharacterSearch(repo)(w, r)

	if !strings.Contains(capturedQuery, fmt.Sprintf("LIMIT %d", characterSearchMaxLimit)) {
		t.Errorf("expected capped LIMIT %d in query, got: %s", characterSearchMaxLimit, capturedQuery)
	}
}

func TestPostCharacterSearch_StringInFilter_TooManyValuesRejected(t *testing.T) {
	repo := &fakeDBRepo{}
	values := make([]string, 11)
	for i := range values {
		values[i] = "Zone"
	}
	body := searchBody(t, []models.CharacterFilter{
		{Field: "zone", Op: "in", Values: values},
	}, 10)
	r := httptest.NewRequest(http.MethodPost, "/api/character/search", body)
	w := httptest.NewRecorder()

	PostCharacterSearch(repo)(w, r)

	if w.Code != http.StatusBadRequest {
		t.Errorf("expected status %d, got %d", http.StatusBadRequest, w.Code)
	}
}

// ---------------------------------------------------------------------------
// PostCharacterSearch - repo error
// ---------------------------------------------------------------------------

func TestPostCharacterSearch_RepoError(t *testing.T) {
	repo := &fakeDBRepo{queryDatabase: func(q string, args ...any) (models.TableResult, error) {
		return models.TableResult{}, fmt.Errorf("db unavailable")
	}}

	body := searchBody(t, nil, 10)
	r := httptest.NewRequest(http.MethodPost, "/api/character/search", body)
	w := httptest.NewRecorder()

	PostCharacterSearch(repo)(w, r)

	if w.Code != http.StatusInternalServerError {
		t.Errorf("expected status %d, got %d", http.StatusInternalServerError, w.Code)
	}
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

func searchBody(t *testing.T, filters []models.CharacterFilter, limit int) *bytes.Buffer {
	t.Helper()
	req := models.CharacterSearchRequest{Filters: filters, Limit: limit}
	b, err := json.Marshal(req)
	if err != nil {
		t.Fatalf("failed to marshal search request: %v", err)
	}
	return bytes.NewBuffer(b)
}
