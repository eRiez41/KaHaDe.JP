package db

import (
	"context"
	"path/filepath"
	"testing"
	"time"

	"tts-jpn/internal/models"
)

func TestDeleteBabCascadesKosakata(t *testing.T) {
	ctx := context.Background()
	sqlDB, err := Open(ctx, filepath.Join(t.TempDir(), "test.db"))
	if err != nil {
		t.Fatalf("open test db: %v", err)
	}
	t.Cleanup(func() {
		if closeErr := sqlDB.Close(); closeErr != nil {
			t.Errorf("close test db: %v", closeErr)
		}
	})

	if err := Migrate(ctx, sqlDB); err != nil {
		t.Fatalf("migrate test db: %v", err)
	}

	babRepo := NewBabRepository(sqlDB)
	kosakataRepo := NewKosakataRepository(sqlDB)

	now := time.Now().UTC().Truncate(time.Millisecond)
	bab, err := babRepo.Create(ctx, "Bab Cascade", now)
	if err != nil {
		t.Fatalf("create bab: %v", err)
	}

	_, err = kosakataRepo.Create(ctx, models.Kosakata{
		BabID:       bab.ID,
		Kanji:       "日本",
		Arti:        "Jepang",
		AudioStatus: models.AudioStatusPending,
		CreatedAt:   now,
		UpdatedAt:   now,
	})
	if err != nil {
		t.Fatalf("create kosakata: %v", err)
	}

	deleted, err := babRepo.Delete(ctx, bab.ID)
	if err != nil {
		t.Fatalf("delete bab: %v", err)
	}
	if !deleted {
		t.Fatal("bab was not deleted")
	}

	var count int
	if err := sqlDB.QueryRowContext(
		ctx,
		`SELECT COUNT(*) FROM kosakata WHERE bab_id = ?`,
		bab.ID,
	).Scan(&count); err != nil {
		t.Fatalf("count kosakata: %v", err)
	}
	if count != 0 {
		t.Fatalf("got %d kosakata after cascade, want 0", count)
	}
}
