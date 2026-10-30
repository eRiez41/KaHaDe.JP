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

const (
	audioLangJP = "jp"
	audioLangID = "id"
	maxGenerate = 100
)

// GenerateFailure explains why one vocabulary item could not be generated.
type GenerateFailure struct {
	ID      int64  `json:"id"`
	Message string `json:"message"`
}

// GenerateResult contains every processed item plus the per-item failures.
type GenerateResult struct {
	Items  []models.Kosakata `json:"items"`
	Failed []GenerateFailure `json:"failed"`
}

// AudioService generates and stores MP3 files for vocabulary items.
type AudioService struct {
	repo     *db.KosakataRepository
	synth    Synthesizer
	audioDir string
	voiceJP  string
	voiceID  string
	now      func() time.Time
}

func NewAudioService(
	repo *db.KosakataRepository,
	synth Synthesizer,
	storagePath string,
	voiceJP string,
	voiceID string,
) *AudioService {
	return &AudioService{
		repo:     repo,
		synth:    synth,
		audioDir: filepath.Join(storagePath, "audio"),
		voiceJP:  voiceJP,
		voiceID:  voiceID,
		now:      nowUTC,
	}
}

// Generate synthesizes both languages for every requested item, one item at a
// time. A failed item never aborts the rest of the batch.
func (s *AudioService) Generate(ctx context.Context, ids []int64) (GenerateResult, error) {
	uniqueIDs, validationErr := validateGenerateIDs(ids)
	if validationErr != nil {
		return GenerateResult{}, validationErr
	}

	result := GenerateResult{
		Items:  make([]models.Kosakata, 0, len(uniqueIDs)),
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

// AudioFile returns the on-disk MP3 path for one item and language.
func (s *AudioService) AudioFile(id int64, lang string) (string, error) {
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
		return "", fmt.Errorf("stat audio %d/%s: %w", id, lang, err)
	}
	if info.IsDir() {
		return "", ErrNotFound
	}
	return path, nil
}

func (s *AudioService) generateItem(ctx context.Context, id int64) (*models.Kosakata, *GenerateFailure) {
	item, found, err := s.repo.Get(ctx, id)
	if err != nil {
		return nil, &GenerateFailure{ID: id, Message: "Gagal membaca data kosakata"}
	}
	if !found {
		return nil, &GenerateFailure{ID: id, Message: "Kosakata tidak ditemukan"}
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

	jpURL := audioURL(id, audioLangJP)
	idURL := audioURL(id, audioLangID)
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

func (s *AudioService) markFailed(ctx context.Context, item *models.Kosakata) {
	s.removeAudio(item.ID)
	item.Audio = models.Audio{}
	item.AudioStatus = models.AudioStatusFailed
	item.UpdatedAt = s.now()

	updated, err := s.repo.UpdateAudio(ctx, item.ID, item.Audio, item.AudioStatus, item.UpdatedAt)
	if err != nil || !updated {
		return
	}
}

func (s *AudioService) storeAudio(id int64, jpAudio, idAudio []byte) error {
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

func (s *AudioService) removeAudio(id int64) {
	_ = os.Remove(s.audioPath(id, audioLangJP))
	_ = os.Remove(s.audioPath(id, audioLangID))
}

func (s *AudioService) audioPath(id int64, lang string) string {
	return filepath.Join(s.audioDir, fmt.Sprintf("%d-%s.mp3", id, lang))
}

func writeFileAtomic(path string, data []byte) error {
	dir := filepath.Dir(path)
	temp, err := os.CreateTemp(dir, ".audio-*.tmp")
	if err != nil {
		return err
	}
	tempName := temp.Name()
	defer func() {
		_ = os.Remove(tempName)
	}()

	if _, err := temp.Write(data); err != nil {
		_ = temp.Close()
		return err
	}
	if err := temp.Close(); err != nil {
		return err
	}
	if err := os.Chmod(tempName, 0o644); err != nil {
		return err
	}
	return os.Rename(tempName, path)
}

func audioURL(id int64, lang string) string {
	return fmt.Sprintf("/api/audio/%d/%s", id, lang)
}

func validateGenerateIDs(ids []int64) ([]int64, error) {
	if len(ids) == 0 {
		return nil, &ValidationError{Fields: []FieldError{{
			Field:   "ids",
			Message: "Pilih minimal satu kosakata",
		}}}
	}
	if len(ids) > maxGenerate {
		return nil, &ValidationError{Fields: []FieldError{{
			Field:   "ids",
			Message: fmt.Sprintf("Maksimal %d kosakata per generate", maxGenerate),
		}}}
	}

	seen := make(map[int64]struct{}, len(ids))
	unique := make([]int64, 0, len(ids))
	for _, id := range ids {
		if id < 1 {
			return nil, &ValidationError{Fields: []FieldError{{
				Field:   "ids",
				Message: "ID kosakata harus angka positif",
			}}}
		}
		if _, exists := seen[id]; exists {
			continue
		}
		seen[id] = struct{}{}
		unique = append(unique, id)
	}
	return unique, nil
}
