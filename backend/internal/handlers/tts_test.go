package handlers

import (
	"context"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/gofiber/fiber/v2"

	"tts-jpn/internal/models"
	"tts-jpn/internal/services"
)

type stubSynth struct {
	calls int
}

func (s *stubSynth) Synthesize(_ context.Context, text, voice string) ([]byte, error) {
	s.calls++
	return []byte("mp3-" + voice + "-" + text), nil
}

func TestTTSGenerateAndServeAudio(t *testing.T) {
	synth := &stubSynth{}
	app := newTestApp(t, synth)

	status, payload := doJSON(t, app, http.MethodPost, "/api/bab", map[string]string{"nama": "Bab TTS"})
	if status != http.StatusCreated {
		t.Fatalf("create bab status = %d, body = %s", status, payload)
	}
	bab := decode[models.Bab](t, payload)

	status, payload = doJSON(t, app, http.MethodPost, "/api/bab/"+itoa(bab.Data.ID)+"/kosakata", map[string]string{
		"kanji": "日本",
		"hira":  "にほん",
		"arti":  "Jepang",
	})
	if status != http.StatusCreated {
		t.Fatalf("create kosakata status = %d, body = %s", status, payload)
	}
	item := decode[models.Kosakata](t, payload)

	status, payload = doJSON(t, app, http.MethodPost, "/api/tts/generate", map[string][]int64{
		"ids": {item.Data.ID},
	})
	if status != http.StatusCreated {
		t.Fatalf("generate status = %d, body = %s", status, payload)
	}
	result := decode[services.GenerateResult](t, payload)
	if !result.Success || len(result.Data.Failed) != 0 || len(result.Data.Items) != 1 {
		t.Fatalf("unexpected generate response: %+v", result)
	}
	generated := result.Data.Items[0]
	if generated.AudioStatus != models.AudioStatusReady || generated.Audio.JP == nil || generated.Audio.ID == nil {
		t.Fatalf("unexpected generated item: %+v", generated)
	}
	if synth.calls != 2 {
		t.Fatalf("synth calls = %d, want 2", synth.calls)
	}

	resp := doRequest(t, app, http.MethodGet, *generated.Audio.JP)
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		t.Fatalf("read audio body: %v", err)
	}
	_ = resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("audio status = %d, body = %s", resp.StatusCode, body)
	}
	if !strings.Contains(resp.Header.Get("Content-Type"), "audio/mpeg") {
		t.Errorf("content type = %q", resp.Header.Get("Content-Type"))
	}
	if string(body) != "mp3-ja-JP-NanamiNeural-にほん" {
		t.Errorf("audio body = %q", body)
	}

	status, payload = doJSON(t, app, http.MethodGet, "/api/audio/"+itoa(item.Data.ID)+"/fr", nil)
	if status != http.StatusBadRequest {
		t.Fatalf("invalid language status = %d, body = %s", status, payload)
	}

	status, payload = doJSON(t, app, http.MethodGet, "/api/audio/9999/jp", nil)
	if status != http.StatusNotFound {
		t.Fatalf("missing audio status = %d, body = %s", status, payload)
	}
}

func TestTTSGenerateRejectsEmptyIDs(t *testing.T) {
	app := newTestApp(t, &stubSynth{})

	status, payload := doJSON(t, app, http.MethodPost, "/api/tts/generate", map[string][]int64{"ids": {}})
	if status != http.StatusBadRequest {
		t.Fatalf("status = %d, body = %s", status, payload)
	}
	invalid := decode[services.GenerateResult](t, payload)
	if invalid.Error.Code != "VALIDATION_ERROR" || len(invalid.Error.Details) != 1 {
		t.Fatalf("unexpected response: %+v", invalid)
	}
}

func doRequest(t *testing.T, app *fiber.App, method, path string) *http.Response {
	t.Helper()

	req := httptest.NewRequest(method, path, nil)
	resp, err := app.Test(req, 5000)
	if err != nil {
		t.Fatalf("%s %s: %v", method, path, err)
	}
	return resp
}
