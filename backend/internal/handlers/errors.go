package handlers

import (
	"errors"
	"strconv"

	"github.com/gofiber/fiber/v2"

	"tts-jpn/internal/middleware"
	"tts-jpn/internal/services"
)

// successResponse is the standard envelope for successful requests.
type successResponse[T any] struct {
	Success bool `json:"success"`
	Data    T    `json:"data"`
}

func newSuccess[T any](data T) successResponse[T] {
	return successResponse[T]{Success: true, Data: data}
}

func parseID(c *fiber.Ctx) (int64, error) {
	id, err := strconv.ParseInt(c.Params("id"), 10, 64)
	if err != nil || id < 1 {
		return 0, middleware.NewAPIError(
			fiber.StatusBadRequest,
			"INVALID_ID",
			"ID harus berupa angka positif",
		)
	}
	return id, nil
}

func invalidBody() error {
	return middleware.NewAPIError(
		fiber.StatusBadRequest,
		"INVALID_BODY",
		"Body request tidak valid",
	)
}

// handleServiceError maps service-layer errors onto HTTP responses.
func handleServiceError(err error) error {
	if err == nil {
		return nil
	}

	if errors.Is(err, services.ErrWordNotFound) {
		return middleware.NewAPIError(
			fiber.StatusNotFound,
			"WORD_NOT_FOUND",
			services.ErrWordNotFound.Error(),
		)
	}

	if errors.Is(err, services.ErrDictionaryUnavailable) {
		return middleware.NewAPIError(
			fiber.StatusBadGateway,
			"DICTIONARY_UNAVAILABLE",
			services.ErrDictionaryUnavailable.Error(),
		)
	}

	if errors.Is(err, services.ErrNotFound) {
		return middleware.NewAPIError(
			fiber.StatusNotFound,
			"NOT_FOUND",
			services.ErrNotFound.Error(),
		)
	}

	var validationErr *services.ValidationError
	if errors.As(err, &validationErr) {
		details := make([]middleware.FieldError, 0, len(validationErr.Fields))
		for _, field := range validationErr.Fields {
			details = append(details, middleware.FieldError{
				Field:   field.Field,
				Message: field.Message,
			})
		}
		return middleware.NewValidationError(validationErr.Error(), details)
	}

	return err
}
