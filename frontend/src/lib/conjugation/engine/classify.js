import {
  isAruKamus,
  isGodanLooksIchidanKamus,
  isIkuKamus,
  isKnownIchidanKamus,
  isKuruKamus,
  isSuruKamus,
} from './exceptions.js'

const U_DAN_END = /[うくぐすつぬぶむる]$/
const I_OR_E_BEFORE_RU = /[いきぎしじちにひびぴみりえけげせぜてでねへべぺめれ]る$/
const II_IRREGULAR = new Set(['いい', 'かっこいい', 'よい'])

function posText(dictionary) {
  return (dictionary?.partsOfSpeech ?? []).join(' ')
}

function kana(text) {
  return (text ?? '').trim()
}

// The backend returns the noun for する compounds (勉強, コピー). This helper
// turns that noun back into the dictionary form the engine expects.
function suruBase(reading) {
  const value = kana(reading)
  if (!value) return { kamus: 'する', suruNoun: null }
  if (value === 'する') return { kamus: 'する', suruNoun: null }
  if (value.endsWith('する')) {
    return { kamus: value, suruNoun: value.slice(0, -2) }
  }
  return { kamus: `${value}する`, suruNoun: value }
}

export function golonganLabel(golongan) {
  if (golongan === 'godan') return 'Golongan I — Godan'
  if (golongan === 'ichidan') return 'Golongan II — Ichidan'
  if (golongan === 'irregular') return 'Golongan III — Irregular'
  return ''
}

export function classLabel(classType) {
  if (classType === 'verb') return 'Verba'
  if (classType === 'i-adjective') return 'Adjektiva-i (い)'
  if (classType === 'na-adjective') return 'Adjektiva-na (な)'
  if (classType === 'noun') return 'Kata Benda'
  return 'Kata'
}

export function shortClassLabel(classType, golongan) {
  if (classType === 'verb') {
    if (golongan === 'godan') return 'Godan'
    if (golongan === 'ichidan') return 'Ichidan'
    if (golongan === 'irregular') return 'Irregular'
    return 'Verba'
  }
  if (classType === 'i-adjective') return 'Adjektiva-i'
  if (classType === 'na-adjective') return 'Adjektiva-na'
  if (classType === 'noun') return 'Noun'
  return ''
}

// Local classification for a dictionary form. Used by the pure engine and as
// the last-resort fallback when the dictionary response has no useful POS.
export function classifyKamus(input) {
  const form = kana(input)
  if (!form) {
    throw new Error('Input kosong')
  }

  if (isKuruKamus(form)) {
    return { classType: 'verb', golongan: 'irregular', suruNoun: null, kamus: 'くる' }
  }

  if (isSuruKamus(form) || form.endsWith('する')) {
    const base = suruBase(form)
    return {
      classType: 'verb',
      golongan: 'irregular',
      suruNoun: base.suruNoun,
      kamus: base.kamus,
    }
  }

  if (isKnownIchidanKamus(form)) {
    return { classType: 'verb', golongan: 'ichidan', suruNoun: null, kamus: form }
  }

  if (isGodanLooksIchidanKamus(form)) {
    return { classType: 'verb', golongan: 'godan', suruNoun: null, kamus: form }
  }

  if (isAruKamus(form) || isIkuKamus(form)) {
    return { classType: 'verb', golongan: 'godan', suruNoun: null, kamus: form }
  }

  if (form.endsWith('る')) {
    if (I_OR_E_BEFORE_RU.test(form)) {
      return { classType: 'verb', golongan: 'ichidan', suruNoun: null, kamus: form }
    }
    return { classType: 'verb', golongan: 'godan', suruNoun: null, kamus: form }
  }

  if (U_DAN_END.test(form)) {
    return { classType: 'verb', golongan: 'godan', suruNoun: null, kamus: form }
  }

  throw new Error('Bentuk kamus verba harus berakhiran u-dan (う/く/ぐ/す/つ/ぬ/ぶ/む/る).')
}

// Classify a Jisho entry. Verb POS wins over noun POS because する compounds
// are tagged as both Noun and Suru verb.
export function classifyDictionary(dictionary, { inputHira = '' } = {}) {
  const pos = posText(dictionary)
  const reading = kana(dictionary?.reading) || kana(dictionary?.word)
  const word = kana(dictionary?.word) || reading

  if (/Kuru verb/i.test(pos)) {
    return {
      classType: 'verb',
      golongan: 'irregular',
      suruNoun: null,
      kamus: 'くる',
      reading: reading || 'くる',
      word: word || '来る',
    }
  }

  if (/Suru verb|Aux\. verb suru/i.test(pos)) {
    const base = suruBase(reading)
    return {
      classType: 'verb',
      golongan: 'irregular',
      suruNoun: base.suruNoun,
      kamus: base.kamus,
      reading: reading || 'する',
      word: word || 'する',
    }
  }

  if (/Ichidan verb/i.test(pos)) {
    return {
      classType: 'verb',
      golongan: 'ichidan',
      suruNoun: null,
      kamus: reading,
      reading,
      word,
    }
  }

  if (/Godan verb/i.test(pos)) {
    return {
      classType: 'verb',
      golongan: 'godan',
      suruNoun: null,
      kamus: reading,
      reading,
      word,
    }
  }

  if (/I-?adjective|い adjective/i.test(pos)) {
    const surface = II_IRREGULAR.has(inputHira) ? inputHira : reading
    return {
      classType: 'i-adjective',
      golongan: null,
      suruNoun: null,
      kamus: surface,
      reading,
      word,
    }
  }

  if (/Na-?adjective|Adjectival noun/i.test(pos)) {
    return {
      classType: 'na-adjective',
      golongan: null,
      suruNoun: null,
      kamus: reading,
      reading,
      word,
    }
  }

  if (/Noun|Pronoun|Counter/i.test(pos)) {
    return {
      classType: 'noun',
      golongan: null,
      suruNoun: null,
      kamus: reading,
      reading,
      word,
    }
  }

  // Jisho occasionally gives a single broad POS tag (e.g. "Adjective").
  if (/Adjective/i.test(pos)) {
    const surface = II_IRREGULAR.has(inputHira) ? inputHira : reading
    if (surface.endsWith('い') && surface !== 'きれい' && surface !== 'きらい') {
      return {
        classType: 'i-adjective',
        golongan: null,
        suruNoun: null,
        kamus: surface,
        reading,
        word,
      }
    }
    return {
      classType: 'na-adjective',
      golongan: null,
      suruNoun: null,
      kamus: reading,
      reading,
      word,
    }
  }

  // Final fallback based on shape. This keeps the engine usable when Jisho
  // returns an entry with an empty POS list.
  if (U_DAN_END.test(reading)) {
    return {
      ...classifyKamus(reading),
      reading,
      word,
    }
  }

  if (reading.endsWith('い') && reading !== 'きれい' && reading !== 'きらい') {
    return {
      classType: 'i-adjective',
      golongan: null,
      suruNoun: null,
      kamus: reading,
      reading,
      word,
    }
  }

  return {
    classType: 'noun',
    golongan: null,
    suruNoun: null,
    kamus: reading,
    reading,
    word,
  }
}
