<script>
  let { row, pinned = false, onToggle } = $props()
</script>

<div class="uk-form-row">
  <label class="uk-check">
    <input
      type="checkbox"
      checked={pinned}
      onchange={() => onToggle?.()}
      aria-label={`Sematkan ${row.name}`}
    />
  </label>
  <div class="uk-form-cell uk-form-name">
    {row.name}
    {#if row.reference}
      <span class="uk-form-ref">{row.reference}</span>
    {/if}
  </div>
  <div class="uk-form-cell uk-form-jp">{row.jp}</div>
  <div class="uk-form-cell uk-form-romaji">{row.romaji}</div>
  <div class="uk-form-cell uk-form-meaning">{row.meaning}</div>
  <div class="uk-form-cell uk-form-note">{row.note}</div>
</div>
