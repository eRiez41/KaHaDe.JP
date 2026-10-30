import { toRomaji as kanaToRomaji } from 'wanakana'

// Kanji and Japanese punctuation that need the morphological analyzer.
const KANJI_PATTERN = /[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff々〆ヵヶ]/
const JAPANESE_PATTERN = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff々〆ヵヶ]/

let kuroshiroPromise = null

export function hasKanji(text) {
  return KANJI_PATTERN.test(text)
}

export function hasJapanese(text) {
  return JAPANESE_PATTERN.test(text)
}

// Load kuroshiro + kuromoji only when a conversion with kanji is requested.
function loadKuroshiro() {
  if (!kuroshiroPromise) {
    kuroshiroPromise = (async () => {
      const [{ default: Kuroshiro }, { default: KuromojiAnalyzer }] = await Promise.all([
        import('kuroshiro'),
        import('kuroshiro-analyzer-kuromoji'),
      ])

      const kuroshiro = new Kuroshiro()
      await kuroshiro.init(
        new KuromojiAnalyzer({
          dictPath: `${import.meta.env.BASE_URL}dict/`,
        }),
      )
      return kuroshiro
    })().catch((error) => {
      kuroshiroPromise = null
      throw error
    })
  }

  return kuroshiroPromise
}

/**
 * Convert Japanese text to wapuro-style romaji.
 * Pure kana uses wanakana without loading the large dictionary. Text with
 * kanji is converted to hiragana by kuroshiro first, then transliterated by
 * wanakana so both paths use the same output style.
 */
export async function toRomaji(text) {
  const value = text.trim()
  if (!value) {
    return ''
  }

  if (!hasKanji(value)) {
    return kanaToRomaji(value)
  }

  const kuroshiro = await loadKuroshiro()
  const hiragana = await kuroshiro.convert(value, { to: 'hiragana', mode: 'spaced' })
  return kanaToRomaji(hiragana)
}

export async function toHira(text) {
  const value = text.trim()
  if (!value) {
    return ''
  }

  if (!hasKanji(value)) {
    return value
  }

  try {
    const kuroshiro = await loadKuroshiro()
    return await kuroshiro.convert(value, { to: 'hiragana', mode: 'normal' })
  } catch {
    return ''
  }
}
