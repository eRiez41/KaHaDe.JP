import { conjugateAll, politeOf, verbGloss } from './verbForms.js'

function pastOf(ruForm) {
  return ruForm.endsWith('る') ? `${ruForm.slice(0, -1)}た` : `${ruForm}た`
}

function negOf(ruForm) {
  return ruForm.endsWith('る') ? `${ruForm.slice(0, -1)}ない` : `${ruForm}ない`
}

function honorificRequest(table, base, suru) {
  if (suru && base.suruNoun) return `ご${base.suruNoun}ください`
  const son = table.sonkeigo || ''
  if (son.endsWith('になる')) return `${son.slice(0, -3)}になってください`
  if (son.endsWith('る')) return `${son.slice(0, -1)}ってください`
  return `お${base.stem}ください`
}

function extendTable(base, table) {
  const godan = base.golongan === 'godan'
  const suru = base.suruNoun !== null && base.suruNoun !== undefined
  const kuru = base.golongan === 'irregular' && !suru
  const aru = base.kamus === 'ある' || base.kamus === '有る'
  return {
    ...table,
    kanouPast: aru ? 'ありえた' : pastOf(table.kanou),
    kanouPolite: politeOf(table.kanou),
    ishouPolite: `${base.stem}ましょう`,
    ukemiNeg: negOf(table.ukemi),
    ukemiPast: pastOf(table.ukemi),
    ukemiPolite: politeOf(table.ukemi),
    shiekiNeg: negOf(table.shieki),
    shiekiPast: pastOf(table.shieki),
    shiekiPolite: politeOf(table.shieki),
    shiekiukemiNeg: negOf(table.shiekiukemi),
    shiekiukemiPast: pastOf(table.shiekiukemi),
    shiekiukemiPolite: politeOf(table.shiekiukemi),
    meireiNeg: table.kamus + 'な',
    shiekiShort:
      godan && !suru && !kuru ? table.shieki.slice(0, -2) + 'す' : table.shieki,
    shiekiukemiShort:
      godan && !suru && !kuru
        ? table.shiekiukemi.slice(0, -4) + 'される'
        : table.shiekiukemi,
    sonkeigoRequest: honorificRequest(table, base, suru),
  }
}

function chainFor(base, table, mainKey, label) {
  const form = table[mainKey]
  if (form === base.kamus) {
    return [
      { jp: base.inputHira, label: 'Input' },
      { jp: table.kamus, label: label },
    ]
  }
  return [
    { jp: base.inputHira, label: 'Input' },
    { jp: table.kamus, label: 'Kamus' },
    { jp: form, label },
  ]
}

export function buildVerbResult(base, config, dictionary) {
  const table = extendTable(base, conjugateAll(base))
  const meaning = dictionary?.meanings?.[0] ?? ''
  const forms = config.forms
    .filter((spec) => !spec.godanOnly || base.golongan === 'godan')
    .map((spec) => ({
      key: spec.key,
      label: spec.label,
      jp: table[spec.key],
      meaning: verbGloss(spec.gloss, meaning),
      note: spec.note,
      highlight: spec.key === config.mainKey,
    }))
  const main = forms.find((form) => form.highlight) ?? forms[0]
  return {
    ...base,
    form: main.jp,
    formLabel: main.label,
    meaning: main.meaning,
    forms,
    patterns: config.patterns ? config.patterns(table, meaning) : [],
    chain: chainFor(base, table, config.mainKey, config.formLabel),
    alasan: config.rule ? `${base.alasan} ${config.rule}` : base.alasan,
    note: typeof config.note === 'function' ? config.note(base, table) : config.note || '',
    table,
  }
}

// Dictionary-form input goes the other way: dictionary → masu. POS data from
// the backend decides Godan vs Ichidan, so 帰る/変える are not guessed locally.
export function buildJishoResult(input, base, table, dictionary, direction) {
  const meaning = dictionary?.meanings?.[0] ?? ''
  const toMasu = direction === 'to-masu'
  const forms = [
    {
      key: 'kamus',
      label: 'Bentuk kamus',
      jp: table.kamus,
      meaning: verbGloss('plain', meaning),
      note: 'Bentuk dasar',
      highlight: toMasu ? false : true,
    },
    {
      key: 'masu',
      label: 'Bentuk ます',
      jp: table.masu,
      meaning: verbGloss('masu', meaning),
      note: 'Sopan, positif',
      highlight: toMasu,
    },
    {
      key: 'masuNeg',
      label: 'ません',
      jp: table.masuNeg,
      meaning: verbGloss('masuNeg', meaning),
      note: 'Sopan, negatif',
    },
    {
      key: 'ta',
      label: 'Bentuk た',
      jp: table.ta,
      meaning: verbGloss('ta', meaning),
      note: 'Lampau biasa',
    },
  ]
  const mainKey = toMasu ? 'masu' : 'kamus'
  const main = forms.find((form) => form.highlight) ?? forms[0]
  return {
    ...input,
    ...base,
    form: main.jp,
    formLabel: main.label,
    meaning: main.meaning,
    forms,
    patterns: [],
    chain:
      direction === 'to-masu'
        ? [
            { jp: base.kamus, label: 'Kamus' },
            { jp: table.masu, label: 'Bentuk ます' },
          ]
        : [
            { jp: base.inputHira, label: 'Input' },
            { jp: base.kamus, label: 'Bentuk kamus' },
          ],
    alasan: base.alasan,
    note: '',
    table,
  }
}
