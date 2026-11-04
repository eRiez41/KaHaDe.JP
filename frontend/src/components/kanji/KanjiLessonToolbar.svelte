<script>
  let {
    search = $bindable(''),
    selectedLessonId = $bindable('all'),
    lessons = [],
    total = 0,
    itemCount = 0,
    audioReady = 0,
    downloadReady = 0,
    generating = false,
    generatingCount = 0,
    generatingTotal = 0,
    generatingProgress = 0,
    downloading = false,
    isAdmin = false,
    onFlashcard,
    onPlayAll,
    onGenerateAll,
    onDownloadAll,
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
  const canPlay = $derived(itemCount > 0 && audioReady > 0)
  const canDownload = $derived(downloadReady > 0)
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

      <button type="button" class="btn btn-ghost" disabled={!canPlay} onclick={onPlayAll}>
        <svg viewBox="0 0 20 20" class="h-4 w-4" fill="currentColor" aria-hidden="true">
          <path d="M6 4.5v11a1 1 0 0 0 1.5.9l9-5.5a1 1 0 0 0 0-1.8l-9-5.5A1 1 0 0 0 6 4.5Z" />
        </svg>
        Play All
      </button>

      {#if isAdmin}
        <button
          type="button"
          class="btn btn-ghost"
          disabled={itemCount === 0 || generating}
          onclick={onGenerateAll}
        >
          {#if generating}
            <svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generate {generatingCount}/{generatingTotal}
          {:else}
            <svg viewBox="0 0 20 20" class="h-4 w-4" fill="currentColor" aria-hidden="true">
              <path d="M10 2a1 1 0 0 1 1 1v2.1a5 5 0 0 1 3.9 3.9H17a1 1 0 1 1 0 2h-2.1a5 5 0 0 1-3.9 3.9V17a1 1 0 1 1-2 0v-2.1A5 5 0 0 1 5.1 11H3a1 1 0 1 1 0-2h2.1A5 5 0 0 1 9 5.1V3a1 1 0 0 1 1-1Zm0 5a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
            </svg>
            Generate All
          {/if}
        </button>
      {/if}

      <button
        type="button"
        class="btn btn-ghost"
        disabled={!canDownload || downloading}
        onclick={onDownloadAll}
      >
        <svg viewBox="0 0 20 20" class="h-4 w-4" fill="currentColor" aria-hidden="true">
          <path d="M10 2a1 1 0 0 1 1 1v8.6l2.3-2.3a1 1 0 1 1 1.4 1.4l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 1 1 1.4-1.4L9 11.6V3a1 1 0 0 1 1-1Z" />
          <path d="M4 14a1 1 0 0 1 1 1v1h10v-1a1 1 0 1 1 2 0v2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1Z" />
        </svg>
        {downloading ? 'Menggabung...' : 'Download Audio'}
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

  {#if generating}
    <div class="card space-y-2 p-3" aria-live="polite">
      <div class="flex items-center justify-between text-label-lg text-on-surface-variant">
        <span>Membuat audio kanji...</span>
        <span class="tabular-nums">{generatingCount}/{generatingTotal}</span>
      </div>
      <div class="h-1.5 overflow-hidden rounded-full bg-surface-high">
        <div
          class="h-full rounded-full bg-primary transition-all duration-200"
          style={`width: ${generatingProgress}%`}
        ></div>
      </div>
    </div>
  {/if}

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
