import { isGodanLooksIchidan, isKnownIchidan, isSpecialIku } from './exceptions.js'
import {
  E_DAN,
  GODAN_KAMUS,
  GOLONGAN_LABEL,
  detectInputType,
  normalizeToHiragana,
  trim,
} from './verb.js'

const GODAN_TE = {
  い: 'って',
  き: 'いて',
  ぎ: 'いで',
  し: 'して',
  じ: 'って',
  ち: 'って',
  に: 'んで',
  び: 'んで',
  み: 'んで',
  り: 'って',
}

function build({ original, hira, type, golongan, alasan, stem, kamus, teForm, isException = false, isAmbiguous = false }) {
  return {
    inputOriginal: original,
    inputHira: hira,
    inputType: type,
    golongan,
    golonganLabel: GOLONGAN_LABEL[golongan],
    alasan,
    stem,
    kamus,
    teForm,
    chain: [hira, kamus, teForm],
    isException,
    isAmbiguous,
  }
}

function godanForms(stem) {
  const last = stem.slice(-1)
  const base = stem.slice(0, -1)
  const kamusEnd = GODAN_KAMUS[last]
  const teEnd = GODAN_TE[last]
  if (!kamusEnd || !teEnd) return null
  return { kamus: base + kamusEnd, teForm: base + teEnd }
}

// Noun + する compounds (勉強します, コピーします) look like godan -su verbs.
// Katakana input is already folded to hiragana, so use the original type.
function isSuruCompound(stem, type) {
  if (!stem.endsWith('し')) return false
  const noun = stem.slice(0, -1)
  if (noun.length < 2) return false
  if (type === 'katakana' || type === 'mixed') return true
  return /^[一-龯々]+$/.test(noun)
}

export function analyzeMasuToTe(input) {
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
    if (hira.endsWith('て') || hira.endsWith('で')) {
      throw new Error('Ini sudah bentuk て. Analisis dari bentuk ます.')
    }
    if (hira.endsWith('た') || hira.endsWith('だ')) {
      throw new Error('Ini bentuk た/だ. Gunakan bentuk ます.')
    }
    if (hira.endsWith('ない')) {
      throw new Error('Ini bentuk ない. Gunakan bentuk ます.')
    }
    throw new Error('Mohon input bentuk ます (〜ます)')
  }

  const stem = hira.slice(0, -2)
  const last = stem.slice(-1)
  const base = { original, hira, type, stem }

  // Irregular: する (only when the stem is exactly "し")
  if (stem === 'し') {
    return build({
      ...base,
      golongan: 'irregular',
      alasan: 'する adalah verba irregular, perubahannya tidak mengikuti pola apapun. Wajib hafal.',
      kamus: 'する',
      teForm: 'して',
    })
  }

  // Noun + する compound: 勉強します → 勉強して, コピーします → コピーして.
  if (isSuruCompound(stem, type)) {
    const noun = stem.slice(0, -1)
    return build({
      ...base,
      golongan: 'irregular',
      alasan: `${noun} adalah kata benda yang dirangkai dengan する. する termasuk verba irregular, jadi bentuk て-nya ${noun}して.`,
      kamus: noun + 'する',
      teForm: noun + 'して',
    })
  }

  // Irregular: 来る. Kana input "きます" is also 着ます, so flag it as ambiguous.
  if (hira === '来ます' || hira === 'きます') {
    const kanaInput = hira === 'きます'
    return build({
      ...base,
      golongan: 'irregular',
      alasan: '来る adalah verba irregular, perubahannya tidak mengikuti pola apapun. Wajib hafal.',
      kamus: kanaInput ? 'くる' : '来る',
      teForm: kanaInput ? 'きて' : '来て',
      isAmbiguous: kanaInput,
    })
  }

  // 行く is a Godan verb, but -ki becomes -tte instead of -ite.
  if (isSpecialIku(hira)) {
    return build({
      ...base,
      golongan: 'godan',
      alasan: 'Meski akhiran -ki biasanya jadi -ite, khusus 行く jadi -tte. Wajib hafal!',
      kamus: stem.slice(0, -1) + 'く',
      teForm: stem.slice(0, -1) + 'って',
      isException: true,
    })
  }

  // Godan verbs that look Ichidan (e.g. 帰ります) must stay Godan.
  if (isGodanLooksIchidan(hira)) {
    const forms = godanForms(stem)
    return build({
      ...base,
      golongan: 'godan',
      alasan: 'Verba ini berakhiran seperti Ichidan, tapi sebenarnya Godan. Wajib hafal pola pengecualian ini.',
      kamus: forms.kamus,
      teForm: forms.teForm,
      isException: true,
    })
  }

  // Ichidan: e-dan stem, or a known i-dan Ichidan verb.
  if (E_DAN.has(last) || isKnownIchidan(hira)) {
    const reason = E_DAN.has(last)
      ? `Stem ます berakhiran "-${last}" (e-dan), ciri khas Ichidan. Buang ます → tambah る untuk bentuk kamus, tambah て untuk bentuk て.`
      : `Stem ます berakhiran "-${last}", tapi verba ini termasuk daftar Ichidan. Buang ます → tambah る / て.`
    return build({
      ...base,
      golongan: 'ichidan',
      alasan: reason,
      kamus: stem + 'る',
      teForm: stem + 'て',
    })
  }

  // Default: Godan.
  const forms = godanForms(stem)
  if (!forms) {
    throw new Error('Pola kata ini belum dikenali. Coba masukkan bentuk kanji atau kana lengkap.')
  }

  let alasan = `Stem ます berakhiran "-${last}", akhiran vokal "i" khas Godan.`
  if (['み', 'び', 'に'].includes(last)) {
    alasan += ' Termasuk kelompok hatsuonbin (-mi/-bi/-ni → -nde).'
  }

  return build({
    ...base,
    golongan: 'godan',
    alasan,
    kamus: forms.kamus,
    teForm: forms.teForm,
  })
}
