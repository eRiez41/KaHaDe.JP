<script>
  import KanjiLessonTable from './KanjiLessonTable.svelte'

  let {
    status = 'loading',
    error = '',
    lessons = [],
    filtered = [],
    paged = [],
    page = 1,
    pageSize = 50,
    totalPages = 1,
    isAdmin = false,
    showLesson = false,
    search = '',
    onRetry,
    onCreateLesson,
    onCreate,
    onImport,
    onClearSearch,
    onEdit,
    onDelete,
    onPage,
  } = $props()
</script>

{#if status === 'loading'}
  <div class="space-y-3" aria-live="polite" aria-busy="true">
    <div class="skeleton h-10 w-1/3"></div>
    <div class="skeleton h-56"></div>
  </div>
{:else if status === 'error'}
  <div class="space-y-3 rounded-lg bg-error/10 p-4" role="alert">
    <p class="text-title-md text-error">Gagal memuat kanji lesson</p>
    <p class="text-body-md text-on-surface-variant">{error}</p>
    <button type="button" class="btn btn-tonal" onclick={onRetry}>Coba Lagi</button>
  </div>
{:else if lessons.length === 0}
  <div class="rounded-lg border border-dashed border-outline-variant bg-surface-container/60 p-8 text-center">
    <h2 class="text-title-md">Belum ada lesson</h2>
    <p class="mx-auto mt-1 max-w-md text-body-md text-on-surface-variant">
      Buat lesson dulu (misalnya Lesson 1), lalu tambahkan atau import kanji ke dalamnya.
    </p>
    {#if isAdmin}
      <button type="button" class="btn btn-primary mt-4" onclick={onCreateLesson}>
        Tambah Lesson
      </button>
    {/if}
  </div>
{:else if filtered.length === 0 && search.trim()}
  <div class="rounded-lg border border-dashed border-outline-variant bg-surface-container/60 p-8 text-center">
    <h2 class="text-title-md">Tidak ada hasil</h2>
    <p class="mx-auto mt-1 max-w-md text-body-md text-on-surface-variant">
      Tidak ada kanji lesson yang cocok dengan "{search}".
    </p>
    <button type="button" class="btn btn-tonal mt-4" onclick={onClearSearch}>
      Hapus Pencarian
    </button>
  </div>
{:else if filtered.length === 0}
  <div class="rounded-lg border border-dashed border-outline-variant bg-surface-container/60 p-8 text-center">
    <h2 class="text-title-md">Lesson masih kosong</h2>
    <p class="mx-auto mt-1 max-w-md text-body-md text-on-surface-variant">
      Tambahkan kanji satu per satu atau import file JSON ke lesson ini.
    </p>
    {#if isAdmin}
      <div class="mt-4 flex flex-wrap justify-center gap-2">
        <button type="button" class="btn btn-primary" onclick={onCreate}>Tambah Kanji</button>
        <button type="button" class="btn btn-tonal" onclick={onImport}>Import JSON</button>
      </div>
    {/if}
  </div>
{:else}
  <KanjiLessonTable
    items={paged}
    {page}
    {pageSize}
    total={filtered.length}
    {totalPages}
    {isAdmin}
    showLesson={showLesson}
    onEdit={onEdit}
    onDelete={onDelete}
    onPage={onPage}
  />
{/if}
