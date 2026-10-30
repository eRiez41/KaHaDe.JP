import { analyzeMasuVerb } from './masuBase.js'
import { U_TO_I } from './verbForms.js'
import { detectInputType, normalizeToHiragana, trim } from './verb.js'

const KAMUS_END = /[うくぐすつぬぶむる]$/

export function analyzeDictionaryVerb(form) {
  const last = form.slice(-1)
  const iDan = U_TO_I[last]
  if (!iDan) {
    throw new Error(
      'Bentuk kamus verba harus berakhiran u-dan (う/く/ぐ/す/つ/ぬ/ぶ/む/る).',
    )
  }
  const pre = form.slice(0, -1)
  return {
    stem: pre + iDan,
    alasan: `Bentuk kamus berakhiran "${last}" (u-dan), ciri Godan. Ubah ke "${iDan}" (i-dan), lalu tambah ます.`,
  }
}

// Accepts both directions: ます input goes to the shared base analyzer, while
// a dictionary form is classified later from the backend's part of speech.
export function analyzeJishoInput(input) {
  const original = trim(input)
  if (!original) {
    throw new Error('Input kosong')
  }
  if (original.length > 50) {
    throw new Error('Input terlalu panjang')
  }

  const type = detectInputType(original)
  if (type === 'unknown') {
    throw new Error('Input tidak valid')
  }

  const hira = normalizeToHiragana(original)
  const solved = ['ない', 'なかった', 'なくて', 'ないで', 'て', 'で', 'た', 'だ']
  if (hira.endsWith('ます')) {
    return {
      direction: 'to-jisho',
      inputOriginal: original,
      inputHira: hira,
      inputType: type,
      base: analyzeMasuVerb(original),
    }
  }
  if (solved.some((ending) => hira.endsWith(ending))) {
    throw new Error('Ini bukan bentuk kamus. Masukkan bentuk kamus atau bentuk ます.')
  }
  if (!KAMUS_END.test(hira)) {
    throw new Error(
      'Bentuk kamus verba harus berakhiran u-dan (う/く/ぐ/す/つ/ぬ/ぶ/む/る).',
    )
  }

  return {
    direction: 'to-masu',
    inputOriginal: original,
    inputHira: hira,
    inputType: type,
  }
}
