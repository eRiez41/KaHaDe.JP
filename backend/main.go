package main

import (
	"context"
	"errors"
	"flag"
	"fmt"
	"log/slog"
	"os"
	"os/signal"
	"path/filepath"
	"strings"
	"syscall"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/joho/godotenv"

	"tts-jpn/internal/config"
	"tts-jpn/internal/db"
	"tts-jpn/internal/handlers"
	"tts-jpn/internal/middleware"
	"tts-jpn/internal/services"
)

const shutdownTimeout = 10 * time.Second

func main() {
	if err := run(); err != nil {
		slog.Error("server stopped with error", "error", err)
		os.Exit(1)
	}
}

func run() error {
	migrateOnly := flag.Bool("migrate-only", false, "apply database migrations and exit")
	flag.Parse()

	if err := loadDotEnv(); err != nil {
		return err
	}

	cfg, err := config.Load()
	if err != nil {
		return fmt.Errorf("load config: %w", err)
	}

	logger := newLogger(cfg.LogLevel)
	slog.SetDefault(logger)

	if err := ensureStorage(cfg.StoragePath); err != nil {
		return fmt.Errorf("prepare storage: %w", err)
	}

	ctx := context.Background()

	sqlDB, err := db.Open(ctx, cfg.DBPath)
	if err != nil {
		return fmt.Errorf("open database: %w", err)
	}
	defer func() {
		if closeErr := sqlDB.Close(); closeErr != nil {
			logger.Error("close database failed", "error", closeErr)
		}
	}()

	if err := db.Migrate(ctx, sqlDB); err != nil {
		return fmt.Errorf("run migrations: %w", err)
	}

	if *migrateOnly {
		logger.Info("migrations applied", "db_path", cfg.DBPath)
		return nil
	}

	babRepo := db.NewBabRepository(sqlDB)
	kosakataRepo := db.NewKosakataRepository(sqlDB)
	kanjiLessonRepo := db.NewKanjiLessonRepository(sqlDB)
	lessonRepo := db.NewLessonRepository(sqlDB)

	babHandler := handlers.NewBabHandler(services.NewBabService(babRepo))
	kosakataHandler := handlers.NewKosakataHandler(
		services.NewKosakataService(kosakataRepo, babRepo),
	)
	kanjiLessonHandler := handlers.NewKanjiLessonHandler(
		services.NewKanjiLessonService(kanjiLessonRepo, lessonRepo),
	)
	lessonHandler := handlers.NewLessonHandler(services.NewLessonService(lessonRepo))
	audioService := services.NewAudioService(
		kosakataRepo,
		services.NewEdgeTTS(cfg.TTSTimeout),
		cfg.StoragePath,
		cfg.TTSVoiceJP,
		cfg.TTSVoiceID,
	)
	ttsHandler := handlers.NewTTSHandler(audioService)
	exportHandler := handlers.NewExportHandler(
		services.NewAudioMergeService(kosakataRepo, babRepo, cfg.StoragePath),
		services.NewKosakataService(kosakataRepo, babRepo),
		services.NewBabService(babRepo),
	)
	dictionaryHandler := handlers.NewDictionaryHandler(services.NewJishoDictionary(cfg.LookupTimeout))

	app := fiber.New(fiber.Config{
		AppName:       "tts-jpn-api",
		ErrorHandler:  middleware.ErrorHandler,
		ReadTimeout:   10 * time.Second,
		WriteTimeout:  5 * time.Minute,
		IdleTimeout:   60 * time.Second,
		StrictRouting: true,
		CaseSensitive: true,
	})

	app.Use(recover.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins: cfg.FrontendURL,
		AllowMethods: "GET,POST,PATCH,DELETE,OPTIONS",
		AllowHeaders: "Content-Type",
		MaxAge:       3600,
	}))

	handlers.RegisterRoutes(app.Group("/api"), babHandler, kosakataHandler, ttsHandler, exportHandler, dictionaryHandler, kanjiLessonHandler, lessonHandler)

	go shutdownOnSignal(app)

	logger.Info("server starting",
		"port", cfg.Port,
		"frontend_url", cfg.FrontendURL,
		"db_path", cfg.DBPath,
		"storage_path", cfg.StoragePath,
		"tts_voice_jp", cfg.TTSVoiceJP,
		"tts_voice_id", cfg.TTSVoiceID,
		"lookup_timeout", cfg.LookupTimeout,
	)

	if err := app.Listen(":" + cfg.Port); err != nil {
		return fmt.Errorf("fiber listen: %w", err)
	}

	logger.Info("server stopped")
	return nil
}

// loadDotEnv reads backend/.env when present. Production may rely on real
// environment variables instead.
func loadDotEnv() error {
	err := godotenv.Load()
	if err != nil && !errors.Is(err, os.ErrNotExist) {
		return fmt.Errorf("load .env: %w", err)
	}
	return nil
}

func newLogger(level string) *slog.Logger {
	var slogLevel slog.Level
	switch strings.ToLower(level) {
	case "debug":
		slogLevel = slog.LevelDebug
	case "warn":
		slogLevel = slog.LevelWarn
	case "error":
		slogLevel = slog.LevelError
	default:
		slogLevel = slog.LevelInfo
	}

	handler := slog.NewTextHandler(os.Stdout, &slog.HandlerOptions{Level: slogLevel})
	return slog.New(handler)
}

func ensureStorage(root string) error {
	for _, sub := range []string{"audio", "exports", "tmp"} {
		path := filepath.Join(root, sub)
		if err := os.MkdirAll(path, 0o755); err != nil {
			return fmt.Errorf("create %s: %w", path, err)
		}
	}
	return nil
}

func shutdownOnSignal(app *fiber.App) {
	signals := make(chan os.Signal, 1)
	signal.Notify(signals, os.Interrupt, syscall.SIGTERM)

	sig := <-signals
	slog.Info("shutdown signal received", "signal", sig.String())

	ctx, cancel := context.WithTimeout(context.Background(), shutdownTimeout)
	defer cancel()

	if err := app.ShutdownWithContext(ctx); err != nil {
		slog.Error("graceful shutdown failed", "error", err)
	}
}
