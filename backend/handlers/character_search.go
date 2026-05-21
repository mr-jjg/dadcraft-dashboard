package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"dadcraft-dashboard/models"
	"dadcraft-dashboard/repository"
)

const (
	characterSearchDefaultLimit = 100
	characterSearchMaxLimit     = 200
)

// characterSearchColumns are the columns returned by a character search.
// cache_hash and updated_at are internal and excluded from API responses.
const characterSearchColumns = `
	name, faction, race, class, gender,
	level, xp, totaltime, leveltime,
	money, zone, online, in_battleground,
	guild, is_guild_leader,
	lifetime_honorable_kills, lifetime_honor,
	week_honorable_kills, week_honor`

// GetCharacterFields serves the character search field registry as JSON.
// The frontend fetches this once on mount to build its filter UI dynamically.
//
// GET /api/character/fields
func GetCharacterFields() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(models.CharacterFieldRegistry)
	}
}

// PostCharacterSearch accepts a JSON filter payload, validates it against the
// field registry, builds a parameterized WHERE clause, queries character_cache,
// and returns the matching rows as a TableResult.
//
// POST /api/character/search
func PostCharacterSearch(repo repository.DBRepository) http.HandlerFunc {
	fieldMap := models.CharacterFieldMap()

	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
			return
		}

		var req models.CharacterSearchRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "invalid request body", http.StatusBadRequest)
			return
		}

		// Enforce limit bounds.
		if req.Limit <= 0 {
			req.Limit = characterSearchDefaultLimit
		}
		if req.Limit > characterSearchMaxLimit {
			req.Limit = characterSearchMaxLimit
		}

		where, args, err := buildCharacterWhereClause(req.Filters, fieldMap)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		orderBy := ""
		if req.OrderBy != "" {
			if _, ok := fieldMap[req.OrderBy]; ok {
				dir := "ASC"
				if req.OrderDir == "desc" {
					dir = "DESC"
				}
				orderBy = fmt.Sprintf("ORDER BY %s %s", req.OrderBy, dir)
			}
		}

		extra := fmt.Sprintf("%s %s LIMIT %d", where, orderBy, req.Limit)
		query := fmt.Sprintf(
			"SELECT %s FROM dadcraft_dashboard.character_cache %s",
			characterSearchColumns,
			extra,
		)

		result, err := repo.QueryDatabase(query, args...)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(result)
	}
}

// buildCharacterWhereClause validates each filter against the field registry
// and assembles a parameterized WHERE clause. Field names are validated against
// the registry whitelist before being interpolated into the query string.
// All user-supplied values go through ? placeholders.
func buildCharacterWhereClause(
	filters []models.CharacterFilter,
	fieldMap map[string]models.FieldDef,
) (string, []any, error) {
	if len(filters) == 0 {
		return "", nil, nil
	}

	var clauses []string
	var args []any

	for _, f := range filters {
		def, ok := fieldMap[f.Field]
		if !ok {
			return "", nil, fmt.Errorf("unknown field: %q", f.Field)
		}

		switch def.Type {
		case models.FieldTypeString:
			if f.Value == "" {
				return "", nil, fmt.Errorf("field %q requires a non-empty value", f.Field)
			}
			clauses = append(clauses, fmt.Sprintf("%s LIKE ?", f.Field))
			args = append(args, "%"+f.Value+"%")

		case models.FieldTypeRange:
			if f.Min == nil && f.Max == nil {
				return "", nil, fmt.Errorf("field %q requires at least one of min or max", f.Field)
			}
			if f.Min != nil && f.Max != nil && *f.Min > *f.Max {
				return "", nil, fmt.Errorf("field %q: min must be <= max", f.Field)
			}
			if f.Min != nil {
				clauses = append(clauses, fmt.Sprintf("%s >= ?", f.Field))
				args = append(args, *f.Min)
			}
			if f.Max != nil {
				clauses = append(clauses, fmt.Sprintf("%s <= ?", f.Field))
				args = append(args, *f.Max)
			}

		case models.FieldTypeEnum:
			if len(f.Values) == 0 {
				return "", nil, fmt.Errorf("field %q requires at least one value", f.Field)
			}
			allowed := make(map[string]bool, len(def.Values))
			for _, v := range def.Values {
				allowed[v] = true
			}
			for _, v := range f.Values {
				if !allowed[v] {
					return "", nil, fmt.Errorf("field %q: %q is not a valid value", f.Field, v)
				}
			}
			placeholders := strings.Repeat("?,", len(f.Values))
			placeholders = placeholders[:len(placeholders)-1]
			clauses = append(clauses, fmt.Sprintf("%s IN (%s)", f.Field, placeholders))
			for _, v := range f.Values {
				args = append(args, v)
			}

		case models.FieldTypeBoolean:
			if f.Value != "0" && f.Value != "1" {
				return "", nil, fmt.Errorf("field %q: value must be \"0\" or \"1\"", f.Field)
			}
			clauses = append(clauses, fmt.Sprintf("%s = ?", f.Field))
			args = append(args, f.Value)
		}
	}

	return "WHERE " + strings.Join(clauses, " AND "), args, nil
}
