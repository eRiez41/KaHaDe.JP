package services

import (
	"context"

	"tts-jpn/internal/db"
	"tts-jpn/internal/models"
)

// LessonService contains the business rules for named kanji lesson groups.
type LessonService struct {
	repo *db.LessonRepository
}

func NewLessonService(repo *db.LessonRepository) *LessonService {
	return &LessonService{repo: repo}
}

func (s *LessonService) List(ctx context.Context) ([]models.LessonSummary, error) {
	return s.repo.List(ctx)
}

func (s *LessonService) Get(ctx context.Context, id int64) (models.LessonSummary, error) {
	summary, found, err := s.repo.Get(ctx, id)
	if err != nil {
		return models.LessonSummary{}, err
	}
	if !found {
		return models.LessonSummary{}, ErrNotFound
	}
	return summary, nil
}

func (s *LessonService) Create(ctx context.Context, nama string) (models.Lesson, error) {
	normalized, validationErr := validateLessonName(nama)
	if validationErr != nil {
		return models.Lesson{}, validationErr
	}

	return s.repo.Create(ctx, normalized, nowUTC())
}

func (s *LessonService) Update(ctx context.Context, id int64, nama *string) (models.LessonSummary, error) {
	normalized, validationErr := validateLessonPatch(nama)
	if validationErr != nil {
		return models.LessonSummary{}, validationErr
	}

	updated, err := s.repo.Update(ctx, id, normalized, nowUTC())
	if err != nil {
		return models.LessonSummary{}, err
	}
	if !updated {
		return models.LessonSummary{}, ErrNotFound
	}

	return s.Get(ctx, id)
}

func (s *LessonService) Delete(ctx context.Context, id int64) error {
	deleted, err := s.repo.Delete(ctx, id)
	if err != nil {
		return err
	}
	if !deleted {
		return ErrNotFound
	}
	return nil
}
