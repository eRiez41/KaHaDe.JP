<script>
  import KanjiBabPanel from '../components/kanji/KanjiBabPanel.svelte'
  import KanjiLessonPanel from '../components/kanji/KanjiLessonPanel.svelte'

  let tab = $state('bab')

  const tabs = [
    {
      key: 'bab',
      label: 'Kanji dari Bab',
      hint: 'Rekap otomatis dari kosakata',
    },
    {
      key: 'lesson',
      label: 'Kanji Lesson',
      hint: 'Bank kanji mandiri',
    },
  ]
</script>

<section class="space-y-5">
  <header class="space-y-4">
    <div class="space-y-2">
      <h1 class="text-headline-lg font-bold tracking-tight sm:text-headline-xl">Kanji</h1>
      <p class="max-w-2xl text-body-md text-on-surface-variant">
        Dua cara belajar kanji: rekap dari kosakata tiap bab, atau bank kanji lesson yang kamu
        kelola sendiri. Keduanya punya flashcard otomatis.
      </p>
    </div>

    <div
      class="flex w-full flex-col gap-1 rounded-2xl bg-surface-high p-1 sm:w-auto sm:flex-row"
      role="tablist"
      aria-label="Jenis data kanji"
    >
      {#each tabs as item (item.key)}
        <button
          type="button"
          role="tab"
          id={`kanji-tab-${item.key}`}
          aria-selected={tab === item.key}
          aria-controls={`kanji-panel-${item.key}`}
          class="flex-1 rounded-xl px-4 py-2.5 text-left transition-colors sm:flex-none sm:px-5 {tab ===
          item.key
            ? 'bg-primary-container text-primary-on-container shadow-level-1'
            : 'text-on-surface-variant hover:text-on-surface'}"
          onclick={() => (tab = item.key)}
        >
          <span class="block text-label-lg font-semibold">{item.label}</span>
          <span class="block text-label-md opacity-70">{item.hint}</span>
        </button>
      {/each}
    </div>
  </header>

  {#if tab === 'bab'}
    <div id="kanji-panel-bab" role="tabpanel" aria-labelledby="kanji-tab-bab">
      <KanjiBabPanel />
    </div>
  {:else}
    <div id="kanji-panel-lesson" role="tabpanel" aria-labelledby="kanji-tab-lesson">
      <KanjiLessonPanel />
    </div>
  {/if}
</section>
