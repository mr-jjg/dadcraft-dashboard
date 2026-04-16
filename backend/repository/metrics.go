package repository

import (
	"dadcraft-dashboard/models"
	"encoding/json"
	"fmt"
	"net/http"
)

type Repository struct {
	prometheusURL string
}

func NewRepository(prometheusURL string) *Repository {
	return &Repository{prometheusURL: prometheusURL}
}

func (r *Repository) GetMetrics(q string) (models.PrometheusResponse, error) {
	resp, err := http.Get(r.prometheusURL + q)
	if err != nil {
		return models.PrometheusResponse{}, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return models.PrometheusResponse{}, fmt.Errorf("unexpected status code from Prometheus: %d", resp.StatusCode)
	}

	var prometheusResponse models.PrometheusResponse
	err = json.NewDecoder(resp.Body).Decode(&prometheusResponse)
	if err != nil {
		return models.PrometheusResponse{}, err
	}

	return prometheusResponse, nil
}
