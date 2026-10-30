<script>
  import { getUbahKataModule } from '../lib/ubahKataModules.js'
  import { toast } from '../lib/toast.svelte.js'

  let { sub = 'masu-te' } = $props()

  const active = $derived(getUbahKataModule(sub))
  const Explanation = $derived(active.Explanation)
  const Result = $derived(active.Result)

  let input = $state('')
  let result = $state(null)
  let error = $state('')
  let loading = $state(false)

  async function handleAnalyze() {
    error = ''
    result = null
    const val = input.trim()
    if (!val) {
      error = 'Mohon masukkan kata yang ingin dianalisis'
      return
    }
    loading = true
    try {
      const local = active.analyze(val)
      const checked = await active.validate(local)
      result = { ...checked.result, dictionary: checked.dictionary }
      setTimeout(() => {
        const el = document.getElementById('ubah-kata-result')
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 50)
    } catch (e) {
      error = e?.message || 'Gagal menganalisis'
      toast.error(error)
    } finally {
      loading = false
    }
  }

  function handleKeydown(e) {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAnalyze()
    }
  }

  function clearResult() {
    result = null
  }
</script>

<section class="space-y-5">
  <header class="space-y-3">
    <a
      href="#ubah-kata"
      class="inline-flex items-center gap-1.5 rounded-full py-1 pr-3 text-label-lg text-on-surface-variant transition-colors hover:text-on-surface"
    >
      <svg viewBox="0 0 20 20" class="h-4 w-4" fill="currentColor" aria-hidden="true">
        <path
          d="M12.7 4.3a1 1 0 0 1 0 1.4L8.4 10l4.3 4.3a1 1 0 1 1-1.4 1.4l-5-5a1 1 0 0 1 0-1.4l5-5a1 1 0 0 1 1.4 0Z"
        />
      </svg>
      Kembali ke daftar
    </a>
    <div>
      <h1 class="text-headline-lg font-bold tracking-tight">{active.title}</h1>
      <p class="text-body-md text-on-surface-variant">{active.subtitle}</p>
    </div>
  </header>

  {#if active.config}
    <Explanation config={active.config} heading={active.config.heading ?? ''} />
  {:else}
    <Explanation />
  {/if}

  <section class="card space-y-3 p-4 sm:p-5">
    <h2 class="text-title-md font-bold">{active.inputTitle}</h2>
    <div class="space-y-2">
      <input
        class="field"
        placeholder={active.placeholder}
        bind:value={input}
        onkeydown={handleKeydown}
      />
      <p class="text-label-md text-on-surface-variant">{active.inputHint}</p>
    </div>
    <button type="button" class="btn btn-primary w-fit" onclick={handleAnalyze} disabled={loading}>
      {#if loading}
        Menganalisis...
      {:else}
        Analisis
      {/if}
    </button>
    {#if error}
      <p class="text-body-md text-error">{error}</p>
    {/if}
  </section>

  {#if result}
    <Result {result} onclose={clearResult} />
  {/if}
</section>
