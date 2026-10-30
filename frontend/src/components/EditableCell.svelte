<script>
  import { tick } from 'svelte'

  let { value = '', label = '', jp = false, strong = false, onCommit, readOnly = false } = $props()

  let editing = $state(false)
  let draft = $state('')
  let saving = $state(false)
  let error = $state('')
  let inputEl = $state(null)

  async function startEditing() {
    if (saving || readOnly) {
      return
    }
    draft = value ?? ''
    error = ''
    editing = true
    await tick()
    inputEl?.focus()
    inputEl?.select()
  }

  function cancelEditing() {
    if (saving) {
      return
    }
    editing = false
    error = ''
  }

  async function commit() {
    if (!editing || saving) {
      return
    }

    const next = draft.trim()
    if (next === (value ?? '')) {
      editing = false
      return
    }

    saving = true
    error = ''

    try {
      await onCommit(next)
      editing = false
    } catch (commitError) {
      error = commitError?.message || 'Gagal menyimpan perubahan.'
    } finally {
      saving = false
    }
  }

  function handleKeydown(event) {
    if (event.key === 'Enter') {
      event.preventDefault()
      commit()
    } else if (event.key === 'Escape') {
      event.preventDefault()
      cancelEditing()
    }
  }
</script>

{#if editing}
  <div class="min-w-32">
    <input
      bind:this={inputEl}
      bind:value={draft}
      type="text"
      aria-label={`Edit ${label}`}
      class="field min-h-9 px-2.5 py-1 text-body-md"
      class:font-jp={jp}
      class:font-semibold={strong}
      onkeydown={handleKeydown}
      onblur={commit}
    />
    {#if error}
      <p class="mt-1 text-label-md text-error" role="alert">{error}</p>
    {:else if saving}
      <p class="mt-1 text-label-md text-on-surface-variant">Menyimpan...</p>
    {/if}
  </div>
{:else}
  {#if readOnly}
    <div class="-mx-1 flex w-full items-center gap-1.5 rounded-sm px-1 py-1.5 text-left text-body-md">
      {#if value}
        <span class:font-jp={jp} class:font-semibold={strong} class="min-w-0 break-words">
          {value}
        </span>
      {:else}
        <span class="text-on-surface-variant/50">—</span>
      {/if}
    </div>
  {:else}
    <button
      type="button"
      class="group -mx-1 flex w-full items-center gap-1.5 rounded-sm px-1 py-1.5 text-left
        text-body-md transition-colors hover:bg-on-surface/5 focus-visible:bg-on-surface/5"
      title={`Klik untuk edit ${label}`}
      onclick={startEditing}
    >
      {#if value}
        <span class:font-jp={jp} class:font-semibold={strong} class="min-w-0 break-words">
          {value}
        </span>
      {:else}
        <span class="text-on-surface-variant/50">—</span>
      {/if}

      <svg
        viewBox="0 0 16 16"
        class="h-3 w-3 shrink-0 text-on-surface-variant/0 transition group-hover:text-on-surface-variant/70 group-focus-visible:text-on-surface-variant/70"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M11.7 1.9a1.6 1.6 0 0 1 2.3 0l.1.1a1.6 1.6 0 0 1 0 2.3l-7.1 7.1a1.6 1.6 0 0 1-.7.4l-2.7.6a.8.8 0 0 1-1-1l.6-2.7a1.6 1.6 0 0 1 .4-.7l7.1-7.1Zm-7 7.9-.4 1.7 1.7-.4 7-7-1.3-1.3-7 7Z" />
      </svg>
    </button>
  {/if}
{/if}
