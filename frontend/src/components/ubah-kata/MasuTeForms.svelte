<script>
  import Furigana from '../Furigana.svelte'

  let { result, dictionary } = $props()

  const meaning = $derived(dictionary?.meanings?.[0] ?? '')
  const unknown = 'Arti belum tersedia'

  // The polite forms only swap the ます suffix, so the stem is shared.
  const politeBase = $derived(
    result.inputHira.endsWith('ます') ? result.inputHira.slice(0, -2) : result.inputHira,
  )

  const politeForms = $derived.by(() => {
    const base = politeBase
    const m = meaning
    return [
      {
        key: 'masu',
        label: 'Positif · sekarang',
        jp: `${base}ます`,
        meaning: m || unknown,
        note: 'Sopan; kebiasaan atau akan terjadi',
      },
      {
        key: 'masen',
        label: 'Negatif · sekarang',
        jp: `${base}ません`,
        meaning: m ? `tidak ${m}` : unknown,
        note: 'Menyangkal untuk sekarang / akan',
      },
      {
        key: 'mashita',
        label: 'Positif · lampau',
        jp: `${base}ました`,
        meaning: m ? `sudah ${m}` : unknown,
        note: 'Kejadian yang sudah selesai',
      },
      {
        key: 'masendeshita',
        label: 'Negatif · lampau',
        jp: `${base}ませんでした`,
        meaning: m ? `tidak ${m} (lampau)` : unknown,
        note: 'Lampau; tidak terjadi',
      },
    ]
  })

  const otherForms = $derived.by(() => {
    const m = meaning || unknown
    return [
      {
        key: 'stem',
        label: 'Stem ます',
        jp: result.stem,
        meaning: m,
        note: 'Akar kata, belum bisa dipakai sendiri',
      },
      {
        key: 'kamus',
        label: 'Bentuk kamus',
        jp: result.kamus,
        meaning: m,
        note: 'Bentuk dasar seperti di kamus',
      },
      {
        key: 'te',
        label: 'Bentuk て',
        jp: result.teForm,
        meaning: meaning ? `${meaning} (lalu ...)` : unknown,
        note: 'Bentuk sambung; waktu ikut konteks',
        highlight: true,
      },
    ]
  })

  const chain = $derived.by(() =>
    result.chain.map((jp) => ({
      jp,
      meaning:
        jp === result.teForm && meaning ? `${meaning} (lalu ...)` : meaning || unknown,
    })),
  )
</script>

{#snippet formCard(form)}
  <div
    class="rounded-lg border p-3 {form.highlight
      ? 'border-primary/40 bg-primary-container/30'
      : 'border-outline-variant'}"
  >
    <div class="flex items-center justify-between gap-2">
      <p class="text-label-md text-on-surface-variant">{form.label}</p>
      {#if form.highlight}
        <span class="chip bg-primary/10 text-on-surface">Hasil</span>
      {/if}
    </div>
    <p class="mt-1 text-title-md font-bold">
      <Furigana text={form.jp} />
    </p>
    <p class="mt-1 text-body-md font-semibold text-on-surface">{form.meaning}</p>
    <p class="text-label-md text-on-surface-variant">{form.note}</p>
  </div>
{/snippet}

<div class="space-y-4">
  <div class="space-y-2">
    <div class="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
      <p class="text-label-lg font-semibold">Bentuk Sopan (ます)</p>
      <p class="text-label-md text-on-surface-variant">Positif & negatif, sekarang & lampau</p>
    </div>
    <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {#each politeForms as form (form.key)}
        {@render formCard(form)}
      {/each}
    </div>
  </div>

  <div class="space-y-2">
    <p class="text-label-lg font-semibold">Bentuk Lain</p>
    <div class="grid grid-cols-1 gap-2 sm:grid-cols-3">
      {#each otherForms as form (form.key)}
        {@render formCard(form)}
      {/each}
    </div>
    {#if meaning}
      <p class="text-label-md text-on-surface-variant">
        Bentuk て sendiri tidak menunjukkan waktu. Untuk "sedang {meaning}", gabungkan dengan
        <span class="font-semibold text-on-surface">います</span> → {result.teForm}います.
      </p>
    {/if}
  </div>

  <div class="space-y-2">
    <p class="text-label-lg font-semibold">Rantai Perubahan</p>
    <div class="flex flex-wrap items-stretch gap-2 rounded-lg bg-surface-high p-3">
      {#each chain as step, i}
        {#if i > 0}
          <span class="self-center text-title-md text-on-surface-variant" aria-hidden="true">→</span>
        {/if}
        <div class="flex flex-col items-center rounded-md bg-surface px-3 py-1.5 text-center">
          <span class="text-title-md font-bold tracking-wide">
            <Furigana text={step.jp} />
          </span>
          <span class="text-label-md text-on-surface-variant">{step.meaning}</span>
        </div>
      {/each}
    </div>
  </div>
</div>
