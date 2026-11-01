package services

import (
	"context"

	"tts-jpn/internal/db"
	"tts-jpn/internal/models"
)

// KanjiLessonService contains the business rules for standalone kanji lessons.
type KanjiLessonService struct {
	repo       *db.KanjiLessonRepository
	lessonRepo *db.LessonRepository
}

func NewKanjiLessonService(
	repo *db.KanjiLessonRepository,
	lessonRepo *db.LessonRepository,
) *KanjiLessonService {
	return &KanjiLessonService{repo: repo, lessonRepo: lessonRepo}
}

// KanjiLessonInput is the normalized payload for create and update.
type KanjiLessonInput struct {
	LessonID int64
	Kanji    string
	Hira     string
	Romaji   string
	Arti     string
}

// KanjiLessonPatch carries only the fields sent by the client.
type KanjiLessonPatch struct {
	LessonID *int64
	Kanji    *string
	Hira     *string
	Romaji   *string
	Arti     *string
}

// KanjiLessonImportResult contains the outcome of a bulk import.
type KanjiLessonImportResult struct {
	Inserted int64                `json:"inserted"`
	Skipped  int64                `json:"skipped"`
	Errors   []ImportError        `json:"errors"`
	Items    []models.KanjiLesson `json:"items"`
}

// List returns every lesson entry in insertion order, optionally filtered by lesson.
func (s *KanjiLessonService) List(
	ctx context.Context,
	lessonID int64,
) ([]models.KanjiLesson, error) {
	return s.repo.List(ctx, lessonID)
}

// Create adds one lesson entry.
func (s *KanjiLessonService) Create(
	ctx context.Context,
	input KanjiLessonInput,
) (models.KanjiLesson, error) {
	if err := s.ensureLesson(ctx, input.LessonID); err != nil {
		return models.KanjiLesson{}, err
	}

	normalized, validationErr := validateKanjiLesson(input)
	if validationErr != nil {
		return models.KanjiLesson{}, validationErr
	}

	now := nowUTC()
	created, err := s.repo.Create(ctx, models.KanjiLesson{
		LessonID:  normalized.LessonID,
		Kanji:     normalized.Kanji,
		Hira:      normalized.Hira,
		Romaji:    normalized.Romaji,
		Arti:      normalized.Arti,
		CreatedAt: now,
		UpdatedAt: now,
	})
	if err != nil {
		return models.KanjiLesson{}, err
	}

	full, found, err := s.repo.Get(ctx, created.ID)
	if err != nil {
		return models.KanjiLesson{}, err
	}
	if found {
		return full, nil
	}
	return created, nil
}

// Import inserts many lesson entries, skipping rows that fail validation.
func (s *KanjiLessonService) Import(
	ctx context.Context,
	inputs []KanjiLessonInput,
) (KanjiLessonImportResult, error) {
	if len(inputs) == 0 {
		return KanjiLessonImportResult{}, &ValidationError{Fields: []FieldError{{
			Field:   "items",
			Message: "Minimal satu baris untuk di-import",
		}}}
	}
	if len(inputs) > 500 {
		return KanjiLessonImportResult{}, &ValidationError{Fields: []FieldError{{
			Field:   "items",
			Message: "Maksimal 500 baris per import",
		}}}
	}

	checkedLessons := make(map[int64]bool)
	for _, input := range inputs {
		if checkedLessons[input.LessonID] {
			continue
		}
		if err := s.ensureLesson(ctx, input.LessonID); err != nil {
			return KanjiLessonImportResult{}, err
		}
		checkedLessons[input.LessonID] = true
	}

	result := KanjiLessonImportResult{
		Errors: make([]ImportError, 0),
		Items:  make([]models.KanjiLesson, 0),
	}
	now := nowUTC()

	for index, input := range inputs {
		row := index + 1
		normalized, validationErr := validateKanjiLesson(input)
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

		created, err := s.repo.Create(ctx, models.KanjiLesson{
			LessonID:  normalized.LessonID,
			Kanji:     normalized.Kanji,
			Hira:      normalized.Hira,
			Romaji:    normalized.Romaji,
			Arti:      normalized.Arti,
			CreatedAt: now,
			UpdatedAt: now,
		})
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

// Update changes one lesson entry.
func (s *KanjiLessonService) Update(
	ctx context.Context,
	id int64,
	patch KanjiLessonPatch,
) (models.KanjiLesson, error) {
	existing, found, err := s.repo.Get(ctx, id)
	if err != nil {
		return models.KanjiLesson{}, err
	}
	if !found {
		return models.KanjiLesson{}, ErrNotFound
	}

	normalized, validationErr := applyKanjiLessonPatch(existing, patch)
	if validationErr != nil {
		return models.KanjiLesson{}, validationErr
	}
	if normalized.LessonID != existing.LessonID {
		if err := s.ensureLesson(ctx, normalized.LessonID); err != nil {
			return models.KanjiLesson{}, err
		}
	}

	existing.LessonID = normalized.LessonID
	existing.Kanji = normalized.Kanji
	existing.Hira = normalized.Hira
	existing.Romaji = normalized.Romaji
	existing.Arti = normalized.Arti
	existing.UpdatedAt = nowUTC()

	updated, err := s.repo.Update(ctx, existing)
	if err != nil {
		return models.KanjiLesson{}, err
	}
	if !updated {
		return models.KanjiLesson{}, ErrNotFound
	}

	full, found, err := s.repo.Get(ctx, id)
	if err != nil {
		return models.KanjiLesson{}, err
	}
	if found {
		return full, nil
	}
	return existing, nil
}

// Delete removes one lesson entry.
func (s *KanjiLessonService) Delete(ctx context.Context, id int64) error {
	deleted, err := s.repo.Delete(ctx, id)
	if err != nil {
		return err
	}
	if !deleted {
		return ErrNotFound
	}
	return nil
}

func (s *KanjiLessonService) ensureLesson(ctx context.Context, lessonID int64) error {
	if lessonID < 1 {
		return &ValidationError{Fields: []FieldError{{
			Field:   "lessonId",
			Message: "Lesson wajib dipilih",
		}}}
	}

	_, found, err := s.lessonRepo.Get(ctx, lessonID)
	if err != nil {
		return err
	}
	if !found {
		return &ValidationError{Fields: []FieldError{{
			Field:   "lessonId",
			Message: "Lesson tidak ditemukan",
		}}}
	}
	return nil
}

func validateKanjiLesson(input KanjiLessonInput) (KanjiLessonInput, *ValidationError) {
	normalized, validationErr := validateKosakata(KosakataInput{
		Kanji:  input.Kanji,
		Hira:   input.Hira,
		Romaji: input.Romaji,
		Arti:   input.Arti,
	})
	if validationErr != nil {
		return KanjiLessonInput{}, validationErr
	}
	return KanjiLessonInput{
		LessonID: input.LessonID,
		Kanji:    normalized.Kanji,
		Hira:     normalized.Hira,
		Romaji:   normalized.Romaji,
		Arti:     normalized.Arti,
	}, nil
}

func applyKanjiLessonPatch(
	existing models.KanjiLesson,
	patch KanjiLessonPatch,
) (KanjiLessonInput, *ValidationError) {
	if patch.LessonID == nil &&
		patch.Kanji == nil && patch.Hira == nil && patch.Romaji == nil && patch.Arti == nil {
		return KanjiLessonInput{}, &ValidationError{Fields: []FieldError{{
			Field:   "body",
			Message: "Minimal satu field harus diisi",
		}}}
	}

	input := KanjiLessonInput{
		LessonID: existing.LessonID,
		Kanji:    existing.Kanji,
		Hira:     existing.Hira,
		Romaji:   existing.Romaji,
		Arti:     existing.Arti,
	}

	if patch.LessonID != nil {
		input.LessonID = *patch.LessonID
	}
	if patch.Kanji != nil {
		input.Kanji = *patch.Kanji
	}
	if patch.Hira != nil {
		input.Hira = *patch.Hira
	}
	if patch.Romaji != nil {
		input.Romaji = *patch.Romaji
	}
	if patch.Arti != nil {
		input.Arti = *patch.Arti
	}

	return validateKanjiLesson(input)
}
