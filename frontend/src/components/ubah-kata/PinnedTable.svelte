<script>
  let { rows = [], onUnpin } = $props()
</script>

{#if rows.length}
  <section class="uk-card uk-table-card uk-pinned-card">
    <div class="uk-table-scroll">
      <table class="uk-table uk-table--pinned">
        <thead>
          <tr>
            <th>Pilih</th>
            <th>Nama Bentuk</th>
            <th>Hasil Jepang</th>
            <th>Romaji</th>
            <th>Arti</th>
            <th>Keterangan</th>
          </tr>
        </thead>
        <tbody>
          {#each rows as row (row.id)}
            <tr>
              <td>
                <label class="uk-check">
                  <input
                    type="checkbox"
                    checked
                    onchange={() => onUnpin?.(row.id)}
                    aria-label={`Lepas sematan ${row.name}`}
                  />
                </label>
              </td>
              <td class="uk-name">{row.name}</td>
              <td class="uk-jp">{row.jp}</td>
              <td class="uk-romaji">{row.romaji}</td>
              <td class="uk-meaning">{row.meaning}</td>
              <td class="uk-note">{row.note}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </section>
{/if}
