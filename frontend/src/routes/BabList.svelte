<script>
  import { onMount } from 'svelte'

  import BabCard from '../components/BabCard.svelte'
  import { auth } from '../lib/auth.svelte.js'
  import { downloadBabAudio, exportBab, getKosakataList } from '../lib/api.js'
  import { downloadJSON } from '../lib/download.js'
  import { player } from '../lib/player.js'
  import { babStore, loadBabs, removeBab } from '../lib/stores/data.svelte.js'
  import { toast } from '../lib/toast.svelte.js'

  const SORT_KEY = 'bab-sort'
  const sortOptions = [
    { value: 'nama-asc', label: 'Nama A–Z' },
    { value: 'nama-desc', label: 'Nama Z–A' },
    { value: 'terbaru', label: 'Terbaru' },
    { value: 'terlama', label: 'Terlama' },
  ]
  const sortValues = new Set(sortOptions.map((option) => option.value))
  const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' })

  function initialSort() {
    try {
      const saved = localStorage.getItem(SORT_KEY)
      return sortValues.has(saved) ? saved : 'nama-asc'
    } catch {
      return 'nama-asc'
    }
  }

  function createdAt(bab) {
    const value = Date.parse(bab.createdAt)
    return Number.isNaN(value) ? 0 : value
  }

  function sortBabs(items, mode) {
    const sorted = [...items]
    switch (mode) {
      case 'nama-desc':
        return sorted.sort((a, b) => collator.compare(b.nama, a.nama) || a.id - b.id)
      case 'terbaru':
        return sorted.sort((a, b) => createdAt(b) - createdAt(a) || b.id - a.id)
      case 'terlama':
        return sorted.sort((a, b) => createdAt(a) - createdAt(b) || a.id - b.id)
      default:
        return sorted.sort((a, b) => collator.compare(a.nama, b.nama) || a.id - b.id)
    }
  }

  function initialView() {
    try {
      return localStorage.getItem('bab-view') === 'list' ? 'list' : 'card'
    } catch {
      return 'card'
    }
  }

  let viewMode = $state(initialView())
  let sortMode = $state(initialSort())
  let busyId = $state(null)
  const isAdmin = $derived(auth.isAdmin)

  const totalBab = $derived(babStore.items.length)
  const totalKata = $derived(babStore.items.reduce((sum, bab) => sum + bab.countKosakata, 0))
  const totalAudio = $derived(
    babStore.items.reduce((sum, bab) => sum + bab.audioReadyCount, 0),
  )
  const sortedBabs = $derived(sortBabs(babStore.items, sortMode))

  onMount(() => {
    loadBabs()
  })

  function setView(mode) {
    viewMode = mode
    try {
      localStorage.setItem('bab-view', mode)
    } catch {
      // ignore storage failures
    }
  }

  function setSort(mode) {
    sortMode = mode
    try {
      localStorage.setItem(SORT_KEY, mode)
    } catch {
      // ignore storage failures
    }
  }

  function openCreate() {
    window.dispatchEvent(new CustomEvent('open-bab-form', { detail: { mode: 'create' } }))
  }

  function openRename(bab) {
    window.dispatchEvent(
      new CustomEvent('open-bab-form', {
        detail: {
          mode: 'rename',
          id: bab.id,
          nama: bab.nama,
          onSuccess: (updated) => toast.success(`Bab "${updated.nama}" disimpan.`),
        },
      }),
    )
  }

  function askDelete(bab) {
    window.dispatchEvent(
      new CustomEvent('open-confirm', {
        detail: {
          title: 'Hapus bab?',
          message: `Bab "${bab.nama}" beserta ${bab.countKosakata} kata di dalamnya akan dihapus permanen.`,
          confirmLabel: 'Hapus Bab',
          onConfirm: async () => {
            await removeBab(bab.id)
            toast.success(`Bab "${bab.nama}" dihapus.`)
          },
        },
      }),
    )
  }

  async function playBab(bab) {
    try {
      const items = await getKosakataList(bab.id)
      if (!items.some((item) => item.audioStatus === 'ready')) {
        toast.info('Belum ada audio siap di bab ini.')
        return
      }
      player.playAll(items)
    } catch (error) {
      toast.error(error?.message || 'Gagal memuat audio bab.')
    }
  }

  async function downloadBab(bab) {
    if (busyId) {
      return
    }
    busyId = bab.id
    try {
      const filename = await downloadBabAudio(bab.id)
      toast.success(`Download ${filename} dimulai.`)
    } catch (error) {
      toast.error(error?.message || 'Gagal download audio.')
    } finally {
      busyId = null
    }
  }

  async function exportBabJSON(bab) {
    if (busyId) {
      return
    }
    busyId = bab.id
    try {
      const { data, filename } = await exportBab(bab.id)
      downloadJSON(data, filename)
      toast.success(`Export "${bab.nama}" selesai.`)
    } catch (error) {
      toast.error(error?.message || 'Gagal export JSON.')
    } finally {
      busyId = null
    }
  }

  function percent(bab) {
    return bab.countKosakata ? Math.round((bab.audioReadyCount / bab.countKosakata) * 100) : 0
  }
</script>

<section class="space-y-6">
  <header class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
    <div class="space-y-2">
      <h1 class="text-headline-lg font-bold tracking-tight sm:text-headline-xl">Bab</h1>
      <p class="text-body-md text-on-surface-variant">
        {totalBab} bab · {totalKata} kata · {totalAudio} audio siap
      </p>
    </div>

    <div class="flex flex-wrap items-center gap-2">
      <div class="w-36">
        <label class="sr-only" for="bab-sort">Urutkan bab</label>
        <select
          id="bab-sort"
          class="h-11 w-full rounded-full border border-outline-variant bg-surface-high px-4 text-label-md text-on-surface outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
          title="Urutkan bab"
          value={sortMode}
          onchange={(event) => setSort(event.currentTarget.value)}
        >
          {#each sortOptions as option (option.value)}
            <option value={option.value}>{option.label}</option>
          {/each}
        </select>
      </div>

      <div class="flex rounded-full bg-surface-high p-1" role="group" aria-label="Mode tampilan">
        <button
          type="button"
          class="rounded-full px-3.5 py-1.5 text-label-md font-medium transition-colors {viewMode ===
          'card'
            ? 'bg-primary-container text-primary-on-container'
            : 'text-on-surface-variant hover:text-on-surface'}"
          aria-pressed={viewMode === 'card'}
          onclick={() => setView('card')}
        >
          Card
        </button>
        <button
          type="button"
          class="rounded-full px-3.5 py-1.5 text-label-md font-medium transition-colors {viewMode ===
          'list'
            ? 'bg-primary-container text-primary-on-container'
            : 'text-on-surface-variant hover:text-on-surface'}"
          aria-pressed={viewMode === 'list'}
          onclick={() => setView('list')}
        >
          List
        </button>
      </div>

      {#if isAdmin}
        <button type="button" class="btn btn-primary" onclick={openCreate}>
          <svg viewBox="0 0 20 20" class="h-4 w-4" fill="currentColor" aria-hidden="true">
            <path d="M10 4a1 1 0 0 1 1 1v4h4a1 1 0 1 1 0 2h-4v4a1 1 0 1 1-2 0v-4H5a1 1 0 1 1 0-2h4V5a1 1 0 0 1 1-1Z" />
          </svg>
          Tambah Bab
        </button>
      {/if}
    </div>
  </header>

  {#if babStore.status === 'error'}
    <div class="space-y-3 rounded-lg bg-error/10 p-4" role="alert">
      <div>
        <p class="text-title-md text-error">Gagal memuat daftar bab</p>
        <p class="mt-1 text-body-md text-on-surface-variant">{babStore.error}</p>
      </div>
      <button type="button" class="btn btn-tonal" onclick={loadBabs}>Coba Lagi</button>
    </div>
  {:else if babStore.status === 'loading' && babStore.items.length === 0}
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-live="polite" aria-busy="true">
      {#each [1, 2, 3] as skeleton (skeleton)}
        <div class="card space-y-4 p-5">
          <div class="skeleton h-6 w-2/3"></div>
          <div class="skeleton h-3 w-1/3"></div>
          <div class="skeleton h-1.5 w-full"></div>
          <div class="skeleton h-10 w-full"></div>
        </div>
      {/each}
    </div>
  {:else if babStore.items.length === 0}
    <div class="rounded-lg border border-dashed border-outline-variant bg-surface-container/60 p-8 text-center">
      <div class="mx-auto grid h-14 w-14 place-items-center rounded-full bg-primary-container text-primary-on-container">
        <svg viewBox="0 0 24 24" class="h-7 w-7" fill="currentColor" aria-hidden="true">
          <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4h5A1.5 1.5 0 0 1 12 5.5v13a1 1 0 0 1-2 0V6H6v12a1 1 0 0 1-2 0V5.5Zm8.5 0A1.5 1.5 0 0 1 14 4h4.5A1.5 1.5 0 0 1 20 5.5v13a1 1 0 0 1-2 0V6h-3.5v12.5a1 1 0 0 1-2 0V5.5Z" />
        </svg>
      </div>
      <h2 class="mt-3 text-title-md">Belum ada bab</h2>
      <p class="mx-auto mt-1 max-w-md text-body-md text-on-surface-variant">
        Buat bab pertama dulu, lalu tambahkan kata atau import JSON di dalamnya.
      </p>
      <button type="button" class="btn btn-primary mt-4" onclick={openCreate}>Tambah Bab</button>
    </div>
  {:else if viewMode === 'list'}
    <div class="table-shell overflow-x-auto">
      <table class="w-full min-w-[640px] border-collapse text-left">
        <thead class="bg-surface-high text-label-md uppercase tracking-wide text-on-surface-variant">
          <tr>
            <th class="px-4 py-3 font-medium">Nama Bab</th>
            <th class="px-4 py-3 font-medium">Kata</th>
            <th class="px-4 py-3 font-medium">Audio</th>
            {#if isAdmin}
              <th class="px-4 py-3 text-right font-medium">Aksi</th>
            {/if}
          </tr>
        </thead>
        <tbody class="divide-y divide-outline-variant/50">
          {#each sortedBabs as bab (bab.id)}
            <tr class="transition-colors hover:bg-on-surface/[0.03]">
              <td class="px-4 py-2.5">
                <a
                  href={`#bab/${bab.id}`}
                  class="inline-flex items-center gap-2 rounded-sm py-1 font-medium text-on-surface transition-colors hover:text-primary"
                >
                  {bab.nama}
                </a>
              </td>
              <td class="px-4 py-2.5 text-body-md text-on-surface-variant">{bab.countKosakata}</td>
              <td class="px-4 py-2.5">
                <div class="flex items-center gap-2">
                  <div class="h-1.5 w-24 overflow-hidden rounded-full bg-surface-high">
                    <div class="h-full rounded-full bg-primary" style={`width: ${percent(bab)}%`}></div>
                  </div>
                  <span class="text-label-md tabular-nums text-on-surface-variant">
                    {bab.audioReadyCount}/{bab.countKosakata}
                  </span>
                </div>
              </td>
              {#if isAdmin}
                <td class="px-4 py-2.5">
                  <div class="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      class="icon-btn h-10 w-10"
                      disabled={bab.audioReadyCount === 0}
                      onclick={() => playBab(bab)}
                      title="Play All"
                      aria-label={`Putar audio ${bab.nama}`}
                    >
                      <svg viewBox="0 0 20 20" class="h-4 w-4" fill="currentColor" aria-hidden="true">
                        <path d="M6 4.5v11a1 1 0 0 0 1.5.9l9-5.5a1 1 0 0 0 0-1.8l-9-5.5A1 1 0 0 0 6 4.5Z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      class="icon-btn h-10 w-10"
                      onclick={() => openRename(bab)}
                      title="Rename"
                      aria-label={`Rename ${bab.nama}`}
                    >
                      <svg viewBox="0 0 20 20" class="h-4 w-4" fill="currentColor" aria-hidden="true">
                        <path d="M13.6 2.3a2 2 0 0 1 2.8 0l1.3 1.3a2 2 0 0 1 0 2.8l-8.9 8.9a2 2 0 0 1-.9.5l-3.4.8a1 1 0 0 1-1.2-1.2l.8-3.4a2 2 0 0 1 .5-.9l9-8.8Z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      class="icon-btn h-10 w-10 text-error hover:bg-error/10 hover:text-error"
                      onclick={() => askDelete(bab)}
                      title="Hapus"
                      aria-label={`Hapus ${bab.nama}`}
                    >
                      <svg viewBox="0 0 20 20" class="h-4 w-4" fill="currentColor" aria-hidden="true">
                        <path d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443a41 41 0 0 0-2.365.298.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41 41 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5Z" />
                      </svg>
                    </button>
                  </div>
                </td>
              {/if}
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {:else}
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {#each sortedBabs as bab (bab.id)}
        <BabCard
          {bab}
          onRename={isAdmin ? openRename : undefined}
          onDelete={isAdmin ? askDelete : undefined}
          onPlay={playBab}
          onDownload={downloadBab}
          onExport={isAdmin ? exportBabJSON : undefined}
        />
      {/each}
    </div>
  {/if}
</section>
