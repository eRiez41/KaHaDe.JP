import { toRomaji, toHira } from './kuromoji.js'

export async function fillFromKanji(kanji, current = {}) {
  const text = (kanji || '').trim()
  if (!text) {
    return {
      hira: (current.hira || '').trim(),
      romaji: (current.romaji || '').trim(),
    }
  }

  let nextHira = (current.hira || '').trim()
  let nextRomaji = (current.romaji || '').trim()

  try {
    if (!nextHira) {
      const converted = await toHira(text)
      if (converted) {
        nextHira = converted.trim()
      }
    }
  } catch {
    // ignore autofill failures
  }

  try {
    if (!nextRomaji) {
      const source = nextHira || text
      const converted = await toRomaji(source)
      if (converted) {
        nextRomaji = converted.trim()
      }
    }
  } catch {
    // ignore autofill failures
  }

  return { hira: nextHira, romaji: nextRomaji }
}
