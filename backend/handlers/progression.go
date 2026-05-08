package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"dadcraft-dashboard/models"
	"dadcraft-dashboard/repository"
)

func GetProgression(repo repository.DBRepository) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		params := r.URL.Query()

		// scrape_id - defaults to latest
		var scrapeID string
		if idStr := params.Get("scrape_id"); idStr != "" {
			id, err := strconv.Atoi(idStr)
			if err != nil || id < 1 {
				http.Error(w, "invalid scrape_id parameter", http.StatusBadRequest)
				return
			}
			scrapeID = idStr
		} else {
			scrapeID = "(SELECT MAX(id) FROM dadcraft_dashboard.progression_scrapes)"
		}

		// build WHERE conditions
		conditions := []string{
			fmt.Sprintf("ps.scrape_id = %s", scrapeID),
			"ps.level > 1", // exclude level 1 characters (banks/alts skew the chart)
		}
		var args []any

		if online := params.Get("online"); online == "true" {
			conditions = append(conditions, "ps.online = 1")
		} else if online == "false" {
			conditions = append(conditions, "ps.online = 0")
		}

		// race takes precedence over faction
		if race := params.Get("race"); race != "" {
			conditions = append(conditions, "ps.race = ?")
			args = append(args, race)
		} else if faction := params.Get("faction"); faction == "alliance" {
			conditions = append(conditions, "ps.race IN ('Human','Dwarf','Night Elf','Gnome')")
		} else if faction == "horde" {
			conditions = append(conditions, "ps.race IN ('Orc','Undead','Tauren','Troll')")
		}

		if class := params.Get("class"); class != "" {
			conditions = append(conditions, "ps.class = ?")
			args = append(args, class)
		}

		if guild := params.Get("guild"); guild != "" {
			conditions = append(conditions, "ps.guild = ?")
			args = append(args, guild)
		}

		query := `
SELECT ps.level, ps.class, SUM(ps.count) AS count
FROM dadcraft_dashboard.progression_snapshots ps
WHERE ` + strings.Join(conditions, " AND ") + `
GROUP BY ps.level, ps.class
ORDER BY ps.level`

		tableResult, err := repo.QueryDatabase(query, args...)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		entries := make([]models.LabeledValue, 0, len(tableResult.Rows))
		for _, row := range tableResult.Rows {
			count, err := strconv.ParseFloat(row[2], 64)
			if err != nil {
				continue
			}
			entries = append(entries, models.LabeledValue{
				Labels: models.Metric{"level": row[0], "class": row[1]},
				Value:  count,
			})
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(entries)
	}
}

func GetProgressionTimestamps(repo repository.DBRepository) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		tableResult, err := repo.QueryDatabase(
			`SELECT id, scraped_at FROM dadcraft_dashboard.progression_scrapes ORDER BY id`,
		)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		type scrapeEntry struct {
			ID        int64 `json:"id"`
			ScrapedAt int64 `json:"scraped_at"`
		}

		entries := make([]scrapeEntry, 0, len(tableResult.Rows))
		for _, row := range tableResult.Rows {
			id, err := strconv.ParseInt(row[0], 10, 64)
			if err != nil {
				continue
			}
			ts, err := strconv.ParseInt(row[1], 10, 64)
			if err != nil {
				continue
			}
			entries = append(entries, scrapeEntry{ID: id, ScrapedAt: ts})
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(entries)
	}
}
