<script>
  import { onMount } from 'svelte'
  import { fly } from 'svelte/transition'

  import AdminLoginModal from './components/AdminLoginModal.svelte'
  import BabFormModal from './components/BabFormModal.svelte'
  import ConfirmModal from './components/ConfirmModal.svelte'
  import GenerateModal from './components/GenerateModal.svelte'
  import MiniPlayer from './components/MiniPlayer.svelte'
  import Toast from './components/Toast.svelte'
  import BabDetail from './routes/BabDetail.svelte'
  import BabList from './routes/BabList.svelte'
  import Dashboard from './routes/Dashboard.svelte'
  import Kanji from './routes/Kanji.svelte'
  import Settings from './routes/Settings.svelte'
  import UbahKata from './routes/UbahKata.svelte'
  import UbahKataDetail from './routes/UbahKataDetail.svelte'
  import { auth, initAuth, login, logout } from './lib/auth.svelte.js'
  import { settings } from './lib/settings.js'

  const routes = {
    dashboard: Dashboard,
    bab: BabList,
    kanji: Kanji,
    settings: Settings,
    'ubah-kata': UbahKata,
  }

  const navItems = $derived(
    auth.isAdmin
      ? [
          { key: 'dashboard', label: 'Dashboard' },
          { key: 'bab', label: 'Bab' },
          { key: 'kanji', label: 'Kanji' },
          { key: 'ubah-kata', label: 'Perubahan Kata' },
          { key: 'settings', label: 'Settings' },
        ]
      : [
          { key: 'dashboard', label: 'Dashboard' },
          { key: 'bab', label: 'Bab' },
          { key: 'kanji', label: 'Kanji' },
          { key: 'ubah-kata', label: 'Perubahan Kata' },
        ],
  )

  const UB_KATA_SUBS = new Set([
    'masu-te',
    'masu-nai',
    'masu-jisho',
    'masu-ta',
    'masu-tara',
    'masu-kanou',
    'masu-ishou',
    'masu-meirei',
    'masu-eba',
    'masu-ukemi',
    'masu-shieki',
    'masu-shiekiukemi',
    'masu-keigo',
    'i-kei',
    'na-kei',
  ])

  function parseRoute() {
    const raw = window.location.hash.replace(/^#\/?/, '')
    const parts = raw.split('/')
    const name = parts[0]
    const param = parts[1]

    if (name === 'bab' && param) {
      return { name: 'bab-detail', id: param }
    }
    if (name === 'ubah-kata' && UB_KATA_SUBS.has(param)) {
      return { name: 'ubah-kata-detail', sub: param }
    }
    if (name === 'settings') {
      return auth.isAdmin ? { name: 'settings', id: null } : { name: 'dashboard', id: null }
    }
    if (routes[name]) {
      return { name, id: null }
    }
    return { name: 'dashboard', id: null }
  }

  let route = $state(parseRoute())
  let systemDark = $state(false)
  let adminTapCount = $state(0)
  let adminTapTimer = $state(null)
  let adminLoginOpen = $state(false)
  let adminLoginError = $state('')

  initAuth()

  const Page = $derived(
    route.name === 'settings' ? (auth.isAdmin ? Settings : Dashboard) : routes[route.name] ?? Dashboard,
  )
  const activeNav = $derived(
    route.name === 'bab-detail' ? 'bab' : route.name === 'ubah-kata-detail' ? 'ubah-kata' : route.name,
  )
  const routeKey = $derived(`${route.name}:${route.id ?? route.sub ?? ''}`)
  const isDark = $derived(
    $settings.theme === 'dark' || ($settings.theme === 'system' && systemDark),
  )

  onMount(() => {
    const syncFromHash = () => {
      route = parseRoute()
      if (route.name === 'settings' && !auth.isAdmin) {
        window.location.hash = '#dashboard'
        route = { name: 'dashboard', id: null }
        return
      }
    }

    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const syncTheme = () => {
      systemDark = media.matches
    }

    syncFromHash()
    syncTheme()
    window.addEventListener('hashchange', syncFromHash)
    media.addEventListener('change', syncTheme)

    return () => {
      window.removeEventListener('hashchange', syncFromHash)
      media.removeEventListener('change', syncTheme)
      if (adminTapTimer) {
        clearTimeout(adminTapTimer)
      }
    }
  })

  function toggleTheme() {
    settings.persist({ ...$settings, theme: isDark ? 'light' : 'dark' })
  }

  function handleThemeTap() {
    if (auth.isAdmin) {
      logout()
      route = parseRoute()
      if (route.name === 'settings') {
        window.location.hash = '#dashboard'
        route = { name: 'dashboard', id: null }
      }
      window.location.reload()
      return
    }
    adminTapCount += 1
    if (adminTapTimer) {
      clearTimeout(adminTapTimer)
    }
    if (adminTapCount >= 2) {
      adminTapCount = 0
      adminLoginOpen = true
      adminLoginError = ''
      return
    }
    adminTapTimer = setTimeout(() => {
      adminTapCount = 0
    }, 600)
    toggleTheme()
  }

  function handleAdminLogin(pw) {
    if (login(pw)) {
      adminLoginOpen = false
      adminLoginError = ''
      route = { name: 'settings', id: null }
      window.location.hash = '#settings'
      // ensure route reflects
      setTimeout(() => {
        route = parseRoute()
      }, 0)
      return
    }
    adminLoginError = 'Password salah.'
  }
</script>

<div class="min-h-dvh">
  <header class="sticky top-0 z-30 border-b border-outline-variant/60 frosted">
    <div
      class="mx-auto flex max-w-[1200px] items-center gap-2 px-4 py-2.5 sm:gap-4 sm:px-6"
    >
      <a
        href="#dashboard"
        class="flex shrink-0 items-center gap-2"
        aria-label="KaHaDe.JP — Kata Hapalan Dengar Japan"
        title="KaHaDe.JP — Kata Hapalan Dengar Japan"
      >
        <span
          class="grid h-10 w-10 place-items-center rounded-lg bg-primary-container text-label-lg font-bold text-primary-on-container"
        >
          JP
        </span>
        <span class="hidden text-title-md font-bold tracking-tight sm:block">KaHaDe.JP</span>
      </a>

      <nav class="scrollbar-none -mx-1 hidden flex-1 gap-1 overflow-x-auto px-1 sm:flex" aria-label="Navigasi utama">
        {#each navItems as item (item.key)}
          <a
            href={`#${item.key}`}
            class="whitespace-nowrap rounded-full px-3.5 py-2 text-label-lg transition-colors duration-150 sm:px-4 {activeNav ===
            item.key
              ? 'bg-primary-container text-primary-on-container'
              : 'text-on-surface-variant hover:bg-on-surface/5 hover:text-on-surface'}"
            aria-current={activeNav === item.key ? 'page' : undefined}
          >
            {item.label}
          </a>
        {/each}
      </nav>

      <button
        type="button"
        class="icon-btn shrink-0"
        onclick={handleThemeTap}
        aria-label={auth.isAdmin ? 'Keluar mode admin' : isDark ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'}
        title={auth.isAdmin ? 'Mode Admin (keluar)' : isDark ? 'Mode terang' : 'Mode gelap'}
      >
        {#if isDark}
          <svg viewBox="0 0 24 24" class="h-5 w-5" fill="currentColor" aria-hidden="true">
            <path d="M12 4a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0V5a1 1 0 0 1 1-1Zm0 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0v-1a1 1 0 0 1 1-1ZM4 12a1 1 0 0 1 1-1h1a1 1 0 1 1 0 2H5a1 1 0 0 1-1-1Zm14 0a1 1 0 0 1 1-1h1a1 1 0 1 1 0 2h-1a1 1 0 0 1-1-1ZM6.3 5.3a1 1 0 0 1 1.4 0l.7.7a1 1 0 0 1-1.4 1.4l-.7-.7a1 1 0 0 1 0-1.4Zm9.3 9.3a1 1 0 0 1 1.4 0l.7.7a1 1 0 1 1-1.4 1.4l-.7-.7a1 1 0 0 1 0-1.4Zm1.4-9.3a1 1 0 0 1 0 1.4l-.7.7a1 1 0 0 1-1.4-1.4l.7-.7a1 1 0 0 1 1.4 0Zm-9.3 9.3a1 1 0 0 1 0 1.4l-.7.7a1 1 0 0 1-1.4-1.4l.7-.7a1 1 0 0 1 1.4 0Z" />
          </svg>
        {:else}
          <svg viewBox="0 0 24 24" class="h-5 w-5" fill="currentColor" aria-hidden="true">
            <path d="M20.7 14.3a1 1 0 0 0-1.2-.3 7 7 0 0 1-9.5-9.5 1 1 0 0 0-1.3-1.2A9 9 0 1 0 21 15.5a1 1 0 0 0-.3-1.2Z" />
          </svg>
        {/if}
      </button>
    </div>
  </header>

  <main
    id="main-content"
    class="mx-auto w-full max-w-[1200px] px-4 py-6 pb-32 sm:px-6 md:py-8 md:pb-36"
    tabindex="-1"
  >
    {#key routeKey}
      <div in:fly={{ y: 6, duration: 200, opacity: 0.9 }}>
        {#if route.name === 'bab-detail'}
          <BabDetail id={route.id} />
        {:else if route.name === 'ubah-kata-detail'}
          <UbahKataDetail sub={route.sub} />
        {:else}
          <Page />
        {/if}
      </div>
    {/key}
  </main>

  <nav
    class="fixed bottom-0 left-0 right-0 z-40 border-t border-outline-variant/70 frosted sm:hidden"
    aria-label="Navigasi bawah"
  >
    <div class="mx-auto flex max-w-[420px] items-center justify-around px-2 pb-[calc(env(safe-area-inset-bottom)+4px)] pt-1.5">
      {#each navItems as item (item.key)}
        <a
          href={`#${item.key}`}
          class="flex min-h-11 min-w-14 flex-col items-center justify-center gap-0.5 rounded-full px-2 text-label-md transition-colors {activeNav ===
          item.key
            ? 'text-primary'
            : 'text-on-surface-variant'}"
          aria-current={activeNav === item.key ? 'page' : undefined}
        >
          {#if item.key === 'dashboard'}
            <svg viewBox="0 0 20 20" class="h-5 w-5" fill="currentColor" aria-hidden="true">
              <path
                d="M10.707 2.293a1 1 0 0 0-1.414 0l-7 7A1 1 0 0 0 3 10.707V17a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-3h4v3a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-6.293a1 1 0 0 0-.293-.707l-7-7Z"
              />
            </svg>
          {:else if item.key === 'bab'}
            <svg viewBox="0 0 20 20" class="h-5 w-5" fill="currentColor" aria-hidden="true">
              <path
                d="M4 5.5A1.5 1.5 0 0 1 5.5 4h5A1.5 1.5 0 0 1 12 5.5v13a1 1 0 0 1-2 0V6H6v12a1 1 0 0 1-2 0V5.5Zm8.5 0A1.5 1.5 0 0 1 14 4h4.5A1.5 1.5 0 0 1 20 5.5v13a1 1 0 0 1-2 0V6h-3.5v12.5a1 1 0 0 1-2 0V5.5Z"
              />
            </svg>
          {:else if item.key === 'kanji'}
            <svg viewBox="0 0 20 20" class="h-5 w-5" fill="currentColor" aria-hidden="true">
              <path
                d="M3 4.75A.75.75 0 0 1 3.75 4h12.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 4.75Zm0 10A.75.75 0 0 1 3.75 14h12.5a.75.75 0 0 1 0 1.5H3.75a.75.75 0 0 1-.75-.75ZM4.5 7.25a.75.75 0 0 0 0 1.5h11a.75.75 0 0 0 0-1.5h-11Zm0 4a.75.75 0 0 0 0 1.5h11a.75.75 0 0 0 0-1.5h-11Z"
              />
            </svg>
          {:else if item.key === 'ubah-kata'}
            <svg viewBox="0 0 20 20" class="h-5 w-5" fill="currentColor" aria-hidden="true">
              <path
                d="M10 2a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 10 2ZM10 15a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 10 15ZM10 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z"
              />
            </svg>
          {:else}
            <svg viewBox="0 0 20 20" class="h-5 w-5" fill="currentColor" aria-hidden="true">
              <path
                fill-rule="evenodd"
                d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 0 1-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 0 1 .947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 0 1 2.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 0 1 2.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 0 1 .947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 0 1-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 0 1-2.287-.947ZM10 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
                clip-rule="evenodd"
              />
            </svg>
          {/if}
          <span>{item.label}</span>
        </a>
      {/each}
    </div>
  </nav>

  <MiniPlayer />
  <BabFormModal />
  <ConfirmModal />
  <GenerateModal />
  <AdminLoginModal
    open={adminLoginOpen}
    error={adminLoginError}
    onClose={() => (adminLoginOpen = false)}
    onSuccess={handleAdminLogin}
  />
  <Toast />
</div>
