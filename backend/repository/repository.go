package repository

import "dadcraft-dashboard/models"

type MetricsRepository interface {
	GetMetrics(q string) (models.PrometheusResponse, error)
	GetMetricsRange(q string, start, end int64, step int) (models.PrometheusResponse, error)
	GetMetricsAt(q string, ts int64) (models.PrometheusResponse, error)
}

type DBRepository interface {
	QueryDatabase(q string) (models.TableResult, error)
}
