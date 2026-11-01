# PUSH.MD — Aturan Commit & Push

Dokumen ini adalah aturan WAJIB untuk agent sebelum melakukan
`git commit` dan `git push` di proyek KaHaDe JP.

Referensi:
- rules.md             → aturan kerja agent umum
- histori.md           → riwayat pekerjaan selesai
- tunggakan_kerja.txt  → catatan pekerjaan aktif & tunggakan

Prioritas konflik: rules.md > push.md

============================================================
1. PRINSIP DASAR
============================================================

1. Agent TIDAK BOLEH commit atau push tanpa persetujuan user.
2. Agent WAJIB bertanya SETIAP KALI akan commit/push,
   tanpa pengecualian — termasuk untuk perubahan kecil.
3. Commit dan push dilakukan SEKALIGUS (1 langkah).
4. Push hanya dilakukan kalau sudah ada persetujuan "gas".
5. Agent WAJIB lapor + tanya kalau push gagal, TIDAK BOLEH
   auto-resolve tanpa izin.

============================================================
2. TRIGGER — KAPAN AGENT MEMPERTIMBANGKAN COMMIT
============================================================

Agent mempertimbangkan commit ketika:

A. SEBUAH FITUR SELESAI
   - Fitur bisa didemokan / diverifikasi
   - Build lolos
   - Test lolos (kalau ada)
   - Tidak ada TODO menggantung di fitur tersebut

B. SEBUAH BUG FIX SELESAI
   - Bug sudah dikonfirmasi hilang
   - Test regresi ditambahkan (kalau relevan)
   - Build lolos

Agent TIDAK commit kalau:
- Masih di tengah pengerjaan (WIP)
- Build rusak
- Test merah
- Baru ganti 1 baris komentar / typo kecil (tetap tanya, tapi
  tandai "perubahan sepele")

============================================================
3. KRITERIA "LAYAK COMMIT" (CHECKLIST)
============================================================

Sebelum minta izin ke user, agent WAJIB cek semua ini:

✅ Build lolos
   - Go: `go build ./...` tanpa error
   - Frontend: `npm run build` tanpa error

✅ Vet / lint bersih
   - Go: `go vet ./...` tanpa output
   - Frontend: `npm run lint` (kalau ada script)

✅ Test lolos (kalau ada test terkait)
   - Go: `go test ./...`
   - Frontend: `npm test` (kalau ada)

✅ Fitur terverifikasi
   - Bisa didemokan lewat curl / browser
   - Atau test case lolos

✅ Tidak ada file sensitif ke-stage
   - `.env`, `.env.local`
   - `*.db`, `*.db-journal`
   - `storage/`, `data/`
   - `node_modules/`
   - Cek via `git status` sebelum stage

✅ Tidak ada kode debug
   - `console.log`, `fmt.Println`, `print()`, `debugger`
   - Komentar `// TODO` yang belum relevan (kecuali memang
     WIP yang disepakati)

✅ Commit message jelas (lihat bagian 6)

✅ 1 commit = 1 logical change
   - Jangan campur `feat` + `fix` + `docs` dalam 1 commit
   - Kalau perlu commit terpisah, tanya user

Kalau ADA yang gagal, agent WAJIB lapor dulu, TIDAK minta commit:
> "Update belum layak commit karena [X]. Mau gua benerin dulu?"

============================================================
4. PRE-COMMIT CHECK (WAJIB JALANKAN)
============================================================

Sebelum minta izin, agent jalankan:

```bash
# 1. Cek status
git status

# 2. Cek diff (pastikan gak ada perubahan tak sengaja)
git diff --stat

# 3. Build
cd backend && go build ./...
cd frontend && npm run build

# 4. Vet / test (kalau relevan)
cd backend && go vet ./...
cd backend && go test ./...

Kalau semua lolos, baru lanjut ke minta izin.

============================================================

    FORMAT PERTANYAAN KE USER (WAJIB)
    ============================================================

Agent WAJIB pakai format ini biar user bisa decide cepat:
text

📦 Siap commit — [judul singkat]

Perubahan:
- [file 1]: +12 -3
- [file 2]: +45 -0
- [file 3]: +8 -8

Checklist:
✅ Build lolos (go build, npm run build)
✅ Vet/lint bersih
✅ Test lolos
✅ Fitur terverifikasi ([cara verifikasi])
✅ Tidak ada file sensitif
✅ Tidak ada kode debug

Commit message usulan:
[tipe]([scope]): [deskripsi singkat]

Sekaligus push ke origin/main? [gas / jangan / tunggu]

Aturan format:

    Wajib tampilkan file + line count (biar user tau scope)

    Wajib tampilkan checklist (biar user tau kualitas)

    Wajib tampilkan commit message usulan (biar user bisa
    approve / revisi)

    Wajib sediakan 3 opsi: gas / jangan / tunggu

============================================================

    FORMAT COMMIT MESSAGE (CONVENTIONAL COMMITS)
    ============================================================

Format: <tipe>(<scope opsional>): <deskripsi>

Tipe yang dipakai:
Tipe	Kapan pakai
feat	Fitur baru
fix	Bug fix
refactor	Refactor tanpa ubah behavior
docs	Dokumentasi saja
chore	Tooling, config, dependency
test	Test baru / ubah test
style	Formatting (bukan CSS — untuk kode)
perf	Performance improvement

Scope (opsional tapi disarankan):

    backend, frontend, conjugation, player, import,
    readme, deps, dll.

Contoh BAGUS:
text

feat(backend): tambah endpoint CRUD bab
fix(conjugation): perbaiki Godan -iru detection untuk 帰る
docs(readme): update cara pakai menu Perubahan Kata
refactor(player): pisahkan queue & media handler
chore(deps): update svelte ke 5.1.0

Contoh JELEK (jangan dipakai):
text

update
fix bug
add feature
wip
asdf

============================================================

    FLOW SETELAH USER JAWAB
    ============================================================

7A. User jawab "gas"

Agent langsung eksekusi:
bash

# 1. Stage file yang relevan (spesifik, bukan `git add .`)
git add [file1] [file2] [file3]

# 2. Verifikasi sekali lagi
git status

# 3. Commit
git commit -m "[tipe]([scope]): [deskripsi]"

# 4. Push
git push origin main

Setelah push sukses, agent WAJIB:

    Lapor: "✅ Sudah di-push ke origin/main ([commit hash])"

    Update tunggakan_kerja.txt — hapus item yang selesai

    Update histori.md (kalau perlu tambah catatan)

7B. User jawab "jangan"

Agent:

    Berhenti. TIDAK commit, TIDAK push.

    Tanya: "Oke, gak di-commit. Mau gua:
    a) Ubah dulu (apa yang perlu diubah?)
    b) Buang perubahan (git checkout -- .)
    c) Biarkan uncommitted (simpan sementara)"

    Tunggu jawaban user.

7C. User jawab "tunggu"

Agent:

    Diam. TIDAK commit, TIDAK push.

    Tetap simpan perubahan di working directory.

    Update tunggakan_kerja.txt — pindahkan item ke
    "⏸️ Menunggu Konfirmasi User".

    Tunggu sampai user bilang "gas" atau "lanjut".

============================================================

    PUSH GAGAL — WAJIB LAPOR + TANYA
    ============================================================

Kalau git push gagal (paling umum: remote punya commit
baru), agent WAJIB:

    STOP — jangan coba auto-resolve tanpa izin.

    Lapor ke user dengan format:

text

⚠️ Push gagal

Error: [pesan error git]

Penyebab: [analisis singkat — misal "remote punya commit
baru yang belum ada di local"]

File yang berpotensi konflik:
- [list kalau sudah ketahuan]

Opsi:
a) Pull otomatis + resolve (kalau konflik simpel di
   README/docs/.gitignore)
b) Pull + tampilkan diff konflik, gua (user) yang putuskan
c) Abort, lu (user) handle manual

Mau pilih yang mana?

    Tunggu jawaban user, jangan eksekusi apapun.

8A. Aturan Resolve Konflik
Lokasi konflik	Boleh auto-resolve?
.gitignore, README.md, *.md	✅ Boleh (usul dulu)
File kode (.go, .js, .svelte)	❌ Tampilkan diff dulu
.env, *.db, file sensitif	❌ Abort, user handle
File binary / besar	❌ Abort, user handle
8B. Larangan Keras

    ❌ JANGAN git push --force tanpa izin eksplisit user

    ❌ JANGAN git reset --hard tanpa izin eksplisit

    ❌ JANGAN git checkout -- . (buang perubahan) tanpa izin

    ❌ JANGAN git clean -fd tanpa izin

    ❌ JANGAN resolve konflik di file kode tanpa tampilkan diff

============================================================

    WIP COMMIT — TIDAK DIPAKAI
    ============================================================

Proyek ini SOLO + MAIN branch, jadi WIP commit TIDAK dipakai.

Kalau agent perlu "save point" di tengah pekerjaan:

Boleh:

    Commit normal dengan catatan (WIP) di message

    Contoh: feat(backend): mulai endpoint export (WIP, test belum lolos)

    TAPI: JANGAN push sampai fitur selesai & layak

Tidak boleh:

    Commit dengan message cuma wip / asdf / tmp

    Push WIP ke main branch

Kalau user mau WIP commit + push (misal untuk backup),
harus disepakati eksplisit per kasus.

============================================================

    BRANCH STRATEGY
    ============================================================

    Branch utama: main

    Solo project, jadi SELALU commit ke main

    KECUALI:

        Eksperimen besar yang berisiko (refactor arsitektur)
        → bikin branch experiment/[nama], merge ke main kalau OK

        Fitur besar yang butuh waktu lama
        → bikin branch feat/[nama], merge ke main kalau selesai

    Merge ke main tetap harus tanya user.

============================================================

    INTEGRASI DENGAN TUNGGAAKAN_KERJA.TXT
    ============================================================

Setiap kali:

    Mulai task → tambah di section "🔄 Sedang Dikerjakan"

    Task selesai (belum commit) → pindah ke "⏸️ Menunggu
    Konfirmasi User"

    Commit & push sukses → hapus dari file, tambah catatan
    singkat di histori.md (kalau perlu)

    User bilang "jangan commit" → tetap di "Menunggu
    Konfirmasi", tambah catatan alasan

    Nemuin blocker → tambah di "🚧 Blocker"

File tunggakan_kerja.txt adalah "dashboard kerja" agent.
Kalau file ini gak update, agent dianggap gagal patuh.

============================================================

    DO'S & DON'TS
    ============================================================

DO ✅

    Selalu tanya sebelum commit/push

    Tampilkan checklist + commit message usulan

    Pakai conventional commits

    Stage file spesifik (git add file1 file2), bukan git add .
    — kecuali memang semua file relevan

    Update tunggakan_kerja.txt setelah commit/push

    Lapor hasil push (commit hash, branch, remote)

    Lapor + tanya kalau push gagal

    Hormati jawaban user: "gas" = eksekusi, "jangan" = berhenti,
    "tunggu" = diam

DON'T ❌

    Commit/push tanpa izin

    Pakai --force tanpa izin eksplisit

    Auto-resolve konflik kode tanpa tampilkan diff

    Pakai WIP commit (wip:, tmp:, asdf)

    Commit file sensitif (.env, *.db, storage/)

    Commit kode debug (console.log, fmt.Println)

    Commit kalau build/test gagal

    Campur feat + fix dalam 1 commit (kecuali user minta)

    git add . tanpa cek git status dulu

    Abaikan error push

    Lupa update tunggakan_kerja.txt

============================================================

    CONTOH SKENARIO
    ============================================================

Skenario 1: Fitur selesai, user setuju
text

Agent: 📦 Siap commit — Endpoint /api/lookup proxy
       Perubahan: 3 file, +87 -12
       Checklist: ✅ build ✅ test ✅ vet ✅ verifikasi
       Commit: feat(backend): tambah proxy Jisho lookup
       Push ke origin/main? [gas / jangan / tunggu]

User: gas

Agent: [jalankan git add, commit, push]
       ✅ Sudah di-push ke origin/main (a1b2c3d)
       [update tunggakan_kerja.txt]

Skenario 2: Fitur selesai, user tolak
text

Agent: 📦 Siap commit — ...
User: jangan, ada bug di edge case X

Agent: Oke, gak di-commit. Mau gua:
       a) Benerin bug X dulu
       b) Ubah pendekatan
       c) Buang perubahan
       Pilih yang mana?

Skenario 3: Push gagal
text

Agent: [coba push, gagal]
       ⚠️ Push gagal. Remote punya commit baru.
       File konflik: README.md (non-kode)
       Opsi:
       a) Pull + auto-resolve (README)
       b) Pull + tampilkan diff
       c) Abort, user handle
       Pilih?

User: a

Agent: [pull, resolve README, commit merge, push]
       ✅ Sukses. Merge commit: f4e5d6c

Skenario 4: WIP — save progress
text

Agent: 🔄 Endpoint export baru 50% selesai, test belum lolos.
       Mau gua commit sebagai (WIP) tapi JANGAN push?
       Atau tunggu selesai dulu baru commit?

User: commit WIP aja, jangan push

Agent: [commit tanpa push]
       ✅ Commit WIP: feat(backend): mulai export (WIP)
       ⚠️ Belum di-push. Nanti setelah selesai, gua tanya lagi.

============================================================

    RINGKASAN CEPAT
    ============================================================

Situasi	Aksi Agent
Fitur/fix selesai	Cek checklist → tanya user
User jawab "gas"	commit + push sekaligus
User jawab "jangan"	Berhenti, tanya lanjut
User jawab "tunggu"	Diam, tunggu, update tunggakan
Push gagal	Lapor + tanya, JANGAN auto
Build/test gagal	Lapor dulu, jangan minta commit
WIP (belum selesai)	Tanya: WIP commit (tanpa push) atau tunggu
Konflik di kode	Tampilkan diff, user putuskan
Konflik di docs/.gitignore	Boleh usul auto-resolve
Force push	Dilarang tanpa izin eksplisit

============================================================
SELESAI
============================================================