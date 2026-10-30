import { get, writable } from 'svelte/store'

const STORAGE_KEY = 'tts-jpn-settings'

const defaults = {
  voiceJp: 'ja-JP-NanamiNeural',
  voiceId: 'id-ID-GadisNeural',
  speed: 1.0,
  volume: 1.0,
  gapMs: 0,
  autoSkip404: true,
  theme: 'system',
  colorTheme: 'orange',
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return { ...defaults }
    }
    const parsed = JSON.parse(raw)
    return { ...defaults, ...parsed }
  } catch {
    return { ...defaults }
  }
}

export function resolveTheme(theme) {
  if (theme === 'dark') {
    return true
  }
  if (theme === 'light') {
    return false
  }
  if (typeof window === 'undefined') {
    return false
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export function applyTheme(theme, colorTheme = 'orange') {
  if (typeof document === 'undefined') {
    return
  }
  const dark = resolveTheme(theme)
  document.documentElement.classList.toggle('dark', dark)
  document.documentElement.style.colorScheme = dark ? 'dark' : 'light'
  document.documentElement.setAttribute('data-color', colorTheme || 'orange')
  document.documentElement.classList.add('theme-transition')
  window.setTimeout(() => {
    document.documentElement.classList.remove('theme-transition')
  }, 420)
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) {
    meta.content = dark ? '#1A1209' : '#FFF8F5'
  }
}

function createSettings() {
  const initial = load()
  const { subscribe, set, update } = writable(initial)

  applyTheme(initial.theme, initial.colorTheme)

  return {
    subscribe,
    set(value) {
      set(value)
      applyTheme(value.theme, value.colorTheme)
    },
    update,
    reset() {
      const value = { ...defaults }
      set(value)
      applyTheme(value.theme, value.colorTheme)
      try {
        localStorage.removeItem(STORAGE_KEY)
      } catch {
        // ignore
      }
    },
    persist(value) {
      set(value)
      applyTheme(value.theme, value.colorTheme)
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
      } catch {
        // ignore
      }
    },
  }
}

export const settings = createSettings()
export const defaultSettings = defaults

if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const current = get(settings)
    applyTheme(current.theme, current.colorTheme)
  })
}
