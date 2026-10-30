import { detectInputType, normalizeToHiragana, trim } from './verb.js'

// いい is irregular: its stem for every derived form is よ-.
// かっこいい follows the same pattern, but かわいい does not.
const II_IRREGULAR = new Set(['いい', '良い', 'よい', 'かっこいい', '格好いい', '恰好いい'])

const I_CONJUGATED_ENDINGS = ['くない', 'かった', 'くて', 'ければ', 'そう', 'すぎる', 'くなかった']
const NA_CONJUGATED_ENDINGS = ['じゃない', 'ではない', 'だった', 'でした', 'じゃなかった', 'くなかった']

const MEANING_OVERRIDES = {
  いい: { id: 'bagus', word: 'いい', en: ['good'] },
  良い: { id: 'bagus', en: ['good'] },
  かっこいい: { id: 'keren', en: ['cool', 'handsome'] },
  格好いい: { id: 'keren', en: ['cool', 'handsome'] },
  かわいい: { id: 'lucu', en: ['cute'] },
  可愛い: { id: 'lucu', en: ['cute'] },
  元気: { id: 'sehat', en: ['healthy', 'energetic'] },
  静か: { id: 'tenang', en: ['quiet'] },
  便利: { id: 'praktis', en: ['convenient'] },
  好き: { id: 'suka', en: ['to like'] },
  嫌い: { id: 'benci', en: ['to dislike'] },
  下手: { id: 'lemah', en: ['unskillful'] },
  大丈夫: { id: 'baik-baik saja', en: ['all right'] },
  大変: { id: 'berat', en: ['tough', 'serious'] },
  忙しい: { id: 'sibuk', en: ['busy'] },
}

// A few common na-adjectives are tagged as adverbs/nouns by the dictionary.
const POS_EXCEPTIONS = new Set(['大変'])

export function fixAdjectiveMeaning(dictionary) {
  if (!dictionary) return
  const override = MEANING_OVERRIDES[dictionary.word] ?? MEANING_OVERRIDES[dictionary.reading]
  if (!override) return
  dictionary.meanings = [override.id]
  dictionary.meaningsEn = [...override.en]
  dictionary.translated = true
}

export function hasPosException(dictionary) {
  return POS_EXCEPTIONS.has(dictionary?.word) || POS_EXCEPTIONS.has(dictionary?.reading)
}

function stripPoliteness(input, kind) {
  let surface = input
  if (surface.endsWith('です')) surface = surface.slice(0, -2)
  if (kind === 'na' && surface.endsWith('だ')) surface = surface.slice(0, -1)
  return surface
}

export function analyzeAdjectiveInput(input, kind) {
  const original = trim(input)
  if (!original) throw new Error('Input kosong')
  if (original.length > 50) throw new Error('Input terlalu panjang')

  const type = detectInputType(original)
  if (type === 'unknown') throw new Error('Input tidak valid')

  const hira = normalizeToHiragana(original)
  const surface = stripPoliteness(original, kind)
  const surfaceHira = normalizeToHiragana(surface)

  if (kind === 'i') {
    if (I_CONJUGATED_ENDINGS.some((ending) => surfaceHira.endsWith(ending))) {
      throw new Error('Ini sudah bentuk terkonjugasi. Masukkan bentuk kamus (mis. たかい).')
    }
    if (!surfaceHira.endsWith('い')) {
      throw new Error('Adjektiva-i harus berakhiran い (mis. たかい, おおきい).')
    }
  } else {
    if (NA_CONJUGATED_ENDINGS.some((ending) => surfaceHira.endsWith(ending))) {
      throw new Error('Ini sudah bentuk terkonjugasi. Masukkan bentuk kamus (mis. げんき / げんきだ).')
    }
    if (surfaceHira.endsWith('で') && surfaceHira.length > 2) {
      throw new Error('Ini bentuk で. Masukkan bentuk kamus tanpa で.')
    }
  }

  const lookupKey = ['romaji', 'katakana', 'mixed'].includes(type)
    ? surfaceHira
    : surface
  const isPlainIi =
    ['いい', '良い', 'よい'].includes(surface) || ['いい', 'よい'].includes(surfaceHira)
  const canonical = isPlainIi && kind === 'i' ? 'よい' : lookupKey

  return {
    kind,
    inputOriginal: original,
    inputHira: hira,
    inputType: type,
    surface,
    surfaceHira,
    formSurface: ['kanji', 'hiragana'].includes(type) ? surface : surfaceHira,
    lookupKey: canonical,
  }
}

function iStem(surface) {
  if (II_IRREGULAR.has(surface)) {
    if (['いい', '良い', 'よい'].includes(surface)) return 'よ'
    return `${surface.slice(0, -2)}よ`
  }
  return surface.slice(0, -1)
}

function gloss(m, kind) {
  const neg = `tidak ${m}`
  const past = `dulu ${m}`
  const table = {
    kamus: kind === 'na' ? `${m} (bentuk kamus)` : m,
    neg,
    past,
    pastNeg: `dulu tidak ${m}`,
    te: `${m}, dan ...`,
    teNeg: `tidak ${m}, dan ...`,
    ba: `kalau ${m}`,
    sou: `terlihat ${m}`,
    sugiru: `terlalu ${m}`,
    adverb: `${m} (keterangan)`,
    attributive: `${m} + kata benda`,
  }
  return table
}

function iAdjectiveForms(surface, m) {
  const stem = iStem(surface)
  const g = gloss(m, 'i')
  return {
    kamus: surface,
    neg: `${stem}くない`,
    past: `${stem}かった`,
    pastNeg: `${stem}くなかった`,
    te: `${stem}くて`,
    teNeg: `${stem}くなくて`,
    ba: `${stem}ければ`,
    sou: `${stem}${II_IRREGULAR.has(surface) ? 'さ' : ''}そう`,
    sugiru: `${stem}すぎる`,
    adverb: `${stem}く`,
    gloss: g,
  }
}

function naAdjectiveForms(surface, m) {
  const g = gloss(m, 'na')
  return {
    kamus: `${surface}だ`,
    neg: `${surface}じゃない`,
    past: `${surface}だった`,
    pastNeg: `${surface}じゃなかった`,
    te: `${surface}で`,
    teNeg: `${surface}じゃなくて`,
    ba: `${surface}なら`,
    sou: `${surface}そう`,
    sugiru: `${surface}すぎる`,
    adverb: `${surface}に`,
    attributive: `${surface}な`,
    gloss: g,
  }
}

const I_FORMS = [
  ['te', 'Bentuk くて', 'Menyambung dua sifat'],
  ['past', 'Bentuk かった', 'Lampau'],
  ['neg', 'Bentuk くない', 'Negatif'],
  ['pastNeg', 'Bentuk くなかった', 'Lampau negatif'],
  ['adverb', 'Bentuk く', 'Kata keterangan'],
  ['ba', 'Bentuk ければ', 'Pengandaian'],
  ['sou', 'Bentuk そう', 'Kesan / tampaknya'],
  ['sugiru', 'Bentuk すぎる', 'Terlalu'],
]

const NA_FORMS = [
  ['te', 'Bentuk で', 'Menyambung dua sifat'],
  ['past', 'Bentuk だった', 'Lampau'],
  ['neg', 'Bentuk じゃない', 'Negatif'],
  ['pastNeg', 'Bentuk じゃなかった', 'Lampau negatif'],
  ['attributive', 'Bentuk な', 'Menerangkan kata benda'],
  ['adverb', 'Bentuk に', 'Kata keterangan'],
  ['ba', 'Bentuk なら', 'Pengandaian'],
  ['sou', 'Bentuk そう', 'Kesan / tampaknya'],
]

export function buildAdjectiveResult(input, dictionary) {
  const kind = input.kind
  const surface = input.formSurface
  const meaning = dictionary?.meanings?.[0] ?? ''
  const table =
    kind === 'i' ? iAdjectiveForms(surface, meaning) : naAdjectiveForms(surface, meaning)
  const specs = kind === 'i' ? I_FORMS : NA_FORMS
  const forms = specs.map(([key, label, note]) => ({
    key,
    label,
    jp: table[key],
    meaning: table.gloss[key],
    note,
    highlight: key === 'te',
  }))
  const main = forms.find((form) => form.highlight) ?? forms[0]
  const posLabel = kind === 'i' ? 'Adjektiva-i (い)' : 'Adjektiva-na (な)'
  return {
    ...input,
    word: dictionary?.word ?? surface,
    reading: dictionary?.reading ?? input.surfaceHira,
    posLabel,
    form: main.jp,
    formLabel: main.label,
    meaning: main.meaning,
    forms,
    patterns: patternsFor(kind, table, meaning),
    chain: [
      { jp: table.kamus, label: 'Bentuk kamus' },
      { jp: main.jp, label: main.label },
    ],
    alasan:
      kind === 'i'
        ? 'Adjektiva-i mengubah akhiran い: くない (negatif), かった (lampau), くて (sambung).'
        : 'Adjektiva-na memakai だ sebagai bentuk kamus: じゃない (negatif), だった (lampau), で (sambung).',
    note:
      kind === 'i'
        ? 'Pengecualian: いい → よくない / よかった. Bentuk positifnya tetap いい.'
        : 'きれい dan 嫌い berakhiran い, tetapi termasuk adjektiva-na.',
    table,
  }
}

function patternsFor(kind, table, m) {
  if (kind === 'i') {
    return [
      { jp: `${table.adverb}なりました`, meaning: `menjadi ${m}`, note: 'Perubahan keadaan' },
      { jp: `${table.te}、…`, meaning: `${m}, dan ...`, note: 'Menyambung sifat' },
    ]
  }
  return [
    { jp: `${table.adverb}なりました`, meaning: `menjadi ${m}`, note: 'Perubahan keadaan' },
    { jp: `${table.attributive} + kata benda`, meaning: `${m} + kata benda`, note: 'Menerangkan' },
  ]
}
