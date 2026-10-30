package services

import (
	"context"

	"tts-jpn/internal/db"
	"tts-jpn/internal/models"
)

// KosakataService contains the business rules for vocabulary items.
type KosakataService struct {
	repo    *db.KosakataRepository
	babRepo *db.BabRepository
}

func NewKosakataService(repo *db.KosakataRepository, babRepo *db.BabRepository) *KosakataService {
	return &KosakataService{repo: repo, babRepo: babRepo}
}

// ImportResult contains the outcome of a bulk import.
type ImportResult struct {
	Inserted int64             `json:"inserted"`
	Skipped  int64             `json:"skipped"`
	Errors   []ImportError     `json:"errors"`
	Items    []models.Kosakata `json:"items"`
}

// ImportError describes one failed row.
type ImportError struct {
	Row     int    `json:"row"`
	Message string `json:"message"`
	Kanji   string `json:"kanji"`
	Arti    string `json:"arti"`
}

func (s *KosakataService) Import(
	ctx context.Context,
	babID int64,
	inputs []KosakataInput,
) (ImportResult, error) {
	if _, err := s.ensureBabExists(ctx, babID); err != nil {
		return ImportResult{}, err
	}
	if len(inputs) == 0 {
		return ImportResult{}, &ValidationError{Fields: []FieldError{{
			Field:   "kosakata",
			Message: "Minimal satu baris untuk di-import",
		}}}
	}
	if len(inputs) > 500 {
		return ImportResult{}, &ValidationError{Fields: []FieldError{{
			Field:   "kosakata",
			Message: "Maksimal 500 baris per import",
		}}}
	}

	result := ImportResult{
		Errors: make([]ImportError, 0),
		Items:  make([]models.Kosakata, 0),
	}
	now := nowUTC()

	for index, input := range inputs {
		row := index + 1
		normalized, validationErr := validateKosakata(input)
		if validationErr != nil {
			message := "Validasi gagal"
			if len(validationErr.Fields) > 0 {
				message = validationErr.Fields[0].Message
			}
			result.Skipped++
			result.Errors = append(result.Errors, ImportError{
				Row:     row,
				Message: message,
				Kanji:   normalizeText(input.Kanji),
				Arti:    normalizeText(input.Arti),
			})
			continue
		}

		item := models.Kosakata{
			BabID:       babID,
			Kanji:       normalized.Kanji,
			Hira:        normalized.Hira,
			Romaji:      normalized.Romaji,
			Arti:        normalized.Arti,
			Audio:       models.Audio{},
			AudioStatus: models.AudioStatusPending,
			CreatedAt:   now,
			UpdatedAt:   now,
		}

		created, err := s.repo.Create(ctx, item)
		if err != nil {
			result.Skipped++
			result.Errors = append(result.Errors, ImportError{
				Row:     row,
				Message: "Gagal menyimpan",
				Kanji:   normalized.Kanji,
				Arti:    normalized.Arti,
			})
			continue
		}

		result.Inserted++
		result.Items = append(result.Items, created)
	}

	return result, nil
}

func (s *KosakataService) ListByBab(ctx context.Context, babID int64) ([]models.Kosakata, error) {
	if _, err := s.ensureBabExists(ctx, babID); err != nil {
		return nil, err
	}
	return s.repo.ListByBab(ctx, babID)
}

func (s *KosakataService) Create(
	ctx context.Context,
	babID int64,
	input KosakataInput,
) (models.Kosakata, error) {
	if _, err := s.ensureBabExists(ctx, babID); err != nil {
		return models.Kosakata{}, err
	}

	normalized, validationErr := validateKosakata(input)
	if validationErr != nil {
		return models.Kosakata{}, validationErr
	}

	now := nowUTC()
	item := models.Kosakata{
		BabID:       babID,
		Kanji:       normalized.Kanji,
		Hira:        normalized.Hira,
		Romaji:      normalized.Romaji,
		Arti:        normalized.Arti,
		Audio:       models.Audio{},
		AudioStatus: models.AudioStatusPending,
		CreatedAt:   now,
		UpdatedAt:   now,
	}

	return s.repo.Create(ctx, item)
}

func (s *KosakataService) Update(
	ctx context.Context,
	id int64,
	patch KosakataPatch,
) (models.Kosakata, error) {
	existing, found, err := s.repo.Get(ctx, id)
	if err != nil {
		return models.Kosakata{}, err
	}
	if !found {
		return models.Kosakata{}, ErrNotFound
	}

	normalized, validationErr := applyKosakataPatch(existing, patch)
	if validationErr != nil {
		return models.Kosakata{}, validationErr
	}

	existing.Kanji = normalized.Kanji
	existing.Hira = normalized.Hira
	existing.Romaji = normalized.Romaji
	existing.Arti = normalized.Arti
	existing.UpdatedAt = nowUTC()

	updated, err := s.repo.Update(ctx, existing)
	if err != nil {
		return models.Kosakata{}, err
	}
	if !updated {
		return models.Kosakata{}, ErrNotFound
	}

	return existing, nil
}

func (s *KosakataService) Delete(ctx context.Context, id int64) error {
	deleted, err := s.repo.Delete(ctx, id)
	if err != nil {
		return err
	}
	if !deleted {
		return ErrNotFound
	}
	return nil
}

func (s *KosakataService) ensureBabExists(ctx context.Context, babID int64) (models.BabSummary, error) {
	summary, found, err := s.babRepo.Get(ctx, babID)
	if err != nil {
		return models.BabSummary{}, err
	}
	if !found {
		return models.BabSummary{}, ErrNotFound
	}
	return summary, nil
}
