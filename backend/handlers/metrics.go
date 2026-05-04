package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"dadcraft-dashboard/models"
	"dadcraft-dashboard/repository"
)

func GetMetric(repo repository.MetricsRepository, query string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		resp, err := repo.GetMetrics(query)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		value, err := resp.Value()
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(models.MetricValue{Value: value})
	}
}

func GetMetricRange(repo repository.MetricsRepository, query string) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
        // TODO: accept start, end, step as frontend query parameters
        end := time.Now().Unix()
        start := end - 6*60*60
        step := 60

        resp, err := repo.GetMetricsRange(query, start, end, step)
        if err != nil {
            http.Error(w, err.Error(), http.StatusInternalServerError)
            return
        }

        values, err := resp.Values()
        if err != nil {
            http.Error(w, err.Error(), http.StatusInternalServerError)
            return
        }

        w.Header().Set("Content-Type", "application/json")
        json.NewEncoder(w).Encode(values)
    }
}

func GetProgression(repo repository.MetricsRepository) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		params := r.URL.Query()

		// timestamp - defaults to now
		var ts int64
		if tsStr := params.Get("time"); tsStr != "" {
			parsed, err := strconv.ParseInt(tsStr, 10, 64)
			if err != nil {
				http.Error(w, "invalid time parameter", http.StatusBadRequest)
				return
			}
			ts = parsed
		} else {
			ts = time.Now().Unix()
		}

		// build label selectors
		var selectors []string

		if online := params.Get("online"); online == "true" || online == "false" {
			selectors = append(selectors, fmt.Sprintf(`online="%s"`, online))
		}

		// race takes precedence over faction
		if races := params.Get("race"); races != "" {
			selectors = append(selectors, fmt.Sprintf(`race=~"%s"`, strings.ReplaceAll(races, ",", "|")))
		} else if faction := params.Get("faction"); faction == "alliance" {
			selectors = append(selectors, `race=~"Human|Dwarf|Night Elf|Gnome"`)
		} else if faction == "horde" {
			selectors = append(selectors, `race=~"Orc|Undead|Tauren|Troll"`)
		}

		if classes := params.Get("class"); classes != "" {
			selectors = append(selectors, fmt.Sprintf(`class=~"%s"`, strings.ReplaceAll(classes, ",", "|")))
		}

		// build full PromQL query
		labelSelector := ""
		if len(selectors) > 0 {
			labelSelector = "{" + strings.Join(selectors, ",") + "}"
		}
		query := fmt.Sprintf(`sum by (level, class) (last_over_time(wow_characters_by_level%s[1h5m]))`, labelSelector)

		resp, err := repo.GetMetricsAt(query, ts)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		labeledValues, err := resp.LabeledValues()
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(labeledValues)
	}
}
