<script>
  import Furigana from '../Furigana.svelte'
  import MasuNaiForms from './MasuNaiForms.svelte'

  let { result, onclose } = $props()

  const golonganText = $derived.by(() => {
    if (result.golongan === 'ichidan') return 'Golongan II (Ichidan)'
    if (result.golongan === 'godan') return 'Golongan I (Godan)'
    if (result.golongan === 'irregular') return 'Golongan III (Irregular)'
    return ''
  })

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
        <p class="text-label-md uppercase tracking-wide text-on-surface-variant">Bentuk ます</p>
        <p class="break-words text-headline-lg font-bold text-on-surface">
          <Furigana text={result.inputHira} />
        </p>
        {#if primaryMeaning}
          <p class="text-body-md text-on-surface-variant">{primaryMeaning}</p>
        {/if}
      </div>
      <svg viewBox="0 0 20 20" class="h-6 w-6 shrink-0 text-on-surface-variant" fill="currentColor" aria-hidden="true">
        <path d="M7.2 3.3a1 1 0 0 1 1.4 0l5.5 5.5a1 1 0 0 1 0 1.4l-5.5 5.5a1 1 0 1 1-1.4-1.4L11.8 10 7.2 4.7a1 1 0 0 1 0-1.4Z" />
      </svg>
      <div class="min-w-0">
        <p class="text-label-md uppercase tracking-wide text-on-surface-variant">Bentuk ない</p>
        <p class="break-words text-headline-lg font-bold text-primary">
          <Furigana text={result.naiForm} />
        </p>
        {#if primaryMeaning}
          <p class="text-body-md text-on-surface-variant">tidak {primaryMeaning}</p>
        {/if}
      </div>
    </div>
    <div class="mt-3 flex flex-wrap items-center gap-2">
      <span class="chip bg-surface text-on-surface">Masuk {golonganText}</span>
      {#if result.isException}
        <span class="chip bg-error/10 text-on-surface">⚠ Pengecualian</span>
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
      <p class="text-label-md text-on-surface-variant">
        Bentuk ない adalah negatif biasa (non-sopan). Untuk percakapan sopan, gunakan bentuk
        ません. {meaningNote}
      </p>
    </div>
  {/if}

  <div class="space-y-2">
    <p class="text-label-lg font-semibold">Penjelasan</p>
    <p class="text-body-md text-on-surface-variant">{result.alasan}</p>
  </div>

  {#if result.isAmbiguous}
    <p class="rounded-lg bg-status-warning/10 p-3 text-body-md text-on-surface">
      Input kana ambigu. <span class="font-semibold">きます</span> bisa juga <span class="font-semibold">着ます</span> (memakai)
      → bentuk ない-nya <span class="font-semibold">きない</span>. Masukkan kanji untuk hasil pasti.
    </p>
  {/if}

  <MasuNaiForms {result} {dictionary} />
</section>
