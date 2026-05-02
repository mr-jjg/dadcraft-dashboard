package handlers

import (
	"encoding/json"
	"net/http"
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
