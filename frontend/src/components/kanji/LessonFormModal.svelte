<script>
  import { tick } from 'svelte'

  import { createLesson, updateLesson } from '../../lib/api.js'
  import { toast } from '../../lib/toast.svelte.js'

  let { open = false, item = null, onClose, onSaved } = $props()

  let nama = $state('')
  let submitting = $state(false)
  let formError = $state('')
  let namaInput = $state(null)
  const isEdit = $derived(Boolean(item))

  $effect(() => {
    if (open) {
      nama = item?.nama || ''
      formError = ''
      tick().then(() => namaInput?.focus())
    }
  })

  $effect(() => {
    if (!open) {
      return
    }
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  })

  function describeError(error) {
    if (error?.details?.length) {
      return error.details.map((detail) => detail.message).join(' ')
    }
    return error?.message || 'Terjadi kesalahan. Coba lagi.'
  }

  function handleKeydown(event) {
    if (open && event.key === 'Escape' && !submitting) {
      onClose?.()
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (submitting) {
      return
    }

    submitting = true
    formError = ''
    try {
      const saved = item
        ? await updateLesson(item.id, { nama })
        : await createLesson({ nama })
      toast.success(`Lesson "${saved.nama}" ${item ? 'diperbarui' : 'ditambahkan'}.`)
      onSaved?.(saved)
    } catch (error) {
      formError = describeError(error)
    } finally {
      submitting = false
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
  <div
    class="fixed inset-0 z-[86] flex items-end justify-center bg-black/40 p-0 backdrop-blur-sm sm:items-center sm:p-4"
    role="dialog"
    aria-modal="true"
    aria-labelledby="lesson-form-title"
  >
    <button
      type="button"
      class="absolute inset-0 cursor-default"
      aria-label="Tutup dialog"
      onclick={() => !submitting && onClose?.()}
    ></button>

    <form
      class="relative w-full max-w-md rounded-t-2xl border border-outline-variant/70 bg-surface-high p-5 shadow-level-5 sm:rounded-xl"
      onsubmit={handleSubmit}
    >
      <div class="mb-4 flex items-start justify-between gap-3">
        <div class="space-y-1">
          <p class="text-label-md text-primary">Kanji Lesson</p>
          <h2 id="lesson-form-title" class="text-title-lg">
            {isEdit ? 'Rename Lesson' : 'Tambah Lesson'}
          </h2>
          <p class="text-body-md text-on-surface-variant">
            Buat lesson dulu, lalu tambahkan kanji ke dalamnya.
          </p>
        </div>
        <button type="button" class="icon-btn -mr-2 -mt-2" aria-label="Tutup" onclick={() => onClose?.()}>
          <svg viewBox="0 0 20 20" class="h-5 w-5" fill="currentColor" aria-hidden="true">
            <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
          </svg>
        </button>
      </div>

      <div class="space-y-1.5">
        <label for="lesson-nama" class="label">
          Nama lesson <span class="text-error" aria-hidden="true">*</span>
        </label>
        <input
          id="lesson-nama"
          bind:this={namaInput}
          bind:value={nama}
          type="text"
          maxlength="100"
          required
          autocomplete="off"
          placeholder="Contoh: Lesson 1"
          class="field"
        />
      </div>

      {#if formError}
        <p class="mt-3 rounded-sm bg-error/10 px-3 py-2 text-body-md text-error" role="alert">
          {formError}
        </p>
      {/if}

      <div class="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button type="button" class="btn btn-ghost" onclick={() => onClose?.()}>Batal</button>
        <button type="submit" class="btn btn-primary" disabled={submitting}>
          {submitting ? 'Menyimpan...' : isEdit ? 'Simpan Nama' : 'Tambah Lesson'}
        </button>
      </div>
    </form>
  </div>
{/if}
