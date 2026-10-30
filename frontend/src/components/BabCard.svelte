<script>
  let {
    bab,
    onRename,
    onDelete,
    onPlay,
    onDownload,
    onExport,
  } = $props()

  let menuEl = $state(null)

  const percent = $derived(
    bab.countKosakata ? Math.round((bab.audioReadyCount / bab.countKosakata) * 100) : 0,
  )

  function run(handler) {
    menuEl?.removeAttribute('open')
    handler?.(bab)
  }

  const hasAction = $derived(typeof onRename === 'function' || typeof onDelete === 'function')
</script>

<article class="card card-hover flex flex-col p-5">
  <div class="flex-1 space-y-3">
    <div class="flex items-start justify-between gap-2">
      <h2 class="min-w-0 break-words text-title-lg">
        <a
          href={`#bab/${bab.id}`}
          class="rounded-sm transition-colors hover:text-primary focus-visible:text-primary"
        >
          {bab.nama}
        </a>
      </h2>
      <span class="chip shrink-0 bg-primary-container text-primary-on-container tabular-nums">
        {bab.countKosakata} kata
      </span>
    </div>

    <div class="space-y-1.5">
      <div class="flex items-center justify-between text-label-md text-on-surface-variant">
        <span>Audio siap</span>
        <span class="tabular-nums">{bab.audioReadyCount}/{bab.countKosakata} · {percent}%</span>
      </div>
      <div class="h-1.5 overflow-hidden rounded-full bg-surface-high" aria-hidden="true">
        <div
          class="h-full rounded-full bg-primary transition-[width] duration-300"
          style={`width: ${percent}%`}
        ></div>
      </div>
    </div>
  </div>

  <div class="mt-4 flex items-center gap-2 border-t border-outline-variant/50 pt-4">
    <a href={`#bab/${bab.id}`} class="btn btn-tonal min-h-10 flex-1 px-4 text-label-md">
      Buka Bab
    </a>

    <button
      type="button"
      class="icon-btn h-10 w-10"
      disabled={bab.audioReadyCount === 0}
      onclick={() => onPlay(bab)}
      title="Putar semua audio"
      aria-label={`Putar semua audio ${bab.nama}`}
    >
      <svg viewBox="0 0 20 20" class="h-4 w-4" fill="currentColor" aria-hidden="true">
        <path d="M6 4.5v11a1 1 0 0 0 1.5.9l9-5.5a1 1 0 0 0 0-1.8l-9-5.5A1 1 0 0 0 6 4.5Z" />
      </svg>
    </button>

    <details bind:this={menuEl} class="relative">
      <summary
        class="icon-btn h-10 w-10 cursor-pointer list-none [&::-webkit-details-marker]:hidden"
        aria-label={`Aksi untuk ${bab.nama}`}
        title="Aksi lain"
      >
        <svg viewBox="0 0 20 20" class="h-5 w-5" fill="currentColor" aria-hidden="true">
          <path d="M10 6.5a1.75 1.75 0 1 1 0-3.5 1.75 1.75 0 0 1 0 3.5Zm0 5.25a1.75 1.75 0 1 1 0-3.5 1.75 1.75 0 0 1 0 3.5Zm0 5.25a1.75 1.75 0 1 1 0-3.5 1.75 1.75 0 0 1 0 3.5Z" />
        </svg>
      </summary>

      <div
        class="absolute right-0 z-20 mt-1 w-48 overflow-hidden rounded-md border border-outline-variant/70 bg-surface-high py-1 shadow-level-3"
      >
        {#if hasAction}
          {#if typeof onRename === 'function'}
            <button type="button" class="menu-item" onclick={() => run(onRename)}>Rename</button>
          {/if}
          <button type="button" class="menu-item" onclick={() => run(onPlay)}>Play All</button>
          <button
            type="button"
            class="menu-item"
            disabled={bab.audioReadyCount === 0}
            onclick={() => run(onDownload)}
          >
            Download Audio
          </button>
          <button type="button" class="menu-item" onclick={() => run(onExport)}>Export JSON</button>
          {#if typeof onDelete === 'function'}
            <div class="my-1 h-px bg-outline-variant/60"></div>
            <button
              type="button"
              class="menu-item text-error hover:bg-error/10 hover:text-error"
              onclick={() => run(onDelete)}
            >
              Hapus Bab
            </button>
          {/if}
        {:else}
          <button type="button" class="menu-item" onclick={() => run(onPlay)}>Play All</button>
          <button
            type="button"
            class="menu-item"
            disabled={bab.audioReadyCount === 0}
            onclick={() => run(onDownload)}
          >
            Download Audio
          </button>
          <button type="button" class="menu-item" onclick={() => run(onExport)}>Export JSON</button>
        {/if}
      </div>
    </details>
  </div>
</article>
