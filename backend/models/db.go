package models

type TableResult struct {
	Columns []string   `json:"columns"`
	Rows    [][]string `json:"rows"`
}
