import { lookupWord } from '../api.js'
import { toHira } from '../kuromoji.js'
import { fixAdjectiveMeaning } from './adjectives.js'
import { classifyDictionary, classLabel, golonganLabel, shortClassLabel } from './engine/classify.js'
import { buildForms, buildPrimaryRows } from './engine/conjugate.js'
import { FORM_LABEL } from './engine/detectForm.js'
import { hasKanji, normalizeInput, validateInput } from './engine/normalize.js'
import { reverseToKamus } from './engine/reverse.js'
import { romaji } from './engine/romaji.js'
import { buildPatternTables } from './patternsLoader.js'

const NOT_FOUND_MESSAGE =
  'Kata tidak ditemukan di kamus. Periksa kembali ejaan kata kerja bentuk ます yang kamu masukkan.'

const NO_MATCH_MESSAGE =
  'Kata tidak ditemukan di kamus. Periksa kembali ejaan dan bentuk kata yang kamu masukkan.'

const MEANING_FALLBACK = 'Arti belum tersedia'

function cleanMeaning(dictionary) {
  const value = dictionary?.meanings?.[0] ?? dictionary?.meaningsEn?.[0] ?? ''
  if (!value) return MEANING_FALLBACK
  if (dictionary?.translated) return value
  return value.replace(/^to\s+/i, '')
}

function stripCopula(value) {
  return value.replace(/(です|だ)$/, '')
}

async function lookupFirst(keys) {
  const unique = [...new Set(keys.filter(Boolean))]
  for (const key of unique) {
    try {
      return await lookupWord(key)
    } catch (error) {
      if (error?.status === 404) continue
      throw error
    }
  }
  return null
}

function candidateKeys(candidate) {
  return [candidate.word, candidate.kamus, stripCopula(candidate.kamus ?? '')]
}

function matchesInput(analysis, inputHira) {
  if (hasKanji(inputHira)) return true
  if (analysis.classType === 'verb') {
    const expected =
      analysis.inputForm === 'dictionary'
        ? analysis.forms.kamus
        : analysis.forms[analysis.inputForm]
    return expected === inputHira
  }
  return analysis.forms.kamus === stripCopula(inputHira)
}

function buildAnalysis(dictionary, inputHira, inputForm) {
  const classified = classifyDictionary(dictionary, { inputHira })
  const analysis = {
    ...classified,
    dictionary,
    inputForm,
    word: dictionary.word || classified.reading,
    reading: dictionary.reading || classified.reading,
  }

  if (analysis.classType === 'verb') {
    fixVerbMeaning(analysis, dictionary)
  } else if (analysis.classType === 'i-adjective' || analysis.classType === 'na-adjective') {
    fixAdjectiveMeaning(dictionary)
  }

  analysis.meaning = cleanMeaning(dictionary)
  analysis.meaningEn = dictionary.meaningsEn?.[0] ?? ''
  analysis.posLabel =
    analysis.classType === 'verb'
      ? golonganLabel(analysis.golongan)
      : classLabel(analysis.classType)
  analysis.shortClass = shortClassLabel(analysis.classType, analysis.golongan)
  analysis.forms = buildForms(analysis)
  analysis.primary = buildPrimaryRows(analysis)

  const tables = buildPatternTables(analysis)
  analysis.patterns = tables.rows
  analysis.groups = tables.groups
  analysis.romaji = romaji(analysis.reading)
  analysis.badge = analysis.classType === 'verb' ? analysis.golongan : analysis.classType

  return analysis
}

async function analyzeCandidate(candidate, inputHira, inputForm) {
  const dictionary = await lookupFirst(candidateKeys(candidate))
  if (!dictionary) return null

  const analysis = buildAnalysis(dictionary, inputHira, inputForm)
  if (!matchesInput(analysis, inputHira)) return null
  return analysis
}

function dedupeCandidates(candidates) {
  const seen = new Set()
  return candidates.filter((candidate) => {
    const key = `${candidate.word}|${candidate.reading}|${candidate.classType}|${candidate.golongan ?? ''}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export async function analyzeWord(input) {
  const original = validateInput(input)
  const inputHira = await normalizeInput(original, { toHira })
  const reverseInput = hasKanji(original) ? original.trim() : inputHira

  let reversed
  try {
    reversed = reverseToKamus(reverseInput)
  } catch {
    reversed = { form: 'dictionary', kandidat: [{ kamus: reverseInput }] }
  }

  const candidates = []
  for (const candidate of reversed.kandidat) {
    const analysis = await analyzeCandidate(candidate, inputHira, reversed.form)
    if (analysis) candidates.push(analysis)
  }

  const unique = dedupeCandidates(candidates)
  if (!unique.length) {
    throw new Error(NO_MATCH_MESSAGE)
  }

  return {
    input: {
      original,
      hira: inputHira,
      form: reversed.form,
      formLabel: FORM_LABEL[reversed.form] ?? '',
      romaji: romaji(inputHira),
    },
    candidates: unique,
    active: 0,
  }
}

// ---------------------------------------------------------------------------
// Legacy API — still imported by the hidden v1 modules so their files keep
// building. The v2 page only uses analyzeWord().
// ---------------------------------------------------------------------------

export async function lookupConjugation(result, applyCompound) {
  try {
    const dictionary = await lookupWord(result.kamus)
    return { result: applyCompound(result, dictionary), dictionary }
  } catch (error) {
    if (error?.status !== 404) {
      throw error
    }
  }

  const compound = await trySuruCompound(result, applyCompound)
  if (compound) {
    return compound
  }
  throw new Error(NOT_FOUND_MESSAGE)
}

async function trySuruCompound(result, applyCompound) {
  if (!result.stem.endsWith('し')) {
    return null
  }

  const noun = result.stem.slice(0, -1)
  const kamus = `${noun}する`
  if (result.kamus === kamus) {
    return null
  }

  try {
    const dictionary = await lookupWord(kamus)
    return { result: applyCompound(result, dictionary), dictionary }
  } catch (error) {
    if (error?.status === 404) {
      return null
    }
    throw error
  }
}

export function isSuruNoun(dictionary) {
  return (dictionary?.partsOfSpeech ?? []).some((pos) => /suru verb/i.test(pos))
}

const MEANING_OVERRIDES = {
  ある: { id: ['ada'], en: ['to exist (inanimate)'], word: 'ある', reading: 'ある' },
  有る: { id: ['ada'], en: ['to exist (inanimate)'], word: 'ある', reading: 'ある' },
  くる: { id: ['datang'], en: ['to come'] },
  来る: { id: ['datang'], en: ['to come'] },
  いる: { id: ['ada (makhluk hidup)'], en: ['to exist (animate)'] },
  居る: { id: ['ada (makhluk hidup)'], en: ['to exist (animate)'] },
}

export function fixVerbMeaning(result, dictionary) {
  const override = MEANING_OVERRIDES[result?.kamus]
  if (!override || !dictionary) {
    return
  }
  dictionary.meanings = [...override.id]
  if (override.en) dictionary.meaningsEn = [...override.en]
  if (override.word) dictionary.word = override.word
  if (override.reading) dictionary.reading = override.reading
  dictionary.translated = true
}
