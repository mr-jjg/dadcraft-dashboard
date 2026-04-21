package models

import (
	"encoding/json"
	"testing"
)

func TestValue_Success(t *testing.T) {
	resp := PrometheusResponse{
		Status: "success",
		Data: Data{
			ResultType: "vector",
			Result: []Result{
				{
					Metric: Metric{Instance: "host.docker.internal:9100"},
					Value:  json.RawMessage(`[1234567890.123, "47.3"]`),
				},
			},
		},
	}

	got, err := resp.Value()

	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if got != 47.3 {
		t.Errorf("expected 47.3, got %f", got)
	}
}

func TestValue_EmptyResult(t *testing.T) {
	resp := PrometheusResponse{
		Status: "success",
		Data:   Data{ResultType: "vector", Result: []Result{}},
	}

	_, err := resp.Value()

	if err == nil {
		t.Error("expected error for empty result, got nil")
	}
}

func TestValue_MalformedArray(t *testing.T) {
	resp := PrometheusResponse{
		Status: "success",
		Data: Data{
			ResultType: "vector",
			Result: []Result{
				{Value: json.RawMessage(`[1234567890.123]`)},
			},
		},
	}

	_, err := resp.Value()
	
	if err == nil {
		t.Error("expected error for malformed value array, got nil")
	}
}

func TestValue_BadFloat(t *testing.T) {
	resp := PrometheusResponse{
		Status: "success",
		Data: Data{
			ResultType: "vector",
			Result: []Result{
				{Value: json.RawMessage(`[1234567890.123, "not-a-number"]`)},
			},
		},
	}

	_, err := resp.Value()
	if err == nil {
		t.Error("expected error for unparseable float, got nil")
	}
}
