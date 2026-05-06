package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"sort"
	"strconv"
	"strings"
	"time"

	"dadcraft-dashboard/models"
	"dadcraft-dashboard/repository"
)

func GetLeaderboard(promRepo repository.MetricsRepository, dbRepo repository.DBRepository) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		now := time.Now().Unix()
		start := time.Date(time.Now().Year(), 1, 1, 0, 0, 0, 0, time.UTC).Unix()

		resp, err := promRepo.GetMetricsRange("wow_character_level", start, now, 60)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		dingMap, err := resp.DingTimes()
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		if len(dingMap) == 0 {
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode([]models.LeaderboardEntry{})
			return
		}

		guids := make([]string, 0, len(dingMap))
		for guid := range dingMap {
			guids = append(guids, guid)
		}

		query := models.BuildQuery(
			[]string{"guid", "name", "level", "race", "class", "online", "totaltime", "leveltime"},
			"v_characters.characters",
			fmt.Sprintf("WHERE guid IN (%s)", strings.Join(guids, ",")),
		)

		tableResult, err := dbRepo.QueryDatabase(query)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		entries := make([]models.LeaderboardEntry, 0, len(tableResult.Rows))
		for _, row := range tableResult.Rows {
			// columns: guid(0), name(1), level(2), race(3), class(4), online(5), totaltime(6), leveltime(7)
			guid := row[0]
			ding, ok := dingMap[guid]
			if !ok {
				continue
			}
			level, _ := strconv.Atoi(row[2])
			online := row[5] == "1"
			totaltime, _ := strconv.ParseInt(row[6], 10, 64)
			leveltime, _ := strconv.ParseInt(row[7], 10, 64)

			entries = append(entries, models.LeaderboardEntry{
				Level:      level,
				Name:       row[1],
				Race:       row[3],
				Class:      row[4],
				Online:     online,
				DingTime:   ding,
				Efficiency: totaltime - leveltime,
			})
		}

		sort.Slice(entries, func(i, j int) bool {
			if entries[i].DingTime != entries[j].DingTime {
				return entries[i].DingTime < entries[j].DingTime
			}
			return entries[i].Efficiency < entries[j].Efficiency
		})

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(entries)
	}
}
