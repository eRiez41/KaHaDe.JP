<script>
  import { onDestroy, onMount } from 'svelte'

  import { API_BASE_URL, getHealth } from '../lib/api.js'
  import { exportAllBackup, parseBackup, restoreBackup } from '../lib/backup.js'
  import { defaultSettings, settings } from '../lib/settings.js'
  import { loadBabs } from '../lib/stores/data.svelte.js'
  import { toast } from '../lib/toast.svelte.js'

  let health = $state(null)
  let healthStatus = $state('loading')
  let healthError = $state('')
  onMount(() => {
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

  const voiceJpOptions = [
    'ja-JP-NanamiNeural',
    'ja-JP-KeitaNeural',
    'ja-JP-AoiNeural',
    'ja-JP-DaichiNeural',
  ]
  const voiceIdOptions = ['id-ID-GadisNeural', 'id-ID-ArdiNeural']
  const speeds = [0.5, 0.75, 1, 1.25]
  const gaps = [
    { value: 0, label: 'Tanpa jeda' },
    { value: 300, label: '0,3 detik' },
    { value: 500, label: '0,5 detik' },
    { value: 1000, label: '1 detik' },
  ]

  const colorThemes = [
    { id: 'orange', label: 'Oranye', color: '#FF8C3A' },
    { id: 'amber', label: 'Amber', color: '#F59E0B' },
    { id: 'coral', label: 'Coral', color: '#F97356' },
    { id: 'red', label: 'Merah', color: '#EF4444' },
    { id: 'rose', label: 'Rose', color: '#F43F5E' },
    { id: 'pink', label: 'Pink', color: '#EC4899' },
    { id: 'violet', label: 'Violet', color: '#8B5CF6' },
    { id: 'indigo', label: 'Indigo', color: '#6366F1' },
    { id: 'blue', label: 'Biru', color: '#3B82F6' },
    { id: 'sky', label: 'Sky', color: '#0EA5E9' },
    { id: 'cyan', label: 'Cyan', color: '#06B6D4' },
    { id: 'teal', label: 'Teal', color: '#14B8A6' },
    { id: 'emerald', label: 'Emerald', color: '#22C55E' },
    { id: 'green', label: 'Hijau', color: '#22C55E' },
    { id: 'lime', label: 'Lime', color: '#84CC16' },
  ]

  let config = $state({ ...defaultSettings })
  let exporting = $state(false)
  let restoring = $state(false)
  let restoreProgress = $state({ index: 0, total: 0, nama: '' })
  let fileInput = $state(null)

  const unsubscribe = settings.subscribe((value) => {
    config = { ...value }
  })
  onDestroy(unsubscribe)

  function update(patch) {
    config = { ...config, ...patch }
    settings.persist(config)
  }

  function save() {
    settings.persist(config)
    toast.success('Pengaturan disimpan.')
  }

  function setTheme(value) {
    config = { ...config, theme: value }
    settings.persist(config)
    toast.success('Tema diperbarui.')
  }

  function setColorTheme(id) {
    config = { ...config, colorTheme: id }
    settings.persist(config)
    toast.success('Warna tema diperbarui.')
  }

  function reset() {
    settings.reset()
    toast.info('Pengaturan dikembalikan ke default.')
  }

  async function exportAll() {
    if (exporting) {
      return
    }
    exporting = true
    try {
      const summary = await exportAllBackup()
      toast.success(`Backup ${summary.bab} bab · ${summary.kata} kata selesai.`)
    } catch (error) {
      toast.error(error?.message || 'Gagal export backup.')
    } finally {
      exporting = false
    }
  }

  function pickBackup() {
    if (restoring) {
      return
    }
    fileInput?.click()
  }

  async function handleFile(event) {
    const file = event.currentTarget.files?.[0]
    event.currentTarget.value = ''
    if (!file) {
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Ukuran file backup maksimal 10 MB.')
      return
    }

    let entries
    try {
      const parsed = JSON.parse(await file.text())
      entries = parseBackup(parsed)
    } catch (error) {
      toast.error(error?.message || 'File backup tidak valid.')
      return
    }

    if (entries.length === 0) {
      toast.error('Tidak ada bab yang bisa direstore dari file ini.')
      return
    }

    const totalKata = entries.reduce((sum, entry) => sum + entry.kosakata.length, 0)
    window.dispatchEvent(
      new CustomEvent('open-confirm', {
        detail: {
          title: 'Restore backup?',
          message: `${entries.length} bab dan ${totalKata} kata akan ditambahkan sebagai data baru.`,
          confirmLabel: 'Restore',
          onConfirm: async () => {
            restoring = true
            restoreProgress = { index: 0, total: entries.length, nama: '' }
            try {
              const summary = await restoreBackup(entries, (progress) => {
                restoreProgress = progress
              })
              await loadBabs()
              if (summary.failed.length > 0) {
                toast.error(`${summary.failed.length} bab gagal direstore.`)
              } else {
                toast.success(
                  `Restore selesai: ${summary.bab} bab, ${summary.inserted} kata ditambahkan.`,
                )
              }
            } finally {
              restoring = false
              restoreProgress = { index: 0, total: 0, nama: '' }
            }
          },
        },
      }),
    )
  }
</script>

<section class="space-y-6">
  <header class="space-y-2">
    <h1 class="text-headline-lg font-bold tracking-tight sm:text-headline-xl">Settings</h1>
    <p class="text-body-md text-on-surface-variant">
      Tampilan, voice, playback, dan backup data kosakata.
    </p>
  </header>

  <div class="grid gap-4 lg:grid-cols-2">
    <section class="card space-y-5 p-5" aria-labelledby="settings-theme">
      <div class="space-y-1">
        <h2 id="settings-theme" class="text-title-md">Tampilan</h2>
        <p class="text-body-md text-on-surface-variant">Atur mode terang/gelap dan warna aksen aplikasi.</p>
      </div>

      <div class="space-y-2">
        <p class="text-label-lg">Mode tampilan</p>
        <div class="flex rounded-full bg-surface-high p-1" role="radiogroup" aria-label="Tema aplikasi">
          {#each [
            { value: 'light', label: 'Terang' },
            { value: 'dark', label: 'Gelap' },
            { value: 'system', label: 'Sistem' },
          ] as option (option.value)}
            <button
              type="button"
              role="radio"
              aria-checked={config.theme === option.value}
              class="flex-1 rounded-full px-3 py-2 text-label-lg font-medium transition-colors {config.theme ===
              option.value
                ? 'bg-primary-container text-primary-on-container'
                : 'text-on-surface-variant hover:text-on-surface'}"
              onclick={() => setTheme(option.value)}
            >
              {option.label}
            </button>
          {/each}
        </div>
      </div>

      <div class="space-y-2">
        <p class="text-label-lg">Warna tema</p>
        <div class="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {#each colorThemes as themeItem (themeItem.id)}
            <button
              type="button"
              class="flex items-center gap-2 rounded-lg border px-3 py-2 transition-all {config.colorTheme === themeItem.id
                ? 'border-primary bg-primary/5 shadow-level-2'
                : 'border-outline-variant/70 hover:border-outline'}"
              onclick={() => setColorTheme(themeItem.id)}
              aria-pressed={config.colorTheme === themeItem.id}
            >
              <span
                class="h-6 w-6 rounded-full ring-1 ring-outline-variant/60"
                style={`background: ${themeItem.color}`}
              ></span>
              <span class="text-body-md">{themeItem.label}</span>
            </button>
          {/each}
        </div>
      </div>
    </section>

    <section class="card space-y-4 p-5" aria-labelledby="settings-voice">
      <div class="space-y-1">
        <h2 id="settings-voice" class="text-title-md">Voice</h2>
        <p class="text-body-md text-on-surface-variant">
          Preferensi voice. Voice aktual mengikuti konfigurasi backend.
        </p>
      </div>

      <div class="space-y-3">
        <div class="space-y-1.5">
          <label for="voiceJp" class="label">Voice Jepang</label>
          <select
            id="voiceJp"
            bind:value={config.voiceJp}
            onchange={save}
            class="field pr-8"
          >
            {#each voiceJpOptions as voice (voice)}
              <option value={voice}>{voice}</option>
            {/each}
          </select>
        </div>

        <div class="space-y-1.5">
          <label for="voiceId" class="label">Voice Indonesia</label>
          <select
            id="voiceId"
            bind:value={config.voiceId}
            onchange={save}
            class="field pr-8"
          >
            {#each voiceIdOptions as voice (voice)}
              <option value={voice}>{voice}</option>
            {/each}
          </select>
        </div>
      </div>
    </section>

    <section class="card space-y-4 p-5 lg:col-span-2" aria-labelledby="settings-playback">
      <div class="space-y-1">
        <h2 id="settings-playback" class="text-title-md">Playback</h2>
        <p class="text-body-md text-on-surface-variant">
          Kecepatan, volume, dan jeda antar audio saat Play All.
        </p>
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        <div class="space-y-2">
          <p class="label">Kecepatan bicara</p>
          <div class="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Kecepatan bicara">
            {#each speeds as speed (speed)}
              <button
                type="button"
                role="radio"
                aria-checked={Number(config.speed) === speed}
                class="chip transition-colors {Number(config.speed) === speed
                  ? 'bg-primary-container text-primary-on-container'
                  : 'bg-surface-high text-on-surface-variant hover:text-on-surface'}"
                onclick={() => update({ speed })}
              >
                {speed}x
              </button>
            {/each}
          </div>
        </div>

        <div class="space-y-2">
          <label for="gap" class="label">Jeda antar audio</label>
          <select
            id="gap"
            bind:value={config.gapMs}
            onchange={save}
            class="field pr-8"
          >
            {#each gaps as gap (gap.value)}
              <option value={gap.value}>{gap.label}</option>
            {/each}
          </select>
        </div>

        <div class="space-y-2 sm:col-span-2">
          <label for="volume" class="label">
            Volume default <span class="tabular-nums">{Math.round(Number(config.volume) * 100)}%</span>
          </label>
          <input
            id="volume"
            type="range"
            min="0"
            max="1"
            step="0.05"
            bind:value={config.volume}
            onchange={save}
            class="h-1.5 w-full cursor-pointer"
          />
        </div>

        <label class="flex items-start gap-2.5 sm:col-span-2">
          <input
            type="checkbox"
            class="mt-0.5 h-4 w-4"
            bind:checked={config.autoSkip404}
            onchange={save}
          />
          <span>
            <span class="text-body-md font-medium">Auto-skip audio bermasalah</span>
            <span class="block text-label-md text-on-surface-variant">
              Lanjut ke audio berikutnya jika file gagal diputar.
            </span>
          </span>
        </label>
      </div>
    </section>

    <section class="card space-y-4 p-5 lg:col-span-2" aria-labelledby="settings-conn">
      <div class="space-y-1">
        <h2 id="settings-conn" class="text-title-md">Koneksi Backend</h2>
        <p class="text-body-md text-on-surface-variant">
          Endpoint: <code class="rounded-sm bg-surface-high px-1.5 py-0.5 text-label-md">{API_BASE_URL || 'same-origin'}/api/health</code>
        </p>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <button type="button" class="btn btn-outline" onclick={loadHealth} disabled={healthStatus === 'loading'}>
          {healthStatus === 'loading' ? 'Memeriksa...' : 'Cek Ulang'}
        </button>
        {#if healthStatus === 'success'}
          <span class="chip bg-status-ready/15 text-status-ready">
            <span class="h-2 w-2 rounded-full bg-current"></span>
            Terhubung ke {health?.service} v{health?.version}
          </span>
        {:else if healthStatus === 'error'}
          <span class="chip bg-error/10 text-error">
            <span class="h-2 w-2 rounded-full bg-current"></span>
            Gagal terhubung
          </span>
        {:else}
          <span class="chip bg-surface-high text-on-surface-variant">Memeriksa...</span>
        {/if}
      </div>
      {#if healthStatus === 'error' && healthError}
        <p class="text-label-md text-error">{healthError}</p>
      {/if}
      {#if healthStatus === 'success' && health}
        <p class="text-label-md text-on-surface-variant">Status: {health.status} · Waktu server: {new Date(health.time).toLocaleString('id-ID')}</p>
      {/if}
    </section>

    <section class="card space-y-4 p-5 lg:col-span-2" aria-labelledby="settings-backup">
      <div class="space-y-1">
        <h2 id="settings-backup" class="text-title-md">Backup / Restore</h2>
        <p class="text-body-md text-on-surface-variant">
          Export semua bab + kosakata, atau restore dari file backup JSON.
        </p>
      </div>

      <div class="flex flex-wrap gap-2">
        <button type="button" class="btn btn-primary" disabled={exporting} onclick={exportAll}>
          {exporting ? 'Menyiapkan...' : 'Export Full JSON'}
        </button>
        <button type="button" class="btn btn-tonal" disabled={restoring} onclick={pickBackup}>
          {restoring ? 'Memulihkan...' : 'Import Backup'}
        </button>
        <input
          bind:this={fileInput}
          type="file"
          accept="application/json,.json"
          class="sr-only"
          onchange={handleFile}
        />
        <button type="button" class="btn btn-ghost" onclick={reset}>Reset Pengaturan</button>
      </div>

      {#if restoring}
        <div class="space-y-2 rounded-md bg-surface-high p-3" aria-live="polite">
          <div class="flex items-center justify-between text-label-lg text-on-surface-variant">
            <span>Memulihkan {restoreProgress.nama || 'data'}...</span>
            <span class="tabular-nums">{restoreProgress.index}/{restoreProgress.total}</span>
          </div>
          <div class="h-1.5 overflow-hidden rounded-full bg-surface">
            <div
              class="h-full rounded-full bg-primary transition-all duration-200"
              style={`width: ${restoreProgress.total ? (restoreProgress.index / restoreProgress.total) * 100 : 0}%`}
            ></div>
          </div>
        </div>
      {/if}

      <p class="text-label-md text-on-surface-variant">
        Restore menambahkan bab baru dan tidak menimpa data yang sudah ada. Audio perlu di-generate ulang.
      </p>
    </section>
  </div>
</section>
