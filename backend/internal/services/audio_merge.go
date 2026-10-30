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

// AudioMergeService merges ready per-item MP3 files into one combined file.
type AudioMergeService struct {
	kosakata  *db.KosakataRepository
	babRepo   *db.BabRepository
	storage   string
	audioDir  string
	exportDir string
}

// NewAudioMergeService creates a merger that uses ffmpeg concat.
func NewAudioMergeService(kosakata *db.KosakataRepository, babRepo *db.BabRepository, storagePath string) *AudioMergeService {
	return &AudioMergeService{
		kosakata:  kosakata,
		babRepo:   babRepo,
		storage:   storagePath,
		audioDir:  filepath.Join(storagePath, "audio"),
		exportDir: filepath.Join(storagePath, "exports"),
	}
}

// MergeBab creates a merged MP3 for one chapter following JP->ID order per item.
func (s *AudioMergeService) MergeBab(ctx context.Context, babID int64) (string, string, error) {
	summary, found, err := s.babRepo.Get(ctx, babID)
	if err != nil {
		return "", "", err
	}
	if !found {
		return "", "", ErrNotFound
	}

	items, err := s.kosakata.ListByBab(ctx, babID)
	if err != nil {
		return "", "", err
	}

	if err := os.MkdirAll(s.exportDir, 0o755); err != nil {
		return "", "", fmt.Errorf("create exports dir: %w", err)
	}

	listFile, err := os.CreateTemp(s.exportDir, "merge-*.txt")
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
			path := s.itemAudioPath(item.ID, "jp")
			if _, err := os.Stat(path); err == nil {
				absPath, err := filepath.Abs(path)
				if err != nil {
					absPath = path
				}
				fmt.Fprintf(listFile, "file '%s'\n", escapeFFmpegPath(absPath))
				count++
			}
		}
		if item.Audio.ID != nil {
			path := s.itemAudioPath(item.ID, "id")
			if _, err := os.Stat(path); err == nil {
				absPath, err := filepath.Abs(path)
				if err != nil {
					absPath = path
				}
				fmt.Fprintf(listFile, "file '%s'\n", escapeFFmpegPath(absPath))
				count++
			}
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

	safeName := sanitizeFilename(summary.Nama)
	if safeName == "" {
		safeName = fmt.Sprintf("bab-%d", babID)
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

func (s *AudioMergeService) itemAudioPath(id int64, lang string) string {
	if s.audioDir == "" {
		return filepath.Join(s.storage, "audio", fmt.Sprintf("%d-%s.mp3", id, lang))
	}
	return filepath.Join(s.audioDir, fmt.Sprintf("%d-%s.mp3", id, lang))
}

func escapeFFmpegPath(path string) string {
	escaped := strings.ReplaceAll(path, `\`, `\\`)
	escaped = strings.ReplaceAll(escaped, `'`, `\'`)
	return escaped
}

func sanitizeFilename(name string) string {
	name = strings.TrimSpace(name)
	if name == "" {
		return ""
	}
	var b strings.Builder
	for _, r := range name {
		if (r >= 'a' && r <= 'z') || (r >= 'A' && r <= 'Z') || (r >= '0' && r <= '9') || r == '-' || r == '_' {
			b.WriteRune(r)
			continue
		}
		if r == ' ' {
			b.WriteRune('-')
			continue
		}
	}
	result := strings.Trim(b.String(), "-_")
	if len(result) > 60 {
		result = result[:60]
	}
	return result
}
