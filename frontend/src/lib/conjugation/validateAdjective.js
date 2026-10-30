import { lookupWord } from '../api.js'
import {
  analyzeAdjectiveInput,
  buildAdjectiveResult,
  fixAdjectiveMeaning,
  hasPosException,
} from './adjectives.js'

const NOT_FOUND =
  'Kata tidak ditemukan di kamus. Periksa kembali ejaan adjektiva yang kamu masukkan.'

function labelFor(kind) {
  return kind === 'i' ? 'adjektiva-i (い)' : 'adjektiva-na (な)'
}

function matchesPos(dictionary, kind) {
  if (hasPosException(dictionary)) return true
  const pos = (dictionary?.partsOfSpeech ?? []).join(' ')
  return kind === 'i' ? /I-?adjective/i.test(pos) : /Na-?adjective/i.test(pos)
}

async function lookupAdjective(parsed) {
  const keys = [...new Set([parsed.lookupKey, parsed.surfaceHira, parsed.surface])]
  for (const key of keys) {
    try {
      return await lookupWord(key)
    } catch (error) {
      if (error?.status !== 404) throw error
    }
  }
  throw new Error(NOT_FOUND)
}

export async function validateAdjective(input, kind) {
  const parsed = typeof input === 'string' ? analyzeAdjectiveInput(input, kind) : input
  const dictionary = await lookupAdjective(parsed)

  if (!matchesPos(dictionary, kind)) {
    throw new Error(
      `Kata ini bukan ${labelFor(kind)}. Periksa golongannya (adjektiva-i berakhiran い, adjektiva-na biasanya tidak).`,
    )
  }

  fixAdjectiveMeaning(dictionary)
  return {
    result: buildAdjectiveResult(parsed, dictionary),
    dictionary,
  }
}
