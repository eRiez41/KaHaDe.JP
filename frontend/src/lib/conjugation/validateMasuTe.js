import { fixVerbMeaning, isSuruNoun, lookupConjugation } from './validate.js'

// Validates the analyzer's dictionary form against the backend dictionary.
// A 404 is retried once as a suru-compound because romaji/kana input such as
// "benkyoushimasu" cannot be told apart from a godan verb locally.
export function lookupMasuToTe(result) {
  return lookupConjugation(result, applyCompound)
}

function applyCompound(result, dictionary) {
  fixVerbMeaning(result, dictionary)
  if (result.golongan === 'irregular' || !isSuruNoun(dictionary)) {
    return result
  }

  const noun = result.stem.slice(0, -1)
  const kamus = `${noun}する`
  const teForm = `${result.stem}て`

  return {
    ...result,
    golongan: 'irregular',
    golonganLabel: 'Golongan III — Irregular',
    alasan: `${noun} adalah kata benda yang dirangkai dengan する. する termasuk verba irregular, jadi bentuk て-nya ${teForm}.`,
    kamus,
    teForm,
    chain: [result.inputHira, kamus, teForm],
    isException: false,
    isAmbiguous: false,
  }
}
