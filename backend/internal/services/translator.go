package services

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"sync"
	"time"
	"unicode"
	"unicode/utf8"
)

const (
	// GoogleTranslator uses the same public endpoint as the browser extension
	// dictionary. It needs no API key and supports batching via repeated q.
	googleTranslateEndpoint = "https://clients5.google.com/translate_a/t"
	translationCacheTTL     = 24 * time.Hour
)

// MeaningTranslator translates English dictionary glosses into Indonesian.
type MeaningTranslator interface {
	Translate(ctx context.Context, texts []string) ([]string, error)
}

type translationCacheEntry struct {
	value   string
	expires time.Time
}

// GoogleTranslator is a small English→Indonesian client with an in-memory
// cache so repeated glosses ("to eat") only hit the network once.
type GoogleTranslator struct {
	client   *http.Client
	endpoint string
	ttl      time.Duration
	now      func() time.Time

	mu    sync.Mutex
	cache map[string]translationCacheEntry
}

func NewGoogleTranslator(timeout time.Duration) *GoogleTranslator {
	return newGoogleTranslator(googleTranslateEndpoint, timeout, translationCacheTTL)
}

func newGoogleTranslator(endpoint string, timeout, ttl time.Duration) *GoogleTranslator {
	return &GoogleTranslator{
		client:   &http.Client{Timeout: timeout},
		endpoint: endpoint,
		ttl:      ttl,
		now:      time.Now,
		cache:    make(map[string]translationCacheEntry),
	}
}

// Translate returns Indonesian glosses in the same order as texts. A failed
// request returns an error so callers can fall back to the English glosses.
func (t *GoogleTranslator) Translate(ctx context.Context, texts []string) ([]string, error) {
	results := make([]string, len(texts))
	misses := make([]string, 0, len(texts))
	missKeys := make([]string, 0, len(texts))
	pending := make(map[string]struct{})

	for i, text := range texts {
		key := translationKey(text)
		if key == "" {
			results[i] = text
			continue
		}
		if value, ok := t.cached(key); ok {
			results[i] = value
			continue
		}
		if _, exists := pending[key]; exists {
			continue
		}
		pending[key] = struct{}{}
		misses = append(misses, text)
		missKeys = append(missKeys, key)
	}

	if len(misses) > 0 {
		translated, err := t.request(ctx, misses)
		if err != nil {
			return nil, err
		}
		if len(translated) != len(misses) {
			return nil, fmt.Errorf("translate: got %d results for %d texts", len(translated), len(misses))
		}
		for i, value := range translated {
			value = cleanTranslation(lowerFirst(strings.TrimSpace(value)))
			if value == "" {
				value = misses[i]
			}
			t.store(missKeys[i], value)
		}
	}

	for i, text := range texts {
		if results[i] != "" {
			continue
		}
		if value, ok := t.cached(translationKey(text)); ok {
			results[i] = value
		} else {
			results[i] = text
		}
	}
	return results, nil
}

func (t *GoogleTranslator) request(ctx context.Context, texts []string) ([]string, error) {
	values := url.Values{}
	values.Set("client", "dict-chrome-ex")
	values.Set("sl", "en")
	values.Set("tl", "id")
	for _, text := range texts {
		values.Add("q", translationInput(text))
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, t.endpoint+"?"+values.Encode(), nil)
	if err != nil {
		return nil, fmt.Errorf("translate: %w", err)
	}
	req.Header.Set("Accept", "application/json")
	req.Header.Set("User-Agent", "Mozilla/5.0 (compatible; tts-jpn/1.0)")

	resp, err := t.client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("translate: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("translate: status %d", resp.StatusCode)
	}

	body, err := io.ReadAll(io.LimitReader(resp.Body, 1<<20))
	if err != nil {
		return nil, fmt.Errorf("translate: %w", err)
	}

	var raw []json.RawMessage
	if err := json.Unmarshal(body, &raw); err != nil {
		return nil, fmt.Errorf("translate: %w", err)
	}

	translated := make([]string, 0, len(raw))
	for _, item := range raw {
		var value string
		if err := json.Unmarshal(item, &value); err != nil {
			return nil, fmt.Errorf("translate: unexpected response: %w", err)
		}
		translated = append(translated, value)
	}
	return translated, nil
}

func (t *GoogleTranslator) cached(key string) (string, bool) {
	t.mu.Lock()
	defer t.mu.Unlock()

	item, hit := t.cache[key]
	if !hit {
		return "", false
	}
	if t.now().After(item.expires) {
		delete(t.cache, key)
		return "", false
	}
	return item.value, true
}

func (t *GoogleTranslator) store(key, value string) {
	t.mu.Lock()
	defer t.mu.Unlock()

	t.cache[key] = translationCacheEntry{
		value:   value,
		expires: t.now().Add(t.ttl),
	}
}

func translationKey(text string) string {
	return strings.ToLower(strings.TrimSpace(translationInput(text)))
}

// translationInput drops the infinitive marker because Google renders "to eat"
// as "untuk makan" instead of the dictionary-style "makan".
func translationInput(text string) string {
	trimmed := strings.TrimSpace(text)
	if strings.HasPrefix(trimmed, "to ") {
		return strings.TrimSpace(trimmed[3:])
	}
	return trimmed
}

func lowerFirst(text string) string {
	r, size := utf8.DecodeRuneInString(text)
	if r == utf8.RuneError || !unicode.IsLetter(r) {
		return text
	}
	return string(unicode.ToLower(r)) + text[size:]
}

// cleanTranslation removes punctuation artifacts from the machine translation,
// such as a trailing period or an unmatched closing parenthesis.
func cleanTranslation(text string) string {
	text = strings.TrimSpace(text)
	text = strings.TrimSuffix(text, ".")
	for strings.HasSuffix(text, ")") && strings.Count(text, ")") > strings.Count(text, "(") {
		text = strings.TrimSpace(strings.TrimSuffix(text, ")"))
	}
	return text
}
