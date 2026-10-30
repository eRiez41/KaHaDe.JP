# Histori Pengerjaan — Menu Perubahan Kata

Terakhir diperbarui: 30 Oktober 2026

## Ringkasan

Seluruh 15 item roadmap di menu **Perubahan Kata** sudah aktif dan dapat dipakai. Dua modul lama (`ます → て`, `ます → ない`) tetap dipertahankan, sedangkan 13 modul lain dibangun di atas satu mesin konjugasi bersama. Menu Kanji juga sudah dirapikan dan tidak terganggu oleh perubahan ini.

Semua input divalidasi ke kamus backend (`/api/lookup`). Kata yang tidak ada di kamus ditolak dengan pesan yang jelas, dan setiap bentuk yang ditampilkan punya arti Indonesianya sendiri (bukan satu arti untuk semua baris).

Status akhir:

- `npm run build` lolos.
- Uji matriks konjugasi: 0 kegagalan (lebih dari 100 kombinasi kata × modul).
- Uji UI end-to-end: 28 kasus sukses + 5 kasus penolakan, 0 kegagalan, 0 error console.
- Backend, Vite, dan ngrok berjalan normal.

## Status Roadmap

| # | Modul | Bab | Status | Hasil utama |
|---|-------|-----|--------|-------------|
| 1 | ます ⇄ 辞書形 | 9 & 14 | Aktif | Bolak-balik bentuk kamus ↔ ます (arah terdeteksi otomatis) |
| 2 | Adjektiva-i | 8 & 12 | Aktif | くて / かった / くない / く / ければ / そう / すぎる |
| 3 | Adjektiva-na | 8 & 12 | Aktif | で / だった / じゃない / な / に / なら / そう / すぎる |
| 4 | ます → て | 14 | Aktif | て形 + variasi sopan |
| 5 | ます → ない | 17 | Aktif | ない形 + variasi sopan |
| 6 | ます → た | 19 | Aktif | た形 (lampau biasa) |
| 7 | ます → 条件形 (~たら) | 25 | Aktif | たら / なかったら |
| 8 | ます → 可能形 | 27 | Aktif | 可能形 (bisa melakukan) |
| 9 | ます → 意向形 | 31 | Aktif | 意向形 (mari / akan) |
| 10 | ます → 命令形 | 33 | Aktif | 命令形 |
| 11 | ます → 条件形 (~えば) | 35 | Aktif | えば / なければ |
| 12 | ます → 受身形 | 37 | Aktif | 受身形 (pasif) + negatif/lampau/sopan |
| 13 | ます → 使役形 | 48 | Aktif | 使役形 (menyuruh) + bentuk singkat Godan |
| 14 | ます → 使役受身形 | 48 | Aktif | 使役受身 (disuruh) + bentuk singkat Godan |
| 15 | ます → 敬語 | 49–50 | Aktif | Sonkeigo, kenjougo, dan permintaan hormat |

## Yang Dikerjakan

### 1. Mesin konjugasi bersama

Daripada menulis analyzer baru untuk setiap modul, konjugasi verba disatukan di `src/lib/conjugation/`:

- `masuBase.js` — membaca input (romaji/hiragana/katakana/kanji), menentukan stem ます dan golongan verba (Godan / Ichidan / Irregular), termasuk pengecualian seperti 帰る, 入る, 走る, 切る, 知る.
- `verbForms.js` — tabel bentuk lengkap untuk semua modul (termasuk ある dan verba する), ditambah pasangan sonkeigo/kenjougo tidak beraturan.
- `verbBuild.js` — menyusun hasil akhir: bentuk utama, daftar bentuk, pola umum, catatan, dan arti per bentuk.
- `verbModulesA.js` / `verbModulesB.js` — metadata dan materi penjelasan tiap modul (dipisah agar tiap file tetap di bawah batas ukuran).
- `keigo.js` — tabel pasangan sonkeigo/kenjougo khusus (行く, 来る, いる, 食べる, 飲む, 見る, 言う, 聞く, 会う, 知る, 思う, 読む, もらう, する, ある).
- `validateVerbModule.js` — validasi ke kamus backend + deteksi kata benda + する.

Karena satu mesin dipakai bersama, perbaikan aturan otomatis berlaku untuk semua modul verba.

### 2. Modul verba baru (10 modul)

`masu-ta`, `masu-tara`, `masu-kanou`, `masu-ishou`, `masu-meirei`, `masu-eba`, `masu-ukemi`, `masu-shieki`, `masu-shiekiukemi`, dan `masu-keigo`.

Setiap modul menampilkan:

- bentuk utama (di-highlight),
- bentuk negatif, lampau, dan sopan bila relevan,
- arti Indonesia per bentuk (mis. `のませられる` → “disuruh minum”),
- pola umum dan catatan aturan,
- label golongan verba dan penanda pengecualian.

### 3. Modul kamus dua arah

`masu-jisho` memakai `dictionaryVerb.js` + `jisho.js`:

- Input berakhiran ます → bentuk kamus.
- Input bentuk kamus → bentuk ます.
- Arah ditentukan dari akhiran input, bukan dari tebakan pengguna.
- Klasifikasi Godan/Ichidan untuk arah kamus → ます memakai `partsOfSpeech` dari backend, sehingga 帰る dan 変える tidak tertukar.

### 4. Modul adjektiva

`adjectives.js`, `validateAdjective.js`, dan `adjectiveModules.js` menangani:

- Adjektiva-i: くない, かった, くなかった, くて, く, ければ, そう, すぎる.
- Adjektiva-na: じゃない, だった, じゃなかった, で, な, に, なら, そう, すぎる.
- いい / かっこいい memakai stem よ- (よくない, よかった, かっこよさそう), sedangkan かわいい tetap teratur.
- Input `だ` / `です` pada adjektiva-na boleh disertakan atau tidak.
- Validasi kelas kata memakai backend (`I-adjective`, `Na-adjective`), dengan pengecualian eksplisit seperti 大変 yang di kamus ditandai adverb.

### 5. Arti per bentuk dan koreksi arti menyesatkan

- `fixVerbMeaning` menyatukan koreksi arti untuk ある, くる/来る, dan いる/居る.
- Override adjektiva: 元気 → sehat, 静か → tenang, 便利 → praktis, 好き → suka, 嫌い → benci, 下手 → lemah, 大丈夫 → baik-baik saja, 大変 → berat, いい → bagus, かっこいい → keren, かわいい → lucu.
- Hanya arti pertama/utama kamus yang ditampilkan, sesuai permintaan.
- Glos pasif memakai fallback “bentuk pasif dari …” agar tidak menghasilkan kalimat aneh seperti “mengalami ada”.

### 6. UI

- `VerbFormExplanation.svelte` — kartu penjelasan generik (collapsible) untuk modul baru.
- `VerbFormResult.svelte` — kartu hasil generik: input → hasil, arti utama, kelas kata, penjelasan, daftar bentuk lengkap, pola umum, catatan.
- `ubahKataModules.js` — satu registry untuk ke-15 modul; `UbahKataDetail.svelte` tinggal memanggil registry.
- `UbahKata.svelte` — semua kartu roadmap berstatus **Aktif**.
- `App.svelte` — semua ID modul terdaftar di `UB_KATA_SUBS`.
- Navigasi antar modul memakai key per sub-route sehingga hasil modul sebelumnya tidak tertinggal.
- **Splash screen pembuka** di `index.html`: logo + animasi bar singkat yang memudar setelah aplikasi siap (menghormati `prefers-reduced-motion`).
- **Tabel subab mengikuti baris yang sedang diputar.** Saat Play All berjalan, tabel otomatis menggulir agar baris aktif tetap terlihat. Hanya area tabel yang bergulir (bukan halaman), posisi sticky header diperhitungkan, dan animasi dimatikan bila `prefers-reduced-motion` aktif. Helper-nya ada di `frontend/src/lib/scroll-active-row.js`.
- **Tulisan “Lewati ke konten” tidak lagi berkedip saat reload.** Penyebabnya adalah tautan skip-to-content tampil tanpa gaya sebelum Tailwind dimuat. Sekarang gayanya ditulis inline di `index.html` sehingga tetap tersembunyi, dan hanya muncul saat difokuskan dengan keyboard.

### 7. Kanji dan backend

- Menu Kanji dirapikan: dropdown bab, tabel kosakata, dan modal `KanjiWordModal.svelte`.
- Bug query kamus di backend diperbaiki dengan `strings.Clone` (`backend/internal/services/dictionary.go`), lalu backend dijalankan ulang.
- `あります` yang tidak ditemukan langsung di kamus dipetakan ke `ある`.
- `いい` yang di kamus terbaca sebagai entri lain dinormalkan ke pencarian `よい`.

### 8. Perbaikan bug yang ditemukan saat pengujian

- `べんきょうします` (dan kata benda + する lain) kini dikenali sebagai verba irregular, bukan Godan.
- `あります` → ない dan bentuk sopan negatifnya benar.
- Bentuk turunan yang sebelumnya salah dibentuk: `ukemiPast`, `shiekiPast`, `shiekiukemiPast`, `ishouPolite`, dan permintaan hormat (`召し上がってください`, `いらっしゃってください`, `ご覧になってください`).
- `conjugateAll` menormalkan `inputHira` → `hira` dan membangun ulang bentuk ます untuk input bentuk kamus.
- Bentuk pendek kausatif hanya ditampilkan untuk verba Godan (tidak lagi muncul kosong untuk Ichidan).
- Key duplikat pada daftar pola diperbaiki agar tidak memicu error render.

## Pengujian

### Uji matriks konjugasi

Mencakup verba Godan, Ichidan, irregular, kata benda + する, dan adjektiva:

- て形: はなして, のんで, かって, まって, しんで, あそんで, よんで, かえって, いって, して, べんきょうして.
- た形, たら, 可能, 意向, 命令, えば, 受身, 使役, 使役受身, keigo.
- Penolakan input yang salah (mis. bentuk kamus pada modul ます).
- Adjektiva: たかい, いい, かっこいい, かわいい, げんき, きれい, しずか.
- Hasil: **0 kegagalan**.

### Uji UI end-to-end (headless Chrome)

- 28 kasus sukses lintas 15 modul: `たべる`, `食べます`, `帰る`, `変える`, `たかい`, `いい`, `高い`, `げんき`, `元気だ`, `きれい`, `あります`, `行きます`, `勉強します`, `飲みます`, dan bentuk utama tiap modul.
- 5 kasus penolakan: `あああ`, `きれい` di modul adjektiva-i, `食べる` di adjektiva-na, `たべる` di ます→た, `たかくない` (sudah terkonjugasi).
- Roadmap: 15 kartu, 15 “Aktif”, 0 “Segera”.
- Halaman Kanji: dropdown 16 pilihan, tabel 100 baris.
- Hasil: **0 kegagalan, 0 error console**.

### Build dan deployment

- `npm run build` berhasil.
- `https://defog-shrank-suffix.ngrok-free.dev` merespons 200 untuk aplikasi.
- `/api/lookup?q=食べる` lewat ngrok mengembalikan `{"success":true,...}`.

## Batasan yang Masih Ada

Hal-hal berikut bukan bug yang menghalangi, tetapi perlu diketahui:

1. **Terjemahan otomatis.** Arti diambil dari definisi pertama kamus, lalu diterjemahkan otomatis. Beberapa hasil masih kaku atau kurang natural (mis. 面白い → “menarik”, かわいい → “lucu”). Daftar override manual menutup kata-kata yang paling sering salah, tetapi kata baru akan memakai hasil kamus apa adanya.
2. **Glos bentuk turunan bersifat formula.** Pasif dan kausatif memakai pola “bentuk pasif dari X”, “menyuruh X”, “disuruh X”, tanpa pelaku (に/によって) atau konteks kalimat. Ini disengaja agar tidak menebak, tetapi belum menghasilkan kalimat Indonesia yang sepenuhnya natural.
3. **Ambiguitas kana.** Input kana seperti `かえる` bisa berarti 帰る / 変える / 蛙. Aplikasi memilih entri kamus yang cocok dan menandai `Kana ambigu` bila perlu, tetapi belum ada dialog pemilihan arti. Untuk hasil pasti, masukkan kanji.
4. **Verba -iru / -eru yang jarang.** Penentuan Godan vs Ichidan memakai aturan lokal + daftar pengecualian + `partsOfSpeech` backend. Verba langka di luar daftar bisa salah golongan; validasi kamus tetap mencegah kata yang tidak ada.
5. **Keigo disederhanakan.** Pasangan tidak beraturan hanya untuk verba umum. Verba lain memakai pola お + stem + になる / する, yang tidak selalu tepat untuk semua konteks honorifik.
6. **`あります`.** Bentuk pasifnya (`あられる`) sangat jarang dipakai dalam bahasa Jepang nyata; ditampilkan sebagai bentuk mekanis dengan glos “bentuk pasif dari ada”.
7. **Adjektiva.** Beberapa adjektiva-na ditandai kamus sebagai adverb/noun (mis. 大変); saat ini ditangani lewat daftar pengecualian. Adjektiva lain dengan tag serupa bisa ikut ditolak bila tidak ada di daftar.
8. **Belum ada riwayat.** Analisis masih stateless; belum menyimpan 50 entri terakhir di `localStorage`.

## Saran Pengembangan Berikutnya

Prioritas tinggi:

1. **Dialog disambiguasi kana** untuk input seperti `かえる`, `きる`, `いる` — tampilkan 2–3 kandidat kanji beserta artinya, lalu pengguna memilih.
2. **Tes otomatis di repo** (Vitest/Playwright) untuk matriks konjugasi dan alur UI, agar regresi tidak hanya dicek manual.
3. **Perbaiki template glos** pasif/kausatif dengan pelaku opsional, mis. “dipukul (oleh …)”, dan sediakan kamus frasa Indonesia yang lebih natural.

Prioritas menengah:

4. **Modul tambahan** yang sering diminta: bentuk `～たい`, `～ながら`, `～たり`, `～ている` (aspek), imperatif negatif `～な`, serta pasangan verba transitif/intransitif.
5. **Riwayat analisis** (localStorage, 50 entri) + tombol hapus riwayat.
6. **Latihan/kuis** per bab: tampilkan bentuk ます, pengguna mengetik bentuk target, lalu dinilai otomatis.
7. **TTS per bentuk**: tombol audio pada setiap kartu bentuk (backend TTS sudah tersedia).

Prioritas rendah:

8. Label bentuk dalam bahasa Indonesia sepenuhnya (sekarang masih campur istilah Jepang seperti Sonkeigo/Kenjougo, yang sengaja dipertahankan karena dipakai di buku Minna no Nihongo).
9. Mode gelap/terang dan aksesibilitas keyboard untuk kartu hasil (sebagian sudah berjalan; perlu audit menyeluruh).
10. Dukungan input kalimat penuh (bukan hanya satu kata) dengan pemilihan token.

## Cara Menjalankan

Backend:

```bash
export PATH="$HOME/.local/go/bin:$PATH"
cd backend
go run .
```

Frontend:

```bash
cd frontend
npm install
npm run dev -- --host
```

Build produksi:

```bash
cd frontend
npm run build
```

Deploy ngrok (setelah Vite berjalan di port 5173):

```bash
ngrok http 5173
```

## File Penting

| File | Fungsi |
|------|--------|
| `frontend/src/lib/ubahKataModules.js` | Registry 15 modul + validator |
| `frontend/src/routes/UbahKataDetail.svelte` | Halaman detail modul (generik) |
| `frontend/src/routes/UbahKata.svelte` | Daftar roadmap |
| `frontend/src/lib/conjugation/masuBase.js` | Analisis input & golongan verba |
| `frontend/src/lib/conjugation/verbForms.js` | Tabel konjugasi & glos |
| `frontend/src/lib/conjugation/verbBuild.js` | Penyusunan hasil per modul |
| `frontend/src/lib/conjugation/verbModulesA.js` | Materi modul verba baru 1–6 |
| `frontend/src/lib/conjugation/verbModulesB.js` | Materi modul verba baru 7–11 |
| `frontend/src/lib/conjugation/keigo.js` | Pasangan sonkeigo/kenjougo |
| `frontend/src/lib/conjugation/dictionaryVerb.js` + `jisho.js` | Modul kamus dua arah |
| `frontend/src/lib/conjugation/adjectives.js` | Konjugasi adjektiva |
| `frontend/src/lib/conjugation/validateAdjective.js` | Validasi kelas kata adjektiva |
| `frontend/src/components/ubah-kata/VerbFormExplanation.svelte` | Penjelasan generik |
| `frontend/src/components/ubah-kata/VerbFormResult.svelte` | Hasil generik |
| `frontend/src/routes/Kanji.svelte` | Menu Kanji |
| `backend/internal/services/dictionary.go` | Perbaikan query kamus (`strings.Clone`) |
