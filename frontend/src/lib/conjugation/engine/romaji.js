import { toRomaji as kanaToRomaji } from 'wanakana'

// Wapuro romaji. Wanakana keeps spaces, so callers can pass a string such as
// "たべません でした" when an auxiliary needs a visual separator.
export function romaji(text) {
  if (!text) return ''
  return kanaToRomaji(text)
}

export function joinRomaji(...parts) {
  return parts
    .filter(Boolean)
    .map((part) => String(part).trim())
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
}
