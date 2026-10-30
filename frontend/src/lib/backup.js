import { downloadJSON } from './download.js'
import { createBab, getBabList, getKosakataList, importKosakata } from './api.js'
import { pickKosakataFields } from './bab-export.js'

export async function exportAllBackup() {
  const babs = await getBabList()
  const entries = []

  for (const bab of babs) {
    const items = await getKosakataList(bab.id)
    entries.push({
      nama: bab.nama,
      kosakata: items.map(pickKosakataFields),
    })
  }

  const data = {
    exportedAt: new Date().toISOString(),
    bab: entries,
  }
  const date = new Date().toISOString().slice(0, 10)
  downloadJSON(data, `kosakata-backup-${date}.json`)
  return { bab: entries.length, kata: entries.reduce((sum, entry) => sum + entry.kosakata.length, 0) }
}

function normalizeEntry(entry) {
  const nama = String(entry?.nama || entry?.bab || '').trim()
  const rawItems = Array.isArray(entry?.kosakata) ? entry.kosakata : []
  const kosakata = rawItems
    .map((item) => {
      const jepang = item?.kanji || item?.jepang || ''
      return {
        kanji: String(jepang).trim(),
        hira: String(item?.hira || '').trim(),
        romaji: String(item?.romaji || '').trim(),
        arti: String(item?.arti || '').trim(),
      }
    })
    .filter((item) => item.kanji && item.arti)

  return { nama, kosakata }
}

export function parseBackup(data) {
  if (Array.isArray(data?.bab)) {
    return data.bab.map(normalizeEntry).filter((entry) => entry.nama)
  }
  if (typeof data?.bab === 'string' && Array.isArray(data?.kosakata)) {
    const entry = normalizeEntry(data)
    return entry.nama ? [entry] : []
  }
  if (Array.isArray(data)) {
    return data
      .map((entry) => normalizeEntry(entry))
      .filter((entry) => entry.nama)
  }
  return []
}

export async function restoreBackup(entries, onProgress) {
  const summary = { bab: 0, inserted: 0, skipped: 0, failed: [] }

  for (let index = 0; index < entries.length; index += 1) {
    const entry = entries[index]
    if (typeof onProgress === 'function') {
      onProgress({ index, total: entries.length, nama: entry.nama })
    }

    try {
      const bab = await createBab(entry.nama)
      summary.bab += 1
      if (entry.kosakata.length > 0) {
        const result = await importKosakata(bab.id, entry.kosakata)
        summary.inserted += result.inserted || 0
        summary.skipped += result.skipped || 0
      }
    } catch (error) {
      summary.failed.push({
        nama: entry.nama,
        message: error?.message || 'Gagal restore bab.',
      })
    }
  }

  if (typeof onProgress === 'function') {
    onProgress({ index: entries.length, total: entries.length, nama: '' })
  }

  return summary
}
