package services

import (
	"strings"
	"testing"

	"tts-jpn/internal/models"
)

func TestValidateBabName(t *testing.T) {
	t.Run("trims valid name", func(t *testing.T) {
		got, validationErr := validateBabName("  Bab 1  ")
		if validationErr != nil {
			t.Fatalf("unexpected error: %v", validationErr)
		}
		if got != "Bab 1" {
			t.Fatalf("got %q, want %q", got, "Bab 1")
		}
	})

	t.Run("rejects empty name", func(t *testing.T) {
		_, validationErr := validateBabName("   ")
		if validationErr == nil {
			t.Fatal("expected validation error")
		}
		assertFieldError(t, validationErr, "nama")
	})

	t.Run("rejects long name", func(t *testing.T) {
		_, validationErr := validateBabName(strings.Repeat("a", MAX_BAB_NAME_LENGTH+1))
		if validationErr == nil {
			t.Fatal("expected validation error")
		}
		assertFieldError(t, validationErr, "nama")
	})
}

func TestValidateKosakata(t *testing.T) {
	t.Run("requires kanji and arti", func(t *testing.T) {
		_, validationErr := validateKosakata(KosakataInput{Hira: "ひらがな"})
		if validationErr == nil {
			t.Fatal("expected validation error")
		}
		if len(validationErr.Fields) != 2 {
			t.Fatalf("got %d field errors, want 2", len(validationErr.Fields))
		}
		assertFieldError(t, validationErr, "kanji")
		assertFieldError(t, validationErr, "arti")
	})

	t.Run("accepts optional hira and romaji", func(t *testing.T) {
		got, validationErr := validateKosakata(KosakataInput{
			Kanji: " 日本 ",
			Arti:  " Jepang ",
		})
		if validationErr != nil {
			t.Fatalf("unexpected error: %v", validationErr)
		}
		if got.Kanji != "日本" || got.Arti != "Jepang" {
			t.Fatalf("unexpected normalized input: %+v", got)
		}
		if got.Hira != "" || got.Romaji != "" {
			t.Fatalf("optional fields should stay empty: %+v", got)
		}
	})

	t.Run("rejects long hira", func(t *testing.T) {
		_, validationErr := validateKosakata(KosakataInput{
			Kanji: "日本",
			Hira:  strings.Repeat("あ", MAX_HIRA_LENGTH+1),
			Arti:  "Jepang",
		})
		if validationErr == nil {
			t.Fatal("expected validation error")
		}
		assertFieldError(t, validationErr, "hira")
	})
}

func TestApplyKosakataPatch(t *testing.T) {
	existing := models.Kosakata{
		Kanji:  "日本",
		Hira:   "にほん",
		Romaji: "nihon",
		Arti:   "Jepang",
	}

	t.Run("rejects empty patch", func(t *testing.T) {
		_, validationErr := applyKosakataPatch(existing, KosakataPatch{})
		if validationErr == nil {
			t.Fatal("expected validation error")
		}
	})

	t.Run("keeps fields that are not sent", func(t *testing.T) {
		arti := "Negara Jepang"
		got, validationErr := applyKosakataPatch(existing, KosakataPatch{Arti: &arti})
		if validationErr != nil {
			t.Fatalf("unexpected error: %v", validationErr)
		}
		if got.Arti != arti {
			t.Fatalf("got arti %q, want %q", got.Arti, arti)
		}
		if got.Kanji != existing.Kanji || got.Hira != existing.Hira || got.Romaji != existing.Romaji {
			t.Fatalf("untouched fields changed: %+v", got)
		}
	})
}

func assertFieldError(t *testing.T, validationErr *ValidationError, field string) {
	t.Helper()
	for _, item := range validationErr.Fields {
		if item.Field == field {
			return
		}
	}
	t.Fatalf("field error %q not found in %+v", field, validationErr.Fields)
}
