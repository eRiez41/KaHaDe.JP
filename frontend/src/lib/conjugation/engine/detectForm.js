const U_DAN_END = /[うくぐすつぬぶむる]$/

export const FORM_LABEL = {
  dictionary: 'Bentuk kamus',
  masu: 'Bentuk ます',
  te: 'Bentuk て',
  ta: 'Bentuk た',
  nai: 'Bentuk ない',
}

// Detect the five input forms supported in Phase 1. The order matters:
// polite past/negative endings also end in た, so they must be checked before
// the plain ta-form rule.
export function detectForm(input) {
  const value = (input ?? '').trim()
  if (!value) {
    return { form: null, label: '' }
  }

  if (value.endsWith('ませんでした') || value.endsWith('ません') || value.endsWith('ました') || value.endsWith('ます')) {
    return { form: 'masu', label: FORM_LABEL.masu }
  }

  if (value.endsWith('なかった') || value.endsWith('ない')) {
    return { form: 'nai', label: FORM_LABEL.nai }
  }

  if (value.endsWith('て') || value.endsWith('で')) {
    return { form: 'te', label: FORM_LABEL.te }
  }

  if (value.endsWith('た') || value.endsWith('だ')) {
    return { form: 'ta', label: FORM_LABEL.ta }
  }

  if (U_DAN_END.test(value)) {
    return { form: 'dictionary', label: FORM_LABEL.dictionary }
  }

  // Adjectives and nouns do not end in u-dan. They still go through the
  // dictionary path so Jisho can classify them.
  return { form: 'dictionary', label: FORM_LABEL.dictionary }
}
