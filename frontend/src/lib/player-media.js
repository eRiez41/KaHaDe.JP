export function bindMediaSession(actions) {
  if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) {
    return
  }

  for (const [action, handler] of Object.entries(actions)) {
    try {
      navigator.mediaSession.setActionHandler(action, handler)
    } catch {
      // action is not supported by this browser
    }
  }
}

export function setMediaSession(entry) {
  if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) {
    return
  }
  if (typeof MediaMetadata !== 'undefined') {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: entry.kanji || entry.hira || entry.arti,
      artist: entry.arti,
      album: 'KaHaDe.JP',
    })
  }
  navigator.mediaSession.playbackState = 'playing'
}

export function setMediaPlaybackState(state) {
  if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) {
    return
  }
  navigator.mediaSession.playbackState = state
}

export function clearMediaSession() {
  if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) {
    return
  }
  navigator.mediaSession.metadata = null
  navigator.mediaSession.playbackState = 'none'
}
