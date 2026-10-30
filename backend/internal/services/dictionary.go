package services

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"net/url"
	"strings"
	"sync"
	"time"
)

const (
	jishoEndpoint    = "https://jisho.org/api/v1/search/words"
	dictionaryCache  = 24 * time.Hour
	translationRetry = 10 * time.Minute
	maxPartsOfSpeech = 4
)

// ErrWordNotFound is returned when the dictionary has no exact entry for a word.
var ErrWordNotFound = errors.New("kata tidak ditemukan di kamus")

// ErrDictionaryUnavailable is returned when the dictionary service cannot be
// reached or answers with an unexpected status.
var ErrDictionaryUnavailable = errors.New("layanan kamus sedang tidak tersedia")

// DictionaryEntry is the normalized subset of a Jisho result that the client
// needs to show a word's meaning and metadata.
type DictionaryEntry struct {
	Query         string   `json:"query"`
	Word          string   `json:"word"`
	Reading       string   `json:"reading"`
	Meanings      []string `json:"meanings"`
	MeaningsEn    []string `json:"meaningsEn,omitempty"`
	PartsOfSpeech []string `json:"partsOfSpeech"`
	JLPT          string   `json:"jlpt"`
	IsCommon      bool     `json:"isCommon"`
	Translated    bool     `json:"translated"`
}

type cacheEntry struct {
	entry    *DictionaryEntry
	notFound bool
	expires  time.Time
}

// JishoDictionary validates words against the public Jisho API. Results are
// cached in memory for a day so repeated lookups do not hit the network.
type JishoDictionary struct {
	client     *http.Client
	translator MeaningTranslator
	baseURL    string
	ttl        time.Duration
	now        func() time.Time

	mu    sync.Mutex
	cache map[string]cacheEntry
}

// NewJishoDictionary creates a client with a per-request HTTP timeout.
func NewJishoDictionary(timeout time.Duration) *JishoDictionary {
	dict := newJishoDictionary(jishoEndpoint, timeout, dictionaryCache)
	dict.translator = NewGoogleTranslator(timeout)
	return dict
}

func newJishoDictionary(baseURL string, timeout, ttl time.Duration) *JishoDictionary {
	return &JishoDictionary{
		client:  &http.Client{Timeout: timeout},
		baseURL: baseURL,
		ttl:     ttl,
		now:     time.Now,
		cache:   make(map[string]cacheEntry),
	}
}

// Lookup returns the exact dictionary entry for word. Fuzzy Jisho matches are
// rejected so nonsense input such as "xyzmasu" cannot pass validation.
func (d *JishoDictionary) Lookup(ctx context.Context, word string) (*DictionaryEntry, error) {
	key := normalizeJapanese(word)
	if key == "" {
		return nil, ErrWordNotFound
	}

	if entry, ok, hit := d.cached(key); hit {
		if !ok {
			return nil, ErrWordNotFound
		}
		copied := *entry
		return &copied, nil
	}

	entry, err := d.fetch(ctx, word)
	if errors.Is(err, ErrWordNotFound) {
		// Loanwords are stored in katakana on Jisho, so a hiragana-only query
		// such as こぴーする gets no useful result. Retry with katakana.
		if variant, ok := katakanaVariant(word); ok {
			entry, err = d.fetch(ctx, variant)
		}
	}
	if err != nil {
		if errors.Is(err, ErrWordNotFound) {
			d.store(key, nil, d.ttl)
		}
		return nil, err
	}
	// word may point into Fiber's request buffer. Clone it before caching so a
	// later request cannot mutate this entry's Query.
	entry.Query = strings.Clone(strings.TrimSpace(word))
	d.translate(ctx, entry)

	ttl := d.ttl
	if d.translator != nil && !entry.Translated {
		ttl = translationRetry
	}
	d.store(key, entry, ttl)
	return entry, nil
}

// translate fills Meanings with Indonesian glosses while keeping the original
// English in MeaningsEn. Translation is best-effort: on failure the English
// glosses stay visible and Translated stays false.
func (d *JishoDictionary) translate(ctx context.Context, entry *DictionaryEntry) {
	entry.MeaningsEn = append([]string(nil), entry.Meanings...)
	if d.translator == nil || len(entry.Meanings) == 0 {
		return
	}

	translated, err := d.translator.Translate(ctx, entry.Meanings)
	if err != nil {
		slog.Warn("translate meanings failed", "word", entry.Word, "error", err)
		return
	}
	if len(translated) != len(entry.Meanings) {
		slog.Warn("translate meanings returned wrong length", "word", entry.Word)
		return
	}

	entry.Meanings = translated
	entry.Translated = true
	entry.Meanings, entry.MeaningsEn = dedupeMeanings(entry.Meanings, entry.MeaningsEn)
}

// dedupeMeanings drops translated glosses that ended up identical, keeping the
// first occurrence and the English gloss that produced it.
func dedupeMeanings(meanings, originals []string) ([]string, []string) {
	seen := make(map[string]struct{}, len(meanings))
	uniqueMeanings := make([]string, 0, len(meanings))
	uniqueOriginals := make([]string, 0, len(originals))

	for i, meaning := range meanings {
		key := strings.ToLower(strings.TrimSpace(meaning))
		if key == "" {
			continue
		}
		if _, exists := seen[key]; exists {
			continue
		}
		seen[key] = struct{}{}
		uniqueMeanings = append(uniqueMeanings, meaning)
		if i < len(originals) {
			uniqueOriginals = append(uniqueOriginals, originals[i])
		}
	}
	return uniqueMeanings, uniqueOriginals
}

func (d *JishoDictionary) cached(key string) (*DictionaryEntry, bool, bool) {
	d.mu.Lock()
	defer d.mu.Unlock()

	item, hit := d.cache[key]
	if !hit {
		return nil, false, false
	}
	if d.now().After(item.expires) {
		delete(d.cache, key)
		return nil, false, false
	}
	if item.notFound {
		return nil, false, true
	}
	return item.entry, true, true
}

func (d *JishoDictionary) store(key string, entry *DictionaryEntry, ttl time.Duration) {
	d.mu.Lock()
	defer d.mu.Unlock()

	d.cache[key] = cacheEntry{
		entry:    entry,
		notFound: entry == nil,
		expires:  d.now().Add(ttl),
	}
}

func (d *JishoDictionary) fetch(ctx context.Context, word string) (*DictionaryEntry, error) {
	endpoint, err := url.Parse(d.baseURL)
	if err != nil {
		return nil, fmt.Errorf("%w: %v", ErrDictionaryUnavailable, err)
	}
	values := endpoint.Query()
	values.Set("keyword", word)
	endpoint.RawQuery = values.Encode()

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, endpoint.String(), nil)
	if err != nil {
		return nil, fmt.Errorf("%w: %v", ErrDictionaryUnavailable, err)
	}
	req.Header.Set("Accept", "application/json")
	req.Header.Set("User-Agent", "tts-jpn/1.0 (Japanese vocabulary trainer)")

	resp, err := d.client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("%w: %v", ErrDictionaryUnavailable, err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("%w: status %d", ErrDictionaryUnavailable, resp.StatusCode)
	}

	body, err := io.ReadAll(io.LimitReader(resp.Body, 1<<20))
	if err != nil {
		return nil, fmt.Errorf("%w: %v", ErrDictionaryUnavailable, err)
	}

	var payload jishoResponse
	if err := json.Unmarshal(body, &payload); err != nil {
		return nil, fmt.Errorf("%w: %v", ErrDictionaryUnavailable, err)
	}

	entry := pickExactEntry(word, payload.Data)
	if entry == nil {
		return nil, ErrWordNotFound
	}
	return entry, nil
}

// pickExactEntry only accepts an entry whose written or reading form equals the
// query. For suru-compounds (勉強する, コピーする) Jisho stores the noun form,
// so the base word is compared instead as long as the entry is a suru verb.
func pickExactEntry(query string, data []jishoWord) *DictionaryEntry {
	normQuery := normalizeJapanese(query)
	suruBase := ""
	if strings.HasSuffix(normQuery, "する") && len([]rune(normQuery)) > 2 {
		suruBase = strings.TrimSuffix(normQuery, "する")
	}

	for _, item := range data {
		for _, jp := range item.Japanese {
			written := normalizeJapanese(jp.Word)
			reading := normalizeJapanese(jp.Reading)

			matched := written == normQuery || reading == normQuery
			if !matched && suruBase != "" && hasSuruPOS(item) {
				matched = written == suruBase || reading == suruBase
			}
			if matched {
				return toDictionaryEntry(query, item, jp)
			}
		}
	}
	return nil
}

func hasSuruPOS(item jishoWord) bool {
	for _, sense := range item.Senses {
		for _, pos := range sense.PartsOfSpeech {
			lower := strings.ToLower(pos)
			if strings.Contains(lower, "suru verb") || strings.Contains(lower, "aux. verb suru") {
				return true
			}
		}
	}
	return false
}

func toDictionaryEntry(query string, item jishoWord, jp jishoJapanese) *DictionaryEntry {
	word := strings.TrimSpace(jp.Word)
	reading := strings.TrimSpace(jp.Reading)
	if word == "" {
		word = reading
	}

	entry := &DictionaryEntry{
		Query:         strings.Clone(strings.TrimSpace(query)),
		Word:          word,
		Reading:       reading,
		Meanings:      collectMeanings(item.Senses),
		PartsOfSpeech: collectPartsOfSpeech(item.Senses),
		JLPT:          normalizeJLPT(item.JLPT),
		IsCommon:      item.IsCommon,
	}
	return entry
}

// collectMeanings keeps only the first definition of the first non-empty sense.
// Jisho's later definitions and senses are context-dependent glosses that
// translate poorly out of context ("to watch" → "jam tangan", "to swallow" →
// "angsa") and make the conjugation card noisy.
func collectMeanings(senses []jishoSense) []string {
	for _, sense := range senses {
		for _, definition := range sense.EnglishDefinitions {
			definition = strings.TrimSpace(definition)
			if definition != "" {
				return []string{definition}
			}
		}
	}
	return nil
}

func collectPartsOfSpeech(senses []jishoSense) []string {
	for _, sense := range senses {
		parts := collectSensePartsOfSpeech(sense)
		if len(parts) > 0 {
			return parts
		}
	}
	return nil
}

func collectSensePartsOfSpeech(sense jishoSense) []string {
	seen := make(map[string]struct{})
	parts := make([]string, 0, maxPartsOfSpeech)

	for _, pos := range sense.PartsOfSpeech {
		pos = strings.TrimSpace(pos)
		if pos == "" {
			continue
		}
		if _, exists := seen[pos]; exists {
			continue
		}
		seen[pos] = struct{}{}
		parts = append(parts, pos)
		if len(parts) == maxPartsOfSpeech {
			break
		}
	}
	return parts
}

func normalizeJLPT(levels []string) string {
	if len(levels) == 0 {
		return ""
	}
	level := strings.ToUpper(strings.TrimSpace(levels[0]))
	level = strings.TrimPrefix(level, "JLPT-")
	if level == "" {
		return ""
	}
	return level
}

// normalizeJapanese lowercases latin input and folds katakana into hiragana so
// コピー and こぴー compare as the same word.
func normalizeJapanese(value string) string {
	var builder strings.Builder
	for _, r := range strings.ToLower(strings.TrimSpace(value)) {
		if r >= 'ァ' && r <= 'ヶ' {
			r -= 0x60
		}
		builder.WriteRune(r)
	}
	return builder.String()
}

// katakanaVariant converts a hiragana suru-compound into katakana because
// Jisho stores loanwords that way (コピーする, テストする). The trailing する
// stays in hiragana, and non-suru queries are not retried.
func katakanaVariant(value string) (string, bool) {
	trimmed := strings.TrimSpace(value)
	if !strings.HasSuffix(trimmed, "する") || len([]rune(trimmed)) <= 2 {
		return "", false
	}

	body := strings.TrimSuffix(trimmed, "する")
	hasHiragana := false
	var builder strings.Builder
	for _, r := range body {
		switch {
		case r >= 'ぁ' && r <= 'ゖ':
			hasHiragana = true
			builder.WriteRune(r + 0x60)
		case r == 'ー':
			builder.WriteRune(r)
		default:
			return "", false
		}
	}
	if !hasHiragana {
		return "", false
	}
	return builder.String() + "する", true
}

type jishoResponse struct {
	Data []jishoWord `json:"data"`
}

type jishoWord struct {
	IsCommon bool            `json:"is_common"`
	JLPT     []string        `json:"jlpt"`
	Japanese []jishoJapanese `json:"japanese"`
	Senses   []jishoSense    `json:"senses"`
}

type jishoJapanese struct {
	Word    string `json:"word"`
	Reading string `json:"reading"`
}

type jishoSense struct {
	EnglishDefinitions []string `json:"english_definitions"`
	PartsOfSpeech      []string `json:"parts_of_speech"`
}
