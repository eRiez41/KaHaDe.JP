import { settings } from './settings.js'
import {
  getPlayerState,
  playerState,
  resetPlayerState,
  updatePlayerState,
} from './stores/player.js'
import { bindMediaSession, clearMediaSession, setMediaPlaybackState } from './player-media.js'
import { createQueue, refreshQueueItem, removeQueueItem } from './player-queue.js'
import { clamp, notifyPlayer, withCacheBust } from './player-tracks.js'

const SKIP_DELAY = 500

export class PlayerCore {
  constructor() {
    this.audio = new Audio()
    this.audio.preload = 'auto'
    this.queue = []
    this.items = []
    this.index = -1
    this.current = null
    this.itemTotal = 0
    this.preloaded = null
    this.preloadedKey = ''
    this.gapTimer = null
    this.skipTimer = null
    this.ignorePause = false
    this.errorHandledFor = ''
    this.settings = { speed: 1, volume: 1, gapMs: 0, autoSkip404: true }

    this.bindAudio()
    this.bindSettings()
    bindMediaSession({
      play: () => this.toggle(),
      pause: () => this.toggle(),
      nexttrack: () => this.next(),
      previoustrack: () => this.previous(),
      stop: () => this.stop(),
    })
  }

  bindAudio() {
    this.audio.addEventListener('timeupdate', () => this.syncTime())
    this.audio.addEventListener('durationchange', () => this.syncTime())
    this.audio.addEventListener('loadedmetadata', () => this.syncTime())

    this.audio.addEventListener('playing', () => {
      this.ignorePause = false
      updatePlayerState({
        status: 'playing',
        playing: true,
        loading: false,
        error: '',
      })
      this.syncTime()
    })

    this.audio.addEventListener('waiting', () => {
      if (this.current) {
        updatePlayerState({ loading: true })
      }
    })

    this.audio.addEventListener('pause', () => {
      if (this.ignorePause || !this.current || this.audio.ended) {
        return
      }
      const status = getPlayerState().status
      if (status === 'finished' || status === 'hidden' || status === 'error') {
        return
      }
      updatePlayerState({ status: 'paused', playing: false, loading: false })
    })

    this.audio.addEventListener('ended', () => this.handleEnded())
    this.audio.addEventListener('error', () => {
      if (this.current && !this.ignorePause) {
        this.handleError()
      }
    })
  }

  bindSettings() {
    settings.subscribe((value) => {
      this.settings = { ...this.settings, ...value }
      this.audio.playbackRate = clamp(Number(value.speed) || 1, 0.25, 4)
      this.audio.volume = clamp(Number(value.volume ?? 1), 0, 1)
      updatePlayerState({
        speed: this.audio.playbackRate,
        volume: this.audio.volume,
      })
    })
  }

  setItems(items) {
    this.items = Array.isArray(items) ? items : []
  }

  applyQueue(items) {
    const { queue, itemTotal } = createQueue(items)
    this.queue = queue
    this.itemTotal = itemTotal
    this.preloaded = null
    this.preloadedKey = ''
    return queue
  }

  preloadNext() {
    const next = this.queue[this.index + 1]
    if (!next) {
      this.preloaded = null
      this.preloadedKey = ''
      return
    }

    const key = withCacheBust(next.url, next.version)
    if (this.preloaded && this.preloadedKey === key) {
      return
    }

    this.preloaded = new Audio()
    this.preloaded.preload = 'auto'
    this.preloaded.src = key
    this.preloadedKey = key
  }

  handleEnded() {
    this.clearTimers()
    const gap = Number(this.settings.gapMs) || 0

    if (gap <= 0) {
      this.playNextEntry()
      return
    }

    updatePlayerState({ status: 'loading', loading: true, playing: false })
    this.gapTimer = window.setTimeout(() => {
      this.gapTimer = null
      this.playNextEntry()
    }, gap)
  }

  handleError(message) {
    if (!this.current) {
      return
    }

    const key = `${this.current.url}:${this.current.version}`
    if (this.errorHandledFor === key) {
      return
    }
    this.errorHandledFor = key

    const text = message || `Gagal memutar ${this.current.label}, melanjutkan...`
    notifyPlayer(text)
    this.clearTimers()
    this.audio.pause()
    updatePlayerState({
      status: 'error',
      playing: false,
      loading: false,
      error: text,
    })

    if (this.settings.autoSkip404 === false) {
      return
    }

    this.skipTimer = window.setTimeout(() => {
      this.skipTimer = null
      this.playNextEntry()
    }, SKIP_DELAY)
  }

  seek(ratio) {
    const duration = this.audio.duration
    if (!duration || Number.isNaN(duration) || duration === Infinity) {
      return
    }
    const value = clamp(Number(ratio) || 0, 0, 1)
    try {
      this.audio.currentTime = duration * value
    } catch {
      return
    }
    this.syncTime()
  }

  syncTime() {
    if (!this.current) {
      return
    }
    const duration = Number.isFinite(this.audio.duration) ? this.audio.duration : 0
    const currentTime = Number.isFinite(this.audio.currentTime) ? this.audio.currentTime : 0
    const playing = !this.audio.paused
    updatePlayerState({
      current: this.current,
      currentTime,
      duration,
      progress: duration > 0 ? clamp((currentTime / duration) * 100, 0, 100) : 0,
      playing,
      loading: playing ? false : getPlayerState().loading,
      position: this.current.itemIndex + 1,
      total: this.itemTotal,
      speed: this.audio.playbackRate,
      volume: this.audio.volume,
    })
  }

  finish() {
    this.clearTimers()
    this.audio.pause()
    this.preloaded = null
    this.preloadedKey = ''
    const duration = Number.isFinite(this.audio.duration) ? this.audio.duration : 0
    updatePlayerState({
      status: 'finished',
      playing: false,
      loading: false,
      currentTime: duration,
      duration,
      progress: 100,
      error: '',
    })
    setMediaPlaybackState('none')
  }

  stop() {
    this.clearTimers()
    this.ignorePause = true
    this.current = null
    this.index = -1
    this.queue = []
    this.itemTotal = 0
    this.preloaded = null
    this.preloadedKey = ''
    this.errorHandledFor = ''

    try {
      this.audio.pause()
      this.audio.removeAttribute('src')
      this.audio.load()
    } catch {
      // ignore teardown failures
    }

    clearMediaSession()
    resetPlayerState({
      speed: Number(this.settings.speed) || 1,
      volume: clamp(Number(this.settings.volume ?? 1), 0, 1),
    })
  }

  removeItem(itemId) {
    if (!this.queue.some((entry) => entry.itemId === itemId)) {
      return
    }

    const wasCurrent = this.current?.itemId === itemId
    const { removed, queue, itemTotal } = removeQueueItem(this.queue, itemId)
    const label = removed[0].kanji || removed[0].hira || removed[0].arti
    this.queue = queue
    this.itemTotal = itemTotal

    if (wasCurrent) {
      this.stop()
      notifyPlayer(`"${label}" dihapus. Pemutaran dihentikan.`)
      return
    }

    if (this.queue.length === 0) {
      this.finish()
      return
    }

    this.index = this.queue.indexOf(this.current)
    updatePlayerState({
      queue: this.queue,
      total: this.itemTotal,
      currentIndex: this.index,
      position: this.current ? this.current.itemIndex + 1 : 0,
    })
  }

  refreshItem(item) {
    if (!item || !this.queue.some((entry) => entry.itemId === item.id)) {
      return
    }

    const currentLang = this.current?.itemId === item.id ? this.current.lang : null
    const refreshed = refreshQueueItem(this.queue, item)
    if (!refreshed) {
      return
    }

    this.queue = refreshed.queue
    this.itemTotal = refreshed.itemTotal
    this.items = this.items.map((entry) => (entry.id === item.id ? item : entry))

    if (currentLang) {
      const target = this.queue.findIndex(
        (entry) => entry.itemId === item.id && entry.lang === currentLang,
      )
      if (target !== -1) {
        this.playEntryAt(target)
        return
      }
      this.stop()
      notifyPlayer('Audio item yang diputar tidak lagi tersedia.')
      return
    }

    this.index = this.queue.indexOf(this.current)
    updatePlayerState({
      queue: this.queue,
      total: this.itemTotal,
      currentIndex: this.index,
      position: this.current ? this.current.itemIndex + 1 : 0,
    })
  }

  clearTimers() {
    if (this.gapTimer) {
      window.clearTimeout(this.gapTimer)
      this.gapTimer = null
    }
    if (this.skipTimer) {
      window.clearTimeout(this.skipTimer)
      this.skipTimer = null
    }
  }

  getState() {
    return getPlayerState()
  }

  subscribe(listener) {
    return playerState.subscribe(listener)
  }
}
