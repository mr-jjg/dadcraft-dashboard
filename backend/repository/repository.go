package repository

import "dadcraft-dashboard/models"

type MetricsRepository interface {
	GetMetrics(q string) (models.PrometheusResponse, error)
}
