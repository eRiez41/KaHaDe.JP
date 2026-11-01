package db

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"tts-jpn/internal/models"
)

// LessonRepository owns SQL access for named kanji lesson groups.
type LessonRepository struct {
	db *sql.DB
}

func NewLessonRepository(sqlDB *sql.DB) *LessonRepository {
	return &LessonRepository{db: sqlDB}
}

const lessonSummarySelect = `
SELECT
	l.id,
	l.nama,
	l.created_at,
	l.updated_at,
	COUNT(k.id) AS count_kanji
FROM lesson l
LEFT JOIN kanji_lesson k ON k.lesson_id = l.id`

const lessonGroupBy = `
GROUP BY l.id, l.nama, l.created_at, l.updated_at`

// List returns every lesson ordered by creation, with its kanji count.
func (r *LessonRepository) List(ctx context.Context) ([]models.LessonSummary, error) {
	rows, err := r.db.QueryContext(
		ctx,
		lessonSummarySelect+lessonGroupBy+` ORDER BY l.id ASC`,
	)
	if err != nil {
		return nil, fmt.Errorf("query lesson list: %w", err)
	}
	defer rows.Close()

	result := make([]models.LessonSummary, 0)
	for rows.Next() {
		summary, err := scanLessonSummary(rows)
		if err != nil {
			return nil, err
		}
		result = append(result, summary)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate lesson list: %w", err)
	}
	return result, nil
}

// Get returns one lesson with its kanji count. The bool reports whether it exists.
func (r *LessonRepository) Get(ctx context.Context, id int64) (models.LessonSummary, bool, error) {
	rows, err := r.db.QueryContext(
		ctx,
		lessonSummarySelect+` WHERE l.id = ?`+lessonGroupBy,
		id,
	)
	if err != nil {
		return models.LessonSummary{}, false, fmt.Errorf("query lesson %d: %w", id, err)
	}
	defer rows.Close()

	if !rows.Next() {
		if err := rows.Err(); err != nil {
			return models.LessonSummary{}, false, fmt.Errorf("query lesson %d: %w", id, err)
		}
		return models.LessonSummary{}, false, nil
	}

	summary, err := scanLessonSummary(rows)
	if err != nil {
		return models.LessonSummary{}, false, err
	}
	return summary, true, nil
}

// Create inserts a lesson and returns it with its generated ID.
func (r *LessonRepository) Create(ctx context.Context, nama string, now time.Time) (models.Lesson, error) {
	result, err := r.db.ExecContext(
		ctx,
		`INSERT INTO lesson (nama, created_at, updated_at) VALUES (?, ?, ?)`,
		nama,
		formatTime(now),
		formatTime(now),
	)
	if err != nil {
		return models.Lesson{}, fmt.Errorf("insert lesson: %w", err)
	}

	id, err := result.LastInsertId()
	if err != nil {
		return models.Lesson{}, fmt.Errorf("read inserted lesson id: %w", err)
	}

	return models.Lesson{
		ID:        id,
		Nama:      nama,
		CreatedAt: now,
		UpdatedAt: now,
	}, nil
}

// Update renames one lesson. The bool reports whether the row existed.
func (r *LessonRepository) Update(ctx context.Context, id int64, nama string, now time.Time) (bool, error) {
	result, err := r.db.ExecContext(
		ctx,
		`UPDATE lesson SET nama = ?, updated_at = ? WHERE id = ?`,
		nama,
		formatTime(now),
		id,
	)
	if err != nil {
		return false, fmt.Errorf("update lesson %d: %w", id, err)
	}

	affected, err := result.RowsAffected()
	if err != nil {
		return false, fmt.Errorf("read updated lesson rows: %w", err)
	}
	return affected > 0, nil
}

// Delete removes a lesson and every kanji entry inside it.
func (r *LessonRepository) Delete(ctx context.Context, id int64) (bool, error) {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return false, fmt.Errorf("begin delete lesson %d: %w", id, err)
	}
	defer func() {
		_ = tx.Rollback()
	}()

	if _, err := tx.ExecContext(ctx, `DELETE FROM kanji_lesson WHERE lesson_id = ?`, id); err != nil {
		return false, fmt.Errorf("delete lesson entries %d: %w", id, err)
	}

	result, err := tx.ExecContext(ctx, `DELETE FROM lesson WHERE id = ?`, id)
	if err != nil {
		return false, fmt.Errorf("delete lesson %d: %w", id, err)
	}

	affected, err := result.RowsAffected()
	if err != nil {
		return false, fmt.Errorf("read deleted lesson rows: %w", err)
	}
	if affected == 0 {
		return false, nil
	}

	if err := tx.Commit(); err != nil {
		return false, fmt.Errorf("commit delete lesson %d: %w", id, err)
	}
	return true, nil
}

func scanLessonSummary(rows *sql.Rows) (models.LessonSummary, error) {
	var summary models.LessonSummary
	var createdAt, updatedAt string

	if err := rows.Scan(
		&summary.ID,
		&summary.Nama,
		&createdAt,
		&updatedAt,
		&summary.CountKanji,
	); err != nil {
		return models.LessonSummary{}, fmt.Errorf("scan lesson: %w", err)
	}

	parsedCreatedAt, err := parseTime(createdAt)
	if err != nil {
		return models.LessonSummary{}, fmt.Errorf("scan lesson created_at: %w", err)
	}
	parsedUpdatedAt, err := parseTime(updatedAt)
	if err != nil {
		return models.LessonSummary{}, fmt.Errorf("scan lesson updated_at: %w", err)
	}

	summary.CreatedAt = parsedCreatedAt
	summary.UpdatedAt = parsedUpdatedAt
	return summary, nil
}
