package handlers

import (
	"encoding/json"
	"net/http"

	"dadcraft-dashboard/repository"
)

func GetMetric(repo repository.MetricsRepository, query string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		metrics, err := repo.GetMetrics(query)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(metrics)
	}
}
