# KaHaDe.JP — Kata Hapalan Dengar Japan

Web app personal untuk mengelola kosakata Jepang, generate audio TTS
(Jepang & Indonesia), lalu memutar dan mengunduh audio.

Spesifikasi lengkap ada di `app.md`, `tech-stack.md`, dan `rules.md`.

## Status

| Fase | Status |
| --- | --- |
| 1 — Skeleton & Setup | selesai |
| 2 — Data Layer | selesai |
| 3 — Frontend CRUD | selesai |
| 4 — Konversi Romaji | selesai |
| 5 — TTS Engine | selesai |
| 6 — Mini Player | selesai |
| 7 — Import JSON | selesai |
| 8 — Download & Export | selesai |
| 9 — Halaman Kanji | selesai |
| 10 — Settings | selesai |
| 11 — Polish | selesai |

## Prasyarat

- Go 1.26 atau lebih baru
- Node.js 20 atau lebih baru
- ffmpeg (dipakai mulai FASE 8)

Di mesin pengembangan ini Go dipasang lokal di `~/.local/go`:

```sh
export PATH="$HOME/.local/go/bin:$PATH"
```

## Setup

```sh
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
make install
```

## Menjalankan

Satu command (backend + frontend):

```sh
make dev
```

Atau dua terminal terpisah:

```sh
make dev-backend
make dev-frontend
```

- Backend: http://localhost:8080
- Frontend: http://localhost:5173

Health check:

```sh
curl http://localhost:8080/api/health
```

## Frontend

- Svelte 5 dengan runes (`$state`, `$derived`, `$props`, `$effect`)
- Vite + Tailwind CSS dengan token warna Material 3 (warm orange),
  dark mode berbasis class, dan efek frosted glass
- Alpine.js hanya untuk modal (form bab dan konfirmasi hapus); modal import
  JSON memakai komponen Svelte
- Routing memakai hash: `#dashboard`, `#bab`, `#bab/:id`, `#kanji`,
  `#settings`
- State data bab dan kosakata ada di `src/lib/stores/data.svelte.js`
- Mini player global (`src/lib/player.js`) dengan antrean Jepang-Indonesia,
  jeda antar audio, kecepatan, volume, dan auto-skip audio gagal
- Import JSON 4 langkah dengan preview validasi, editor sel tabel, aksi
  batch, export JSON, download audio per bab, serta backup/restore

Alur CRUD yang sudah tersedia:

1. Buka menu **Bab**, lalu tambah, rename, atau hapus bab.
2. Klik **Buka** untuk masuk ke detail bab.
3. Tambah kata lewat form manual atau edit sel Kanji/Hira/Romaji/Arti
   langsung di tabel.
4. Hapus kata atau bab lewat modal konfirmasi.

### Romaji otomatis

- `src/lib/kuromoji.js` memuat kuroshiro + kuromoji hanya saat input
  mengandung kanji. Input hiragana/katakana murni memakai wanakana tanpa
  dictionary.
- `src/lib/romaji-autofill.svelte.js` mengisi kolom Romaji otomatis dengan
  debounce 250 ms. Begitu Romaji diedit manual, auto-fill berhenti supaya
  hasil manual tidak ditimpa.
- Konversi memakai jalur kanji -> hiragana (kuroshiro) -> romaji (wanakana)
  agar hasilnya konsisten gaya wapuro, misalnya `東京` -> `toukyou`.
- Dictionary kuromoji disalin dari `node_modules/kuromoji/dict` ke
  `static/dict` oleh `npm run prepare:dict`. Script ini otomatis jalan
  lewat `predev` dan `prebuild`; folder hasilnya masuk `.gitignore`.
- Vite dev/preview memakai plugin kecil di `vite.config.js` untuk menyajikan
  file `.dat.gz` sebagai payload mentah, karena kuromoji melakukan gunzip
  sendiri. Saat deploy statis, pastikan server tidak menambahkan
  `Content-Encoding: gzip` untuk file `*.dat.gz`.

## Database

SQLite dibuka dari `DB_PATH` (default `./data/app.db`). File migration SQL ada
di `backend/internal/db/migration/` dan di-embed ke binary. Migration yang
belum pernah dijalankan otomatis diterapkan saat server start.

Untuk menjalankan migration saja tanpa menyalakan server:

```sh
make migrate
```

## API

Semua response memakai envelope yang sama:

```json
{ "success": true, "data": {} }
```

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "validasi input gagal",
    "details": [{ "field": "kanji", "message": "Kanji wajib diisi" }]
  }
}
```

| Method | Path | Keterangan |
| --- | --- | --- |
| `GET` | `/api/health` | Status server |
| `GET` | `/api/bab` | List bab + jumlah kosakata |
| `POST` | `/api/bab` | Buat bab |
| `GET` | `/api/bab/:id` | Detail bab |
| `PATCH` | `/api/bab/:id` | Ubah nama bab |
| `DELETE` | `/api/bab/:id` | Hapus bab (kosakata ikut terhapus) |
| `GET` | `/api/bab/:id/kosakata` | List kosakata dalam bab |
| `POST` | `/api/bab/:id/kosakata` | Tambah kosakata |
| `POST` | `/api/bab/:id/import` | Import kosakata (maks. 500 baris) |
| `PATCH` | `/api/kosakata/:id` | Ubah kosakata |
| `DELETE` | `/api/kosakata/:id` | Hapus kosakata |
| `POST` | `/api/tts/generate` | Generate audio Jepang & Indonesia |
| `GET` | `/api/audio/:id/:lang` | Ambil file audio (`jp`/`id`) |
| `POST` | `/api/download/audio/:id` | Gabung audio satu bab jadi MP3 |
| `GET` | `/api/export/bab/:id` | Export kosakata satu bab sebagai JSON |

Field `kanji` dan `arti` wajib; `hira` dan `romaji` opsional. Status audio
dikelola backend lewat endpoint TTS.

Contoh:

```sh
curl -X POST http://localhost:8080/api/bab \
  -H 'Content-Type: application/json' \
  -d '{"nama":"Bab 1"}'

curl -X POST http://localhost:8080/api/bab/1/kosakata \
  -H 'Content-Type: application/json' \
  -d '{"kanji":"日本","hira":"にほん","romaji":"nihon","arti":"Jepang"}'

curl http://localhost:8080/api/bab
```

## Konfigurasi

`backend/.env`:

| Variable | Default | Keterangan |
| --- | --- | --- |
| `PORT` | `8080` | Port HTTP backend |
| `DB_PATH` | `./data/app.db` | Lokasi file SQLite |
| `STORAGE_PATH` | `./storage` | Folder audio & export |
| `AUDIO_TTL` | `1800` | TTL file audio dalam detik |
| `LOOKUP_TIMEOUT` | `8` | Timeout request ke API kamus (detik) |
| `LOG_LEVEL` | `info` | `debug`, `info`, `warn`, `error` |
| `FRONTEND_URL` | `http://localhost:5173` | Origin yang diizinkan CORS |

`frontend/.env`:

| Variable | Default | Keterangan |
| --- | --- | --- |
| `VITE_API_URL` | _(kosong)_ | Base URL backend. Kosong = same-origin; Vite mem-proxy `/api` ke `127.0.0.1:8080`. Isi hanya jika backend berada di origin lain. |

Semua config dibaca dari environment variable. Backend memuat
`backend/.env` otomatis lewat `godotenv` saat start. Kalau variabel sudah
di-export di shell, nilainya tetap dipakai.

## Verifikasi

```sh
make vet
make test
make build
```

## Struktur

```text
backend/
  main.go                 entrypoint Fiber, config, DB, graceful shutdown
  internal/config/        loader & validasi env
  internal/handlers/      handler HTTP + routing API
  internal/middleware/    error handler JSON
  internal/db/            koneksi SQLite, migration, repository
  internal/models/        model data
  internal/services/      validasi & business logic
  storage/                audio, exports, tmp (gitignored)
  data/                   file SQLite (gitignored)
frontend/
  src/App.svelte          shell, hash routing, header, toast, mini player
  src/routes/             halaman Dashboard, BabList, BabDetail, Kanji, Settings
  src/components/         tabel kosakata, inline edit, form kata, modal, player
  src/lib/api.js          wrapper fetch terpusat
  src/lib/player*.js      antrean & kontrol audio global
  src/lib/import.js       parsing, validasi, dan payload import JSON
  src/lib/backup.js       export & restore backup
  src/lib/kuromoji.js     konversi romaji + lazy loader kuroshiro/kuromoji
  src/lib/romaji-autofill.svelte.js  debounce & state auto romaji
  src/lib/modals.js       controller Alpine untuk modal
  src/lib/stores/         state runes data & player
  src/styles/app.css      Tailwind entry, token M3, komponen
  scripts/                copy dictionary kuromoji saat dev/build
  static/dict/            dictionary hasil generate (gitignored)
```

Komponen player, import JSON, toast, serta halaman Kanji dan Settings masih
berupa stub dengan penanda `TODO(FASE ...)`, lalu diisi saat fasenya
masing-masing. Store data bab/kosakata sudah dipakai di FASE 3, sedangkan
store player masih stub untuk FASE 6.

## Catatan

- `backend/.env`, `frontend/.env`, `storage/`, `data/`, dan `*.db` tidak
  di-commit.
- Folder `backend/storage/{audio,exports,tmp}` dibuat otomatis saat server
  start.
- Migration dijalankan otomatis saat server start, atau manual lewat
  `make migrate`.
- Belum ada autentikasi (single user, sesuai `rules.md`).
