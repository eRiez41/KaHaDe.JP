import { editKosakata, kosakataStore } from './stores/data.svelte.js'
import { fillFromKanji } from './reading-fill.js'
import * as api from './api.js'

const generating = $state(new Set())
const state = $state({
  count: 0,
  total: 0,
  failed: [],
})

export const audioGeneration = {
  get isGenerating() {
    return generating.size > 0
  },
  get count() {
    return state.count
  },
  get total() {
    return state.total
  },
  get progress() {
    if (state.total === 0) {
      return 0
    }
    return Math.round((state.count / state.total) * 100)
  },
  get failed() {
    return state.failed
  },
}

export function isGeneratingItem(id) {
  return generating.has(id)
}

async function fillReadings(item) {
  if (item.hira?.trim() && item.romaji?.trim()) {
    return
  }

  const filled = await fillFromKanji(item.kanji || item.hira, {
    hira: item.hira,
    romaji: item.romaji,
  })

  const patch = {}
  if (!item.hira?.trim() && filled.hira) {
    patch.hira = filled.hira
  }
  if (!item.romaji?.trim() && filled.romaji) {
    patch.romaji = filled.romaji
  }
  if (Object.keys(patch).length === 0) {
    return
  }

  try {
    const updated = await editKosakata(item.id, patch)
    item.hira = updated.hira
    item.romaji = updated.romaji
  } catch {
    // audio can still be generated from the kanji text
  }
}

async function generateOne(id) {
  const item = kosakataStore.items.find((entry) => entry.id === id)
  if (item) {
    await fillReadings(item)
  }

  const result = await api.generateTTS([id])
  return {
    items: result?.items || [],
    failed: result?.failed || [],
  }
}

export async function generateAudio(ids) {
  const requested = Array.isArray(ids) ? ids.filter((value) => value != null) : []
  const unique = [...new Set(requested)].filter((id) => !generating.has(id))

  if (unique.length === 0) {
    return { items: [], failed: [] }
  }

  for (const id of unique) {
    generating.add(id)
  }

  state.count = 0
  state.total = unique.length
  state.failed = []

  const items = []
  const failed = []

  try {
    for (const id of unique) {
      try {
        const result = await generateOne(id)
        items.push(...result.items)
        failed.push(...result.failed)
      } catch (error) {
        failed.push({
          id,
          message: error?.message || 'Gagal generate audio.',
        })
        if (error?.code === 'NETWORK_ERROR') {
          break
        }
      } finally {
        generating.delete(id)
        state.count += 1
      }
    }

    state.failed = failed
    return { items, failed }
  } finally {
    for (const id of unique) {
      generating.delete(id)
    }
    state.count = 0
    state.total = 0
  }
}
