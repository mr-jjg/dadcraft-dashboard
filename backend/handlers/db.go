package handlers

import (
	"encoding/json"
	"net/http"

	"dadcraft-dashboard/repository"
)

func GetDBQuery(repo repository.DBRepository, query string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		tableResult, err := repo.QueryDatabase(query)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(tableResult)
	}
}
