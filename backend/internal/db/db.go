package db

import (
	"context"
	"database/sql"
	"fmt"
	"os"
	"path/filepath"
	"time"

	_ "modernc.org/sqlite"
)

const (
	DB_BUSY_TIMEOUT_MS = 5000
	DB_MAX_OPEN_CONNS  = 4
	DB_MAX_IDLE_CONNS  = 4
)

// Open creates the SQLite pool and applies the connection-level pragmas.
func Open(ctx context.Context, path string) (*sql.DB, error) {
	if path == "" {
		return nil, fmt.Errorf("database path must not be empty")
	}
	if err := ensureParentDir(path); err != nil {
		return nil, err
	}

	sqlDB, err := sql.Open("sqlite", buildDSN(path))
	if err != nil {
		return nil, fmt.Errorf("open database: %w", err)
	}

	sqlDB.SetMaxOpenConns(DB_MAX_OPEN_CONNS)
	sqlDB.SetMaxIdleConns(DB_MAX_IDLE_CONNS)
	sqlDB.SetConnMaxLifetime(0)

	pingCtx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	if err := sqlDB.PingContext(pingCtx); err != nil {
		if closeErr := sqlDB.Close(); closeErr != nil {
			return nil, fmt.Errorf("ping database: %w (close error: %v)", err, closeErr)
		}
		return nil, fmt.Errorf("ping database: %w", err)
	}

	return sqlDB, nil
}

func buildDSN(path string) string {
	return fmt.Sprintf(
		"file:%s?_pragma=busy_timeout(%d)&_pragma=foreign_keys(1)&_pragma=journal_mode(WAL)",
		filepath.ToSlash(path),
		DB_BUSY_TIMEOUT_MS,
	)
}

func ensureParentDir(path string) error {
	dir := filepath.Dir(path)
	if dir == "." || dir == "" {
		return nil
	}
	if err := os.MkdirAll(dir, 0o755); err != nil {
		return fmt.Errorf("create database directory %s: %w", dir, err)
	}
	return nil
}

func formatTime(t time.Time) string {
	return t.UTC().Format(time.RFC3339Nano)
}

func parseTime(value string) (time.Time, error) {
	parsed, err := time.Parse(time.RFC3339Nano, value)
	if err != nil {
		return time.Time{}, fmt.Errorf("parse timestamp %q: %w", value, err)
	}
	return parsed.UTC(), nil
}
