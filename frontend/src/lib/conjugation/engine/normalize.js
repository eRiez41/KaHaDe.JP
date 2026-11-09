import { normalizeToHiragana } from '../verb.js'

const KANJI_PATTERN = /[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff々〆ヵヶ]/
const JAPANESE_OR_LATIN = /[a-zA-Z\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff々〆ヵヶ]/
const KANA_PATTERN = /[\u3040-\u30ff]/

export function hasKanji(text) {
  return KANJI_PATTERN.test(text ?? '')
}

export function validateInput(input) {
  const value = (input ?? '').trim()
  if (!value) {
    throw new Error('Input kosong')
  }
  if (Array.from(value).length > 50) {
    throw new Error('Input terlalu panjang (maksimal 50 karakter)')
  }
  if (/\s/.test(value)) {
    throw new Error('Masukkan satu kata tanpa spasi')
  }
  if (!JAPANESE_OR_LATIN.test(value)) {
    throw new Error('Input harus huruf Jepang atau romaji')
  }
  return value
}

// Romaji/katakana are converted locally. Kanji is converted lazily through
// kuromoji when the caller provides `toHira`; otherwise the original string is
// returned and validate.js resolves the reading through Jisho.
export async function normalizeInput(input, { toHira } = {}) {
  const raw = validateInput(input)
  if (!hasKanji(raw)) {
    return normalizeToHiragana(raw)
  }

  if (typeof toHira === 'function') {
    try {
      const converted = await toHira(raw)
      if (converted && KANA_PATTERN.test(converted)) {
        return converted.trim()
      }
    } catch {
      // Fall through: Jisho will provide the reading later.
    }
  }

  return raw
}
