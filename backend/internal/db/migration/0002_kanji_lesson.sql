-- 0002: standalone kanji lesson entries.

CREATE TABLE kanji_lesson (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    kanji      TEXT NOT NULL CHECK (length(trim(kanji)) BETWEEN 1 AND 200),
    hira       TEXT NOT NULL DEFAULT '',
    romaji     TEXT NOT NULL DEFAULT '',
    arti       TEXT NOT NULL CHECK (length(trim(arti)) BETWEEN 1 AND 500),
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX idx_kanji_lesson_kanji ON kanji_lesson(kanji);
