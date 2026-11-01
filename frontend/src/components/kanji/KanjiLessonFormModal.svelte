<script>
  import { onDestroy, tick } from 'svelte'

  import { createKanjiLesson, updateKanjiLesson } from '../../lib/api.js'
  import { hasJapanese } from '../../lib/kuromoji.js'
  import { createRomajiAutofill } from '../../lib/romaji-autofill.svelte.js'
  import { toast } from '../../lib/toast.svelte.js'
  import KanjiLessonFields from './KanjiLessonFields.svelte'

  let {
    open = false,
    item = null,
    lessons = [],
    defaultLessonId = null,
    onClose,
    onSaved,
  } = $props()

  let lessonId = $state('')
  let kanji = $state('')
  let hira = $state('')
  let romaji = $state('')
  let arti = $state('')
  let submitting = $state(false)
  let formError = $state('')
  let kanjiInput = $state(null)

  const autofill = createRomajiAutofill(sourceText, (value) => {
    romaji = value
  })
  const isEdit = $derived(Boolean(item))

  $effect(() => {
    if (open) {
      lessonId = String(item?.lessonId || defaultLessonId || lessons[0]?.id || '')
      kanji = item?.kanji || ''
      hira = item?.hira || ''
      romaji = item?.romaji || ''
      arti = item?.arti || ''
      formError = ''
      autofill.reset()
      tick().then(() => kanjiInput?.focus())
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

  onDestroy(() => autofill.dispose())

  function sourceText() {
    if (hasJapanese(kanji)) {
      return kanji.trim()
    }
    if (hasJapanese(hira)) {
      return hira.trim()
    }
    return ''
  }

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
    const payload = { lessonId: Number(lessonId), kanji, hira, romaji, arti }

    try {
      const saved = item
        ? await updateKanjiLesson(item.id, payload)
        : await createKanjiLesson(payload)
      toast.success(`"${saved.kanji}" ${item ? 'diperbarui' : 'ditambahkan'}.`)
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
    aria-labelledby="kanji-lesson-form-title"
  >
    <button
      type="button"
      class="absolute inset-0 cursor-default"
      aria-label="Tutup dialog"
      onclick={() => !submitting && onClose?.()}
    ></button>

    <form
      class="relative w-full max-w-xl rounded-t-2xl border border-outline-variant/70 bg-surface-high p-5 shadow-level-5 sm:rounded-xl"
      onsubmit={handleSubmit}
    >
      <div class="mb-4 flex items-start justify-between gap-3">
        <div class="space-y-1">
          <p class="text-label-md text-primary">Kanji Lesson</p>
          <h2 id="kanji-lesson-form-title" class="text-title-lg">{isEdit ? 'Edit Kanji' : 'Tambah Kanji'}</h2>
        </div>
        <button type="button" class="icon-btn -mr-2 -mt-2" aria-label="Tutup" onclick={() => onClose?.()}>
          <svg viewBox="0 0 20 20" class="h-5 w-5" fill="currentColor" aria-hidden="true">
            <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
          </svg>
        </button>
      </div>
      <KanjiLessonFields
        bind:lessonId
        {lessons}
        bind:kanji
        bind:hira
        bind:romaji
        bind:arti
        bind:kanjiInput
        {autofill}
      />
      {#if formError}
        <p class="mt-3 rounded-sm bg-error/10 px-3 py-2 text-body-md text-error" role="alert">
          {formError}
        </p>
      {/if}

      <div class="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button type="button" class="btn btn-ghost" onclick={() => onClose?.()}>Batal</button>
        <button type="submit" class="btn btn-primary" disabled={submitting}>
          {submitting ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Simpan Kanji'}
        </button>
      </div>
    </form>
  </div>
{/if}
