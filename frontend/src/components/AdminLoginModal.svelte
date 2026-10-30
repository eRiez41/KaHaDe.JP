<script>
  let { open = false, onClose, onSuccess, error = '' } = $props()
  let inputEl = $state(null)
  let password = $state('')
  let submitting = $state(false)

  $effect(() => {
    if (open) {
      password = ''
      submitting = false
      setTimeout(() => inputEl?.focus(), 50)
    }
  })

  function submit(e) {
    e.preventDefault()
    if (submitting) {
      return
    }
    submitting = true
    onSuccess?.(password)
    submitting = false
  }

  function handleClose() {
    onClose?.()
  }
</script>

<div
  class:hidden={!open}
  class="fixed inset-0 z-[95] flex items-end justify-center bg-black/40 p-0 backdrop-blur-sm sm:items-center sm:p-4"
  role="dialog"
  aria-modal="true"
  aria-labelledby="admin-login-title"
>
  <button
    type="button"
    class="absolute inset-0 cursor-default"
    aria-label="Tutup dialog"
    onclick={handleClose}
  ></button>
  <div
    class="relative w-full max-w-sm rounded-t-2xl border border-outline-variant/70 bg-surface-high p-5 shadow-level-5 sm:rounded-xl"
  >
    <div class="mb-4 flex items-start justify-between gap-3">
      <div class="space-y-1">
        <h2 id="admin-login-title" class="text-title-lg">Mode Admin</h2>
        <p class="text-body-md text-on-surface-variant">Masukkan password untuk mengaktifkan mode edit.</p>
      </div>
      <button type="button" class="icon-btn -mr-2 -mt-2" aria-label="Tutup" onclick={handleClose}>
        <svg viewBox="0 0 20 20" class="h-5 w-5" fill="currentColor" aria-hidden="true">
          <path
            d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z"
          />
        </svg>
      </button>
    </div>

    <form class="space-y-4" onsubmit={submit}>
      <div class="space-y-1.5">
        <label for="admin-pass" class="label">Password</label>
        <input
          id="admin-pass"
          bind:this={inputEl}
          type="password"
          class="field"
          autocomplete="current-password"
          bind:value={password}
        />
      </div>
      {#if error}
        <p class="rounded-md bg-error/10 px-3 py-2 text-body-md text-error" role="alert">{error}</p>
      {/if}
      <div class="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
        <button type="button" class="btn btn-ghost" onclick={handleClose}>Batal</button>
        <button type="submit" class="btn btn-primary">Masuk</button>
      </div>
    </form>
  </div>
</div>
