import { fixVerbMeaning, isSuruNoun, lookupConjugation } from './validate.js'

// Same validation flow as ます→て, with suru-compounds rebuilt as しない.
export function lookupMasuToNai(result) {
  return lookupConjugation(result, applyCompound)
}

function applyCompound(result, dictionary) {
  fixVerbMeaning(result, dictionary)
  if (result.golongan === 'irregular' || !isSuruNoun(dictionary)) {
    return result
  }

  const noun = result.stem.slice(0, -1)
  const kamus = `${noun}する`
  const naiForm = `${noun}しない`

  return {
    ...result,
    golongan: 'irregular',
    golonganLabel: 'Golongan III — Irregular',
    alasan: `${noun} adalah kata benda yang dirangkai dengan する. Karena する menjadi しない, bentuknya ${naiForm}.`,
    kamus,
    naiForm,
    chain: [result.inputHira, kamus, naiForm],
    isException: false,
    isAmbiguous: false,
  }
}
