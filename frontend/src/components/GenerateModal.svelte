<script>
  import { fade, scale } from 'svelte/transition'
  import { audioGeneration } from '../lib/audio-generation.svelte.js'
  import { generateUi } from '../lib/generate-ui.svelte.js'

  const isGenerating = $derived(audioGeneration.isGenerating)
  const count = $derived(audioGeneration.count)
  const total = $derived(audioGeneration.total)
  const progress = $derived(audioGeneration.progress)

  $effect(() => {
    if (isGenerating && !generateUi.open) {
      generateUi.openModal()
    }
  })

  function close() {
    generateUi.closeModal()
  }
</script>

{#if generateUi.open}
  <div
    class="fixed inset-0 z-[95] grid place-items-center px-4"
    transition:fade={{ duration: 150 }}
    role="dialog"
    aria-modal="true"
    aria-labelledby="generate-modal-title"
  >
    <button
      type="button"
      class="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
      aria-label="Tutup modal generate"
      onclick={close}
    ></button>

    <div
      class="relative w-full max-w-md overflow-hidden rounded-xl border border-outline-variant/70 bg-surface shadow-level-4"
      transition:scale={{ start: 0.98, duration: 160 }}
      role="document"
    >
      <div class="flex items-start gap-3 p-5">
        <div class="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary-container text-primary-on-container">
          <svg class="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
        <div class="flex-1 space-y-1">
          <h2 id="generate-modal-title" class="text-title-md">Membuat Audio</h2>
          <p class="text-body-md text-on-surface-variant">
            Proses berjalan di latar belakang. Kamu bisa tutup modal ini kapan saja.
          </p>
        </div>
        <button type="button" class="icon-btn -mr-1 -mt-1" aria-label="Tutup" onclick={close}>
          <svg viewBox="0 0 20 20" class="h-4 w-4" fill="currentColor" aria-hidden="true">
            <path
              d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z"
            />
          </svg>
        </button>
      </div>

      <div class="space-y-3 px-5 pb-5">
        <div class="flex items-center justify-between text-label-lg text-on-surface-variant">
          <span>{isGenerating ? 'Sedang diproses' : 'Selesai'}</span>
          <span class="tabular-nums">{count}/{total}</span>
        </div>
        <div class="h-2 overflow-hidden rounded-full bg-surface-high">
          <div
            class="h-full rounded-full bg-primary transition-all duration-300 ease-out"
            style={`width: ${progress}%`}
          ></div>
        </div>
        <p class="text-label-md text-on-surface-variant">
          {#if isGenerating}
            Tunggu sebentar, audio sedang dibuat...
          {:else}
            Semua proses telah selesai.
          {/if}
        </p>
      </div>
    </div>
  </div>
{/if}
