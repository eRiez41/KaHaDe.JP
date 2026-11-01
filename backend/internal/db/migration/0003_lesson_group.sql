-- 0003: group standalone kanji lesson entries under named lessons.

CREATE TABLE lesson (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    nama       TEXT NOT NULL CHECK (length(trim(nama)) BETWEEN 1 AND 100),
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

ALTER TABLE kanji_lesson
    ADD COLUMN lesson_id INTEGER REFERENCES lesson(id) ON DELETE CASCADE;

CREATE INDEX idx_kanji_lesson_lesson_id ON kanji_lesson(lesson_id);

-- Preserve entries created before grouping under a default lesson.
INSERT INTO lesson (nama, created_at, updated_at)
SELECT
    'Lesson 1',
    strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
    strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
WHERE EXISTS (SELECT 1 FROM kanji_lesson WHERE lesson_id IS NULL);

UPDATE kanji_lesson
SET lesson_id = (SELECT id FROM lesson ORDER BY id ASC LIMIT 1)
WHERE lesson_id IS NULL;
