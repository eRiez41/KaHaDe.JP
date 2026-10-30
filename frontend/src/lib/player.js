import { PlayerCore } from './player-core.js'
import { getPlayerState, updatePlayerState } from './stores/player.js'
import { getNextTarget, getPreviousTarget } from './player-queue.js'
import { setMediaSession } from './player-media.js'
import { clamp, notifyPlayer, withCacheBust } from './player-tracks.js'

class AudioPlayer extends PlayerCore {
  playAll(items) {
    this.items = Array.isArray(items) ? items : []
    this.applyQueue(this.items)
    if (this.queue.length === 0) {
      notifyPlayer('Belum ada audio siap untuk diputar.')
      return 0
    }
    this.index = -1
    this.current = null
    this.playNextEntry()
    return this.itemTotal
  }

  playItem(item) {
    this.applyQueue([item])
    if (this.queue.length === 0) {
      notifyPlayer('Audio untuk kata ini belum siap.')
      return 0
    }
    this.index = -1
    this.current = null
    this.playNextEntry()
    return 1
  }

  playNextEntry() {
    const nextIndex = this.index + 1
    if (nextIndex >= this.queue.length) {
      this.finish()
      return
    }
    this.playEntryAt(nextIndex)
  }

  playEntryAt(index) {
    const entry = this.queue[index]
    if (!entry) {
      this.finish()
      return
    }

    this.clearTimers()
    this.index = index
    this.current = entry
    this.ignorePause = true
    this.errorHandledFor = ''

    this.audio.pause()
    this.audio.src = withCacheBust(entry.url, entry.version)
    this.audio.playbackRate = clamp(Number(this.settings.speed) || 1, 0.25, 4)
    this.audio.volume = clamp(Number(this.settings.volume ?? 1), 0, 1)

    updatePlayerState({
      status: 'loading',
      playing: false,
      loading: true,
      current: entry,
      queue: this.queue,
      currentIndex: index,
      position: entry.itemIndex + 1,
      total: this.itemTotal,
      currentTime: 0,
      duration: 0,
      progress: 0,
      error: '',
    })

    this.preloadNext()
    setMediaSession(entry)

    this.audio
      .play()
      .then(() => {
        this.ignorePause = false
        this.syncTime()
      })
      .catch((error) => {
        this.ignorePause = false
        if (error?.name === 'AbortError') {
          return
        }
        if (error?.name === 'NotAllowedError') {
          updatePlayerState({
            status: 'paused',
            playing: false,
            loading: false,
            error: 'Tap untuk memutar',
          })
          return
        }
        this.handleError('Gagal memutar audio.')
      })
  }

  toggle() {
    if (!this.current) {
      if (this.queue.length > 0) {
        this.index = -1
        this.playNextEntry()
      }
      return
    }

    if (getPlayerState().status === 'finished') {
      this.index = -1
      this.playNextEntry()
      return
    }

    if (this.audio.paused) {
      this.ignorePause = false
      updatePlayerState({ status: 'loading', loading: true, error: '' })
      this.audio
        .play()
        .then(() => this.syncTime())
        .catch((error) => {
          if (error?.name === 'AbortError') {
            return
          }
          updatePlayerState({
            status: 'paused',
            playing: false,
            loading: false,
            error: error?.name === 'NotAllowedError' ? 'Tap untuk memutar' : 'Gagal memutar audio.',
          })
        })
      return
    }

    this.audio.pause()
    updatePlayerState({ status: 'paused', playing: false, loading: false })
  }

  next() {
    if (!this.current) {
      return
    }
    const target = getNextTarget(this.queue, this.index, this.current)
    if (target === -1) {
      this.finish()
      return
    }
    this.playEntryAt(target)
  }

  previous() {
    if (!this.current) {
      return
    }

    if (this.audio.currentTime > 3) {
      this.seek(0)
      return
    }

    const target = getPreviousTarget(this.queue, this.index, this.current)
    if (target < 0) {
      this.seek(0)
      return
    }
    this.playEntryAt(target)
  }
}

export const player = new AudioPlayer()
