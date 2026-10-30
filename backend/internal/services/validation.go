package services

import (
	"fmt"
	"strings"
	"unicode/utf8"

	"tts-jpn/internal/models"
)

const (
	MAX_BAB_NAME_LENGTH = 100
	MAX_KANJI_LENGTH    = 200
	MAX_HIRA_LENGTH     = 200
	MAX_ROMAJI_LENGTH   = 200
	MAX_ARTI_LENGTH     = 500
)

// KosakataInput is the normalized text payload for create and update.
type KosakataInput struct {
	Kanji  string
	Hira   string
	Romaji string
	Arti   string
}

// KosakataPatch carries only the fields sent by the client.
type KosakataPatch struct {
	Kanji  *string
	Hira   *string
	Romaji *string
	Arti   *string
}

func (p KosakataPatch) isEmpty() bool {
	return p.Kanji == nil && p.Hira == nil && p.Romaji == nil && p.Arti == nil
}

func validateBabName(nama string) (string, *ValidationError) {
	normalized := normalizeText(nama)

	if normalized == "" {
		return "", &ValidationError{Fields: []FieldError{
			{Field: "nama", Message: "Nama bab wajib diisi"},
		}}
	}
	if utf8.RuneCountInString(normalized) > MAX_BAB_NAME_LENGTH {
		return "", &ValidationError{Fields: []FieldError{
			{
				Field:   "nama",
				Message: fmt.Sprintf("Nama bab maksimal %d karakter", MAX_BAB_NAME_LENGTH),
			},
		}}
	}

	return normalized, nil
}

func validateBabPatch(nama *string) (string, *ValidationError) {
	if nama == nil {
		return "", &ValidationError{Fields: []FieldError{
			{Field: "nama", Message: "Minimal satu field harus diisi"},
		}}
	}
	return validateBabName(*nama)
}

func validateKosakata(input KosakataInput) (KosakataInput, *ValidationError) {
	normalized := KosakataInput{
		Kanji:  normalizeText(input.Kanji),
		Hira:   normalizeText(input.Hira),
		Romaji: normalizeText(input.Romaji),
		Arti:   normalizeText(input.Arti),
	}

	fields := make([]FieldError, 0, 3)

	if normalized.Kanji == "" {
		fields = append(fields, FieldError{Field: "kanji", Message: "Kanji wajib diisi"})
	} else if utf8.RuneCountInString(normalized.Kanji) > MAX_KANJI_LENGTH {
		fields = append(fields, FieldError{
			Field:   "kanji",
			Message: fmt.Sprintf("Kanji maksimal %d karakter", MAX_KANJI_LENGTH),
		})
	}

	if normalized.Arti == "" {
		fields = append(fields, FieldError{Field: "arti", Message: "Arti wajib diisi"})
	} else if utf8.RuneCountInString(normalized.Arti) > MAX_ARTI_LENGTH {
		fields = append(fields, FieldError{
			Field:   "arti",
			Message: fmt.Sprintf("Arti maksimal %d karakter", MAX_ARTI_LENGTH),
		})
	}

	if utf8.RuneCountInString(normalized.Hira) > MAX_HIRA_LENGTH {
		fields = append(fields, FieldError{
			Field:   "hira",
			Message: fmt.Sprintf("Hira maksimal %d karakter", MAX_HIRA_LENGTH),
		})
	}
	if utf8.RuneCountInString(normalized.Romaji) > MAX_ROMAJI_LENGTH {
		fields = append(fields, FieldError{
			Field:   "romaji",
			Message: fmt.Sprintf("Romaji maksimal %d karakter", MAX_ROMAJI_LENGTH),
		})
	}

	if len(fields) > 0 {
		return KosakataInput{}, &ValidationError{Fields: fields}
	}
	return normalized, nil
}

func applyKosakataPatch(existing models.Kosakata, patch KosakataPatch) (KosakataInput, *ValidationError) {
	if patch.isEmpty() {
		return KosakataInput{}, &ValidationError{Fields: []FieldError{
			{Field: "body", Message: "Minimal satu field harus diisi"},
		}}
	}

	input := KosakataInput{
		Kanji:  existing.Kanji,
		Hira:   existing.Hira,
		Romaji: existing.Romaji,
		Arti:   existing.Arti,
	}

	if patch.Kanji != nil {
		input.Kanji = *patch.Kanji
	}
	if patch.Hira != nil {
		input.Hira = *patch.Hira
	}
	if patch.Romaji != nil {
		input.Romaji = *patch.Romaji
	}
	if patch.Arti != nil {
		input.Arti = *patch.Arti
	}

	return validateKosakata(input)
}

func normalizeText(value string) string {
	return strings.TrimSpace(value)
}
