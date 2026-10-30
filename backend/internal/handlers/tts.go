package handlers

import (
	"strings"

	"github.com/gofiber/fiber/v2"

	"tts-jpn/internal/services"
)

// TTSHandler exposes audio generation and playback endpoints.
type TTSHandler struct {
	service *services.AudioService
}

func NewTTSHandler(service *services.AudioService) *TTSHandler {
	return &TTSHandler{service: service}
}

type generateTTSRequest struct {
	IDs []int64 `json:"ids"`
}

// Generate creates MP3 files for the requested vocabulary items.
func (h *TTSHandler) Generate(c *fiber.Ctx) error {
	var body generateTTSRequest
	if err := c.BodyParser(&body); err != nil {
		return invalidBody()
	}

	result, err := h.service.Generate(c.Context(), body.IDs)
	if err != nil {
		return handleServiceError(err)
	}
	return c.Status(fiber.StatusCreated).JSON(newSuccess(result))
}

// Audio serves one generated MP3 file by item ID and language.
func (h *TTSHandler) Audio(c *fiber.Ctx) error {
	id, err := parseID(c)
	if err != nil {
		return err
	}

	lang := strings.ToLower(c.Params("lang"))
	path, err := h.service.AudioFile(id, lang)
	if err != nil {
		return handleServiceError(err)
	}
	return c.SendFile(path)
}
