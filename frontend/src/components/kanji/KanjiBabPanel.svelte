<script>
  import { onMount } from 'svelte'

  import { getKosakataList } from '../../lib/api.js'
  import { hasKanji } from '../../lib/kuromoji.js'
  import { babStore, loadBabs } from '../../lib/stores/data.svelte.js'
  import KanjiWordModal from '../KanjiWordModal.svelte'
  import KanjiBabCharTable from './KanjiBabCharTable.svelte'
  import KanjiBabToolbar from './KanjiBabToolbar.svelte'
  import KanjiBabWordTable from './KanjiBabWordTable.svelte'
  import KanjiFlashcards from './KanjiFlashcards.svelte'

  let selectedBabId = $state('all')
  let mode = $state('kata')
  let loading = $state(false)
  let items = $state([])
  let error = $state('')
  let requestId = 0
  let page = $state(1)
  let selectedExample = $state(null)
  let flashcardOpen = $state(false)
  const pageSize = 100

  onMount(() => {
    loadBabs()
  })

  $effect(() => {
    const status = babStore.status
    const babId = selectedBabId
    const babs = babStore.items
    if (status === 'success') {
      loadItems(babId, babs)
    }
  })

  $effect(() => {
    selectedBabId
    mode
    page = 1
    selectedExample = null
  })

  async function loadItems(babId, babs) {
    const current = ++requestId
    error = ''
    items = []
    loading = true

    try {
      let merged = []
      if (babId === 'all') {
        const lists = await Promise.all(babs.map((bab) => getKosakataList(bab.id)))
        merged = babs.flatMap((bab, index) =>
          lists[index].map((item) => ({ ...item, babNama: bab.nama })),
        )
      } else {
        const numericId = Number(babId)
        const bab = babs.find((entry) => entry.id === numericId)
        const list = await getKosakataList(numericId)
        merged = list.map((item) => ({ ...item, babNama: bab?.nama || '' }))
      }

      if (current === requestId) {
        items = merged
      }
    } catch (loadError) {
      if (current === requestId) {
        error = loadError?.message || 'Gagal memuat kosakata.'
      }
    } finally {
      if (current === requestId) {
        loading = false
      }
    }
  }

  const kanjiItems = $derived(items.filter((item) => hasKanji(item.kanji || item.hira || '')))
  const babOptions = $derived(
    [...babStore.items].sort((a, b) => a.nama.localeCompare(b.nama, 'id', { numeric: true })),
  )
  const totalPages = $derived(Math.max(1, Math.ceil(kanjiItems.length / pageSize)))
  const pagedKanjiItems = $derived(kanjiItems.slice((page - 1) * pageSize, page * pageSize))
  const selectedBabName = $derived(
    selectedBabId === 'all'
      ? 'Semua Bab'
      : babOptions.find((bab) => String(bab.id) === selectedBabId)?.nama || 'Bab',
  )
  const flashcardTitle = $derived(`Flashcard Kanji · ${selectedBabName}`)
  const showBabColumn = $derived(selectedBabId === 'all')

  const kanjiMap = $derived.by(() => {
    const map = new Map()
    for (const item of kanjiItems) {
      const source = item.kanji || item.hira || ''
      for (const char of source) {
        if (!hasKanji(char)) {
          continue
        }
        if (!map.has(char)) {
          map.set(char, { kanji: char, count: 0, examples: [] })
        }
        const entry = map.get(char)
        entry.count += 1
        const label = item.kanji || item.hira
        if (entry.examples.length < 4 && !entry.examples.some((example) => example.id === item.id)) {
          entry.examples.push({
            id: item.id,
            label,
            hira: item.hira,
            arti: item.arti,
            babNama: item.babNama,
          })
        }
      }
    }
    return Array.from(map.values()).sort(
      (a, b) => b.count - a.count || a.kanji.localeCompare(b.kanji),
    )
  })
</script>

<div class="space-y-4">
  <KanjiBabToolbar
    bind:selectedBabId
    bind:mode
    {babOptions}
    count={kanjiItems.length}
    onFlashcard={() => (flashcardOpen = true)}
  />

  {#if babStore.status === 'error'}
    <div class="space-y-3 rounded-lg bg-error/10 p-4" role="alert">
      <p class="text-title-md text-error">Gagal memuat daftar bab</p>
      <p class="text-body-md text-on-surface-variant">{babStore.error}</p>
      <button type="button" class="btn btn-tonal" onclick={loadBabs}>Coba Lagi</button>
    </div>
  {:else if error}
    <div class="space-y-3 rounded-lg bg-error/10 p-4" role="alert">
      <p class="text-title-md text-error">Gagal memuat data kanji</p>
      <p class="text-body-md text-on-surface-variant">{error}</p>
      <button
        type="button"
        class="btn btn-tonal"
        onclick={() => loadItems(selectedBabId, babStore.items)}
      >
        Coba Lagi
      </button>
    </div>
  {:else if loading}
    <div class="space-y-3" aria-live="polite" aria-busy="true">
      <div class="skeleton h-10 w-1/3"></div>
      <div class="skeleton h-56"></div>
    </div>
  {:else if babStore.items.length === 0}
    <div class="rounded-lg border border-dashed border-outline-variant bg-surface-container/60 p-8 text-center">
      <h2 class="text-title-md">Belum ada bab</h2>
      <p class="mx-auto mt-1 max-w-md text-body-md text-on-surface-variant">
        Tambahkan bab dan kosakata ber-kanji terlebih dahulu.
      </p>
      <a href="#bab" class="btn btn-primary mt-4">Buka Halaman Bab</a>
    </div>
  {:else if kanjiItems.length === 0}
    <div class="rounded-lg border border-dashed border-outline-variant bg-surface-container/60 p-8 text-center">
      <h2 class="text-title-md">Belum ada kanji</h2>
      <p class="mx-auto mt-1 max-w-md text-body-md text-on-surface-variant">
        Tambahkan kosakata yang mengandung kanji atau pilih bab lain.
      </p>
    </div>
  {:else if mode === 'kata'}
    <KanjiBabWordTable
      items={pagedKanjiItems}
      {page}
      {pageSize}
      {totalPages}
      total={kanjiItems.length}
      totalItems={items.length}
      showBab={showBabColumn}
      onPage={(next) => (page = next)}
    />
  {:else}
    <KanjiBabCharTable
      entries={kanjiMap}
      total={kanjiItems.length}
      showBab={showBabColumn}
      onSelect={(example) => (selectedExample = example)}
    />
  {/if}
</div>

<KanjiFlashcards
  open={flashcardOpen}
  items={kanjiItems}
  title={flashcardTitle}
  onClose={() => (flashcardOpen = false)}
/>

<KanjiWordModal word={selectedExample} onClose={() => (selectedExample = null)} />
