package services

import "errors"

// ErrNotFound is returned when the requested resource does not exist.
var ErrNotFound = errors.New("data tidak ditemukan")

// FieldError describes one failed input field.
type FieldError struct {
	Field   string `json:"field"`
	Message string `json:"message"`
}

// ValidationError contains every field that failed validation.
type ValidationError struct {
	Fields []FieldError
}

func (e *ValidationError) Error() string {
	return "validasi input gagal"
}
