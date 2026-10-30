package services

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"sync/atomic"
	"testing"
	"time"
)

func newTranslatorTestServer(t *testing.T, hits *int32) *GoogleTranslator {
	t.Helper()

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if hits != nil {
			atomic.AddInt32(hits, 1)
		}
		queries := r.URL.Query()["q"]
		results := make([]string, 0, len(queries))
		for _, query := range queries {
			results = append(results, "id:"+query)
		}
		w.Header().Set("Content-Type", "application/json")
		if err := json.NewEncoder(w).Encode(results); err != nil {
			t.Errorf("encode response: %v", err)
		}
	}))
	t.Cleanup(server.Close)

	return newGoogleTranslator(server.URL, 2*time.Second, time.Hour)
}

func TestGoogleTranslatorTranslatesBatch(t *testing.T) {
	translator := newTranslatorTestServer(t, nil)

	got, err := translator.Translate(context.Background(), []string{
		"to eat",
		"to sleep (lying down)",
	})
	if err != nil {
		t.Fatalf("translate: %v", err)
	}
	want := []string{"id:eat", "id:sleep (lying down)"}
	for i := range want {
		if got[i] != want[i] {
			t.Fatalf("got %v, want %v", got, want)
		}
	}
}

func TestGoogleTranslatorCachesAndDeduplicates(t *testing.T) {
	var hits int32
	translator := newTranslatorTestServer(t, &hits)

	first, err := translator.Translate(context.Background(), []string{"to eat", "eat"})
	if err != nil {
		t.Fatalf("translate: %v", err)
	}
	if first[0] != "id:eat" || first[1] != "id:eat" {
		t.Fatalf("unexpected results: %v", first)
	}

	second, err := translator.Translate(context.Background(), []string{"to eat"})
	if err != nil {
		t.Fatalf("translate again: %v", err)
	}
	if second[0] != "id:eat" {
		t.Fatalf("unexpected cached result: %v", second)
	}
	if hits != 1 {
		t.Fatalf("server hits = %d, want 1", hits)
	}
}

func TestGoogleTranslatorReportsFailure(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusInternalServerError)
	}))
	t.Cleanup(server.Close)

	translator := newGoogleTranslator(server.URL, 2*time.Second, time.Hour)
	if _, err := translator.Translate(context.Background(), []string{"to eat"}); err == nil {
		t.Fatal("expected error")
	}
}

func TestTranslationInput(t *testing.T) {
	cases := map[string]string{
		"to eat":                   "eat",
		"to live on (e.g. salary)": "live on (e.g. salary)",
		"study":                    "study",
		"  to return  ":            "return",
	}
	for input, want := range cases {
		if got := translationInput(input); got != want {
			t.Fatalf("translationInput(%q) = %q, want %q", input, got, want)
		}
	}
}

func TestLowerFirst(t *testing.T) {
	if got := lowerFirst("Mengerjakan"); got != "mengerjakan" {
		t.Fatalf("lowerFirst = %q", got)
	}
	if got := lowerFirst("(opsional)"); got != "(opsional)" {
		t.Fatalf("lowerFirst = %q", got)
	}
}

func TestCleanTranslation(t *testing.T) {
	cases := map[string]string{
		"slogan (iklan).":       "slogan (iklan)",
		"berubah menjadi)":      "berubah menjadi",
		"  pulang  ":            "pulang",
		"hidup (misalnya gaji)": "hidup (misalnya gaji)",
	}
	for input, want := range cases {
		if got := cleanTranslation(input); got != want {
			t.Fatalf("cleanTranslation(%q) = %q, want %q", input, got, want)
		}
	}
}

// fakeTranslator is used by dictionary tests to avoid network access.
type fakeTranslator struct {
	calls int
	err   error
}

func (f *fakeTranslator) Translate(_ context.Context, texts []string) ([]string, error) {
	f.calls++
	if f.err != nil {
		return nil, f.err
	}
	results := make([]string, len(texts))
	for i, text := range texts {
		results[i] = "ID " + text
	}
	return results, nil
}

var errTranslationFailed = errors.New("translation failed")
