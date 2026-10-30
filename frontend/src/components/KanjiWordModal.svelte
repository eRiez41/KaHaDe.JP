<script>
  import Furigana from './Furigana.svelte'

  let { word = null, onClose } = $props()

  function handleKeydown(event) {
    if (event.key === 'Escape') {
      onClose?.()
    }
  }

  const rows = $derived.by(() => {
    if (!word) return []
    return [
      { label: 'Kanji terkait', value: word.label, jp: true },
      { label: 'Furigana', value: word.hira || '—', jp: true },
      { label: 'Arti', value: word.arti || '—', jp: false },
      ...(word.babNama ? [{ label: 'Bab', value: word.babNama, jp: false }] : []),
    ]
  })
</script>

<svelte:window onkeydown={handleKeydown} />

<div
  class:hidden={!word}
  class="fixed inset-0 z-[90] flex items-end justify-center bg-black/40 p-0 backdrop-blur-sm sm:items-center sm:p-4"
  role="dialog"
  aria-modal="true"
  aria-labelledby="kanji-word-title"
>
  <button
    type="button"
    class="absolute inset-0 cursor-default"
    aria-label="Tutup dialog"
    onclick={() => onClose?.()}
  ></button>

  {#if word}
    <div
      class="relative w-full max-w-sm rounded-t-2xl border border-outline-variant/70 bg-surface-high p-5 shadow-level-5 sm:rounded-xl"
    >
      <div class="mb-4 flex items-start justify-between gap-3">
        <div class="min-w-0 space-y-1">
          <p class="text-label-md uppercase tracking-wide text-on-surface-variant">Penjelasan kata</p>
          <h2 id="kanji-word-title" class="break-words font-jp text-headline-lg font-bold text-on-surface">
            <Furigana text={word.label} />
          </h2>
          {#if word.char}
            <p class="text-label-md text-on-surface-variant">
              Mengandung karakter <span class="font-jp font-semibold text-on-surface">{word.char}</span>
            </p>
          {/if}
        </div>
        <button type="button" class="icon-btn -mr-2 -mt-2" aria-label="Tutup" onclick={() => onClose?.()}>
          <svg viewBox="0 0 20 20" class="h-5 w-5" fill="currentColor" aria-hidden="true">
            <path
              d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z"
            />
          </svg>
        </button>
      </div>

      <dl class="divide-y divide-outline-variant/50 rounded-lg border border-outline-variant bg-surface p-1">
        {#each rows as row}
          <div class="flex items-baseline justify-between gap-3 px-3 py-2">
            <dt class="shrink-0 text-label-md text-on-surface-variant">{row.label}</dt>
            <dd
              class="min-w-0 break-words text-right text-body-md font-semibold text-on-surface {row.jp
                ? 'font-jp'
                : ''}"
            >
              {row.value}
            </dd>
          </div>
        {/each}
      </dl>

      <button type="button" class="btn btn-tonal mt-4 w-full" onclick={() => onClose?.()}>Tutup</button>
    </div>
  {/if}
</div>
