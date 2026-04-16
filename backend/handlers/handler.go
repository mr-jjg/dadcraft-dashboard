package handlers

import "dadcraft-dashboard/repository"

type MetricsHandler struct {
	metricsRepo repository.MetricsRepository
}

func NewMetricsHandler(metricsRepo repository.MetricsRepository) *MetricsHandler {
	return &MetricsHandler{metricsRepo: metricsRepo}
}
