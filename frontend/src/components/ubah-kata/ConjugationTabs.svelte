<script>
  let { candidates = [], active = 0, onChange } = $props()
</script>

{#if candidates.length > 1}
  <div class="uk-tabs" role="tablist" aria-label="Pilih kata yang dimaksud">
    {#each candidates as candidate, index (candidate.kamus + ':' + candidate.classType + ':' + index)}
      <button
        type="button"
        role="tab"
        class="uk-tab {index === active ? 'uk-tab--active' : ''}"
        aria-selected={index === active}
        onclick={() => onChange?.(index)}
      >
        <span class="uk-tab-word">{candidate.reading || candidate.kamus}</span>
        <span class="uk-tab-meta">{candidate.meaning}</span>
        <span class="uk-badge uk-badge--{candidate.badge}">{candidate.shortClass}</span>
      </button>
    {/each}
  </div>
{/if}
