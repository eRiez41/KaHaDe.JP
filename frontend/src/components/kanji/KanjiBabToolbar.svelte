<script>
  let {
    selectedBabId = $bindable('all'),
    mode = $bindable('kata'),
    babOptions = [],
    count = 0,
    onFlashcard,
  } = $props()
</script>

<div class="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
  <div class="flex flex-wrap items-center gap-2">
    <label for="kanji-bab" class="label">Bab</label>
    <select id="kanji-bab" class="field w-full sm:w-64" bind:value={selectedBabId}>
      <option value="all">Semua Bab</option>
      {#each babOptions as bab (bab.id)}
        <option value={String(bab.id)}>{bab.nama}</option>
      {/each}
    </select>

    <div class="flex rounded-full bg-surface-high p-1" role="group" aria-label="Mode rekap">
      <button
        type="button"
        class="rounded-full px-3.5 py-1.5 text-label-md font-medium transition-colors {mode ===
        'kata'
          ? 'bg-primary-container text-primary-on-container'
          : 'text-on-surface-variant hover:text-on-surface'}"
        aria-pressed={mode === 'kata'}
        onclick={() => (mode = 'kata')}
      >
        Kata
      </button>
      <button
        type="button"
        class="rounded-full px-3.5 py-1.5 text-label-md font-medium transition-colors {mode ===
        'karakter'
          ? 'bg-primary-container text-primary-on-container'
          : 'text-on-surface-variant hover:text-on-surface'}"
        aria-pressed={mode === 'karakter'}
        onclick={() => (mode = 'karakter')}
      >
        Karakter
      </button>
    </div>
  </div>

  <button type="button" class="btn btn-tonal" disabled={count === 0} onclick={onFlashcard}>
    <svg viewBox="0 0 20 20" class="h-4 w-4" fill="currentColor" aria-hidden="true">
      <path d="M3 4.5A1.5 1.5 0 0 1 4.5 3h8A1.5 1.5 0 0 1 14 4.5v7a1.5 1.5 0 0 1-1.5 1.5h-8A1.5 1.5 0 0 1 3 11.5v-7Zm11 1.5h1.5A1.5 1.5 0 0 1 17 7.5v7a1.5 1.5 0 0 1-1.5 1.5h-8A1.5 1.5 0 0 1 6 14.5V14h7.5A1.5 1.5 0 0 0 15 12.5V6Z" />
    </svg>
    Flashcard
    <span class="text-label-md opacity-70">({count})</span>
  </button>
</div>
