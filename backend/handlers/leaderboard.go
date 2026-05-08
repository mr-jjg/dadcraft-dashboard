package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"dadcraft-dashboard/models"
	"dadcraft-dashboard/repository"
)

const leaderboardQuery = `
SELECT c.name,
	   c.level,
       CASE c.race ` + models.RaceCase + ` AS race,
       CASE c.class ` + models.ClassCase + ` AS class,
       c.online,
       d.dinged_at AS ding_time,
       (c.totaltime - c.leveltime) AS efficiency
FROM dadcraft_dashboard.dings d
JOIN v_characters.characters c ON d.guid = c.guid
WHERE d.level = (SELECT MAX(d2.level) FROM dadcraft_dashboard.dings d2 WHERE d2.guid = d.guid)
ORDER BY d.level DESC, d.dinged_at ASC, efficiency ASC
LIMIT 20`

func GetLeaderboard(dbRepo repository.DBRepository) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		tableResult, err := dbRepo.QueryDatabase(leaderboardQuery)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		entries := make([]models.LeaderboardEntry, 0, len(tableResult.Rows))
		for _, row := range tableResult.Rows {
			// columns: name(0), level(1), race(2), class(3), online(4), ding_time(5), efficiency(6)
			level, _ := strconv.Atoi(row[1])
			dingTime, _ := strconv.ParseInt(row[5], 10, 64)
			efficiency, _ := strconv.ParseInt(row[6], 10, 64)

			entries = append(entries, models.LeaderboardEntry{
				Name:       row[0],
				Level:      level,
				Race:       row[2],
				Class:      row[3],
				Online:     row[4] == "1",
				DingTime:   dingTime,
				Efficiency: efficiency,
			})
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(entries)
	}
}
