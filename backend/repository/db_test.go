package repository

import (
	"fmt"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
)

func TestQueryDatabase_Success(t *testing.T) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("an error '%s' was not expected when opening a stub database connection", err)
	}
	defer db.Close()

	mock.ExpectQuery("SELECT race").WillReturnRows(
		sqlmock.NewRows([]string{"race", "count"}).
			AddRow("Human", "42").
			AddRow("Orc", "38"),
	)

	repo := &MySQLRepository{db: db}
	result, err := repo.QueryDatabase("SELECT race, COUNT(*) FROM characters GROUP BY race")

	if err != nil {
		t.Fatalf("unexpected error: %s", err)
	}
	if len(result.Columns) != 2 {
		t.Errorf("expected 2 columns, got %d", len(result.Columns))
	}
	if result.Columns[0] != "race" {
		t.Errorf("expected column 'race', got %s", result.Columns[0])
	}
	if len(result.Rows) != 2 {
		t.Errorf("expected 2 rows, got %d", len(result.Rows))
	}
	if result.Rows[0][0] != "Human" {
		t.Errorf("expected 'Human', got %s", result.Rows[0][0])
	}
	if result.Rows[0][1] != "42" {
		t.Errorf("expected '42', got %s", result.Rows[0][1])
	}

	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("unfulfilled expectations: %s", err)
	}
}

func TestQueryDatabase_Error(t *testing.T) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("an error '%s' was not expected when opening a stub database connection", err)
	}
	defer db.Close()

	mock.ExpectQuery("SELECT race").WillReturnError(fmt.Errorf("db unavailable"))

	repo := &MySQLRepository{db: db}
	_, err = repo.QueryDatabase("SELECT race, COUNT(*) FROM characters GROUP BY race")

	if err == nil {
		t.Errorf("was expecting an error, but there was none")
	}

	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("there were unfulfilled expectations: %s", err)
	}
}
