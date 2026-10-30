<script>
  import Furigana from '../Furigana.svelte'

  let { result, onclose } = $props()

  const dictionary = $derived(result?.dictionary ?? null)
  const meanings = $derived(dictionary?.meanings ?? [])
  const meaningText = $derived(meanings.length ? meanings.join(', ') : 'Arti belum tersedia')
  const primaryMeaning = $derived(meanings[0] ?? '')
  const dictionaryMeta = $derived.by(() => {
    if (!dictionary) return ''
    const parts = [dictionary.word]
    if (dictionary.reading && dictionary.reading !== dictionary.word) {
      parts.push(`(${dictionary.reading})`)
    }
    if (dictionary.jlpt) parts.push(`· ${dictionary.jlpt}`)
    if (dictionary.isCommon) parts.push('· Umum')
    return parts.filter(Boolean).join(' ')
  })
  const partsOfSpeech = $derived(dictionary?.partsOfSpeech ?? [])
  const badge = $derived(result.golonganLabel ?? result.posLabel ?? '')
  const meaningNote = $derived(
    dictionary?.translated
      ? 'Arti diterjemahkan otomatis dari kamus Jisho ke bahasa Indonesia.'
      : 'Arti dari kamus Jisho (Inggris) karena terjemahan otomatis tidak tersedia.',
  )
</script>

<section id="ubah-kata-result" class="card space-y-4 p-4 sm:p-5">
  <div class="flex items-start justify-between gap-2">
    <div>
      <h2 class="text-title-md font-bold">Hasil Analisis</h2>
      <p class="text-body-md text-on-surface-variant">
        {#if result.inputOriginal !== result.inputHira}
          Input: {result.inputOriginal} → {result.inputHira}
        {:else}
          Input: {result.inputOriginal}
        {/if}
      </p>
    </div>
    <button type="button" class="icon-btn" onclick={onclose} aria-label="Tutup hasil">
      <svg viewBox="0 0 20 20" class="h-5 w-5" fill="currentColor" aria-hidden="true">
        <path
          d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z"
        />
      </svg>
    </button>
  </div>

  <div class="rounded-lg border-2 border-primary/30 bg-primary-container/40 p-4">
    <div class="flex flex-wrap items-center gap-3">
      <div class="min-w-0">
        <p class="text-label-md uppercase tracking-wide text-on-surface-variant">Input</p>
        <p class="break-words text-title-md font-bold text-on-surface">
          <Furigana text={result.inputHira} />
        </p>
      </div>
      <svg viewBox="0 0 20 20" class="h-6 w-6 shrink-0 text-on-surface-variant" fill="currentColor" aria-hidden="true">
        <path d="M7.2 3.3a1 1 0 0 1 1.4 0l5.5 5.5a1 1 0 0 1 0 1.4l-5.5 5.5a1 1 0 1 1-1.4-1.4L11.8 10 7.2 4.7a1 1 0 0 1 0-1.4Z" />
      </svg>
      <div class="min-w-0">
        <p class="text-label-md uppercase tracking-wide text-on-surface-variant">
          {result.formLabel}
        </p>
        <p class="break-words text-headline-lg font-bold text-primary">
          <Furigana text={result.form} />
        </p>
        {#if primaryMeaning}
          <p class="text-body-md text-on-surface-variant">{primaryMeaning}</p>
        {/if}
      </div>
    </div>
    <div class="mt-3 flex flex-wrap items-center gap-2">
      {#if badge}
        <span class="chip bg-surface text-on-surface">{badge}</span>
      {/if}
      {#if result.isException}
        <span class="chip bg-error/10 text-on-surface">⚠ Pengecualian</span>
      {/if}
      {#if result.isAmbiguous}
        <span class="chip bg-status-warning/10 text-on-surface">Kana ambigu</span>
      {/if}
    </div>
  </div>

  {#if dictionary}
    <div class="space-y-2 rounded-lg border border-outline-variant bg-surface-high/60 p-3 sm:p-4">
      <div class="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <p class="text-label-lg font-semibold">Arti utama</p>
        <p class="text-label-md text-on-surface-variant">{dictionaryMeta}</p>
      </div>
      <p class="text-title-md font-bold text-on-surface">{meaningText}</p>
      {#if partsOfSpeech.length}
        <p class="text-label-md text-on-surface-variant">
          Kelas kata: {partsOfSpeech.join(', ')}
        </p>
      {/if}
      <p class="text-label-md text-on-surface-variant">{meaningNote}</p>
    </div>
  {/if}

  <div class="space-y-2">
    <p class="text-label-lg font-semibold">Penjelasan</p>
    <p class="text-body-md text-on-surface-variant">{result.alasan}</p>
  </div>

  {#if result.isAmbiguous}
    <p class="rounded-lg bg-status-warning/10 p-3 text-body-md text-on-surface">
      Input kana bisa memiliki lebih dari satu arti. Masukkan bentuk kanji untuk hasil yang pasti.
    </p>
  {/if}

  <div class="space-y-2">
    <p class="text-label-lg font-semibold">Bentuk Lengkap</p>
    <div class="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {#each result.forms as form (form.key)}
        <div
          class="rounded-lg border p-3 {form.highlight
            ? 'border-primary/40 bg-primary-container/30'
            : 'border-outline-variant'}"
        >
          <div class="flex items-center justify-between gap-2">
            <p class="text-label-md text-on-surface-variant">{form.label}</p>
            {#if form.highlight}
              <span class="chip bg-primary/10 text-on-surface">Hasil</span>
            {/if}
          </div>
          <p class="mt-1 break-words text-title-md font-bold">
            <Furigana text={form.jp} />
          </p>
          <p class="mt-1 text-body-md font-semibold text-on-surface">{form.meaning}</p>
          {#if form.note}
            <p class="text-label-md text-on-surface-variant">{form.note}</p>
          {/if}
        </div>
      {/each}
    </div>
  </div>

  {#if result.patterns?.length}
    <div class="space-y-2">
      <p class="text-label-lg font-semibold">Pola Umum</p>
      <ul class="space-y-1.5">
        {#each result.patterns as pattern (pattern.jp + pattern.note)}
          <li class="flex flex-wrap items-baseline gap-x-2 rounded-lg bg-surface-high px-3 py-2">
            <span class="text-title-md font-bold text-on-surface">
              <Furigana text={pattern.jp} />
            </span>
            <span class="text-body-md text-on-surface-variant">{pattern.meaning}</span>
            {#if pattern.note}
              <span class="text-label-md text-on-surface-variant">({pattern.note})</span>
            {/if}
          </li>
        {/each}
      </ul>
    </div>
  {/if}

  {#if result.note}
    <p class="rounded-lg bg-surface-high/60 p-3 text-label-md text-on-surface-variant">
      {result.note}
    </p>
  {/if}
</section>
