package models

import (
	"fmt"
	"strings"
)

var fragments = map[string]string{
	"name":  "name AS Name",
	"level": "level AS Level",
	"count": "COUNT(*) AS Count",
	"race": `CASE race ` +
		`WHEN 1 THEN 'Human' ` +
		`WHEN 2 THEN 'Orc' ` +
		`WHEN 3 THEN 'Dwarf' ` +
		`WHEN 4 THEN 'Night Elf' ` +
		`WHEN 5 THEN 'Undead' ` +
		`WHEN 6 THEN 'Tauren' ` +
		`WHEN 7 THEN 'Gnome' ` +
		`WHEN 8 THEN 'Troll' ` +
		`ELSE 'Unknown' END AS Race`,
	"class": `CASE class ` +
		`WHEN 1  THEN 'Warrior' ` +
		`WHEN 2  THEN 'Paladin' ` +
		`WHEN 3  THEN 'Hunter' ` +
		`WHEN 4  THEN 'Rogue' ` +
		`WHEN 5  THEN 'Priest' ` +
		`WHEN 7  THEN 'Shaman' ` +
		`WHEN 8  THEN 'Mage' ` +
		`WHEN 9  THEN 'Warlock' ` +
		`WHEN 11 THEN 'Druid' ` +
		`ELSE 'Unknown' END AS Class`,
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
