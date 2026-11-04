package services

import (
	"context"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"

	"tts-jpn/internal/db"
	"tts-jpn/internal/models"
)

// KanjiAudioMergeService merges ready kanji lesson MP3 files into one file.
type KanjiAudioMergeService struct {
	lessons    *db.KanjiLessonRepository
	lessonRepo *db.LessonRepository
	storage    string
	audioDir   string
	exportDir  string
}

func NewKanjiAudioMergeService(
	lessons *db.KanjiLessonRepository,
	lessonRepo *db.LessonRepository,
	storagePath string,
) *KanjiAudioMergeService {
	return &KanjiAudioMergeService{
		lessons:    lessons,
		lessonRepo: lessonRepo,
		storage:    storagePath,
		audioDir:   filepath.Join(storagePath, "audio"),
		exportDir:  filepath.Join(storagePath, "exports"),
	}
}

// MergeLesson creates a merged MP3 for one lesson, or every lesson when
// lessonID is 0, following JP->ID order per entry.
func (s *KanjiAudioMergeService) MergeLesson(ctx context.Context, lessonID int64) (string, string, error) {
	name := "semua-lesson"
	if lessonID > 0 {
		summary, found, err := s.lessonRepo.Get(ctx, lessonID)
		if err != nil {
			return "", "", err
		}
		if !found {
			return "", "", ErrNotFound
		}
		name = summary.Nama
	}

	items, err := s.lessons.List(ctx, lessonID)
	if err != nil {
		return "", "", err
	}

	if err := os.MkdirAll(s.exportDir, 0o755); err != nil {
		return "", "", fmt.Errorf("create exports dir: %w", err)
	}

	listFile, err := os.CreateTemp(s.exportDir, "merge-kanji-*.txt")
	if err != nil {
		return "", "", fmt.Errorf("create merge list: %w", err)
	}
	listPath := listFile.Name()
	defer func() {
		_ = os.Remove(listPath)
	}()

	count := 0
	for _, item := range items {
		if item.AudioStatus != models.AudioStatusReady {
			continue
		}
		if item.Audio.JP != nil {
			count += s.appendTrack(listFile, item.ID, "jp")
		}
		if item.Audio.ID != nil {
			count += s.appendTrack(listFile, item.ID, "id")
		}
	}
	if err := listFile.Close(); err != nil {
		return "", "", fmt.Errorf("close merge list: %w", err)
	}

	if count == 0 {
		return "", "", &ValidationError{Fields: []FieldError{{
			Field:   "audio",
			Message: "Tidak ada audio siap untuk digabung",
		}}}
	}

	safeName := sanitizeFilename(name)
	if safeName == "" {
		safeName = fmt.Sprintf("kanji-lesson-%d", lessonID)
	}
	filename := fmt.Sprintf("%s-%d.mp3", safeName, time.Now().Unix())
	outPath := filepath.Join(s.exportDir, filename)

	cmd := exec.CommandContext(ctx, "ffmpeg",
		"-f", "concat",
		"-safe", "0",
		"-i", listPath,
		"-c", "copy",
		"-y",
		outPath,
	)
	output, err := cmd.CombinedOutput()
	if err != nil {
		return "", "", fmt.Errorf("merge audio: %s", strings.TrimSpace(string(output)))
	}

	if _, err := os.Stat(outPath); err != nil {
		return "", "", fmt.Errorf("merged file not found: %w", err)
	}

	return filename, outPath, nil
}

func (s *KanjiAudioMergeService) appendTrack(listFile *os.File, id int64, lang string) int {
	path := filepath.Join(s.audioDir, kanjiAudioFilename(id, lang))
	if _, err := os.Stat(path); err != nil {
		return 0
	}

	absPath, err := filepath.Abs(path)
	if err != nil {
		absPath = path
	}
	fmt.Fprintf(listFile, "file '%s'\n", escapeFFmpegPath(absPath))
	return 1
}
