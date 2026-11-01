<script>
  import { selectedPayload, summarizeRows } from '../lib/import.js'

  let { rows = [], noun = 'Kata', onToggleRow, onToggleAll, onImport, onBack } = $props()

  let filter = $state('all')

  const summary = $derived(summarizeRows(rows))
  const filtered = $derived(
    filter === 'all' ? rows : rows.filter((row) => row.level === filter),
  )
  const tabs = $derived([
    { key: 'all', label: 'Semua', count: rows.length },
    { key: 'valid', label: 'Valid', count: summary.valid },
    { key: 'warning', label: 'Warning', count: summary.warning },
    { key: 'error', label: 'Error', count: summary.error },
  ])

  const levelStyle = {
    valid: 'bg-status-ready/15 text-status-ready',
    warning: 'bg-status-warning/15 text-status-warning',
    error: 'bg-status-error-row text-error',
  }

  function rowClass(row) {
    if (row.level === 'error') {
      return 'bg-status-error-row/40'
    }
    if (row.level === 'warning') {
      return 'bg-status-warning/5'
    }
    return ''
  }
</script>

<div class="space-y-4">
  <div class="flex flex-wrap items-center justify-between gap-2">
    <p class="text-body-md text-on-surface-variant" aria-live="polite">
      <span class="font-semibold text-on-surface">{summary.selected}</span> dipilih ·
      {summary.valid} valid · {summary.warning} warning · {summary.error} error
    </p>
    <div class="flex gap-1">
      <button type="button" class="btn btn-ghost min-h-9 px-3 text-label-md" onclick={() => onToggleAll(true)}>
        Pilih Semua Valid
      </button>
      <button type="button" class="btn btn-ghost min-h-9 px-3 text-label-md" onclick={() => onToggleAll(false)}>
        Lepas Semua
      </button>
    </div>
  </div>

  <div class="scrollbar-none flex gap-1 overflow-x-auto" role="tablist" aria-label="Filter baris import">
    {#each tabs as tab (tab.key)}
      <button
        type="button"
        role="tab"
        aria-selected={filter === tab.key}
        class="chip whitespace-nowrap transition {filter === tab.key
          ? 'bg-primary-container text-primary-on-container'
          : 'bg-surface-high text-on-surface-variant hover:text-on-surface'}"
        onclick={() => (filter = tab.key)}
      >
        {tab.label}
        <span class="tabular-nums opacity-70">{tab.count}</span>
      </button>
    {/each}
  </div>

  <div class="table-shell max-h-[45vh] overflow-auto">
    <table class="w-full min-w-[680px] border-collapse text-left">
      <thead class="sticky top-0 z-10 bg-surface-container text-label-md uppercase tracking-wide text-on-surface-variant">
        <tr>
          <th class="w-12 px-3 py-2.5 font-medium"><span class="sr-only">Pilih</span></th>
          <th class="px-3 py-2.5 font-medium">Kanji</th>
          <th class="px-3 py-2.5 font-medium">Hira</th>
          <th class="px-3 py-2.5 font-medium">Romaji</th>
          <th class="px-3 py-2.5 font-medium">Arti</th>
          <th class="px-3 py-2.5 font-medium">Status</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-outline-variant/60">
        {#each filtered as row (row.index)}
          <tr class={rowClass(row)}>
            <td class="px-3 py-2">
              <input
                type="checkbox"
                class="h-4 w-4 accent-primary"
                checked={row.selected}
                disabled={row.level === 'error'}
                onchange={() => onToggleRow(row.index)}
                aria-label={`Pilih baris ${row.index + 1}`}
              />
            </td>
            <td class="px-3 py-2 font-jp text-body-md">{row.kanji || '—'}</td>
            <td class="px-3 py-2 font-jp text-body-md text-on-surface-variant">{row.hira || '—'}</td>
            <td class="px-3 py-2 text-body-md text-on-surface-variant">{row.romaji || '—'}</td>
            <td class="px-3 py-2 text-body-md">{row.arti || '—'}</td>
            <td class="px-3 py-2">
              <span class="chip {levelStyle[row.level]}">{row.level}</span>
              {#if row.messages.length > 0}
                <p class="mt-1 max-w-48 text-label-md text-on-surface-variant">{row.messages.join(' ')}</p>
              {/if}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
    <button type="button" class="btn btn-ghost" onclick={onBack}>← Ganti JSON</button>
    <button
      type="button"
      class="btn btn-primary"
      disabled={summary.selected === 0}
      onclick={() => onImport(selectedPayload(rows))}
    >
      Import {summary.selected} {noun}
    </button>
  </div>
</div>
