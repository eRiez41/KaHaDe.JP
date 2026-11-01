<script>
  let {
    items = [],
    page = 1,
    pageSize = 100,
    totalPages = 1,
    total = 0,
    totalItems = 0,
    showBab = false,
    onPage,
  } = $props()

  const visibleStart = $derived(total === 0 ? 0 : (page - 1) * pageSize + 1)
  const visibleEnd = $derived(Math.min(page * pageSize, total))
</script>

<div class="space-y-3">
  <div class="table-shell overflow-x-auto">
    <table class="w-full min-w-[620px] border-collapse text-left">
      <thead class="bg-surface-high text-label-md uppercase tracking-wide text-on-surface-variant">
        <tr>
          <th class="w-16 px-4 py-3 text-right font-medium">#</th>
          <th class="px-4 py-3 font-medium">Kanji</th>
          <th class="px-4 py-3 font-medium">Hira</th>
          <th class="px-4 py-3 font-medium">Arti</th>
          {#if showBab}
            <th class="px-4 py-3 font-medium">Bab</th>
          {/if}
        </tr>
      </thead>
      <tbody class="divide-y divide-outline-variant/50">
        {#each items as item, index (item.id)}
          <tr class="transition-colors hover:bg-on-surface/[0.03]">
            <td class="px-4 py-2.5 text-right text-label-md tabular-nums text-on-surface-variant">
              {(page - 1) * pageSize + index + 1}
            </td>
            <td class="px-4 py-2.5 font-jp text-title-md">{item.kanji || '—'}</td>
            <td class="px-4 py-2.5 font-jp text-body-md text-on-surface-variant">
              {item.hira || '—'}
            </td>
            <td class="px-4 py-2.5 text-body-md">{item.arti || '—'}</td>
            {#if showBab}
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
      Menampilkan {visibleStart}-{visibleEnd} dari {total} kata ber-kanji ({totalItems} total kata).
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
