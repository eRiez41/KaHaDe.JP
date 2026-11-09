<script>
  let { analysis, input } = $props()
</script>

<section class="uk-card uk-summary" aria-live="polite">
  <div>
    <p class="uk-eyebrow">Hasil analisis</p>
    <h2 class="uk-summary-word">{analysis.reading || analysis.kamus}</h2>
    <p class="uk-summary-romaji">{analysis.romaji}</p>
    <p class="uk-summary-meaning">{analysis.meaning}</p>
  </div>
  <div class="uk-summary-meta">
    <span class="uk-badge uk-badge--{analysis.badge}">{analysis.shortClass}</span>
    <span class="uk-tag">{analysis.posLabel}</span>
    {#if analysis.dictionary?.jlpt}
      <span class="uk-tag">{analysis.dictionary.jlpt}</span>
    {/if}
    {#if input?.formLabel}
      <span class="uk-tag">Input: {input.formLabel}</span>
    {/if}
  </div>
</section>
