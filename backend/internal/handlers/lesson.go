package handlers

import (
	"github.com/gofiber/fiber/v2"

	"tts-jpn/internal/services"
)

// LessonHandler exposes the kanji lesson group endpoints.
type LessonHandler struct {
	service *services.LessonService
}

func NewLessonHandler(service *services.LessonService) *LessonHandler {
	return &LessonHandler{service: service}
}

type createLessonRequest struct {
	Nama string `json:"nama"`
}

type updateLessonRequest struct {
	Nama *string `json:"nama"`
}

// List returns every lesson with its kanji count.
func (h *LessonHandler) List(c *fiber.Ctx) error {
	items, err := h.service.List(c.Context())
	if err != nil {
		return handleServiceError(err)
	}
	return c.JSON(newSuccess(items))
}

// Create adds one lesson.
func (h *LessonHandler) Create(c *fiber.Ctx) error {
	var body createLessonRequest
	if err := c.BodyParser(&body); err != nil {
		return invalidBody()
	}

	item, err := h.service.Create(c.Context(), body.Nama)
	if err != nil {
		return handleServiceError(err)
	}
	return c.Status(fiber.StatusCreated).JSON(newSuccess(item))
}

// Update renames one lesson.
func (h *LessonHandler) Update(c *fiber.Ctx) error {
	id, err := parseID(c)
	if err != nil {
		return err
	}

	var body updateLessonRequest
	if err := c.BodyParser(&body); err != nil {
		return invalidBody()
	}

	item, err := h.service.Update(c.Context(), id, body.Nama)
	if err != nil {
		return handleServiceError(err)
	}
	return c.JSON(newSuccess(item))
}

// Delete removes one lesson and its kanji entries.
func (h *LessonHandler) Delete(c *fiber.Ctx) error {
	id, err := parseID(c)
	if err != nil {
		return err
	}

	if err := h.service.Delete(c.Context(), id); err != nil {
		return handleServiceError(err)
	}
	return c.SendStatus(fiber.StatusNoContent)
}
