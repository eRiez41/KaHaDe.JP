<script>
  let {
    items = [],
    page = 1,
    pageSize = 50,
    total = 0,
    totalPages = 1,
    showLesson = false,
    isAdmin = false,
    generatingIds = new Set(),
    onPlay,
    onGenerate,
    onEdit,
    onDelete,
    onPage,
  } = $props()

  const visibleStart = $derived(total === 0 ? 0 : (page - 1) * pageSize + 1)
  const visibleEnd = $derived(Math.min(page * pageSize, total))

  function statusLabel(item) {
    if (item.audioStatus === 'ready') {
      return 'Siap'
    }
    if (item.audioStatus === 'failed') {
      return 'Gagal'
    }
    return 'Belum'
  }

  function statusClass(item) {
    if (item.audioStatus === 'ready') {
      return 'text-primary'
    }
    if (item.audioStatus === 'failed') {
      return 'text-error'
    }
    return 'text-on-surface-variant'
  }
</script>

<div class="space-y-3">
  <div class="table-shell overflow-x-auto">
    <table class="w-full min-w-[780px] border-collapse text-left">
      <thead class="bg-surface-high text-label-md uppercase tracking-wide text-on-surface-variant">
        <tr>
          <th class="w-16 px-4 py-3 text-right font-medium">#</th>
          {#if showLesson}
            <th class="px-4 py-3 font-medium">Lesson</th>
          {/if}
          <th class="px-4 py-3 font-medium">Kanji</th>
          <th class="px-4 py-3 font-medium">Hira / Kata</th>
          <th class="px-4 py-3 font-medium">Romaji</th>
          <th class="px-4 py-3 font-medium">Arti</th>
          <th class="w-36 px-4 py-3 font-medium">Audio</th>
          {#if isAdmin}
            <th class="w-32 px-4 py-3 text-right font-medium">Aksi</th>
          {/if}
        </tr>
      </thead>
      <tbody class="divide-y divide-outline-variant/50">
        {#each items as item, index (item.id)}
          <tr class="transition-colors hover:bg-on-surface/[0.03]">
            <td class="px-4 py-2.5 text-right text-label-md tabular-nums text-on-surface-variant">
              {(page - 1) * pageSize + index + 1}
            </td>
            {#if showLesson}
              <td class="px-4 py-2.5 text-label-md text-on-surface-variant">
                {item.lessonNama || '—'}
              </td>
            {/if}
            <td class="px-4 py-2.5 font-jp text-title-lg">{item.kanji || '—'}</td>
            <td class="px-4 py-2.5 font-jp text-body-md text-on-surface-variant">
              {item.hira || '—'}
            </td>
            <td class="px-4 py-2.5 text-body-md text-on-surface-variant">{item.romaji || '—'}</td>
            <td class="px-4 py-2.5 text-body-md">{item.arti || '—'}</td>
            <td class="px-4 py-2.5">
              <div class="flex items-center gap-1.5">
                <button
                  type="button"
                  class="icon-btn h-9 w-9"
                  disabled={item.audioStatus !== 'ready'}
                  onclick={() => onPlay?.(item)}
                  title="Putar audio"
                  aria-label={`Putar ${item.kanji || item.hira || item.arti}`}
                >
                  <svg viewBox="0 0 20 20" class="h-4 w-4" fill="currentColor" aria-hidden="true">
                    <path d="M6 4.5v11a1 1 0 0 0 1.5.9l9-5.5a1 1 0 0 0 0-1.8l-9-5.5A1 1 0 0 0 6 4.5Z" />
                  </svg>
                </button>

                {#if isAdmin}
                  <button
                    type="button"
                    class="icon-btn h-9 w-9"
                    class:text-primary={item.audioStatus === 'ready'}
                    disabled={generatingIds.has(item.id)}
                    onclick={() => onGenerate?.(item)}
                    title={item.audioStatus === 'ready' ? 'Buat ulang audio' : 'Buat audio'}
                    aria-label={`Generate audio ${item.kanji || item.hira || item.arti}`}
                  >
                    {#if generatingIds.has(item.id)}
                      <svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    {:else}
                      <svg viewBox="0 0 20 20" class="h-4 w-4" fill="currentColor" aria-hidden="true">
                        <path d="M10 2a1 1 0 0 1 1 1v2.1a5 5 0 0 1 3.9 3.9H17a1 1 0 1 1 0 2h-2.1a5 5 0 0 1-3.9 3.9V17a1 1 0 1 1-2 0v-2.1A5 5 0 0 1 5.1 11H3a1 1 0 1 1 0-2h2.1A5 5 0 0 1 9 5.1V3a1 1 0 0 1 1-1Zm0 5a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
                      </svg>
                    {/if}
                  </button>
                {/if}

                <span class="text-label-md {statusClass(item)}">{statusLabel(item)}</span>
              </div>
            </td>
            {#if isAdmin}
              <td class="px-4 py-2.5">
                <div class="flex justify-end gap-1">
                  <button
                    type="button"
                    class="btn btn-ghost min-h-8 px-2.5 text-label-md"
                    onclick={() => onEdit?.(item)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    class="btn btn-ghost min-h-8 px-2.5 text-label-md text-error"
                    onclick={() => onDelete?.(item)}
                  >
                    Hapus
                  </button>
                </div>
              </td>
            {/if}
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
    <p class="text-label-md text-on-surface-variant">
      Menampilkan {visibleStart}-{visibleEnd} dari {total} kanji lesson.
    </p>
    {#if totalPages > 1}
      <div class="flex items-center gap-1">
        <button
          type="button"
          class="btn btn-ghost min-h-9 px-3 text-label-md"
          disabled={page === 1}
          onclick={() => onPage?.(Math.max(1, page - 1))}
        >
          Sebelumnya
        </button>
        <span class="px-2 text-label-md text-on-surface-variant">Halaman {page} / {totalPages}</span>
        <button
          type="button"
          class="btn btn-ghost min-h-9 px-3 text-label-md"
          disabled={page === totalPages}
          onclick={() => onPage?.(Math.min(totalPages, page + 1))}
        >
          Selanjutnya
        </button>
      </div>
    {/if}
  </div>
</div>
