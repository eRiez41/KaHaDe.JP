<script>
  import { onDestroy, onMount, tick } from 'svelte'

  import { hasJapanese } from '../lib/kuromoji.js'
  import { createRomajiAutofill } from '../lib/romaji-autofill.svelte.js'

  let { onAdd, onCancel } = $props()

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

  onMount(() => {
    kanjiInput?.focus()
  })

  onDestroy(() => {
    autofill.dispose()
  })

  function describeError(error) {
    if (error?.details?.length) {
      return error.details.map((detail) => detail.message).join(' ')
    }
    return error?.message || 'Terjadi kesalahan. Coba lagi.'
  }

  function sourceText() {
    if (hasJapanese(kanji)) {
      return kanji.trim()
    }
    if (hasJapanese(hira)) {
      return hira.trim()
    }
    return ''
  }

  function handleSourceInput(event) {
    if (event.currentTarget.id === 'kanji') {
      kanji = event.currentTarget.value
    } else if (event.currentTarget.id === 'hira') {
      hira = event.currentTarget.value
    }
    autofill.schedule()
  }

  function handleRomajiInput(event) {
    romaji = event.currentTarget.value
    autofill.markManual()
  }

  function resetFields() {
    kanji = ''
    hira = ''
    romaji = ''
    arti = ''
    autofill.reset()
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (submitting) {
      return
    }

    submitting = true
    formError = ''

    try {
      await onAdd({ kanji, hira, romaji, arti })
      resetFields()
      await tick()
      kanjiInput?.focus()
    } catch (error) {
      formError = describeError(error)
    } finally {
      submitting = false
    }
  }
</script>

<form class="card space-y-4 p-4 sm:p-5" onsubmit={handleSubmit}>
  <div class="flex items-start justify-between gap-3">
    <div class="space-y-1">
      <h2 class="text-title-md">Tambah kata baru</h2>
      <p class="text-body-md text-on-surface-variant">
        Isi teks Jepang dan arti. Hira & romaji bisa terisi otomatis.
      </p>
    </div>
    <button type="button" class="icon-btn -mr-2 -mt-1" onclick={onCancel} aria-label="Tutup form">
      <svg viewBox="0 0 20 20" class="h-5 w-5" fill="currentColor" aria-hidden="true">
        <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
      </svg>
    </button>
  </div>

  <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
    <div class="space-y-1.5">
      <label for="kanji" class="label">
        Kanji <span class="text-error" aria-hidden="true">*</span>
      </label>
      <input
        id="kanji"
        bind:this={kanjiInput}
        value={kanji}
        oninput={handleSourceInput}
        type="text"
        maxlength="200"
        required
        autocomplete="off"
        placeholder="食べる"
        class="field font-jp"
      />
    </div>

    <div class="space-y-1.5">
      <label for="hira" class="label">Hira / Kata</label>
      <input
        id="hira"
        value={hira}
        oninput={handleSourceInput}
        type="text"
        maxlength="200"
        autocomplete="off"
        placeholder="たべる"
        class="field font-jp"
      />
    </div>

    <div class="space-y-1.5">
      <label for="romaji" class="label">Romaji</label>
      <input
        id="romaji"
        value={romaji}
        oninput={handleRomajiInput}
        type="text"
        maxlength="200"
        autocomplete="off"
        placeholder="taberu"
        class="field"
      />
      <div class="min-h-4 text-label-md" aria-live="polite">
        {#if autofill.busy}
          <span class="text-on-surface-variant">Membuat romaji...</span>
        {:else if autofill.notice}
          <span class="text-status-warning">{autofill.notice}</span>
        {:else if autofill.touched && romaji}
          <span class="text-on-surface-variant">Romaji manual</span>
        {/if}
      </div>
    </div>

    <div class="space-y-1.5">
      <label for="arti" class="label">
        Arti <span class="text-error" aria-hidden="true">*</span>
      </label>
      <input
        id="arti"
        value={arti}
        oninput={(event) => (arti = event.currentTarget.value)}
        type="text"
        maxlength="500"
        required
        autocomplete="off"
        placeholder="makan"
        class="field"
      />
    </div>
  </div>

  {#if formError}
    <p class="rounded-sm bg-error/10 px-3 py-2 text-body-md text-error" role="alert">
      {formError}
    </p>
  {/if}

  <div class="flex flex-wrap gap-2">
    <button type="submit" class="btn btn-primary" disabled={submitting}>
      {submitting ? 'Menyimpan...' : 'Simpan Kata'}
    </button>
    <button type="button" class="btn btn-ghost" onclick={onCancel}>Batal</button>
  </div>
</form>
