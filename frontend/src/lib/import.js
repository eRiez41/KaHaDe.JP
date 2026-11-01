import { fillFromKanji } from './reading-fill.js'
import { hasJapanese } from './kuromoji.js'

const MAX_ROWS = 500
const MAX_TEXT = 200
const MAX_ARTI = 500
const FILL_TIMEOUT = 1500

export const importTemplate = [
  { jepang: '猫', hira: 'ねこ', romaji: 'neko', arti: 'kucing' },
  { jepang: '食べる', hira: 'たべる', romaji: 'taberu', arti: 'makan' },
]

export const kanjiLessonTemplate = [
  { kanji: '日', hira: 'ひ', romaji: 'hi', arti: 'matahari / hari' },
  { kanji: '学校', hira: 'がっこう', romaji: 'gakkou', arti: 'sekolah' },
]

export function extractImportItems(parsed) {
  if (Array.isArray(parsed)) {
    return parsed
  }
  for (const key of ['kosakata', 'items', 'kanjiLessons', 'lessons']) {
    if (Array.isArray(parsed?.[key])) {
      return parsed[key]
    }
  }
  throw new Error('Format JSON tidak dikenali. Gunakan array atau objek dengan field items.')
}

export function parseImportText(text) {
  const value = String(text || '').trim()
  if (!value) {
    throw new Error('JSON masih kosong.')
  }
  let parsed
  try {
    parsed = JSON.parse(value)
  } catch {
    throw new Error('Format JSON tidak valid.')
  }
  const items = extractImportItems(parsed)
  if (items.length === 0) {
    throw new Error('Tidak ada baris kosakata di JSON ini.')
  }
  if (items.length > MAX_ROWS) {
    throw new Error(`Maksimal ${MAX_ROWS} baris per import.`)
  }
  return items
}

function dedupeKey(kanji, arti) {
  return `${kanji.trim().toLowerCase()}\u0000${arti.trim().toLowerCase()}`
}

async function fillReadings(kanji, hira, romaji) {
  let timer
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error('timeout')), FILL_TIMEOUT)
  })

  try {
    const filled = await Promise.race([fillFromKanji(kanji, { hira, romaji }), timeout])
    return { ...filled, timedOut: false }
  } catch {
    return { hira, romaji, timedOut: true }
  } finally {
    clearTimeout(timer)
  }
}

function pushMessage(row, level, message) {
  row.messages.push(message)
  if (level === 'error' || row.level !== 'error') {
    row.level = level
  }
}

export async function prepareImportRows(rawItems, existingItems = [], options = {}) {
  const existingLabel = options.existingLabel || 'bab ini'
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    throw new Error('Tidak ada baris untuk di-import.')
  }
  if (rawItems.length > MAX_ROWS) {
    throw new Error(`Maksimal ${MAX_ROWS} baris per import.`)
  }

  const existingKeys = new Set(
    existingItems.map((item) => dedupeKey(item.kanji || '', item.arti || '')),
  )
  const seen = new Map()
  const rows = []

  for (let index = 0; index < rawItems.length; index += 1) {
    const source = rawItems[index]
    const data = typeof source === 'string' ? { jepang: source } : source || {}
    const kanji = String(data.kanji ?? data.jepang ?? data.japanese ?? '').trim()
    const arti = String(data.arti ?? data.meaning ?? '').trim()
    let hira = String(data.hira ?? data.kana ?? '').trim()
    let romaji = String(data.romaji ?? '').trim()
    const row = {
      index,
      kanji,
      hira,
      romaji,
      arti,
      level: 'valid',
      messages: [],
      selected: true,
      duplicate: false,
    }

    if (!kanji) {
      pushMessage(row, 'error', 'Teks Jepang wajib diisi.')
    }
    if (!arti) {
      pushMessage(row, 'error', 'Arti wajib diisi.')
    }
    if (kanji.length > MAX_TEXT) {
      pushMessage(row, 'error', `Teks Jepang maksimal ${MAX_TEXT} karakter.`)
    }
    if (arti.length > MAX_ARTI) {
      pushMessage(row, 'error', `Arti maksimal ${MAX_ARTI} karakter.`)
    }

    if (row.level !== 'error' && (!hira || !romaji)) {
      const filled = await fillReadings(kanji, hira, romaji)
      hira = filled.hira || hira
      romaji = filled.romaji || romaji
      if (filled.timedOut) {
        pushMessage(row, 'warning', 'Romaji otomatis lambat. Bisa dilengkapi nanti.')
      }
      if (!romaji) {
        pushMessage(row, 'warning', 'Romaji gagal dibuat. Tetap bisa di-import.')
      }
      row.hira = hira
      row.romaji = romaji
    }

    if (row.level !== 'error' && !hasJapanese(kanji)) {
      pushMessage(row, 'warning', 'Tidak ada karakter Jepang.')
    }

    if (row.level !== 'error') {
      const key = dedupeKey(kanji, arti)
      if (seen.has(key)) {
        row.duplicate = true
        pushMessage(row, 'warning', `Duplikat dengan baris #${seen.get(key) + 1}.`)
      } else {
        seen.set(key, index)
      }
      if (existingKeys.has(key)) {
        row.duplicate = true
        pushMessage(row, 'warning', `Sudah ada di ${existingLabel}.`)
      }
    }

    if (row.level === 'error' || row.duplicate) {
      row.selected = false
    }
    rows.push(row)
  }

  return rows
}

export function summarizeRows(rows) {
  return rows.reduce(
    (summary, row) => {
      summary[row.level] += 1
      if (row.duplicate) {
        summary.duplicate += 1
      }
      if (row.selected) {
        summary.selected += 1
      }
      return summary
    },
    { valid: 0, warning: 0, error: 0, duplicate: 0, selected: 0 },
  )
}

export function selectedPayload(rows) {
  return rows
    .filter((row) => row.selected && row.level !== 'error')
    .map((row) => ({
      kanji: row.kanji,
      hira: row.hira,
      romaji: row.romaji,
      arti: row.arti,
    }))
}
