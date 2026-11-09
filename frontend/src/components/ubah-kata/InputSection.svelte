<script>
  let { value = $bindable(''), loading = false, onAnalyze, onExample } = $props()

  const examples = ['たべる', 'たべます', 'のんで', 'かえる', 'がくせい', 'たかい', 'げんき', 'いい']

  function handleKeydown(event) {
    if (event.key !== 'Enter') return
    event.preventDefault()
    if (!loading && value.trim()) {
      onAnalyze?.()
    }
  }
</script>

<section class="uk-card uk-input-card" aria-labelledby="uk-input-label">
  <div class="uk-input-grid">
    <div>
      <label id="uk-input-label" class="uk-label" for="uk-input">Kata Jepang / Romaji</label>
      <input
        id="uk-input"
        class="uk-input"
        type="text"
        bind:value
        placeholder="contoh: たべる, tabemasu, 食べます"
        autocomplete="off"
        autocapitalize="off"
        spellcheck="false"
        onkeydown={handleKeydown}
      />
      <p class="uk-hint">
        Satu kata saja. Kana, kanji, atau romaji. Bentuk apa pun: kamus, ます, て, た, atau ない.
      </p>
    </div>
    <button
      type="button"
      class="uk-button-primary"
      onclick={() => onAnalyze?.()}
      disabled={loading || !value.trim()}
    >
      {loading ? 'Menganalisis…' : 'Analisis'}
    </button>
  </div>

  <div class="uk-example-row">
    <span class="uk-example-label">Coba</span>
    {#each examples as example (example)}
      <button
        type="button"
        class="uk-example"
        onclick={() => onExample?.(example)}
        disabled={loading}
      >
        {example}
      </button>
    {/each}
  </div>
</section>
