<script>
  import Furigana from '../Furigana.svelte'

  let { result, dictionary } = $props()

  const meaning = $derived(dictionary?.meanings?.[0] ?? '')
  const unknown = 'Arti belum tersedia'

  const naiBase = $derived(
    result.naiForm.endsWith('ない') ? result.naiForm.slice(0, -2) : result.naiForm,
  )

  const cards = $derived.by(() => {
    const m = meaning
    const list = [
      {
        key: 'masu',
        label: 'Bentuk ます',
        jp: result.inputHira,
        meaning: m || unknown,
        note: 'Sopan, positif',
      },
      {
        key: 'kamus',
        label: 'Bentuk kamus',
        jp: result.kamus,
        meaning: m || unknown,
        note: 'Bentuk dasar di kamus',
      },
      {
        key: 'nai',
        label: 'Bentuk ない',
        jp: result.naiForm,
        meaning: m ? `tidak ${m}` : unknown,
        note: 'Negatif biasa (bukan sopan)',
        highlight: true,
      },
      {
        key: 'nakatta',
        label: 'Bentuk なかった',
        jp: `${naiBase}なかった`,
        meaning: m ? `tidak ${m} (lampau)` : unknown,
        note: 'Negatif lampau',
      },
      {
        key: 'nakute',
        label: 'Bentuk なくて',
        jp: `${naiBase}なくて`,
        meaning: m ? `tidak ${m} dan ...` : unknown,
        note: 'Sambung negatif',
      },
    ]

    // ある → ない is already the negative; ないで patterns do not apply.
    if (result.naiForm !== 'ない') {
      list.push({
        key: 'naide',
        label: 'Bentuk ないで',
        jp: `${naiBase}ないで`,
        meaning: m ? `tanpa ${m}` : unknown,
        note: 'Tanpa melakukan sesuatu',
      })
    }
    return list
  })

  const politeForms = $derived.by(() => {
    // ある is suppletive in the polite negative too: ありません, not ありません.
    if (result.kamus === 'ある') {
      return [
        { jp: 'ありません', meaning: meaning ? `tidak ${meaning}` : unknown },
        {
          jp: 'ありませんでした',
          meaning: meaning ? `tidak ${meaning} (lampau)` : unknown,
        },
      ]
    }
    const base = result.inputHira.endsWith('ます')
      ? result.inputHira.slice(0, -2)
      : result.inputHira
    return [
      { jp: `${base}ません`, meaning: meaning ? `tidak ${meaning}` : unknown },
      {
        jp: `${base}ませんでした`,
        meaning: meaning ? `tidak ${meaning} (lampau)` : unknown,
      },
    ]
  })

  const patterns = $derived.by(() => {
    if (!meaning || result.naiForm === 'ない') return []
    return [
      {
        jp: `${naiBase}ないでください`,
        meaning: `tolong jangan ${meaning}`,
        note: 'Permintaan negatif',
      },
      {
        jp: `${naiBase}なければなりません`,
        meaning: `harus ${meaning}`,
        note: 'Kewajiban',
      },
      {
        jp: `${naiBase}なくてもいいです`,
        meaning: `tidak perlu ${meaning}`,
        note: 'Tidak wajib',
      },
    ]
  })

  const chain = $derived.by(() =>
    result.chain.map((jp) => ({
      jp,
      meaning:
        jp === result.naiForm && meaning ? `tidak ${meaning}` : meaning || unknown,
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
      <p class="text-label-lg font-semibold">Bentuk & Arti</p>
      {#if meaning}
        <p class="text-label-md text-on-surface-variant">Arti dasar tetap sama</p>
      {/if}
    </div>
    <div class="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {#each cards as form (form.key)}
        {@render formCard(form)}
      {/each}
    </div>
  </div>

  <div class="space-y-2">
    <p class="text-label-lg font-semibold">Padanan Sopan</p>
    <div class="space-y-1 rounded-lg bg-surface-high p-3">
      {#each politeForms as form}
        <p class="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 text-body-md">
          <span class="font-bold tracking-wide"><Furigana text={form.jp} /></span>
          <span class="text-on-surface-variant">{form.meaning}</span>
        </p>
      {/each}
    </div>
  </div>

  {#if patterns.length}
    <div class="space-y-2">
      <p class="text-label-lg font-semibold">Pola Umum dari Bentuk ない</p>
      <div class="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {#each patterns as pattern}
          <div class="rounded-lg border border-outline-variant p-3">
            <p class="text-title-md font-bold"><Furigana text={pattern.jp} /></p>
            <p class="mt-1 text-body-md font-semibold text-on-surface">{pattern.meaning}</p>
            <p class="text-label-md text-on-surface-variant">{pattern.note}</p>
          </div>
        {/each}
      </div>
    </div>
  {/if}

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
