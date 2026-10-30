# UI.MD — Design System
# Reference: Material 3 Expressive (Android 17 "Cinnamon Bun")

Dokumen ini adalah panduan visual & design token untuk aplikasi
KaHaDe.JP (Kata Hapalan Dengar Japan). Referensi utama: Material 3
Expressive (Android 17), dengan sentuhan frosted glass dan motion
berbasis fisika.

Referensi flow/UX: app.md
Referensi tech: tech-stack.md
Referensi aturan kerja: rules.md

Prioritas konflik: app.md > ui.md > tech-stack.md

============================================================
1. DESIGN PHILOSOPHY
============================================================

Material 3 Expressive = ekspresif tapi tetap terstruktur.

Prinsip utama:
- FROSTED DEPTH  : panel & modal "melayang" di atas konten dengan
                   blur backdrop (bukan drop shadow tebal)
- BOLD TYPE      : tipografi tebal untuk hierarki, bukan warna
- SPRINGY MOTION : animasi pakai physics (spring), bukan linear
- SOFT SHAPES    : sudut membulat (squircle-ish), hindari tajam
- CONTENT FIRST  : chrome minimal, konten (kosakata) jadi bintang
- TONAL COLOR    : warna aksen dipakai hemat, surface pakai tone
                   netral ber-tint

Yang DIHINDARI:
- Neumorphism (bayangan dalam)
- Flat design polos tanpa depth
- Border tebal di mana-mana
- Gradient warna-warni berlebihan
- Ikon outline tipis (pakai filled/tebal)

============================================================
2. COLOR SYSTEM
============================================================

Pakai MATERIAL 3 TONAL PALETTE. Seed color dipilih: WARM ORANGE
(nuansa Jepang / torii, tapi tetap modern).

## 2A. Light Theme

Token                 | Hex       | Penggunaan
----------------------|-----------|------------------------------
--primary             | #8F4C00   | Aksen utama (tombol, link)
--on-primary          | #FFFFFF   | Teks di atas primary
--primary-container   | #FFDCC2   | Chip aktif, badge
--on-primary-container| #2E1500   | Teks di atas primary-container
--secondary           | #735A45   | Aksen sekunder
--on-secondary        | #FFFFFF   |
--tertiary            | #5B6236   | Aksen tersier (status sukses)
--on-tertiary         | #FFFFFF   |
--error               | #BA1A1A   | Error, gagal generate
--on-error            | #FFFFFF   |
--surface             | #FFF8F5   | Background utama (tinted warm)
--surface-container   | #F5EDE7   | Card, panel
--surface-high        | #EFE6DF   | Elevated surface, modal
--on-surface          | #221A14   | Teks utama
--on-surface-variant  | #52443A   | Teks sekunder, label
--outline             | #857469   | Border
--outline-variant     | #D8C2B8   | Border tipis, divider

## 2B. Dark Theme

Token                 | Hex       | Penggunaan
----------------------|-----------|------------------------------
--primary             | #FFB77C   | Aksen utama (lebih terang)
--on-primary          | #4C2600   |
--primary-container   | #6F3700   |
--on-primary-container| #FFDCC2   |
--secondary           | #E2C0A8   |
--on-secondary        | #412D1C   |
--tertiary            | #C3CB98   |
--on-tertiary         | #2D340B   |
--error               | #FFB4AB   |
--on-error            | #690005   |
--surface             | #1A1209   | Background (dark warm)
--surface-container   | #221A12   |
--surface-high        | #2D241B   |
--on-surface          | #EFE0D5   |
--on-surface-variant  | #D8C2B8   |
--outline             | #A08D82   |
--outline-variant     | #52443A   |

## 2C. Status Colors (khusus app)

Status audio & validasi import:

Status        | Light       | Dark        | Penggunaan
--------------|-------------|-------------|-------------------
pending       | #B58A00     | #FFDA6B     | Audio belum generate (🟡)
ready         | #3A7D44     | #7FD98A     | Audio siap (🟢)
failed        | #BA1A1A     | #FFB4AB     | Audio gagal (🔴)
warning       | #A66B00     | #FFB960     | Baris import warning
error-row     | #FFDAD6     | #5C1200     | Baris import error

## 2D. Aturan Pemakaian Warna

- Aksen (primary) dipakai < 10% screen. Hemat.
- Warna tidak boleh jadi satu-satunya penanda (selalu + ikon/teks).
- Teks di atas surface wajib kontras >= 4.5:1.
- Gradient hanya untuk empty state illustration, bukan UI.

============================================================
3. TYPOGRAPHY
============================================================

Font utama: ROBOTO FLEX (variable weight) atau fallback Roboto.
Font Jepang: NOTO SANS JP (untuk Kanji/Hira/Katakana).

## 3A. Type Scale (Material 3)

Token          | Size  | Weight | Line | Penggunaan
---------------|-------|--------|------|-------------------------
display-large  | 40px  | 700    | 48   | Angka besar dashboard
display-medium | 32px  | 700    | 40   | Total kata di card
headline-large | 28px  | 700    | 36   | H1 halaman
headline-small | 22px  | 600    | 30   | Nama bab di card
title-large    | 20px  | 600    | 28   | Judul modal
title-medium   | 16px  | 600    | 24   | Label section
body-large     | 16px  | 400    | 24   | Teks utama tabel
body-medium    | 14px  | 400    | 20   | Teks sekunder
label-large    | 14px  | 600    | 20   | Tombol, chip
label-medium   | 12px  | 500    | 16   | Badge, meta info

## 3B. Aturan Typography

- Bold (700) HANYA untuk display & headline. Jangan di body.
- Kanji/Hira/Katakana pakai Noto Sans JP, letter-spacing normal.
- Angka di dashboard pakai tabular-nums (biar rata).
- Jangan pakai > 3 ukuran font dalam 1 card.
- Line-height minimal 1.4 untuk keterbacaan.

## 3C. Tailwind Config Hint

```js
fontSize: {
  'display-lg': ['2.5rem',  { lineHeight: '3rem',    fontWeight: '700' }],
  'display-md': ['2rem',    { lineHeight: '2.5rem',  fontWeight: '700' }],
  'headline-lg':['1.75rem', { lineHeight: '2.25rem', fontWeight: '700' }],
  'headline-sm':['1.375rem',{ lineHeight: '1.875rem',fontWeight: '600' }],
  'title-lg':   ['1.25rem', { lineHeight: '1.75rem', fontWeight: '600' }],
  'title-md':   ['1rem',    { lineHeight: '1.5rem',  fontWeight: '600' }],
  'body-lg':    ['1rem',    { lineHeight: '1.5rem',  fontWeight: '400' }],
  'body-md':    ['0.875rem',{ lineHeight: '1.25rem', fontWeight: '400' }],
  'label-lg':   ['0.875rem',{ lineHeight: '1.25rem', fontWeight: '600' }],
  'label-md':   ['0.75rem', { lineHeight: '1rem',    fontWeight: '500' }],
}

============================================================

    SHAPE (RADIUS & SQUIRCLE)
    ============================================================

Material 3 Expressive = sudut lebih membulat & konsisten.
Token	Radius	Penggunaan
--r-xs	4px	Badge kecil, tag
--r-sm	8px	Input kecil, chip
--r-md	12px	Tombol, card kecil
--r-lg	16px	Card utama, panel
--r-xl	24px	Modal, mini player, FAB
--r-2xl	28px	Bottom sheet, container besar
--r-full	9999px	Avatar, chip, icon button bulat

Aturan:

    Tombol besar (primary) pakai --r-full (pil).

    Card pakai --r-lg.

    Modal pakai --r-xl (atap) + --r-none (bawah, jika sheet).

    Jangan campur radius beda dalam satu grup komponen.

============================================================

    ELEVATION & FROSTED GLASS
    ============================================================

5A. Elevation Levels (Material 3)

Level 0: no shadow -> background
Level 1: 0 1px 2px -> card diam
Level 2: 0 2px 6px -> card hover
Level 3: 0 4px 12px -> dropdown, toast
Level 4: 0 8px 24px -> modal, mini player
Level 5: 0 16px 32px -> full-screen dialog
5B. Frosted Glass Surface (kunci visual Android 17)

Dipakai untuk:

    Mini player

    Modal overlay (backdrop)

    Header sticky

    Panel import preview (kalau mau premium)

CSS pattern:
css

.frosted {
  background: rgba(255, 248, 245, 0.72);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .frosted {
    background: rgba(26, 18, 9, 0.72);
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  }
}

Aturan frosted:

    WAJIB punya fallback (bg solid) untuk browser tanpa
    backdrop-filter (Firefox lama, Safari < 15).

    JANGAN taruh teks kecil (< 14px) di atas frosted tipis —
    kontras susah.

    Blur 16–24px. Jangan > 40px (berat GPU).

    Border 1px tipis putih/hitam transparan untuk "tepi kaca".

5C. Layering di App

Layer (dari bawah):

    Surface background

    Card kosakata, stat card

    Sticky header (frosted tipis)

    Mini player (frosted tebal)

    Modal overlay (backdrop blur gelap + content)

    Toast (paling atas, tanpa blur)

============================================================

    MOTION (SPRINGY, BUKAN LINEAR)
    ============================================================

6A. Durasi & Easing
Interaksi	Durasi	Easing
Tap feedback	100ms	ease-out
Hover	150ms	ease-out
Button toggle	200ms	cubic-bezier(0.2, 0, 0, 1) (spring-ish)
Modal open	300ms	cubic-bezier(0.05, 0.7, 0.1, 1)
Modal close	200ms	ease-in
Page transition	250ms	ease-in-out
Play/pause morph	200ms	spring (bounce ringan)
Row appear	200ms	ease-out + translateY 8px
6B. Spring untuk Svelte
js

import { cubicOut } from 'svelte/easing';
import { tweened } from 'svelte/motion';

const height = tweened(0, {
  duration: 300,
  easing: cubicOut, // mendekati spring
});

Untuk efek spring sungguhan, boleh pakai svelte/motion spring:
js

import { spring } from 'svelte/motion';
const scale = spring(1, { stiffness: 0.2, damping: 0.5 });

6C. Aturan Motion

    Semua interaksi WAJIB punya feedback visual (bukan silent).

    Animasi masuk > keluar (masuk 300ms, keluar 200ms).

    Hormati prefers-reduced-motion:
    css

    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        transition-duration: 0.01ms !important;
      }
    }

    Jangan animasi > 400ms untuk interaksi kecil.

    Loading skeleton > spinner (kecuali proses > 5 detik).

============================================================

    COMPONENT SPECS
    ============================================================

7A. Button
Primary (Filled)

    BG: --primary

    Text: --on-primary

    Radius: --r-full

    Padding: 12px 24px (large), 8px 16px (small)

    Font: label-large

    Hover: filter brightness(1.05) + shadow level 1

    Active: scale 0.97

Secondary (Tonal)

    BG: --primary-container

    Text: --on-primary-container

    Sama seperti primary, tanpa shadow

Tertiary (Outlined)

    BG: transparent

    Border: 1px --outline

    Text: --primary

    Hover: bg --primary-container (opacity 0.08)

Icon Button

    Size: 40x40 atau 48x48

    Radius: --r-full

    Hover: bg --on-surface (opacity 0.08)

FAB (Floating Action Button) — untuk "Tambah Kata/Bab"

    Size: 56x56

    Radius: --r-xl (16px, squircle)

    BG: --primary-container

    Icon: --on-primary-container

    Shadow: level 3

    Posisi: fixed bottom-right, di atas mini player

7B. Card (Bab, Stat, Kosakata)

    BG: --surface-container

    Radius: --r-lg (16px)

    Padding: 16px

    Shadow: level 1

    Hover: shadow level 2 + translateY -2px (150ms)

    Border: none (murni shadow)

    Untuk card "aktif dipilih": border 2px --primary

7C. Input Field

    BG: --surface-container

    Border: 1px --outline-variant

    Radius: --r-sm (8px)

    Padding: 12px 16px

    Focus: border 2px --primary + shadow ring

    Error: border 2px --error

    Placeholder: --on-surface-variant (opacity 0.6)

    Font: body-large

7D. Chip / Badge

    Radius: --r-full

    Padding: 4px 12px

    Font: label-medium

    Varian:

        Assist: bg --surface-container, border --outline

        Filter (aktif): bg --primary-container, text --on-primary-container

        Status: bg status color (pending/ready/failed)

7E. Table Kosakata

    Header: bg --surface-container, font label-lg, sticky top

    Row: bg transparent, hover --surface-container/50

    Divider: 1px --outline-variant

    Row aktif (diputar): bg --primary-container (opacity 0.15)

    Padding cell: 12px 16px

    Radii: baris pertama & terakhir ikut --r-lg (rounded corners)

7F. Modal (Import, Konfirmasi)

    Backdrop: rgba(0,0,0,0.4) + backdrop-filter blur(4px)

    Content: --surface-high, radius --r-xl

    Shadow: level 4

    Header: sticky, dengan tombol close (icon button)

    Body: scrollable

    Footer: sticky, dengan button group (Batal / Aksi)

    Animasi: fade backdrop (200ms) + slide-up content (300ms)

7G. Mini Player

    Posisi: fixed bottom

    BG: .frosted (blur 20px)

    Radius: --r-none (flat ke bawah) atau --r-t-xl (rounded top)

    Height: 72px desktop, auto mobile

    Border-top: 1px --outline-variant

    Padding: 12px 16px + env(safe-area-inset-bottom)

    Kontrol: icon button 44x44 (touch target mobile)

    Progress bar: 4px height, radius --r-full

        Track: --outline-variant

        Fill: --primary

7H. Toast

    Posisi: bottom-center (di atas mini player), atau top-right

    BG: --on-surface (dark) untuk light mode, kebalikannya

    Text: --surface

    Radius: --r-md

    Shadow: level 3

    Padding: 12px 20px

    Auto-dismiss: 3 detik

    Animasi: slide up + fade

7I. Empty State

    Ikon besar (64px) di tengah, warna --on-surface-variant

    Judul: headline-small

    Deskripsi: body-medium, --on-surface-variant

    CTA: button primary

    Padding: 48px

    Boleh ada ilustrasi SVG, tapi tanpa warna mencolok

7J. Loading Skeleton

    BG: --surface-container

    Shimmer: gradient dari --surface-container ke --surface-high

    Radius: --r-sm

    Durasi shimmer: 1.5s loop

    Untuk tabel: 5 baris skeleton

============================================================

    SPACING SYSTEM
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
--s-10	40
--s-12	48
--s-16	64

Aturan:

    Padding card: --s-4

    Padding halaman (desktop): --s-8

    Padding halaman (mobile): --s-4

    Gap antar card: --s-3 atau --s-4

    Margin section: --s-6

    Padding button: --s-3 x --s-6

============================================================

    ICONOGRAPHY
    ============================================================

Library: MATERIAL SYMBOLS (variable font)

    Variable font weight: 400–700

    Fill: 0 (outline) untuk pasif, 1 (filled) untuk aktif

    Grade: 0

    Optical size: 24 (default)

Ukuran:

    Small: 16px (inline)

    Medium: 20px (button, chip)

    Large: 24px (nav, header)

    XL: 32px (empty state)

Aturan:

    Pakai filled untuk state aktif (contoh: play button saat playing).

    Pakai outlined untuk state pasif.

    Jangan campur outline & filled dalam satu komponen.

    Semua icon button minimal 40x40 touch target.

Setup:
html

<link rel="stylesheet"
  href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0" />

Varian: Rounded (cocok dengan design expressive).

============================================================

    DARK MODE
    ============================================================

    Aktifkan otomatis via prefers-color-scheme.

    Toggle manual di Settings (localStorage, override OS).

    Semua token punya versi dark (lihat bagian 2B).

    Frosted glass di dark: blur lebih tebal (24px), opacity 0.72.

    Shadow di dark: pakai outline tipis (bukan drop shadow tebal).

Setup Tailwind:
js

// tailwind.config.js
darkMode: 'class', // atau 'media' — pilih class biar bisa toggle manual

============================================================

    ACCESSIBILITY
    ============================================================

WAJIB:

    Kontras teks >= 4.5:1 (normal), 3:1 (large text)

    Touch target minimal 44x44 px

    Semua icon button punya aria-label

    Focus ring visible (2px --primary, offset 2px)

    Modal: trap focus, ESC untuk close

    Form: label eksplisit (bukan cuma placeholder)

    Motion: hormati prefers-reduced-motion

    Toast: aria-live="polite"

    Loading: aria-busy="true"

JANGAN:

    Warna saja sebagai penanda (selalu + ikon/teks)

    Animasi otomatis tanpa stop

    Disable zoom (user-scalable=no)

    Teks < 12px

============================================================

    LAYOUT & GRID
    ============================================================

    Mobile-first (base = mobile).

    Breakpoints Tailwind:

        sm: 640px

        md: 768px

        lg: 1024px

        xl: 1280px

    Max width konten: 1200px (desktop), centered.

    Grid dashboard: 1 kolom (mobile) → 3 kolom (md) untuk stat card.

    Tabel kosakata: horizontal scroll di mobile (sticky kolom kanji).

    Mini player: full-width, konten di dalam max 1200px.

============================================================

    HAL KHUSUS PER HALAMAN
    ============================================================

Dashboard

    Stat card pakai display-large (angka besar).

    Quick action: row button chip.

    Card bab terakhir: pakai card spec + progress bar audio.

Halaman Bab

    Card bab: grid 1 kolom (mobile) → 2 kolom (md) → 3 (lg).

    FAB "Tambah Bab" di bottom-right (mobile) atau toolbar (desktop).

Detail Bab (Tabel)

    Sticky header tabel.

    Kolom kanji/hira pakai font Noto Sans JP.

    Kolom audio: icon status + tombol play mini (icon button).

    Row aktif (sedang diputar): bg --primary-container 15%.

Kanji Page

    Dropdown pilih bab: pakai chip filter, bukan select native (biar expressive).

    Tabel lebih ringkas (3 kolom: kanji, hira, arti).

Settings

    Section pakai card, satu setting per baris.

    Toggle pakai switch (Material switch style).

    Voice picker: dropdown custom dengan preview button.

Import Modal

    Backdrop frosted.

    Preview tabel: pakai warna status (kuning/merah) untuk baris warning/error.

    Checkbox: pakai Material checkbox custom (bukan native).

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
        primary:     { DEFAULT: '#8F4C00', fg: '#FFFFFF' },
        'primary-container': { DEFAULT: '#FFDCC2', fg: '#2E1500' },
        secondary:   { DEFAULT: '#735A45', fg: '#FFFFFF' },
        tertiary:    { DEFAULT: '#5B6236', fg: '#FFFFFF' },
        error:       { DEFAULT: '#BA1A1A', fg: '#FFFFFF' },
        surface:     { DEFAULT: '#FFF8F5', container: '#F5EDE7', high: '#EFE6DF' },
        'on-surface':{ DEFAULT: '#221A14', variant: '#52443A' },
        outline:     { DEFAULT: '#857469', variant: '#D8C2B8' },
        status: {
          pending: '#B58A00',
          ready:   '#3A7D44',
          failed:  '#BA1A1A',
        },
      },
      borderRadius: {
        'xs': '4px',
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '24px',
        '2xl': '28px',
      },
      fontFamily: {
        sans: ['Roboto Flex', 'Roboto', 'system-ui', 'sans-serif'],
        jp:   ['Noto Sans JP', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'level-1': '0 1px 2px rgba(0,0,0,0.06)',
        'level-2': '0 2px 6px rgba(0,0,0,0.08)',
        'level-3': '0 4px 12px rgba(0,0,0,0.12)',
        'level-4': '0 8px 24px rgba(0,0,0,0.16)',
        'level-5': '0 16px 32px rgba(0,0,0,0.20)',
      },
      backdropBlur: {
        'glass': '20px',
      },
    },
  },
}

============================================================

    CONTOH KOMPONEN (TAILWIND)
    ============================================================

Primary Button
html

<button class="
  bg-primary text-white
  rounded-full px-6 py-3
  font-label-lg
  shadow-level-1 hover:shadow-level-2
  transition-all duration-150
  active:scale-95
">
  Generate Audio
</button>

Card Bab
html

<div class="
  bg-surface-container rounded-lg p-4
  shadow-level-1 hover:shadow-level-2
  transition-all duration-150
  hover:-translate-y-0.5
">
  <h3 class="text-headline-sm text-on-surface">Bab 3 - Kata Kerja</h3>
  <p class="text-body-md text-on-surface-variant">40 kata · 30/40 audio</p>
</div>

Mini Player (Frosted)
html

<div class="
  fixed bottom-0 inset-x-0 z-50
  backdrop-blur-glass
  bg-surface/70 border-t border-outline-variant
  p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]
">
  <!-- konten player -->
</div>

Status Badge (Audio)
html

<span class="
  inline-flex items-center gap-1
  px-2 py-1 rounded-full text-label-md
  bg-status-ready/15 text-status-ready
">
  ● Ready
</span>
