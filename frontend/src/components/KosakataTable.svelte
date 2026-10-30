<script>
  import { playerState } from '../lib/stores/player.js'
  import { keepRowVisible } from '../lib/scroll-active-row.js'
  import EditableCell from './EditableCell.svelte'
  import KosakataRowActions from './KosakataRowActions.svelte'

  let {
    items = [],
    selectedIds = new Set(),
    generatingIds = new Set(),
    onToggle,
    onToggleAll,
    onSave,
    onDelete,
    onGenerate,
    onPlay,
    readOnly = false,
  } = $props()

  let selectAllEl = $state(null)
  let shellEl = $state(null)

  const activeItemId = $derived($playerState.current?.itemId ?? null)
  const allSelected = $derived(items.length > 0 && items.every((item) => selectedIds.has(item.id)))
  const someSelected = $derived(items.some((item) => selectedIds.has(item.id)))

  $effect(() => {
    if (selectAllEl) {
      selectAllEl.indeterminate = someSelected && !allSelected
    }
  })

  // Keep the row that is currently playing inside the table viewport.
  // Only the table scrolls; the page itself stays where the user left it.
  $effect(() => {
    const itemId = activeItemId
    if (!itemId || !shellEl) return
    const row = shellEl.querySelector('tr[aria-current="true"]')
    if (row) keepRowVisible(shellEl, row)
  })

  function saveField(item, field, value) {
    if (readOnly || typeof onSave !== 'function') return
    return onSave(item.id, { [field]: value })
  }

  function audioMeta(status) {
    if (status === 'ready') return { label: 'Siap', class: 'bg-status-ready/15 text-status-ready' }
    if (status === 'failed') return { label: 'Gagal', class: 'bg-status-failed/15 text-status-failed' }
    return { label: 'Belum', class: 'bg-status-pending/15 text-status-pending' }
  }
</script>

<div bind:this={shellEl} class="table-shell overflow-auto" style="max-height: min(68vh, 52rem)">
  <!-- min-width disesuaikan: admin butuh 860px, non-admin cukup 640px -->
  <table
    class="w-full {readOnly ? 'min-w-[640px]' : 'min-w-[860px]'} border-collapse text-left"
  >
    <thead
      class="sticky top-0 z-10 bg-surface-high text-label-md uppercase tracking-wide text-on-surface-variant"
    >
      <tr>
        {#if !readOnly}
          <th class="w-12 px-3 py-3">
            <input
              bind:this={selectAllEl}
              type="checkbox"
              class="h-4 w-4 cursor-pointer"
              checked={allSelected}
              onchange={() => onToggleAll?.(!allSelected)}
              aria-label="Pilih semua kata"
            />
          </th>
        {/if}
        <th class="w-12 px-2 py-3 text-center font-medium">No</th>
        <th class="w-[18%] px-3 py-3 font-medium">Kanji</th>
        <th class="w-[22%] px-3 py-3 font-medium">Hira / Kata</th>
        <th class="w-[20%] px-3 py-3 font-medium">Romaji</th>
        <th class="px-3 py-3 font-medium">Arti</th>
        {#if !readOnly}
          <th class="w-24 px-3 py-3 font-medium">Audio</th>
          <th class="w-36 px-3 py-3 text-right font-medium">Aksi</th>
        {/if}
      </tr>
    </thead>

    <tbody class="divide-y divide-outline-variant/50">
      {#each items as item, index (item.id)}
        {@const active = activeItemId === item.id}
        {@const audio = audioMeta(item.audioStatus)}
        <tr
          class="align-middle transition-colors {active
            ? 'bg-primary/10'
            : 'hover:bg-on-surface/[0.03]'}"
          aria-current={active ? 'true' : undefined}
        >
          {#if !readOnly}
            <td class="px-3 py-2">
              <input
                type="checkbox"
                class="h-4 w-4 cursor-pointer"
                checked={selectedIds.has(item.id)}
                onchange={() => onToggle?.(item.id)}
                aria-label={`Pilih ${item.kanji || item.hira || `kata ${index + 1}`}`}
              />
            </td>
          {/if}

          <td class="w-12 px-2 py-2.5 text-center text-label-md tabular-nums text-on-surface-variant align-middle">
            {index + 1}
          </td>

          <td class="px-2 py-2">
            <div class="flex items-center gap-1.5">
              {#if active}
                <span class="h-2 w-2 shrink-0 rounded-full bg-primary" aria-hidden="true"></span>
              {/if}
              <EditableCell
                value={item.kanji}
                label="kanji"
                jp
                strong
                readOnly={readOnly}
                onCommit={(value) => saveField(item, 'kanji', value)}
              />
            </div>
          </td>

          <td class="px-2 py-2">
            <EditableCell
              value={item.hira}
              label="hira"
              jp
              readOnly={readOnly}
              onCommit={(value) => saveField(item, 'hira', value)}
            />
          </td>

          <td class="px-2 py-2">
            <EditableCell
              value={item.romaji}
              label="romaji"
              readOnly={readOnly}
              onCommit={(value) => saveField(item, 'romaji', value)}
            />
          </td>

          <td class="px-2 py-2">
            <EditableCell
              value={item.arti}
              label="arti"
              readOnly={readOnly}
              onCommit={(value) => saveField(item, 'arti', value)}
            />
          </td>

          {#if !readOnly}
            <td class="px-3 py-2">
              <span class="chip {audio.class}" title={`Status audio: ${audio.label}`}>
                <span class="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true"></span>
                {audio.label}
              </span>
            </td>

            <td class="px-3 py-2">
              <KosakataRowActions
                {item}
                generating={generatingIds.has(item.id)}
                {onPlay}
                onGenerate={onGenerate}
                onDelete={onDelete}
                readOnly={readOnly}
              />
            </td>
          {/if}
        </tr>
      {/each}
    </tbody>
  </table>
</div>