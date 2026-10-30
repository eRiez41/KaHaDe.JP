<script>
  import { babStore, loadBabs } from '../lib/stores/data.svelte.js'
  import { onMount } from 'svelte'

  let { bab = null, itemCount = 0, audioReady = 0, onRename = null } = $props()

  onMount(() => {
    if (babStore.status === 'idle') {
      loadBabs()
    }
  })

  const nextBab = $derived.by(() => {
    if (!bab || babStore.items.length === 0) {
      return null
    }
    const sorted = [...babStore.items].sort((a, b) => a.id - b.id)
    const index = sorted.findIndex((item) => item.id === bab.id)
    if (index === -1 || index === sorted.length - 1) {
      return null
    }
    return sorted[index + 1]
  })
</script>

<header class="space-y-4">
  <div class="flex flex-wrap items-center justify-between gap-2">
    <a
      href="#bab"
      class="inline-flex items-center gap-1.5 rounded-full py-1 pr-3 text-label-lg text-on-surface-variant transition-colors hover:text-on-surface"
    >
      <svg viewBox="0 0 20 20" class="h-4 w-4" fill="currentColor" aria-hidden="true">
        <path
          d="M12.7 4.3a1 1 0 0 1 0 1.4L8.4 10l4.3 4.3a1 1 0 1 1-1.4 1.4l-5-5a1 1 0 0 1 0-1.4l5-5a1 1 0 0 1 1.4 0Z"
        />
      </svg>
      Kembali ke daftar bab
    </a>

    {#if nextBab}
      <a
        href={`#bab/${nextBab.id}`}
        class="inline-flex items-center gap-1.5 rounded-full py-1 pl-3 pr-1.5 text-label-lg text-on-surface-variant transition-colors hover:text-on-surface"
      >
        Lanjut ke {nextBab.nama}
        <svg viewBox="0 0 20 20" class="h-4 w-4" fill="currentColor" aria-hidden="true">
          <path
            d="M7.3 4.3a1 1 0 0 1 1.4 0l5 5a1 1 0 0 1 0 1.4l-5 5a1 1 0 1 1-1.4-1.4L11.6 10 7.3 5.7a1 1 0 0 1 0-1.4Z"
          />
        </svg>
      </a>
    {/if}
  </div>

  <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
    <div class="min-w-0 space-y-2">
      <h1 class="break-words text-headline-lg font-bold tracking-tight sm:text-headline-xl">
        {bab?.nama || 'Memuat bab...'}
      </h1>

      {#if bab}
        <div class="flex flex-wrap items-center gap-2">
          <span class="chip bg-surface-high text-on-surface-variant">
            {itemCount} kata
          </span>
          <span
            class="chip {audioReady === itemCount && itemCount > 0
              ? 'bg-status-ready/15 text-status-ready'
              : 'bg-status-pending/15 text-status-pending'}"
          >
            Audio {audioReady}/{itemCount}
          </span>
          {#if itemCount > 0}
            <span class="text-label-md text-on-surface-variant">
              {Math.round((audioReady / itemCount) * 100)}% siap diputar
            </span>
          {/if}
        </div>
      {/if}
    </div>

    {#if bab && typeof onRename === 'function'}
      <button type="button" class="btn btn-outline" onclick={onRename}>
        <svg viewBox="0 0 20 20" class="h-4 w-4" fill="currentColor" aria-hidden="true">
          <path
            d="M13.6 2.3a2 2 0 0 1 2.8 0l1.3 1.3a2 2 0 0 1 0 2.8l-8.9 8.9a2 2 0 0 1-.9.5l-3.4.8a1 1 0 0 1-1.2-1.2l.8-3.4a2 2 0 0 1 .5-.9l9-8.8Zm-8.2 9.9-.5 2.1 2.1-.5 8.7-8.7-1.6-1.6-8.7 8.7Z"
          />
        </svg>
        Edit Nama
      </button>
    {/if}
  </div>
</header>
