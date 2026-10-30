package services

import (
	"context"
	"errors"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"testing"
	"time"

	"tts-jpn/internal/db"
	"tts-jpn/internal/models"
)

type synthCall struct {
	text  string
	voice string
}

type fakeSynth struct {
	calls []synthCall
	fn    func(text, voice string) ([]byte, error)
}

func (f *fakeSynth) Synthesize(_ context.Context, text, voice string) ([]byte, error) {
	f.calls = append(f.calls, synthCall{text: text, voice: voice})
	if f.fn != nil {
		return f.fn(text, voice)
	}
	return []byte("audio:" + voice + ":" + text), nil
}

func newAudioTestService(t *testing.T, synth Synthesizer) (*AudioService, *db.KosakataRepository, *db.BabRepository, string) {
	t.Helper()

	ctx := context.Background()
	sqlDB, err := db.Open(ctx, filepath.Join(t.TempDir(), "test.db"))
	if err != nil {
		t.Fatalf("open test db: %v", err)
	}
	t.Cleanup(func() {
		if closeErr := sqlDB.Close(); closeErr != nil {
			t.Errorf("close test db: %v", closeErr)
		}
	})
	if err := db.Migrate(ctx, sqlDB); err != nil {
		t.Fatalf("migrate test db: %v", err)
	}

	storagePath := t.TempDir()
	repo := db.NewKosakataRepository(sqlDB)
	service := NewAudioService(repo, synth, storagePath, "ja-JP-NanamiNeural", "id-ID-GadisNeural")
	return service, repo, db.NewBabRepository(sqlDB), storagePath
}

func createTestItem(t *testing.T, repo *db.KosakataRepository, babRepo *db.BabRepository) models.Kosakata {
	t.Helper()

	ctx := context.Background()
	bab, err := babRepo.Create(ctx, "Bab Test", time.Now().UTC())
	if err != nil {
		t.Fatalf("create bab: %v", err)
	}

	now := time.Now().UTC()
	item, err := repo.Create(ctx, models.Kosakata{
		BabID:       bab.ID,
		Kanji:       "東京",
		Hira:        "とうきょう",
		Romaji:      "toukyou",
		Arti:        "Tokyo",
		AudioStatus: models.AudioStatusPending,
		CreatedAt:   now,
		UpdatedAt:   now,
	})
	if err != nil {
		t.Fatalf("create kosakata: %v", err)
	}
	return item
}

func TestAudioServiceGenerateBothLanguages(t *testing.T) {
	synth := &fakeSynth{}
	service, repo, babRepo, storagePath := newAudioTestService(t, synth)
	item := createTestItem(t, repo, babRepo)

	result, err := service.Generate(context.Background(), []int64{item.ID})
	if err != nil {
		t.Fatalf("generate: %v", err)
	}
	if len(result.Failed) != 0 {
		t.Fatalf("unexpected failures: %+v", result.Failed)
	}
	if len(result.Items) != 1 {
		t.Fatalf("expected 1 item, got %d", len(result.Items))
	}

	generated := result.Items[0]
	if generated.AudioStatus != models.AudioStatusReady {
		t.Errorf("status = %q, want ready", generated.AudioStatus)
	}
	wantJP := "/api/audio/" + strconv.FormatInt(item.ID, 10) + "/jp"
	wantID := "/api/audio/" + strconv.FormatInt(item.ID, 10) + "/id"
	if generated.Audio.JP == nil || *generated.Audio.JP != wantJP {
		t.Errorf("audio jp = %v, want %q", generated.Audio.JP, wantJP)
	}
	if generated.Audio.ID == nil || *generated.Audio.ID != wantID {
		t.Errorf("audio id = %v, want %q", generated.Audio.ID, wantID)
	}

	if len(synth.calls) != 2 {
		t.Fatalf("synth calls = %d, want 2", len(synth.calls))
	}
	if synth.calls[0].text != "とうきょう" || synth.calls[0].voice != "ja-JP-NanamiNeural" {
		t.Errorf("japanese call = %+v", synth.calls[0])
	}
	if synth.calls[1].text != "Tokyo" || synth.calls[1].voice != "id-ID-GadisNeural" {
		t.Errorf("indonesian call = %+v", synth.calls[1])
	}

	jpPath := filepath.Join(storagePath, "audio", strconv.FormatInt(item.ID, 10)+"-jp.mp3")
	jpData, err := os.ReadFile(jpPath)
	if err != nil {
		t.Fatalf("read jp audio: %v", err)
	}
	if string(jpData) != "audio:ja-JP-NanamiNeural:とうきょう" {
		t.Errorf("jp audio = %q", jpData)
	}

	stored, found, err := repo.Get(context.Background(), item.ID)
	if err != nil || !found {
		t.Fatalf("get stored item: found=%v err=%v", found, err)
	}
	if stored.AudioStatus != models.AudioStatusReady {
		t.Errorf("stored status = %q", stored.AudioStatus)
	}

	path, err := service.AudioFile(item.ID, "jp")
	if err != nil {
		t.Fatalf("audio file: %v", err)
	}
	if path != jpPath {
		t.Errorf("audio file = %q, want %q", path, jpPath)
	}
}

func TestAudioServiceGenerateFallsBackToKanji(t *testing.T) {
	synth := &fakeSynth{}
	service, repo, babRepo, _ := newAudioTestService(t, synth)

	ctx := context.Background()
	bab, err := babRepo.Create(ctx, "Bab Test", time.Now().UTC())
	if err != nil {
		t.Fatalf("create bab: %v", err)
	}
	now := time.Now().UTC()
	item, err := repo.Create(ctx, models.Kosakata{
		BabID:       bab.ID,
		Kanji:       "食べる",
		Hira:        "",
		Romaji:      "taberu",
		Arti:        "makan",
		AudioStatus: models.AudioStatusPending,
		CreatedAt:   now,
		UpdatedAt:   now,
	})
	if err != nil {
		t.Fatalf("create kosakata: %v", err)
	}

	if _, err := service.Generate(ctx, []int64{item.ID}); err != nil {
		t.Fatalf("generate: %v", err)
	}
	if len(synth.calls) == 0 || synth.calls[0].text != "食べる" {
		t.Fatalf("japanese call = %+v, want kanji fallback", synth.calls)
	}
}

func TestAudioServiceMarksItemFailed(t *testing.T) {
	synth := &fakeSynth{fn: func(text, voice string) ([]byte, error) {
		if voice == "id-ID-GadisNeural" {
			return nil, errors.New("boom")
		}
		return []byte("jp-audio"), nil
	}}
	service, repo, babRepo, storagePath := newAudioTestService(t, synth)
	item := createTestItem(t, repo, babRepo)

	result, err := service.Generate(context.Background(), []int64{item.ID})
	if err != nil {
		t.Fatalf("generate: %v", err)
	}
	if len(result.Failed) != 1 {
		t.Fatalf("failed = %d, want 1", len(result.Failed))
	}
	if !strings.Contains(result.Failed[0].Message, "Indonesia") {
		t.Errorf("failure message = %q", result.Failed[0].Message)
	}
	if len(result.Items) != 1 || result.Items[0].AudioStatus != models.AudioStatusFailed {
		t.Fatalf("items = %+v", result.Items)
	}

	stored, found, err := repo.Get(context.Background(), item.ID)
	if err != nil || !found {
		t.Fatalf("get stored item: found=%v err=%v", found, err)
	}
	if stored.AudioStatus != models.AudioStatusFailed {
		t.Errorf("stored status = %q", stored.AudioStatus)
	}
	if stored.Audio.JP != nil || stored.Audio.ID != nil {
		t.Errorf("stored audio should be cleared: %+v", stored.Audio)
	}

	if _, err := os.Stat(filepath.Join(storagePath, "audio", strconv.FormatInt(item.ID, 10)+"-jp.mp3")); !errors.Is(err, os.ErrNotExist) {
		t.Errorf("jp audio should not exist, stat err = %v", err)
	}
}

func TestAudioServiceValidatesIDs(t *testing.T) {
	service, _, _, _ := newAudioTestService(t, &fakeSynth{})

	_, err := service.Generate(context.Background(), nil)
	var validationErr *ValidationError
	if !errors.As(err, &validationErr) {
		t.Fatalf("err = %v, want validation error", err)
	}

	_, err = service.Generate(context.Background(), []int64{0})
	if !errors.As(err, &validationErr) {
		t.Fatalf("err = %v, want validation error", err)
	}
}

func TestAudioServiceAudioFileRejectsUnknownLanguage(t *testing.T) {
	service, _, _, _ := newAudioTestService(t, &fakeSynth{})

	_, err := service.AudioFile(1, "fr")
	var validationErr *ValidationError
	if !errors.As(err, &validationErr) {
		t.Fatalf("err = %v, want validation error", err)
	}

	if _, err := service.AudioFile(1, "jp"); !errors.Is(err, ErrNotFound) {
		t.Fatalf("err = %v, want not found", err)
	}
}
