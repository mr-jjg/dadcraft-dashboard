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

	dbRepo := &fakeDBRepo{queryDatabase: func(q string) (models.TableResult, error) {
		return models.TableResult{
			Columns: []string{"name", "level", "race", "class", "online", "ding_time", "efficiency"},
			Rows: [][]string{
				{"Keekus", "60", "Human", "Warrior", "0", "1746103600", "1107283"},
				{"Joana",  "60", "Troll",  "Hunter",  "1", "1746107200", "100000"},
			},
		}, nil
	}}

	handler := GetLeaderboard(dbRepo)
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

func TestGetLeaderboard_EmptyResult(t *testing.T) {
	r := httptest.NewRequest("GET", "/api/leaderboard", nil)
	w := httptest.NewRecorder()

	dbRepo := &fakeDBRepo{queryDatabase: func(q string) (models.TableResult, error) {
		return models.TableResult{
			Columns: []string{"name", "level", "race", "class", "online", "ding_time", "efficiency"},
			Rows:    [][]string{},
		}, nil
	}}

	handler := GetLeaderboard(dbRepo)
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

func TestGetLeaderboard_RepoError(t *testing.T) {
	r := httptest.NewRequest("GET", "/api/leaderboard", nil)
	w := httptest.NewRecorder()

	dbRepo := &fakeDBRepo{queryDatabase: func(q string) (models.TableResult, error) {
		return models.TableResult{}, fmt.Errorf("db unavailable")
	}}

	handler := GetLeaderboard(dbRepo)
	handler(w, r)

	if w.Code != http.StatusInternalServerError {
		t.Errorf("expected status %d, got %d", http.StatusInternalServerError, w.Code)
	}
}

func TestGetLeaderboard_EfficiencyTiebreak(t *testing.T) {
	r := httptest.NewRequest("GET", "/api/leaderboard", nil)
	w := httptest.NewRecorder()

	dbRepo := &fakeDBRepo{queryDatabase: func(q string) (models.TableResult, error) {
		return models.TableResult{
			Columns: []string{"name", "level", "race", "class", "online", "ding_time", "efficiency"},
			Rows: [][]string{
				{"Joana",  "60", "Troll",  "Hunter",  "1", "1746103600", "100000"},
				{"Keekus", "60", "Human", "Warrior", "0", "1746103600", "1107283"},
			},
		}, nil
	}}

	handler := GetLeaderboard(dbRepo)
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