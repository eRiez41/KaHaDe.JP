<script>
  import { onMount } from 'svelte'

  import { dismissToast, pushToast, toasts } from '../lib/toast.svelte.js'

  const styles = {
    success: 'border-status-ready/30 bg-status-ready/10 text-status-ready',
    error: 'border-error/30 bg-error/10 text-error',
    info: 'border-outline-variant/70 bg-surface-high text-on-surface',
  }

  onMount(() => {
    const handlePlayerToast = (event) => {
      pushToast(event.detail?.message, 'error')
    }
    window.addEventListener('audio-player-toast', handlePlayerToast)
    return () => window.removeEventListener('audio-player-toast', handlePlayerToast)
  })
</script>

<div
  class="pointer-events-none fixed inset-x-0 bottom-24 z-[90] flex flex-col items-center gap-2 px-4 sm:bottom-28"
  aria-live="polite"
  aria-atomic="false"
>
  {#each toasts as item (item.id)}
    <div
      class="pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-lg border px-4 py-3 shadow-level-4 backdrop-blur-sm transition-all duration-200 animate-toast-in {styles[
        item.type
      ] || styles.info}"
      role={item.type === 'error' ? 'alert' : 'status'}
    >
      <span class="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-current/15">
        {#if item.type === 'success'}
          <svg viewBox="0 0 20 20" class="h-3.5 w-3.5" fill="currentColor" aria-hidden="true">
            <path
              d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0L3.3 9.7a1 1 0 1 1 1.4-1.4l3.8 3.8 6.8-6.8a1 1 0 0 1 1.4 0Z"
            />
          </svg>
        {:else if item.type === 'error'}
          <svg viewBox="0 0 20 20" class="h-3.5 w-3.5" fill="currentColor" aria-hidden="true">
            <path
              d="M10 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16Zm1 11H9v-2h2v2Zm0-3H9V5h2v5Z"
            />
          </svg>
        {:else}
          <svg viewBox="0 0 20 20" class="h-3.5 w-3.5" fill="currentColor" aria-hidden="true">
            <path d="M10 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16Zm1 11H9v-2h2v2Zm0-3H9V5h2v5Z" />
          </svg>
        {/if}
      </span>

      <p class="min-w-0 flex-1 text-body-md font-medium">{item.message}</p>

      <button
        type="button"
        class="icon-btn -mr-2 -mt-1 h-8 w-8"
        aria-label="Tutup notifikasi"
        onclick={() => dismissToast(item.id)}
      >
        <svg viewBox="0 0 20 20" class="h-4 w-4" fill="currentColor" aria-hidden="true">
          <path
            d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z"
          />
        </svg>
      </button>
    </div>
  {/each}
</div>
