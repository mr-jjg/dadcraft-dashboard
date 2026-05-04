package handlers

import (
	"net/http"
	"strconv"

	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promhttp"

	"dadcraft-dashboard/repository"
)

var (
	progressionRegistry = prometheus.NewRegistry()
	leaderboardRegistry  = prometheus.NewRegistry()

	charactersByLevel = prometheus.NewGaugeVec(
		prometheus.GaugeOpts{
			Name: "wow_characters_by_level",
			Help: "Character count grouped by level, class, race, and online status (non-GM only)",
		},
		[]string{"level", "class", "race", "online"},
	)

	characterLevel = prometheus.NewGaugeVec(
		prometheus.GaugeOpts{
			Name: "wow_character_level",
			Help: "Current level of non-GM characters at or near the server level frontier",
		},
		[]string{"guid", "online"},
	)
)

func init() {
	progressionRegistry.MustRegister(charactersByLevel)
	leaderboardRegistry.MustRegister(characterLevel)
}

const progressionQuery = `
SELECT
  c.level,
  CASE c.race
    WHEN 1 THEN 'Human'    WHEN 2 THEN 'Orc'
    WHEN 3 THEN 'Dwarf'    WHEN 4 THEN 'Night Elf'
    WHEN 5 THEN 'Undead'   WHEN 6 THEN 'Tauren'
    WHEN 7 THEN 'Gnome'    WHEN 8 THEN 'Troll'
    ELSE 'Unknown' END AS Race,
  CASE c.class
    WHEN 1  THEN 'Warrior'  WHEN 2  THEN 'Paladin'
    WHEN 3  THEN 'Hunter'   WHEN 4  THEN 'Rogue'
    WHEN 5  THEN 'Priest'   WHEN 7  THEN 'Shaman'
    WHEN 8  THEN 'Mage'     WHEN 9  THEN 'Warlock'
    WHEN 11 THEN 'Druid'
    ELSE 'Unknown' END AS Class,
  c.online,
  COUNT(*) AS Count
FROM v_characters.characters c
JOIN v_realmd.account a ON c.account = a.id
WHERE a.gmlevel = 0
GROUP BY c.level, c.race, c.class, c.online`

const leaderboardQuery = `
SELECT c.guid, c.level, c.online
FROM v_characters.characters c
JOIN v_realmd.account a ON c.account = a.id
WHERE a.gmlevel = 0
  AND c.level >= (
    SELECT MAX(c2.level)
    FROM v_characters.characters c2
    JOIN v_realmd.account a2 ON c2.account = a2.id
    WHERE a2.gmlevel = 0
  ) - 1`

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
			// columns: level(0), Race(1), Class(2), online(3), Count(4)
			count, err := strconv.ParseFloat(row[4], 64)
			if err != nil {
				continue
			}
			charactersByLevel.WithLabelValues(row[0], row[2], row[1], onlineLabel(row[3])).Set(count)
		}

		promhttp.HandlerFor(progressionRegistry, promhttp.HandlerOpts{}).ServeHTTP(w, r)
	}
}

func LeaderboardExporter(repo repository.DBRepository) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		result, err := repo.QueryDatabase(leaderboardQuery)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		characterLevel.Reset()

		for _, row := range result.Rows {
			// columns: guid(0), level(1), online(2)
			level, err := strconv.ParseFloat(row[1], 64)
			if err != nil {
				continue
			}
			characterLevel.WithLabelValues(row[0], onlineLabel(row[2])).Set(level)
		}

		promhttp.HandlerFor(leaderboardRegistry, promhttp.HandlerOpts{}).ServeHTTP(w, r)
	}
}
