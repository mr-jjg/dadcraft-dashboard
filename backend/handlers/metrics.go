package handlers

import (
	"encoding/json"
	"net/http"
)

func (h *MetricsHandler) HandleMetrics(w http.ResponseWriter, r *http.Request) {
	query := "100 - (avg by (instance) (rate(node_cpu_seconds_total{mode=\"idle\"}[5m])) * 100)"

	metrics, err := h.metricsRepo.GetMetrics(query)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(metrics)
}
