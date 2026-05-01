package models

import (
	"testing"
)

func TestBuildQuery_KnownKey(t *testing.T) {
	expected := "SELECT COUNT(*) AS Count FROM characters"
	result := BuildQuery([]string{"count"}, "characters", "")
	if result != expected {
		t.Errorf("expected %s, got %s", expected, result)
	}
}

func TestBuildQuery_UnknownKey(t *testing.T) {
	expected := "SELECT unknown FROM characters"
	result := BuildQuery([]string{"unknown"}, "characters", "")
	if result != expected {
		t.Errorf("expected %s, got %s", expected, result)
	}
}

func TestBuildQuery_ExtraAppended(t *testing.T) {
	expected := "SELECT COUNT(*) AS Count FROM characters WHERE online = 1"
	result := BuildQuery([]string{"count"}, "characters", "WHERE online = 1")
	if result != expected {
		t.Errorf("expected %s, got %s", expected, result)
	}
}

func TestBuildQuery_ExtraOmittedWhenEmpty(t *testing.T) {
	expected := "SELECT COUNT(*) AS Count FROM characters"
	result := BuildQuery([]string{"count"}, "characters", "")
	if result != expected {
		t.Errorf("expected %s, got %s", expected, result)
	}
}
