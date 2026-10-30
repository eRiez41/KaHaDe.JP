package services

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"net/http/httptest"
	"sync"
	"sync/atomic"
	"testing"
	"time"
)

const taberuFixture = `{
  "meta": {"status": 200},
  "data": [{
    "is_common": true,
    "jlpt": ["jlpt-n5"],
    "japanese": [{"word": "食べる", "reading": "たべる"}],
    "senses": [{
      "english_definitions": ["to eat", "to consume"],
      "parts_of_speech": ["Ichidan verb", "Transitive verb"]
    }, {
      "english_definitions": ["to live on (e.g. a salary)", "to subsist on"],
      "parts_of_speech": ["Ichidan verb", "Transitive verb"]
    }]
  }]
}`

const benkyouFixture = `{
  "meta": {"status": 200},
  "data": [{
    "is_common": true,
    "jlpt": ["jlpt-n3", "jlpt-n5"],
    "japanese": [{"word": "勉強", "reading": "べんきょう"}],
    "senses": [{
      "english_definitions": ["study"],
      "parts_of_speech": ["Noun", "Suru verb", "Transitive verb"]
    }]
  }]
}`

func newDictionaryTestServer(t *testing.T, body string, status int, hits *int32) *JishoDictionary {
	t.Helper()

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if hits != nil {
			atomic.AddInt32(hits, 1)
		}
		if r.URL.Query().Get("keyword") == "" {
			t.Errorf("request is missing keyword")
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(status)
		if _, err := fmt.Fprint(w, body); err != nil {
			t.Errorf("write fixture: %v", err)
		}
	}))
	t.Cleanup(server.Close)

	return newJishoDictionary(server.URL, 2*time.Second, time.Hour)
}

func TestJishoLookupExactMatch(t *testing.T) {
	dict := newDictionaryTestServer(t, taberuFixture, http.StatusOK, nil)

	entry, err := dict.Lookup(context.Background(), "食べる")
	if err != nil {
		t.Fatalf("lookup: %v", err)
	}
	if entry.Word != "食べる" || entry.Reading != "たべる" {
		t.Fatalf("unexpected word: %+v", entry)
	}
	if len(entry.Meanings) != 1 || entry.Meanings[0] != "to eat" {
		t.Fatalf("unexpected meanings: %v", entry.Meanings)
	}
	if entry.JLPT != "N5" || !entry.IsCommon {
		t.Fatalf("unexpected metadata: %+v", entry)
	}
}

func TestJishoLookupMatchesReading(t *testing.T) {
	dict := newDictionaryTestServer(t, taberuFixture, http.StatusOK, nil)

	entry, err := dict.Lookup(context.Background(), "たべる")
	if err != nil {
		t.Fatalf("lookup: %v", err)
	}
	if entry.Word != "食べる" || entry.Reading != "たべる" {
		t.Fatalf("unexpected entry: %+v", entry)
	}
}

func TestJishoLookupRejectsFuzzyMatch(t *testing.T) {
	dict := newDictionaryTestServer(t, taberuFixture, http.StatusOK, nil)

	if _, err := dict.Lookup(context.Background(), "たべますです"); !errors.Is(err, ErrWordNotFound) {
		t.Fatalf("error = %v, want ErrWordNotFound", err)
	}
}

func TestJishoLookupSuruCompound(t *testing.T) {
	dict := newDictionaryTestServer(t, benkyouFixture, http.StatusOK, nil)

	for _, query := range []string{"勉強する", "べんきょうする"} {
		entry, err := dict.Lookup(context.Background(), query)
		if err != nil {
			t.Fatalf("lookup %q: %v", query, err)
		}
		if entry.Word != "勉強" || entry.Reading != "べんきょう" {
			t.Fatalf("lookup %q: unexpected entry %+v", query, entry)
		}
		if len(entry.Meanings) != 1 || entry.Meanings[0] != "study" {
			t.Fatalf("lookup %q: unexpected meanings %v", query, entry.Meanings)
		}
	}
}

func TestJishoLookupRequiresSuruPOSForCompound(t *testing.T) {
	fixture := `{"meta":{"status":200},"data":[{
		"japanese":[{"word":"勉強","reading":"べんきょう"}],
		"senses":[{"english_definitions":["study"],"parts_of_speech":["Noun"]}]
	}]}`
	dict := newDictionaryTestServer(t, fixture, http.StatusOK, nil)

	if _, err := dict.Lookup(context.Background(), "勉強する"); !errors.Is(err, ErrWordNotFound) {
		t.Fatalf("error = %v, want ErrWordNotFound", err)
	}
}

func TestJishoLookupReportsUnavailable(t *testing.T) {
	dict := newDictionaryTestServer(t, `{}`, http.StatusServiceUnavailable, nil)

	if _, err := dict.Lookup(context.Background(), "食べる"); !errors.Is(err, ErrDictionaryUnavailable) {
		t.Fatalf("error = %v, want ErrDictionaryUnavailable", err)
	}
}

func TestJishoLookupCachesResults(t *testing.T) {
	var hits int32
	dict := newDictionaryTestServer(t, taberuFixture, http.StatusOK, &hits)

	for i := 0; i < 2; i++ {
		if _, err := dict.Lookup(context.Background(), "食べる"); err != nil {
			t.Fatalf("lookup: %v", err)
		}
	}
	if hits != 1 {
		t.Fatalf("server hits = %d, want 1", hits)
	}
}

func TestJishoLookupCachesMisses(t *testing.T) {
	var hits int32
	dict := newDictionaryTestServer(t, taberuFixture, http.StatusOK, &hits)

	for i := 0; i < 2; i++ {
		if _, err := dict.Lookup(context.Background(), "たべますです"); !errors.Is(err, ErrWordNotFound) {
			t.Fatalf("lookup: error = %v, want ErrWordNotFound", err)
		}
	}
	if hits != 1 {
		t.Fatalf("server hits = %d, want 1", hits)
	}
}

func TestJishoLookupExpiresCache(t *testing.T) {
	var hits int32
	dict := newDictionaryTestServer(t, taberuFixture, http.StatusOK, &hits)

	current := time.Now()
	dict.now = func() time.Time { return current }

	if _, err := dict.Lookup(context.Background(), "食べる"); err != nil {
		t.Fatalf("first lookup: %v", err)
	}
	current = current.Add(2 * time.Hour)
	if _, err := dict.Lookup(context.Background(), "食べる"); err != nil {
		t.Fatalf("second lookup: %v", err)
	}
	if hits != 2 {
		t.Fatalf("server hits = %d, want 2", hits)
	}
}

func TestJishoLookupRetriesKatakana(t *testing.T) {
	const copyFixture = `{"meta":{"status":200},"data":[{
		"is_common": true,
		"japanese": [{"reading": "コピー"}],
		"senses": [{
			"english_definitions": ["copy", "photocopy"],
			"parts_of_speech": ["Noun", "Suru verb", "Transitive verb"]
		}]
	}]}`

	var mu sync.Mutex
	var keywords []string
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		keyword := r.URL.Query().Get("keyword")
		mu.Lock()
		keywords = append(keywords, keyword)
		mu.Unlock()

		w.Header().Set("Content-Type", "application/json")
		if keyword == "コピーする" {
			fmt.Fprint(w, copyFixture)
			return
		}
		fmt.Fprint(w, `{"meta":{"status":200},"data":[]}`)
	}))
	t.Cleanup(server.Close)

	dict := newJishoDictionary(server.URL, 2*time.Second, time.Hour)
	entry, err := dict.Lookup(context.Background(), "こぴーする")
	if err != nil {
		t.Fatalf("lookup: %v", err)
	}
	if entry.Word != "コピー" || entry.Query != "こぴーする" {
		t.Fatalf("unexpected entry: %+v", entry)
	}

	mu.Lock()
	defer mu.Unlock()
	if len(keywords) != 2 || keywords[0] != "こぴーする" || keywords[1] != "コピーする" {
		t.Fatalf("keywords = %v", keywords)
	}
}

func TestJishoLookupTranslatesMeanings(t *testing.T) {
	dict := newDictionaryTestServer(t, taberuFixture, http.StatusOK, nil)
	translator := &fakeTranslator{}
	dict.translator = translator

	entry, err := dict.Lookup(context.Background(), "食べる")
	if err != nil {
		t.Fatalf("lookup: %v", err)
	}
	if !entry.Translated {
		t.Fatal("expected meanings to be translated")
	}
	if len(entry.Meanings) != 1 || entry.Meanings[0] != "ID to eat" {
		t.Fatalf("unexpected translated meanings: %v", entry.Meanings)
	}
	if len(entry.MeaningsEn) != 1 || entry.MeaningsEn[0] != "to eat" {
		t.Fatalf("unexpected original meanings: %v", entry.MeaningsEn)
	}
	if translator.calls != 1 {
		t.Fatalf("translator calls = %d, want 1", translator.calls)
	}
}

func TestJishoLookupKeepsEnglishWhenTranslationFails(t *testing.T) {
	dict := newDictionaryTestServer(t, taberuFixture, http.StatusOK, nil)
	dict.translator = &fakeTranslator{err: errTranslationFailed}

	entry, err := dict.Lookup(context.Background(), "食べる")
	if err != nil {
		t.Fatalf("lookup: %v", err)
	}
	if entry.Translated {
		t.Fatal("expected Translated to stay false")
	}
	if len(entry.Meanings) != 1 || entry.Meanings[0] != "to eat" {
		t.Fatalf("unexpected meanings: %v", entry.Meanings)
	}
	if len(entry.MeaningsEn) != 1 || entry.MeaningsEn[0] != "to eat" {
		t.Fatalf("unexpected original meanings: %v", entry.MeaningsEn)
	}
}

func TestDedupeMeanings(t *testing.T) {
	meanings, originals := dedupeMeanings(
		[]string{"pulang", "kembali", "pulang", ""},
		[]string{"to go home", "to return", "to get home", "empty"},
	)
	if len(meanings) != 2 || meanings[0] != "pulang" || meanings[1] != "kembali" {
		t.Fatalf("unexpected meanings: %v", meanings)
	}
	if len(originals) != 2 || originals[0] != "to go home" || originals[1] != "to return" {
		t.Fatalf("unexpected originals: %v", originals)
	}
}

func TestNormalizeJapanese(t *testing.T) {
	if got := normalizeJapanese(" コピーする "); got != "こぴーする" {
		t.Fatalf("normalizeJapanese = %q", got)
	}
}
