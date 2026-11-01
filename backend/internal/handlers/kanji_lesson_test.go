package handlers

import (
	"fmt"
	"net/http"
	"testing"

	"tts-jpn/internal/models"
	"tts-jpn/internal/services"
)

func TestKanjiLessonCRUD(t *testing.T) {
	app := newTestApp(t)

	status, payload := doJSON(t, app, http.MethodPost, "/api/lessons", map[string]string{
		"nama": "Lesson 1",
	})
	if status != http.StatusCreated {
		t.Fatalf("create lesson status = %d, want 201: %s", status, payload)
	}
	lesson := decode[models.Lesson](t, payload).Data
	if lesson.ID == 0 || lesson.Nama != "Lesson 1" {
		t.Fatalf("unexpected lesson: %+v", lesson)
	}

	status, payload = doJSON(t, app, http.MethodPost, "/api/kanji-lessons", map[string]any{
		"lessonId": lesson.ID,
		"kanji":    " 食べる ",
		"hira":     " たべる ",
		"romaji":   " taberu ",
		"arti":     " makan ",
	})
	if status != http.StatusCreated {
		t.Fatalf("create status = %d, want 201: %s", status, payload)
	}
	created := decode[models.KanjiLesson](t, payload).Data
	if created.ID == 0 || created.Kanji != "食べる" || created.Arti != "makan" {
		t.Fatalf("unexpected created lesson: %+v", created)
	}
	if created.LessonID != lesson.ID || created.LessonNama != "Lesson 1" {
		t.Fatalf("unexpected created lesson group: %+v", created)
	}

	status, payload = doJSON(t, app, http.MethodGet, "/api/kanji-lessons", nil)
	if status != http.StatusOK {
		t.Fatalf("list status = %d, want 200: %s", status, payload)
	}
	list := decode[[]models.KanjiLesson](t, payload).Data
	if len(list) != 1 || list[0].ID != created.ID {
		t.Fatalf("unexpected lesson list: %+v", list)
	}

	status, payload = doJSON(
		t,
		app,
		http.MethodGet,
		fmt.Sprintf("/api/kanji-lessons?lessonId=%d", lesson.ID),
		nil,
	)
	if status != http.StatusOK {
		t.Fatalf("filtered list status = %d, want 200: %s", status, payload)
	}
	filtered := decode[[]models.KanjiLesson](t, payload).Data
	if len(filtered) != 1 || filtered[0].ID != created.ID {
		t.Fatalf("unexpected filtered lesson list: %+v", filtered)
	}

	status, payload = doJSON(t, app, http.MethodPatch, "/api/kanji-lessons/1", map[string]string{
		"arti": "memakan",
	})
	if status != http.StatusOK {
		t.Fatalf("update status = %d, want 200: %s", status, payload)
	}
	updated := decode[models.KanjiLesson](t, payload).Data
	if updated.Arti != "memakan" || updated.Kanji != "食べる" {
		t.Fatalf("unexpected updated lesson: %+v", updated)
	}

	status, _ = doJSON(t, app, http.MethodDelete, "/api/kanji-lessons/1", nil)
	if status != http.StatusNoContent {
		t.Fatalf("delete status = %d, want 204", status)
	}

	status, _ = doJSON(t, app, http.MethodDelete, "/api/kanji-lessons/1", nil)
	if status != http.StatusNotFound {
		t.Fatalf("second delete status = %d, want 404", status)
	}
}

func TestKanjiLessonImportAndValidation(t *testing.T) {
	app := newTestApp(t)

	status, payload := doJSON(t, app, http.MethodPost, "/api/lessons", map[string]string{
		"nama": "Lesson 2",
	})
	if status != http.StatusCreated {
		t.Fatalf("create lesson status = %d, want 201: %s", status, payload)
	}
	lesson := decode[models.Lesson](t, payload).Data

	status, payload = doJSON(t, app, http.MethodPost, "/api/kanji-lessons/import", map[string]any{
		"lessonId": lesson.ID,
		"items": []map[string]string{
			{"kanji": "猫", "hira": "ねこ", "romaji": "neko", "arti": "kucing"},
			{"jepang": "犬", "hira": "いぬ", "romaji": "inu", "arti": "anjing"},
			{"kanji": "", "arti": "kosong"},
		},
	})
	if status != http.StatusCreated {
		t.Fatalf("import status = %d, want 201: %s", status, payload)
	}
	result := decode[services.KanjiLessonImportResult](t, payload).Data
	if result.Inserted != 2 || result.Skipped != 1 {
		t.Fatalf("unexpected import result: %+v", result)
	}

	status, payload = doJSON(t, app, http.MethodPost, "/api/kanji-lessons", map[string]string{
		"kanji": "",
		"arti":  "",
	})
	if status != http.StatusBadRequest {
		t.Fatalf("invalid create status = %d, want 400: %s", status, payload)
	}
}

func TestLessonCRUDAndCascade(t *testing.T) {
	app := newTestApp(t)

	status, payload := doJSON(t, app, http.MethodPost, "/api/lessons", map[string]string{
		"nama": " Lesson A ",
	})
	if status != http.StatusCreated {
		t.Fatalf("create lesson status = %d, want 201: %s", status, payload)
	}
	created := decode[models.Lesson](t, payload).Data
	if created.Nama != "Lesson A" {
		t.Fatalf("unexpected normalized lesson name: %+v", created)
	}

	status, payload = doJSON(t, app, http.MethodPost, "/api/kanji-lessons", map[string]any{
		"lessonId": created.ID,
		"kanji":    "日",
		"arti":     "matahari",
	})
	if status != http.StatusCreated {
		t.Fatalf("create entry status = %d, want 201: %s", status, payload)
	}

	status, payload = doJSON(
		t,
		app,
		http.MethodPatch,
		fmt.Sprintf("/api/lessons/%d", created.ID),
		map[string]string{"nama": "Lesson B"},
	)
	if status != http.StatusOK {
		t.Fatalf("rename lesson status = %d, want 200: %s", status, payload)
	}
	renamed := decode[models.LessonSummary](t, payload).Data
	if renamed.Nama != "Lesson B" || renamed.CountKanji != 1 {
		t.Fatalf("unexpected renamed lesson: %+v", renamed)
	}

	status, payload = doJSON(t, app, http.MethodGet, "/api/lessons", nil)
	if status != http.StatusOK {
		t.Fatalf("list lessons status = %d, want 200: %s", status, payload)
	}
	lessons := decode[[]models.LessonSummary](t, payload).Data
	if len(lessons) != 1 || lessons[0].CountKanji != 1 {
		t.Fatalf("unexpected lesson list: %+v", lessons)
	}

	status, _ = doJSON(
		t,
		app,
		http.MethodDelete,
		fmt.Sprintf("/api/lessons/%d", created.ID),
		nil,
	)
	if status != http.StatusNoContent {
		t.Fatalf("delete lesson status = %d, want 204", status)
	}

	status, payload = doJSON(t, app, http.MethodGet, "/api/kanji-lessons", nil)
	if status != http.StatusOK {
		t.Fatalf("list entries status = %d, want 200: %s", status, payload)
	}
	entries := decode[[]models.KanjiLesson](t, payload).Data
	if len(entries) != 0 {
		t.Fatalf("entries should cascade delete, got %+v", entries)
	}

	status, _ = doJSON(
		t,
		app,
		http.MethodDelete,
		fmt.Sprintf("/api/lessons/%d", created.ID),
		nil,
	)
	if status != http.StatusNotFound {
		t.Fatalf("second delete lesson status = %d, want 404", status)
	}
}
