package models

type PrometheusResponse struct {
	Status string `json:"status"`
	Data Data `json:"data"`
}

type Data struct {
	ResultType string `json:"resultType"`
	Result []Result `json:"result"`
}

type Result struct {
	Metric Metric `json:"metric"`
	Values []interface{} `json:"value"`
}

type Metric struct {
	Instance string `json:"instance"`
}
