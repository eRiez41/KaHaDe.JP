package handlers

import (
	"strings"

	"github.com/gofiber/fiber/v2"

	"tts-jpn/internal/middleware"
	"tts-jpn/internal/services"
)

// DictionaryHandler exposes dictionary validation for the conjugation tool.
type DictionaryHandler struct {
	service *services.JishoDictionary
}

func NewDictionaryHandler(service *services.JishoDictionary) *DictionaryHandler {
	return &DictionaryHandler{service: service}
}

// Lookup validates that a word exists in the dictionary and returns its
// meanings and metadata. The query is the analyzer's dictionary form.
func (h *DictionaryHandler) Lookup(c *fiber.Ctx) error {
	query := strings.TrimSpace(c.Query("q"))
	if query == "" {
		return middleware.NewAPIError(
			fiber.StatusBadRequest,
			"INVALID_QUERY",
			"Parameter q wajib diisi",
		)
	}
	if len([]rune(query)) > 50 {
		return middleware.NewAPIError(
			fiber.StatusBadRequest,
			"INVALID_QUERY",
			"Parameter q terlalu panjang",
		)
	}

	entry, err := h.service.Lookup(c.UserContext(), query)
	if err != nil {
		return handleServiceError(err)
	}
	return c.JSON(newSuccess(entry))
}
