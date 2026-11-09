<script>
  let { rows = [], meaning = '', classType = 'verb' } = $props()

  const byId = $derived(new Map(rows.map((row) => [row.id, row])))
  const baseMeaning = $derived((meaning || '').trim())

  function withPrefix(prefix) {
    return baseMeaning ? `${prefix} ${baseMeaning}` : '—'
  }

  const matrix = $derived.by(() => {
    const negativeWord = classType === 'noun' ? 'bukan' : 'tidak'
    return [
      {
        id: 'positive_present',
        symbol: '+',
        label: 'Positif kini',
        polite: byId.get('polite_present'),
        plain: byId.get('plain_present'),
        meaning: baseMeaning || '—',
      },
      {
        id: 'negative_present',
        symbol: '−',
        label: 'Negatif kini',
        polite: byId.get('polite_negative'),
        plain: byId.get('plain_negative'),
        meaning: withPrefix(negativeWord),
      },
      {
        id: 'positive_past',
        symbol: '+L',
        label: 'Positif lampau',
        polite: byId.get('polite_past'),
        plain: byId.get('plain_past'),
        meaning: withPrefix('sudah'),
      },
      {
        id: 'negative_past',
        symbol: '−L',
        label: 'Negatif lampau',
        polite: byId.get('polite_past_negative'),
        plain: byId.get('plain_past_negative'),
        meaning: withPrefix('belum'),
      },
    ]
  })
</script>

<section class="uk-card uk-table-card">
  <p class="uk-legend">
    <strong>+</strong> = positif kini · <strong>−</strong> = negatif kini ·
    <strong>+L</strong> = positif lampau · <strong>−L</strong> = negatif lampau
  </p>

  <div class="uk-table-scroll">
    <table class="uk-table uk-table--matrix">
      <colgroup>
        <col class="uk-col-form" />
        <col class="uk-col-polite" />
        <col class="uk-col-plain" />
        <col class="uk-col-meaning" />
      </colgroup>
      <thead>
        <tr>
          <th scope="col">Bentuk</th>
          <th scope="col">
            Sopan
            <span class="uk-col-sub">丁寧形 (teineikei)</span>
          </th>
          <th scope="col">
            Biasa
            <span class="uk-col-sub">普通形 (futsuukei)</span>
          </th>
          <th scope="col">Arti</th>
        </tr>
      </thead>
      <tbody>
        {#each matrix as row (row.id)}
          <tr>
            <th scope="row" class="uk-matrix-form" aria-label={row.label}>
              <span class="uk-matrix-symbol">{row.symbol}</span>
            </th>
            <td>
              <div class="uk-matrix-jp">{row.polite?.jp ?? '—'}</div>
              <div class="uk-matrix-romaji">{row.polite?.romaji ?? '—'}</div>
            </td>
            <td>
              <div class="uk-matrix-jp">{row.plain?.jp ?? '—'}</div>
              <div class="uk-matrix-romaji">{row.plain?.romaji ?? '—'}</div>
            </td>
            <td class="uk-matrix-meaning">{row.meaning}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</section>
