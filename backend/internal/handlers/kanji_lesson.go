package handlers

import (
	"strconv"

	"github.com/gofiber/fiber/v2"

	"tts-jpn/internal/middleware"
	"tts-jpn/internal/services"
)

// KanjiLessonHandler exposes the standalone kanji lesson endpoints.
type KanjiLessonHandler struct {
	service *services.KanjiLessonService
}

func NewKanjiLessonHandler(service *services.KanjiLessonService) *KanjiLessonHandler {
	return &KanjiLessonHandler{service: service}
}

type kanjiLessonRequest struct {
	LessonID int64  `json:"lessonId"`
	Kanji    string `json:"kanji"`
	Jepang   string `json:"jepang"`
	Hira     string `json:"hira"`
	Romaji   string `json:"romaji"`
	Arti     string `json:"arti"`
}

type updateKanjiLessonRequest struct {
	LessonID *int64  `json:"lessonId"`
	Kanji    *string `json:"kanji"`
	Hira     *string `json:"hira"`
	Romaji   *string `json:"romaji"`
	Arti     *string `json:"arti"`
}

type importKanjiLessonRequest struct {
	LessonID int64                `json:"lessonId"`
	Items    []kanjiLessonRequest `json:"items"`
}

// List returns every kanji lesson entry, optionally filtered by lesson.
func (h *KanjiLessonHandler) List(c *fiber.Ctx) error {
	lessonID, err := parseLessonFilter(c)
	if err != nil {
		return err
	}

	items, err := h.service.List(c.Context(), lessonID)
	if err != nil {
		return handleServiceError(err)
	}
	return c.JSON(newSuccess(items))
}

// Create adds one kanji lesson entry.
func (h *KanjiLessonHandler) Create(c *fiber.Ctx) error {
	var body kanjiLessonRequest
	if err := c.BodyParser(&body); err != nil {
		return invalidBody()
	}

	item, err := h.service.Create(c.Context(), services.KanjiLessonInput{
		LessonID: body.LessonID,
		Kanji:    firstNonEmpty(body.Kanji, body.Jepang),
		Hira:     body.Hira,
		Romaji:   body.Romaji,
		Arti:     body.Arti,
	})
	if err != nil {
		return handleServiceError(err)
	}
	return c.Status(fiber.StatusCreated).JSON(newSuccess(item))
}

// Import inserts many kanji lesson entries into one lesson.
func (h *KanjiLessonHandler) Import(c *fiber.Ctx) error {
	var body importKanjiLessonRequest
	if err := c.BodyParser(&body); err != nil {
		return invalidBody()
	}

	inputs := make([]services.KanjiLessonInput, 0, len(body.Items))
	for _, item := range body.Items {
		lessonID := item.LessonID
		if lessonID == 0 {
			lessonID = body.LessonID
		}
		inputs = append(inputs, services.KanjiLessonInput{
			LessonID: lessonID,
			Kanji:    firstNonEmpty(item.Kanji, item.Jepang),
			Hira:     item.Hira,
			Romaji:   item.Romaji,
			Arti:     item.Arti,
		})
	}

	result, err := h.service.Import(c.Context(), inputs)
	if err != nil {
		return handleServiceError(err)
	}
	return c.Status(fiber.StatusCreated).JSON(newSuccess(result))
}

// Update changes one kanji lesson entry.
func (h *KanjiLessonHandler) Update(c *fiber.Ctx) error {
	id, err := parseID(c)
	if err != nil {
		return err
	}

	var body updateKanjiLessonRequest
	if err := c.BodyParser(&body); err != nil {
		return invalidBody()
	}

	item, err := h.service.Update(c.Context(), id, services.KanjiLessonPatch{
		LessonID: body.LessonID,
		Kanji:    body.Kanji,
		Hira:     body.Hira,
		Romaji:   body.Romaji,
		Arti:     body.Arti,
	})
	if err != nil {
		return handleServiceError(err)
	}
	return c.JSON(newSuccess(item))
}

// Delete removes one kanji lesson entry.
func (h *KanjiLessonHandler) Delete(c *fiber.Ctx) error {
	id, err := parseID(c)
	if err != nil {
		return err
	}

	if err := h.service.Delete(c.Context(), id); err != nil {
		return handleServiceError(err)
	}
	return c.SendStatus(fiber.StatusNoContent)
}

func firstNonEmpty(values ...string) string {
	for _, value := range values {
		if value != "" {
			return value
		}
	}
	return ""
}

func parseLessonFilter(c *fiber.Ctx) (int64, error) {
	raw := c.Query("lessonId")
	if raw == "" {
		return 0, nil
	}

	id, err := strconv.ParseInt(raw, 10, 64)
	if err != nil || id < 1 {
		return 0, middleware.NewAPIError(
			fiber.StatusBadRequest,
			"INVALID_LESSON_ID",
			"Lesson ID harus berupa angka positif",
		)
	}
	return id, nil
}
