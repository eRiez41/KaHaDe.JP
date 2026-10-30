# UI3.MD — Design System
# Reference: Pastel Neo-Brutalism

Dokumen ini adalah panduan visual & design token alternatif untuk
aplikasi KaHaDe JP. Referensi utama: Neo-Brutalism dengan palet
pastel, bukan saturated colors ala neo-brutalism klasik.

Referensi flow/UX: app.md
Referensi tech: tech-stack.md
Referensi aturan kerja: rules.md
Design system alternatif: ui.md (Material 3), ui2.md (Liquid Glass)

Prioritas konflik: app.md > ui3.md > tech-stack.md

============================================================
1. DESIGN PHILOSOPHY
============================================================

Pastel Neo-Brutalism = kejujuran struktural brutalisme, tapi
dengan palet warna yang lembut dan ramah mata.

Prinsip utama:
- HONEST LAYOUT  : Border tebal menunjukkan struktur, bukan
                   disembunyikan. Setiap elemen punya "bingkai".
- PASTEL FILL    : Warna isi pastel (butter, peach, mint, dsb),
                   bukan saturated neon.
- HARD SHADOW    : Shadow solid offset tanpa blur. Ini yang bikin
                   elemen terasa "menempel" seperti stiker.
- SHARP CORNERS  : Radius 0 di mana-mana. Jangan kompromi.
- MONO TYPE      : Font monospace untuk data teknis (romaji,
                   status, timestamp).
- ACCESSIBLE     : Kontras dijaga via border hitam & teks hitam,
                   bukan via warna pastel.

ATURAN PALING PENTING:
- BORDER & SHADOW WAJIB HITAM (light) / CREAM (dark).
  JANGAN pastel. Kalau border pastel, seluruh UI "cuci" dan
  kehilangan karakter brutal.
- TEKS DI ATAS PASTEL WAJIB HITAM (light) / CREAM (dark).
  JANGAN putih di atas pastel. Kontras gagal.
- Pastel HANYA untuk isi (background card, badge, tombol),
  bukan untuk border, shadow, atau teks.

Yang DIHINDARI:
- Pastel border (bikin flat dan hambar)
- Gradient (neo-brutalism anti-gradient)
- Blur / backdrop-filter (itu wilayah glassmorphism)
- Drop shadow halus (harus hard shadow, 0 blur)
- Rounded corner (radius > 4px merusak karakter)
- Efek "soft" apapun (soft shadow, soft border, soft color
  transition yang lambat)

Yang DIPERTAHANKAN dari neo-brutalism klasik:
- Border tebal 3px (kadang 4-5px untuk elemen utama)
- Hard shadow offset 6px, 0 blur
- Layout grid yang eksplisit (bukan whitespace berlebih)
- Tipografi bold sans-serif
- Warna blok solid

============================================================
2. COLOR SYSTEM
============================================================

Palet pastel: 3 warm + 3 cool. Semua punya versi light & dark.

## 2A. Pastel Palette (Light Mode)

Token         | Hex       | Nama    | Penggunaan
--------------|-----------|---------|------------------------------
--butter      | #FFF4B8   | Butter  | Primary action, highlight
--peach       | #FFD9B8   | Peach   | Warning, secondary action
--rose        | #FFC8D8   | Rose    | Error, destructive
--lilac       | #DCC8F0   | Lilac   | Info, neutral accent
--sky         | #B8DCF0   | Sky     | Link, audio-related
--mint        | #B8EDD0   | Mint    | Success, audio ready

## 2B. Pastel Palette (Dark Mode — Deep Version)

Hue tetap sama, tapi digelapkan supaya nyaman di mata.
Masih bisa dikenali sebagai "keluarga warna" yang sama.

Token         | Hex       | Nama    | Penggunaan
--------------|-----------|---------|------------------------------
--butter-dark | #5C4A1A   | Deep    | Primary action
--peach-dark  | #5C3A1A   | Deep    | Warning
--rose-dark   | #5C1A2E   | Deep    | Error
--lilac-dark  | #3A1A5C   | Deep    | Info
--sky-dark    | #1A3A5C   | Deep    | Link
--mint-dark   | #1A4A2E   | Deep    | Success

## 2C. Neutrals (Base)

Token         | Light     | Dark      | Penggunaan
--------------|-----------|-----------|------------------------------
--bg          | #FAF7F2   | #1A1815   | Background halaman (cream/warm dark)
--surface     | #FFFFFF   | #252220   | Card neutral (tanpa pastel)
--ink         | #000000   | #F5F0E8   | Teks utama, border, shadow
--ink-2       | #4A4A4A   | #A8A39E   | Teks sekunder
--ink-3       | #8A8A8A   | #6A6560   | Teks tertiary, placeholder
--divider     | #E5E0D8   | #3A3530   | Garis pemisah

## 2D. Semantic Mapping

Status audio & UI:

Status         | Light (bg)  | Dark (bg)   | Border & Teks
---------------|-------------|-------------|-----------------
pending (🟡)   | --peach     | --peach-dark| --ink
ready (🟢)     | --mint      | --mint-dark | --ink
failed (🔴)    | --rose      | --rose-dark | --ink
info (ℹ️)      | --lilac     | --lilac-dark| --ink
link (🔗)      | --sky       | --sky-dark  | --ink

## 2E. Aturan Pemakaian Warna

- Setiap elemen berwarna WAJIB punya border --ink 3px.
  Tanpa border, pastel akan "cuci" di background cream.
- Teks di atas pastel WAJIB --ink (hitam/cream), BUKAN putih.
- Warna pastel dipakai untuk BLOK (card, badge, tombol),
  bukan untuk teks tipis.
- Maksimal 2 warna pastel per layar. Jangan pelangi.
- Warna tidak boleh jadi satu-satunya penanda
  (selalu + ikon atau teks label).
- Kontras teks utama minimal 7:1 (AAA), karena kita bisa.
  Hitam di atas butter = 15.8:1. Aman.

============================================================
3. TYPOGRAPHY
============================================================

Font utama: INTER atau SYSTEM SANS (bold, geometric).
Font mono: JETBRAINS MONO atau IBM PLEX MONO (untuk data).
Font Jepang: NOTO SANS JP.

## 3A. Type Scale

Style          | Size  | Weight | Font    | Penggunaan
---------------|-------|--------|---------|-------------------------
display        | 40px  | 800    | Sans    | Angka besar dashboard
heading-1      | 28px  | 800    | Sans    | Judul halaman
heading-2      | 20px  | 700    | Sans    | Nama bab di card
heading-3      | 16px  | 700    | Sans    | Label section
body           | 16px  | 400    | Sans    | Teks utama
body-bold      | 16px  | 700    | Sans    | Teks yang di-highlight
mono           | 14px  | 500    | Mono    | Romaji, status, timestamp
caption        | 12px  | 500    | Sans    | Meta info, badge
kanji          | 20px  | 500    | Noto JP | Kanji/Hira/Katakana

## 3B. Aturan Typography

- Weight 800 untuk display & heading (bold ekstrem = brutalist).
- Tidak ada italic di UI (italic = lembut, anti-brutal).
- Mono khusus untuk data teknis: romaji, audio duration, timestamp.
- Kanji/Hira/Katakana pakai Noto Sans JP, letter-spacing normal.
- Angka dashboard pakai tabular-nums.
- Jangan pakai font < 12px. Neo-brutalism butuh tegas, bukan kecil.
- Line-height 1.4 untuk body, 1.1 untuk heading.

## 3C. Tailwind Config Hint

```js
fontSize: {
  'display':    ['2.5rem',  { lineHeight: '2.75rem', fontWeight: '800' }],
  'heading-1':  ['1.75rem', { lineHeight: '2rem',    fontWeight: '800' }],
  'heading-2':  ['1.25rem', { lineHeight: '1.5rem',  fontWeight: '700' }],
  'heading-3':  ['1rem',    { lineHeight: '1.25rem', fontWeight: '700' }],
  'body':       ['1rem',    { lineHeight: '1.4rem',  fontWeight: '400' }],
  'body-bold':  ['1rem',    { lineHeight: '1.4rem',  fontWeight: '700' }],
  'mono':       ['0.875rem',{ lineHeight: '1.25rem', fontWeight: '500' }],
  'caption':    ['0.75rem', { lineHeight: '1rem',    fontWeight: '500' }],
  'kanji':      ['1.25rem', { lineHeight: '1.5rem',  fontWeight: '500' }],
}

============================================================

    SHAPE
    ============================================================

RADIUS = 0 di mana-mana. Ini non-negotiable.
Token	Radius	Penggunaan
--r-none	0px	Semua elemen (default)
--r-sm	2px	Hanya untuk checkbox/radio (opsional)

Aturan:

    Card: radius 0.

    Button: radius 0.

    Input: radius 0.

    Modal: radius 0.

    Mini player: radius 0.

    Badge: radius 0 (kotak, bukan pill).

    Checkbox: boleh 0 atau 2px (kompromi aksesibilitas).

Kalau design system lain pakai radius besar, di sini kita
sengaja brutal: sudut tajam = struktur jujur.

============================================================

    BORDERS (ELEMEN DEFINING)
    ============================================================

Border adalah "tulang punggung" dari neo-brutalism.
Token	Nilai	Penggunaan
--border-1	2px solid var(--ink)	Divider, elemen kecil
--border-2	3px solid var(--ink)	Default untuk card, input
--border-3	4px solid var(--ink)	Tombol primary, elemen utama
--border-4	5px solid var(--ink)	Header, mini player, modal

Aturan:

    Border WAJIB --ink (hitam di light, cream di dark).

    JANGAN pakai border warna pastel (bikin flat).

    JANGAN pakai border tipis 1px (bukan brutal).

    Border harus terlihat jelas, bukan sekadar "garis".

    Untuk "elemen aktif", border tetap sama tapi shadow berubah.

Border vs Radius:

    Border tebal + radius 0 = brutal (yang kita mau).

    Border tebal + radius besar = playful (bukan kita).

    Border tipis + radius 0 = wireframe (bukan kita).

============================================================

    HARD SHADOWS (ELEMEN DEFINING KEDUA)
    ============================================================

Shadow = offset solid, blur 0. Bukan drop shadow.
Token	Nilai	Penggunaan
--shadow-sm	3px 3px 0 var(--ink)	Badge, chip kecil
--shadow-md	5px 5px 0 var(--ink)	Card, input, tombol
--shadow-lg	6px 6px 0 var(--ink)	Tombol primary, modal
--shadow-xl	8px 8px 0 var(--ink)	Mini player, header

Aturan:

    Shadow WAJIB --ink (hitam/cream). Bukan pastel, bukan abu.

    Blur = 0. Selalu.

    Offset diagonal (x = y).

    Saat elemen di-"tekan" (active), offset mengecil (efek tenggelam).

    Saat elemen di-hover, offset membesar (efek terangkat).

Interaksi:
css

.btn-brutal {
  border: 4px solid var(--ink);
  box-shadow: 6px 6px 0 var(--ink);
  transition: box-shadow 100ms, transform 100ms;
}
.btn-brutal:hover {
  box-shadow: 8px 8px 0 var(--ink);
  transform: translate(-2px, -2px);
}
.btn-brutal:active {
  box-shadow: 2px 2px 0 var(--ink);
  transform: translate(4px, 4px);
}

Catatan performa:

    Hard shadow itu murah (gak pakai blur), jauh lebih ringan
    dari drop shadow. Aman dipakai di mana-mana.

    Tapi tetap batasi jumlah elemen yang punya shadow besar
    di viewport (bisa bikin "rame").

============================================================

    SPACING
    ============================================================

Base unit: 4px. Semua spacing kelipatan 4.
Token	px
--s-1	4
--s-2	8
--s-3	12
--s-4	16
--s-5	20
--s-6	24
--s-8	32
--s-12	48
--s-16	64

Aturan:

    Padding card: --s-4 (16px).

    Padding halaman (desktop): --s-6 (24px).

    Padding halaman (mobile): --s-4 (16px).

    Gap antar card: --s-4 (16px) atau --s-6 (24px).

    Space antar section: --s-8 (32px).

    Tap target minimal 44x44 px (border tebal bantu banget).

Neo-brutalism tidak takut whitespace banyak, tapi juga
tidak takut elemen rapat. Yang penting: grid terlihat eksplisit.

============================================================

    MOTION
    ============================================================

Motion di neo-brutalism = SNAPPY, bukan smooth. Instan, bukan
melayang. Efeknya seperti "tombol yang ditekan".
Interaksi	Durasi	Easing
Tap feedback	80ms	linear
Hover	100ms	linear
Button toggle	120ms	linear
Modal open	200ms	ease-out (slide + scale)
Modal close	150ms	ease-in
Toast	200ms	ease-out

Aturan:

    JANGAN pakai easing smooth berlama-lama. Brutal itu cepat.

    Shadow transition yang bikin efek "terangkat/tenggelam".

    Transform translate pada hover/active.

    Hormati prefers-reduced-motion (kurangi jadi 0ms, tapi
    state tetap berubah).

Motion signature (wajib):

    Hover: shadow membesar + translate(-2px, -2px).

    Active: shadow mengecil + translate(+4px, +4px).

    Ini yang bikin elemen "hidup" tanpa harus animasi rumit.

============================================================

    COMPONENT SPECS
    ============================================================

9A. Button
Primary

    BG: --butter (light) / --butter-dark (dark)

    Border: --border-3 (4px --ink)

    Shadow: --shadow-lg (6px 6px 0)

    Text: --ink, font weight 700

    Padding: --s-3 --s-5 (12px 20px)

    Radius: 0

    Hover: shadow --shadow-xl, translate(-2px, -2px)

    Active: shadow --shadow-sm, translate(+4px, +4px)

Secondary

    BG: --mint

    Border, shadow, behavior: sama dengan primary.

Danger

    BG: --rose

    Border, shadow: sama.

    Text: --ink (BUKAN putih).

Ghost

    BG: transparent

    Border: --border-2

    Shadow: none

    Text: --ink

    Hover: BG --bg, shadow --shadow-sm

Icon Button

    Size: 44x44px (touch target)

    BG: --lilac atau --surface

    Border: --border-2

    Shadow: --shadow-sm

    Radius: 0

    Icon: 20px, warna --ink

9B. Card

    BG: pastel (--butter, --mint, --lilac, dsb) atau --surface

    Border: --border-2 (3px)

    Shadow: --shadow-md (5px 5px 0)

    Padding: --s-4 (16px)

    Radius: 0

    Hover: shadow --shadow-lg, translate(-2px, -2px)

    Active (dipilih): shadow --shadow-sm, translate(+2px, +2px)

Kombinasi card + pastel:

    Stat card: --butter

    Card bab: --surface (netral) atau --mint/--lilac bergantian

    Card kosakata: --surface

9C. Input Field

    BG: --surface

    Border: --border-2 (3px)

    Shadow: --shadow-sm (3px 3px 0)

    Padding: --s-3 --s-4

    Radius: 0

    Font: body, --ink

    Placeholder: --ink-3, font italic (satu-satunya italic di UI)

    Focus: border --border-3, shadow --shadow-md, outline none

    Error: border berubah jadi --rose (TAPI tetap 3px)

9D. Chip / Badge

    BG: pastel (--peach, --mint, --rose, --lilac, --sky)

    Border: --border-1 (2px --ink)

    Shadow: --shadow-sm (3px 3px 0)

    Padding: --s-1 --s-3 (4px 12px)

    Radius: 0 (kotak, bukan pill)

    Font: caption, --ink, weight 700

Badge status:

    Pending: BG --peach

    Ready: BG --mint

    Failed: BG --rose

    Info: BG --lilac

9E. Table Kosakata

    Container: BG --surface, border --border-2, shadow --shadow-md

    Header: BG --butter, border-bottom --border-2 (3px --ink)

    Header font: heading-3, --ink

    Row: BG --surface, border-bottom 2px --ink

    Row hover: BG --lilac/50 (subtle)

    Row aktif (sedang diputar): BG --sky

    Cell padding: --s-3 --s-4

    Font kanji: Noto Sans JP 20px

    Font romaji: mono 14px

    Font arti: body 16px

Aturan:

    JANGAN pakai border tipis antar-row. Pakai 2px --ink.

    Alternating row color? Boleh: BG --surface vs --bg
    (subtle, bukan pastel berbeda).

9F. Modal

    Backdrop: rgba(0,0,0,0.6) — gelap, tanpa blur

    Content: BG --surface (atau --lilac untuk modal celebratory)

    Border: --border-4 (5px --ink)

    Shadow: --shadow-xl (8px 8px 0)

    Radius: 0

    Padding: --s-6

    Header: border-bottom --border-2, font heading-1

    Footer: border-top --border-2, padding --s-4, gap --s-3

    Close button: icon button 44x44 di kanan atas

    Animasi: scale(0.95 → 1) + fade (200ms)

9G. Mini Player

    Posisi: fixed bottom

    BG: --butter (light) / --butter-dark (dark)

    Border-top: --border-4 (5px --ink)

    Shadow: --shadow-xl (8px 8px 0 --ink) — bayangan melayang

    Padding: --s-3 --s-4 + env(safe-area-inset-bottom)

    Height: 72px desktop

    Radius: 0

    Kontrol: icon button 44x44, border --border-2, BG --surface

    Progress bar:

        Height: 6px (lebih tebal dari design system lain)

        Border: 2px --ink

        Track: --surface

        Fill: --mint (atau --sky)

Ciri khas:

    Mini player adalah elemen visual TERKUAT di layar.

    Border 5px + shadow 8px = "kotak yang melayang".

    Jangan pakai blur, jangan pakai radius.

9H. Toast

    Posisi: bottom-center (di atas mini player)

    BG: --ink (hitam/cream — INVERTED untuk kontras)

    Text: --bg (cream/dark — kebalikan)

    Border: 2px solid --bg (inverted)

    Shadow: --shadow-md (tapi warna --bg untuk inverted)

    Padding: --s-3 --s-4

    Radius: 0

    Auto-dismiss: 3000ms

    Animasi: slide-up + fade (200ms)

9I. Empty State

    Ikon besar (64px), stroke tebal 3px, warna --ink

    Judul: heading-1

    Deskripsi: body, --ink-2

    CTA: Primary button

    Padding: --s-12 (48px)

    Border: --border-2 dashed (khusus empty state)

    Shadow: none (biar terasa "kosong")

9J. Loading Skeleton

    BG: --bg

    Border: --border-1

    Shimmer: pola garis diagonal (bukan gradient halus)
    repeating-linear-gradient(
    45deg,
    --bg 0px, --bg 10px,
    --lilac/30 10px, --lilac/30 20px
    )

    Animasi: background-position bergerak, 1s linear infinite

    Radius: 0

9K. Checkbox (khusus tabel & modal import)

    Size: 24x24px

    Border: --border-2

    BG: --surface (unchecked), --mint (checked)

    Check mark: karakter "✓" tebal, --ink, 16px

    Radius: 0 (atau 2px untuk aksesibilitas)

    Shadow: --shadow-sm

    Active: translate(+1px, +1px), shadow hilang

============================================================

    DARK MODE
    ============================================================

Pendekatan: NEAR-INVERT, bukan sekadar "warna digelapkan".
10A. Prinsip

    Background page: --bg = #1A1815 (warm dark, bukan pure black)

    Pastel: pakai versi --*-dark (deep version)

    Border & shadow: --ink = #F5F0E8 (cream, bukan putih murni)

    Teks: --ink (cream)

    Contrast tetap tinggi (cream di atas deep pastel > 7:1)

10B. Yang Berubah vs Tetap
Elemen	Light	Dark
Page bg	#FAF7F2	#1A1815
Card bg	Pastel terang	Pastel gelap
Border	#000000 3px	#F5F0E8 3px
Shadow	#000000 offset	#F5F0E8 offset
Text	#000000	#F5F0E8
Progress fill	--mint	--mint-dark
Toast bg	#000000	#F5F0E8
Toast text	#FAF7F2	#1A1815
10C. Kontras di Dark Mode

    Cream (#F5F0E8) di atas deep butter (#5C4A1A): ~9:1 → AAA ✓

    Cream di atas deep rose (#5C1A2E): ~10:1 → AAA ✓

    Cream di atas deep sky (#1A3A5C): ~11:1 → AAA ✓

    Cream di atas deep mint (#1A4A2E): ~10:1 → AAA ✓

Semua aman.
10D. Aturan Dark Mode

    Aktifkan via prefers-color-scheme.

    Toggle manual di Settings (localStorage).

    Semua token punya versi dark (lihat bagian 2B & 2C).

    JANGAN pakai pure black (#000) atau pure white (#FFF)
    untuk background — pakai #1A1815 dan #F5F0E8 (warm tone).

    Border & shadow di dark WAJIB cream, bukan hitam
    (hitam di dark = invisible).

    Foto/ilustrasi: boleh tetap sama, tapi kalau ada
    background putih, beri border --border-2.

============================================================

    ACCESSIBILITY
    ============================================================

Neo-brutalism justru lebih accessible dari glassmorphism atau
liquid glass, karena border tebal & kontras tinggi.

WAJIB:

    Kontras teks >= 7:1 (AAA) — kita bisa, ayo kita capai.

    Touch target minimal 44x44 px (border tebal bantu banget).

    Semua icon button punya aria-label.

    Focus ring: outline 3px --ink, offset 3px — WAJIB terlihat
    jelas (jangan pakai outline default browser yang tipis).

    Modal: trap focus, ESC untuk close.

    Form: label eksplisit (bukan cuma placeholder).

    Motion: hormati prefers-reduced-motion.

    Toast: aria-live="polite".

    Loading: aria-busy="true".

    Error: selain warna rose, WAJIB ada ikon ⚠ dan teks "Error".

JANGAN:

    Warna saja sebagai penanda (selalu + ikon/teks/border tebal).

    Animasi > 300ms untuk interaksi kecil.

    Disable zoom.

    Teks < 12px.

Bonus (neo-brutalism mudah dilakukan):

    Semua elemen interaktif punya border tebal → jelas
    mana yang clickable.

    Hard shadow → jelas mana yang "di atas" (layer).

    Radius 0 → tidak ada "kelembutan" yang bikin ambigu.

============================================================

    LAYOUT & GRID
    ============================================================

    Mobile-first.

    Breakpoints Tailwind: sm 640 / md 768 / lg 1024 / xl 1280

    Max width konten: 1200px (desktop), centered.

    Grid dashboard: 1 kolom (mobile) → 3 kolom (md) untuk stat.

    Grid bab: 1 kolom (mobile) → 2 kolom (md) → 3 kolom (lg).

    Gap antar card: --s-4 (16px) — konsisten.

    Tabel: horizontal scroll di mobile, kolom kanji sticky.

    Mini player: full width, konten max 1200px.

Signature layout:

    Border tebal di card = grid terasa eksplisit.

    Setiap card "terpisah" secara visual (bukan nyatu).

    Whitespace harus terasa "sengaja", bukan kebetulan.

============================================================

    HAL KHUSUS PER HALAMAN
    ============================================================

Dashboard

    Stat card: BG --butter, --mint, --lilac (bergantian)
    Border 3px, shadow 5px.

    Angka besar: display, weight 800.

    Quick action: primary button dengan shadow 6px.

    Card bab terakhir: BG --surface, border 3px.

    Progress audio: bar tebal 8px, fill --mint, track --bg,
    border 2px --ink.

Halaman Bab

    Card bab: BG --surface (netral), hover BG --butter.

    FAB "Tambah Bab": BG --mint, shadow 8px, border 4px.

    Header: border-bottom 5px, judul heading-1.

Detail Bab (Tabel)

    Header tabel: BG --butter, border 3px.

    Row: BG --surface, border-bottom 2px.

    Row aktif: BG --sky (biru muda).

    Tombol "Generate" per row: icon button 44x44 BG --mint.

    Toolbar atas: border-bottom 3px, BG --bg (sticky).

Kanji Page

    Pilih bab: segmented control (bukan dropdown),
    tiap segmen BG --surface / BG --butter (aktif).

    Tabel: 3 kolom (kanji, hira, arti), border 3px.

    Kanji: font 24px, weight 500.

Settings

    Section: card dengan BG --surface, border 3px.

    Toggle: switch style brutalist (kotak, border 3px).

    Voice picker: dropdown custom, BG --surface,
    border 3px, shadow 5px.

Import Modal

    BG: --surface (bukan pastel — fokus ke data)

    Border: 5px --ink

    Preview tabel: BG --surface, border 3px.

    Row warning: BG --peach (opacity tinggi).

    Row error: BG --rose.

    Row valid: BG --surface.

    Checkbox: brutalist style 24x24.

Mini Player

    BG: --butter, border-top 5px --ink, shadow 8px.

    Ini elemen paling "brutal" di seluruh UI.

    Tombol play: BG --mint, 56x56, border 4px, shadow 6px.

============================================================

    TAILWIND CONFIG — TOKENS
    ============================================================

js

// tailwind.config.js
export default {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Pastel
        butter:      { DEFAULT: '#FFF4B8', dark: '#5C4A1A' },
        peach:       { DEFAULT: '#FFD9B8', dark: '#5C3A1A' },
        rose:        { DEFAULT: '#FFC8D8', dark: '#5C1A2E' },
        lilac:       { DEFAULT: '#DCC8F0', dark: '#3A1A5C' },
        sky:         { DEFAULT: '#B8DCF0', dark: '#1A3A5C' },
        mint:        { DEFAULT: '#B8EDD0', dark: '#1A4A2E' },
        // Neutrals
        bg:          { DEFAULT: '#FAF7F2', dark: '#1A1815' },
        surface:     { DEFAULT: '#FFFFFF', dark: '#252220' },
        ink:         { DEFAULT: '#000000', dark: '#F5F0E8' },
        'ink-2':     { DEFAULT: '#4A4A4A', dark: '#A8A39E' },
        'ink-3':     { DEFAULT: '#8A8A8A', dark: '#6A6560' },
        divider:     { DEFAULT: '#E5E0D8', dark: '#3A3530' },
      },
      borderRadius: {
        'none': '0px',
        'sm':   '2px',   // hanya untuk checkbox
      },
      borderWidth: {
        '1': '2px',
        '2': '3px',
        '3': '4px',
        '4': '5px',
      },
      boxShadow: {
        'sm': '3px 3px 0 var(--ink)',
        'md': '5px 5px 0 var(--ink)',
        'lg': '6px 6px 0 var(--ink)',
        'xl': '8px 8px 0 var(--ink)',
        'none': 'none',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'IBM Plex Mono', 'monospace'],
        jp:   ['Noto Sans JP', 'system-ui', 'sans-serif'],
      },
      spacing: {
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '8': '32px',
        '12':'48px',
        '16':'64px',
      },
    },
  },
}

CSS Variables (untuk dark mode & shadow):
css

:root {
  --ink: #000000;
  --bg: #FAF7F2;
  --surface: #FFFFFF;
  --butter: #FFF4B8;
  --peach: #FFD9B8;
  --rose: #FFC8D8;
  --lilac: #DCC8F0;
  --sky: #B8DCF0;
  --mint: #B8EDD0;
}

.dark {
  --ink: #F5F0E8;
  --bg: #1A1815;
  --surface: #252220;
  --butter: #5C4A1A;
  --peach: #5C3A1A;
  --rose: #5C1A2E;
  --lilac: #3A1A5C;
  --sky: #1A3A5C;
  --mint: #1A4A2E;
}

============================================================

    CONTOH KOMPONEN (TAILWIND)
    ============================================================

Primary Button
html

<button class="
  bg-butter dark:bg-butter-dark
  text-ink dark:text-ink-dark
  border-2 border-ink dark:border-ink-dark
  shadow-md
  px-5 py-3
  font-bold text-base
  rounded-none
  transition-all duration-100
  hover:shadow-lg hover:-translate-x-0.5 hover:-translate-y-0.5
  active:shadow-sm active:translate-x-1 active:translate-y-1
">
  Generate Audio
</button>

Card Bab
html

<div class="
  bg-surface dark:bg-surface-dark
  border-2 border-ink dark:border-ink-dark
  shadow-md
  p-4 rounded-none
  transition-all duration-100
  hover:shadow-lg hover:-translate-x-0.5 hover:-translate-y-0.5
">
  <h3 class="text-heading-2 font-bold">Bab 3 - Kata Kerja</h3>
  <p class="text-body text-ink-2 mt-1">40 kata · 30/40 audio</p>
</div>

Mini Player
html

<div class="
  fixed bottom-0 inset-x-0 z-50
  bg-butter dark:bg-butter-dark
  border-t-4 border-ink dark:border-ink-dark
  shadow-[8px_-8px_0_var(--ink)]
  p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]
">
  <!-- konten player -->
</div>

Status Badge
html

<span class="
  inline-flex items-center gap-1
  bg-mint dark:bg-mint-dark
  text-ink dark:text-ink-dark
  border border-ink dark:border-ink-dark
  shadow-sm
  px-3 py-1
  font-bold text-caption
  rounded-none
">
  ● Ready
</span>

Input Field
html

<input
  class="
    w-full
    bg-surface dark:bg-surface-dark
    text-ink dark:text-ink-dark
    border-2 border-ink dark:border-ink-dark
    shadow-sm
    px-4 py-3
    rounded-none
    font-body
    focus:outline-none
    focus:border-2 focus:shadow-md
    placeholder:text-ink-3
  "
  placeholder="Masukkan kanji atau hiragana..."
/>

Checkbox
html

<label class="inline-flex items-center gap-2 cursor-pointer">
  <span class="
    w-6 h-6
    border-2 border-ink dark:border-ink-dark
    bg-surface dark:bg-surface-dark
    shadow-sm
    rounded-none
    flex items-center justify-center
    font-bold text-ink dark:text-ink-dark
  ">
    <!-- check mark jika checked -->
    ✓
  </span>
  <span class="text-body">Pilih</span>
</label>

============================================================

    CHECKLIST SEBELUM SELESAI HALAMAN
    ============================================================

    □

    Semua elemen berwarna punya border --ink 2-4px
    □

    Semua elemen interaktif punya hard shadow
    □

    Border & shadow pakai --ink (bukan pastel)
    □

    Teks di atas pastel pakai --ink (bukan putih)
    □

    Semua radius = 0 (kecuali checkbox 2px)
    □

    Semua shadow = blur 0
    □

    Semua spacing kelipatan 4
    □

    Hover state: shadow membesar + translate(-2px, -2px)
    □

    Active state: shadow mengecil + translate(+4px, +4px)
    □

    Dark mode dites (pastel versi dark, border cream)
    □

    Kontras teks >= 7:1 (AAA)
    □

    Focus ring visible (outline 3px --ink)
    □

    Loading state ada (skeleton brutalist)
    □

    Error state ada (bukan hanya warna)
    □

    Empty state ada (border dashed)
    □

    Mobile (375px) dites
    □

    prefers-reduced-motion dihormati
    □

    Semua icon button punya aria-label
    □

    Touch target >= 44x44px

============================================================

    CATATAN IMPLEMENTASI
    ============================================================

    Hard shadow murah (no blur) — aman dipakai di mana-mana.

    Tapi tetap batasi: 1 card 1 shadow, jangan dobel.

    Pastel + border tebal = kombinasi yang ramah mata untuk
    sesi baca panjang (cocok untuk app belajar).

    Kontras tinggi = aksesibilitas tinggi (bonus).

    Radius 0 = performa render cepat (gak ada antialiasing).

    Total visual weight tinggi, jadi jangan tambah animasi
    berlebihan. Motion cukup 80-200ms, snappy.

    Untuk HP kentang (seperti Note 2 server): design ini
    justru ringan (no blur, no shadow blur), cocok.

Performa di HP low-end:

    NO backdrop-filter (paling mahal)

    NO box-shadow blur (hard shadow gratis)

    NO gradient kompleks

    Border tebal = murah

    Total: design ini justru salah satu yang paling ringan
    untuk rendering, karena mengandalkan solid color & border.

============================================================
SELESAI
============================================================