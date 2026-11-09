<script>
  import FormRow from './FormRow.svelte'

  let { group, open = false, onToggle, onPin, isPinned } = $props()
</script>

<section class="uk-group {open ? 'uk-group--open' : ''}">
  <button
    type="button"
    class="uk-group-header"
    aria-expanded={open}
    onclick={() => onToggle?.()}
  >
    <span class="uk-group-chevron" aria-hidden="true">{open ? '▾' : '▸'}</span>
    <span class="uk-group-title">{group.name}</span>
    <span class="uk-group-count">{group.rows.length}</span>
  </button>
  {#if open}
    <div class="uk-group-body">
      {#each group.rows as row (row.id)}
        <FormRow {row} pinned={isPinned?.(row.id) ?? false} onToggle={() => onPin?.(row.id)} />
      {/each}
    </div>
  {/if}
</section>
