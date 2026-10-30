package handlers

import (
	"github.com/gofiber/fiber/v2"

	"tts-jpn/internal/services"
)

// BabHandler exposes the chapter CRUD endpoints.
type BabHandler struct {
	service *services.BabService
}

func NewBabHandler(service *services.BabService) *BabHandler {
	return &BabHandler{service: service}
}

type createBabRequest struct {
	Nama string `json:"nama"`
}

type updateBabRequest struct {
	Nama *string `json:"nama"`
}

// List returns every chapter with its vocabulary counts.
func (h *BabHandler) List(c *fiber.Ctx) error {
	items, err := h.service.List(c.Context())
	if err != nil {
		return handleServiceError(err)
	}
	return c.JSON(newSuccess(items))
}

// Create adds one chapter.
func (h *BabHandler) Create(c *fiber.Ctx) error {
	var body createBabRequest
	if err := c.BodyParser(&body); err != nil {
		return invalidBody()
	}

	item, err := h.service.Create(c.Context(), body.Nama)
	if err != nil {
		return handleServiceError(err)
	}
	return c.Status(fiber.StatusCreated).JSON(newSuccess(item))
}

// Get returns one chapter.
func (h *BabHandler) Get(c *fiber.Ctx) error {
	id, err := parseID(c)
	if err != nil {
		return err
	}

	item, err := h.service.Get(c.Context(), id)
	if err != nil {
		return handleServiceError(err)
	}
	return c.JSON(newSuccess(item))
}

// Update renames one chapter.
func (h *BabHandler) Update(c *fiber.Ctx) error {
	id, err := parseID(c)
	if err != nil {
		return err
	}

	var body updateBabRequest
	if err := c.BodyParser(&body); err != nil {
		return invalidBody()
	}

	item, err := h.service.Update(c.Context(), id, body.Nama)
	if err != nil {
		return handleServiceError(err)
	}
	return c.JSON(newSuccess(item))
}

// Delete removes one chapter and its vocabulary.
func (h *BabHandler) Delete(c *fiber.Ctx) error {
	id, err := parseID(c)
	if err != nil {
		return err
	}

	if err := h.service.Delete(c.Context(), id); err != nil {
		return handleServiceError(err)
	}
	return c.SendStatus(fiber.StatusNoContent)
}
