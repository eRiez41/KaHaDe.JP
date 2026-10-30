# UBAH_KATA.MD — Spesifikasi Fitur "Perubahan Kata"

Dokumen ini adalah spesifikasi lengkap untuk menu baru "Perubahan Kata"
di aplikasi KaHaDe JP. Menu ini adalah "playground" konjugasi — terpisah
dari vocab manager — tempat user bisa input kata kerja dan melihat
analisis perubahan bentuknya.

Referensi:
- app.md        : flow/UX utama aplikasi
- tech-stack.md : tech stack & library
- rules.md      : aturan kerja agent
- ui3.md        : design system (Pastel Neo-Brutalism)

Prioritas konflik: app.md > ubah_kata.md > ui3.md > tech-stack.md

============================================================
1. LATAR BELAKANG & TUJUAN
============================================================

Aplikasi KaHaDe JP saat ini fokus pada manajemen kosakata + TTS.
Menu "Perubahan Kata" adalah fitur tambahan untuk BELAJAR konjugasi
kata kerja Jepang secara interaktif.

Tujuan:
- User bisa input kata kerja dan langsung melihat analisis
  perubahannya (bentuk asal, golongan, alasan, hasil).
- Menjadi "kamus konjugasi" pribadi yang fokus pada materi
  Minna no Nihongo.
- Bertahap: satu sub-menu per materi/bab, mulai dari ます → て.

Prinsip desain:
- Penjelasan lengkap, bukan sekadar output.
- Setiap analisis disertai ALASAN (kenapa golongan ini, kenapa
  akhiran ini).
- Terima input fleksibel (romaji/hiragana/katakana/kanji).
- Akurat untuk pengecualian (行く, 帰る, dll) — jangan asal
  heuristik.

============================================================
2. STRUKTUR MENU
============================================================

Menu baru di top nav: "Perubahan Kata"

Struktur sub-menu:

  Perubahan Kata
  ├── ます → て (Bab 14)                    [ACTIVE]
  ├── ます → ない (Bab 17)                  [COMING SOON]
  ├── ます → た (Bab 19)                    [COMING SOON]
  ├── 辞書形 → ます (Bab 14, reverse)       [COMING SOON]
  ├── ます → 辞書形 (Bab 14, reverse)       [COMING SOON]
  ├── ます → 可能形 (Bab 27)                [COMING SOON]
  ├── ます → 意向形 (Bab 31)                [COMING SOON]
  ├── ます → 条件形 (Bab 25)                [COMING SOON]
  ├── ます → 命令形 (Bab 32)                [COMING SOON]
  ├── ます → 受身形 (Bab 37)                [COMING SOON]
  ├── ます → 使役形 (Bab 48)                [COMING SOON]
  ├── ます → 使役受身形 (Bab 48)            [COMING SOON]
  ├── ます → 敬語 (Bab 49-50)               [COMING SOON]
  ├── Adjektiva-i (い → くて/かった/くない)  [COMING SOON]
  └── Adjektiva-na (だ → で/だった/じゃない) [COMING SOON]

Aturan tampilan:
- Semua sub-menu tampil (tidak disembunyikan).
- Sub-menu COMING SOON diberi badge "Coming Soon" + icon lock.
- Klik sub-menu COMING SOON → toast "Fitur ini segera hadir".
- Sub-menu aktif (ます → て) dibuka default di urutan teratas.

Halaman daftar sub-menu:
- Grid card (2 kolom mobile, 3 kolom desktop).
- Tiap card: judul, bab asal, badge status.
- Card aktif punya border tebal --ink + shadow-md (ui3.md).

============================================================
3. HALAMAN "ます → て"
============================================================

Halaman ini punya 3 section vertikal:

## Section 1: Penjelasan (Collapsible)

Default: TERBUKA untuk first-time user, TERTUTUP jika sudah ada
riwayat penggunaan (localStorage flag).

Konten:

  [Header] Apa itu bentuk て?
  Bentuk sambung verba/adjektiva berakhiran て (atau で).
  Fungsi: menyambung kalimat, sedang berlangsung (~ている),
  permintaan (~てください), izin (~てもいい), larangan,
  selesai (~てしまう), coba (~てみる), alasan, cara.

  ▼ 3 Golongan Kata Kerja

  ╔═══════════════════════════════════════════════════╗
  ║ Golongan I (五段 / Godan)                          ║
  ║ Ciri: stem ます berakhiran vokal "i" sebelum       ║
  ║       ~ます. Akhiran: -ki, -gi, -shi, -chi,       ║
  ║       -ni, -mi, -bi, -ri, -i                      ║
  ║ Contoh: 書きます, 泳ぎます, 話します, 待ちます,    ║
  ║         死にます, 飲みます, 遊びます, 取ります,    ║
  ║         買います                                   ║
  ╚═══════════════════════════════════════════════════╝

  ╔═══════════════════════════════════════════════════╗
  ║ Golongan II (一段 / Ichidan)                       ║
  ║ Ciri: stem ます berakhiran "e" atau "i" tepat      ║
  ║       sebelum ~ます. Aturan: buang ~ます, tambah   ║
  ║       ~て. Paling mudah.                           ║
  ║ Contoh: 食べます, 見ます, 起きます, 寝ます         ║
  ╚═══════════════════════════════════════════════════╝

  ╔═══════════════════════════════════════════════════╗
  ║ Golongan III (不規則 / Irregular)                  ║
  ║ Hanya 2 verba: します (suru), 来ます (kuru)        ║
  ║ Wajib hafal, tidak ikut pola apapun.               ║
  ║ Bentuk て: して (shite), 来て (kite)               ║
  ╚═══════════════════════════════════════════════════╝

  ▼ Tabel Akhiran ます → て

  ┌──────────────┬──────────┬─────────────────────┐
  │ Akhiran ます │ Bentuk て│ Contoh              │
  ├──────────────┼──────────┼─────────────────────┤
  │ -i, -chi, -ri│ -って     │ 買います → 買って    │
  │              │          │ 待ちます → 待って    │
  │              │          │ 取ります → 取って    │
  ├──────────────┼──────────┼─────────────────────┤
  │ -mi, -bi, -ni│ -んで     │ 飲みます → 飲んで    │
  │              │          │ 遊びます → 遊んで    │
  │              │          │ 死にます → 死んで    │
  ├──────────────┼──────────┼─────────────────────┤
  │ -ki          │ -いて     │ 書きます → 書いて    │
  ├──────────────┼──────────┼─────────────────────┤
  │ -gi          │ -いで     │ 泳ぎます → 泳いで    │
  ├──────────────┼──────────┼─────────────────────┤
  │ -shi         │ -して     │ 話します → 話して    │
  ├──────────────┼──────────┼─────────────────────┤
  │ Ichidan      │ -て       │ 食べます → 食べて    │
  ├──────────────┼──────────┼─────────────────────┤
  │ します       │ して      │ (irregular)          │
  │ 来ます       │ 来て(kite)│ (irregular)          │
  └──────────────┴──────────┴─────────────────────┘

  ⚠ Pengecualian BESAR
  行きます → 行って (itte) — BUKAN 行いて (iite)!
  Meski akhiran -ki biasanya jadi -ite (書きます → 書いて),
  khusus 行きます jadi -tte. Wajib hafal.

  ⚠ Jebakan: Godan yang terlihat Ichidan
  Verba berikut berakhiran -ri/-i/-e tapi GODAN:
  帰ります (kaerimasu) → 帰って (bukan kaerite)
  入ります (hairimasu) → 入って
  走ります (hashirimasu) → 走って
  切ります (kirimasu) → 切って
  知ります (shirimasu) → 知って
  要ります (irimasu) → 要って
  減ります (herimasu) → 減って
  滑ります (suberimasu) → 滑って

## Section 2: Input

  Input field (single line):
  ┌─────────────────────────────────────────────────┐
  │ Masukkan kata kerja bentuk ます:                │
  │ ┌─────────────────────────────────────────────┐ │
  │ │ tabemasu                                    │ │
  │ └─────────────────────────────────────────────┘ │
  │ 💡 Bisa romaji, hiragana, katakana, atau kanji  │
  │                                                  │
  │ [Analisis] (tombol primary)                     │
  └─────────────────────────────────────────────────┘

Behavior:
- Enter di input field = klik "Analisis".
- Trim whitespace, lowercase untuk romaji.
- Deteksi otomatis jenis input (romaji vs kana vs kanji).
- Loading state saat analisis (spinner kecil di tombol).

## Section 3: Hasil Analisis

Muncul setelah user klik "Analisis" atau Enter.
Scroll otomatis ke section ini (smooth).
Bisa di-dismiss (tombol ✕) untuk analisis berikutnya.

Layout hasil (card dengan border tebal + hard shadow):

  ┌─────────────────────────────────────────────────┐
  │ 📥 INPUT TERDETEKSI                    [✕]     │
  │    食べます (tabemasu) · bentuk ます (sopan)    │
  ├─────────────────────────────────────────────────┤
  │ 📚 GOLONGAN & ALASAN                            │
  │    [Badge: Golongan II — Ichidan]               │
  │    Stem ます berakhiran "-e" (tabe-), ciri      │
  │    khas Ichidan. Buang ます → kamus -ru,        │
  │    buang ます → te form -te.                    │
  ├─────────────────────────────────────────────────┤
  │ 🔄 JALUR PERUBAHAN                              │
  │    ます-stem  : 食べ (tabe)                     │
  │    Kamus      : 食べる (taberu)                 │
  │                [buang ます, tambah る]           │
  │    Bentuk て  : 食べて (tabete)                 │
  │                [buang ます, tambah て]           │
  ├─────────────────────────────────────────────────┤
  │ 📝 RANTAI                                       │
  │    食べます → 食べる → 食べて                   │
  └─────────────────────────────────────────────────┘

Untuk Godan (contoh 飲みます):

  ┌─────────────────────────────────────────────────┐
  │ 📥 INPUT TERDETEKSI                    [✕]     │
  │    飲みます (nomimasu) · bentuk ます (sopan)    │
  ├─────────────────────────────────────────────────┤
  │ 📚 GOLONGAN & ALASAN                            │
  │    [Badge: Golongan I — Godan]                  │
  │    Stem ます berakhiran "-mi" (nomi-),          │
  │    akhiran vokal "i" khas Godan. Akhiran -mi   │
  │    termasuk kelompok onbin hatsuonbin (ん).     │
  ├─────────────────────────────────────────────────┤
  │ 🔄 JALUR PERUBAHAN                              │
  │    ます-stem  : 飲み (nomi)                     │
  │    Kamus      : 飲む (nomu)                     │
  │                [akhiran -mi → -mu]               │
  │    Bentuk て  : 飲んで (nonde)                  │
  │                [akhiran -mi → -nde]              │
  │    ⚠ Onbin: mi → んで (hatsuonbin)              │
  ├─────────────────────────────────────────────────┤
  │ 📝 RANTAI                                       │
  │    飲みます → 飲む → 飲んで                     │
  └─────────────────────────────────────────────────┘

Untuk Irregular (します):

  ┌─────────────────────────────────────────────────┐
  │ 📥 INPUT TERDETEKSI                    [✕]     │
  │    します (shimasu) · bentuk ます (sopan)       │
  ├─────────────────────────────────────────────────┤
  │ 📚 GOLONGAN & ALASAN                            │
  │    [Badge: Golongan III — Irregular]            │
  │    する adalah verba irregular, perubahannya   │
  │    tidak mengikuti pola apapun. Wajib hafal.   │
  ├─────────────────────────────────────────────────┤
  │ 🔄 JALUR PERUBAHAN                              │
  │    ます-stem  : し (shi)                        │
  │    Kamus      : する (suru)                     │
  │    Bentuk て  : して (shite)                    │
  ├─────────────────────────────────────────────────┤
  │ 📝 RANTAI                                       │
  │    します → する → して                         │
  └─────────────────────────────────────────────────┘

Untuk Pengecualian (行きます):

  ┌─────────────────────────────────────────────────┐
  │ 📥 INPUT TERDETEKSI                    [✕]     │
  │    行きます (ikimasu) · bentuk ます (sopan)     │
  ├─────────────────────────────────────────────────┤
  │ 📚 GOLONGAN & ALASAN                            │
  │    [Badge: Golongan I — Godan]                  │
  │    [Badge: ⚠ Pengecualian]                      │
  │    Meski akhiran -ki biasanya jadi -ite         │
  │    (書きます→書いて), khusus 行く jadi -tte     │
  │    (行って). Wajib hafal!                       │
  ├─────────────────────────────────────────────────┤
  │ 🔄 JALUR PERUBAHAN                              │
  │    ます-stem  : 行き (iki)                      │
  │    Kamus      : 行く (iku)                      │
  │    Bentuk て  : 行って (itte)                   │
  │                [BUKAN 行いて!]                   │
  ├─────────────────────────────────────────────────┤
  │ 📝 RANTAI                                       │
  │    行きます → 行く → 行って                     │
  └─────────────────────────────────────────────────┘

Visual feedback (ui3.md style):
- Badge Golongan II → BG --mint
- Badge Golongan I → BG --sky
- Badge Golongan III → BG --lilac
- Badge Pengecualian → BG --rose (border tebal)
- Semua badge: border 2px --ink, shadow-sm, radius 0.

============================================================
4. INPUT HANDLING
============================================================

## 4A. Jenis Input yang Didukung

| Jenis     | Contoh         | Handling                              |
|-----------|----------------|---------------------------------------|
| Romaji    | tabemasu       | Wanakana konversi → hiragana          |
| Hiragana  | たべます       | Langsung proses                       |
| Katakana  | タベマス       | Konversi → hiragana, simpan original  |
| Kanji     | 食べます       | Kuromoji deteksi reading, lalu proses |
| Mixed     | 食べマス       | Normalisasi dulu (katakana→hira)      |

## 4B. Katakana — Harus Didukung

Alasan:
- Verba serapan yang ditulis katakana: サボる, ググる, メモる
- User typo (keyboard toggle tanpa sadar)
- Lebih baik diterima daripada reject

Behavior:
- Terima katakana, konversi internal ke hiragana untuk analisis.
- Output: tampilkan KETIGA bentuk (original, hiragana, kanji
  jika memungkinkan).
- Contoh: input "タベマス" → output tampil "タベマス (たべます /
  食べます)".

## 4C. Form Detection — Input Ketat

Menu ini "ます → て", jadi secara ideal input = bentuk ます.
Tapi user sering salah input:

| Input user | Skenario           | Handling                          |
|------------|--------------------|-----------------------------------|
| tabemasu   | ✅ Benar (ます)    | Proses normal                     |
| taberu     | ❌ Bentuk kamus    | Toast: "Ini bentuk kamus. Mau      |
|            |                    | konversi ke ます dulu?" + tombol  |
| tabete     | ❌ Sudah bentuk て | Toast: "Ini sudah bentuk て. Mau  |
|            |                    | lihat analisis dari ます-nya?"    |
| tabe       | ❌ Stem saja       | Reject: "Sepertinya belum         |
|            |                    | lengkap, mohon input bentuk       |
|            |                    | lengkap"                          |
| tabemashita| ❌ Bentuk lampau   | Toast: "Ini bentuk ました. Mau    |
|            |                    | konversi ke ます dulu?"           |

Rekomendasi MVP: Ketat dulu. Kalau bukan bentuk ます → tolak
dengan pesan jelas. Auto-convert ke ます = iterasi berikutnya.

## 4D. Ambiguitas

Beberapa input ambigu tanpa kanji:

| Input    | Kemungkinan                                    | Solusi     |
|----------|------------------------------------------------|------------|
| kimasu   | 来ます (kuru, Irregular) = datang              | Tampilkan  |
|          | 着ます (kiru, Ichidan) = memakai               | keduanya   |
|          | ⚠️ Te-form sama: きて (kite)                   |            |
| imasu    | 居ます (iru, Ichidan) = ada                    | Proses     |
|          | (rare)                                         | biasa      |
| shimasu  | します (suru, Irregular)                       | Proses     |
|          |                                                | suru       |
| hanashimasu | 話します (hanasu, Godan)                    | Proses     |
|          |                                                | Godan -su  |

Aturan emas:
- Kalau masu-stem = "し" saja (bukan "〜し"), itu SURU.
- Kalau "〜し" (ada stem sebelumnya), itu Godan ending -su.

Untuk ambiguitas (kimasu), tampilkan KEDUA hasil analisis
dalam card terpisah, dengan catatan: "Input ambigu tanpa kanji.
Berikut kedua kemungkinan."

============================================================
5. ANALYZER — CARA KERJA
============================================================

## 5A. Pipeline

  [Input] → [Normalisasi] → [Deteksi Golongan] → [Konjugasi]
  → [Generate Penjelasan] → [Output]

## 5B. Normalisasi

1. Trim whitespace.
2. Kalau romaji: lowercase, konversi via Wanakana.
3. Kalau katakana: konversi ke hiragana (simpan original).
4. Kalau kanji: pakai kuromoji untuk dapat reading (jika
   tersedia). Kalau kuromoji belum load, fallback ke manual.
5. Pastikan berakhiran "ます" (atau "マス").

## 5C. Deteksi Golongan

Urutan prioritas (dari paling akurat ke fallback):

1. **Exception dictionary** (hardcode ~20 verba)
   - Kalau verba ada di dictionary → langsung pakai golongan
     & te-form dari dictionary (paling akurat).

2. **Irregular check**
   - "します" / "きます" → Golongan III.

3. **Ichidan check**
   - Cek 1 karakter sebelum "ます": kalau "e" atau "i" (bukan
     "shi", "chi", bukan bagian dari Godan exception) → Ichidan.
   - ⚠️ Kecuali verba di exception dictionary (帰ります,
     入ります, dll).

4. **Godan check (fallback)**
   - Kalau lolos semua di atas → Godan.
   - Tentukan akhiran (ki/gi/shi/chi/ni/mi/bi/ri/i).

5. **Validasi**
   - Kalau kuromoji tersedia, cross-check dengan hasil
     kuromoji. Kalau beda, tampilkan warning.

## 5D. Konjugasi

Setelah golongan + akhiran diketahui:

  Ichidan: stem + "て"
  Godan:
    -i, -chi, -ri → stem + "って"
    -mi, -bi, -ni → stem + "んで"
    -ki          → stem + "いて"  (kecuali 行く → "って")
    -gi          → stem + "いで"
    -shi         → stem + "して"
  Irregular:
    します → して
    来ます → 来て (kite)

Kamus (dictionary form):
  Ichidan: stem + "る"
  Godan:
    -ki → "く", -gi → "ぐ", -shi → "す", -chi → "つ",
    -ni → "ぬ", -mi → "む", -bi → "ぶ", -ri → "る",
    -i  → "う"
  Irregular:
    します → する
    来ます → 来る

## 5E. Generate Penjelasan

Untuk setiap hasil, generate:
1. Input terdeteksi (jenis + arti)
2. Golongan (badge + alasan singkat)
3. Jalur perubahan (stem, kamus, te-form + rule)
4. Rantai (ます → kamus → て)

Alasan = 1-2 kalimat, bukan paragraf panjang.

============================================================
6. EXCEPTION DICTIONARY (WAJIB)
============================================================

Tanpa dictionary ini, analyzer akan SALAH untuk verba berikut.
Semua ini berakhiran -ri/-i/-e tapi GODAN (bukan Ichidan):

| Verba (ます)    | Kamus     | Te-form  | Catatan       |
|----------------|-----------|----------|---------------|
| 帰ります       | 帰る      | 帰って   | Godan!        |
| 入ります       | 入る      | 入って   | Godan!        |
| 走ります       | 走る      | 走って   | Godan!        |
| 切ります       | 切る      | 切って   | Godan!        |
| 知ります       | 知る      | 知って   | Godan!        |
| 要ります       | 要る      | 要って   | Godan!        |
| 減ります       | 減る      | 減って   | Godan!        |
| 滑ります       | 滑る      | 滑って   | Godan!        |
| 蹴ります       | 蹴る      | 蹴って   | Godan!        |
| 混じります     | 混じる    | 混じって | Godan!        |
| 限ります       | 限る      | 限って   | Godan!        |
| 焦ります       | 焦る      | 焦って   | Godan!        |
| 握ります       | 握る      | 握って   | Godan!        |
| 座ります       | 座る      | 座って   | Godan!        |
| 光ります       | 光る      | 光って   | Godan!        |
| 怒ります       | 怒る      | 怒って   | Godan!        |
| 困ります       | 困る      | 困って   | Godan!        |
| 伸びます       | 伸びる    | 伸びて   | Godan!        |
| 浴びます       | 浴びる    | 浴びて   | Godan!        |
| 詫びます       | 詫びる    | 詫びて   | Godan!        |

Plus pengecualian te-form:
| Verba (ます)    | Kamus     | Te-form  | Catatan       |
|----------------|-----------|----------|---------------|
| 行きます       | 行く      | 行って   | -ki → -tte    |

Strategi: hardcode minimal 20 verba ini di file
`frontend/src/lib/conjugation/exceptions.js`.

Kalau kuromoji tersedia (Fase 4), bisa dipakai untuk
validasi tambahan — kuromoji tahu golongan dari dictionary.

============================================================
7. HALAMAN DAFTAR SUB-MENU
============================================================

Layout: grid card (2 kolom mobile, 3 kolom desktop).

Card structure:
  ┌─────────────────────────────────┐
  │ ます → て                       │
  │ Bab 14 · Bentuk sambung         │
  │ [Badge: Aktif]                  │
  └─────────────────────────────────┘

  ┌─────────────────────────────────┐
  │ ます → ない                     │
  │ Bab 17 · Bentuk negatif         │
  │ [Badge: Coming Soon] [🔒]       │
  └─────────────────────────────────┘

Klik card COMING SOON → toast "Fitur ini segera hadir".

============================================================
8. RIWAYAT ANALISIS (OPSIONAL)
============================================================

Simpan di localStorage:
- 50 analisis terakhir
- Fields: input, hasil (golongan, te-form, timestamp)
- Tampil di section "Riwayat" di bawah hasil analisis
- Tombol "Hapus riwayat" di Settings

Format localStorage:
```json
{
  "riwayat_ubah_kata": [
    {
      "id": "uuid",
      "sub_menu": "masu_te",
      "input": "tabemasu",
      "input_detected": "食べます",
      "golongan": "ichidan",
      "hasil": "食べて",
      "timestamp": "2026-10-28T10:00:00Z"
    }
  ]
}

Catatan: riwayat ini TIDAK diintegrasikan ke vocab manager
(KaHaDe JP). Kalau nanti user mau, bisa tambah fitur "Simpan
ke Bab X".

============================================================

    STATE & KOMPONEN (SVELTE)
    ============================================================

9A. State per Halaman

// routes/UbahKata.svelte
let input = state(′′);letresult=state(′′);letresult=state(null); // { golongan, alasan, stem,
// kamus, te_form, chain }
let isLoading = state(false);leterror=state(false);leterror=state(null);
let showExplanation = $state(true); // collapsible
9B. Komponen

routes/
└── UbahKata.svelte // halaman utama
├── UbahKataList.svelte // daftar sub-menu (grid card)
├── UbahKataDetail.svelte // halaman ます → て
│ ├── ExplanationPanel.svelte // penjelasan collapsible
│ ├── InputAnalyzer.svelte // input + tombol analisis
│ └── ResultCard.svelte // hasil analisis
│ ├── GolonganBadge.svelte
│ └── ChainFlow.svelte // rantai ます→kamus→て
9C. Analisis Logic

// lib/conjugation/masuToTe.js
export function analyzeMasuToTe(input) {
// 1. Normalisasi (romaji → hira, katakana → hira)
// 2. Deteksi jenis input
// 3. Cek exception dictionary
// 4. Deteksi golongan
// 5. Konjugasi
// 6. Generate penjelasan
// return { ... }
}

// lib/conjugation/exceptions.js
export const GODAN_LOOKS_ICHIDAN = {
'帰ります': { kamus: '帰る', te: '帰って', alasan: 'Godan' },
// ... 20 verba
};

export const SPECIAL_CASES = {
'行きます': { kamus: '行く', te: '行って',
alasan: 'Pengecualian -ki → -tte' },
};

============================================================

    EDGE CASES
    ============================================================

Kasus	Handling
Input kosong	Disable tombol
Input > 50 karakter	Reject: "Input
	terlalu panjang"
Input bukan bahasa Jepang/latin	Reject: "Input
	tidak valid"
Input latin random ("abc")	Coba konversi Wanakana,
	kalau gagal → error
Input "masu" (cuma akhiran)	Reject: "Sepertinya
	belum lengkap"
Kuromoji gagal load	Fallback ke
	heuristic +
	exception dictionary
Input ambigu (kimasu)	Tampilkan 2 hasil
	dengan catatan
Input katakana	Konversi, tampilkan
	3 bentuk
Riwayat penuh (50 entri)	FIFO (hapus terlama)

============================================================

    INTEGRASI DENGAN DESIGN SYSTEM
    ============================================================

Mengikuti ui3.md (Pastel Neo-Brutalism):

    Card penjelasan: BG --surface, border 3px --ink, shadow-md.

    Card hasil: BG --surface, border 3px --ink, shadow-md.

    Badge golongan: border 2px --ink, shadow-sm, radius 0.

        Golongan I: BG --sky

        Golongan II: BG --mint

        Golongan III: BG --lilac

        Pengecualian: BG --rose

    Input field: BG --surface, border 3px --ink, shadow-sm.

    Tombol "Analisis": BG --butter, border 4px --ink, shadow-lg.

    Rantai (chain): teks mono 14px, dengan panah → antar bentuk.

    Warning/exception: BG --rose (opacity 30%), border --ink.

Motion (sesuai ui3.md):

    Card hasil muncul: slide-up + fade 200ms.

    Hover card: shadow-lg + translate(-2px, -2px).

============================================================

    COMING SOON — SUB-MENU LAIN
    ============================================================

Urutan prioritas build berikutnya:

TIER 1 (Minna Bab 14-19):

    ます → ない (Bab 17) — sedang diimplementasi setelah ます→て

    ます → た (Bab 19) — aturan onbin identik て-form

    辞書形 → ます (Bab 14 reverse)

    ます → 辞書形 (Bab 14 reverse)

TIER 2 (Minna Bab 20-31):

    ます → 可能形 (potential, Bab 27)

    ます → 意向形 (volitional, Bab 31)

    ます → 条件形 (conditional, Bab 25)

    ます → 命令形 (imperative, Bab 32)

TIER 3 (Minna Bab 37+, advanced):

    ます → 受身形 (passive, Bab 37)

    ます → 使役形 (causative, Bab 48)

    ます → 使役受身形 (Bab 48)

    ます → 敬語 (keigo, Bab 49-50)

KATEGORI LAIN (bukan verba):

    Adjektiva-i: い → くて / かった / くない

    Adjektiva-na: だ → で / だった / じゃない

============================================================

    PERTANYAAN TERBUKA (PERLU KEPUTUSAN)
    ============================================================

    Input ketat atau fleksibel?

        Ketat: hanya terima bentuk ます, tolak yang lain

        Fleksibel: terima bentuk apapun, auto-detect & convert

    Ambiguitas (kimasu): tampilkan dua-duanya atau minta kanji?

    Analyzer: pakai kuromoji atau heuristik + exception dict?

        Kuromoji: akurat, tapi butuh load 20MB

        Heuristik: ringan, akurat 95% (cukup untuk MVP)

    Simpan riwayat analisis?

        Tidak (stateless)

        Ya (localStorage, 50 entri terakhir)

    Sub-menu lain tampil sebagai "coming soon" atau sembunyi?

        Tampil semua (transparan, user tahu roadmap)

        Sembunyi (baru muncul saat siap)

    Integrasi ke vocab manager?

        Tidak (standalone playground)

        Ya (tombol "simpan ke Bab X")

    Kuromoji lazy load atau eager load saat buka menu?

        Lazy: load saat user klik "Analisis" pertama kali

        Eager: load saat buka halaman "Perubahan Kata"

============================================================

    IMPLEMENTASI — FASE
    ============================================================

Fitur ini masuk FASE tersendiri, setelah FASE 6 (Mini Player)
dan FASE 7 (Import JSON), atau bisa paralel.

Saran: FASE 8.5 (setelah Download & Export, sebelum Kanji Page).

Scope FASE 8.5:

    Halaman "Perubahan Kata" (daftar sub-menu)

    Halaman "ます → て" (penjelasan + input + hasil)

    Analyzer: heuristik + exception dictionary

    20 verba exception hardcoded

    4 sub-menu lain tampil sebagai COMING SOON

    Riwayat analisis di localStorage (opsional)

    Test unit untuk analyzer (edge cases)

============================================================

    TESTING (WAJIB)
    ============================================================

Unit test untuk analyzer:

test('tabemasu → tabete (Ichidan)', () => {
expect(analyzeMasuToTe('tabemasu').te_form).toBe('tabete');
expect(analyzeMasuToTe('tabemasu').golongan).toBe('ichidan');
});

test('nomimasu → nonde (Godan -mi)', () => {
expect(analyzeMasuToTe('nomimasu').te_form).toBe('nonde');
expect(analyzeMasuToTe('nomimasu').golongan).toBe('godan');
});

test('ikimasu → itte (Pengecualian)', () => {
expect(analyzeMasuToTe('ikimasu').te_form).toBe('itte');
expect(analyzeMasuToTe('ikimasu').is_exception).toBe(true);
});

test('kaerimasu → kaette (Godan, bukan Ichidan)', () => {
expect(analyzeMasuToTe('kaerimasu').te_form).toBe('kaette');
expect(analyzeMasuToTe('kaerimasu').golongan).toBe('godan');
});

test('shimasu → shite (Irregular)', () => {
expect(analyzeMasuToTe('shimasu').te_form).toBe('shite');
expect(analyzeMasuToTe('shimasu').golongan).toBe('irregular');
});

test('kimasu → kite (Irregular, ambiguous)', () => {
const result = analyzeMasuToTe('kimasu');
expect(result).toHaveLength(2); // 来ます + 着ます
});

test('katakana input タベマス', () => {
expect(analyzeMasuToTe('タベマス').te_form).toBe('tabete');
});

test('invalid input', () => {
expect(() => analyzeMasuToTe('abc123')).toThrow();
expect(() => analyzeMasuToTe('')).toThrow();
});

============================================================

    CATATAN
    ============================================================

    Fitur ini SEPENUHNYA client-side. Tidak butuh backend Go,
    kecuali nanti untuk integrasi simpan ke vocab manager.

    Kuromoji/wanakana sudah akan ada di Fase 4. Reuse saja.

    Kalau kuromoji belum tersedia saat FASE 8.5, analyzer tetap
    jalan dengan heuristik + exception dictionary. Kuromoji
    jadi enhancement, bukan dependency.

    Untuk sub-menu berikutnya, POLA yang sama (penjelasan +
    input + hasil) bisa di-reuse. Hanya aturan konjugasi yang
    berbeda.

============================================================
SELESAI
============================================================