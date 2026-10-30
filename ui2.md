# UI2.MD — Design System
# Reference: Liquid Glass (iOS 26 / macOS 26-27 "Tahoe")

Dokumen ini adalah panduan visual & design token alternatif untuk
aplikasi KaHaDe JP. Referensi utama: Apple Human Interface Guidelines
Liquid Glass (WWDC 2025, shipped 2026).

Referensi flow/UX: app.md
Referensi tech: tech-stack.md
Referensi aturan kerja: rules.md
Design system alternatif: ui.md (Material 3 Expressive)

Prioritas konflik: app.md > ui2.md > tech-stack.md

============================================================
1. DESIGN PHILOSOPHY
============================================================

Liquid Glass = meta-material dinamis, bukan sekadar "frosted glass".

Prinsip utama (dari Apple HIG):
- HIERARCHY      : Kontrol melayang di atas konten. Kaca memisahkan
                   navigasi dari konten, bukan menyatukannya.
- HARMONY        : Geometri software selaras dengan hardware.
                   Concentric corner radii (sudut bertingkat).
- CONSISTENCY    : Adaptif lintas ukuran window, bukan redesign
                   per breakpoint.

Karakter material:
- LENSING        : Membiaskan (bend) konten di belakangnya, bukan
                   cuma blur. Ini yang membedakan dari glassmorphism.
- SPECULAR       : Highlight tajam di tepi atas, seperti cahaya
                   menyentuh permukaan kaca.
- ADAPTIVE       : Warna kaca menyesuaikan konten di belakang &
                   mode terang/gelap.
- FLUID          : Merespons sentuhan (press scale, glow).

ATURAN PALING PENTING:
- KACA HANYA UNTUK LAPISAN KONTROL/NAVIGASI.
- JANGAN pakai efek kaca untuk konten (tabel, card kosakata, list).
- Konten tetap di permukaan solid/standar.
- JANGAN stack kaca di atas kaca (glass-on-glass).

Yang DIHINDARI:
- Glassmorphism polos (blur + transparan + border) — itu bukan
  Liquid Glass, itu cuma "kaca buram".
- Efek kaca di lebih dari 20% layar.
- Kaca di atas konten yang teksnya kecil (< 14px).

============================================================
2. COLOR SYSTEM
============================================================

Liquid Glass menggunakan SISTEM WARNA SEMANTIK Apple, bukan hex
hardcoded. Ini wajib untuk mendukung Light/Dark/High Contrast
secara otomatis.

## 2A. Semantic Colors (Light)

Token                 | Nilai (approx) | Penggunaan
----------------------|----------------|------------------------------
--label               | #000000        | Teks utama
--secondary-label     | rgba(0,0,0,.6) | Teks sekunder
--tertiary-label      | rgba(0,0,0,.3) | Placeholder, caption
--system-blue         | #007AFF        | Aksen utama (link, tombol)
--system-red          | #FF3B30        | Error, hapus
--system-green        | #34C759        | Sukses, audio ready
--system-orange       | #FF9500        | Warning, audio pending
--system-gray         | #8E8E93        | Disabled, divider
--background          | #FFFFFF        | Background konten
--secondary-bg        | #F2F2F7        | Background grup
--separator           | rgba(60,60,67,.29)| Divider

## 2B. Semantic Colors (Dark)

Token                 | Nilai (approx) | Penggunaan
----------------------|----------------|------------------------------
--label               | #FFFFFF        |
--secondary-label     | rgba(255,255,255,.6)|
--tertiary-label      | rgba(255,255,255,.3)|
--system-blue         | #0A84FF        |
--system-red          | #FF453A        |
--system-green        | #30D158        |
--system-orange       | #FF9F0A        |
--system-gray         | #636366        |
--background          | #000000        |
--secondary-bg        | #1C1C1E        |
--separator           | rgba(84,84,88,.6)|

## 2C. Tint untuk Liquid Glass

Kaca Liquid Glass tidak punya warna sendiri. Warna datang dari:
1. Konten di belakangnya (otomatis, via backdrop-filter)
2. Tint layer tipis (opsional, untuk brand)

Untuk KaHaDe JP, tint layer pakai aksen hangat tipis:
- Light : rgba(255, 149, 0, 0.04)  — warm orange sangat tipis
- Dark  : rgba(255, 159, 10, 0.06)

JANGAN pakai tint tebal. Tint harus < 8% opacity.

## 2D. Aturan Pemakaian Warna

- Warna aksen (system-blue/orange) dipakai < 10% screen.
- Selalu sediakan fallback solid untuk mode "Reduce Transparency".
- Warna TIDAK BOLEH jadi satu-satunya penanda (selalu + ikon/teks).
- Kontras teks minimal 4.5:1 terhadap background efektif (setelah
  blur). Ini sulit — uji manual!

============================================================
3. TYPOGRAPHY
============================================================

Font utama: SF PRO (San Francisco) — standar Apple.
Fallback web: -apple-system, BlinkMacSystemFont, "Segoe UI",
Roboto, sans-serif.
Font Jepang: Noto Sans JP (untuk Kanji/Hira/Katakana).

## 3A. Type Scale (mendekati Apple Text Styles)

Style          | Size  | Weight | Line | Penggunaan
---------------|-------|--------|------|-------------------------
Large Title    | 34px  | 700    | 41   | Judul halaman utama
Title 1        | 28px  | 700    | 34   | H1 halaman
Title 2        | 22px  | 700    | 28   | Nama bab di card
Title 3        | 20px  | 600    | 25   | Judul modal
Headline       | 17px  | 600    | 22   | Label section, tombol
Body           | 17px  | 400    | 22   | Teks utama tabel
Callout        | 16px  | 400    | 21   | Teks sekunder
Subhead        | 15px  | 400    | 20   | Meta info
Footnote       | 13px  | 400    | 18   | Caption, timestamp
Caption 2      | 11px  | 400    | 13   | Badge kecil

## 3B. Aturan Typography

- Wajib mendukung Dynamic Type (minimal scale sampai 200%).
- Kanji/Hira/Katakana pakai Noto Sans JP, letter-spacing normal.
- Angka dashboard pakai tabular-nums.
- Jangan pakai > 3 ukuran font dalam 1 card.
- Di atas kaca, teks WAJIB punya text-shadow tipis atau
  background solid semi-transparan di belakangnya (legibility!).

## 3C. Tailwind Config Hint

```js
fontSize: {
  'large-title': ['2.125rem', { lineHeight: '2.5625rem', fontWeight: '700' }],
  'title-1':     ['1.75rem',  { lineHeight: '2.125rem',  fontWeight: '700' }],
  'title-2':     ['1.375rem', { lineHeight: '1.75rem',   fontWeight: '700' }],
  'title-3':     ['1.25rem',  { lineHeight: '1.5625rem', fontWeight: '600' }],
  'headline':    ['1.0625rem',{ lineHeight: '1.375rem',  fontWeight: '600' }],
  'body':        ['1.0625rem',{ lineHeight: '1.375rem',  fontWeight: '400' }],
  'callout':     ['1rem',     { lineHeight: '1.3125rem', fontWeight: '400' }],
  'subhead':     ['0.9375rem',{ lineHeight: '1.25rem',   fontWeight: '400' }],
  'footnote':    ['0.8125rem',{ lineHeight: '1.125rem',  fontWeight: '400' }],
  'caption-2':   ['0.6875rem',{ lineHeight: '0.8125rem', fontWeight: '400' }],
}

============================================================

    SHAPE (CONCENTRIC RADIUS)
    ============================================================

Apple menggunakan CONCENTRIC CORNER RADII: sudut elemen bersarang
berbagi pusat yang sama, sehingga radius "turun" secara konsisten
ke arah sudut layar.
Token	Radius	Penggunaan
--r-xs	4px	Badge kecil, tag
--r-sm	8px	Input kecil, chip
--r-md	12px	Tombol, kontrol
--r-lg	16px	Card, panel
--r-xl	20px	Modal, mini player
--r-2xl	28px	Bottom sheet, container besar
--r-capsule	9999px	Tombol capsule, tab bar item

Aturan concentric:

    Elemen di dalam card radius 16px → radius anak = 16 - padding.
    Contoh: card radius 16, padding 8 → anak radius 8.

    Jangan campur radius beda dalam satu grup komponen.

    Tombol utama pakai capsule (9999px), bukan rounded biasa.

============================================================

    LIQUID GLASS MATERIAL SPEC
    ============================================================

5A. Dua Varian Material Apple

    REGULAR (default)

        Adaptif, paling legible.

        Untuk hampir semua hal: toolbar, tab bar, tombol,
        floating control, mini player.

        Blur lebih tebal, tint lebih kuat.

    CLEAR

        Lebih transparan, visual rich.

        HANYA untuk: kontrol playback di atas media/video,
        dengan syarat teks bold & bright, shape sederhana.

        Untuk KaHaDe JP: JANGAN pakai clear. Pakai regular.

5B. CSS Implementation (Web)
Level 1: Frosted Glass (semua browser) — WAJIB sebagai baseline
css

.glass-regular {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(18px) saturate(1.6);
  -webkit-backdrop-filter: blur(18px) saturate(1.6);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 20px;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.25),  /* specular atas */
    inset 0 -1px 0 rgba(255, 255, 255, 0.06),
    0 8px 32px rgba(0, 0, 0, 0.35);
}

Level 2: Refraction (Chromium-only, optional)

Refraction asli butuh backdrop-filter: url(#filter) dengan
feDisplacementMap. Ini HANYA jalan di Chrome/Edge.
html

<svg width="0" height="0" aria-hidden="true">
  <filter id="liquid-lens">
    <feTurbulence type="fractalNoise"
                  baseFrequency="0.008"
                  numOctaves="2"
                  result="noise" />
    <feDisplacementMap in="SourceGraphic" in2="noise"
                       scale="42"
                       xChannelSelector="R"
                       yChannelSelector="G" />
  </filter>
</svg>

css

@supports (backdrop-filter: url(#liquid-lens)) {
  .glass-refraction {
    backdrop-filter: blur(4px) url(#liquid-lens);
  }
}

Fallback: kalau @supports gagal, tetap pakai .glass-regular.
Level 3: Specular Edge (kunci visual "kaca")

Yang bikin panel terlihat seperti kaca (bukan plastik transparan)
adalah garis highlight tipis di tepi atas:
css

inset 0 1.5px 0 rgba(255, 255, 255, 0.85)

Ini satu-satunya trik CSS yang paling berdampak. Jangan skip.
5C. Aturan Pemakaian Glass

    Maksimal 20% area layar.

    HANYA untuk: header sticky, mini player, modal, toast,
    floating action button, bottom sheet.

    JANGAN untuk: card kosakata, tabel, list item, input field.

    JANGAN stack glass di atas glass.

    Selalu sediakan fallback solid untuk prefers-reduced-transparency.

5D. Interactive Glass (respons sentuhan)

Apple menyebut kaca "interactive": press scale, glow, shimmer.
Implementasi web sederhana:
css

.glass-interactive {
  transition: transform 200ms cubic-bezier(0.2, 0, 0, 1),
              box-shadow 200ms ease;
}
.glass-interactive:active {
  transform: scale(0.97);
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.4),
    0 0 20px rgba(255, 149, 0, 0.15); /* glow tipis */
}

============================================================

    ELEVATION & LAYERING
    ============================================================

Liquid Glass TIDAK pakai drop shadow tebal. Elevation dicapai
lewat:

    Blur & tint (kaca di atas konten)

    Specular edge (highlight tepi)

    Adaptive shadow (shadow tipis, alpha menyesuaikan kontras)

6A. Layer Stack (dari bawah)

    Background konten (solid/standar)

    Card kosakata, stat card (solid, BUKAN kaca)

    Header sticky (kaca regular)

    Mini player (kaca regular, paling tebal)

    Modal overlay (backdrop blur gelap + content solid)

    Toast (solid, tanpa blur)

6B. Shadow untuk Kaca
css

.glass-shadow {
  box-shadow:
    0 4px 16px rgba(0, 0, 0, 0.12),
    0 1px 3px rgba(0, 0, 0, 0.08);
}

Dark mode: kurangi alpha shadow, tambah border tipis terang.

============================================================

    MOTION
    ============================================================

Apple Motion = halus, fisik, tidak berlebihan.
Interaksi	Durasi	Easing
Tap feedback	100ms	ease-out
Hover	150ms	ease-out
Button toggle	200ms	cubic-bezier(0.2, 0, 0, 1)
Modal open	350ms	cubic-bezier(0.32, 0.72, 0, 1)
Modal close	250ms	ease-in
Page transition	300ms	ease-in-out
Glass press	200ms	cubic-bezier(0.2, 0, 0, 1)

Aturan:

    Animasi masuk > keluar.

    WAJIB hormati prefers-reduced-motion.

    Jangan animasi > 400ms untuk interaksi kecil.

    Glass interactive: press scale 0.97, bukan 0.9 (terlalu agresif).

============================================================

    COMPONENT SPECS
    ============================================================

8A. Button
Filled (Primary)

    BG: --system-blue

    Text: #FFFFFF

    Radius: capsule (9999px)

    Padding: 12px 20px

    Font: headline (17px, 600)

    Active: opacity 0.8

Tinted (Secondary)

    BG: --system-blue dengan opacity 0.15

    Text: --system-blue

    Radius: capsule

    Sama seperti filled, tanpa solid

Gray (Tertiary)

    BG: --secondary-bg

    Text: --label

    Radius: capsule

Plain (Text Only)

    BG: transparent

    Text: --system-blue

    Tanpa padding horizontal besar

Glass Button (Floating)

    BG: .glass-regular

    Text: --label

    Radius: capsule

    Shadow: glass-shadow

    Active: scale 0.97

8B. Card (Konten — BUKAN Kaca)

    BG: --background (light) / --secondary-bg (dark)

    Radius: --r-lg (16px)

    Padding: 16px

    Shadow: tipis (0 1px 3px rgba(0,0,0,0.08))

    Border: 0.5px --separator

    Hover: shadow sedikit naik (150ms)

    JANGAN pakai backdrop-filter di card konten!

8C. Input Field

    BG: --secondary-bg

    Border: 1px --separator

    Radius: --r-md (12px)

    Padding: 12px 16px

    Focus: border 2px --system-blue + shadow ring tipis

    Error: border 2px --system-red

    Font: body (17px)

8D. Chip / Badge

    Radius: capsule

    Padding: 6px 12px

    Font: subhead (15px, 500)

    Varian:

        Default: BG --secondary-bg, text --label

        Selected: BG --system-blue, text white

        Status ready: BG system-green/15, text system-green

        Status pending: BG system-orange/15, text system-orange

        Status failed: BG system-red/15, text system-red

8E. Table Kosakata (Konten — SOLID)

    Header: BG --secondary-bg, font headline (17px, 600), sticky

    Row: BG --background, hover --secondary-bg/50

    Divider: 0.5px --separator

    Row aktif (diputar): BG --system-blue/10

    Padding cell: 12px 16px

    JANGAN pakai efek kaca di tabel!

8F. Modal

    Backdrop: rgba(0,0,0,0.4) + backdrop-filter blur(8px)

    Content: --background (solid, BUKAN kaca)

    Radius: --r-xl (20px)

    Shadow: besar tapi halus

    Header: sticky, tombol close (icon button capsule)

    Footer: sticky, button group (Batal / Aksi)

    Animasi: fade backdrop + slide-up content (350ms)

8G. Mini Player (Kaca — ini yang paling penting)

    Posisi: fixed bottom

    BG: .glass-regular (blur 20px, saturate 1.8)

    Radius: --r-none (flat) atau --r-t-xl (rounded top)

    Height: 64px desktop, auto mobile

    Border-top: 1px rgba(255,255,255,0.12)

    Shadow: glass-shadow + specular atas

    Padding: 10px 16px + env(safe-area-inset-bottom)

    Kontrol: icon button 44x44 (touch target)

    Progress bar: 3px, radius capsule

        Track: rgba(255,255,255,0.2)

        Fill: --system-blue

8H. Toast

    Posisi: bottom-center (di atas mini player)

    BG: rgba(0,0,0,0.85) (light mode) / rgba(255,255,255,0.9) (dark)

    Text: putih / hitam

    Radius: --r-md (12px)

    Shadow: tipis

    Auto-dismiss: 3 detik

    Animasi: slide up + fade

8I. Empty State

    Ikon besar (64px) di tengah, warna --tertiary-label

    Judul: Title 2

    Deskripsi: body, --secondary-label

    CTA: Filled button

    Padding: 48px

8J. Loading Skeleton

    BG: --secondary-bg

    Shimmer: gradient dari --secondary-bg ke --tertiary-bg

    Radius: --r-sm (8px)

    Durasi shimmer: 1.5s loop

============================================================

    SPACING SYSTEM
    ============================================================

Apple menggunakan 8pt grid.
Base unit: 8px. Semua spacing kelipatan 8.
Token	px
--s-1	4 (half-step, untuk micro spacing)
--s-2	8
--s-3	12
--s-4	16
--s-5	20
--s-6	24
--s-8	32
--s-10	40
--s-12	48

Aturan:

    Margin halaman: 16px (mobile), 24px (desktop)

    Padding card: 16px

    Gap antar card: 12px atau 16px

    Tap target minimal 44x44px

============================================================

    ICONOGRAPHY
    ============================================================

Library: SF SYMBOLS (via sf-symbols web font atau SVG manual)
Fallback: Material Symbols Rounded (mirip secara visual).

Aturan:

    Gunakan SF Symbols asli jika memungkinkan (via SVG export).

    Fill: outline untuk pasif, filled untuk aktif.

    Ukuran: 16px (inline), 20px (button), 24px (nav), 32px (empty).

    Icon button minimal 44x44px touch target.

    Jangan campur style outline & filled dalam satu grup.

============================================================

    DARK MODE
    ============================================================

    Aktifkan otomatis via prefers-color-scheme.

    Toggle manual di Settings (localStorage, override OS).

    Semua token punya versi dark (lihat bagian 2B).

    Glass di dark: blur lebih tebal (20px), tint lebih kuat.

    Shadow di dark: kurangi alpha, tambah border tipis terang.

============================================================

    ACCESSIBILITY (KRITIS UNTUK LIQUID GLASS)
    ============================================================

Liquid Glass secara inheren menurunkan kontras. Apple sendiri
beberapa kali merevisi desainnya karena masalah ini.
Karena itu, aksesibilitas WAJIB, bukan opsional.

WAJIB:

    Kontras teks >= 4.5:1 terhadap background efektif (setelah blur).
    Uji manual dengan alat kontras!

    Touch target minimal 44x44 px.

    Semua icon button punya aria-label.

    Focus ring visible (2px --system-blue, offset 2px).

    Modal: trap focus, ESC untuk close.

    Form: label eksplisit (bukan cuma placeholder).

    Motion: hormati prefers-reduced-motion.

    Toast: aria-live="polite".

    Loading: aria-busy="true".

WAJIB untuk kaca:

    Hormati prefers-reduced-transparency:
    css

    @media (prefers-reduced-transparency: reduce) {
      .glass-regular {
        background: #1C1C1E !important; /* solid */
        backdrop-filter: none !important;
        border: 1px solid rgba(255,255,255,0.1);
      }
    }

    Hormati prefers-contrast: more → naikkan opacity tint,
    kurangi blur, tambah border.

    JANGAN taruh teks kecil (< 14px) langsung di atas kaca
    tanpa text-shadow atau scrim.

JANGAN:

    Warna saja sebagai penanda (selalu + ikon/teks).

    Animasi otomatis tanpa stop.

    Disable zoom.

    Teks < 11px.

============================================================

    LAYOUT & GRID
    ============================================================

    Mobile-first.

    Breakpoints Tailwind:

        sm: 640px

        md: 768px

        lg: 1024px

        xl: 1280px

    Max width konten: 1200px (desktop), centered.

    Grid dashboard: 1 kolom (mobile) → 3 kolom (md).

    Tabel kosakata: horizontal scroll di mobile (sticky kanji).

    Mini player: full-width, konten di dalam max 1200px.

============================================================

    HAL KHUSUS PER HALAMAN
    ============================================================

Dashboard

    Stat card: SOLID (bukan kaca), radius 16px.

    Quick action: Filled button capsule.

    Card bab terakhir: SOLID.

Halaman Bab

    Card bab: SOLID.

    FAB "Tambah Bab": Glass button (satu-satunya kaca di sini).

    Header: Glass sticky (blur tipis).

Detail Bab (Tabel)

    Header tabel: SOLID, sticky.

    Kolom kanji/hira: font Noto Sans JP.

    Row aktif: BG --system-blue/10.

    Toolbar atas: Glass sticky (blur tipis).

Kanji Page

    Dropdown pilih bab: chip filter capsule (SOLID).

    Tabel: SOLID.

Settings

    Section pakai card SOLID.

    Toggle pakai iOS-style switch.

    Voice picker: dropdown custom dengan preview button.

Import Modal

    Backdrop: frosted gelap (blur 8px).

    Content: SOLID (--background).

    Preview tabel: SOLID, warna status untuk warning/error.

    Checkbox: iOS-style custom checkbox.

Mini Player

    INI yang pakai kaca paling tebal.

    Blur 20px, saturate 1.8.

    Specular edge atas.

    Safe area bottom.

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
        label:          'var(--label)',
        'secondary-label': 'var(--secondary-label)',
        'tertiary-label':  'var(--tertiary-label)',
        'system-blue':  'var(--system-blue)',
        'system-red':   'var(--system-red)',
        'system-green': 'var(--system-green)',
        'system-orange':'var(--system-orange)',
        'system-gray':  'var(--system-gray)',
        background:     'var(--background)',
        'secondary-bg': 'var(--secondary-bg)',
        separator:      'var(--separator)',
      },
      borderRadius: {
        'xs': '4px',
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '20px',
        '2xl':'28px',
        'capsule': '9999px',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro',
               'Segoe UI', 'Roboto', 'sans-serif'],
        jp:   ['Noto Sans JP', 'system-ui', 'sans-serif'],
      },
      backdropBlur: {
        'glass-light': '12px',
        'glass':       '18px',
        'glass-heavy': '20px',
      },
      spacing: {
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '8': '32px',
        '10':'40px',
        '12':'48px',
      },
    },
  },
}

============================================================

    CONTOH KOMPONEN (TAILWIND)
    ============================================================

Filled Button (Capsule)
html

<button class="
  bg-system-blue text-white
  rounded-capsule px-5 py-3
  font-headline
  active:opacity-80
  transition-opacity duration-150
">
  Generate Audio
</button>

Glass Mini Player
html

<div class="
  fixed bottom-0 inset-x-0 z-50
  rounded-t-xl
  backdrop-blur-glass-heavy
  bg-white/10 dark:bg-black/30
  border-t border-white/20
  shadow-[0_4px_16px_rgba(0,0,0,0.12)]
  p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]
">
  <!-- konten player -->
</div>

Specular Edge (CSS)
css

.glass-specular {
  box-shadow:
    inset 0 1.5px 0 rgba(255,255,255,0.85),
    0 4px 16px rgba(0,0,0,0.12);
}

Status Badge (Audio)
html

<span class="
  inline-flex items-center gap-1
  px-3 py-1.5 rounded-capsule
  text-subhead
  bg-system-green/15 text-system-green
">
  ● Ready
</span>

============================================================

    CHECKLIST SEBELUM SELESAI HALAMAN
    ============================================================

    □

    Semua warna dari token semantik (gak ada hex random)
    □

    Semua spacing kelipatan 8 (kecuali micro 4px)
    □

    Efek kaca HANYA di navigasi/kontrol, BUKAN konten
    □

    Glass tidak di-stack (tidak ada glass-on-glass)
    □

    Specular edge ada di setiap panel kaca
    □

    Fallback solid untuk prefers-reduced-transparency
    □

    Kontras teks di atas kaca diuji manual (>= 4.5:1)
    □

    Focus ring visible (keyboard navigation)
    □

    Loading state ada
    □

    Error state ada
    □

    Empty state ada
    □

    Dark mode dites
    □

    Mobile (375px) dites
    □

    prefers-reduced-motion dihormati
    □

    Semua icon button punya aria-label
    □

    Touch target >= 44x44px

============================================================

    CATATAN IMPLEMENTASI WEB
    ============================================================

    Liquid Glass asli adalah SIMULASI optik, bukan CSS preset.
    Web hanya bisa mendekati. Jangan buang waktu mengejar
    pixel-perfect parity.

    Refraction (feDisplacementMap) hanya Chromium. Safari/Firefox
    fallback ke blur. Ini OK — Apple sendiri tidak publish
    spesifikasi blur/IOR.

    Performa: backdrop-filter itu mahal. Jangan pakai di banyak
    elemen sekaligus. Batasi ke 3-5 surface glass per layar.

    Untuk mini player yang selalu terlihat, pastikan blur tidak
    menghalangi konten di belakangnya secara berlebihan.

    Selalu sediakan mode "solid" (tanpa blur) untuk perangkat
    low-end. Deteksi via navigator.hardwareConcurrency atau
    toggle manual di Settings.

============================================================
SELESAI
============================================================