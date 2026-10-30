// Metadata + copy for every new verb module. Build logic lives in verbBuild.js.
// Split into two data files so neither file grows past the size limit.
import { VERB_MODULES_A } from './verbModulesA.js'
import { VERB_MODULES_B } from './verbModulesB.js'

export const VERB_MODULES = { ...VERB_MODULES_A, ...VERB_MODULES_B }
