package handlers

import (
	"strings"

	"github.com/gofiber/fiber/v2"

	"tts-jpn/internal/services"
)

// TTSHandler exposes audio generation and playback endpoints.
type TTSHandler struct {
	service *services.AudioService
	kanji   *services.KanjiAudioService
}

func NewTTSHandler(service *services.AudioService, kanji *services.KanjiAudioService) *TTSHandler {
	return &TTSHandler{service: service, kanji: kanji}
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

// GenerateKanji creates MP3 files for the requested kanji lesson entries.
func (h *TTSHandler) GenerateKanji(c *fiber.Ctx) error {
	var body generateTTSRequest
	if err := c.BodyParser(&body); err != nil {
		return invalidBody()
	}

	result, err := h.kanji.Generate(c.Context(), body.IDs)
	if err != nil {
		return handleServiceError(err)
	}
	return c.Status(fiber.StatusCreated).JSON(newSuccess(result))
}

// KanjiAudio serves one generated kanji lesson MP3 by ID and language.
func (h *TTSHandler) KanjiAudio(c *fiber.Ctx) error {
	id, err := parseID(c)
	if err != nil {
		return err
	}

	lang := strings.ToLower(c.Params("lang"))
	path, err := h.kanji.AudioFile(id, lang)
	if err != nil {
		return handleServiceError(err)
	}
	return c.SendFile(path)
}
