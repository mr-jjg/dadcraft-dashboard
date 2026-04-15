package repository

import (
    "encoding/json"
    "io"
    "net/http"
    "dadcraft-dashboard/models"
)

func GetMetrics(q string) (models.PrometheusResponse, error) {
    resp, err := http.Get("http://prometheus:9090/api/v1/query?query=" + q)
    if err != nil {
        return models.PrometheusResponse{}, err
    }
    defer resp.Body.Close()

    body, err := io.ReadAll(resp.Body)
    if err != nil {
        return models.PrometheusResponse{}, err
    }

    var prometheusResponse models.PrometheusResponse
    err = json.Unmarshal(body, &prometheusResponse)
    if err != nil {
        return models.PrometheusResponse{}, err
    }

    return prometheusResponse, nil
}
