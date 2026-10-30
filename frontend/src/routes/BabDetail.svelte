<script>
  import BabHeader from '../components/BabHeader.svelte'
  import BabToolbar from '../components/BabToolbar.svelte'
  import ImportModal from '../components/ImportModal.svelte'
  import { auth } from '../lib/auth.svelte.js'
  import KosakataForm from '../components/KosakataForm.svelte'
  import KosakataTable from '../components/KosakataTable.svelte'
  import { downloadBabAudio, exportBab } from '../lib/api.js'
  import { audioGeneration, generateAudio, isGeneratingItem } from '../lib/audio-generation.svelte.js'
  import { downloadBabExport } from '../lib/bab-export.js'
  import { downloadJSON } from '../lib/download.js'
  import { generateUi } from '../lib/generate-ui.svelte.js'
  import { player } from '../lib/player.js'
  import {
    addKosakata,
    applyGeneratedItems,
    editKosakata,
    kosakataStore,
    loadBabDetail,
    removeKosakata,
    removeManyKosakata,
  } from '../lib/stores/data.svelte.js'
  import { toast } from '../lib/toast.svelte.js'

  let { id } = $props()

  let showForm = $state(false)
  let showImport = $state(false)
  let selectedIds = $state(new Set())
  let downloading = $state(false)
  let exporting = $state(false)

  const babId = $derived(Number(id))
  const isValidId = $derived(Number.isInteger(babId) && babId > 0)
  const bab = $derived(kosakataStore.bab)
  const items = $derived(kosakataStore.items)
  const audioReady = $derived(items.filter((item) => item.audioStatus === 'ready').length)
  const generatingIds = $derived(
    new Set(items.filter((item) => isGeneratingItem(item.id)).map((item) => item.id)),
  )
  const selectedItems = $derived(items.filter((item) => selectedIds.has(item.id)))
  const isAdmin = $derived(auth.isAdmin)
  const selectedCount = $derived(selectedItems.length)
  const allSelected = $derived(items.length > 0 && selectedCount === items.length)

  $effect(() => {
    selectedIds = new Set()
    showForm = false
    if (isValidId) {
      loadBabDetail(babId)
    }
  })

  function toggleItem(itemId) {
    const next = new Set(selectedIds)
    if (next.has(itemId)) {
      next.delete(itemId)
    } else {
      next.add(itemId)
    }
    selectedIds = next
  }

  function toggleAll(select) {
    selectedIds = select ? new Set(items.map((item) => item.id)) : new Set()
  }

  async function handleAdd(payload) {
    const item = await addKosakata(babId, payload)
    toast.success(`"${item.kanji || item.hira || item.arti}" ditambahkan.`)
    return item
  }

  async function saveField(itemId, updates) {
    const updated = await editKosakata(itemId, updates)
    player.refreshItem(updated)
    toast.success('Perubahan disimpan.')
  }

  function openRename() {
    if (!isAdmin || !bab) {
      return
    }
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

  function askDelete(item) {
    window.dispatchEvent(
      new CustomEvent('open-confirm', {
        detail: {
          title: 'Hapus kata?',
          message: `"${item.kanji || item.hira}" (${item.arti}) akan dihapus permanen.`,
          confirmLabel: 'Hapus Kata',
          onConfirm: async () => {
            await removeKosakata(item.id)
            player.removeItem(item.id)
            toast.success(`"${item.kanji || item.hira}" dihapus.`)
          },
        },
      }),
    )
  }

  function askDeleteSelected() {
    const count = selectedCount
    window.dispatchEvent(
      new CustomEvent('open-confirm', {
        detail: {
          title: `Hapus ${count} kata?`,
          message: 'Semua kata yang dipilih akan dihapus permanen.',
          confirmLabel: `Hapus ${count} Kata`,
          onConfirm: async () => {
            const ids = selectedItems.map((item) => item.id)
            try {
              await removeManyKosakata(ids)
              for (const itemId of ids) {
                player.removeItem(itemId)
              }
              selectedIds = new Set()
              toast.success(`${ids.length} kata dihapus.`)
            } catch (error) {
              for (const itemId of error.deleted || []) {
                player.removeItem(itemId)
              }
              selectedIds = new Set()
              toast.error(error.message)
            }
          },
        },
      }),
    )
  }

  function refreshPlayer(generated) {
    for (const updated of generated) {
      player.refreshItem(updated)
    }
  }

  async function handleGenerate(item) {
    try {
      toast.info('Memulai generate audio...')
      generateUi.openModal()
      const result = await generateAudio([item.id])
      await applyGeneratedItems(result.items)
      refreshPlayer(result.items)
      if (result.failed?.length) {
        toast.error(result.failed[0].message)
      } else {
        toast.success(`Audio "${item.kanji || item.hira}" siap.`)
      }
    } catch (error) {
      toast.error(error?.message || 'Gagal membuat audio.')
    }
  }

  async function runGenerate(ids) {
    if (ids.length === 0) {
      toast.info('Tidak ada kata untuk di-generate.')
      return
    }

    try {
      toast.loading?.('Menggenerate audio...')
      generateUi.openModal()
      const result = await generateAudio(ids)
      toast.dismiss?.()
      await applyGeneratedItems(result.items)
      refreshPlayer(result.items)
      const ready = result.items.filter((entry) => entry.audioStatus === 'ready').length
      if (ready > 0) {
        toast.success(`${ready} audio berhasil dibuat.`)
      }
      if (result.failed?.length) {
        toast.error(`${result.failed.length} audio gagal dibuat.`)
      }
      selectedIds = new Set()
    } catch (error) {
      toast.dismiss?.()
      toast.error(error?.message || 'Gagal generate audio.')
    }
  }

  function handleGenerateAll() {
    if (audioGeneration.isGenerating) {
      toast.info('Generate sedang berjalan.')
      generateUi.openModal()
      return
    }
    const ids = items.filter((item) => !isGeneratingItem(item.id)).map((item) => item.id)
    if (ids.length === 0) {
      toast.info('Semua audio sudah siap atau sedang diproses.')
      return
    }
    toast.info(`Memulai generate ${ids.length} audio...`)
    generateUi.openModal()
    return runGenerate(ids)
  }

  function handleGenerateSelected() {
    return runGenerate(selectedItems.map((item) => item.id))
  }

  async function handleDownloadAll() {
    if (downloading) {
      return
    }
    downloading = true
    try {
      const filename = await downloadBabAudio(babId)
      toast.success(`Download ${filename} dimulai.`)
    } catch (error) {
      toast.error(error?.message || 'Gagal download audio gabungan.')
    } finally {
      downloading = false
    }
  }

  async function handleExport() {
    if (exporting) {
      return
    }
    exporting = true
    try {
      const { data, filename } = await exportBab(babId)
      downloadJSON(data, filename)
      toast.success('Export JSON selesai.')
    } catch (error) {
      toast.error(error?.message || 'Gagal export JSON.')
    } finally {
      exporting = false
    }
  }

  function handleExportSelected() {
    if (!bab || selectedCount === 0) {
      return
    }
    downloadBabExport(bab, selectedItems)
    toast.success(`${selectedCount} kata diexport.`)
  }

  async function handleImported() {
    await loadBabDetail(babId)
  }
</script>

<section class="space-y-5">
  {#if !isValidId}
    <div class="card space-y-2 p-6">
      <h1 class="text-title-lg">Bab tidak ditemukan</h1>
      <p class="text-body-md text-on-surface-variant">ID bab tidak valid.</p>
      <a href="#bab" class="btn btn-tonal mt-2 w-fit">Kembali ke daftar bab</a>
    </div>
  {:else}
    <BabHeader {bab} itemCount={items.length} {audioReady} onRename={isAdmin ? openRename : undefined} />

    {#if kosakataStore.status === 'error'}
      <div class="space-y-3 rounded-lg bg-error/10 p-4" role="alert">
        <div>
          <p class="text-title-md text-error">Gagal memuat bab</p>
          <p class="mt-1 text-body-md text-on-surface-variant">{kosakataStore.error}</p>
        </div>
        <button type="button" class="btn btn-tonal" onclick={() => loadBabDetail(babId)}>
          Coba Lagi
        </button>
      </div>
    {:else if kosakataStore.status === 'loading'}
      <div class="space-y-3" aria-live="polite" aria-busy="true">
        <div class="skeleton h-16"></div>
        <div class="skeleton h-10 w-2/3"></div>
        <div class="skeleton h-72"></div>
      </div>
    {:else if bab}
      <BabToolbar
        itemCount={items.length}
        {audioReady}
        {selectedCount}
        {allSelected}
        generating={audioGeneration.isGenerating}
        generatingCount={audioGeneration.count}
        generatingTotal={audioGeneration.total}
        generatingProgress={audioGeneration.progress}
        {downloading}
        {exporting}
        onAdd={() => (showForm = !showForm)}
        onImport={() => (showImport = true)}
        onPlayAll={() => player.playAll(items)}
        onGenerateAll={handleGenerateAll}
        onDownloadAll={handleDownloadAll}
        onExport={handleExport}
        onToggleAll={toggleAll}
        onGenerateSelected={handleGenerateSelected}
        onExportSelected={handleExportSelected}
        onDeleteSelected={askDeleteSelected}
        onClearSelection={() => (selectedIds = new Set())}
        isAdmin={isAdmin}
      />

      {#if showForm}
        <KosakataForm onAdd={handleAdd} onCancel={() => (showForm = false)} />
      {/if}

      {#if items.length === 0}
        <div class="rounded-lg border border-dashed border-outline-variant bg-surface-container/60 p-8 text-center">
          <div class="mx-auto grid h-14 w-14 place-items-center rounded-full bg-primary-container text-primary-on-container">
            <svg viewBox="0 0 24 24" class="h-7 w-7" fill="currentColor" aria-hidden="true">
              <path d="M12 4a1 1 0 0 1 1 1v6h6a1 1 0 1 1 0 2h-6v6a1 1 0 1 1-2 0v-6H5a1 1 0 1 1 0-2h6V5a1 1 0 0 1 1-1Z" />
            </svg>
          </div>
          <h2 class="mt-3 text-title-md">Belum ada kata</h2>
          <p class="mx-auto mt-1 max-w-md text-body-md text-on-surface-variant">
            Tambahkan kata pertama lewat form, atau import sekaligus dari file JSON.
          </p>
          <div class="mt-4 flex flex-wrap justify-center gap-2">
            <button type="button" class="btn btn-primary" onclick={() => (showForm = true)}>
              Tambah Kata
            </button>
            <button type="button" class="btn btn-tonal" onclick={() => (showImport = true)}>
              Import JSON
            </button>
          </div>
        </div>
      {:else}
        <KosakataTable
          {items}
          {selectedIds}
          {generatingIds}
          onToggle={isAdmin ? toggleItem : undefined}
          onToggleAll={isAdmin ? toggleAll : undefined}
          onSave={isAdmin ? saveField : undefined}
          onDelete={isAdmin ? askDelete : undefined}
          onGenerate={isAdmin ? handleGenerate : undefined}
          onPlay={(item) => player.playItem(item)}
          readOnly={!isAdmin}
        />

        <p class="text-label-md text-on-surface-variant">
          Klik sel untuk edit langsung. Perubahan tersimpan otomatis saat blur atau Enter.
        </p>
      {/if}

      <ImportModal
        bind:open={showImport}
        {babId}
        existingItems={items}
        onImported={handleImported}
      />
    {:else}
      <div class="card p-6 text-body-md text-on-surface-variant">Data bab tidak tersedia.</div>
    {/if}
  {/if}
</section>
