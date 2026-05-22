package models

import (
	"testing"
)

// ---------------------------------------------------------------------------
// CharacterFieldRegistry
// ---------------------------------------------------------------------------

func TestCharacterFieldRegistry_NotEmpty(t *testing.T) {
	if len(CharacterFieldRegistry) == 0 {
		t.Error("expected CharacterFieldRegistry to have at least one entry")
	}
}

func TestCharacterFieldRegistry_FieldNamesUnique(t *testing.T) {
	seen := make(map[string]bool)
	for _, f := range CharacterFieldRegistry {
		if seen[f.Field] {
			t.Errorf("duplicate field name in registry: %q", f.Field)
		}
		seen[f.Field] = true
	}
}

func TestCharacterFieldRegistry_LabelsNonEmpty(t *testing.T) {
	for _, f := range CharacterFieldRegistry {
		if f.Label == "" {
			t.Errorf("field %q has empty label", f.Field)
		}
	}
}

func TestCharacterFieldRegistry_ZoneIsStringIn(t *testing.T) {
	for _, f := range CharacterFieldRegistry {
		if f.Field == "zone" {
			if f.Type != FieldTypeStringIn {
				t.Errorf("expected zone field type %q, got %q", FieldTypeStringIn, f.Type)
			}
			return
		}
	}
	t.Error("zone field not found in registry")
}

func TestCharacterFieldRegistry_EnumFieldsHaveValues(t *testing.T) {
	for _, f := range CharacterFieldRegistry {
		if f.Type == FieldTypeEnum && len(f.Values) == 0 {
			t.Errorf("enum field %q has no allowed values", f.Field)
		}
	}
}

func TestCharacterFieldRegistry_RangeFieldsHaveAtLeastMin(t *testing.T) {
	for _, f := range CharacterFieldRegistry {
		if f.Type == FieldTypeRange && f.Min == nil && f.Max == nil {
			t.Errorf("range field %q has neither min nor max", f.Field)
		}
	}
}

func TestCharacterFieldRegistry_BooleanFieldsHaveNoValues(t *testing.T) {
	for _, f := range CharacterFieldRegistry {
		if f.Type == FieldTypeBoolean && len(f.Values) > 0 {
			t.Errorf("boolean field %q should not have enum values", f.Field)
		}
	}
}

// ---------------------------------------------------------------------------
// CharacterFieldMap
// ---------------------------------------------------------------------------

func TestCharacterFieldMap_ContainsAllRegistryFields(t *testing.T) {
	m := CharacterFieldMap()
	for _, f := range CharacterFieldRegistry {
		if _, ok := m[f.Field]; !ok {
			t.Errorf("field map missing registry field %q", f.Field)
		}
	}
}

func TestCharacterFieldMap_SameLengthAsRegistry(t *testing.T) {
	m := CharacterFieldMap()
	if len(m) != len(CharacterFieldRegistry) {
		t.Errorf("expected field map length %d, got %d", len(CharacterFieldRegistry), len(m))
	}
}
