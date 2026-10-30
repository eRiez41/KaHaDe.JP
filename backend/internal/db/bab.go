package db

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"tts-jpn/internal/models"
)

// BabRepository owns SQL access for chapters.
type BabRepository struct {
	db *sql.DB
}

func NewBabRepository(sqlDB *sql.DB) *BabRepository {
	return &BabRepository{db: sqlDB}
}

const babSummarySelect = `
SELECT
	b.id,
	b.nama,
	b.created_at,
	b.updated_at,
	COUNT(k.id) AS count_kosakata,
	COALESCE(SUM(CASE WHEN k.audio_status = 'ready' THEN 1 ELSE 0 END), 0) AS audio_ready_count
FROM bab b
LEFT JOIN kosakata k ON k.bab_id = b.id`

const babGroupBy = `
GROUP BY b.id, b.nama, b.created_at, b.updated_at`

// List returns every chapter, newest first, with its vocabulary counts.
func (r *BabRepository) List(ctx context.Context) ([]models.BabSummary, error) {
	rows, err := r.db.QueryContext(
		ctx,
		babSummarySelect+babGroupBy+` ORDER BY b.created_at DESC, b.id DESC`,
	)
	if err != nil {
		return nil, fmt.Errorf("query bab list: %w", err)
	}
	defer rows.Close()

	result := make([]models.BabSummary, 0)
	for rows.Next() {
		summary, err := scanBabSummary(rows)
		if err != nil {
			return nil, err
		}
		result = append(result, summary)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate bab list: %w", err)
	}
	return result, nil
}

// Get returns one chapter with counts. The bool reports whether it exists.
func (r *BabRepository) Get(ctx context.Context, id int64) (models.BabSummary, bool, error) {
	rows, err := r.db.QueryContext(
		ctx,
		babSummarySelect+` WHERE b.id = ?`+babGroupBy,
		id,
	)
	if err != nil {
		return models.BabSummary{}, false, fmt.Errorf("query bab %d: %w", id, err)
	}
	defer rows.Close()

	if !rows.Next() {
		if err := rows.Err(); err != nil {
			return models.BabSummary{}, false, fmt.Errorf("query bab %d: %w", id, err)
		}
		return models.BabSummary{}, false, nil
	}

	summary, err := scanBabSummary(rows)
	if err != nil {
		return models.BabSummary{}, false, err
	}
	return summary, true, nil
}

// Create inserts a chapter and returns it with its generated ID.
func (r *BabRepository) Create(ctx context.Context, nama string, now time.Time) (models.Bab, error) {
	result, err := r.db.ExecContext(
		ctx,
		`INSERT INTO bab (nama, created_at, updated_at) VALUES (?, ?, ?)`,
		nama,
		formatTime(now),
		formatTime(now),
	)
	if err != nil {
		return models.Bab{}, fmt.Errorf("insert bab: %w", err)
	}

	id, err := result.LastInsertId()
	if err != nil {
		return models.Bab{}, fmt.Errorf("read inserted bab id: %w", err)
	}

	return models.Bab{
		ID:        id,
		Nama:      nama,
		CreatedAt: now,
		UpdatedAt: now,
	}, nil
}

// Update changes a chapter name. The bool reports whether the row existed.
func (r *BabRepository) Update(ctx context.Context, id int64, nama string, now time.Time) (bool, error) {
	result, err := r.db.ExecContext(
		ctx,
		`UPDATE bab SET nama = ?, updated_at = ? WHERE id = ?`,
		nama,
		formatTime(now),
		id,
	)
	if err != nil {
		return false, fmt.Errorf("update bab %d: %w", id, err)
	}

	affected, err := result.RowsAffected()
	if err != nil {
		return false, fmt.Errorf("read updated bab rows: %w", err)
	}
	return affected > 0, nil
}

// Delete removes a chapter. Vocabulary is removed by the foreign key cascade.
func (r *BabRepository) Delete(ctx context.Context, id int64) (bool, error) {
	result, err := r.db.ExecContext(ctx, `DELETE FROM bab WHERE id = ?`, id)
	if err != nil {
		return false, fmt.Errorf("delete bab %d: %w", id, err)
	}

	affected, err := result.RowsAffected()
	if err != nil {
		return false, fmt.Errorf("read deleted bab rows: %w", err)
	}
	return affected > 0, nil
}

func scanBabSummary(rows *sql.Rows) (models.BabSummary, error) {
	var summary models.BabSummary
	var createdAt, updatedAt string

	if err := rows.Scan(
		&summary.ID,
		&summary.Nama,
		&createdAt,
		&updatedAt,
		&summary.CountKosakata,
		&summary.AudioReadyCount,
	); err != nil {
		return models.BabSummary{}, fmt.Errorf("scan bab: %w", err)
	}

	parsedCreatedAt, err := parseTime(createdAt)
	if err != nil {
		return models.BabSummary{}, fmt.Errorf("scan bab created_at: %w", err)
	}
	parsedUpdatedAt, err := parseTime(updatedAt)
	if err != nil {
		return models.BabSummary{}, fmt.Errorf("scan bab updated_at: %w", err)
	}

	summary.CreatedAt = parsedCreatedAt
	summary.UpdatedAt = parsedUpdatedAt
	return summary, nil
}
