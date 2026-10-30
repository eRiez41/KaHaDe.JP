package handlers

import (
	"github.com/gofiber/fiber/v2"

	"tts-jpn/internal/services"
)

// KosakataHandler exposes the vocabulary CRUD endpoints.
type KosakataHandler struct {
	service *services.KosakataService
}

func NewKosakataHandler(service *services.KosakataService) *KosakataHandler {
	return &KosakataHandler{service: service}
}

type createKosakataRequest struct {
	Kanji  string `json:"kanji"`
	Hira   string `json:"hira"`
	Romaji string `json:"romaji"`
	Arti   string `json:"arti"`
}

type updateKosakataRequest struct {
	Kanji  *string `json:"kanji"`
	Hira   *string `json:"hira"`
	Romaji *string `json:"romaji"`
	Arti   *string `json:"arti"`
}

type importKosakataRequest struct {
	Kosakata []importItemRequest `json:"kosakata"`
}

type importItemRequest struct {
	Kanji  string `json:"kanji"`
	Hira   string `json:"hira"`
	Romaji string `json:"romaji"`
	Arti   string `json:"arti"`
	Jepang string `json:"jepang"`
}

// ListByBab returns every vocabulary item in one chapter.
func (h *KosakataHandler) ListByBab(c *fiber.Ctx) error {
	babID, err := parseID(c)
	if err != nil {
		return err
	}

	items, err := h.service.ListByBab(c.Context(), babID)
	if err != nil {
		return handleServiceError(err)
	}
	return c.JSON(newSuccess(items))
}

// Create adds one vocabulary item to a chapter.
func (h *KosakataHandler) Create(c *fiber.Ctx) error {
	babID, err := parseID(c)
	if err != nil {
		return err
	}

	var body createKosakataRequest
	if err := c.BodyParser(&body); err != nil {
		return invalidBody()
	}

	item, err := h.service.Create(c.Context(), babID, services.KosakataInput{
		Kanji:  body.Kanji,
		Hira:   body.Hira,
		Romaji: body.Romaji,
		Arti:   body.Arti,
	})
	if err != nil {
		return handleServiceError(err)
	}
	return c.Status(fiber.StatusCreated).JSON(newSuccess(item))
}

// Import inserts many vocabulary items into one chapter.
func (h *KosakataHandler) Import(c *fiber.Ctx) error {
	babID, err := parseID(c)
	if err != nil {
		return err
	}

	var body importKosakataRequest
	if err := c.BodyParser(&body); err != nil {
		return invalidBody()
	}

	inputs := make([]services.KosakataInput, 0, len(body.Kosakata))
	for _, item := range body.Kosakata {
		kanji := item.Kanji
		if kanji == "" {
			kanji = item.Jepang
		}
		inputs = append(inputs, services.KosakataInput{
			Kanji:  kanji,
			Hira:   item.Hira,
			Romaji: item.Romaji,
			Arti:   item.Arti,
		})
	}

	result, err := h.service.Import(c.Context(), babID, inputs)
	if err != nil {
		return handleServiceError(err)
	}
	return c.Status(fiber.StatusCreated).JSON(newSuccess(result))
}

// Update changes the text fields of one vocabulary item.
func (h *KosakataHandler) Update(c *fiber.Ctx) error {
	id, err := parseID(c)
	if err != nil {
		return err
	}

	var body updateKosakataRequest
	if err := c.BodyParser(&body); err != nil {
		return invalidBody()
	}

	item, err := h.service.Update(c.Context(), id, services.KosakataPatch{
		Kanji:  body.Kanji,
		Hira:   body.Hira,
		Romaji: body.Romaji,
		Arti:   body.Arti,
	})
	if err != nil {
		return handleServiceError(err)
	}
	return c.JSON(newSuccess(item))
}

// Delete removes one vocabulary item.
func (h *KosakataHandler) Delete(c *fiber.Ctx) error {
	id, err := parseID(c)
	if err != nil {
		return err
	}

	if err := h.service.Delete(c.Context(), id); err != nil {
		return handleServiceError(err)
	}
	return c.SendStatus(fiber.StatusNoContent)
}
