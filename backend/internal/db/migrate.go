package db

import (
	"context"
	"database/sql"
	"embed"
	"errors"
	"fmt"
	"io/fs"
	"log/slog"
	"sort"
	"strings"
	"time"
)

//go:embed migration/*.sql
var migrationFiles embed.FS

// Migrate applies every embedded migration that has not been recorded yet.
func Migrate(ctx context.Context, sqlDB *sql.DB) error {
	const createTable = `
CREATE TABLE IF NOT EXISTS schema_migrations (
	version    TEXT PRIMARY KEY,
	applied_at TEXT NOT NULL
)`

	if _, err := sqlDB.ExecContext(ctx, createTable); err != nil {
		return fmt.Errorf("create schema_migrations: %w", err)
	}

	entries, err := fs.ReadDir(migrationFiles, "migration")
	if err != nil {
		return fmt.Errorf("read migrations: %w", err)
	}

	names := make([]string, 0, len(entries))
	for _, entry := range entries {
		if entry.IsDir() || !strings.HasSuffix(entry.Name(), ".sql") {
			continue
		}
		names = append(names, entry.Name())
	}
	sort.Strings(names)

	for _, name := range names {
		applied, err := isApplied(ctx, sqlDB, name)
		if err != nil {
			return err
		}
		if applied {
			continue
		}

		script, err := migrationFiles.ReadFile("migration/" + name)
		if err != nil {
			return fmt.Errorf("read migration %s: %w", name, err)
		}
		if err := applyMigration(ctx, sqlDB, name, string(script)); err != nil {
			return err
		}
		slog.Info("migration applied", "version", name)
	}

	return nil
}

func isApplied(ctx context.Context, sqlDB *sql.DB, name string) (bool, error) {
	var exists int
	err := sqlDB.QueryRowContext(
		ctx,
		`SELECT 1 FROM schema_migrations WHERE version = ?`,
		name,
	).Scan(&exists)
	if errors.Is(err, sql.ErrNoRows) {
		return false, nil
	}
	if err != nil {
		return false, fmt.Errorf("check migration %s: %w", name, err)
	}
	return true, nil
}

func applyMigration(ctx context.Context, sqlDB *sql.DB, name, script string) error {
	tx, err := sqlDB.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("begin migration %s: %w", name, err)
	}
	defer func() {
		if rollbackErr := tx.Rollback(); rollbackErr != nil && !errors.Is(rollbackErr, sql.ErrTxDone) {
			slog.Warn("migration rollback failed", "version", name, "error", rollbackErr)
		}
	}()

	// modernc.org/sqlite supports multi-statement scripts in a single Exec.
	if _, err := tx.ExecContext(ctx, script); err != nil {
		return fmt.Errorf("execute migration %s: %w", name, err)
	}

	if _, err := tx.ExecContext(
		ctx,
		`INSERT INTO schema_migrations (version, applied_at) VALUES (?, ?)`,
		name,
		formatTime(time.Now().UTC()),
	); err != nil {
		return fmt.Errorf("record migration %s: %w", name, err)
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("commit migration %s: %w", name, err)
	}
	return nil
}
