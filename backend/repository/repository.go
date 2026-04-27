package repository

import "dadcraft-dashboard/models"

type MetricsRepository interface {
	GetMetrics(q string) (models.PrometheusResponse, error)
}

type DBRepository interface {
	QueryScalar(q string) (float64, error)
	QueryDistribution(q string) ([]models.LabeledValue, error)
}
