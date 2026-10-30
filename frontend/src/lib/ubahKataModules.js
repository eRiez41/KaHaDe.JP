import MasuNaiExplanation from '../components/ubah-kata/MasuNaiExplanation.svelte'
import MasuNaiResult from '../components/ubah-kata/MasuNaiResult.svelte'
import MasuTeExplanation from '../components/ubah-kata/MasuTeExplanation.svelte'
import MasuTeResult from '../components/ubah-kata/MasuTeResult.svelte'
import VerbFormExplanation from '../components/ubah-kata/VerbFormExplanation.svelte'
import VerbFormResult from '../components/ubah-kata/VerbFormResult.svelte'
import { ADJECTIVE_MODULES } from './conjugation/adjectiveModules.js'
import { analyzeAdjectiveInput } from './conjugation/adjectives.js'
import { analyzeJishoInput } from './conjugation/dictionaryVerb.js'
import { validateJisho } from './conjugation/jisho.js'
import { analyzeMasuVerb } from './conjugation/masuBase.js'
import { analyzeMasuToNai } from './conjugation/masuToNai.js'
import { analyzeMasuToTe } from './conjugation/masuToTe.js'
import { validateAdjective } from './conjugation/validateAdjective.js'
import { lookupMasuToNai } from './conjugation/validateMasuNai.js'
import { lookupMasuToTe } from './conjugation/validateMasuTe.js'
import { makeVerbValidator } from './conjugation/validateVerbModule.js'
import { VERB_MODULES } from './conjugation/verbModules.js'

const MASU_INPUT = {
  inputTitle: 'Masukkan kata kerja bentuk ます',
  inputHint: 'Bisa romaji, hiragana, katakana, atau kanji',
  placeholder: 'Contoh: tabemasu, たべます, 食べます',
}

function verbEntry(id) {
  const config = VERB_MODULES[id]
  return {
    title: config.title,
    subtitle: config.subtitle,
    ...MASU_INPUT,
    config,
    analyze: analyzeMasuVerb,
    validate: makeVerbValidator(id),
    Explanation: VerbFormExplanation,
    Result: VerbFormResult,
  }
}

function adjectiveEntry(id, kind) {
  const config = ADJECTIVE_MODULES[id]
  return {
    title: config.title,
    subtitle: config.subtitle,
    inputTitle:
      kind === 'i' ? 'Masukkan adjektiva-i bentuk kamus' : 'Masukkan adjektiva-na bentuk kamus',
    inputHint: 'Bisa romaji, hiragana, katakana, atau kanji. Akhiran だ/です opsional.',
    placeholder: kind === 'i' ? 'Contoh: takai, たかい, 高い' : 'Contoh: genki, げんき, 元気',
    config,
    analyze: (value) => analyzeAdjectiveInput(value, kind),
    validate: (parsed) => validateAdjective(parsed, kind),
    Explanation: VerbFormExplanation,
    Result: VerbFormResult,
  }
}

export const UB_KATA_MODULES = {
  'masu-te': {
    title: 'ます → て',
    subtitle: 'Bab 14 · Bentuk sambung',
    ...MASU_INPUT,
    analyze: analyzeMasuToTe,
    validate: lookupMasuToTe,
    Explanation: MasuTeExplanation,
    Result: MasuTeResult,
  },
  'masu-nai': {
    title: 'ます → ない',
    subtitle: 'Bab 17 · Bentuk negatif biasa',
    ...MASU_INPUT,
    analyze: analyzeMasuToNai,
    validate: lookupMasuToNai,
    Explanation: MasuNaiExplanation,
    Result: MasuNaiResult,
  },
  'masu-jisho': {
    title: 'ます ⇄ 辞書形',
    subtitle: 'Bab 9 & 14 · Bolak-balik bentuk kamus',
    inputTitle: 'Masukkan bentuk kamus atau bentuk ます',
    inputHint: 'Arah konversi terdeteksi otomatis dari akhiran input',
    placeholder: 'Contoh: taberu, たべる, 食べます',
    config: VERB_MODULES['masu-jisho'],
    analyze: analyzeJishoInput,
    validate: validateJisho,
    Explanation: VerbFormExplanation,
    Result: VerbFormResult,
  },
  'masu-ta': verbEntry('masu-ta'),
  'masu-tara': verbEntry('masu-tara'),
  'masu-kanou': verbEntry('masu-kanou'),
  'masu-ishou': verbEntry('masu-ishou'),
  'masu-meirei': verbEntry('masu-meirei'),
  'masu-eba': verbEntry('masu-eba'),
  'masu-ukemi': verbEntry('masu-ukemi'),
  'masu-shieki': verbEntry('masu-shieki'),
  'masu-shiekiukemi': verbEntry('masu-shiekiukemi'),
  'masu-keigo': verbEntry('masu-keigo'),
  'i-kei': adjectiveEntry('i-kei', 'i'),
  'na-kei': adjectiveEntry('na-kei', 'na'),
}

export function getUbahKataModule(sub) {
  return UB_KATA_MODULES[sub] ?? UB_KATA_MODULES['masu-te']
}
