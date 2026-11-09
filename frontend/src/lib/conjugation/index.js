export { analyzeWord } from './validate.js'
export { AMBIGUOUS_KANA, reverseToKamus } from './engine/reverse.js'
export { detectForm, FORM_LABEL } from './engine/detectForm.js'
export {
  buildForms,
  buildIAdjectiveForms,
  buildNaAdjectiveForms,
  buildNounForms,
  buildPrimaryRows,
  buildVerbForms,
  conjugate,
  conjugateAdjective,
  conjugateNoun,
  iStem,
} from './engine/conjugate.js'
export {
  classLabel,
  classifyDictionary,
  classifyKamus,
  golonganLabel,
  shortClassLabel,
} from './engine/classify.js'
export { hasKanji, normalizeInput, validateInput } from './engine/normalize.js'
export { joinRomaji, romaji } from './engine/romaji.js'
export {
  GROUP_ORDER,
  buildPatternRow,
  buildPatternTables,
  listAllPatterns,
  loadPatterns,
} from './patternsLoader.js'
