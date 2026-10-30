# TECH STACK — KaHaDe.JP (Japanese-Indonesian TTS Vocabulary App)

Dokumen ini adalah rekap lengkap tech stack untuk KaHaDe.JP, aplikasi web
text-to-speech kosakata Jepang–Indonesia. Tujuan: gratis, tanpa batas, suara
natural, dan audio bisa diunduh (termasuk gabungan semua audio).

#
1. RINGKASAN PROYEK
#

Aplikasi web untuk:
- Input kosakata Jepang (Hiragana / Katakana / Kanji) + arti (Indonesia)
- Generate Romaji otomatis dari teks Jepang
- Import massal via JSON
- Generate audio TTS per item (Jepang pakai suara ja-JP, arti pakai id-ID)
- Play satu-satu atau play semua (urutan: Jepang-1, Indo-1, Jepang-2, ...)
- Download audio (termasuk gabungan semua audio jadi satu file)

Batasan yang dipilih:
- Hanya 3 bahasa: Jepang, Indonesia, Inggris (Inggris opsional/cadangan)
- Gratis penuh, personal use
- Suara natural (neural voice)
- Tanpa batas request
- Audio bisa diunduh

#
2. ARSITEKTUR UMUM
#

  [Frontend: Svelte + Tailwind + Alpine]
        |
        |  (HTTP / JSON)
        v
  [Backend: Go Fiber]
        |
        |---> Edge TTS (Microsoft neural voices, gratis, no API key)
        |---> ffmpeg / godub  (merge MP3)
        |
        v
  [Storage sementara: MP3 per item + MP3 gabungan]

Catatan:
- Semua request TTS lewat backend Go supaya kredensial/endpoint tidak
  terekspos di browser dan supaya hasil MP3 bisa disimpan & digabung.
- Konversi Kanji -> Romaji dijalankan di sisi frontend (Svelte) karena
  library JS-nya jauh lebih matang dibanding versi Go.

#
3. BACKEND — Go Fiber
#

Framework:
- gofiber/fiber/v2

Tugas backend:
- Endpoint generate audio per item & batch
- Menyimpan MP3 hasil TTS ke folder sementara (mis. storage/audio/)
- Endpoint gabung semua MP3 jadi satu file (download all)
- Membersihkan file sementara secara berkala

TTS Engine:
- Edge TTS (Microsoft neural voice)
  - Gratis, tanpa API key, praktis tanpa batas untuk pemakaian wajar
  - Mendukung bahasa Jepang (ja-JP) dan Indonesia (id-ID)
  - Output: MP3 neural (natural)
  - Cara panggil: HTTP request dari Go ke endpoint Edge TTS,
    atau via library wrapper (mis. edge-tts)

Audio Merge:
- Opsi A (disarankan): ffmpeg via os/exec
  - Robust, cepat, mendukung banyak format
- Opsi B: library Go murni
  - godub (load & gabung mp3/m4a/wav)
  - mp3join (khusus MP3, ringan)

Manajemen File:
- Simpan MP3 per item di folder sementara selama proses generate
- Bersihkan otomatis (cron / on-startup / TTL)
- Nama file sementara: {index}_{lang}.mp3 (contoh: 1_jp.mp3, 1_id.mp3)

Endpoint (usulan):
- POST /api/generate          -> generate audio untuk satu / banyak item
- POST /api/download-all      -> gabung semua MP3, kembalikan 1 file
- GET  /api/audio/:id/:lang   -> ambil file MP3 tertentu

Penanganan error:
- Timeout & retry pada panggilan Edge TTS
- Loading state dikirim ke frontend
- Log sederhana untuk debugging

#
4. FRONTEND — Svelte + Tailwind + Alpine
#

Framework utama:
- Svelte (via Vite)

Styling:
- Tailwind CSS (utility-first)

Interaksi ringan:
- Alpine.js — khusus untuk popup modal
  (modal input kata, modal import JSON, modal konfirmasi)
  Di-mount hanya di elemen modal, bukan sebagai framework utama

State management:
- Svelte store bawaan
  - store list kosakata
  - store status generate (idle / loading / done / error)
  - store antrian playback

Fitur playback:
- Play satu-satu: pakai elemen <audio>
- Play semua: antrian berbasis event "onended"
  Urutan: Jepang-1 -> Indo-1 -> Jepang-2 -> Indo-2 -> ...
- Tombol Download All -> panggil endpoint /api/download-all

#
5. KONVERSI KANJI -> ROMAJI
#

Library utama:
- kuroshiro + kuromoji.js
  - Tokenizer Jepang (kuromoji) + konverter (kuroshiro)
  - Menangani Kanji dengan akurat via analisis morfologis
  - Dijalankan di sisi frontend (Svelte)

Library tambahan (opsional):
- wanakana
  - Fallback ringan untuk input Hiragana/Katakana murni
  - Tidak butuh load dictionary besar

Catatan performa:
- Kuromoji butuh dictionary ~20MB
  -> Lazy load: muat hanya saat user pertama kali input teks Jepang
- Untuk input Hiragana/Katakana murni, pakai wanakana agar ringan

Keterbatasan:
- Akurasi Kanji tidak selalu 100% untuk nama diri / istilah spesifik
- Sediakan fitur edit manual kolom Romaji

#
6. DATA & PENYIMPANAN
#

Import JSON:
- FileReader bawaan browser
- Parsing di Svelte
- Format:
  [
    { "jepang": "東京", "arti": "Tokyo" },
    { "jepang": "食べる", "arti": "Makan" }
  ]

Penyimpanan lokal (frontend):
- localStorage  -> data ringan (setting, list kecil)
- IndexedDB     -> list kosakata besar + referensi audio

Backup / Export:
- Endpoint Go untuk download JSON hasil generate
- Endpoint Go untuk download MP3 gabungan

#
7. ALUR DATA (DATA FLOW)
#

[Svelte] input / import JSON
   |
   v
[Svelte] kuroshiro / kuromoji -> generate romaji
   |
   v
[Svelte] tampilkan list + tombol Generate
   |
   |  POST /api/generate (list teks Jepang + Indo)
   v
[Go Fiber] loop:
   - panggil Edge TTS (ja-JP) -> simpan 1_jp.mp3
   - panggil Edge TTS (id-ID) -> simpan 1_id.mp3
   - ulangi untuk item berikutnya
   |
   v
[Go Fiber] kirim balik URL / blob audio per item
   |
   v
[Svelte] Play (satu / semua) atau Download All
   |
   |  POST /api/download-all
   v
[Go Fiber] gabung MP3 via ffmpeg / godub -> kirim file gabungan

#
8. CATATAN PENTING & PITFALL
#

- Kuromoji dictionary ~20MB -> lazy load wajib
- Edge TTS kadang lambat -> wajib timeout + retry + loading state
- File sementara MP3 bisa menumpuk -> bersihkan berkala
- File gabungan bisa besar jika list panjang (100 kata x 2 audio)
  -> pertimbangkan kompresi atau batas maksimal
- Kualitas TTS Bahasa Indonesia bervariasi antar engine
  -> Edge TTS neural sudah cukup baik dan konsisten
- Akurasi Kanji -> sediakan edit manual romaji

#
9. DAFTAR DEPENDENSI (RINGKAS)
#

Backend (Go):
- github.com/gofiber/fiber/v2
- library wrapper edge-tts (atau HTTP client manual)
- github.com/... (godub / mp3join)  ATAU  ffmpeg via os/exec

Frontend (Svelte):
- svelte + vite
- tailwindcss
- alpinejs
- kuroshiro
- kuroshiro-analyzer-kuromoji
- kuromoji
- wanakana (opsional)

#
10. STRATEGI "GRATIS, TANPA BATAS, NATURAL, BISA DOWNLOAD"
#

- TTS: Edge TTS (neural, gratis, no API key, praktis tanpa batas)
- Merge & Download: ffmpeg / godub di backend Go
- Romaji: kuroshiro + kuromoji di frontend (tanpa server cost)
- Storage: lokal browser (localStorage / IndexedDB)
- Biaya total: Rp 0 (kecuali hosting, dan itu pun bisa self-host)

#
SELESAI
#