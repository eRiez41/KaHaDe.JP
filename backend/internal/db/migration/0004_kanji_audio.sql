-- 0004: audio for standalone kanji lesson entries.

ALTER TABLE kanji_lesson ADD COLUMN audio_jp TEXT;
ALTER TABLE kanji_lesson ADD COLUMN audio_id TEXT;
ALTER TABLE kanji_lesson ADD COLUMN audio_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (audio_status IN ('pending', 'ready', 'failed'));

CREATE INDEX idx_kanji_lesson_audio ON kanji_lesson(lesson_id, audio_status);
