<script>
  let { item, generating = false, onPlay, onGenerate, onDelete, readOnly = false } = $props()

  const label = $derived(item.kanji || item.hira || item.arti)
  const actionLabel = $derived(
    generating
      ? 'Membuat audio...'
      : item.audioStatus === 'ready'
        ? 'Buat ulang audio'
        : 'Buat audio',
  )
</script>

<div class="flex items-center justify-end gap-0.5">
  <button
    type="button"
    class="icon-btn h-10 w-10"
    disabled={item.audioStatus !== 'ready'}
    onclick={() => onPlay(item)}
    title="Putar audio"
    aria-label={`Putar ${label}`}
  >
    <svg viewBox="0 0 20 20" class="h-4 w-4" fill="currentColor" aria-hidden="true">
      <path d="M6 4.5v11a1 1 0 0 0 1.5.9l9-5.5a1 1 0 0 0 0-1.8l-9-5.5A1 1 0 0 0 6 4.5Z" />
    </svg>
  </button>

  {#if !readOnly}
    <button
      type="button"
      class="icon-btn h-10 w-10"
      class:text-primary={item.audioStatus === 'ready'}
      disabled={generating || typeof onGenerate !== 'function'}
      onclick={() => onGenerate?.(item)}
      title={actionLabel}
      aria-label={actionLabel}
    >
      {#if generating}
        <span
          class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden="true"
        ></span>
      {:else}
        <svg viewBox="0 0 20 20" class="h-4 w-4" fill="currentColor" aria-hidden="true">
          <path
            d="M10 3a.75.75 0 0 1 .75.75v5.5h5.5a.75.75 0 0 1 0 1.5h-5.5v5.5a.75.75 0 0 1-1.5 0v-5.5h-5.5a.75.75 0 0 1 0-1.5h5.5v-5.5A.75.75 0 0 1 10 3Z"
          />
        </svg>
      {/if}
    </button>

    <button
      type="button"
      class="icon-btn h-10 w-10 text-error hover:bg-error/10 hover:text-error"
      disabled={generating}
      onclick={() => onDelete?.(item)}
      title="Hapus kata"
      aria-label={`Hapus ${label}`}
    >
      <svg viewBox="0 0 20 20" class="h-4 w-4" fill="currentColor" aria-hidden="true">
        <path
          fill-rule="evenodd"
          d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z"
          clip-rule="evenodd"
        />
      </svg>
    </button>
  {/if}
</div>
