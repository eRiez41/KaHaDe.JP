<script>
  import Furigana from '../Furigana.svelte'

  let { config, heading = '' } = $props()

  let show = $state(true)
</script>

<section class="card space-y-3 p-4 sm:p-5">
  <button
    type="button"
    class="flex w-full items-center justify-between gap-3 text-left"
    onclick={() => (show = !show)}
    aria-expanded={show}
  >
    <h2 class="text-title-md font-bold">{heading || config.title}</h2>
    <svg
      viewBox="0 0 20 20"
      class="h-5 w-5 shrink-0 transition-transform {show ? 'rotate-180' : ''}"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z"
      />
    </svg>
  </button>

  {#if show}
    <div class="space-y-3 text-body-md text-on-surface-variant">
      <p>{config.intro}</p>

      <div class="grid grid-cols-1 gap-3 md:grid-cols-3">
        {#each config.groups as group (group.title)}
          <div class="rounded-lg border border-outline-variant p-3">
            <p class="font-semibold text-on-surface">{group.title}</p>
            <p class="mt-1">{group.rule}</p>
            {#if group.examples?.length}
              <div class="mt-1 flex flex-wrap items-center gap-x-1 gap-y-0.5">
                <span>Contoh:</span>
                {#each group.examples as [from, to] (from + to)}
                  <span class="inline-flex items-center gap-1">
                    <Furigana text={from} />→<Furigana text={to} />
                  </span>
                {/each}
              </div>
            {/if}
          </div>
        {/each}
      </div>

      {#if config.exception}
        <div class="rounded-lg bg-status-warning/10 p-3 text-on-surface">
          <p class="font-semibold">Pengecualian</p>
          <p class="mt-1">{config.exception}</p>
        </div>
      {/if}

      {#if config.note}
        <p class="text-label-md text-on-surface-variant">{config.note}</p>
      {/if}
    </div>
  {/if}
</section>
