<script>
  let { card = null, flipped = false, onFlip } = $props()
</script>

<button
  type="button"
  class="mt-4 flex min-h-64 w-full flex-col items-center justify-center gap-3 rounded-2xl border border-outline-variant bg-surface p-6 text-center transition-colors hover:border-primary/60 sm:min-h-72"
  onclick={onFlip}
  aria-label={flipped ? 'Lihat kanji' : 'Lihat jawaban'}
>
  {#if flipped}
    <p class="font-jp text-headline-xl font-bold text-on-surface">{card.kanji}</p>
    <dl class="mt-2 w-full max-w-md divide-y divide-outline-variant/50 rounded-xl border border-outline-variant bg-surface-high px-4">
      <div class="flex items-baseline justify-between gap-4 py-2.5">
        <dt class="text-label-md text-on-surface-variant">Hira / Kata</dt>
        <dd class="font-jp text-title-md font-semibold">{card.hira || '—'}</dd>
      </div>
      <div class="flex items-baseline justify-between gap-4 py-2.5">
        <dt class="text-label-md text-on-surface-variant">Romaji</dt>
        <dd class="text-body-md font-semibold">{card.romaji || '—'}</dd>
      </div>
      <div class="flex items-baseline justify-between gap-4 py-2.5">
        <dt class="text-label-md text-on-surface-variant">Arti</dt>
        <dd class="text-right text-body-md font-semibold">{card.arti || '—'}</dd>
      </div>
      {#if card.babNama}
        <div class="flex items-baseline justify-between gap-4 py-2.5">
          <dt class="text-label-md text-on-surface-variant">Bab</dt>
          <dd class="text-right text-body-md font-semibold">{card.babNama}</dd>
        </div>
      {/if}
    </dl>
  {:else}
    <p class="text-label-md uppercase tracking-wide text-on-surface-variant">Kanji</p>
    <p class="font-jp text-[clamp(3rem,12vw,5rem)] font-bold leading-tight text-on-surface">
      {card.kanji}
    </p>
    <p class="text-label-md text-on-surface-variant">Klik kartu atau tekan spasi untuk jawaban</p>
  {/if}
</button>
