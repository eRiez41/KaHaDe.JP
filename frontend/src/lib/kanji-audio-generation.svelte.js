import * as api from './api.js'

const generating = $state(new Set())
const state = $state({
  count: 0,
  total: 0,
  failed: [],
})

export const kanjiAudioGeneration = {
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

export function isKanjiGeneratingItem(id) {
  return generating.has(id)
}

async function generateOne(id) {
  const result = await api.generateKanjiTTS([id])
  return {
    items: result?.items || [],
    failed: result?.failed || [],
  }
}

export async function generateKanjiAudio(ids) {
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
