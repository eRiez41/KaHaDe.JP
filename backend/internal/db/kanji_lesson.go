package db

import (
	"context"
	"database/sql"
	"fmt"

	"tts-jpn/internal/models"
)

// KanjiLessonRepository owns SQL access for standalone kanji lessons.
type KanjiLessonRepository struct {
	db *sql.DB
}

func NewKanjiLessonRepository(sqlDB *sql.DB) *KanjiLessonRepository {
	return &KanjiLessonRepository{db: sqlDB}
}

const kanjiLessonSelect = `
SELECT
	k.id,
	k.lesson_id,
	COALESCE(l.nama, ''),
	k.kanji,
	k.hira,
	k.romaji,
	k.arti,
	k.created_at,
	k.updated_at
FROM kanji_lesson k
LEFT JOIN lesson l ON l.id = k.lesson_id`

// List returns lesson entries in insertion order. A positive lessonID filters them.
func (r *KanjiLessonRepository) List(ctx context.Context, lessonID int64) ([]models.KanjiLesson, error) {
	query := kanjiLessonSelect
	args := make([]any, 0, 1)
	if lessonID > 0 {
		query += ` WHERE k.lesson_id = ?`
		args = append(args, lessonID)
	}
	query += ` ORDER BY k.id ASC`

	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("query kanji lessons: %w", err)
	}
	defer rows.Close()

	result := make([]models.KanjiLesson, 0)
	for rows.Next() {
		item, err := scanKanjiLesson(rows)
		if err != nil {
			return nil, err
		}
		result = append(result, item)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate kanji lessons: %w", err)
	}
	return result, nil
}

// Get returns one lesson entry. The bool reports whether it exists.
func (r *KanjiLessonRepository) Get(ctx context.Context, id int64) (models.KanjiLesson, bool, error) {
	rows, err := r.db.QueryContext(
		ctx,
		kanjiLessonSelect+` WHERE k.id = ?`,
		id,
	)
	if err != nil {
		return models.KanjiLesson{}, false, fmt.Errorf("query kanji lesson %d: %w", id, err)
	}
	defer rows.Close()

	if !rows.Next() {
		if err := rows.Err(); err != nil {
			return models.KanjiLesson{}, false, fmt.Errorf("query kanji lesson %d: %w", id, err)
		}
		return models.KanjiLesson{}, false, nil
	}

	item, err := scanKanjiLesson(rows)
	if err != nil {
		return models.KanjiLesson{}, false, err
	}
	return item, true, nil
}

// Create inserts a lesson entry and returns it with its generated ID.
func (r *KanjiLessonRepository) Create(ctx context.Context, item models.KanjiLesson) (models.KanjiLesson, error) {
	result, err := r.db.ExecContext(
		ctx,
		`INSERT INTO kanji_lesson (
			lesson_id, kanji, hira, romaji, arti, created_at, updated_at
		) VALUES (?, ?, ?, ?, ?, ?, ?)`,
		item.LessonID,
		item.Kanji,
		item.Hira,
		item.Romaji,
		item.Arti,
		formatTime(item.CreatedAt),
		formatTime(item.UpdatedAt),
	)
	if err != nil {
		return models.KanjiLesson{}, fmt.Errorf("insert kanji lesson: %w", err)
	}

	id, err := result.LastInsertId()
	if err != nil {
		return models.KanjiLesson{}, fmt.Errorf("read inserted kanji lesson id: %w", err)
	}

	item.ID = id
	return item, nil
}

// Update changes the editable fields of one lesson entry.
func (r *KanjiLessonRepository) Update(ctx context.Context, item models.KanjiLesson) (bool, error) {
	result, err := r.db.ExecContext(
		ctx,
		`UPDATE kanji_lesson
		SET lesson_id = ?, kanji = ?, hira = ?, romaji = ?, arti = ?, updated_at = ?
		WHERE id = ?`,
		item.LessonID,
		item.Kanji,
		item.Hira,
		item.Romaji,
		item.Arti,
		formatTime(item.UpdatedAt),
		item.ID,
	)
	if err != nil {
		return false, fmt.Errorf("update kanji lesson %d: %w", item.ID, err)
	}

	affected, err := result.RowsAffected()
	if err != nil {
		return false, fmt.Errorf("read updated kanji lesson rows: %w", err)
	}
	return affected > 0, nil
}

// Delete removes one lesson entry.
func (r *KanjiLessonRepository) Delete(ctx context.Context, id int64) (bool, error) {
	result, err := r.db.ExecContext(ctx, `DELETE FROM kanji_lesson WHERE id = ?`, id)
	if err != nil {
		return false, fmt.Errorf("delete kanji lesson %d: %w", id, err)
	}

	affected, err := result.RowsAffected()
	if err != nil {
		return false, fmt.Errorf("read deleted kanji lesson rows: %w", err)
	}
	return affected > 0, nil
}

func scanKanjiLesson(rows *sql.Rows) (models.KanjiLesson, error) {
	var item models.KanjiLesson
	var createdAt, updatedAt string

	if err := rows.Scan(
		&item.ID,
		&item.LessonID,
		&item.LessonNama,
		&item.Kanji,
		&item.Hira,
		&item.Romaji,
		&item.Arti,
		&createdAt,
		&updatedAt,
	); err != nil {
		return models.KanjiLesson{}, fmt.Errorf("scan kanji lesson: %w", err)
	}

	parsedCreatedAt, err := parseTime(createdAt)
	if err != nil {
		return models.KanjiLesson{}, fmt.Errorf("scan kanji lesson created_at: %w", err)
	}
	parsedUpdatedAt, err := parseTime(updatedAt)
	if err != nil {
		return models.KanjiLesson{}, fmt.Errorf("scan kanji lesson updated_at: %w", err)
	}

	item.CreatedAt = parsedCreatedAt
	item.UpdatedAt = parsedUpdatedAt
	return item, nil
}
