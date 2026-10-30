import { lookupWord } from '../api.js'
import { buildVerbResult } from './verbBuild.js'
import { VERB_MODULES } from './verbModules.js'
import { fixVerbMeaning, isSuruNoun } from './validate.js'

const NOT_FOUND_MESSAGE =
  'Kata tidak ditemukan di kamus. Periksa kembali ejaan bentuk ます yang kamu masukkan.'

function asSuruCompound(base, noun) {
  return {
    ...base,
    golongan: 'irregular',
    golonganLabel: 'Golongan III — Irregular',
    alasan: `${noun} adalah kata benda yang dirangkai dengan する. Semua bentuk mengikuti する.`,
    kamus: `${noun}する`,
    suruNoun: noun,
    isException: false,
    isAmbiguous: false,
  }
}

// Looks up the dictionary form and repairs romaji suru-compounds such as
// "benkyoushimasu", whose local shape looks like a Godan -su verb.
export async function lookupVerbBase(base) {
  let dictionary
  try {
    dictionary = await lookupWord(base.kamus)
  } catch (error) {
    if (error?.status !== 404) throw error
    if (!base.stem.endsWith('し')) throw new Error(NOT_FOUND_MESSAGE)
    const noun = base.stem.slice(0, -1)
    try {
      dictionary = await lookupWord(`${noun}する`)
    } catch (retryError) {
      if (retryError?.status === 404) throw new Error(NOT_FOUND_MESSAGE)
      throw retryError
    }
    base = asSuruCompound(base, noun)
  }

  fixVerbMeaning(base, dictionary)

  if (
    base.suruNoun === null &&
    isSuruNoun(dictionary) &&
    base.stem.endsWith('し')
  ) {
    base = asSuruCompound(base, base.stem.slice(0, -1))
  }

  return { base, dictionary }
}

export function makeVerbValidator(id) {
  const config = VERB_MODULES[id]
  return async (base) => {
    const checked = await lookupVerbBase(base)
    return {
      result: buildVerbResult(checked.base, config, checked.dictionary),
      dictionary: checked.dictionary,
    }
  }
}
