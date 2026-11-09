import { analyzeMasuVerb } from '../masuBase.js'
import { detectForm } from './detectForm.js'

const A_TO_U = {
  わ: 'う',
  か: 'く',
  が: 'ぐ',
  さ: 'す',
  た: 'つ',
  な: 'ぬ',
  ば: 'ぶ',
  ま: 'む',
  ら: 'る',
}

const I_OR_E_DAN = new Set([
  'い',
  'き',
  'ぎ',
  'し',
  'じ',
  'ち',
  'に',
  'ひ',
  'び',
  'ぴ',
  'み',
  'り',
  'え',
  'け',
  'げ',
  'せ',
  'ぜ',
  'て',
  'で',
  'ね',
  'へ',
  'べ',
  'ぺ',
  'め',
  'れ',
])

// Known ambiguous kana readings. These three are required by the Phase 1 spec:
// かえる, きる, いる. The order is the default tab order.
export const AMBIGUOUS_KANA = {
  かえる: [
    { word: '帰る', golongan: 'godan', class: 'verb' },
    { word: '変える', golongan: 'ichidan', class: 'verb' },
    { word: '蛙', golongan: null, class: 'noun' },
  ],
  きる: [
    { word: '切る', golongan: 'godan', class: 'verb' },
    { word: '着る', golongan: 'ichidan', class: 'verb' },
    { word: '斬る', golongan: 'godan', class: 'verb' },
  ],
  いる: [
    { word: '居る', golongan: 'ichidan', class: 'verb' },
    { word: '要る', golongan: 'godan', class: 'verb' },
    { word: '射る', golongan: 'ichidan', class: 'verb' },
  ],
}

// Handy common readings for reverse-ambiguous te/ta forms. They only affect
// candidate ordering; Jisho still validates every candidate.
const COMMON_TE = {
  かえって: ['かえる'],
  まって: ['まつ'],
  かって: ['かう'],
  いって: ['いく', 'いう'],
  のんで: ['のむ'],
  よんで: ['よむ'],
  あそんで: ['あそぶ'],
  かいて: ['かく'],
  いそいで: ['いそぐ'],
  はなして: ['はなす'],
  たべて: ['たべる'],
  みて: ['みる'],
  きて: ['くる', 'きる'],
  して: ['する'],
  あって: ['ある'],
  とって: ['とる'],
  はいって: ['はいる'],
  はしって: ['はしる'],
  しって: ['しる'],
  きって: ['きる'],
}

const COMMON_TA = {
  かえった: ['かえる'],
  まった: ['まつ'],
  かった: ['かつ', 'かう'],
  いった: ['いく', 'いう'],
  のんだ: ['のむ'],
  よんだ: ['よむ'],
  あそんだ: ['あそぶ'],
  かいた: ['かく'],
  いそいだ: ['いそぐ'],
  はなした: ['はなす'],
  たべた: ['たべる'],
  みた: ['みる'],
  きた: ['くる', 'きる'],
  した: ['する'],
  あった: ['ある'],
  とった: ['とる'],
  はいった: ['はいる'],
  はしった: ['はしる'],
  しった: ['しる'],
  きった: ['きる'],
}

const KANJI_OR_KATAKANA = /[\u3400-\u4dbf\u4e00-\u9fff\u30a0-\u30ff]/
const U_DAN_NOUN_END = /[うくぐすつぬぶむる]$/

// A する compound needs a noun before する. This keeps はなして from becoming
// the bogus candidate はなする while still allowing べんきょうする, コピーする,
// and 運動する.
function looksLikeSuruNoun(base) {
  if (!base || base.length < 2) return false
  return KANJI_OR_KATAKANA.test(base) || U_DAN_NOUN_END.test(base)
}

function addCandidate(list, candidate) {
  const existing = list.find((item) => item.kamus === candidate.kamus)
  if (existing) {
    // たべる / みる arrive both from the common-reading table (Godan default)
    // and from the Ichidan rule. くる / する arrive from the common table and
    // the irregular rule. Keep the more specific classification.
    if (candidate.golongan === 'irregular' && existing.golongan !== 'irregular') {
      existing.golongan = 'irregular'
    } else if (existing.golongan === 'godan' && candidate.golongan === 'ichidan') {
      existing.golongan = 'ichidan'
    }
    return
  }
  list.push(candidate)
}

function reverseDictionary(value) {
  const ambiguous = AMBIGUOUS_KANA[value]
  if (ambiguous) {
    return ambiguous.map((item) => ({
      kamus: value,
      word: item.word,
      golongan: item.golongan,
      class: item.class,
      ambiguous: true,
    }))
  }
  return [{ kamus: value }]
}

function reconstructMasu(value) {
  if (value.endsWith('ませんでした')) return value.slice(0, -6) + 'ます'
  if (value.endsWith('ません')) return value.slice(0, -3) + 'ます'
  if (value.endsWith('ました')) return value.slice(0, -3) + 'ます'
  if (value.endsWith('ます')) return value
  return null
}

function reverseMasu(value) {
  const masu = reconstructMasu(value)
  if (!masu) throw new Error('Bentuk ます tidak dikenali')
  const base = analyzeMasuVerb(masu)
  return [
    {
      kamus: base.kamus,
      golongan: base.golongan,
      suruNoun: base.suruNoun,
      isException: base.isException,
      note: base.alasan,
      source: 'masu',
    },
  ]
}

function addCommon(list, map, value, golongan = 'godan') {
  for (const kamus of map[value] ?? []) {
    addCandidate(list, { kamus, golongan })
  }
}

function addIchidanCandidate(list, stem, golongan = 'ichidan') {
  if (stem && I_OR_E_DAN.has(stem.slice(-1))) {
    addCandidate(list, { kamus: `${stem}る`, golongan })
  }
}

function addGodanBaseCandidates(list, base, tail) {
  if (tail === 'って' || tail === 'った') {
    addCandidate(list, { kamus: `${base}う`, golongan: 'godan' })
    addCandidate(list, { kamus: `${base}つ`, golongan: 'godan' })
    addCandidate(list, { kamus: `${base}る`, golongan: 'godan' })
    if (base === 'い' || base === '行') {
      addCandidate(list, { kamus: base === '行' ? '行く' : 'いく', golongan: 'godan' })
    }
  } else if (tail === 'んで' || tail === 'んだ') {
    addCandidate(list, { kamus: `${base}ぬ`, golongan: 'godan' })
    addCandidate(list, { kamus: `${base}ぶ`, golongan: 'godan' })
    addCandidate(list, { kamus: `${base}む`, golongan: 'godan' })
  } else if (tail === 'いて' || tail === 'いた') {
    addCandidate(list, { kamus: `${base}く`, golongan: 'godan' })
  } else if (tail === 'いで' || tail === 'いだ') {
    addCandidate(list, { kamus: `${base}ぐ`, golongan: 'godan' })
  } else if (tail === 'して' || tail === 'した') {
    addCandidate(list, { kamus: `${base}す`, golongan: 'godan' })
  }
}

function reverseTeTa(value, ta) {
  const list = []
  const suffix = ta ? (value.endsWith('だ') ? 'だ' : 'た') : value.endsWith('で') ? 'で' : 'て'
  const stem = value.slice(0, -1)
  const tail = value.slice(-2)

  addCommon(list, ta ? COMMON_TA : COMMON_TE, value)

  // Irregular verbs first so the common reading becomes the default tab.
  if (value === 'して' || value === 'した') {
    addCandidate(list, { kamus: 'する', golongan: 'irregular' })
  }
  if (value === 'きて' || value === 'きた') {
    addCandidate(list, { kamus: 'くる', golongan: 'irregular' })
    addCandidate(list, { kamus: '来る', golongan: 'irregular' })
  }
  if (value.endsWith('来て') || value.endsWith('来た')) {
    addCandidate(list, { kamus: '来る', golongan: 'irregular' })
  }
  if (value === 'いって' || value === 'いった') {
    addCandidate(list, { kamus: 'いく', golongan: 'godan' })
  }
  if (value.endsWith('行って') || value.endsWith('行った')) {
    addCandidate(list, { kamus: '行く', golongan: 'godan' })
  }
  if (value === 'あって' || value === 'あった') {
    addCandidate(list, { kamus: 'ある', golongan: 'godan' })
  }

  // Compound する: べんきょうして → べんきょうする.
  if (value.endsWith('して') || value.endsWith('した')) {
    const noun = value.slice(0, -2)
    if (looksLikeSuruNoun(noun)) {
      addCandidate(list, { kamus: `${noun}する`, golongan: 'irregular' })
    }
  }

  // Compound くる: やってきて → やってくる.
  if ((value.endsWith('きて') || value.endsWith('きた')) && value.length > 2) {
    const compound = value.slice(0, -2) + 'くる'
    if (compound.length > 2) {
      addCandidate(list, { kamus: compound, golongan: 'irregular' })
    }
  }

  addIchidanCandidate(list, stem)
  addGodanBaseCandidates(list, value.slice(0, -2), tail)

  // The suffix variable is intentionally kept for readability of the rules
  // above; it also documents which ending produced this candidate set.
  void suffix
  return list
}

function reverseNai(value) {
  const list = []
  const suffix = value.endsWith('なかった') ? 'なかった' : 'ない'
  const stem = value.slice(0, -suffix.length)

  if (value === 'ない' || value === 'なかった') {
    addCandidate(list, { kamus: 'ある', golongan: 'godan' })
  }
  if (value === 'しない' || value === 'しなかった') {
    addCandidate(list, { kamus: 'する', golongan: 'irregular' })
  }
  if (value === 'こない' || value === 'こなかった') {
    addCandidate(list, { kamus: 'くる', golongan: 'irregular' })
    addCandidate(list, { kamus: '来る', golongan: 'irregular' })
  }
  if (value.endsWith('来ない') || value.endsWith('来なかった')) {
    addCandidate(list, { kamus: '来る', golongan: 'irregular' })
  }
  if (stem.endsWith('し')) {
    const noun = stem.slice(0, -1)
    if (looksLikeSuruNoun(noun)) {
      addCandidate(list, { kamus: `${noun}する`, golongan: 'irregular' })
    }
  }
  if (stem.endsWith('こ') && stem.length > 1) {
    addCandidate(list, { kamus: `${stem.slice(0, -1)}くる`, golongan: 'irregular' })
  }

  addIchidanCandidate(list, stem)

  const last = stem.slice(-1)
  const kamusEnd = A_TO_U[last]
  if (kamusEnd) {
    addCandidate(list, { kamus: stem.slice(0, -1) + kamusEnd, golongan: 'godan' })
  }

  return list
}

export function reverseToKamus(input) {
  const value = (input ?? '').trim()
  if (!value) {
    throw new Error('Input kosong')
  }

  const detected = detectForm(value)
  let kandidat = []

  if (detected.form === 'masu') {
    kandidat = reverseMasu(value)
  } else if (detected.form === 'te') {
    kandidat = reverseTeTa(value, false)
  } else if (detected.form === 'ta') {
    kandidat = reverseTeTa(value, true)
  } else if (detected.form === 'nai') {
    kandidat = reverseNai(value)
  } else {
    kandidat = reverseDictionary(value)
  }

  if (!kandidat.length) {
    throw new Error('Bentuk input tidak dikenali')
  }

  return {
    form: detected.form,
    kamus: kandidat[0].kamus,
    kandidat,
  }
}
