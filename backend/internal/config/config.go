package config

import (
	"fmt"
	"net/url"
	"os"
	"strconv"
	"strings"
	"time"
)

// Default values used when the matching environment variable is not set.
const (
	DEFAULT_PORT           = "8080"
	DEFAULT_DB_PATH        = "./data/app.db"
	DEFAULT_STORAGE_PATH   = "./storage"
	DEFAULT_AUDIO_TTL      = 1800
	DEFAULT_LOG_LEVEL      = "info"
	DEFAULT_FRONTEND_URL   = "http://localhost:5173"
	DEFAULT_TTS_VOICE_JP   = "ja-JP-NanamiNeural"
	DEFAULT_TTS_VOICE_ID   = "id-ID-GadisNeural"
	DEFAULT_TTS_TIMEOUT    = 30
	DEFAULT_LOOKUP_TIMEOUT = 8
)

// Config holds every runtime setting. All values come from environment
// variables so the binary stays deployable without code changes.
type Config struct {
	Port          string
	DBPath        string
	StoragePath   string
	AudioTTL      time.Duration
	LogLevel      string
	FrontendURL   string
	TTSVoiceJP    string
	TTSVoiceID    string
	TTSTimeout    time.Duration
	LookupTimeout time.Duration
}

// Load reads and validates the environment configuration.
func Load() (*Config, error) {
	cfg := &Config{
		Port:        env("PORT", DEFAULT_PORT),
		DBPath:      env("DB_PATH", DEFAULT_DB_PATH),
		StoragePath: env("STORAGE_PATH", DEFAULT_STORAGE_PATH),
		LogLevel:    strings.ToLower(env("LOG_LEVEL", DEFAULT_LOG_LEVEL)),
		FrontendURL: env("FRONTEND_URL", DEFAULT_FRONTEND_URL),
		TTSVoiceJP:  env("TTS_VOICE_JP", DEFAULT_TTS_VOICE_JP),
		TTSVoiceID:  env("TTS_VOICE_ID", DEFAULT_TTS_VOICE_ID),
	}

	port, err := strconv.Atoi(cfg.Port)
	if err != nil || port < 1 || port > 65535 {
		return nil, fmt.Errorf("invalid PORT %q: must be a number between 1 and 65535", cfg.Port)
	}

	ttlRaw := env("AUDIO_TTL", strconv.Itoa(DEFAULT_AUDIO_TTL))
	ttlSeconds, err := strconv.Atoi(ttlRaw)
	if err != nil || ttlSeconds < 0 {
		return nil, fmt.Errorf("invalid AUDIO_TTL %q: must be a non-negative number of seconds", ttlRaw)
	}
	cfg.AudioTTL = time.Duration(ttlSeconds) * time.Second

	timeoutRaw := env("TTS_TIMEOUT", strconv.Itoa(DEFAULT_TTS_TIMEOUT))
	timeoutSeconds, err := strconv.Atoi(timeoutRaw)
	if err != nil || timeoutSeconds < 1 {
		return nil, fmt.Errorf("invalid TTS_TIMEOUT %q: must be a positive number of seconds", timeoutRaw)
	}
	cfg.TTSTimeout = time.Duration(timeoutSeconds) * time.Second

	lookupRaw := env("LOOKUP_TIMEOUT", strconv.Itoa(DEFAULT_LOOKUP_TIMEOUT))
	lookupSeconds, err := strconv.Atoi(lookupRaw)
	if err != nil || lookupSeconds < 1 {
		return nil, fmt.Errorf("invalid LOOKUP_TIMEOUT %q: must be a positive number of seconds", lookupRaw)
	}
	cfg.LookupTimeout = time.Duration(lookupSeconds) * time.Second

	if strings.TrimSpace(cfg.TTSVoiceJP) == "" {
		return nil, fmt.Errorf("TTS_VOICE_JP must not be empty")
	}
	if strings.TrimSpace(cfg.TTSVoiceID) == "" {
		return nil, fmt.Errorf("TTS_VOICE_ID must not be empty")
	}

	if strings.TrimSpace(cfg.DBPath) == "" {
		return nil, fmt.Errorf("DB_PATH must not be empty")
	}
	if strings.TrimSpace(cfg.StoragePath) == "" {
		return nil, fmt.Errorf("STORAGE_PATH must not be empty")
	}
	if !isValidLogLevel(cfg.LogLevel) {
		return nil, fmt.Errorf("invalid LOG_LEVEL %q: use debug, info, warn, or error", cfg.LogLevel)
	}
	if err := validateURL(cfg.FrontendURL); err != nil {
		return nil, fmt.Errorf("invalid FRONTEND_URL %q: %w", cfg.FrontendURL, err)
	}

	return cfg, nil
}

func env(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}

func isValidLogLevel(level string) bool {
	switch level {
	case "debug", "info", "warn", "error":
		return true
	default:
		return false
	}
}

func validateURL(raw string) error {
	parsed, err := url.Parse(raw)
	if err != nil {
		return err
	}
	if parsed.Scheme != "http" && parsed.Scheme != "https" {
		return fmt.Errorf("scheme must be http or https")
	}
	if parsed.Host == "" {
		return fmt.Errorf("host is required")
	}
	return nil
}
