package models

import (
	"fmt"
	"strings"
)

var fragments = map[string]string{
	"name":  "name AS Name",
	"level": "level AS Level",
	"count": "COUNT(*) AS Count",
	"race":  "CASE race " + RaceCase + " AS Race",
	"class": "CASE class " + ClassCase + " AS Class",
}

func BuildQuery(columns []string, table string, extra string) string {
	resolved := make([]string, len(columns))
	for i, col := range columns {
		if fragment, ok := fragments[col]; ok {
			resolved[i] = fragment
		} else {
			resolved[i] = col
		}
	}

	q := fmt.Sprintf("SELECT %s FROM %s", strings.Join(resolved, ", "), table)
	if extra != "" {
		q = fmt.Sprintf("%s %s", q, extra)
	}
	return q
}
