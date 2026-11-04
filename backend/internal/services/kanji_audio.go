package services

import (
	"context"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"

	"tts-jpn/internal/db"
	"tts-jpn/internal/models"
)

// KanjiGenerateResult contains every processed lesson entry plus failures.
type KanjiGenerateResult struct {
	Items  []models.KanjiLesson `json:"items"`
	Failed []GenerateFailure    `json:"failed"`
}

// KanjiAudioService generates and stores MP3 files for kanji lesson entries.
type KanjiAudioService struct {
	repo     *db.KanjiLessonRepository
	synth    Synthesizer
	audioDir string
	voiceJP  string
	voiceID  string
	now      func() time.Time
}

func NewKanjiAudioService(
	repo *db.KanjiLessonRepository,
	synth Synthesizer,
	storagePath string,
	voiceJP string,
	voiceID string,
) *KanjiAudioService {
	return &KanjiAudioService{
		repo:     repo,
		synth:    synth,
		audioDir: filepath.Join(storagePath, "audio"),
		voiceJP:  voiceJP,
		voiceID:  voiceID,
		now:      nowUTC,
	}
}

// Generate synthesizes Japanese and Indonesian audio for every requested entry.
// One failed entry never aborts the rest of the batch.
func (s *KanjiAudioService) Generate(ctx context.Context, ids []int64) (KanjiGenerateResult, error) {
	uniqueIDs, validationErr := validateGenerateIDs(ids)
	if validationErr != nil {
		return KanjiGenerateResult{}, validationErr
	}

	result := KanjiGenerateResult{
		Items:  make([]models.KanjiLesson, 0, len(uniqueIDs)),
		Failed: make([]GenerateFailure, 0),
	}

	for _, id := range uniqueIDs {
		item, failure := s.generateItem(ctx, id)
		if failure != nil {
			result.Failed = append(result.Failed, *failure)
			if item != nil {
				result.Items = append(result.Items, *item)
			}
			continue
		}
		result.Items = append(result.Items, *item)
	}

	return result, nil
}

// AudioFile returns the on-disk MP3 path for one lesson entry and language.
func (s *KanjiAudioService) AudioFile(id int64, lang string) (string, error) {
	if lang != audioLangJP && lang != audioLangID {
		return "", &ValidationError{Fields: []FieldError{{
			Field:   "lang",
			Message: "Bahasa audio harus jp atau id",
		}}}
	}
	if id < 1 {
		return "", ErrNotFound
	}

	path := s.audioPath(id, lang)
	info, err := os.Stat(path)
	if err != nil {
		if errors.Is(err, os.ErrNotExist) {
			return "", ErrNotFound
		}
		return "", fmt.Errorf("stat kanji audio %d/%s: %w", id, lang, err)
	}
	if info.IsDir() {
		return "", ErrNotFound
	}
	return path, nil
}

func (s *KanjiAudioService) generateItem(ctx context.Context, id int64) (*models.KanjiLesson, *GenerateFailure) {
	item, found, err := s.repo.Get(ctx, id)
	if err != nil {
		return nil, &GenerateFailure{ID: id, Message: "Gagal membaca data kanji lesson"}
	}
	if !found {
		return nil, &GenerateFailure{ID: id, Message: "Kanji lesson tidak ditemukan"}
	}

	jpText := strings.TrimSpace(item.Hira)
	if jpText == "" {
		jpText = strings.TrimSpace(item.Kanji)
	}
	idText := strings.TrimSpace(item.Arti)

	if jpText == "" || idText == "" {
		s.markFailed(ctx, &item)
		return &item, &GenerateFailure{ID: id, Message: "Teks Jepang atau arti kosong"}
	}

	jpAudio, err := s.synth.Synthesize(ctx, jpText, s.voiceJP)
	if err != nil {
		s.markFailed(ctx, &item)
		return &item, &GenerateFailure{ID: id, Message: "Gagal generate audio Jepang: " + err.Error()}
	}
	idAudio, err := s.synth.Synthesize(ctx, idText, s.voiceID)
	if err != nil {
		s.markFailed(ctx, &item)
		return &item, &GenerateFailure{ID: id, Message: "Gagal generate audio Indonesia: " + err.Error()}
	}

	if err := s.storeAudio(id, jpAudio, idAudio); err != nil {
		s.markFailed(ctx, &item)
		return &item, &GenerateFailure{ID: id, Message: "Gagal menyimpan audio: " + err.Error()}
	}

	jpURL := kanjiAudioURL(id, audioLangJP)
	idURL := kanjiAudioURL(id, audioLangID)
	item.Audio = models.Audio{JP: &jpURL, ID: &idURL}
	item.AudioStatus = models.AudioStatusReady
	item.UpdatedAt = s.now()

	updated, err := s.repo.UpdateAudio(ctx, id, item.Audio, item.AudioStatus, item.UpdatedAt)
	if err != nil || !updated {
		s.removeAudio(id)
		item.Audio = models.Audio{}
		item.AudioStatus = models.AudioStatusFailed
		return &item, &GenerateFailure{ID: id, Message: "Gagal menyimpan status audio"}
	}

	return &item, nil
}

func (s *KanjiAudioService) markFailed(ctx context.Context, item *models.KanjiLesson) {
	s.removeAudio(item.ID)
	item.Audio = models.Audio{}
	item.AudioStatus = models.AudioStatusFailed
	item.UpdatedAt = s.now()

	_, _ = s.repo.UpdateAudio(ctx, item.ID, item.Audio, item.AudioStatus, item.UpdatedAt)
}

func (s *KanjiAudioService) storeAudio(id int64, jpAudio, idAudio []byte) error {
	if err := os.MkdirAll(s.audioDir, 0o755); err != nil {
		return err
	}

	jpPath := s.audioPath(id, audioLangJP)
	idPath := s.audioPath(id, audioLangID)

	if err := writeFileAtomic(jpPath, jpAudio); err != nil {
		return err
	}
	if err := writeFileAtomic(idPath, idAudio); err != nil {
		_ = os.Remove(jpPath)
		return err
	}
	return nil
}

func (s *KanjiAudioService) removeAudio(id int64) {
	_ = os.Remove(s.audioPath(id, audioLangJP))
	_ = os.Remove(s.audioPath(id, audioLangID))
}

func (s *KanjiAudioService) audioPath(id int64, lang string) string {
	return filepath.Join(s.audioDir, kanjiAudioFilename(id, lang))
}

func kanjiAudioFilename(id int64, lang string) string {
	return fmt.Sprintf("kanji-%d-%s.mp3", id, lang)
}

func kanjiAudioURL(id int64, lang string) string {
	return fmt.Sprintf("/api/kanji-audio/%d/%s", id, lang)
}
