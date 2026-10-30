<div
  x-data="babFormModal"
  x-cloak
  x-show="open"
  class="fixed inset-0 z-[80] flex items-end justify-center bg-black/40 p-0 backdrop-blur-sm sm:items-center sm:p-4"
  role="dialog"
  aria-modal="true"
  aria-labelledby="bab-form-title"
>
  <button
    type="button"
    class="absolute inset-0 cursor-default"
    data-modal-close
    aria-label="Tutup dialog"
  ></button>

  <div
    class="relative w-full max-w-md rounded-t-2xl border border-outline-variant/70 bg-surface-high p-5 shadow-level-5 sm:rounded-xl"
  >
    <div class="mb-4 flex items-start justify-between gap-3">
      <div class="space-y-1">
        <h2 id="bab-form-title" class="text-title-lg" x-text="mode === 'create' ? 'Tambah Bab' : 'Rename Bab'">
          Tambah Bab
        </h2>
        <p class="text-body-md text-on-surface-variant">Nama bab dipakai sebagai judul daftar kosakata.</p>
      </div>
      <button type="button" class="icon-btn -mr-2 -mt-2" data-modal-close aria-label="Tutup dialog">
        <svg viewBox="0 0 20 20" class="h-5 w-5" fill="currentColor" aria-hidden="true">
          <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
        </svg>
      </button>
    </div>

    <form class="space-y-4" data-modal-form>
      <div class="space-y-1.5">
        <label for="bab-nama" class="label">Nama bab</label>
        <input
          id="bab-nama"
          x-ref="namaInput"
          x-model="nama"
          type="text"
          maxlength="100"
          autocomplete="off"
          placeholder="Contoh: Bab 1 — Kata Benda"
          class="field"
        />
      </div>

      <p
        x-cloak
        x-show="error"
        x-text="error"
        class="rounded-md bg-error/10 px-3 py-2 text-body-md text-error"
        role="alert"
      ></p>

      <div class="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
        <button type="button" class="btn btn-ghost" data-modal-close>Batal</button>
        <button type="submit" class="btn btn-primary">
          <span x-text="submitting ? 'Menyimpan...' : mode === 'create' ? 'Tambah Bab' : 'Simpan'">
            Simpan
          </span>
        </button>
      </div>
    </form>
  </div>
</div>
