<script>
  import KanjiFlashcardFace from './KanjiFlashcardFace.svelte'

  let { open = false, items = [], title = 'Flashcard', onClose } = $props()

  let deck = $state([])
  let index = $state(0)
  let flipped = $state(false)
  let shuffled = $state(false)
  let wasOpen = false

  const normalized = $derived(
    items.map((item, position) => ({
      id: item.id ?? position,
      kanji: item.kanji || item.hira || '—',
      hira: item.hira || '',
      romaji: item.romaji || '',
      arti: item.arti || '',
      babNama: item.babNama || '',
    })),
  )
  const card = $derived(deck[index] || null)
  const progress = $derived(deck.length === 0 ? 0 : ((index + 1) / deck.length) * 100)

  $effect(() => {
    if (open && !wasOpen) {
      deck = [...normalized]
      index = 0
      flipped = false
      shuffled = false
    }
    wasOpen = open
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

  function flip() {
    if (card) {
      flipped = !flipped
    }
  }

  function go(step) {
    if (deck.length === 0) {
      return
    }
    index = (index + step + deck.length) % deck.length
    flipped = false
  }

  function shuffle() {
    const next = [...deck]
    for (let i = next.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[next[i], next[j]] = [next[j], next[i]]
    }
    deck = next
    index = 0
    flipped = false
    shuffled = true
  }

  function restart() {
    deck = [...normalized]
    index = 0
    flipped = false
    shuffled = false
  }

  function handleKeydown(event) {
    if (!open) {
      return
    }
    if (event.key === 'Escape') {
      onClose?.()
      return
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      go(1)
      return
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      go(-1)
      return
    }
    const tag = event.target?.tagName
    if (event.key === ' ' && !['BUTTON', 'INPUT', 'TEXTAREA', 'SELECT', 'A'].includes(tag)) {
      event.preventDefault()
      flip()
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
  <div
    class="fixed inset-0 z-[88] flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
    role="dialog"
    aria-modal="true"
    aria-labelledby="flashcard-title"
  >
    <button
      type="button"
      class="absolute inset-0 cursor-default"
      aria-label="Tutup flashcard"
      onclick={() => onClose?.()}
    ></button>

    <div
      class="relative flex max-h-[94dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl border border-outline-variant/70 bg-surface-high shadow-level-5 sm:rounded-xl"
    >
      <header class="flex items-start justify-between gap-3 border-b border-outline-variant/60 p-4 sm:p-5">
        <div class="min-w-0 space-y-1">
          <p class="text-label-md text-primary">Flashcard</p>
          <h2 id="flashcard-title" class="truncate text-title-lg">{title}</h2>
        </div>
        <div class="flex items-center gap-2">
          <span class="rounded-full bg-surface-container px-3 py-1 text-label-md tabular-nums text-on-surface-variant">
            {deck.length === 0 ? 0 : index + 1} / {deck.length}
          </span>
          <button type="button" class="icon-btn -mr-2 -mt-2" aria-label="Tutup" onclick={() => onClose?.()}>
            <svg viewBox="0 0 20 20" class="h-5 w-5" fill="currentColor" aria-hidden="true">
              <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
            </svg>
          </button>
        </div>
      </header>

      <div class="flex-1 overflow-y-auto p-4 sm:p-6">
        <div class="h-1.5 w-full overflow-hidden rounded-full bg-surface-container" aria-hidden="true">
          <div class="h-full rounded-full bg-primary transition-all" style={`width: ${progress}%`}></div>
        </div>

        {#if !card}
          <div class="py-16 text-center">
            <h3 class="text-title-md">Belum ada data</h3>
            <p class="mt-1 text-body-md text-on-surface-variant">
              Tambahkan kanji terlebih dahulu untuk membuat flashcard.
            </p>
          </div>
        {:else}
          <KanjiFlashcardFace {card} {flipped} onFlip={flip} />

          <div class="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div class="flex gap-2">
              <button type="button" class="btn btn-tonal flex-1 sm:flex-none" onclick={() => go(-1)}>
                Sebelumnya
              </button>
              <button type="button" class="btn btn-primary flex-1 sm:flex-none" onclick={flip}>
                {flipped ? 'Lihat Kanji' : 'Lihat Jawaban'}
              </button>
              <button type="button" class="btn btn-tonal flex-1 sm:flex-none" onclick={() => go(1)}>
                Berikutnya
              </button>
            </div>
            <div class="flex gap-2">
              <button type="button" class="btn btn-ghost flex-1 sm:flex-none" onclick={shuffle}>
                {shuffled ? 'Acak Lagi' : 'Acak'}
              </button>
              <button type="button" class="btn btn-ghost flex-1 sm:flex-none" onclick={restart}>
                Ulang
              </button>
            </div>
          </div>
          <p class="mt-3 text-center text-label-md text-on-surface-variant">
            Navigasi: ← → · Balik kartu: spasi · Tutup: Esc
          </p>
        {/if}
      </div>
    </div>
  </div>
{/if}
