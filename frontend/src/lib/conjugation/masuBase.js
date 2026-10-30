import { isGodanLooksIchidan, isKnownIchidan } from './exceptions.js'
import {
  E_DAN,
  GOLONGAN_LABEL,
  GODAN_KAMUS,
  detectInputType,
  normalizeToHiragana,
  trim,
} from './verb.js'

// Shared base analyzer for every masu-based module except ます→て / ます→ない,
// which keep their own mature analyzers.
const ARU_FORMS = new Set(['あります', '有ります'])

function build({
  original,
  hira,
  type,
  golongan,
  alasan,
  stem,
  kamus,
  suruNoun = null,
  isException = false,
  isAmbiguous = false,
}) {
  return {
    inputOriginal: original,
    inputHira: hira,
    inputType: type,
    golongan,
    golonganLabel: GOLONGAN_LABEL[golongan],
    alasan,
    stem,
    kamus,
    suruNoun,
    isException,
    isAmbiguous,
  }
}

function isSuruCompound(stem, type) {
  if (!stem.endsWith('し')) return false
  const noun = stem.slice(0, -1)
  if (noun.length < 2) return false
  if (type === 'katakana' || type === 'mixed') return true
  return /^[一-龯々]+$/.test(noun)
}

export function analyzeMasuVerb(input) {
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
  if (!hira.endsWith('ます')) {
    if (hira.endsWith('る')) {
      throw new Error('Ini bentuk kamus. Gunakan bentuk ます.')
    }
    if (hira.endsWith('ない')) {
      throw new Error('Ini bentuk ない. Analisis dari bentuk ます.')
    }
    if (hira.endsWith('て') || hira.endsWith('で')) {
      throw new Error('Ini bentuk て. Analisis dari bentuk ます.')
    }
    if (hira.endsWith('た') || hira.endsWith('だ')) {
      throw new Error('Ini bentuk た/だ. Gunakan bentuk ます.')
    }
    throw new Error('Mohon input bentuk ます (〜ます)')
  }

  const stem = hira.slice(0, -2)
  const last = stem.slice(-1)
  const base = { original, hira, type, stem }

  if (stem === 'し') {
    return build({
      ...base,
      golongan: 'irregular',
      alasan: 'する adalah verba irregular. Perubahannya wajib dihafal.',
      kamus: 'する',
      suruNoun: '',
    })
  }

  if (isSuruCompound(stem, type)) {
    const noun = stem.slice(0, -1)
    return build({
      ...base,
      golongan: 'irregular',
      alasan: `${noun} adalah kata benda yang dirangkai dengan する. Semua bentuk mengikuti する.`,
      kamus: `${noun}する`,
      suruNoun: noun,
    })
  }

  if (hira === '来ます' || hira === 'きます') {
    const kanaInput = hira === 'きます'
    return build({
      ...base,
      golongan: 'irregular',
      alasan: '来る adalah verba irregular. Perubahannya wajib dihafal.',
      kamus: kanaInput ? 'くる' : '来る',
      isAmbiguous: kanaInput,
    })
  }

  if (ARU_FORMS.has(hira)) {
    return build({
      ...base,
      golongan: 'godan',
      alasan: 'あります adalah pengecualian: banyak bentuknya memakai akar あり-, bukan あr-.',
      kamus: 'ある',
      isException: true,
    })
  }

  if (isGodanLooksIchidan(hira)) {
    return build({
      ...base,
      golongan: 'godan',
      alasan:
        'Verba ini berakhiran seperti Ichidan, tetapi sebenarnya Godan. Wajib hafal pola pengecualian ini.',
      kamus: stem.slice(0, -1) + GODAN_KAMUS[last],
      isException: true,
    })
  }

  if (E_DAN.has(last) || isKnownIchidan(hira)) {
    const reason = E_DAN.has(last)
      ? `Stem ます berakhiran "-${last}" (e-dan), ciri khas Ichidan. Buang ます lalu tambahkan akhiran bentuk.`
      : `Stem ます berakhiran "-${last}", tetapi verba ini termasuk daftar Ichidan.`
    return build({
      ...base,
      golongan: 'ichidan',
      alasan: reason,
      kamus: `${stem}る`,
    })
  }

  const kamusEnd = GODAN_KAMUS[last]
  if (!kamusEnd) {
    throw new Error('Pola kata ini belum dikenali. Coba masukkan bentuk kanji atau kana lengkap.')
  }

  return build({
    ...base,
    golongan: 'godan',
    alasan: `Stem ます berakhiran "-${last}" (i-dan), ciri khas Godan. Akhiran berubah mengikuti baris a/e/o.`,
    kamus: stem.slice(0, -1) + kamusEnd,
  })
}
