import { lookupWord } from '../api.js'
import { analyzeDictionaryVerb } from './dictionaryVerb.js'
import { conjugateAll } from './verbForms.js'
import { buildJishoResult } from './verbBuild.js'
import { lookupVerbBase } from './validateVerbModule.js'
import { fixVerbMeaning } from './validate.js'
import { GOLONGAN_LABEL } from './verb.js'

const NOT_FOUND_MESSAGE =
  'Kata tidak ditemukan di kamus. Periksa kembali ejaan bentuk kamus atau bentuk ます.'

function fromPartsOfSpeech(parsed, dictionary) {
  const pos = (dictionary.partsOfSpeech || []).join(' ')
  const form = parsed.inputHira
  const common = {
    inputOriginal: parsed.inputOriginal,
    inputHira: form,
    inputType: parsed.inputType,
    kamus: form,
    suruNoun: null,
    isException: false,
    isAmbiguous: false,
  }

  if (/Kuru verb/i.test(pos)) {
    return {
      ...common,
      golongan: 'irregular',
      golonganLabel: GOLONGAN_LABEL.irregular,
      stem: 'き',
      alasan: '来る adalah verba irregular. Dari kamus, bentuk ます-nya 来ます (きます).',
    }
  }

  if (/Suru verb/i.test(pos) && form.endsWith('する')) {
    const noun = form.slice(0, -2)
    return {
      ...common,
      golongan: 'irregular',
      golonganLabel: GOLONGAN_LABEL.irregular,
      stem: `${noun}し`,
      suruNoun: noun,
      alasan: noun
        ? `${noun} adalah kata benda + する. Bentuk ます-nya ${noun}します.`
        : 'する adalah verba irregular. Bentuk ます-nya します.',
    }
  }

  if (/Ichidan verb/i.test(pos)) {
    return {
      ...common,
      golongan: 'ichidan',
      golonganLabel: GOLONGAN_LABEL.ichidan,
      stem: form.slice(0, -1),
      alasan: 'Kamus menandai verba ini Ichidan. Buang る, lalu tambah ます.',
    }
  }

  if (/Godan verb/i.test(pos)) {
    const godan = analyzeDictionaryVerb(form)
    return {
      ...common,
      golongan: 'godan',
      golonganLabel: GOLONGAN_LABEL.godan,
      stem: godan.stem,
      isException: /special class|irregular verb/i.test(pos),
      isAmbiguous: parsed.inputType === 'hiragana' && form.endsWith('る'),
      alasan: godan.alasan,
    }
  }

  throw new Error('Kata ini bukan verba. Masukkan bentuk kamus verba (mis. たべる).')
}

export async function validateJisho(parsed) {
  if (parsed.direction === 'to-jisho') {
    const checked = await lookupVerbBase(parsed.base)
    return {
      result: buildJishoResult(
        checked.base,
        checked.base,
        conjugateAll(checked.base),
        checked.dictionary,
        'to-jisho',
      ),
      dictionary: checked.dictionary,
    }
  }

  let dictionary
  try {
    dictionary = await lookupWord(parsed.inputHira)
  } catch (error) {
    if (error?.status === 404) throw new Error(NOT_FOUND_MESSAGE)
    throw error
  }

  const base = fromPartsOfSpeech(parsed, dictionary)
  fixVerbMeaning(base, dictionary)
  return {
    result: buildJishoResult(parsed, base, conjugateAll(base), dictionary, 'to-masu'),
    dictionary,
  }
}
