import { downloadJSON } from './download.js'

export function pickKosakataFields(item) {
  return {
    kanji: item.kanji || '',
    hira: item.hira || '',
    romaji: item.romaji || '',
    arti: item.arti || '',
  }
}

export function buildBabExport(bab, items) {
  return {
    bab: bab?.nama || '',
    exportedAt: new Date().toISOString(),
    kosakata: (items || []).map(pickKosakataFields),
  }
}

export function babExportFilename(name, id) {
  const slug = String(name || `bab-${id}`)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  const date = new Date().toISOString().slice(0, 10)
  return `${slug || `bab-${id}`}-${date}.json`
}

export function downloadBabExport(bab, items) {
  downloadJSON(buildBabExport(bab, items), babExportFilename(bab?.nama, bab?.id))
}
