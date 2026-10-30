<script>
  import { player } from '../lib/player.js'
  import { playerState } from '../lib/stores/player.js'
  import { settings } from '../lib/settings.js'

  const speeds = [0.75, 1, 1.25]

  $effect(() => {
    if ($playerState.status !== 'finished') {
      return
    }
    const timer = window.setTimeout(() => player.stop(), 3000)
    return () => window.clearTimeout(timer)
  })

  const state = $derived($playerState)
  const visible = $derived(state.status !== 'hidden' && Boolean(state.current))
  const title = $derived(state.current?.kanji || state.current?.hira || state.current?.arti || '')
  const subtitle = $derived(
    state.status === 'error'
      ? state.error
      : state.status === 'finished'
        ? 'Selesai · putar ulang'
        : state.current?.arti || '',
  )

  function seek(event) {
    player.seek(Number(event.currentTarget.value) / 100)
  }

  function changeVolume(event) {
    const volume = Number(event.currentTarget.value)
    settings.persist({ ...$settings, volume })
  }

  function cycleSpeed() {
    const current = Number($settings.speed) || 1
    const index = speeds.indexOf(current)
    const next = speeds[(index + 1) % speeds.length]
    settings.persist({ ...$settings, speed: next })
  }

  function formatTime(value) {
    const seconds = Math.max(0, Math.floor(Number(value) || 0))
    return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
  }

  function stop() {
    player.stop()
  }
</script>

{#if visible}
  <div class="fixed inset-x-0 bottom-0 z-40 px-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] sm:px-4 sm:pb-3">
    <div
      class="frosted mx-auto flex max-w-[1200px] flex-col gap-2 rounded-xl p-3 shadow-level-4 sm:flex-row sm:items-center sm:gap-3"
      role="region"
      aria-label="Mini player"
    >
      <div class="flex min-w-0 flex-1 items-center gap-2.5">
        <span
          class="chip shrink-0 bg-primary-container text-primary-on-container"
          aria-label={`Audio ${state.current?.label || ''}`}
        >
          {state.current?.label || 'Audio'}
        </span>
        <div class="min-w-0">
          <p class="truncate text-title-md text-on-surface">{title}</p>
          <p
            class="truncate text-label-md {state.status === 'error'
              ? 'text-error'
              : 'text-on-surface-variant'}"
            aria-live="polite"
          >
            {subtitle}
            {#if state.status === 'loading'}· Memuat...{/if}
          </p>
        </div>
      </div>

      <div class="flex items-center justify-center gap-1">
        <button
          type="button"
          class="icon-btn h-10 w-10"
          onclick={() => player.previous()}
          aria-label="Sebelumnya"
          title="Sebelumnya"
        >
          <svg viewBox="0 0 24 24" class="h-5 w-5" fill="currentColor" aria-hidden="true">
            <path d="M18 5.5v13a1 1 0 0 1-1.5.9l-10-6.5a1 1 0 0 1 0-1.8l10-6.5A1 1 0 0 1 18 5.5Z" />
            <rect x="4" y="5" width="2.5" height="14" rx="1" />
          </svg>
        </button>

        <button
          type="button"
          class="grid h-12 w-12 place-items-center rounded-full bg-primary text-primary-foreground shadow-level-2 transition active:scale-95"
          onclick={() => player.toggle()}
          aria-label={state.playing ? 'Jeda' : 'Putar'}
          title={state.playing ? 'Jeda' : 'Putar'}
        >
          {#if state.playing}
            <svg viewBox="0 0 24 24" class="h-5 w-5" fill="currentColor" aria-hidden="true">
              <rect x="6" y="5" width="4" height="14" rx="1.2" />
              <rect x="14" y="5" width="4" height="14" rx="1.2" />
            </svg>
          {:else}
            <svg viewBox="0 0 24 24" class="h-5 w-5" fill="currentColor" aria-hidden="true">
              <path d="M8 5.5v13a1 1 0 0 0 1.5.9l10-6.5a1 1 0 0 0 0-1.8l-10-6.5A1 1 0 0 0 8 5.5Z" />
            </svg>
          {/if}
        </button>

        <button
          type="button"
          class="icon-btn h-10 w-10"
          onclick={() => player.next()}
          aria-label="Berikutnya"
          title="Berikutnya"
        >
          <svg viewBox="0 0 24 24" class="h-5 w-5" fill="currentColor" aria-hidden="true">
            <path d="M6 5.5v13a1 1 0 0 0 1.5.9l10-6.5a1 1 0 0 0 0-1.8l-10-6.5A1 1 0 0 0 6 5.5Z" />
            <rect x="17.5" y="5" width="2.5" height="14" rx="1" />
          </svg>
        </button>

        <button
          type="button"
          class="icon-btn h-10 w-10"
          onclick={stop}
          aria-label="Stop dan tutup player"
          title="Stop"
        >
          <svg viewBox="0 0 24 24" class="h-4 w-4" fill="currentColor" aria-hidden="true">
            <rect x="6" y="6" width="12" height="12" rx="2" />
          </svg>
        </button>
      </div>

      <div class="flex flex-1 flex-col gap-1.5 sm:gap-1">
        <div class="flex items-center gap-2">
          <span class="w-9 shrink-0 text-right text-label-md tabular-nums text-on-surface-variant">
            {formatTime(state.currentTime)}
          </span>
          <input
            type="range"
            min="0"
            max="100"
            step="0.1"
            value={state.progress}
            oninput={seek}
            class="h-1 w-full cursor-pointer accent-primary"
            aria-label="Posisi audio"
            disabled={!state.duration}
          />
          <span class="w-9 shrink-0 text-label-md tabular-nums text-on-surface-variant">
            {formatTime(state.duration)}
          </span>
        </div>

        <div class="flex items-center justify-between gap-2 px-1">
          <span class="text-label-md tabular-nums text-on-surface-variant">
            {state.position}/{state.total} · {state.current?.label || 'Audio'}
          </span>

          <div class="flex items-center gap-2">
            <button
              type="button"
              class="chip bg-surface-high text-on-surface-variant transition hover:text-on-surface"
              onclick={cycleSpeed}
              aria-label={`Kecepatan ${$settings.speed}x, klik untuk ganti`}
              title="Ganti kecepatan"
            >
              {$settings.speed}x
            </button>

            <div class="hidden items-center gap-1 md:flex">
              <svg viewBox="0 0 24 24" class="h-4 w-4 text-on-surface-variant" fill="currentColor" aria-hidden="true">
                <path d="M4 10v4h4l5 4V6L8 10H4Zm12.5 2a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4Z" />
              </svg>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={$settings.volume}
                oninput={changeVolume}
                class="h-1 w-20 cursor-pointer accent-primary"
                aria-label="Volume"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}
