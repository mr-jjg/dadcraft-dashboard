package repository

import (
	"dadcraft-dashboard/models"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
)

type PrometheusRepository struct {
	prometheusURL string
}

func NewPrometheusRepository(prometheusURL string) *PrometheusRepository {
	return &PrometheusRepository{prometheusURL: prometheusURL}
}

func (r *PrometheusRepository) GetMetrics(q string) (models.PrometheusResponse, error) {
	resp, err := http.Get(r.prometheusURL + "query?query=" + url.QueryEscape(q))
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

func (r *PrometheusRepository) GetMetricsRange(q string, start, end int64, step int) (models.PrometheusResponse, error) {
	rangeURL := fmt.Sprintf("%squery_range?query=%s&start=%d&end=%d&step=%d",
		r.prometheusURL, url.QueryEscape(q), start, end, step)
	resp, err := http.Get(rangeURL)
	if err != nil {
		return models.PrometheusResponse{}, err
	}
	defer resp.Body.Close()

	var prometheusResponse models.PrometheusResponse
	err = json.NewDecoder(resp.Body).Decode(&prometheusResponse)
	if err != nil {
		return models.PrometheusResponse{}, err
	}

	return prometheusResponse, nil
}
