# UI/UX SPEC — Japanese-Indonesian TTS Vocabulary App

Dokumen ini adalah rekap lengkap bagian UI/UX, dari dashboard sampai
mini player, plus skema download (audio gabungan & JSON export).

============================================================
1. STRUKTUR NAVIGASI UTAMA
============================================================

Top nav (persisten di semua halaman):

  [Logo]  Dashboard  Bab  Kanji  Settings

Halaman:
- Dashboard  -> ringkasan + quick action + card bab terakhir
- Bab        -> daftar bab, klik masuk ke tabel kosakata per bab
- Kanji      -> rekap kanji per bab (pilih bab dulu)
- Settings   -> voice, speed, jeda, backup/restore

Mini player sticky di bawah, muncul saat ada playback aktif
(di semua halaman, termasuk saat navigasi antar menu).

============================================================
2. DASHBOARD
============================================================

Tujuan: pintu masuk ke aksi, bukan cuma statistik.

Layout:

  ┌─────────────────────────────────────────────────┐
  │ Stat cards:                                     │
  │  [12 Bab]  [240 Kata]  [180/240 Audio Siap]     │
  │                                                 │
  │ Quick Actions:                                  │
  │  [＋ Bab Baru] [Import JSON] [▶ Play All]      │
  │                                                 │
  │ Bab Terakhir:                                   │
  │  ┌───────────────────────────────────────┐     │
  │  │ Bab 3 - Kata Kerja  | 40 kata | 30/40 │     │
  │  │ [Buka] [▶ Play] [⬇ Download]         │     │
  │  └───────────────────────────────────────┘     │
  │  ... (3 bab terakhir)                           │
  └─────────────────────────────────────────────────┘

Elemen:
- Stat card: total bab, total kata, progress audio
- Quick action: tombol aksi utama
- Card bab: nama, jumlah kata, progress audio, tombol
  Buka / Play / Download
- Recent activity: 3 bab terakhir

============================================================
3. HALAMAN BAB (DAFTAR BAB)
============================================================

Tujuan: kelola bab (create, rename, delete, buka).

Layout:

  ┌─────────────────────────────────────────────────┐
  │  [+ Tambah Bab]  [Import JSON ke Bab Baru]      │
  │                                                 │
  │  Daftar bab (grid atau list):                   │
  │  ┌─────────────┐ ┌─────────────┐               │
  │  │ Bab 1       │ │ Bab 2       │               │
  │  │ Kata Benda  │ │ Kata Kerja  │               │
  │  │ 30 kata     │ │ 40 kata     │               │
  │  │ 25/30 audio │ │ 30/40 audio │               │
  │  │ [Buka] [⋮] │ │ [Buka] [⋮] │               │
  │  └─────────────┘ └─────────────┘               │
  └─────────────────────────────────────────────────┘

Aksi per bab (menu ⋮):
- Rename
- Play All
- Download All Audio
- Export JSON
- Hapus (dengan modal konfirmasi Alpine)

Alur tambah bab:
  Klik "Tambah Bab" -> modal Alpine -> input nama bab ->
  buat -> redirect ke halaman bab kosong (tabel kosong,
  prompt "Tambah kata atau import JSON")

============================================================
4. HALAMAN DETAIL BAB (TABEL KOSAKATA)
============================================================

Header:

  ← Kembali    Bab 3 - Kata Kerja    [✎ Edit]
  40 kata · Audio 30/40

Toolbar di atas tabel:

  [＋ Tambah Kata] [Import JSON] [Generate All]
  [⬇ Download All Audio] [☑ Select All]

Tabel kosakata:

  ☐ │ Kanji │ Hira   │ Romaji │ Arti  │ Audio │ Aksi
  ──┼───────┼────────┼────────┼───────┼───────┼──────
  ☐ │ 食べる │ たべる │ taberu │ makan │ 🟢    │ ⋮
  ☐ │ 飲む   │ のむ   │ nomu   │ minum │ 🟡    │ ⋮
  ☐ │ 見る   │ みる   │ miru   │ lihat │ 🔴    │ ⋮

Kolom:
- Checkbox (untuk batch action)
- Kanji (editable inline)
- Hira/Kata (editable inline)
- Romaji (editable inline — kuromoji gak selalu akurat)
- Arti (editable inline)
- Audio status: 🟡 belum generate · 🟢 siap · 🔴 gagal
- Aksi: ⋮ menu (Play, Regenerate, Edit, Hapus)

Aksi batch (checkbox selected):
- Generate Audio (selected)
- Hapus (selected)
- Download All Audio (selected)
- Export JSON (selected)

Konfirmasi hapus (kata / bab) pakai modal Alpine.

Klik sel Romaji -> jadi input field (inline edit).
Klik sel Kanji/Hira/Arti -> editable juga.

============================================================
5. HALAMAN KANJI (REKAP)
============================================================

Alur:
1. Pilih bab dulu (dropdown atau tab)
2. Muncul tabel kanji dari bab tersebut

Layout:

  ┌─────────────────────────────────────────────────┐
  │ Pilih Bab: [Bab 3 - Kata Kerja ▾]               │
  │                                                 │
  │ Tabel kanji:                                    │
  │  ┌────────────┬──────────┬──────────────┐      │
  │  │ Kanji      │ Hira     │ Arti         │      │
  │  ├────────────┼──────────┼──────────────┤      │
  │  │ 図書館     │ としょかん │ perpustakaan │      │
  │  │ 食べる     │ たべる   │ makan        │      │
  │  └────────────┴──────────┴──────────────┘      │
  └─────────────────────────────────────────────────┘

Format tabel: KANJI (kata utuh) | HIRA | ARTI
- Hanya menampilkan kata yang mengandung kanji
- Kata tanpa kanji (misal ありがとう) tidak muncul
- Kanji ditampilkan sebagai kata utuh, bukan dipecah per karakter
  (keputusan MVP)

Catatan: kalau nanti mau dipecah per karakter, butuh ekstraksi
+ mapping bacaan per karakter. Itu Phase 2.

============================================================
6. HALAMAN SETTINGS
============================================================

Minimal isi:

Voice Picker:
  - Voice Jepang (ja-JP): Nanami, Keita, dll (dropdown)
  - Voice Indo (id-ID): Ardi, Gadis (dropdown)
  - Tombol "Preview" per voice

Playback:
  - Kecepatan bicara (rate): 0.5x / 0.75x / 1.0x / 1.25x
  - Volume default
  - Jeda antar audio saat Play All (0 / 0.3s / 0.5s / 1s)

Download:
  - Format audio (MP3 / WAV kalau didukung)
  - Nama file gabungan (default: bab-{nama}-{tanggal}.mp3)

Backup / Restore:
  - Export full JSON (semua bab + kosakata)
  - Import full JSON (restore)

Data:
  - Hapus semua audio ter-generate (bebaskan storage)
  - Clear cache

============================================================
7. MODAL IMPORT JSON
============================================================

Alur 4 step:

  Step 1: Upload
    - Drag & drop area / pilih file
    - Textarea: paste JSON
    - Tombol "Download Template JSON" (contoh format)
    - Tombol "Parse"

  Step 2: Preview & Validasi   <- paling penting
    - Tabel preview: ☑ | Kanji | Hira | Romaji | Arti | Status
    - Summary: "42 valid · 3 duplikat · 1 error"
    - Filter tab: All / Valid / Warning / Error
    - Checkbox per baris untuk skip
    - Tombol "Select All Valid" / "Uncheck All"
    - Tombol final: "Import 42 Kata"

  Step 3: Importing
    - Progress bar "12/42..."
    - Modal tidak bisa close
    - Kalau user coba close -> konfirmasi

  Step 4: Done
    - Summary "42 kata berhasil di-import"
    - Tombol "Tutup" / "Lihat Bab"
    - Toast: "Generate audio sekarang?" dengan quick action

Format JSON yang didukung (auto-detect):

  Format A (minimal):
  [
    { "jepang": "東京", "arti": "Tokyo" },
    { "jepang": "食べる", "arti": "Makan" }
  ]

  Format B (explicit):
  [
    { "kanji": "東京", "hira": "とうきょう", "arti": "Tokyo" }
  ]

  Format C (backup/restore):
  {
    "bab": "Kata Benda",
    "kosakata": [
      { "kanji": "東京", "hira": "とうきょう",
        "romaji": "toukyou", "arti": "Tokyo" }
    ]
  }

Aturan validasi:

  Kondisi                                | Level   | Aksi
  ---------------------------------------|---------|------------------
  jepang atau arti kosong                | Error   | Auto-uncheck
  Tidak ada karakter Jepang di jepang    | Warning | Tetap boleh
  Duplikat dalam batch                   | Warning | Default uncheck
  Duplikat dengan data existing di bab   | Warning | Default uncheck
  Romaji gagal generate                  | Warning | Tetap import
  Arti > 500 karakter                    | Error   | Tolak
  Jepang > 200 karakter                  | Error   | Tolak
  Total baris > 500                      | Error   | Tolak batch

Preview warna baris:
  Valid   -> putih
  Warning -> kuning muda
  Error   -> merah muda, checkbox disabled

Teknis:
- Modal di-manage Alpine.js (state lokal, tidak masuk Svelte store)
- Kuromoji lazy load, generate romaji incremental per baris
- Timeout 200ms per kata (kalau lebih, tandai gagal, lanjut)
- Partial insert: valid masuk, error skip, summary dikirim

Endpoint:
  POST /api/bab/:babId/import
  Body: { "kosakata": [{ "kanji", "hira", "romaji", "arti" }] }
  Response: { "inserted": 42, "skipped": 3, "errors": [] }

============================================================
8. MINI PLAYER
============================================================

Tujuan: kontrol playback yang persisten di semua halaman.

State machine:

  HIDDEN -> LOADING -> PLAYING -> PAUSED -> PLAYING ...
                   ↓
                 ERROR -> skip ke next
                   ↓
              PLAYING -> FINISHED -> HIDDEN (timeout 3s)

State detail:
- status: hidden | loading | playing | paused | finished | error
- queue: [{ itemId, lang, url, meta: { kanji, romaji, arti } }]
- currentIndex: index di queue (genap = JP, ganjil = ID)
- currentTime, duration
- speed, volume
- error

Layout desktop:

  ┌────────────────────────────────────────────────────┐
  │ 🔊 東京 / Tokyo        ⏮ ⏸ ⏭     ⏹ 1.0x 🔊 ━●  │
  │    toukyou · Tokyo    ●━━━━━━━○ 5/40 Jepang      │
  └────────────────────────────────────────────────────┘

Layout mobile:

  ┌───────────────────────────────┐
  │ 東京 / Tokyo         5/40 [✕] │
  │ toukyou · Tokyo               │
  │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
  │     ⏮    ⏸    ⏭    ⏹  1.0x  │
  └───────────────────────────────┘

Kontrol:

  Tombol    | Fungsi
  ----------|---------------------------------------------------
  ⏯        | Play / Pause audio sekarang
  ⏭ Next   | Skip ke item berikutnya (JP item+1)
  ⏮ Prev   | Audio > 3s: restart. Audio < 3s: ke item sebelumnya
  ⏹ Stop   | Hentikan + clear queue, mini player hide setelah 3s
  ✕ Close  | Alias Stop
  Progress | Clickable untuk seek (dalam audio sekarang)
  5/40     | Posisi queue (bukan durasi audio)
  Badge    | "Jepang" / "Indo" — bahasa audio yang sedang diputar

Yang JANGAN ada:
- Skip JP/ID toggle (urutan sudah pasti)
- Shuffle
- Queue viewer
- Repeat mode (skip dulu)
- Crossfade
- Equalizer
- Waveform

Struktur queue:
  [JP-1, ID-1, JP-2, ID-2, ...]
  currentIndex genap = JP, ganjil = ID
  Skip Next selalu ke item berikutnya (JP item+1)

Behavior penting:
- Single <audio> element, reused (JANGAN per item)
- Preload 1 audio ke depan (pakai new Audio())
- Playback PERSISTEN saat navigasi antar halaman
- Kalau audio 404 -> auto-skip ke next setelah 500ms + toast
- Kalau autoplay blocked -> state PAUSED + hint "Tap to play"
- Play item lain saat Play All running -> ganti queue
- Regenerate audio yang sedang diputar -> reload URL (cache bust)
- Hapus item yang sedang diputar -> stop + toast

Media Session API (WAJIB):
  navigator.mediaSession.metadata = new MediaMetadata({
    title: kanji, artist: arti, album: "KaHaDe.JP"
  });
  setActionHandler: play, pause, nexttrack, previoustrack, stop

Mobile:
- padding-bottom: env(safe-area-inset-bottom)
- Touch target minimal 44x44 px
- Volume slider disembunyikan (pakai device)
- Tinggi 64-68px (desktop 72px)

Store Svelte:
  playerState (writable)
  currentTrack (derived)
  progress (derived)

============================================================
9. DOWNLOAD SCHEMA
============================================================

## 9A. Download Audio Gabungan (per bab / selected)

Tujuan: gabungkan semua MP3 jadi 1 file MP3 untuk diunduh.

Alur:

  [Svelte] Klik "Download All Audio"
      |
      | POST /api/download-audio
      | Body: { "babId": 3, "itemIds": [1,2,3,...], "format": "mp3" }
      v
  [Go Fiber]
      1. Ambil semua audio item (JP + ID) dari storage
      2. Urutkan: JP-1, ID-1, JP-2, ID-2, ...
      3. Gabung via ffmpeg (atau godub untuk Go murni)
      4. Simpan hasil di storage/exports/
      5. Kembalikan file / URL
      |
      v
  [Svelte] Auto-download file
      |
      v
  [Cleanup] Go hapus file sementara setelah X menit (TTL)

Response:
  Content-Type: audio/mpeg
  Content-Disposition: attachment; filename="bab-3-kata-kerja-2026-10-26.mp3"

Atau response JSON (kalau async):
  { "url": "/api/exports/abc123.mp3", "expiresAt": "..." }

Naming convention file:
  bab-{nama}-{tanggal}.mp3
  (contoh: bab-3-kata-kerja-2026-10-26.mp3)

Format yang didukung:
  MP3 (default)
  WAV (opsional, kalau ffmpeg tersedia)

Merge:
  - Opsi A: ffmpeg via os/exec (robust, rekomendasi)
  - Opsi B: godub / mp3join (Go murni, ringan)

Catatan:
  - Bersihkan file sementara di storage/exports/ (cron / TTL)
  - Batas maksimal 500 kata per request (hindari file terlalu besar)
  - Progress bar di frontend selama proses merge
  - Timeout Go minimal 60s untuk proses merge

## 9B. Export JSON (Backup Kosakata)

Tujuan: backup data bab + kosakata (tanpa audio).

Endpoint:
  GET /api/bab/:babId/export
  GET /api/export-all

Response (per bab):
  {
    "bab": "Kata Kerja",
    "kosakata": [
      { "kanji": "食べる", "hira": "たべる",
        "romaji": "taberu", "arti": "makan" }
    ]
  }

Response (semua bab):
  {
    "exportedAt": "2026-10-26T10:00:00Z",
    "bab": [
      { "nama": "Kata Benda", "kosakata": [...] },
      { "nama": "Kata Kerja", "kosakata": [...] }
    ]
  }

Format JSON ini kompatibel dengan format import C (backup/restore).

Frontend:
  - File download via FileReader + Blob
  - Naming: kosakata-backup-{tanggal}.json
  - Atau per bab: bab-3-kata-kerja.json

## 9C. Skema Data (untuk referensi)

Bab:
  { id, nama, createdAt, updatedAt }

Kosakata:
  {
    id, babId,
    kanji, hira, romaji, arti,
    audio: { jp: url|null, id: url|null },
    audioStatus: 'pending' | 'ready' | 'failed',
    createdAt, updatedAt
  }

============================================================
10. CATATAN LINTAS FITUR
============================================================

- Semua modal konfirmasi (hapus, close import, stop playback)
  pakai Alpine.js
- Semua form inline edit di tabel (Kanji/Hira/Romaji/Arti)
  simpan via PATCH /api/kosakata/:id
- Toast notification untuk aksi: import sukses, generate
  selesai, audio gagal, item dihapus
- Progress bar untuk: generate audio, merge audio, import
- Loading state untuk semua request async

Storage backend:
  storage/audio/{itemId}_{lang}.mp3   (audio per item)
  storage/exports/{nama}.mp3          (file gabungan)
  storage/exports/{nama}.json         (export JSON)

Cleanup:
  - storage/tmp/ dihapus saat startup
  - storage/exports/ dihapus setelah TTL (misal 30 menit)

============================================================
SELESAI
============================================================