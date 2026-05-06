package handlers

import (
	"net/http"
	"strconv"

	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promhttp"

	"dadcraft-dashboard/models"
	"dadcraft-dashboard/repository"
)

var (
	progressionRegistry = prometheus.NewRegistry()

	charactersByLevel = prometheus.NewGaugeVec(
		prometheus.GaugeOpts{
			Name: "wow_characters_by_level",
			Help: "Character count grouped by level, race, class, and online status (non-GM only)",
		},
		[]string{"level", "race", "class", "online"},
	)
)

func init() {
	progressionRegistry.MustRegister(charactersByLevel)
}

const progressionQuery = `
SELECT
  c.level,
  CASE c.race ` + models.RaceCase + ` AS Race,
  CASE c.class ` + models.ClassCase + ` AS Class,
  c.online,
  COUNT(*) AS Count
FROM v_characters.characters c
JOIN v_realmd.account a ON c.account = a.id
WHERE a.gmlevel = 0
GROUP BY c.level, c.race, c.class, c.online`

func onlineLabel(s string) string {
	if s == "1" {
		return "true"
	}
	return "false"
}

func ProgressionExporter(repo repository.DBRepository) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		result, err := repo.QueryDatabase(progressionQuery)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		charactersByLevel.Reset()

		for _, row := range result.Rows {
			count, err := strconv.ParseFloat(row[4], 64)
			if err != nil {
				continue
			}
			// columns: level(0), Race(1), Class(2), online(3), Count(4) - order matches labels
			charactersByLevel.WithLabelValues(row[0], row[1], row[2], onlineLabel(row[3])).Set(count)
		}

		promhttp.HandlerFor(progressionRegistry, promhttp.HandlerOpts{}).ServeHTTP(w, r)
	}
}
