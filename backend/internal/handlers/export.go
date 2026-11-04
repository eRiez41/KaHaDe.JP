package handlers

import (
	"strconv"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"

	"tts-jpn/internal/middleware"
	"tts-jpn/internal/services"
)

// ExportHandler handles JSON export and merged audio download.
type ExportHandler struct {
	audioMerge *services.AudioMergeService
	kanjiMerge *services.KanjiAudioMergeService
	kosakata   *services.KosakataService
	bab        *services.BabService
}

func NewExportHandler(
	audioMerge *services.AudioMergeService,
	kanjiMerge *services.KanjiAudioMergeService,
	kosakata *services.KosakataService,
	bab *services.BabService,
) *ExportHandler {
	return &ExportHandler{
		audioMerge: audioMerge,
		kanjiMerge: kanjiMerge,
		kosakata:   kosakata,
		bab:        bab,
	}
}

// DownloadBabAudio merges ready audio for a chapter and serves the file.
func (h *ExportHandler) DownloadBabAudio(c *fiber.Ctx) error {
	babID, err := parseID(c)
	if err != nil {
		return err
	}

	filename, path, err := h.audioMerge.MergeBab(c.Context(), babID)
	if err != nil {
		return handleServiceError(err)
	}

	c.Set("Content-Type", "audio/mpeg")
	c.Set("Content-Disposition", `attachment; filename="`+filename+`"`)
	return c.SendFile(path)
}

// DownloadKanjiLessonAudio merges ready audio for one lesson (0 = all) and
// serves the file.
func (h *ExportHandler) DownloadKanjiLessonAudio(c *fiber.Ctx) error {
	lessonID, err := strconv.ParseInt(c.Params("lessonId"), 10, 64)
	if err != nil || lessonID < 0 {
		return middleware.NewAPIError(
			fiber.StatusBadRequest,
			"INVALID_LESSON_ID",
			"Lesson ID harus 0 atau angka positif",
		)
	}

	filename, path, err := h.kanjiMerge.MergeLesson(c.Context(), lessonID)
	if err != nil {
		return handleServiceError(err)
	}

	c.Set("Content-Type", "audio/mpeg")
	c.Set("Content-Disposition", `attachment; filename="`+filename+`"`)
	return c.SendFile(path)
}

// ExportBabJSON exports one chapter's vocabulary as JSON.
func (h *ExportHandler) ExportBabJSON(c *fiber.Ctx) error {
	babID, err := parseID(c)
	if err != nil {
		return err
	}

	babSummary, err := h.bab.Get(c.Context(), babID)
	if err != nil {
		return handleServiceError(err)
	}

	items, err := h.kosakata.ListByBab(c.Context(), babID)
	if err != nil {
		return handleServiceError(err)
	}

	export := fiber.Map{
		"bab":        babSummary.Nama,
		"exportedAt": time.Now().UTC().Format(time.RFC3339),
		"kosakata":   items,
	}

	filename := sanitizeExportFilename(babSummary.Nama) + ".json"
	c.Set("Content-Disposition", `attachment; filename="`+filename+`"`)
	return c.JSON(export)
}

func sanitizeExportFilename(name string) string {
	name = strings.TrimSpace(name)
	if name == "" {
		return "bab-export"
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
	if result == "" {
		return "bab-export"
	}
	return result
}
