<script>
  import { onMount } from 'svelte'

  import { auth } from '../../lib/auth.svelte.js'
  import { confirmDeleteKanji, confirmDeleteLesson } from '../../lib/kanji-lesson-actions.js'
  import { createKanjiLessonStore } from '../../lib/kanji-lesson-store.svelte.js'
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

  const isAdmin = $derived(auth.isAdmin)

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
    confirmDeleteKanji(item, () => store.load({ silent: true }))
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
      if (store.selectedLessonId === String(deleted.id)) {
        store.selectedLessonId = 'all'
      }
      await store.load({ silent: true })
    })
  }
</script>

<div class="space-y-4">
  <KanjiLessonToolbar
    bind:search={store.search}
    bind:selectedLessonId={store.selectedLessonId}
    lessons={store.lessons}
    total={store.filtered.length}
    {isAdmin}
    onFlashcard={() => (flashcardOpen = true)}
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
    onRetry={() => store.load()}
    onCreateLesson={openCreateLesson}
    onCreate={openCreate}
    onImport={openImport}
    onClearSearch={() => (store.search = '')}
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
