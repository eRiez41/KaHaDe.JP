package services

import (
	"context"
	"time"

	"tts-jpn/internal/db"
	"tts-jpn/internal/models"
)

// BabService contains the business rules for chapters.
type BabService struct {
	repo *db.BabRepository
}

func NewBabService(repo *db.BabRepository) *BabService {
	return &BabService{repo: repo}
}

func (s *BabService) List(ctx context.Context) ([]models.BabSummary, error) {
	return s.repo.List(ctx)
}

func (s *BabService) Get(ctx context.Context, id int64) (models.BabSummary, error) {
	summary, found, err := s.repo.Get(ctx, id)
	if err != nil {
		return models.BabSummary{}, err
	}
	if !found {
		return models.BabSummary{}, ErrNotFound
	}
	return summary, nil
}

func (s *BabService) Create(ctx context.Context, nama string) (models.Bab, error) {
	normalized, validationErr := validateBabName(nama)
	if validationErr != nil {
		return models.Bab{}, validationErr
	}

	return s.repo.Create(ctx, normalized, nowUTC())
}

func (s *BabService) Update(ctx context.Context, id int64, nama *string) (models.BabSummary, error) {
	normalized, validationErr := validateBabPatch(nama)
	if validationErr != nil {
		return models.BabSummary{}, validationErr
	}

	updated, err := s.repo.Update(ctx, id, normalized, nowUTC())
	if err != nil {
		return models.BabSummary{}, err
	}
	if !updated {
		return models.BabSummary{}, ErrNotFound
	}

	return s.Get(ctx, id)
}

func (s *BabService) Delete(ctx context.Context, id int64) error {
	deleted, err := s.repo.Delete(ctx, id)
	if err != nil {
		return err
	}
	if !deleted {
		return ErrNotFound
	}
	return nil
}

func nowUTC() time.Time {
	return time.Now().UTC().Truncate(time.Millisecond)
}
