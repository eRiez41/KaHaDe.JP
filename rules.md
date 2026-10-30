# RULES.md — Panduan Agent untuk Membangun Aplikasi

Dokumen ini adalah ATURAN WAJIB bagi AI agent (Claude Code, Cursor,
Cline, atau agent lain) yang akan membangun aplikasi ini.

Baca dokumen ini SEBELUM mulai coding. Referensi utama:
- app.md        -> spesifikasi UI/UX lengkap
- tech-stack.md -> tech stack & library yang dipakai
- rules.md      -> file ini (aturan kerja agent)

Kalau ada konflik antar 3 dokumen:
  app.md        (paling tinggi — apa yang dibangun)
  tech-stack.md (kedua — dengan apa dibangun)
  rules.md      (ketiga — bagaimana membangunnya)
Kalau ragu, TANYA user dulu. Jangan asumsi.

============================================================
1. KONTEKS PROYEK
============================================================

Nama: KaHaDe.JP (Kata Hapalan Dengar Japan)
Tujuan: Web app personal untuk kelola kosakata Jepang + generate
        audio TTS (Jepang & Indonesia) + play & download audio.
Target user: 1 orang (pemilik proyek). Bukan multi-tenant.
Batasan: Gratis, personal use, tanpa biaya langganan.

Baca app.md untuk detail fitur & UI.
Baca tech-stack.md untuk detail library & versi.

============================================================
2. TECH STACK — TERKUNCI, JANGAN DIGANTI
============================================================

Backend:
- Go + Fiber v2
- Edge TTS (bukan library TTS lain kecuali user minta)
- ffmpeg (via os/exec) untuk merge audio
- SQLite (default) — kecuali user minta Postgres

Frontend:
- Svelte + Vite
- Tailwind CSS
- Alpine.js (HANYA untuk modal & komponen lokal, bukan framework utama)

Library khusus:
- kuroshiro + kuromoji.js (Kanji -> Romaji)
- wanakana (fallback Hiragana/Katakana murni)

ATURAN:
- JANGAN tambah framework baru (React, Vue, Next, Nuxt, dll)
- JANGAN tambah state management baru (Redux, Zustand, Pinia)
- JANGAN tambah ORM berat (GORM boleh, Prisma tidak)
- JANGAN ganti SQLite ke DB lain tanpa persetujuan
- JANGAN ganti Edge TTS ke engine berbayar
- Kalau butuh library tambahan, USULKAN dulu ke user,
  jangan langsung install

============================================================
3. FASE PENGERJAAN — IKUTI URUTAN
============================================================

Agent WAJIB mengerjakan per fase. JANGAN skip fase.
JANGAN lanjut ke fase berikutnya sebelum fase sekarang
selesai & diverifikasi.

FASE 1 — Skeleton & Setup
  - Init Go module + Fiber server
  - Init Svelte + Vite + Tailwind
  - Struktur folder (lihat bagian 4)
  - Health check endpoint
  - Frontend bisa render halaman kosong
  Verifikasi: server jalan, frontend jalan, bisa saling request

FASE 2 — Data Layer
  - Schema DB (bab, kosakata)
  - Migration
  - CRUD endpoint bab (create, read, update, delete)
  - CRUD endpoint kosakata
  Verifikasi: bisa create bab & kosakata via API (curl/Postman)

FASE 3 — Frontend CRUD Sederhana
  - Halaman Bab (list, create, delete)
  - Halaman Detail Bab (tabel kosakata)
  - Form tambah kata (manual)
  - Inline edit
  Verifikasi: bisa kelola bab & kata dari UI

FASE 4 — Konversi Romaji
  - Integrasi kuroshiro + kuromoji di frontend
  - Lazy load dictionary
  - Auto-generate romaji saat input
  - Editable romaji
  Verifikasi: input kanji -> romaji muncul otomatis

FASE 5 — TTS Engine
  - Integrasi Edge TTS di backend
  - Endpoint generate audio per item
  - Simpan MP3 ke storage
  - Status audio per item (pending/ready/failed)
  Verifikasi: klik generate -> MP3 tersimpan -> bisa diakses

FASE 6 — Mini Player
  - Single audio element
  - Play satu / Play All
  - State machine (hidden/loading/playing/paused/finished)
  - Prev/Next/Stop
  - Preload next
  - Media Session API
  Verifikasi: play all berjalan berurutan tanpa jeda aneh

FASE 7 — Import JSON
  - Modal import (Alpine)
  - Auto-detect format (A/B/C)
  - Preview & validasi
  - Partial insert
  Verifikasi: import 10 kata -> masuk semua, error ter-handle

FASE 8 — Download & Export
  - Endpoint merge audio (ffmpeg)
  - Download All Audio per bab
  - Export JSON per bab / semua
  Verifikasi: download gabungan jalan, hasilnya bisa diputar

FASE 9 — Halaman Kanji
  - Rekap kanji per bab
  - Filter kata yang mengandung kanji
  Verifikasi: hanya kata ber-kanji yang muncul

FASE 10 — Settings
  - Voice picker
  - Speed default
  - Jeda antar audio
  - Backup/restore
  Verifikasi: setting tersimpan & dipakai saat playback

FASE 11 — Polish
  - Loading state semua async
  - Toast notification
  - Error handling konsisten
  - Responsive mobile
  - Cleanup file sementara
  Verifikasi: semua edge case di app.md ter-handle

============================================================
4. STRUKTUR FOLDER — WAJIB DIIKUTI
============================================================

  project-root/
  ├── app.md
  ├── tech-stack.md
  ├── rules.md
  ├── README.md
  ├── Makefile
  │
  ├── backend/
  │   ├── go.mod
  │   ├── go.sum
  │   ├── main.go
  │   ├── internal/
  │   │   ├── config/
  │   │   │   └── config.go
  │   │   ├── db/
  │   │   │   ├── db.go
  │   │   │   └── migration/
  │   │   ├── handlers/
  │   │   │   ├── bab.go
  │   │   │   ├── kosakata.go
  │   │   │   ├── tts.go
  │   │   │   └── export.go
  │   │   ├── services/
  │   │   │   ├── edge_tts.go
  │   │   │   ├── audio_merge.go
  │   │   │   └── cleanup.go
  │   │   ├── models/
  │   │   │   ├── bab.go
  │   │   │   └── kosakata.go
  │   │   └── middleware/
  │   │       └── error.go
  │   └── storage/
  │       ├── audio/       (gitignore)
  │       └── exports/     (gitignore)
  │
  └── frontend/
      ├── package.json
      ├── vite.config.js
      ├── tailwind.config.js
      ├── src/
      │   ├── main.js
      │   ├── App.svelte
      │   ├── routes/
      │   │   ├── Dashboard.svelte
      │   │   ├── BabList.svelte
      │   │   ├── BabDetail.svelte
      │   │   ├── Kanji.svelte
      │   │   └── Settings.svelte
      │   ├── components/
      │   │   ├── MiniPlayer.svelte
      │   │   ├── ImportModal.svelte
      │   │   ├── BabFormModal.svelte
      │   │   ├── ConfirmModal.svelte
      │   │   ├── KosakataForm.svelte
      │   │   ├── KosakataTable.svelte
      │   │   ├── EditableCell.svelte
      │   │   └── Toast.svelte
      │   ├── lib/
      │   │   ├── api.js
      │   │   ├── modals.js
      │   │   ├── player.js
      │   │   ├── kuromoji.js
      │   │   ├── romaji-autofill.svelte.js
      │   │   └── stores/
      │   │       ├── player.js
      │   │       └── data.svelte.js
      │   └── styles/
      │       └── app.css
      ├── scripts/
      │   └── copy-kuromoji-dict.js
      └── static/
          └── dict/            (gitignore, hasil generate)

ATURAN FOLDER:
- JANGAN taruh logic bisnis di handler — taruh di service
- JANGAN taruh logic HTTP di service — handler yang handle
- JANGAN bikin file > 400 baris. Pecah kalau lebih
- JANGAN taruh file audio/export di git (masuk .gitignore)
- Semua config lewat env variable (port, path, dll)

============================================================
5. KONVENSI KODE
============================================================

## Go
- Format wajib: gofmt / goimports (jalankan sebelum commit)
- Error handling: WAJIB. Jangan ignore error pakai `_`
- Naming:
    - File: snake_case (edge_tts.go)
    - Fungsi exported: PascalCase (GenerateAudio)
    - Variabel: camelCase (babID)
    - Konstanta: UPPER_SNAKE (MAX_BATCH_SIZE)
- Context: semua fungsi yang akses DB/HTTP wajib terima context.Context
- Struct: pakai pointer receiver untuk method yang modify state
- Response JSON: pakai struct, jangan map[string]interface{}
- Handler return error ke middleware, jangan fmt.Println
- Logging: pakai log/slog (built-in Go 1.21+)
- Test: minimal untuk service layer (edge_tts, audio_merge)

## Svelte
- Proyek memakai Svelte 5 dengan runes. Kode baru wajib pakai sintaks Svelte 5
- Pakai `<script>` di atas, `<style>` di bawah
- State lokal pakai `$state`, turunan pakai `$derived` / `$derived.by`
- Props: `let { foo, bar = default } = $props()`
- Event: pakai `onclick`, `oninput`, `onsubmit` (bukan `on:click`)
- Two-way binding tetap pakai `bind:value`
- Side effect pakai `$effect` hanya kalau perlu; hindari dependency loop
- Lifecycle browser-only pakai `onMount` dari `svelte`
- Store global file terpisah di `lib/stores/` (`.svelte.js`), satu file satu domain
- WAJIB: setiap komponen < 200 baris. Pecah kalau lebih
- Romaji otomatis: debounce input, lazy-load kuroshiro/kuromoji hanya saat
  ada kanji, dan pakai wanakana untuk kana murni. Edit manual Romaji harus
  menghentikan auto-fill. Jangan block render awal dengan load dictionary.
- Dictionary kuromoji digenerate oleh `scripts/copy-kuromoji-dict.js` lewat
  `predev`/`prebuild`; jangan commit `static/dict/`.

## JavaScript/API
- Fetch wrapper: satu file lib/api.js, semua request lewat situ
- Error handling: semua fetch wajib .catch atau try/catch
- Loading state: wajib untuk semua request async
- Jangan hardcode URL — pakai env (VITE_API_URL)

## Tailwind
- Utility class langsung di markup (jangan @apply kecuali berulang > 3x)
- Class panjang: pecah per baris untuk readability
- Warna: pakai scale Tailwind (bg-blue-500), jangan custom hex
  kecuali di config
- Responsive: mobile-first (base dulu, lalu md:, lg:)
- Konsisten spacing: pakai kelipatan 4 (p-4, gap-2, dsb)

## Alpine.js
- HANYA untuk: modal, dropdown, toggle lokal
- WAJIB: komponen Alpine di-mount via x-data di elemen modal
- JANGAN pakai Alpine untuk state global (itu tugas Svelte store)
- Kalau state perlu dibaca Svelte, gunakan $dispatch event

============================================================
6. KOMUNIKASI BACKEND <-> FRONTEND
============================================================

Format response API — WAJIB KONSISTEN:

  Sukses:
    {
      "success": true,
      "data": { ... },
      "meta": { ... }     // opsional
    }

  Gagal:
    {
      "success": false,
      "error": {
        "code": "VALIDATION_ERROR",
        "message": "Field kanji wajib diisi",
        "details": { ... }  // opsional
      }
    }

HTTP status code:
  200 OK           -> GET, PATCH sukses
  201 Created      -> POST sukses
  204 No Content   -> DELETE sukses
  400 Bad Request  -> validasi gagal
  404 Not Found    -> resource tidak ada
  409 Conflict     -> duplikat
  422 Unprocessable -> business logic error
  500 Internal     -> error server (jangan expose detail)

Endpoint naming:
  GET    /api/bab
  POST   /api/bab
  GET    /api/bab/:id
  PATCH  /api/bab/:id
  DELETE /api/bab/:id

  GET    /api/bab/:id/kosakata
  POST   /api/bab/:id/kosakata
  PATCH  /api/kosakata/:id
  DELETE /api/kosakata/:id

  POST   /api/tts/generate
  GET    /api/audio/:id/:lang
  POST   /api/download/audio

============================================================
7. ATURAN KERJA AGENT
============================================================

## Sebelum mulai task:
1. Baca ulang app.md & tech-stack.md bagian yang relevan
2. Cek fase yang sedang dikerjakan (bagian 3)
3. Kalau task ambigu, TANYA user — jangan asumsi
4. Rencanakan dulu (tulis step), baru eksekusi

## Saat mengerjakan:
- Kerjakan satu task kecil sampai selesai, baru lanjut
- Jangan refactor kode yang tidak terkait dengan task
- Jangan tambah "improvement" yang tidak diminta
- Kalau nemu bug di kode lama, LAPORKAN dulu, jangan langsung fix
- Kalau butuh library baru, USULKAN dulu (nama + alasan + alternatif)
- Kalau bingung 2 pilihan, TANYA — jangan pilih sendiri

## Setelah selesai task:
- Jelaskan apa yang sudah dibuat (singkat)
- Jelaskan file apa saja yang berubah/dibuat
- Cara verifikasi (command atau langkah manual)
- Kalau ada TODO, list eksplisit
- JANGAN bilang "done" tanpa verifikasi

## Bahasa:
- Komunikasi ke user: Bahasa Indonesia santai (bukan formal)
- Komentar kode: Bahasa Inggris singkat (untuk portability)
- Commit message: Bahasa Inggris (conventional commits)
  contoh: feat: add bab CRUD endpoint
          fix: handle kuromoji timeout
          refactor: split player store

============================================================
8. LARANGAN KERAS (DO NOT)
============================================================

❌ JANGAN generate file yang tidak diminta tanpa penjelasan
❌ JANGAN install dependency baru tanpa izin
❌ JANGAN ubah tech stack (framework, DB, TTS engine)
❌ JANGAN buat komponen > 200 baris atau file > 400 baris
❌ JANGAN hardcode API key, URL, atau path (pakai env)
❌ JANGAN commit file audio/export ke git
❌ JANGAN skip error handling (catch/fetch/DB)
❌ JANGAN ignore context di Go (untuk DB & HTTP)
❌ JANGAN return detail error 500 ke frontend
❌ JANGAN pakai `any` / `interface{}` di Go kalau bisa struct
❌ JANGAN pakai console.log di production code
❌ JANGAN block UI tanpa loading state
❌ JANGAN skip validasi input (frontend + backend)
❌ JANGAN refactor besar tanpa diskusi
❌ JANGAN bikin fitur di luar scope app.md tanpa tanya

============================================================
9. YANG WAJIB (MUST)
============================================================

✅ WAJIB validasi input di backend (jangan cuma frontend)
✅ WAJIB sanitize semua input user sebelum simpan/tampil
✅ WAJIB loading state untuk semua request async > 200ms
✅ WAJIB error message user-friendly (bukan stack trace)
✅ WAJIB konfirmasi untuk aksi destruktif (hapus bab, hapus kata,
        stop playback, tutup modal saat import)
✅ WAJIB toast/feedback setelah aksi sukses/gagal
✅ WAJIB responsive (mobile + desktop)
✅ WAJIB cleanup file sementara (TTL / cron)
✅ WAJIB .gitignore untuk: storage/, node_modules/, *.db, .env
✅ WAJIB README dengan cara run (backend + frontend)
✅ WAJIB Makefile untuk command umum (dev, build, migrate)
✅ WAJIB handle kuromoji lazy load (jangan block initial render)
✅ WAJIB handle audio autoplay blocked (mobile)
✅ WAJIB handle audio 404 (auto-skip di mini player)

============================================================
10. POLA YANG DIREKOMENDASIKAN
============================================================

## Backend — Service Layer Pattern
  handler -> service -> repo/DB
  Handler: HTTP concern (request parse, response format)
  Service: business logic (validasi, orchestrate, transform)
  DB: raw query atau GORM, jangan taruh logic bisnis

## Frontend — Store Pattern
  - Satu store per domain (player.js, data.svelte.js)
  - Store global memakai runes ($state / $derived) di file `.svelte.js`
  - Komponen membaca store langsung; mutasi lewat fungsi yang di-export
    dari store
  - Jangan mutate store langsung dari komponen di luar fungsi store

## API Client (lib/api.js)
  Satu file, semua endpoint di-wrap sebagai fungsi:
    export const getBab = () => fetch(...)
    export const createBab = (data) => fetch(...)
  Komponen panggil fungsi, bukan fetch langsung.
  Error handling terpusat di wrapper.

## Error Handling Frontend
  - Try/catch di komponen atau store
  - Tampilkan toast + fallback UI
  - Jangan biarkan error jadi unhandled rejection

## Loading State
  - Setiap async punya: idle | loading | success | error
  - UI menyesuaikan (spinner, disable button, dsb)

============================================================
11. TESTING (MINIMAL)
============================================================

Backend (Go):
  - Unit test untuk service: edge_tts, audio_merge, validasi
  - Integration test minimal: endpoint CRUD bab
  - Command: `go test ./...`

Frontend:
  - JANGAN setup test framework baru kecuali user minta
  - Manual testing cukup untuk MVP
  - Kalau butuh test, pakai vitest (tanya dulu)

Verifikasi manual — WAJIB sebelum bilang "selesai":
  - Backend jalan: `go run .` (dari backend/)
  - Frontend jalan: `npm run dev` (dari frontend/)
  - Buka browser, cek alur utama end-to-end
  - Jalankan `go vet ./...` dan pastikan bersih

============================================================
12. ENV & CONFIG
============================================================

File .env di backend/ (JANGAN commit):
  PORT=8080
  DB_PATH=./data/app.db
  STORAGE_PATH=./storage
  AUDIO_TTL=1800          # detik (30 menit)
  LOG_LEVEL=info
  FRONTEND_URL=http://localhost:5173

File .env di frontend/ (JANGAN commit):
  VITE_API_URL=http://localhost:8080

WAJIB sediakan .env.example untuk kedua folder (yang di-commit).

============================================================
13. GIT WORKFLOW
============================================================

- Branch: main (langsung, solo project)
- Commit message: conventional commits
    feat: ...     fitur baru
    fix: ...      bug fix
    refactor: ... refactor
    docs: ...     dokumentasi
    chore: ...    tooling, config
- Commit kecil & sering, bukan 1 commit raksasa
- JANGAN commit: .env, storage/, node_modules/, *.db

.gitignore wajib ada di root, minimal:
  .env
  .env.local
  node_modules/
  storage/
  data/
  *.db
  *.db-journal
  backend/bin/
  frontend/dist/
  frontend/static/dict/
  .DS_Store

============================================================
14. KALAU ADA KERAGUAN
============================================================

Situasi ambigu — selalu pilih:
  1. TANYA user dulu, jangan asumsi
  2. Kalau harus lanjut, pilih opsi PALING SEDERHANA
  3. Tandai dengan komentar `// TODO: konfirmasi user`
  4. Jangan over-engineer

Contoh pertanyaan bagus ke user:
  - "Field X wajib atau opsional?"
  - "Kalau audio gagal generate, skip atau retry?"
  - "Batasan batch size berapa kata?"
  - "Perlu authentication atau single-user?"

Contoh keputusan yang JANGAN diambil sendiri:
  - Ganti database
  - Tambah framework frontend
  - Ubah format response API
  - Hapus fitur dari app.md
  - Refactor arsitektur besar

============================================================
15. DEFINISI "SELESAI" PER FASE
============================================================

Sebuah fase dianggap SELESAI kalau:
  [ ] Semua fitur fase itu berjalan (bisa didemokan)
  [ ] Tidak ada error di console browser / log server
  [ ] `go vet ./...` bersih
  [ ] Backend & frontend bisa dijalankan dari README
  [ ] Alur utama bisa diselesaikan tanpa manual edit DB
  [ ] Loading state & error state tampil wajar
  [ ] User sudah konfirmasi "lanjut fase berikutnya"

JANGAN bilang "selesai" hanya karena kode ter-compile.

============================================================
SELESAI
============================================================