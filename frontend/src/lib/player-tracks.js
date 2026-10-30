import { audioURL } from './api.js'

export const PAGE_VERSION = Date.now()

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

export function notifyPlayer(message) {
  window.dispatchEvent(
    new CustomEvent('audio-player-toast', {
      detail: { message },
    }),
  )
}

function resolveSource(item, lang) {
  const provided = lang === 'jp' ? item.audio?.jp : item.audio?.id
  if (provided && /^https?:\/\//i.test(provided)) {
    return provided
  }
  return audioURL(item.id, lang)
}

export function buildEntries(item, itemIndex) {
  if (!item || item.audioStatus !== 'ready') {
    return []
  }

  const version = item.updatedAt ? String(Date.parse(item.updatedAt) || item.updatedAt) : PAGE_VERSION
  const meta = {
    itemId: item.id,
    itemIndex,
    kanji: item.kanji || '',
    hira: item.hira || '',
    romaji: item.romaji || '',
    arti: item.arti || '',
    version,
  }

  return [
    { ...meta, lang: 'jp', label: 'Jepang', url: resolveSource(item, 'jp') },
    { ...meta, lang: 'id', label: 'Indo', url: resolveSource(item, 'id') },
  ]
}

export function withCacheBust(url, version) {
  const separator = url.includes('?') ? '&' : '?'
  return `${url}${separator}_v=${encodeURIComponent(version || PAGE_VERSION)}`
}
