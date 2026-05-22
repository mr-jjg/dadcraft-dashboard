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
					Metric: Metric{"instance": "host.docker.internal:9100"},
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

func TestValues_Success(t *testing.T) {
	resp := PrometheusResponse{
		Status: "success",
		Data: Data{
			ResultType: "matrix",
			Result: []Result{
				{
					Metric: Metric{"instance": "host.docker.internal:9100"},
					Values: json.RawMessage(`[[1714500000, "74.2"],[1714500060, "75.1"]]`),
				},
			},
		},
	}

	vals, err := resp.Values()

	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(vals) != 2 {
		t.Fatalf("expected 2 values, got %d", len(vals))
	}
	if vals[0][1] != 74.2 {
		t.Errorf("expected 74.2, got %v", vals[0][1])
	}
}

func TestValues_EmptyResult(t *testing.T) {
	resp := PrometheusResponse{
		Status: "success",
		Data:   Data{ResultType: "matrix", Result: []Result{}},
	}

	_, err := resp.Values()

	if err == nil {
		t.Error("expected error for empty result, got nil")
	}
}

func TestLabeledValues_Success(t *testing.T) {
	resp := PrometheusResponse{
		Status: "success",
		Data: Data{
			ResultType: "vector",
			Result: []Result{
				{
					Metric: Metric{"level": "60", "class": "Warrior", "race": "Human", "online": "false"},
					Value:  json.RawMessage(`[1746100000, "2"]`),
				},
				{
					Metric: Metric{"level": "59", "class": "Mage", "race": "Undead", "online": "true"},
					Value:  json.RawMessage(`[1746100000, "1"]`),
				},
			},
		},
	}

	got, err := resp.LabeledValues()

	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(got) != 2 {
		t.Fatalf("expected 2 results, got %d", len(got))
	}
	if got[0].Value != 2 {
		t.Errorf("expected value 2, got %f", got[0].Value)
	}
	if got[0].Labels["class"] != "Warrior" {
		t.Errorf("expected class Warrior, got %s", got[0].Labels["class"])
	}
	if got[1].Labels["level"] != "59" {
		t.Errorf("expected level 59, got %s", got[1].Labels["level"])
	}
}

func TestLabeledValues_EmptyResult(t *testing.T) {
	resp := PrometheusResponse{
		Status: "success",
		Data:   Data{ResultType: "vector", Result: []Result{}},
	}

	_, err := resp.LabeledValues()

	if err == nil {
		t.Error("expected error for empty result, got nil")
	}
}

func TestTimestamps_Success(t *testing.T) {
	resp := PrometheusResponse{
		Status: "success",
		Data: Data{
			ResultType: "matrix",
			Result: []Result{
				{
					Values: json.RawMessage(`[[1777865100,"192"],[1777871040,"191"]]`),
				},
			},
		},
	}

	timestamps, err := resp.Timestamps()
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if len(timestamps) != 2 {
		t.Fatalf("expected 2 timestamps, got %d", len(timestamps))
	}
	if timestamps[0] != 1777865100 {
		t.Errorf("expected 1777865100, got %d", timestamps[0])
	}
	if timestamps[1] != 1777871040 {
		t.Errorf("expected 1777871040, got %d", timestamps[1])
	}
}

func TestTimestamps_EmptyResult(t *testing.T) {
	resp := PrometheusResponse{
		Status: "success",
		Data:   Data{ResultType: "matrix", Result: []Result{}},
	}

	_, err := resp.Timestamps()
	if err == nil {
		t.Errorf("expected error on empty result, got nil")
	}
}

func TestDingTimes_Success(t *testing.T) {
	resp := PrometheusResponse{
		Status: "success",
		Data: Data{
			ResultType: "matrix",
			Result: []Result{
				{
					Metric: Metric{"guid": "1555"},
					Values: json.RawMessage(`[[1746100000,"59"],[1746103600,"60"]]`),
				},
				{
					Metric: Metric{"guid": "1568"},
					Values: json.RawMessage(`[[1746100000,"59"],[1746107200,"60"]]`),
				},
			},
		},
	}

	got, err := resp.DingTimes()

	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if len(got) != 2 {
		t.Fatalf("expected 2 entries, got %d", len(got))
	}
	if got["1555"] != 1746103600 {
		t.Errorf("expected 1746103600 for guid 1555, got %d", got["1555"])
	}
	if got["1568"] != 1746107200 {
		t.Errorf("expected 1746107200 for guid 1568, got %d", got["1568"])
	}
}

func TestDingTimes_EmptyResult(t *testing.T) {
	resp := PrometheusResponse{
		Status: "success",
		Data:   Data{ResultType: "matrix", Result: []Result{}},
	}

	got, err := resp.DingTimes()

	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if len(got) != 0 {
		t.Errorf("expected empty map, got %d entries", len(got))
	}
}

func TestDingTimes_SkipsMissingGuid(t *testing.T) {
	resp := PrometheusResponse{
		Status: "success",
		Data: Data{
			ResultType: "matrix",
			Result: []Result{
				{
					Metric: Metric{},
					Values: json.RawMessage(`[[1746103600,"60"]]`),
				},
				{
					Metric: Metric{"guid": "1555"},
					Values: json.RawMessage(`[[1746103600,"60"]]`),
				},
			},
		},
	}

	got, err := resp.DingTimes()

	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if len(got) != 1 {
		t.Errorf("expected 1 entry, got %d", len(got))
	}
	if _, ok := got["1555"]; !ok {
		t.Errorf("expected guid 1555 in result")
	}
}

func TestDingTimes_TracksFirstDingNotFirstScrape(t *testing.T) {
	resp := PrometheusResponse{
		Status: "success",
		Data: Data{
			ResultType: "matrix",
			Result: []Result{
				{
					Metric: Metric{"guid": "1555"},
					Values: json.RawMessage(`[[1746100000,"59"],[1746103600,"60"],[1746107200,"60"]]`),
				},
			},
		},
	}

	got, err := resp.DingTimes()

	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if got["1555"] != 1746103600 {
		t.Errorf("expected first ding at 1746103600, got %d", got["1555"])
	}
}
