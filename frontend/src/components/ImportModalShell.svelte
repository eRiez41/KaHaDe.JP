<script>
  import { tick } from 'svelte'

  let { open = false, title = '', step = 1, closable = true, onClose, children } = $props()

  let panel = $state(null)
  let wasOpen = false

  $effect(() => {
    if (open && !wasOpen) {
      tick().then(() => {
        panel?.querySelector('[data-autofocus]')?.focus()
      })
    }
    wasOpen = open
  })

  $effect(() => {
    if (!open) {
      return
    }
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  })

  function handleKeydown(event) {
    if (!open) {
      return
    }
    if (event.key === 'Escape') {
      if (closable) {
        onClose?.()
      }
      return
    }
    if (event.key !== 'Tab' || !panel) {
      return
    }

    const nodes = [
      ...panel.querySelectorAll(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled])',
      ),
    ].filter((node) => node.offsetParent !== null)

    if (nodes.length === 0) {
      return
    }
    const first = nodes[0]
    const last = nodes[nodes.length - 1]
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
  <div
    class="fixed inset-0 z-[85] flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center sm:p-4"
    role="dialog"
    aria-modal="true"
    aria-labelledby="import-title"
  >
    <button
      type="button"
      class="absolute inset-0 cursor-default"
      onclick={onClose}
      aria-label="Tutup import"
    ></button>

    <div
      bind:this={panel}
      class="relative flex max-h-[92dvh] w-full max-w-3xl flex-col overflow-hidden rounded-t-2xl border border-outline-variant/70 bg-surface-high shadow-level-5 sm:rounded-xl"
    >
      <header class="flex items-start justify-between gap-3 border-b border-outline-variant/60 p-4 sm:p-5">
        <div class="space-y-1">
          <p class="text-label-md text-primary">Langkah {step} dari 4</p>
          <h2 id="import-title" class="text-title-lg">{title}</h2>
        </div>
        <button
          type="button"
          class="icon-btn -mr-2 -mt-2"
          data-autofocus
          onclick={onClose}
          disabled={!closable}
          aria-label="Tutup import"
        >
          <svg viewBox="0 0 20 20" class="h-5 w-5" fill="currentColor" aria-hidden="true">
            <path
              d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z"
            />
          </svg>
        </button>
      </header>

      <div class="flex-1 overflow-y-auto p-4 sm:p-5">
        {@render children?.()}
      </div>
    </div>
  </div>
{/if}
