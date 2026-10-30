import { isGodanLooksIchidan, isKnownIchidan } from './exceptions.js'
import {
  E_DAN,
  GOLONGAN_LABEL,
  GODAN_KAMUS,
  detectInputType,
  normalizeToHiragana,
  trim,
} from './verb.js'

// Godan i-dan stem endings and the a-dan kana used by the ない-form.
const GODAN_NAI = {
  い: 'わ',
  き: 'か',
  ぎ: 'が',
  し: 'さ',
  じ: 'ざ',
  ち: 'た',
  に: 'な',
  び: 'ば',
  み: 'ま',
  り: 'ら',
}

const ARU_FORMS = new Set(['あります', '有ります'])

function build({
  original,
  hira,
  type,
  golongan,
  alasan,
  stem,
  kamus,
  naiForm,
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
    naiForm,
    chain: [hira, kamus, naiForm],
    isException,
    isAmbiguous,
  }
}

function godanNai(stem) {
  const last = stem.slice(-1)
  const base = stem.slice(0, -1)
  const kamusEnd = GODAN_KAMUS[last]
  const naiEnd = GODAN_NAI[last]
  if (!kamusEnd || !naiEnd) return null
  return { kamus: base + kamusEnd, naiForm: base + naiEnd + 'ない' }
}

// Noun + する compounds (勉強します, コピーします) look like godan -su verbs.
function isSuruCompound(stem, type) {
  if (!stem.endsWith('し')) return false
  const noun = stem.slice(0, -1)
  if (noun.length < 2) return false
  if (type === 'katakana' || type === 'mixed') return true
  return /^[一-龯々]+$/.test(noun)
}

// The なかった / なくて / ないで forms all share the same stem.
export function naiVariants(naiForm) {
  const base = naiForm.endsWith('ない') ? naiForm.slice(0, -2) : naiForm
  return {
    nakatta: `${base}なかった`,
    nakute: `${base}なくて`,
    naide: `${base}ないで`,
  }
}

export function analyzeMasuToNai(input) {
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
      throw new Error('Ini sudah bentuk ない. Analisis dari bentuk ます.')
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

  // Irregular: する (only when the stem is exactly "し").
  if (stem === 'し') {
    return build({
      ...base,
      golongan: 'irregular',
      alasan: 'する adalah verba irregular, bentuk ない-nya しない. Wajib hafal.',
      kamus: 'する',
      naiForm: 'しない',
    })
  }

  // Noun + する compound: 勉強します → 勉強しない.
  if (isSuruCompound(stem, type)) {
    const noun = stem.slice(0, -1)
    return build({
      ...base,
      golongan: 'irregular',
      alasan: `${noun} adalah kata benda yang dirangkai dengan する. Karena する menjadi しない, bentuknya ${noun}しない.`,
      kamus: `${noun}する`,
      naiForm: `${noun}しない`,
    })
  }

  // Irregular: 来る. Kana input "きます" is also 着ます, so flag it.
  if (hira === '来ます' || hira === 'きます') {
    const kanaInput = hira === 'きます'
    return build({
      ...base,
      golongan: 'irregular',
      alasan: '来る adalah verba irregular, bentuk ない-nya 来ない (こない). Wajib hafal.',
      kamus: kanaInput ? 'くる' : '来る',
      naiForm: kanaInput ? 'こない' : '来ない',
      isAmbiguous: kanaInput,
    })
  }

  // ある is the one verb whose negative is a completely different word.
  if (ARU_FORMS.has(hira)) {
    return build({
      ...base,
      golongan: 'godan',
      alasan: 'あります adalah pengecualian: bentuk ない-nya langsung ない, bukan あらない.',
      kamus: 'ある',
      naiForm: 'ない',
      isException: true,
    })
  }

  // Godan verbs that look Ichidan (e.g. 帰ります) must stay Godan.
  if (isGodanLooksIchidan(hira)) {
    const forms = godanNai(stem)
    return build({
      ...base,
      golongan: 'godan',
      alasan: 'Verba ini berakhiran seperti Ichidan, tapi sebenarnya Godan. Wajib hafal pola pengecualian ini.',
      kamus: forms.kamus,
      naiForm: forms.naiForm,
      isException: true,
    })
  }

  // Ichidan: e-dan stem, or a known i-dan Ichidan verb.
  if (E_DAN.has(last) || isKnownIchidan(hira)) {
    const reason = E_DAN.has(last)
      ? `Stem ます berakhiran "-${last}" (e-dan), ciri khas Ichidan. Buang ます → tambah ない.`
      : `Stem ます berakhiran "-${last}", tapi verba ini termasuk daftar Ichidan. Buang ます → tambah ない.`
    return build({
      ...base,
      golongan: 'ichidan',
      alasan: reason,
      kamus: `${stem}る`,
      naiForm: `${stem}ない`,
    })
  }

  // Default: Godan. The last stem kana moves from i-dan to a-dan.
  const forms = godanNai(stem)
  if (!forms) {
    throw new Error('Pola kata ini belum dikenali. Coba masukkan bentuk kanji atau kana lengkap.')
  }

  return build({
    ...base,
    golongan: 'godan',
    alasan: `Stem ます berakhiran "-${last}" (i-dan). Untuk bentuk ない, ubah "-${last}" menjadi "-${GODAN_NAI[last]}" lalu tambah ない.`,
    kamus: forms.kamus,
    naiForm: forms.naiForm,
  })
}
