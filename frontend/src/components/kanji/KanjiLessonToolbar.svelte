<script>
  let {
    search = $bindable(''),
    selectedLessonId = $bindable('all'),
    lessons = [],
    total = 0,
    isAdmin = false,
    onFlashcard,
    onImport,
    onCreate,
    onCreateLesson,
    onRenameLesson,
    onDeleteLesson,
  } = $props()

  const selectedLesson = $derived(
    selectedLessonId === 'all'
      ? null
      : lessons.find((lesson) => String(lesson.id) === selectedLessonId) || null,
  )
  const noLessons = $derived(lessons.length === 0)
</script>

<div class="space-y-3">
  <div class="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
    <div class="grid w-full gap-3 sm:grid-cols-2 xl:max-w-2xl">
      <div class="space-y-1.5">
        <label for="lesson-select" class="label">Lesson</label>
        <select id="lesson-select" bind:value={selectedLessonId} class="field h-11">
          <option value="all">Semua Lesson</option>
          {#each lessons as lesson (lesson.id)}
            <option value={String(lesson.id)}>{lesson.nama} ({lesson.countKanji})</option>
          {/each}
        </select>
      </div>

      <div class="space-y-1.5">
        <label for="lesson-search" class="label">Cari kanji lesson</label>
        <input
          id="lesson-search"
          bind:value={search}
          type="search"
          class="field"
          placeholder="Kanji, hira, romaji, atau arti..."
          autocomplete="off"
        />
      </div>
    </div>

    <div class="flex flex-wrap items-center gap-2">
      <button type="button" class="btn btn-tonal" disabled={total === 0} onclick={onFlashcard}>
        <svg viewBox="0 0 20 20" class="h-4 w-4" fill="currentColor" aria-hidden="true">
          <path d="M3 4.5A1.5 1.5 0 0 1 4.5 3h8A1.5 1.5 0 0 1 14 4.5v7a1.5 1.5 0 0 1-1.5 1.5h-8A1.5 1.5 0 0 1 3 11.5v-7Zm11 1.5h1.5A1.5 1.5 0 0 1 17 7.5v7a1.5 1.5 0 0 1-1.5 1.5h-8A1.5 1.5 0 0 1 6 14.5V14h7.5A1.5 1.5 0 0 0 15 12.5V6Z" />
        </svg>
        Flashcard
        <span class="text-label-md opacity-70">({total})</span>
      </button>

      {#if isAdmin}
        <button
          type="button"
          class="btn btn-tonal"
          disabled={noLessons || selectedLessonId === 'all'}
          title={selectedLessonId === 'all' ? 'Pilih lesson dulu untuk import' : undefined}
          onclick={onImport}
        >
          Import JSON
        </button>
        <button type="button" class="btn btn-primary" disabled={noLessons} onclick={onCreate}>
          Tambah Kanji
        </button>
      {/if}
    </div>
  </div>

  {#if isAdmin}
    <div class="flex flex-wrap items-center gap-2 rounded-lg bg-surface-container/60 p-2">
      <button type="button" class="btn btn-tonal" onclick={onCreateLesson}>
        <svg viewBox="0 0 20 20" class="h-4 w-4" fill="currentColor" aria-hidden="true">
          <path d="M10 4a1 1 0 0 1 1 1v4h4a1 1 0 1 1 0 2h-4v4a1 1 0 1 1-2 0v-4H5a1 1 0 1 1 0-2h4V5a1 1 0 0 1 1-1Z" />
        </svg>
        Tambah Lesson
      </button>

      {#if selectedLesson}
        <span class="mx-1 hidden h-6 w-px bg-outline-variant/70 sm:block"></span>
        <p class="mr-auto text-label-md text-on-surface-variant">
          {selectedLesson.nama} · {selectedLesson.countKanji} kanji
        </p>
        <button type="button" class="btn btn-ghost min-h-9 px-3 text-label-md" onclick={onRenameLesson}>
          Rename Lesson
        </button>
        <button
          type="button"
          class="btn btn-ghost min-h-9 px-3 text-label-md text-error"
          onclick={onDeleteLesson}
        >
          Hapus Lesson
        </button>
      {:else}
        <p class="mr-auto text-label-md text-on-surface-variant">
          Pilih lesson untuk rename/hapus. Tambah kanji tetap bisa dari Semua Lesson.
        </p>
      {/if}
    </div>
  {/if}
</div>
