<script>
  let {
    lessonId = $bindable(''),
    lessons = [],
    kanji = $bindable(''),
    hira = $bindable(''),
    romaji = $bindable(''),
    arti = $bindable(''),
    kanjiInput = $bindable(null),
    autofill,
  } = $props()

  function handleSourceInput(event) {
    if (event.currentTarget.id === 'lesson-kanji') {
      kanji = event.currentTarget.value
    } else {
      hira = event.currentTarget.value
    }
    autofill.schedule()
  }
</script>

<div class="mb-3 space-y-1.5">
  <label for="lesson-target" class="label">
    Lesson <span class="text-error" aria-hidden="true">*</span>
  </label>
  <select id="lesson-target" bind:value={lessonId} class="field h-11" required>
    {#each lessons as lesson (lesson.id)}
      <option value={String(lesson.id)}>{lesson.nama}</option>
    {/each}
  </select>
</div>

<div class="grid gap-3 sm:grid-cols-2">
  <div class="space-y-1.5">
    <label for="lesson-kanji" class="label">
      Kanji <span class="text-error" aria-hidden="true">*</span>
    </label>
    <input
      id="lesson-kanji" bind:this={kanjiInput} value={kanji} oninput={handleSourceInput}
      type="text" maxlength="200" required autocomplete="off" placeholder="食べる"
      class="field font-jp"
    />
  </div>

  <div class="space-y-1.5">
    <label for="lesson-hira" class="label">Hira / Kata</label>
    <input
      id="lesson-hira" value={hira} oninput={handleSourceInput}
      type="text" maxlength="200" autocomplete="off" placeholder="たべる"
      class="field font-jp"
    />
  </div>

  <div class="space-y-1.5">
    <label for="lesson-romaji" class="label">Romaji</label>
    <input
      id="lesson-romaji" value={romaji} oninput={(event) => {
        romaji = event.currentTarget.value
        autofill.markManual()
      }}
      type="text" maxlength="200" autocomplete="off" placeholder="taberu" class="field"
    />
    <div class="min-h-4 text-label-md" aria-live="polite">
      {#if autofill.busy}
        <span class="text-on-surface-variant">Membuat romaji...</span>
      {:else if autofill.notice}
        <span class="text-status-warning">{autofill.notice}</span>
      {/if}
    </div>
  </div>

  <div class="space-y-1.5">
    <label for="lesson-arti" class="label">
      Arti <span class="text-error" aria-hidden="true">*</span>
    </label>
    <input
      id="lesson-arti" value={arti} oninput={(event) => (arti = event.currentTarget.value)}
      type="text" maxlength="500" required autocomplete="off" placeholder="makan" class="field"
    />
  </div>
</div>
