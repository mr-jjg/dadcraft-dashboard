package models

import (
	"encoding/json"
	"fmt"
	"strconv"
)

type PrometheusResponse struct {
	Status string `json:"status"`
	Data   Data   `json:"data"`
}

type Data struct {
	ResultType string   `json:"resultType"`
	Result     []Result `json:"result"`
}

type Result struct {
	Metric Metric          `json:"metric"`
	Value  json.RawMessage `json:"value"`
	Values json.RawMessage `json:"values"`
}

type Metric struct {
	Instance string `json:"instance"`
}

type MetricValue struct {
	Value float64 `json:"value"`
}

func (r PrometheusResponse) Value() (float64, error) {
	if len(r.Data.Result) == 0 {
		return 0, fmt.Errorf("no results")
	}
	var arr []json.RawMessage
	if err := json.Unmarshal(r.Data.Result[0].Value, &arr); err != nil {
		return 0, err
	}
	if len(arr) < 2 {
		return 0, fmt.Errorf("malformed value array")
	}
	var s string
	if err := json.Unmarshal(arr[1], &s); err != nil {
		return 0, err
	}
	return strconv.ParseFloat(s, 64)
}

func (r PrometheusResponse) Values() ([][2]float64, error) {
	if len(r.Data.Result) == 0 {
		return nil, fmt.Errorf("no results")
	}

	var raw [][2]json.RawMessage
	if err := json.Unmarshal(r.Data.Result[0].Values, &raw); err != nil {
		return nil, err
	}

	res := make([][2]float64, len(raw))
	for i, pair := range raw {
		var ts float64
		var val string
		if err := json.Unmarshal(pair[0], &ts); err != nil {
			return nil, err
		}
		if err := json.Unmarshal(pair[1], &val); err != nil {
			return nil, err
		}
		f, err := strconv.ParseFloat(val, 64)
		if err != nil {
			return nil, err
		}
		res[i] = [2]float64{ts, f}
	}

	return res, nil
}
