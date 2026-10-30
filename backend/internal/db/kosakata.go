package db

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"tts-jpn/internal/models"
)

// KosakataRepository owns SQL access for vocabulary items.
type KosakataRepository struct {
	db *sql.DB
}

func NewKosakataRepository(sqlDB *sql.DB) *KosakataRepository {
	return &KosakataRepository{db: sqlDB}
}

const kosakataColumns = `
	id, bab_id, kanji, hira, romaji, arti,
	audio_jp, audio_id, audio_status, created_at, updated_at`

// ListByBab returns vocabulary for one chapter in insertion order.
func (r *KosakataRepository) ListByBab(ctx context.Context, babID int64) ([]models.Kosakata, error) {
	rows, err := r.db.QueryContext(
		ctx,
		`SELECT`+kosakataColumns+` FROM kosakata WHERE bab_id = ? ORDER BY id ASC`,
		babID,
	)
	if err != nil {
		return nil, fmt.Errorf("query kosakata for bab %d: %w", babID, err)
	}
	defer rows.Close()

	result := make([]models.Kosakata, 0)
	for rows.Next() {
		item, err := scanKosakata(rows)
		if err != nil {
			return nil, err
		}
		result = append(result, item)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate kosakata for bab %d: %w", babID, err)
	}
	return result, nil
}

// Get returns one vocabulary item. The bool reports whether it exists.
func (r *KosakataRepository) Get(ctx context.Context, id int64) (models.Kosakata, bool, error) {
	rows, err := r.db.QueryContext(
		ctx,
		`SELECT`+kosakataColumns+` FROM kosakata WHERE id = ?`,
		id,
	)
	if err != nil {
		return models.Kosakata{}, false, fmt.Errorf("query kosakata %d: %w", id, err)
	}
	defer rows.Close()

	if !rows.Next() {
		if err := rows.Err(); err != nil {
			return models.Kosakata{}, false, fmt.Errorf("query kosakata %d: %w", id, err)
		}
		return models.Kosakata{}, false, nil
	}

	item, err := scanKosakata(rows)
	if err != nil {
		return models.Kosakata{}, false, err
	}
	return item, true, nil
}

// Create inserts a vocabulary item and returns it with its generated ID.
func (r *KosakataRepository) Create(ctx context.Context, item models.Kosakata) (models.Kosakata, error) {
	result, err := r.db.ExecContext(
		ctx,
		`INSERT INTO kosakata (
			bab_id, kanji, hira, romaji, arti,
			audio_jp, audio_id, audio_status, created_at, updated_at
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		item.BabID,
		item.Kanji,
		item.Hira,
		item.Romaji,
		item.Arti,
		item.Audio.JP,
		item.Audio.ID,
		string(item.AudioStatus),
		formatTime(item.CreatedAt),
		formatTime(item.UpdatedAt),
	)
	if err != nil {
		return models.Kosakata{}, fmt.Errorf("insert kosakata: %w", err)
	}

	id, err := result.LastInsertId()
	if err != nil {
		return models.Kosakata{}, fmt.Errorf("read inserted kosakata id: %w", err)
	}

	item.ID = id
	return item, nil
}

// Update changes the editable text fields only. Audio fields are owned by TTS.
func (r *KosakataRepository) Update(ctx context.Context, item models.Kosakata) (bool, error) {
	result, err := r.db.ExecContext(
		ctx,
		`UPDATE kosakata
		SET kanji = ?, hira = ?, romaji = ?, arti = ?, updated_at = ?
		WHERE id = ?`,
		item.Kanji,
		item.Hira,
		item.Romaji,
		item.Arti,
		formatTime(item.UpdatedAt),
		item.ID,
	)
	if err != nil {
		return false, fmt.Errorf("update kosakata %d: %w", item.ID, err)
	}

	affected, err := result.RowsAffected()
	if err != nil {
		return false, fmt.Errorf("read updated kosakata rows: %w", err)
	}
	return affected > 0, nil
}

// UpdateAudio replaces the generated audio fields for one item.
func (r *KosakataRepository) UpdateAudio(
	ctx context.Context,
	id int64,
	audio models.Audio,
	status models.AudioStatus,
	updatedAt time.Time,
) (bool, error) {
	result, err := r.db.ExecContext(
		ctx,
		`UPDATE kosakata
		SET audio_jp = ?, audio_id = ?, audio_status = ?, updated_at = ?
		WHERE id = ?`,
		audio.JP,
		audio.ID,
		string(status),
		formatTime(updatedAt),
		id,
	)
	if err != nil {
		return false, fmt.Errorf("update kosakata audio %d: %w", id, err)
	}

	affected, err := result.RowsAffected()
	if err != nil {
		return false, fmt.Errorf("read updated kosakata audio rows: %w", err)
	}
	return affected > 0, nil
}

// Delete removes one vocabulary item.
func (r *KosakataRepository) Delete(ctx context.Context, id int64) (bool, error) {
	result, err := r.db.ExecContext(ctx, `DELETE FROM kosakata WHERE id = ?`, id)
	if err != nil {
		return false, fmt.Errorf("delete kosakata %d: %w", id, err)
	}

	affected, err := result.RowsAffected()
	if err != nil {
		return false, fmt.Errorf("read deleted kosakata rows: %w", err)
	}
	return affected > 0, nil
}

func scanKosakata(rows *sql.Rows) (models.Kosakata, error) {
	var item models.Kosakata
	var audioJP, audioID sql.NullString
	var audioStatus, createdAt, updatedAt string

	if err := rows.Scan(
		&item.ID,
		&item.BabID,
		&item.Kanji,
		&item.Hira,
		&item.Romaji,
		&item.Arti,
		&audioJP,
		&audioID,
		&audioStatus,
		&createdAt,
		&updatedAt,
	); err != nil {
		return models.Kosakata{}, fmt.Errorf("scan kosakata: %w", err)
	}

	if audioJP.Valid {
		value := audioJP.String
		item.Audio.JP = &value
	}
	if audioID.Valid {
		value := audioID.String
		item.Audio.ID = &value
	}
	item.AudioStatus = models.AudioStatus(audioStatus)

	parsedCreatedAt, err := parseTime(createdAt)
	if err != nil {
		return models.Kosakata{}, fmt.Errorf("scan kosakata created_at: %w", err)
	}
	parsedUpdatedAt, err := parseTime(updatedAt)
	if err != nil {
		return models.Kosakata{}, fmt.Errorf("scan kosakata updated_at: %w", err)
	}

	item.CreatedAt = parsedCreatedAt
	item.UpdatedAt = parsedUpdatedAt
	return item, nil
}
