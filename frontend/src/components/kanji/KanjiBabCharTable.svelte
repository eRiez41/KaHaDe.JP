<script>
  let { entries = [], total = 0, showBab = false, onSelect } = $props()
</script>

<div class="space-y-3">
  <div class="table-shell overflow-x-auto">
    <table class="w-full min-w-[520px] border-collapse text-left">
      <thead class="bg-surface-high text-label-md uppercase tracking-wide text-on-surface-variant">
        <tr>
          <th class="w-24 px-4 py-3 font-medium">Kanji</th>
          <th class="px-4 py-3 font-medium">Contoh Kata</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-outline-variant/50">
        {#each entries as entry (entry.kanji)}
          <tr class="align-top transition-colors hover:bg-on-surface/[0.03]">
            <td class="px-4 py-3">
              <span
                class="grid h-11 w-11 place-items-center rounded-lg bg-primary-container font-jp text-title-lg text-primary-on-container"
              >
                {entry.kanji}
              </span>
            </td>
            <td class="px-4 py-3">
              <div class="flex flex-wrap items-center gap-1.5">
                {#each entry.examples as example (example.id)}
                  <button
                    type="button"
                    class="chip max-w-full bg-surface-high text-on-surface-variant transition-colors hover:bg-primary-container hover:text-primary-on-container"
                    onclick={() => onSelect?.({ ...example, char: entry.kanji })}
                    aria-label="Lihat penjelasan {example.label}"
                  >
                    <span class="truncate font-jp font-medium text-on-surface">{example.label}</span>
                    <span class="opacity-40">·</span>
                    <span class="truncate">{example.arti}</span>
                    {#if example.babNama && showBab}
                      <span class="shrink-0 text-label-md opacity-70">({example.babNama})</span>
                    {/if}
                  </button>
                {/each}
              </div>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  <p class="text-label-md text-on-surface-variant">
    {entries.length} karakter unik dari {total} kata ber-kanji.
  </p>
</div>
