package handlers

import (
	"encoding/json"
	"net/http"

	"dadcraft-dashboard/models"
	"dadcraft-dashboard/repository"
)

func GetDBScalar(repo repository.DBRepository, query string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		value, err := repo.QueryScalar(query)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(models.MetricValue{Value: value})
	}
}

func GetDBDistribution(repo repository.DBRepository, query string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		rows, err := repo.QueryDistribution(query)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(rows)
	}
}
