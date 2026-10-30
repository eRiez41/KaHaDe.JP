import { lookupWord } from '../api.js'

const NOT_FOUND_MESSAGE =
  'Kata tidak ditemukan di kamus. Periksa kembali ejaan kata kerja bentuk ます yang kamu masukkan.'

// Validates the analyzer's dictionary form against the backend dictionary and
// lets each module fix up suru-compounds that local heuristics could not spot
// (e.g. romaji "benkyoushimasu": valid godan shape, but actually noun + する).
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

// Jisho marks suru nouns with a part of speech such as "Suru verb".
export function isSuruNoun(dictionary) {
  return (dictionary?.partsOfSpeech ?? []).some((pos) => /suru verb/i.test(pos))
}

// A few high-frequency verbs get machine-translated into misleading glosses.
// These overrides keep the study card honest.
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
