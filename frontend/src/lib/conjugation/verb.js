import { toHiragana } from 'wanakana'

// Shared verb helpers for every masu-based conjugation module.

// e-dan endings: a masu-stem ending here is always Ichidan.
export const E_DAN = new Set(['え', 'け', 'げ', 'せ', 'ぜ', 'て', 'で', 'ね', 'へ', 'べ', 'ぺ', 'め', 'れ'])

// Godan う-dan endings, used to rebuild the dictionary form.
export const GODAN_KAMUS = {
  い: 'う',
  き: 'く',
  ぎ: 'ぐ',
  し: 'す',
  じ: 'る',
  ち: 'つ',
  に: 'ぬ',
  び: 'ぶ',
  み: 'む',
  り: 'る',
}

export const GOLONGAN_LABEL = {
  godan: 'Golongan I — Godan',
  ichidan: 'Golongan II — Ichidan',
  irregular: 'Golongan III — Irregular',
}

export function trim(s) {
  return (s || '').trim()
}

export function detectInputType(input) {
  const s = trim(input)
  if (!s) return 'empty'
  if (/[ぁ-ん]/.test(s) && /[ア-ン]/.test(s)) return 'mixed'
  if (/[ア-ン]/.test(s)) return 'katakana'
  if (/[ぁ-ん]/.test(s)) return 'hiragana'
  if (/[一-龯々〆ヵヶ]/.test(s)) return 'kanji'
  if (/[a-zA-Z]/.test(s)) return 'romaji'
  return 'unknown'
}

export function normalizeToHiragana(input) {
  const s = trim(input)
  const type = detectInputType(s)
  if (type === 'romaji') {
    try {
      return toHiragana(s.toLowerCase())
    } catch {
      return s.toLowerCase()
    }
  }
  if (type === 'katakana' || type === 'mixed') {
    try {
      return toHiragana(s, { convertLongVowelMark: false })
    } catch {
      return s
    }
  }
  return s
}
