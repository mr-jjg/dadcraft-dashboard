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

func (r *MySQLRepository) QueryDatabase(q string, args ...any) (models.TableResult, error) {
	rows, err := r.db.Query(q, args...)
	if err != nil {
		return models.TableResult{}, err
	}
	defer rows.Close()

	columns, err := rows.Columns()
	if err != nil {
		return models.TableResult{}, err
	}

	result := models.TableResult{Columns: columns, Rows: [][]string{}}

	for rows.Next() {
		row := make([]string, len(columns))
		destRow := make([]any, len(columns))
		for i := range columns {
			destRow[i] = &row[i]
		}
		if err := rows.Scan(destRow...); err != nil {
			return models.TableResult{}, err
		}
		result.Rows = append(result.Rows, row)
	}
	if err := rows.Err(); err != nil {
		return models.TableResult{}, err
	}

	return result, nil
}
