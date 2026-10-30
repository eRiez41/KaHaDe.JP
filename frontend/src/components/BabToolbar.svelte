<script>
  let {
    itemCount = 0,
    audioReady = 0,
    selectedCount = 0,
    allSelected = false,
    generating = false,
    generatingCount = 0,
    generatingTotal = 0,
    generatingProgress = 0,
    downloading = false,
    exporting = false,
    onAdd,
    onImport,
    onPlayAll,
    onGenerateAll,
    onDownloadAll,
    onExport,
    onToggleAll,
    onGenerateSelected,
    onExportSelected,
    onDeleteSelected,
    onClearSelection,
    isAdmin = true,
  } = $props()

  const canPlay = $derived(itemCount > 0 && audioReady > 0)
</script>

<div class="space-y-3">
  <div class="card flex flex-wrap items-center gap-2 p-3">
    {#if isAdmin}
      <button type="button" class="btn btn-primary" onclick={onAdd}>
        <svg viewBox="0 0 20 20" class="h-4 w-4" fill="currentColor" aria-hidden="true">
          <path d="M10 4a1 1 0 0 1 1 1v4h4a1 1 0 1 1 0 2h-4v4a1 1 0 1 1-2 0v-4H5a1 1 0 1 1 0-2h4V5a1 1 0 0 1 1-1Z" />
        </svg>
        Tambah Kata
      </button>

      <button type="button" class="btn btn-tonal" onclick={onImport}>
        <svg viewBox="0 0 20 20" class="h-4 w-4" fill="currentColor" aria-hidden="true">
          <path d="M10 3a1 1 0 0 1 .7.3l3 3a1 1 0 0 1-1.4 1.4L11 6.4V12a1 1 0 1 1-2 0V6.4L7.7 7.7a1 1 0 0 1-1.4-1.4l3-3A1 1 0 0 1 10 3Z" />
          <path d="M4 12a1 1 0 0 1 1 1v3h10v-3a1 1 0 1 1 2 0v4a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1Z" />
        </svg>
        Import JSON
      </button>

      <span class="mx-1 hidden h-6 w-px bg-outline-variant/70 sm:block"></span>
    {/if}

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
      disabled={!canPlay || downloading}
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
        class="btn btn-ghost"
        disabled={itemCount === 0 || exporting}
        onclick={onExport}
      >
        <svg viewBox="0 0 20 20" class="h-4 w-4" fill="currentColor" aria-hidden="true">
          <path d="M10 2a1 1 0 0 1 1 1v4h3a1 1 0 0 1 .7 1.7l-4 4a1 1 0 0 1-1.4 0l-4-4A1 1 0 0 1 6 7h3V3a1 1 0 0 1 1-1Z" />
          <path d="M4 14a1 1 0 0 1 1 1v1h10v-1a1 1 0 1 1 2 0v2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1Z" />
        </svg>
        {exporting ? 'Menyiapkan...' : 'Export JSON'}
      </button>
    {/if}

    {#if isAdmin}
      <div class="ml-auto flex items-center gap-1">
        <button
          type="button"
          class="btn btn-ghost min-h-9 px-3 text-label-md"
          disabled={itemCount === 0}
          onclick={() => onToggleAll(!allSelected)}
        >
          {allSelected ? 'Lepas Semua' : 'Pilih Semua'}
        </button>
      </div>
    {/if}
  </div>

  {#if generating}
    <div class="card space-y-2 p-3" aria-live="polite">
      <div class="flex items-center justify-between text-label-lg text-on-surface-variant">
        <span>Membuat audio...</span>
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

  {#if isAdmin && selectedCount > 0}
    <div
      class="flex flex-wrap items-center gap-2 rounded-lg bg-primary-container p-2.5 pl-4 text-primary-on-container"
      role="region"
      aria-label="Aksi untuk kata terpilih"
    >
      <p class="mr-auto text-label-lg font-semibold">{selectedCount} kata dipilih</p>

      <button
        type="button"
        class="btn btn-ghost min-h-9 px-3 text-label-md text-primary-on-container hover:bg-on-primary-container/10"
        disabled={generating}
        onclick={onGenerateSelected}
      >
        {#if generating}
          <svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        {:else}
          <svg viewBox="0 0 20 20" class="h-4 w-4" fill="currentColor" aria-hidden="true">
            <path d="M10 2a1 1 0 0 1 1 1v2.1a5 5 0 0 1 3.9 3.9H17a1 1 0 1 1 0 2h-2.1a5 5 0 0 1-3.9 3.9V17a1 1 0 1 1-2 0v-2.1A5 5 0 0 1 5.1 11H3a1 1 0 1 1 0-2h2.1A5 5 0 0 1 9 5.1V3a1 1 0 0 1 1-1Zm0 5a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
          </svg>
        {/if}
        Generate
      </button>
      <button
        type="button"
        class="btn btn-ghost min-h-9 px-3 text-label-md text-primary-on-container hover:bg-on-primary-container/10"
        disabled={exporting}
        onclick={onExportSelected}
      >
        Export
      </button>
      <button
        type="button"
        class="btn min-h-9 bg-error px-3 text-label-md text-error-foreground"
        onclick={onDeleteSelected}
      >
        Hapus
      </button>
      <button
        type="button"
        class="btn btn-ghost min-h-9 px-3 text-label-md text-primary-on-container hover:bg-on-primary-container/10"
        onclick={onClearSelection}
      >
        Batal
      </button>
    </div>
  {/if}
</div>
