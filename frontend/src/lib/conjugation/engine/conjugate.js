import { SPECIAL_KEIGO_KANA } from '../keigo.js'
import { classifyKamus } from './classify.js'
import { romaji } from './romaji.js'

const GODAN_A = {
  う: 'わ',
  く: 'か',
  ぐ: 'が',
  す: 'さ',
  つ: 'た',
  ぬ: 'な',
  ぶ: 'ば',
  む: 'ま',
  る: 'ら',
}

const GODAN_I = {
  う: 'い',
  く: 'き',
  ぐ: 'ぎ',
  す: 'し',
  つ: 'ち',
  ぬ: 'に',
  ぶ: 'び',
  む: 'み',
  る: 'り',
}

const GODAN_E = {
  う: 'え',
  く: 'け',
  ぐ: 'げ',
  す: 'せ',
  つ: 'て',
  ぬ: 'ね',
  ぶ: 'べ',
  む: 'め',
  る: 'れ',
}

const GODAN_O = {
  う: 'お',
  く: 'こ',
  ぐ: 'ご',
  す: 'そ',
  つ: 'と',
  ぬ: 'の',
  ぶ: 'ぼ',
  む: 'も',
  る: 'ろ',
}

const GODAN_TA = {
  う: 'った',
  く: 'いた',
  ぐ: 'いだ',
  す: 'した',
  つ: 'った',
  ぬ: 'んだ',
  ぶ: 'んだ',
  む: 'んだ',
  る: 'った',
}

const GODAN_TE = {
  う: 'って',
  く: 'いて',
  ぐ: 'いで',
  す: 'して',
  つ: 'って',
  ぬ: 'んで',
  ぶ: 'んで',
  む: 'んで',
  る: 'って',
}

const II_IRREGULAR = new Set(['いい', 'かっこいい', 'よい'])

function isAru(kamus) {
  return kamus === 'ある' || kamus === '有る'
}

function isIku(kamus) {
  return kamus === 'いく' || kamus === '行く'
}

export function iStem(surface) {
  if (II_IRREGULAR.has(surface)) {
    if (surface === 'いい' || surface === 'よい') return 'よ'
    return `${surface.slice(0, -2)}よ`
  }
  return surface.slice(0, -1)
}

function commonTail(forms, stem, kamus) {
  return {
    ...forms,
    kamus,
    masuStem: stem,
    naiStem: stem,
    nai: `${stem}ない`,
    nakatta: `${stem}なかった`,
    nakute: `${stem}なくて`,
    naide: `${stem}ないで`,
    tai: `${stem}たい`,
    takunai: `${stem}たくない`,
    takatta: `${stem}たかった`,
    takunakatta: `${stem}たくなかった`,
  }
}

function godanForms(kamus) {
  const pre = kamus.slice(0, -1)
  const last = kamus.slice(-1)
  const a = pre + GODAN_A[last]
  const i = pre + GODAN_I[last]
  const e = pre + GODAN_E[last]
  const o = pre + GODAN_O[last]
  const iku = isIku(kamus)
  const ta = iku ? `${pre}った` : pre + GODAN_TA[last]
  const te = iku ? `${pre}って` : pre + GODAN_TE[last]

  const forms = {
    kamus,
    masuStem: i,
    naiStem: a,
    nai: `${a}ない`,
    nakatta: `${a}なかった`,
    nakute: `${a}なくて`,
    naide: `${a}ないで`,
    tai: `${i}たい`,
    takunai: `${i}たくない`,
    takatta: `${i}たかった`,
    takunakatta: `${i}たくなかった`,
    masu: `${i}ます`,
    masen: `${i}ません`,
    mashita: `${i}ました`,
    masendeshita: `${i}ませんでした`,
    te,
    ta,
    ba: `${e}ば`,
    tara: `${ta}ら`,
    nara: `${kamus}なら`,
    potential: `${e}る`,
    passive: `${a}れる`,
    causative: `${a}せる`,
    causativePassive: `${a}せられる`,
    volitional: `${o}う`,
    imperative: e,
    sonkeigo: `お${i}になる`,
    kenjougo: `お${i}する`,
  }

  if (isAru(kamus)) {
    return {
      ...forms,
      nai: 'ない',
      nakatta: 'なかった',
      nakute: 'なくて',
      naide: 'ないで',
      naiStem: '',
      te: 'あって',
      ta: 'あった',
      tara: 'あったら',
      ba: 'あれば',
      potential: 'ありうる',
      passive: 'あられる',
      causative: 'あらせる',
      causativePassive: 'あらせられる',
      volitional: 'あろう',
      imperative: 'あれ',
      sonkeigo: 'ございます',
      kenjougo: 'ございます',
    }
  }

  return forms
}

function ichidanForms(kamus) {
  const stem = kamus.slice(0, -1)
  const forms = {
    ...commonTail({}, stem, kamus),
    masu: `${stem}ます`,
    masen: `${stem}ません`,
    mashita: `${stem}ました`,
    masendeshita: `${stem}ませんでした`,
    te: `${stem}て`,
    ta: `${stem}た`,
    ba: `${stem}れば`,
    tara: `${stem}たら`,
    nara: `${kamus}なら`,
    potential: `${stem}られる`,
    passive: `${stem}られる`,
    causative: `${stem}させる`,
    causativePassive: `${stem}させられる`,
    volitional: `${stem}よう`,
    imperative: `${stem}ろ`,
    sonkeigo: `お${stem}になる`,
    kenjougo: `お${stem}する`,
  }
  return forms
}

function suruForms(suruNoun) {
  const prefix = suruNoun ?? ''
  const stem = `${prefix}し`
  const forms = {
    ...commonTail({}, stem, `${prefix}する`),
    masu: `${stem}ます`,
    masen: `${stem}ません`,
    mashita: `${stem}ました`,
    masendeshita: `${stem}ませんでした`,
    te: `${stem}て`,
    ta: `${stem}た`,
    ba: `${prefix}すれば`,
    tara: `${prefix}したら`,
    nara: `${prefix}するなら`,
    potential: `${prefix}できる`,
    passive: `${prefix}される`,
    causative: `${prefix}させる`,
    causativePassive: `${prefix}させられる`,
    volitional: `${prefix}しよう`,
    imperative: `${prefix}しろ`,
    sonkeigo: prefix ? `ご${prefix}になる` : 'なさる',
    kenjougo: prefix ? `ご${prefix}する` : 'いたす',
  }
  return forms
}

function kuruForms() {
  return {
    kamus: 'くる',
    masu: 'きます',
    masen: 'きません',
    mashita: 'きました',
    masendeshita: 'きませんでした',
    masuStem: 'き',
    naiStem: 'こ',
    nai: 'こない',
    nakatta: 'こなかった',
    nakute: 'こなくて',
    naide: 'こないで',
    te: 'きて',
    ta: 'きた',
    ba: 'くれば',
    tara: 'きたら',
    nara: 'くるなら',
    potential: 'こられる',
    passive: 'こられる',
    causative: 'こさせる',
    causativePassive: 'こさせられる',
    volitional: 'こよう',
    imperative: 'こい',
    tai: 'きたい',
    takunai: 'きたくない',
    takatta: 'きたかった',
    takunakatta: 'きたくなかった',
    sonkeigo: 'いらっしゃる',
    kenjougo: 'まいる',
  }
}

// Build every verb form the Phase 1 rows need. Input must be a kana
// dictionary form so callers can use the output without a furigana step.
export function buildVerbForms(kamus, golonganOrOptions, suruNounArg) {
  const options =
    typeof golonganOrOptions === 'object' && golonganOrOptions !== null
      ? golonganOrOptions
      : { golongan: golonganOrOptions, suruNoun: suruNounArg }

  let golongan = options.golongan
  const suruNoun = options.suruNoun ?? null
  if (!golongan) {
    golongan = classifyKamus(kamus).golongan
  }

  let forms
  if (golongan === 'irregular') {
    if (suruNoun !== null || kamus.endsWith('する') || kamus === 'する') {
      const noun = suruNoun ?? (kamus === 'する' ? null : kamus.slice(0, -2))
      forms = suruForms(noun)
    } else {
      forms = kuruForms()
    }
  } else if (golongan === 'ichidan') {
    forms = ichidanForms(kamus)
  } else {
    forms = godanForms(kamus)
  }

  const special = SPECIAL_KEIGO_KANA[kamus]
  if (special) {
    forms.sonkeigo = special[0]
    forms.kenjougo = special[1]
  }
  return forms
}

export function buildIAdjectiveForms(surface) {
  const stem = iStem(surface)
  const neg = `${stem}くない`
  const past = `${stem}かった`
  const pastNeg = `${stem}くなかった`
  return {
    kamus: surface,
    plain: surface,
    neg,
    past,
    pastNeg,
    te: `${stem}くて`,
    teNeg: `${stem}くなくて`,
    adverb: `${stem}く`,
    ba: `${stem}ければ`,
    sou: `${stem}${II_IRREGULAR.has(surface) ? 'さ' : ''}そう`,
    sugiru: `${stem}すぎる`,
    naru: `${stem}くなる`,
    suru: `${stem}くする`,
    politePositive: `${surface}です`,
    politeNegative: `${neg}です`,
    politePast: `${past}です`,
    politePastNeg: `${pastNeg}です`,
  }
}

export function buildNaAdjectiveForms(surface) {
  return {
    kamus: surface,
    plain: `${surface}だ`,
    neg: `${surface}じゃない`,
    past: `${surface}だった`,
    pastNeg: `${surface}じゃなかった`,
    te: `${surface}で`,
    teNeg: `${surface}じゃなくて`,
    adverb: `${surface}に`,
    attributive: `${surface}な`,
    ba: `${surface}なら`,
    sou: `${surface}そう`,
    sugiru: `${surface}すぎる`,
    naru: `${surface}になる`,
    politePositive: `${surface}です`,
    politeNegative: `${surface}じゃないです`,
    politePast: `${surface}でした`,
    politePastNeg: `${surface}じゃなかったです`,
  }
}

export function buildNounForms(surface) {
  return {
    kamus: surface,
    plain: `${surface}だ`,
    neg: `${surface}じゃない`,
    past: `${surface}だった`,
    pastNeg: `${surface}じゃなかった`,
    te: `${surface}で`,
    teNeg: `${surface}じゃなくて`,
    ba: `${surface}なら`,
    naru: `${surface}になる`,
    politePositive: `${surface}です`,
    politeNegative: `${surface}じゃないです`,
    politePast: `${surface}でした`,
    politePastNeg: `${surface}じゃなかったです`,
  }
}

export function buildForms(analysis) {
  if (analysis.classType === 'verb') {
    return buildVerbForms(analysis.kamus, {
      golongan: analysis.golongan,
      suruNoun: analysis.suruNoun,
    })
  }
  if (analysis.classType === 'i-adjective') {
    return buildIAdjectiveForms(analysis.kamus)
  }
  if (analysis.classType === 'na-adjective') {
    return buildNaAdjectiveForms(analysis.kamus)
  }
  return buildNounForms(analysis.kamus)
}

function primaryRow(id, category, name, jp) {
  return { id, category, name, jp, romaji: romaji(jp) }
}

export function buildPrimaryRows(analysis) {
  const forms = analysis.forms ?? buildForms(analysis)

  if (analysis.classType === 'verb') {
    return [
      primaryRow('polite_present', 'Sopan', 'Positif non-lampau', forms.masu),
      primaryRow('polite_negative', 'Sopan', 'Negatif non-lampau', forms.masen),
      primaryRow('polite_past', 'Sopan', 'Positif lampau', forms.mashita),
      primaryRow('polite_past_negative', 'Sopan', 'Negatif lampau', forms.masendeshita),
      primaryRow('plain_present', 'Biasa', 'Positif non-lampau', forms.kamus),
      primaryRow('plain_negative', 'Biasa', 'Negatif non-lampau', forms.nai),
      primaryRow('plain_past', 'Biasa', 'Positif lampau', forms.ta),
      primaryRow('plain_past_negative', 'Biasa', 'Negatif lampau', forms.nakatta),
    ]
  }

  const plainPositive =
    analysis.classType === 'i-adjective' ? forms.kamus : forms.plain

  return [
    primaryRow('polite_present', 'Sopan', 'Positif non-lampau', forms.politePositive),
    primaryRow('polite_negative', 'Sopan', 'Negatif non-lampau', forms.politeNegative),
    primaryRow('polite_past', 'Sopan', 'Positif lampau', forms.politePast),
    primaryRow('polite_past_negative', 'Sopan', 'Negatif lampau', forms.politePastNeg),
    primaryRow('plain_present', 'Biasa', 'Positif non-lampau', plainPositive),
    primaryRow('plain_negative', 'Biasa', 'Negatif non-lampau', forms.neg),
    primaryRow('plain_past', 'Biasa', 'Positif lampau', forms.past),
    primaryRow('plain_past_negative', 'Biasa', 'Negatif lampau', forms.pastNeg),
  ]
}

const TARGET_ALIASES = {
  kamus: 'kamus',
  dictionary: 'kamus',
  dictionary_form: 'kamus',
  jisho: 'kamus',
  jisho_form: 'kamus',
  masu: 'masu',
  masu_form: 'masu',
  masen: 'masen',
  masu_negative: 'masen',
  mashita: 'mashita',
  masu_past: 'mashita',
  masendeshita: 'masendeshita',
  masu_past_negative: 'masendeshita',
  masu_stem: 'masuStem',
  te: 'te',
  te_form: 'te',
  ta: 'ta',
  ta_form: 'ta',
  nai: 'nai',
  nai_form: 'nai',
  nakatta: 'nakatta',
  nakatta_form: 'nakatta',
  potential: 'potential',
  kanou: 'potential',
  passive: 'passive',
  ukemi: 'passive',
  causative: 'causative',
  shieki: 'causative',
  causative_passive: 'causativePassive',
  shieki_ukemi: 'causativePassive',
  ba: 'ba',
  eba: 'ba',
  tara: 'tara',
  nara: 'nara',
  volitional: 'volitional',
  ishou: 'volitional',
  imperative: 'imperative',
  meirei: 'imperative',
  sonkeigo: 'sonkeigo',
  kenjougo: 'kenjougo',
  tai: 'tai',
  takunai: 'takunai',
  takatta: 'takatta',
  takunakatta: 'takunakatta',
}

export function conjugate(input, target = 'te_form') {
  const analysis =
    typeof input === 'string'
      ? (() => {
          const classified = classifyKamus(input)
          return { ...classified, kamus: input }
        })()
      : input

  if (analysis.classType && analysis.classType !== 'verb') {
    throw new Error('conjugate() hanya untuk verba. Gunakan conjugateAdjective() atau conjugateNoun().')
  }

  const forms = buildVerbForms(analysis.kamus, {
    golongan: analysis.golongan,
    suruNoun: analysis.suruNoun,
  })
  const key = TARGET_ALIASES[target] ?? target
  const value = forms[key]
  if (!value) {
    throw new Error(`Bentuk "${target}" tidak dikenali`)
  }
  return value
}

export function conjugateAdjective(input, target = 'past') {
  const analysis = typeof input === 'string' ? { kamus: input } : input
  const kind = analysis.classType === 'na-adjective' ? 'na' : 'i'
  const forms =
    kind === 'i' ? buildIAdjectiveForms(analysis.kamus) : buildNaAdjectiveForms(analysis.kamus)
  const value = forms[target]
  if (!value) {
    throw new Error(`Bentuk "${target}" tidak dikenali`)
  }
  return value
}

export function conjugateNoun(input, target = 'plain') {
  const analysis = typeof input === 'string' ? { kamus: input } : input
  const forms = buildNounForms(analysis.kamus)
  const value = forms[target]
  if (!value) {
    throw new Error(`Bentuk "${target}" tidak dikenali`)
  }
  return value
}
