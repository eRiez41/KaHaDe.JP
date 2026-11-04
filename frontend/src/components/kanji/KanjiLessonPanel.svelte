<script>
  import { onMount } from 'svelte'

  import { auth } from '../../lib/auth.svelte.js'
  import { downloadKanjiLessonAudio } from '../../lib/api.js'
  import {
    generateKanjiAudio,
    isKanjiGeneratingItem,
    kanjiAudioGeneration,
  } from '../../lib/kanji-audio-generation.svelte.js'
  import { confirmDeleteKanji, confirmDeleteLesson } from '../../lib/kanji-lesson-actions.js'
  import { createKanjiLessonStore } from '../../lib/kanji-lesson-store.svelte.js'
  import { player } from '../../lib/player.js'
  import { toast } from '../../lib/toast.svelte.js'
  import KanjiFlashcards from './KanjiFlashcards.svelte'
  import KanjiLessonContent from './KanjiLessonContent.svelte'
  import KanjiLessonModals from './KanjiLessonModals.svelte'
  import KanjiLessonToolbar from './KanjiLessonToolbar.svelte'

  const store = createKanjiLessonStore()
  let showForm = $state(false)
  let editing = $state(null)
  let showImport = $state(false)
  let flashcardOpen = $state(false)
  let showLessonForm = $state(false)
  let editingLesson = $state(null)
  let downloading = $state(false)

  const isAdmin = $derived(auth.isAdmin)
  const audioReady = $derived(store.audioReady)
  const downloadReady = $derived(store.scopedAudioReady)
  const lessonId = $derived(store.selectedLesson?.id || 0)
  const generatingIds = $derived(
    new Set(store.filtered.filter((item) => isKanjiGeneratingItem(item.id)).map((item) => item.id)),
  )

  onMount(() => store.load())

  $effect(() => {
    store.search
    store.selectedLessonId
    store.resetPage()
  })

  $effect(() => store.clampPage())

  function openCreate() {
    editing = null
    showForm = true
  }

  function openImport() {
    if (store.selectedLessonId === 'all') {
      toast.info('Pilih lesson dulu untuk import.')
      return
    }
    showImport = true
  }

  async function handleSaved() {
    showForm = false
    editing = null
    await store.load({ silent: true })
  }

  function askDelete(item) {
    if (!isAdmin) {
      return
    }
    confirmDeleteKanji(item, async () => {
      player.removeItem(item.id)
      await store.load({ silent: true })
    })
  }

  function openCreateLesson() {
    editingLesson = null
    showLessonForm = true
  }

  function openRenameLesson() {
    if (!store.selectedLesson) {
      return
    }
    editingLesson = store.selectedLesson
    showLessonForm = true
  }

  async function handleLessonSaved(saved) {
    const wasCreate = !editingLesson
    showLessonForm = false
    editingLesson = null
    await store.load({ silent: true })
    if (wasCreate && saved?.id) {
      store.selectedLessonId = String(saved.id)
    }
  }

  function askDeleteLesson() {
    const lesson = store.selectedLesson
    if (!isAdmin || !lesson) {
      return
    }
    confirmDeleteLesson(lesson, async (deleted) => {
      for (const item of store.items.filter((entry) => entry.lessonId === deleted.id)) {
        player.removeItem(item.id)
      }
      if (store.selectedLessonId === String(deleted.id)) {
        store.selectedLessonId = 'all'
      }
      await store.load({ silent: true })
    })
  }

  function playAll() {
    player.playAll(store.filtered)
  }

  function playItem(item) {
    player.playItem(item)
  }

  function refreshPlayer(generated) {
    for (const updated of generated) {
      player.refreshItem(updated)
    }
  }

  async function handleGenerate(item) {
    try {
      toast.info('Memulai generate audio...')
      const result = await generateKanjiAudio([item.id])
      store.applyGenerated(result.items)
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
      toast.info('Tidak ada kanji untuk di-generate.')
      return
    }

    try {
      toast.loading?.('Menggenerate audio...')
      const result = await generateKanjiAudio(ids)
      toast.dismiss?.()
      store.applyGenerated(result.items)
      refreshPlayer(result.items)
      const ready = result.items.filter((entry) => entry.audioStatus === 'ready').length
      if (ready > 0) {
        toast.success(`${ready} audio berhasil dibuat.`)
      }
      if (result.failed?.length) {
        toast.error(`${result.failed.length} audio gagal dibuat.`)
      }
    } catch (error) {
      toast.dismiss?.()
      toast.error(error?.message || 'Gagal generate audio.')
    }
  }

  function handleGenerateAll() {
    if (kanjiAudioGeneration.isGenerating) {
      toast.info('Generate sedang berjalan.')
      return
    }
    const ids = store.scoped
      .filter((item) => !isKanjiGeneratingItem(item.id))
      .map((item) => item.id)
    if (ids.length === 0) {
      toast.info('Tidak ada kanji untuk di-generate.')
      return
    }
    toast.info(`Memulai generate ${ids.length} audio...`)
    return runGenerate(ids)
  }

  async function handleDownloadAll() {
    if (downloading) {
      return
    }
    downloading = true
    try {
      const filename = await downloadKanjiLessonAudio(lessonId)
      toast.success(`Download ${filename} dimulai.`)
    } catch (error) {
      toast.error(error?.message || 'Gagal download audio gabungan.')
    } finally {
      downloading = false
    }
  }
</script>

<div class="space-y-4">
  <KanjiLessonToolbar
    bind:search={store.search}
    bind:selectedLessonId={store.selectedLessonId}
    lessons={store.lessons}
    total={store.filtered.length}
    itemCount={store.filtered.length}
    {audioReady}
    {downloadReady}
    generating={kanjiAudioGeneration.isGenerating}
    generatingCount={kanjiAudioGeneration.count}
    generatingTotal={kanjiAudioGeneration.total}
    generatingProgress={kanjiAudioGeneration.progress}
    {downloading}
    {isAdmin}
    onFlashcard={() => (flashcardOpen = true)}
    onPlayAll={playAll}
    onGenerateAll={handleGenerateAll}
    onDownloadAll={handleDownloadAll}
    onImport={openImport}
    onCreate={openCreate}
    onCreateLesson={openCreateLesson}
    onRenameLesson={openRenameLesson}
    onDeleteLesson={askDeleteLesson}
  />

  <KanjiLessonContent
    status={store.status}
    error={store.error}
    lessons={store.lessons}
    filtered={store.filtered}
    paged={store.paged}
    page={store.page}
    pageSize={store.pageSize}
    totalPages={store.totalPages}
    {isAdmin}
    showLesson={store.showLessonColumn}
    search={store.search}
    generatingIds={generatingIds}
    onRetry={() => store.load()}
    onCreateLesson={openCreateLesson}
    onCreate={openCreate}
    onImport={openImport}
    onClearSearch={() => (store.search = '')}
    onPlay={playItem}
    onGenerate={handleGenerate}
    onEdit={(item) => {
      editing = item
      showForm = true
    }}
    onDelete={askDelete}
    onPage={(next) => (store.page = next)}
  />
</div>

<KanjiLessonModals
  bind:formOpen={showForm}
  item={editing}
  lessons={store.lessons}
  defaultLessonId={store.defaultLessonId}
  bind:importOpen={showImport}
  targetLessonId={store.selectedLesson?.id || null}
  targetLessonName={store.selectedLesson?.nama || ''}
  existingItems={store.targetItems}
  bind:lessonFormOpen={showLessonForm}
  lessonItem={editingLesson}
  onCloseForm={() => {
    showForm = false
    editing = null
  }}
  onSavedForm={handleSaved}
  onCloseLesson={() => {
    showLessonForm = false
    editingLesson = null
  }}
  onSavedLesson={handleLessonSaved}
  onImported={() => store.load({ silent: true })}
/>

<KanjiFlashcards
  open={flashcardOpen}
  items={store.filtered}
  title={store.flashcardTitle}
  onClose={() => (flashcardOpen = false)}
/>
