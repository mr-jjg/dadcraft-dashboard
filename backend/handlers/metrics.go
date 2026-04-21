package handlers

import (
	"encoding/json"
	"net/http"

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
