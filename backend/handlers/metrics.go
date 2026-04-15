package handlers

import (
    "encoding/json"
    "net/http"
    "dadcraft-dashboard/repository"
)

func HandleMetrics(w http.ResponseWriter, r *http.Request) {
    enableCors(w)

    query := "100 - (avg by (instance) (rate(node_cpu_seconds_total{mode=\"idle\"}[5m])) * 100)"

    metrics, err := repository.GetMetrics(query)
    if err != nil {
        http.Error(w, "Failed to fetch metrics", http.StatusInternalServerError)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(metrics)
}
