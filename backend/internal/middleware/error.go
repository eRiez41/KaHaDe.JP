package middleware

import (
	"errors"
	"log/slog"
	"net/http"

	"github.com/gofiber/fiber/v2"
)

// FieldError describes one invalid request field.
type FieldError struct {
	Field   string `json:"field"`
	Message string `json:"message"`
}

// APIError is a controlled error that handlers can return. The central error
// handler turns it into the standard JSON envelope.
type APIError struct {
	Status  int
	Code    string
	Message string
	Details []FieldError
}

func (e *APIError) Error() string {
	return e.Message
}

// NewAPIError creates an error that is safe to expose to the client.
func NewAPIError(status int, code, message string) *APIError {
	return &APIError{Status: status, Code: code, Message: message}
}

// NewValidationError creates a 400 response with per-field details.
func NewValidationError(message string, details []FieldError) *APIError {
	return &APIError{
		Status:  fiber.StatusBadRequest,
		Code:    "VALIDATION_ERROR",
		Message: message,
		Details: details,
	}
}

type errorBody struct {
	Code    string       `json:"code"`
	Message string       `json:"message"`
	Details []FieldError `json:"details,omitempty"`
}

type errorResponse struct {
	Success bool      `json:"success"`
	Error   errorBody `json:"error"`
}

// ErrorHandler formats every error using the response envelope from rules.md.
// Internal errors never leak their raw details to the client.
func ErrorHandler(c *fiber.Ctx, err error) error {
	status := fiber.StatusInternalServerError
	code := "INTERNAL_ERROR"
	message := "Terjadi kesalahan pada server"
	var details []FieldError

	var apiErr *APIError
	if errors.As(err, &apiErr) {
		status = apiErr.Status
		code = apiErr.Code
		message = apiErr.Message
		details = apiErr.Details
	} else {
		var fiberErr *fiber.Error
		if errors.As(err, &fiberErr) {
			status = fiberErr.Code
			code = statusCode(fiberErr.Code)
			message = fiberErr.Message
		}
	}

	// Only log server-side; 4xx responses are expected client mistakes.
	level := slog.LevelWarn
	if status >= http.StatusInternalServerError {
		level = slog.LevelError
	}
	slog.Log(c.Context(), level, "request failed",
		"method", c.Method(),
		"path", c.Path(),
		"status", status,
		"error", err,
	)

	return c.Status(status).JSON(errorResponse{
		Success: false,
		Error: errorBody{
			Code:    code,
			Message: message,
			Details: details,
		},
	})
}

func statusCode(status int) string {
	switch status {
	case fiber.StatusBadRequest:
		return "BAD_REQUEST"
	case fiber.StatusUnauthorized:
		return "UNAUTHORIZED"
	case fiber.StatusForbidden:
		return "FORBIDDEN"
	case fiber.StatusNotFound:
		return "NOT_FOUND"
	case fiber.StatusConflict:
		return "CONFLICT"
	case fiber.StatusUnprocessableEntity:
		return "UNPROCESSABLE_ENTITY"
	case fiber.StatusTooManyRequests:
		return "TOO_MANY_REQUESTS"
	default:
		return "INTERNAL_ERROR"
	}
}
