<script>
  import { onMount } from 'svelte'

  import { getKosakataList } from '../lib/api.js'
  import { hasKanji } from '../lib/kuromoji.js'
  import { babStore, loadBabs } from '../lib/stores/data.svelte.js'
  import KanjiWordModal from '../components/KanjiWordModal.svelte'

  let selectedBabId = $state('all')
  let mode = $state('kata')
  let loading = $state(false)
  let items = $state([])
  let error = $state('')
  let requestId = 0
  let page = $state(1)
  let selectedExample = $state(null)
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
    [...babStore.items].sort((a, b) =>
      a.nama.localeCompare(b.nama, 'id', { numeric: true }),
    ),
  )
  const totalPages = $derived(Math.max(1, Math.ceil(kanjiItems.length / pageSize)))
  const pagedKanjiItems = $derived(
    kanjiItems.slice((page - 1) * pageSize, page * pageSize),
  )
  const visibleStart = $derived(kanjiItems.length === 0 ? 0 : (page - 1) * pageSize + 1)
  const visibleEnd = $derived(Math.min(page * pageSize, kanjiItems.length))

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
        if (
          entry.examples.length < 4 &&
          !entry.examples.some((example) => example.id === item.id)
        ) {
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

<section class="space-y-5">
  <header class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
    <div class="space-y-2">
      <h1 class="text-headline-lg font-bold tracking-tight sm:text-headline-xl">Kanji</h1>
      <p class="text-body-md text-on-surface-variant">
        Rekap kanji dari kosakata. Hanya kata yang mengandung kanji yang ditampilkan.
      </p>
    </div>

    <div class="flex rounded-full bg-surface-high p-1" role="group" aria-label="Mode rekap">
      <button
        type="button"
        class="rounded-full px-3.5 py-1.5 text-label-md font-medium transition-colors {mode ===
        'kata'
          ? 'bg-primary-container text-primary-on-container'
          : 'text-on-surface-variant hover:text-on-surface'}"
        aria-pressed={mode === 'kata'}
        onclick={() => (mode = 'kata')}
      >
        Kata
      </button>
      <button
        type="button"
        class="rounded-full px-3.5 py-1.5 text-label-md font-medium transition-colors {mode ===
        'karakter'
          ? 'bg-primary-container text-primary-on-container'
          : 'text-on-surface-variant hover:text-on-surface'}"
        aria-pressed={mode === 'karakter'}
        onclick={() => (mode = 'karakter')}
      >
        Karakter
      </button>
    </div>
  </header>

  <div class="flex flex-wrap items-center gap-2">
    <label for="kanji-bab" class="label">Bab</label>
    <select id="kanji-bab" class="field w-full sm:w-64" bind:value={selectedBabId}>
      <option value="all">Semua Bab</option>
      {#each babOptions as bab (bab.id)}
        <option value={String(bab.id)}>{bab.nama}</option>
      {/each}
    </select>
  </div>

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
    <div class="table-shell overflow-x-auto">
      <table class="w-full min-w-[620px] border-collapse text-left">
        <thead class="bg-surface-high text-label-md uppercase tracking-wide text-on-surface-variant">
          <tr>
            <th class="w-16 px-4 py-3 text-right font-medium">#</th>
            <th class="px-4 py-3 font-medium">Kanji</th>
            <th class="px-4 py-3 font-medium">Hira</th>
            <th class="px-4 py-3 font-medium">Arti</th>
            {#if selectedBabId === 'all'}
              <th class="px-4 py-3 font-medium">Bab</th>
            {/if}
          </tr>
        </thead>
        <tbody class="divide-y divide-outline-variant/50">
          {#each pagedKanjiItems as item, index (item.id)}
            <tr class="transition-colors hover:bg-on-surface/[0.03]">
              <td class="px-4 py-2.5 text-right text-label-md tabular-nums text-on-surface-variant">
                {(page - 1) * pageSize + index + 1}
              </td>
              <td class="px-4 py-2.5 font-jp text-title-md">{item.kanji || '—'}</td>
              <td class="px-4 py-2.5 font-jp text-body-md text-on-surface-variant">
                {item.hira || '—'}
              </td>
              <td class="px-4 py-2.5 text-body-md">{item.arti || '—'}</td>
              {#if selectedBabId === 'all'}
                <td class="px-4 py-2.5 text-label-md text-on-surface-variant">
                  {item.babNama || '—'}
                </td>
              {/if}
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <p class="text-label-md text-on-surface-variant">
        Menampilkan {visibleStart}-{visibleEnd} dari {kanjiItems.length} kata ber-kanji ({items.length} total kata).
      </p>
      {#if totalPages > 1}
        <div class="flex items-center gap-1">
          <button
            type="button"
            class="btn btn-ghost min-h-9 px-3 text-label-md"
            disabled={page === 1}
            onclick={() => (page = Math.max(1, page - 1))}
          >
            Sebelumnya
          </button>
          <span class="px-2 text-label-md text-on-surface-variant">Halaman {page} / {totalPages}</span>
          <button
            type="button"
            class="btn btn-ghost min-h-9 px-3 text-label-md"
            disabled={page === totalPages}
            onclick={() => (page = Math.min(totalPages, page + 1))}
          >
            Selanjutnya
          </button>
        </div>
      {/if}
    </div>
  {:else}
    <div class="table-shell overflow-x-auto">
      <table class="w-full min-w-[520px] border-collapse text-left">
        <thead class="bg-surface-high text-label-md uppercase tracking-wide text-on-surface-variant">
          <tr>
            <th class="w-24 px-4 py-3 font-medium">Kanji</th>
            <th class="px-4 py-3 font-medium">Contoh Kata</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-outline-variant/50">
          {#each kanjiMap as entry (entry.kanji)}
            <tr class="align-top transition-colors hover:bg-on-surface/[0.03]">
              <td class="px-4 py-3">
                <span
                  class="grid h-11 w-11 place-items-center rounded-lg bg-primary-container font-jp text-title-lg text-primary-on-container"
                >
                  {entry.kanji}
                </span>
              </td>
              <td class="px-4 py-3">
                <div class="flex flex-wrap items-center gap-1.5">
                  {#each entry.examples as example (example.id)}
                    <button
                      type="button"
                      class="chip max-w-full bg-surface-high text-on-surface-variant transition-colors hover:bg-primary-container hover:text-primary-on-container"
                      onclick={() =>
                        (selectedExample = { ...example, char: entry.kanji })}
                      aria-label="Lihat penjelasan {example.label}"
                    >
                      <span class="truncate font-jp font-medium text-on-surface">{example.label}</span>
                      <span class="opacity-40">·</span>
                      <span class="truncate">{example.arti}</span>
                      {#if example.babNama && selectedBabId === 'all'}
                        <span class="shrink-0 text-label-md opacity-70">({example.babNama})</span>
                      {/if}
                    </button>
                  {/each}
                </div>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    <p class="text-label-md text-on-surface-variant">
      {kanjiMap.length} karakter unik dari {kanjiItems.length} kata ber-kanji.
    </p>
  {/if}
</section>

<KanjiWordModal word={selectedExample} onClose={() => (selectedExample = null)} />
