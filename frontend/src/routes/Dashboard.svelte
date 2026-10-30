<script>
  import { onMount } from 'svelte'

  import { auth } from '../lib/auth.svelte.js'
  import { API_BASE_URL, downloadBabAudio, getHealth, getKosakataList } from '../lib/api.js'
  import { player } from '../lib/player.js'
  import { babStore, loadBabs } from '../lib/stores/data.svelte.js'
  import { toast } from '../lib/toast.svelte.js'

  let health = $state(null)
  let healthStatus = $state('loading')
  let healthError = $state('')
  let playingAll = $state(false)
  let downloadingId = $state(null)
  const isAdmin = $derived(auth.isAdmin)

  const babs = $derived(babStore.items)
  const totalBab = $derived(babs.length)
  const totalKata = $derived(babs.reduce((sum, bab) => sum + bab.countKosakata, 0))
  const totalAudio = $derived(babs.reduce((sum, bab) => sum + bab.audioReadyCount, 0))
  const audioPercent = $derived(totalKata ? Math.round((totalAudio / totalKata) * 100) : 0)

  const recentBabs = $derived(
    [...babs]
      .sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0))
      .slice(0, 3),
  )

  onMount(() => {
    loadBabs()
    loadHealth()
  })

  async function loadHealth() {
    healthStatus = 'loading'
    healthError = ''
    try {
      health = await getHealth()
      healthStatus = 'success'
    } catch (error) {
      health = null
      healthError = error?.message || 'Gagal terhubung ke backend.'
      healthStatus = 'error'
    }
  }

  function openCreate() {
    window.dispatchEvent(new CustomEvent('open-bab-form', { detail: { mode: 'create' } }))
  }

  function percent(bab) {
    return bab.countKosakata ? Math.round((bab.audioReadyCount / bab.countKosakata) * 100) : 0
  }

  async function playAll() {
    if (playingAll) {
      return
    }
    playingAll = true
    try {
      const lists = await Promise.all(babs.map((bab) => getKosakataList(bab.id)))
      const items = lists.flat().filter((item) => item.audioStatus === 'ready')
      if (items.length === 0) {
        toast.info('Belum ada audio siap di semua bab.')
        return
      }
      player.playAll(items)
    } catch (error) {
      toast.error(error?.message || 'Gagal memuat audio.')
    } finally {
      playingAll = false
    }
  }

  async function playBab(bab) {
    try {
      const items = await getKosakataList(bab.id)
      if (!items.some((item) => item.audioStatus === 'ready')) {
        toast.info('Belum ada audio siap di bab ini.')
        return
      }
      player.playAll(items)
    } catch (error) {
      toast.error(error?.message || 'Gagal memuat audio bab.')
    }
  }

  async function downloadBab(bab) {
    if (downloadingId) {
      return
    }
    downloadingId = bab.id
    try {
      const filename = await downloadBabAudio(bab.id)
      toast.success(`Download ${filename} dimulai.`)
    } catch (error) {
      toast.error(error?.message || 'Gagal download audio.')
    } finally {
      downloadingId = null
    }
  }
</script>

<section class="space-y-6">
  <header class="space-y-2">
    <h1 class="text-headline-lg font-bold tracking-tight sm:text-headline-xl">Dashboard</h1>
    <p class="text-body-md text-on-surface-variant">Ringkasan kosakata dan status aplikasi.</p>
  </header>

  {#if babStore.status === 'error'}
    <div class="space-y-3 rounded-lg bg-error/10 p-4" role="alert">
      <p class="text-title-md text-error">Gagal memuat data bab</p>
      <p class="text-body-md text-on-surface-variant">{babStore.error}</p>
      <button type="button" class="btn btn-tonal" onclick={loadBabs}>Coba Lagi</button>
    </div>
  {:else}
    <div class="grid gap-3 sm:grid-cols-3">
      <article class="card p-5">
        <p class="text-label-lg text-on-surface-variant">Total Bab</p>
        <p class="mt-1 text-display-sm font-bold tabular-nums">
          {babStore.status === 'loading' && totalBab === 0 ? '—' : totalBab}
        </p>
        <p class="mt-1 text-label-md text-on-surface-variant">Bab tersimpan</p>
      </article>

      <article class="card p-5">
        <p class="text-label-lg text-on-surface-variant">Total Kata</p>
        <p class="mt-1 text-display-sm font-bold tabular-nums">
          {babStore.status === 'loading' && totalKata === 0 ? '—' : totalKata}
        </p>
        <p class="mt-1 text-label-md text-on-surface-variant">Kosakata Jepang</p>
      </article>

      <article class="card p-5">
        <p class="text-label-lg text-on-surface-variant">Audio Siap</p>
        <p class="mt-1 text-display-sm font-bold tabular-nums">
          {audioPercent}%<span class="ml-1 text-title-md font-medium text-on-surface-variant">
            {totalAudio}/{totalKata}
          </span>
        </p>
        <div class="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-high" aria-hidden="true">
          <div class="h-full rounded-full bg-primary" style={`width: ${audioPercent}%`}></div>
        </div>
      </article>
    </div>

    <section class="space-y-3" aria-labelledby="quick-actions">
      <h2 id="quick-actions" class="text-title-md">Quick Actions</h2>
      <div class="flex flex-wrap gap-2">
        {#if isAdmin}
          <button type="button" class="btn btn-primary" onclick={openCreate}>
            <svg viewBox="0 0 20 20" class="h-4 w-4" fill="currentColor" aria-hidden="true">
              <path d="M10 4a1 1 0 0 1 1 1v4h4a1 1 0 1 1 0 2h-4v4a1 1 0 1 1-2 0v-4H5a1 1 0 1 1 0-2h4V5a1 1 0 0 1 1-1Z" />
            </svg>
            Bab Baru
          </button>
          <a href="#bab" class="btn btn-tonal">Import / Kelola</a>
        {:else}
          <a href="#bab" class="btn btn-primary">Kelola Bab</a>
        {/if}
        <button
          type="button"
          class="btn btn-outline"
          disabled={totalAudio === 0 || playingAll}
          onclick={playAll}
        >
          {playingAll ? 'Memuat...' : 'Play All'}
        </button>
      </div>
    </section>

    <section class="space-y-3" aria-labelledby="recent-bab">
      <div class="flex items-center justify-between gap-2">
        <h2 id="recent-bab" class="text-title-md">Bab Terakhir</h2>
        <a href="#bab" class="text-label-lg text-primary hover:underline">Lihat semua</a>
      </div>

      {#if babStore.status === 'loading' && babs.length === 0}
        <div class="grid gap-3 md:grid-cols-3" aria-busy="true">
          {#each [1, 2, 3] as skeleton (skeleton)}
            <div class="card space-y-3 p-4">
              <div class="skeleton h-5 w-2/3"></div>
              <div class="skeleton h-3 w-1/3"></div>
              <div class="skeleton h-9 w-full"></div>
            </div>
          {/each}
        </div>
      {:else if babs.length === 0}
        <div class="rounded-lg border border-dashed border-outline-variant bg-surface-container/60 p-6 text-center">
          <p class="text-title-md">Belum ada bab</p>
          <p class="mt-1 text-body-md text-on-surface-variant">
            {isAdmin ? 'Mulai dengan membuat bab pertama.' : 'Belum ada bab yang tersedia.'}
          </p>
          {#if isAdmin}
            <button type="button" class="btn btn-primary mt-3" onclick={openCreate}>Tambah Bab</button>
          {:else}
            <a href="#bab" class="btn btn-primary mt-3">Lihat Bab</a>
          {/if}
        </div>
      {:else}
        <div class="grid gap-3 md:grid-cols-3">
          {#each recentBabs as bab (bab.id)}
            <article class="card flex flex-col gap-3 p-4">
              <div class="flex items-start justify-between gap-2">
                <a
                  href={`#bab/${bab.id}`}
                  class="min-w-0 break-words text-title-md transition-colors hover:text-primary"
                >
                  {bab.nama}
                </a>
                <span class="chip shrink-0 bg-surface-high text-on-surface-variant tabular-nums">
                  {bab.countKosakata}
                </span>
              </div>

              <div class="space-y-1.5">
                <div class="flex items-center justify-between text-label-md text-on-surface-variant">
                  <span>Audio</span>
                  <span class="tabular-nums">{bab.audioReadyCount}/{bab.countKosakata}</span>
                </div>
                <div class="h-1.5 overflow-hidden rounded-full bg-surface-high" aria-hidden="true">
                  <div class="h-full rounded-full bg-primary" style={`width: ${percent(bab)}%`}></div>
                </div>
              </div>

              <div class="mt-auto flex items-center gap-1.5 pt-1">
                <a href={`#bab/${bab.id}`} class="btn btn-tonal min-h-9 flex-1 px-3 text-label-md">
                  Buka
                </a>
                <button
                  type="button"
                  class="icon-btn h-9 w-9"
                  disabled={bab.audioReadyCount === 0}
                  onclick={() => playBab(bab)}
                  title="Play All"
                  aria-label={`Putar audio ${bab.nama}`}
                >
                  <svg viewBox="0 0 20 20" class="h-4 w-4" fill="currentColor" aria-hidden="true">
                    <path d="M6 4.5v11a1 1 0 0 0 1.5.9l9-5.5a1 1 0 0 0 0-1.8l-9-5.5A1 1 0 0 0 6 4.5Z" />
                  </svg>
                </button>
                <button
                  type="button"
                  class="icon-btn h-9 w-9"
                  disabled={bab.audioReadyCount === 0 || downloadingId === bab.id}
                  onclick={() => downloadBab(bab)}
                  title="Download audio"
                  aria-label={`Download audio ${bab.nama}`}
                >
                  <svg viewBox="0 0 20 20" class="h-4 w-4" fill="currentColor" aria-hidden="true">
                    <path d="M10 2a1 1 0 0 1 1 1v8.6l2.3-2.3a1 1 0 1 1 1.4 1.4l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 1 1 1.4-1.4L9 11.6V3a1 1 0 0 1 1-1Z" />
                  </svg>
                </button>
              </div>
            </article>
          {/each}
        </div>
      {/if}
    </section>
  {/if}

  {#if isAdmin}
    <article class="card p-5">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div class="space-y-1">
          <h2 class="text-title-md">Koneksi Backend</h2>
          <p class="text-body-md text-on-surface-variant">
            Endpoint:
            <code class="rounded-sm bg-surface-high px-1.5 py-0.5 text-label-md">
              {API_BASE_URL || 'same-origin'}/api/health
            </code>
          </p>
        </div>
        <button
          type="button"
          class="btn btn-outline min-h-10"
          onclick={loadHealth}
          disabled={healthStatus === 'loading'}
        >
          {healthStatus === 'loading' ? 'Memeriksa...' : 'Cek Ulang'}
        </button>
      </div>

      <div class="mt-4" aria-live="polite">
        {#if healthStatus === 'loading'}
          <span class="chip bg-surface-high text-on-surface-variant">
            <span class="h-2 w-2 animate-pulse rounded-full bg-current"></span>
            Memeriksa koneksi...
          </span>
        {:else if healthStatus === 'success'}
          <div class="space-y-1.5">
            <span class="chip bg-status-ready/15 text-status-ready">
              <span class="h-2 w-2 rounded-full bg-current"></span>
              Terhubung ke {health.service} v{health.version}
            </span>
            <p class="text-label-md text-on-surface-variant">
              Status: {health.status} · Waktu server: {new Date(health.time).toLocaleString('id-ID')}
            </p>
          </div>
        {:else}
          <div class="space-y-1.5">
            <span class="chip bg-error/10 text-error">
              <span class="h-2 w-2 rounded-full bg-current"></span>
              Gagal terhubung ke backend
            </span>
            <p class="text-label-md text-error">{healthError}</p>
          </div>
        {/if}
      </div>
    </article>
  {/if}
</section>
