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

func TestGetProgression_DefaultScrapeID(t *testing.T) {
	r := httptest.NewRequest("GET", "/api/progression", nil)
	w := httptest.NewRecorder()

	repo := &fakeDBRepo{queryDatabase: func(q string, args ...any) (models.TableResult, error) {
		if !strings.Contains(q, "MAX(id)") {
			t.Errorf("expected MAX(id) subquery for default scrape_id, got: %s", q)
		}
		return models.TableResult{
			Columns: []string{"level", "class", "count"},
			Rows: [][]string{
				{"60", "Warrior", "3"},
				{"60", "Mage", "1"},
			},
		}, nil
	}}

	handler := GetProgression(repo)
	handler(w, r)

	if w.Code != http.StatusOK {
		t.Errorf("expected status %d, got %d", http.StatusOK, w.Code)
	}

	var entries []models.LabeledValue
	json.NewDecoder(w.Body).Decode(&entries)
	if len(entries) != 2 {
		t.Fatalf("expected 2 entries, got %d", len(entries))
	}
	if entries[0].Labels["level"] != "60" {
		t.Errorf("expected level 60, got %s", entries[0].Labels["level"])
	}
	if entries[0].Labels["class"] != "Warrior" {
		t.Errorf("expected Warrior, got %s", entries[0].Labels["class"])
	}
	if entries[0].Value != 3 {
		t.Errorf("expected value 3, got %f", entries[0].Value)
	}
}

func TestGetProgression_ExplicitScrapeID(t *testing.T) {
	r := httptest.NewRequest("GET", "/api/progression?scrape_id=1", nil)
	w := httptest.NewRecorder()

	repo := &fakeDBRepo{queryDatabase: func(q string, args ...any) (models.TableResult, error) {
		if !strings.Contains(q, "ps.scrape_id = 1") {
			t.Errorf("expected scrape_id = 1 in query, got: %s", q)
		}
		return models.TableResult{
			Columns: []string{"level", "class", "count"},
			Rows:    [][]string{{"1", "Rogue", "2"}},
		}, nil
	}}

	handler := GetProgression(repo)
	handler(w, r)

	if w.Code != http.StatusOK {
		t.Errorf("expected status %d, got %d", http.StatusOK, w.Code)
	}
}

func TestGetProgression_InvalidScrapeID(t *testing.T) {
	r := httptest.NewRequest("GET", "/api/progression?scrape_id=banana", nil)
	w := httptest.NewRecorder()

	repo := &fakeDBRepo{queryDatabase: func(q string, args ...any) (models.TableResult, error) {
		return models.TableResult{}, nil
	}}

	handler := GetProgression(repo)
	handler(w, r)

	if w.Code != http.StatusBadRequest {
		t.Errorf("expected status %d, got %d", http.StatusBadRequest, w.Code)
	}
}

func TestGetProgression_OnlineFilter(t *testing.T) {
	r := httptest.NewRequest("GET", "/api/progression?online=true", nil)
	w := httptest.NewRecorder()

	repo := &fakeDBRepo{queryDatabase: func(q string, args ...any) (models.TableResult, error) {
		if !strings.Contains(q, "ps.online = 1") {
			t.Errorf("expected online filter in query, got: %s", q)
		}
		return models.TableResult{
			Columns: []string{"level", "class", "count"},
			Rows:    [][]string{},
		}, nil
	}}

	handler := GetProgression(repo)
	handler(w, r)

	if w.Code != http.StatusOK {
		t.Errorf("expected status %d, got %d", http.StatusOK, w.Code)
	}
}

func TestGetProgression_FactionFilter(t *testing.T) {
	r := httptest.NewRequest("GET", "/api/progression?faction=horde", nil)
	w := httptest.NewRecorder()

	repo := &fakeDBRepo{queryDatabase: func(q string, args ...any) (models.TableResult, error) {
		if !strings.Contains(q, "Orc") {
			t.Errorf("expected horde races in query, got: %s", q)
		}
		return models.TableResult{
			Columns: []string{"level", "class", "count"},
			Rows:    [][]string{},
		}, nil
	}}

	handler := GetProgression(repo)
	handler(w, r)

	if w.Code != http.StatusOK {
		t.Errorf("expected status %d, got %d", http.StatusOK, w.Code)
	}
}

func TestGetProgression_RaceOverridesFaction(t *testing.T) {
	r := httptest.NewRequest("GET", "/api/progression?faction=alliance&race=Gnome", nil)
	w := httptest.NewRecorder()

	repo := &fakeDBRepo{queryDatabase: func(q string, args ...any) (models.TableResult, error) {
		if strings.Contains(q, "IN (") {
			t.Errorf("expected race to override faction, but found IN clause: %s", q)
		}
		if len(args) == 0 || args[0] != "Gnome" {
			t.Errorf("expected Gnome as race arg, got: %v", args)
		}
		return models.TableResult{
			Columns: []string{"level", "class", "count"},
			Rows:    [][]string{},
		}, nil
	}}

	handler := GetProgression(repo)
	handler(w, r)

	if w.Code != http.StatusOK {
		t.Errorf("expected status %d, got %d", http.StatusOK, w.Code)
	}
}

func TestGetProgression_GuildFilter(t *testing.T) {
	r := httptest.NewRequest("GET", "/api/progression?guild=Serenity", nil)
	w := httptest.NewRecorder()

	repo := &fakeDBRepo{queryDatabase: func(q string, args ...any) (models.TableResult, error) {
		if !strings.Contains(q, "ps.guild = ?") {
			t.Errorf("expected guild filter in query, got: %s", q)
		}
		if len(args) == 0 || args[0] != "Serenity" {
			t.Errorf("expected Serenity as guild arg, got: %v", args)
		}
		return models.TableResult{
			Columns: []string{"level", "class", "count"},
			Rows:    [][]string{},
		}, nil
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

	repo := &fakeDBRepo{queryDatabase: func(q string, args ...any) (models.TableResult, error) {
		return models.TableResult{}, fmt.Errorf("db unavailable")
	}}

	handler := GetProgression(repo)
	handler(w, r)

	if w.Code != http.StatusInternalServerError {
		t.Errorf("expected status %d, got %d", http.StatusInternalServerError, w.Code)
	}
}

func TestGetProgressionTimestamps_Success(t *testing.T) {
	r := httptest.NewRequest("GET", "/api/progression/timestamps", nil)
	w := httptest.NewRecorder()

	repo := &fakeDBRepo{queryDatabase: func(q string, args ...any) (models.TableResult, error) {
		return models.TableResult{
			Columns: []string{"id", "scraped_at"},
			Rows: [][]string{
				{"1", "1746103600"},
				{"2", "1746107200"},
			},
		}, nil
	}}

	handler := GetProgressionTimestamps(repo)
	handler(w, r)

	if w.Code != http.StatusOK {
		t.Errorf("expected status %d, got %d", http.StatusOK, w.Code)
	}

	type scrapeEntry struct {
		ID        int64 `json:"id"`
		ScrapedAt int64 `json:"scraped_at"`
	}
	var entries []scrapeEntry
	json.NewDecoder(w.Body).Decode(&entries)

	if len(entries) != 2 {
		t.Fatalf("expected 2 entries, got %d", len(entries))
	}
	if entries[0].ID != 1 {
		t.Errorf("expected id 1, got %d", entries[0].ID)
	}
	if entries[0].ScrapedAt != 1746103600 {
		t.Errorf("expected scraped_at 1746103600, got %d", entries[0].ScrapedAt)
	}
}

func TestGetProgressionTimestamps_RepoError(t *testing.T) {
	r := httptest.NewRequest("GET", "/api/progression/timestamps", nil)
	w := httptest.NewRecorder()

	repo := &fakeDBRepo{queryDatabase: func(q string, args ...any) (models.TableResult, error) {
		return models.TableResult{}, fmt.Errorf("db unavailable")
	}}

	handler := GetProgressionTimestamps(repo)
	handler(w, r)

	if w.Code != http.StatusInternalServerError {
		t.Errorf("expected status %d, got %d", http.StatusInternalServerError, w.Code)
	}
}
