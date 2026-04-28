package repository

import (
	"fmt"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
)

func TestQueryScalar_Success(t *testing.T) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("an error '%s' was not expected when opening a stub database connection", err)
	}
	defer db.Close()

	mock.ExpectQuery("SELECT COUNT").WillReturnRows(
		sqlmock.NewRows([]string{"count"}).AddRow(212),
	)

	repo := &MySQLRepository{db: db}
	value, err := repo.QueryScalar("SELECT COUNT(*) FROM characters")

	if err != nil {
		t.Errorf("there were unfulfilled expectations: %s", err)
	}

	if value != 212 {
		t.Errorf("expected 212, got %f", value)
	}

	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("unfulfilled expectations: %s", err)
	}
}

func TestQueryScalar_Error(t *testing.T) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("an error '%s' was not expected when opening a stub database connection", err)
	}
	defer db.Close()

	mock.ExpectQuery("SELECT COUNT").WillReturnError(fmt.Errorf("some error"))

	repo := &MySQLRepository{db: db}
	_, err = repo.QueryScalar("SELECT COUNT(*) FROM characters")

	if err == nil {
		t.Errorf("was expecting an error, but there was none")
	}

	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("there were unfulfilled expectations: %s", err)
	}
}

func TestQueryDistribution_Success(t *testing.T) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("an error '%s' was not expected when opening a stub database connection", err)
	}
	defer db.Close()

	mock.ExpectQuery("SELECT race").WillReturnRows(
		sqlmock.NewRows([]string{"label", "value"}).
			AddRow("Human", 42).
			AddRow("Orc", 38),
	)

	repo := &MySQLRepository{db: db}
	value, err := repo.QueryDistribution("SELECT race, COUNT(*) FROM characters GROUP BY race")

	if err != nil {
		t.Fatalf("unexpected error: %s", err)
	}
	if len(value) != 2 {
		t.Errorf("expected 2 rows, got %d", len(value))
	}
	if value[0].Label != "Human" {
		t.Errorf("expected Human, got %s", value[0].Label)
	}
	if value[0].Value != 42 {
		t.Errorf("expected 42, got %f", value[0].Value)
	}
}

func TestQueryDistribution_Error(t *testing.T) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("an error '%s' was not expected when opening a stub database connection", err)
	}
	defer db.Close()

	mock.ExpectQuery("SELECT race").WillReturnError(fmt.Errorf("db unavailable"))

	repo := &MySQLRepository{db: db}
	_, err = repo.QueryDistribution("SELECT race, COUNT(*) FROM characters GROUP BY race")

	if err == nil {
		t.Errorf("was expecting an error, but there was none")
	}

	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("there were unfulfilled expectations: %s", err)
	}
}
