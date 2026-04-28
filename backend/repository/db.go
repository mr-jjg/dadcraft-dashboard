package repository

import (
	"database/sql"
	"time"

	"dadcraft-dashboard/models"
	_ "github.com/go-sql-driver/mysql"
)

type MySQLRepository  struct {
	db *sql.DB
}

func NewMySQLRepository (dsn string) (*MySQLRepository, error) {
	db, err := sql.Open("mysql", dsn)
	if err != nil {
		return nil, err
	}

	db.SetConnMaxLifetime(time.Minute * 3)
	db.SetMaxOpenConns(3)
	db.SetMaxIdleConns(3)

	return &MySQLRepository {db: db}, nil
}

func (r *MySQLRepository ) QueryScalar(q string) (float64, error) {
	var value float64
	err := r.db.QueryRow(q).Scan(&value)
	if err != nil {
		return 0, err
	}

	return value, nil
}

func (r *MySQLRepository ) QueryDistribution(q string) ([]models.LabeledValue, error) {
	rows, err := r.db.Query(q)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var results []models.LabeledValue
	for rows.Next() {
		var lv models.LabeledValue
		if err := rows.Scan(&lv.Label, &lv.Value); err != nil {
			return nil, err
		}
		results = append(results, lv)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	return results, nil
}
