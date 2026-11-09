import patterns from './patterns.json'
import { romaji } from './engine/romaji.js'

export const GROUP_ORDER = [
  'Bentuk Dasar',
  'Pola ~te',
  'Pola ~tai',
  'Pola ~nai',
  'Pola ~koto',
  'Pola ~mae/ato',
  'Pola ~ri',
  'Pola ~ni',
  'Lainnya',
]

const BASE_KEYS = {
  masu_stem: 'masuStem',
  nai_stem: 'naiStem',
  dictionary: 'kamus',
  te: 'te',
  ta: 'ta',
  nai: 'nai',
  ba: 'ba',
  tara: 'tara',
  naru: 'naru',
  suru: 'suru',
  sou: 'sou',
  sugiru: 'sugiru',
  adverb: 'adverb',
  attributive: 'attributive',
  passive: 'passive',
  causative: 'causative',
  sonkeigo: 'sonkeigo',
  kenjougo: 'kenjougo',
}

const ids = new Set()
for (const pattern of patterns) {
  if (ids.has(pattern.id)) {
    throw new Error(`Pattern id duplikat: ${pattern.id}`)
  }
  ids.add(pattern.id)
}

export function loadPatterns({ classType = 'verb', phase = 1, status = 'available' } = {}) {
  return patterns.filter(
    (pattern) =>
      pattern.status === status &&
      pattern.min_phase <= phase &&
      (pattern.classes ?? [pattern.category]).includes(classType),
  )
}

function fillTemplate(template, base, meaning) {
  return (template ?? '')
    .replaceAll('{base}', base)
    .replaceAll('{word}', meaning || '...')
    .replace(/\s+/g, ' ')
    .trim()
}

export function buildPatternRow(pattern, forms, meaning) {
  const baseKey = BASE_KEYS[pattern.base_form] ?? pattern.base_form
  const base = forms[baseKey]
  if (!base) return null

  const jp = `${base}${pattern.suffix ?? ''}`
  const baseRomaji = romaji(base)
  const romajiText = pattern.romaji_template
    ? fillTemplate(pattern.romaji_template, baseRomaji, meaning)
    : romaji(jp)

  return {
    id: pattern.id,
    group: pattern.group,
    name: pattern.name,
    jp,
    romaji: romajiText,
    meaning: fillTemplate(pattern.meaning, base, meaning),
    note: pattern.note ?? '',
    reference: pattern.reference ?? '',
    level: pattern.level ?? '',
    status: pattern.status,
  }
}

export function buildPatternTables(analysis, { phase = 1 } = {}) {
  const forms = analysis.forms ?? {}
  const meaning = analysis.meaning ?? ''
  const rows = loadPatterns({ classType: analysis.classType, phase })
    .map((pattern) => buildPatternRow(pattern, forms, meaning))
    .filter(Boolean)

  const grouped = new Map()
  for (const row of rows) {
    if (!grouped.has(row.group)) grouped.set(row.group, [])
    grouped.get(row.group).push(row)
  }

  const groups = []
  const seen = new Set()
  for (const name of GROUP_ORDER) {
    if (!grouped.has(name)) continue
    groups.push({ name, rows: grouped.get(name) })
    seen.add(name)
  }
  for (const [name, groupRows] of grouped) {
    if (seen.has(name)) continue
    groups.push({ name, rows: groupRows })
  }

  return { rows, groups }
}

export function listAllPatterns() {
  return patterns
}
