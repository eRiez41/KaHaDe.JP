# KOSAKATA.MD — Integrasi Sumber Data Kosakata

Dokumen ini adalah spesifikasi teknis untuk integrasi sumber data
kosakata Jepang ke aplikasi KaHaDe JP. Fokus: cara memanggil API,
format response, dan rekomendasi penggunaan sesuai kebutuhan.

Referensi:
- app.md        : flow/UX utama (import JSON, tabel kosakata)
- tech-stack.md : Go Fiber + SQLite + Svelte
- rules.md      : aturan kerja agent

============================================================
1. RINGKASAN
============================================================

KaHaDe JP butuh data kosakata Jepang (kanji, hiragana, romaji, arti)
untuk mengisi tabel `kosakata`. Ada dua pendekatan:

1. API ONLINE  : panggil langsung, data selalu update, tapi butuh
                 koneksi & handle rate limit.
2. DATASET OFFLINE : unduh sekali, simpan di SQLite/JSON, query
                     lokal tanpa batas.

Rekomendasi: pakai KOMBINASI. Dataset offline untuk bulk import
(Minna no Nihongo), API online untuk lookup saat user input manual.

============================================================
2. DAFTAR SUMBER DATA
============================================================

| Sumber              | Tipe    | Bahasa Arti | Lisensi      | CORS |
|---------------------|---------|-------------|--------------|------|
| Jisho API           | API     | Inggris     | Free, no key | ❌   |
| JLPT-VOCAB-API      | API     | Inggris     | Free, open   | ✅   |
| MinnaNoDS           | Dataset | Inggris+FR  | Cek repo     | —    |
| OpenJLPT            | Dataset | Inggris     | CC BY-SA 4.0 | —    |
| JMdict-simplified   | Dataset | Inggris     | EDRDG        | —    |
| KanjiAPI            | API     | Inggris     | Free, no key | ✅   |

============================================================
3. JISHO API
============================================================

## 3A. Endpoint

  GET https://jisho.org/api/v1/search/words?keyword={query}

- Tidak butuh API key, gratis.
- Query bisa: kanji, hiragana, katakana, romaji, atau Inggris.
- Response: JSON.

## 3B. Contoh Request

GET https://jisho.org/api/v1/search/words?keyword=tabe
text


## 3C. Struktur Response (ringkas)

```json
{
  "meta": { "status": 200 },
  "data": [
    {
      "slug": "食べる",
      "is_common": true,
      "tags": ["wanikani22"],
      "jlpt": ["jlpt-n5"],
      "japanese": [
        { "word": "食べる", "reading": "たべる" }
      ],
      "senses": [
        {
          "english_definitions": ["to eat", "to live on"],
          "parts_of_speech": ["Ichidan verb", "transitive verb"],
          "tags": [],
          "restrictions": [],
          "see_also": [],
          "antonyms": [],
          "source": [],
          "info": []
        }
      ]
    }
  ]
}

Field penting untuk KaHaDe JP:

    japanese[].word → kanji/kata

    japanese[].reading → hiragana

    senses[].english_definitions → arti (Inggris)

    senses[].parts_of_speech → kelas kata

    jlpt → level JLPT

3D. Catatan Integrasi

    ⚠️ CORS tidak aktif. Jisho API tidak mengirim header
    Access-Control-Allow-Origin. Artinya tidak bisa dipanggil
    langsung dari browser Svelte.

    Solusi: panggil dari backend Go Fiber. Buat endpoint proxy:

text

GET /api/lookup?q={query}
  → Go Fiber fetch ke Jisho API
  → return JSON yang sudah dinormalisasi

    Response Jisho formatnya "somewhat complex and is not documented"
    [12†L33-L34], jadi backend perlu mapping ke format internal:

json

{
  "kanji": "食べる",
  "hira": "たべる",
  "romaji": "taberu",       // generate via wanakana/kuroshiro
  "arti": "to eat",          // Inggris, perlu translasi
  "kelas_kata": "ichidan",
  "jlpt": "n5"
}

    Rate limit: tidak ada dokumentasi resmi, tapi jangan spam.
    Cache hasil lookup di SQLite (tabel lookup_cache) untuk
    menghindari request berulang.

3E. Kapan Pakai

    User input manual 1 kata di form tambah kosakata.

    User klik "Cari arti" di tabel.

    Lookup kanji/reading saat validasi input.

============================================================

    JLPT-VOCAB-API
    ============================================================

4A. Endpoint

Base URL: https://jlpt-vocab-api.vercel.app

RESTful:
GET /api/v1/vocab?level={n5|n4|n3|n2|n1}&offset={n}&limit={n}

GraphQL:
POST /api/graphql

    Mendukung CORS [7†L6-L7], jadi bisa dipanggil langsung dari browser.

    Data: 8.385 kata JLPT N5–N1 [15†L3-L4].

4B. Contoh Response (RESTful)
json

{
  "total": 8385,
  "offset": 0,
  "limit": 10,
  "words": [
    {
      "word": "毎朝",
      "meaning": "every morning",
      "furigana": "まいあさ",
      "romaji": "maiasa",
      "level": 5
    }
  ]
}

4C. Catatan Integrasi

    ✅ CORS aktif, bisa dipanggil dari Svelte.

    Tapi untuk konsistensi & caching, tetap disarankan lewat
    backend Go (proxy + simpan hasil ke SQLite).

    Arti masih bahasa Inggris. Perlu translasi ke Indonesia.

    Level: 5 = N5, 4 = N4, dst.

4D. Kapan Pakai

    Bulk import kosakata JLPT ke bab baru.

    Filter "tampilkan kata N5" di UI.

    Random word generator untuk latihan.

============================================================

    MINNANODS (Minna no Nihongo Dataset)
    ============================================================

5A. Format

    File: minna-no-ds.yaml (~841 KB) [2†L20].

    Struktur per entri [8†L5-L7]:

yaml

- id: [2, 10]
  edition: [1, 2]
  kanji: "新聞"
  kana: "しんぶん"
  romaji: "shinbun"
  meaning:
    en: "newspaper"
    fr: "journal"

    Key per lesson: lesson-01, lesson-02, dst [8†L34-L35].

5B. Cara Pakai

    Unduh YAML dari repo vitto4/MinnaNoDS.

    Konversi YAML → JSON (pakai js-yaml di frontend, atau
    gopkg.in/yaml.v3 di Go).

    Import ke SQLite: satu lesson = satu bab.

    Mapping meaning.en → arti (perlu translasi Indonesia).

Contoh konversi di Go:
go

import "gopkg.in/yaml.v3"

type Entry struct {
    Kanji  string `yaml:"kanji"`
    Kana   string `yaml:"kana"`
    Romaji string `yaml:"romaji"`
    Meaning map[string]string `yaml:"meaning"`
}

5C. Catatan

    ⚠️ Arti hanya Inggris & Prancis [8†L21-L22]. Tidak ada
    Indonesia. Perlu translasi manual/otomatis.

    Kanji bisa null untuk kata tanpa kanji (mis. わたし).

    Lisensi: cek repo (biasanya open untuk personal use).

    Romaji generated via pykakasi + Google Translate [8†L26-L28],
    jadi bisa ada sedikit perbedaan dengan standar Hepburn.

5D. Kapan Pakai

    Bulk import kosakata Minna no Nihongo per lesson → bab.

    Ini yang paling relevan karena user sedang belajar Minna.

============================================================

    OPENJLPT (Dataset JLPT Lengkap)
    ============================================================

6A. Format

    Tersedia: JSON per level, CSV, SQLite siap pakai [9†L15-L16].

    Total: 8.334 kata + 2.211 kanji [9†L39-L40].

    Contoh kalimat (Tatoeba) untuk 89% kata [9†L12].

    Lisensi: CC BY-SA 4.0 [9†L17].

Struktur direktori [9†L40-L41]:
text

data/
├── json/
│   ├── vocab/{n5,n4,n3,n2,n1}.json
│   └── kanji/{n5,n4,n3,n2,n1}.json
├── csv/
└── openjlpt.sqlite

6B. Cara Pakai (SQLite)

Karena KaHaDe JP sudah pakai SQLite (modernc.org/sqlite), dataset
ini bisa langsung di-attach atau di-copy ke DB aplikasi.
bash

# Unduh openjlpt.sqlite
# Buka dengan sqlite3
sqlite3 openjlpt.sqlite "SELECT * FROM vocab WHERE level='n5' LIMIT 5;"

Atau di Go:
go

db, _ := sql.Open("sqlite", "openjlpt.sqlite")
rows, _ := db.Query("SELECT word, reading, meaning FROM vocab WHERE level = ?", "n5")

6C. Catatan

    ✅ Format SQLite = paling siap pakai untuk backend Go.

    ✅ Ada contoh kalimat (Tatoeba) — berguna untuk fitur
    "contoh penggunaan" nanti.

    ⚠️ Arti bahasa Inggris. Perlu translasi Indonesia.

    Lisensi CC BY-SA 4.0: boleh dipakai & dimodifikasi, tapi
    turunan harus lisensi sama + atribusi.

6D. Kapan Pakai

    Alternatif MinnaNoDS kalau butuh data JLPT yang lebih lengkap

        contoh kalimat.

    Bisa dipakai sebagai database lookup offline (tanpa API).

============================================================

    JMDICT-SIMPLIFIED (Kamus Lengkap)
    ============================================================

7A. Format

    JMdict, JMnedict, Kanjidic, KRADFILE/RADKFILE dalam JSON [10†L5-L8].

    Ukuran: ~88 MB (full) [4†L22].

    Ada versi "common-only" yang lebih kecil.

    Update mingguan [10†L10].

7B. Struktur (ringkas)
json

{
  "version": "3.6.2+...",
  "dictDate": "2026-08-31",
  "words": [
    {
      "id": "1000000",
      "kanji": [{ "common": true, "text": "食べる" }],
      "kana": [{ "common": true, "text": "たべる" }],
      "sense": [
        {
          "partOfSpeech": ["v1", "vt"],
          "gloss": [{ "lang": "eng", "text": "to eat" }]
        }
      ]
    }
  ]
}

7C. Catatan

    Ukuran besar (~88 MB), jangan load semua ke memory.

    Untuk KaHaDe JP, lebih baik import ke SQLite dengan index
    pada kanji.text dan kana.text.

    Arti Inggris. Perlu translasi.

    Ini pilihan kalau butuh kamus paling lengkap (218k+ entri)
    dan siap offline.

7D. Kapan Pakai

    Fitur "kamus lengkap" di masa depan.

    Lookup offline tanpa API.

    Bukan untuk MVP — terlalu besar. Pakai OpenJLPT/MinnaNoDS
    dulu.

============================================================

    KANJIAPI
    ============================================================

8A. Endpoint

Base: https://kanjiapi.dev/v1

GET /kanji/{character} → detail 1 kanji
GET /kanji/all → semua kanji
GET /kanji/joyo → kanji joyo
GET /kanji/jinmeiyo → kanji jinmeiyo
GET /reading/{reading} → reverse lookup by reading
GET /words/{kanji} → kata yang mengandung kanji

    Gratis, no key [5†L11].

    13.000+ kanji [5†L7].

8B. Contoh Response
json

{
  "kanji": "猫",
  "grade": 8,
  "stroke_count": 11,
  "meanings": ["cat"],
  "kun_readings": ["ねこ"],
  "on_readings": ["ビョウ"],
  "name_readings": [],
  "jlpt": 2,
  "unicode": "732b"
}

8C. Catatan

    ✅ CORS aktif (bisa dipanggil dari browser).

    Untuk KaHaDe JP, ini berguna untuk halaman "Kanji" (rekap
    kanji per bab): ambil stroke count, readings, JLPT level.

    Arti Inggris. Perlu translasi.

8D. Kapan Pakai

    Halaman Kanji: detail per karakter.

    Validasi bacaan kanji.

    Bukan untuk lookup kata — ini per karakter, bukan per kata.

============================================================

    REKOMENDASI STRATEGI UNTUK KAHADE JP
    ============================================================

9A. Fase Awal (MVP)
Kebutuhan	Sumber	Cara
Bulk import Minna	MinnaNoDS (YAML)	Konversi → JSON → SQLite
Lookup manual 1 kata	Jisho API	Proxy di Go Fiber
Data JLPT siap pakai	OpenJLPT (SQLite)	Copy DB / import
Detail kanji	KanjiAPI	Panggil dari backend
9B. Alur Integrasi
text

[User] input kata / import JSON
   |
   v
[Svelte] → POST /api/kosakata/lookup
   |
   v
[Go Fiber] cek cache di SQLite
   ├── ada → return
   └── tidak → panggil Jisho API / KanjiAPI
              → simpan ke cache
              → return

9C. Prioritas Build

    Import MinnaNoDS (paling relevan, offline, gratis).

    Proxy Jisho API di Go (lookup manual).

    OpenJLPT SQLite (opsional, kalau butuh JLPT).

    KanjiAPI (untuk halaman Kanji).

    JMdict (nanti, kalau butuh kamus lengkap).

============================================================

    CATATAN IMPLEMENTASI
    ============================================================

10A. CORS

    Jisho API: ❌ tidak ada CORS → WAJIB lewat backend.

    JLPT-VOCAB-API, KanjiAPI: ✅ ada CORS → bisa langsung
    dari browser, tapi tetap disarankan lewat backend untuk
    caching & konsistensi.

10B. Caching

    Semua hasil lookup disimpan di tabel lookup_cache
    (key: query, value: JSON response, TTL: 30 hari).

    Ini mengurangi request ke API dan mempercepat response.

Schema:
sql

CREATE TABLE lookup_cache (
  query TEXT PRIMARY KEY,
  source TEXT NOT NULL,       -- 'jisho' | 'kanji' | ...
  response TEXT NOT NULL,     -- JSON
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

10C. Rate Limit

    Jisho: tidak ada dokumentasi resmi. Anggap max 1 req/detik.

    KanjiAPI: "100% uptime" [19†L4], tapi tetap sopan.

    JLPT-VOCAB-API: static-ish, aman.

10D. Lisensi & Atribusi

    OpenJLPT: CC BY-SA 4.0 → wajib atribusi + share-alike.

    MinnaNoDS: cek repo (biasanya open personal use).

    JMdict: EDRDG license (free, atribusi).

    KanjiAPI: free, no key.

    Jisho: data dari JMdict, free.

WAJIB tampilkan atribusi di halaman Settings / About:
"Data kosakata bersumber dari JMdict, OpenJLPT, MinnaNoDS,
dan KanjiAPI. Lisensi CC BY-SA 4.0."
10E. Tantangan Bahasa Indonesia

Semua sumber di atas memberikan arti dalam bahasa Inggris.
Tidak ada API gratis yang menyediakan arti Jepang–Indonesia
secara lengkap.

Strategi:

    Translasi manual saat import (paling akurat, tapi lambat).

    Translasi otomatis via Google Translate / DeepL API
    (berbayar untuk volume besar).

    Hybrid: import Inggris dulu, user edit arti Indonesia
    satu per satu di tabel (KaHaDe JP sudah punya inline edit).

    Crowdsource pribadi: karena personal use, kamu sendiri
    yang isi arti Indonesia — ini paling realistis.

Rekomendasi: Hybrid (3). Import arti Inggris sebagai
placeholder, lalu user edit manual. Ini memanfaatkan fitur
inline edit yang sudah ada.

============================================================

    CONTOH PROMPT UNTUK AGENT (FASE IMPLEMENTASI)
    ============================================================

Jika nanti mau implementasi integrasi ini, prompt untuk agent:
text

Baca kosakata.md. Implementasi integrasi sumber data kosakata.

Prioritas:
1. Import MinnaNoDS (YAML → JSON → SQLite). Satu lesson = satu bab.
   Mapping: kanji, kana → hira, romaji, meaning.en → arti.
2. Endpoint proxy Jisho API di Go Fiber (GET /api/lookup?q=).
   Cache hasil di tabel lookup_cache (SQLite).
3. Endpoint KanjiAPI proxy (GET /api/kanji/:char).
4. Tabel lookup_cache dengan TTL 30 hari.

JANGAN install dependency baru di luar yang sudah ada.
Gunakan gopkg.in/yaml.v3 untuk parsing YAML (tambahkan jika perlu,
usulkan dulu).

Validasi: import MinnaNoDS lesson-01 → 30+ kata masuk SQLite.
Lookup "taberu" via proxy → return kanji, hira, arti.
Kasih laporan + test.

============================================================
SELESAI
============================================================