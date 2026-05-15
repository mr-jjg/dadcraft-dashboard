package models

// FieldType describes how a character_cache field is filtered and
// what control the frontend should render for it.
type FieldType string

const (
	FieldTypeString  FieldType = "string"
	FieldTypeRange   FieldType = "range"
	FieldTypeEnum    FieldType = "enum"
	FieldTypeBoolean FieldType = "boolean"
)

// FieldDef is a single entry in the character search field registry.
// It is served to the frontend via GET /api/character/fields so the
// frontend can build its filter UI dynamically from the same definition
// the backend uses to validate and build queries.
type FieldDef struct {
	Field  string    `json:"field"`
	Type   FieldType `json:"type"`
	Label  string    `json:"label"`
	Min    *int      `json:"min,omitempty"`    // range fields only
	Max    *int      `json:"max,omitempty"`    // range fields only
	Values []string  `json:"values,omitempty"` // enum fields only
}

// CharacterFieldRegistry is the authoritative list of fields that may
// be used as filters in a character search request. Field names must
// match column names in dadcraft_dashboard.character_cache exactly.
var CharacterFieldRegistry = func() []FieldDef {
	iptr := func(i int) *int { return &i }
	return []FieldDef{
		{
			Field: "name",
			Type:  FieldTypeString,
			Label: "Name",
		},
		{
			Field: "level",
			Type:  FieldTypeRange,
			Label: "Level",
			Min:   iptr(1),
			Max:   iptr(60),
		},
		{
			Field:  "race",
			Type:   FieldTypeEnum,
			Label:  "Race",
			Values: []string{"Human", "Orc", "Dwarf", "Night Elf", "Undead", "Tauren", "Gnome", "Troll"},
		},
		{
			Field:  "class",
			Type:   FieldTypeEnum,
			Label:  "Class",
			Values: []string{"Warrior", "Paladin", "Hunter", "Rogue", "Priest", "Shaman", "Mage", "Warlock", "Druid"},
		},
		{
			Field:  "gender",
			Type:   FieldTypeEnum,
			Label:  "Gender",
			Values: []string{"Male", "Female"},
		},
		{
			Field: "guild",
			Type:  FieldTypeString,
			Label: "Guild",
		},
		{
			Field: "online",
			Type:  FieldTypeBoolean,
			Label: "Online",
		},
		{
			Field: "in_battleground",
			Type:  FieldTypeBoolean,
			Label: "In Battleground",
		},
		{
			Field: "is_guild_leader",
			Type:  FieldTypeBoolean,
			Label: "Guild Leader",
		},
		{
			Field: "lifetime_honorable_kills",
			Type:  FieldTypeRange,
			Label: "Lifetime Kills",
			Min:   iptr(0),
		},
		{
			Field: "week_honorable_kills",
			Type:  FieldTypeRange,
			Label: "Weekly Kills",
			Min:   iptr(0),
		},
	}
}()

// CharacterFieldMap returns the registry indexed by field name for O(1)
// lookup during request validation.
func CharacterFieldMap() map[string]FieldDef {
	m := make(map[string]FieldDef, len(CharacterFieldRegistry))
	for _, f := range CharacterFieldRegistry {
		m[f.Field] = f
	}
	return m
}

// CharacterSearchRequest is the JSON body accepted by POST /api/character/search.
type CharacterSearchRequest struct {
	Filters []CharacterFilter `json:"filters"`
	Limit   int               `json:"limit"`
}

// CharacterFilter is a single filter clause in a character search request.
// Which fields are used depends on Op and the field's FieldType:
//
//	string  - Op: "like",  Value populated
//	range   - Op: "range", Min and/or Max populated
//	enum    - Op: "in",    Values populated (at least one)
//	boolean - Op: "eq",    Value "0" or "1"
type CharacterFilter struct {
	Field  string   `json:"field"`
	Op     string   `json:"op"`
	Value  string   `json:"value,omitempty"`
	Min    *int     `json:"min,omitempty"`
	Max    *int     `json:"max,omitempty"`
	Values []string `json:"values,omitempty"`
}
