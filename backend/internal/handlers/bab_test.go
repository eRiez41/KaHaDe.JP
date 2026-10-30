package handlers

import (
	"bytes"
	"context"
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"path/filepath"
	"strconv"
	"testing"
	"time"

	"github.com/gofiber/fiber/v2"

	"tts-jpn/internal/db"
	"tts-jpn/internal/middleware"
	"tts-jpn/internal/models"
	"tts-jpn/internal/services"
)

type testEnvelope[T any] struct {
	Success bool `json:"success"`
	Data    T    `json:"data"`
	Error   struct {
		Code    string                  `json:"code"`
		Message string                  `json:"message"`
		Details []middleware.FieldError `json:"details"`
	} `json:"error"`
}

func newTestApp(t *testing.T, synth ...services.Synthesizer) *fiber.App {
	t.Helper()

	ctx := context.Background()
	sqlDB, err := db.Open(ctx, filepath.Join(t.TempDir(), "test.db"))
	if err != nil {
		t.Fatalf("open test db: %v", err)
	}
	t.Cleanup(func() {
		if closeErr := sqlDB.Close(); closeErr != nil {
			t.Errorf("close test db: %v", closeErr)
		}
	})

	if err := db.Migrate(ctx, sqlDB); err != nil {
		t.Fatalf("migrate test db: %v", err)
	}

	babRepo := db.NewBabRepository(sqlDB)
	kosakataRepo := db.NewKosakataRepository(sqlDB)

	var ttsSynth services.Synthesizer
	if len(synth) > 0 {
		ttsSynth = synth[0]
	}

	app := fiber.New(fiber.Config{ErrorHandler: middleware.ErrorHandler})
	RegisterRoutes(
		app.Group("/api"),
		NewBabHandler(services.NewBabService(babRepo)),
		NewKosakataHandler(services.NewKosakataService(kosakataRepo, babRepo)),
		NewTTSHandler(services.NewAudioService(
			kosakataRepo,
			ttsSynth,
			t.TempDir(),
			"ja-JP-NanamiNeural",
			"id-ID-GadisNeural",
		)),
		NewExportHandler(
			services.NewAudioMergeService(kosakataRepo, db.NewBabRepository(sqlDB), t.TempDir()),
			services.NewKosakataService(kosakataRepo, db.NewBabRepository(sqlDB)),
			services.NewBabService(db.NewBabRepository(sqlDB)),
		),
		NewDictionaryHandler(services.NewJishoDictionary(time.Second)),
	)
	return app
}

func doJSON(t *testing.T, app *fiber.App, method, path string, body any) (int, []byte) {
	t.Helper()

	var reader io.Reader
	if body != nil {
		payload, err := json.Marshal(body)
		if err != nil {
			t.Fatalf("marshal request: %v", err)
		}
		reader = bytes.NewReader(payload)
	}

	req := httptest.NewRequest(method, path, reader)
	if body != nil {
		req.Header.Set("Content-Type", "application/json")
	}

	resp, err := app.Test(req, 5000)
	if err != nil {
		t.Fatalf("%s %s: %v", method, path, err)
	}
	defer resp.Body.Close()

	payload, err := io.ReadAll(resp.Body)
	if err != nil {
		t.Fatalf("read response: %v", err)
	}
	return resp.StatusCode, payload
}

func decode[T any](t *testing.T, payload []byte) testEnvelope[T] {
	t.Helper()
	var envelope testEnvelope[T]
	if err := json.Unmarshal(payload, &envelope); err != nil {
		t.Fatalf("decode response %s: %v", payload, err)
	}
	return envelope
}

func TestBabCRUD(t *testing.T) {
	app := newTestApp(t)

	status, payload := doJSON(t, app, http.MethodPost, "/api/bab", map[string]string{"nama": "  Bab 1  "})
	if status != http.StatusCreated {
		t.Fatalf("create bab status = %d, body = %s", status, payload)
	}
	created := decode[models.Bab](t, payload)
	if !created.Success || created.Data.ID < 1 || created.Data.Nama != "Bab 1" {
		t.Fatalf("unexpected create response: %+v", created)
	}
	babID := created.Data.ID

	status, payload = doJSON(t, app, http.MethodGet, "/api/bab", nil)
	if status != http.StatusOK {
		t.Fatalf("list bab status = %d, body = %s", status, payload)
	}
	listed := decode[[]models.BabSummary](t, payload)
	if len(listed.Data) != 1 || listed.Data[0].CountKosakata != 0 {
		t.Fatalf("unexpected bab list: %+v", listed.Data)
	}

	babPath := "/api/bab/" + itoa(babID)
	status, payload = doJSON(t, app, http.MethodGet, babPath, nil)
	if status != http.StatusOK {
		t.Fatalf("get bab status = %d, body = %s", status, payload)
	}
	got := decode[models.BabSummary](t, payload)
	if got.Data.ID != babID {
		t.Fatalf("got bab id %d, want %d", got.Data.ID, babID)
	}

	status, payload = doJSON(t, app, http.MethodPatch, babPath, map[string]string{"nama": "Bab 1 Revisi"})
	if status != http.StatusOK {
		t.Fatalf("patch bab status = %d, body = %s", status, payload)
	}
	updated := decode[models.BabSummary](t, payload)
	if updated.Data.Nama != "Bab 1 Revisi" {
		t.Fatalf("got bab name %q", updated.Data.Nama)
	}

	status, payload = doJSON(t, app, http.MethodPatch, babPath, map[string]string{})
	if status != http.StatusBadRequest {
		t.Fatalf("empty patch status = %d, body = %s", status, payload)
	}

	status, payload = doJSON(t, app, http.MethodPost, babPath+"/kosakata", map[string]string{
		"kanji": "日本",
		"arti":  "Jepang",
	})
	if status != http.StatusCreated {
		t.Fatalf("create kosakata status = %d, body = %s", status, payload)
	}
	item := decode[models.Kosakata](t, payload)
	if item.Data.BabID != babID || item.Data.AudioStatus != models.AudioStatusPending {
		t.Fatalf("unexpected kosakata: %+v", item.Data)
	}
	if item.Data.Hira != "" || item.Data.Romaji != "" {
		t.Fatalf("optional fields should be empty: %+v", item.Data)
	}
	kosakataID := item.Data.ID

	status, payload = doJSON(t, app, http.MethodGet, babPath+"/kosakata", nil)
	if status != http.StatusOK {
		t.Fatalf("list kosakata status = %d, body = %s", status, payload)
	}
	items := decode[[]models.Kosakata](t, payload)
	if len(items.Data) != 1 || items.Data[0].ID != kosakataID {
		t.Fatalf("unexpected kosakata list: %+v", items.Data)
	}

	status, payload = doJSON(t, app, http.MethodGet, babPath, nil)
	if status != http.StatusOK {
		t.Fatalf("get bab with count status = %d, body = %s", status, payload)
	}
	counted := decode[models.BabSummary](t, payload)
	if counted.Data.CountKosakata != 1 || counted.Data.AudioReadyCount != 0 {
		t.Fatalf("unexpected counts: %+v", counted.Data)
	}

	status, payload = doJSON(t, app, http.MethodPatch, "/api/kosakata/"+itoa(kosakataID), map[string]string{
		"hira": "にほん",
	})
	if status != http.StatusOK {
		t.Fatalf("patch kosakata status = %d, body = %s", status, payload)
	}
	patched := decode[models.Kosakata](t, payload)
	if patched.Data.Hira != "にほん" || patched.Data.Kanji != "日本" {
		t.Fatalf("unexpected patched kosakata: %+v", patched.Data)
	}

	status, payload = doJSON(t, app, http.MethodDelete, "/api/kosakata/"+itoa(kosakataID), nil)
	if status != http.StatusNoContent {
		t.Fatalf("delete kosakata status = %d, body = %s", status, payload)
	}

	status, payload = doJSON(t, app, http.MethodDelete, "/api/kosakata/"+itoa(kosakataID), nil)
	if status != http.StatusNotFound {
		t.Fatalf("delete missing kosakata status = %d, body = %s", status, payload)
	}

	status, payload = doJSON(t, app, http.MethodDelete, babPath, nil)
	if status != http.StatusNoContent {
		t.Fatalf("delete bab status = %d, body = %s", status, payload)
	}

	status, payload = doJSON(t, app, http.MethodGet, babPath, nil)
	if status != http.StatusNotFound {
		t.Fatalf("get deleted bab status = %d, body = %s", status, payload)
	}
	missing := decode[models.Bab](t, payload)
	if missing.Success || missing.Error.Code != "NOT_FOUND" {
		t.Fatalf("unexpected missing response: %+v", missing)
	}
}

func TestBabValidation(t *testing.T) {
	app := newTestApp(t)

	status, payload := doJSON(t, app, http.MethodPost, "/api/bab", map[string]string{"nama": "  "})
	if status != http.StatusBadRequest {
		t.Fatalf("invalid bab status = %d, body = %s", status, payload)
	}
	invalid := decode[models.Bab](t, payload)
	if invalid.Error.Code != "VALIDATION_ERROR" || len(invalid.Error.Details) != 1 {
		t.Fatalf("unexpected validation response: %+v", invalid)
	}
	if invalid.Error.Details[0].Field != "nama" {
		t.Fatalf("unexpected field detail: %+v", invalid.Error.Details[0])
	}

	status, payload = doJSON(t, app, http.MethodPost, "/api/bab", map[string]string{
		"nama": "Bab Validasi",
	})
	if status != http.StatusCreated {
		t.Fatalf("setup bab status = %d, body = %s", status, payload)
	}
	bab := decode[models.Bab](t, payload)

	status, payload = doJSON(t, app, http.MethodPost, "/api/bab/"+itoa(bab.Data.ID)+"/kosakata", map[string]string{
		"hira": "にほん",
	})
	if status != http.StatusBadRequest {
		t.Fatalf("invalid kosakata status = %d, body = %s", status, payload)
	}
	invalidKosakata := decode[models.Kosakata](t, payload)
	if len(invalidKosakata.Error.Details) != 2 {
		t.Fatalf("got %d details, want 2: %+v", len(invalidKosakata.Error.Details), invalidKosakata)
	}

	status, payload = doJSON(t, app, http.MethodGet, "/api/bab/abc", nil)
	if status != http.StatusBadRequest {
		t.Fatalf("invalid id status = %d, body = %s", status, payload)
	}

	status, payload = doJSON(t, app, http.MethodGet, "/api/bab/9999", nil)
	if status != http.StatusNotFound {
		t.Fatalf("missing bab status = %d, body = %s", status, payload)
	}
}

func itoa(id int64) string {
	return strconv.FormatInt(id, 10)
}
