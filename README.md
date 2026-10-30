# KaHaDe.JP — Kata Hafalan Dengar Japan

Web app personal untuk mengelola kosakata Jepang, generate audio TTS (Jepang & Indonesia), lalu memutar dan mengunduh audio. Dilengkapi menu **Perubahan Kata** untuk belajar konjugasi verba & adjektiva.

> **KaHaDe** = **Ka**ta **Ha**falan **De**ngar · **JP** = **J**a**p**an

---

## ✨ Fitur

**Manajemen Kosakata**
- CRUD bab & kosakata (tambah, edit inline, hapus)
- Import JSON 4 langkah dengan preview validasi
- Export JSON per bab & backup/restore semua data
- Auto-generate romaji dari kanji/hiragana (kuroshiro + kuromoji)

**Audio TTS**
- Generate audio Jepang (`ja-JP`) & Indonesia (`id-ID`) via Edge TTS
- Mini player global dengan antrean Jepang → Indonesia
- Play satu / play semua, jeda antar audio, kecepatan, volume
- Auto-skip audio gagal
- Download audio per bab (gabung jadi 1 MP3)

**Perubahan Kata (15 Modul)**
- ます ⇄ 辞書形 (dua arah)
- ます → て, ない, た, たら, 可能, 意向, 命令, えば, 受身, 使役, 使役受身, 敬語
- Adjektiva-i & Adjektiva-na
- Validasi ke kamus backend, arti Indonesia per bentuk

**Halaman Kanji**
- Rekap kanji per bab, filter kata ber-kanji

**Settings**
- Voice picker (Jepang & Indonesia)
- Kecepatan default, jeda antar audio
- Backup/restore

---

## 🔧 Prasyarat

- **Go** 1.26+
- **Node.js** 20+
- **ffmpeg**

Di mesin pengembangan ini, Go dipasang lokal di `~/.local/go`:

```bash
export PATH="$HOME/.local/go/bin:$PATH"
