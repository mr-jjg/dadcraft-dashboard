package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"dadcraft-dashboard/models"
	"dadcraft-dashboard/repository"
)

func parseInt64Param(r *http.Request, key string, defaultVal int64) int64 {
	s := r.URL.Query().Get(key)
	if s == "" {
		return defaultVal
	}
	v, err := strconv.ParseInt(s, 10, 64)
	if err != nil {
		return defaultVal
	}
	return v
}

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
		now := time.Now().Unix()
		end := parseInt64Param(r, "end", now)
		start := parseInt64Param(r, "start", end-90*24*60*60)
		step := parseInt64Param(r, "step", 3600)

		resp, err := repo.GetMetricsRange(query, start, end, int(step))
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		if len(resp.Data.Result) == 0 {
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode([][2]float64{})
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
