-- 0001: chapters and vocabulary.

CREATE TABLE bab (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    nama       TEXT NOT NULL CHECK (length(trim(nama)) BETWEEN 1 AND 100),
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE kosakata (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    bab_id       INTEGER NOT NULL REFERENCES bab(id) ON DELETE CASCADE,
    kanji        TEXT NOT NULL CHECK (length(trim(kanji)) BETWEEN 1 AND 200),
    hira         TEXT NOT NULL DEFAULT '',
    romaji       TEXT NOT NULL DEFAULT '',
    arti         TEXT NOT NULL CHECK (length(trim(arti)) BETWEEN 1 AND 500),
    audio_jp     TEXT,
    audio_id     TEXT,
    audio_status TEXT NOT NULL DEFAULT 'pending'
                 CHECK (audio_status IN ('pending', 'ready', 'failed')),
    created_at   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    updated_at   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX idx_kosakata_bab_id ON kosakata(bab_id);
CREATE INDEX idx_kosakata_bab_audio ON kosakata(bab_id, audio_status);
