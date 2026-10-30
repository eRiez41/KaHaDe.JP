import * as api from '../api.js'

export const babStore = $state({
  items: [],
  status: 'idle',
  error: '',
})

export const kosakataStore = $state({
  babId: null,
  bab: null,
  items: [],
  status: 'idle',
  error: '',
})

function errorMessage(error) {
  return error?.message || 'Terjadi kesalahan. Coba lagi.'
}

function countAudioReady(items) {
  return items.filter((item) => item.audioStatus === 'ready').length
}

function syncBabCounts(babId, items) {
  if (kosakataStore.babId !== babId || !kosakataStore.bab) {
    return
  }

  const updated = {
    ...kosakataStore.bab,
    countKosakata: items.length,
    audioReadyCount: countAudioReady(items),
  }
  kosakataStore.bab = updated

  const index = babStore.items.findIndex((item) => item.id === babId)
  if (index !== -1) {
    babStore.items[index] = updated
  }
}

export async function loadBabs() {
  babStore.status = 'loading'
  babStore.error = ''

  try {
    babStore.items = await api.getBabList()
    babStore.status = 'success'
  } catch (error) {
    babStore.items = []
    babStore.error = errorMessage(error)
    babStore.status = 'error'
  }
}

export async function createBab(nama) {
  const bab = await api.createBab({ nama })
  const summary = { ...bab, countKosakata: 0, audioReadyCount: 0 }
  babStore.items = [summary, ...babStore.items]
  return summary
}

export async function renameBab(id, nama) {
  const updated = await api.updateBab(id, { nama })

  const index = babStore.items.findIndex((item) => item.id === id)
  if (index !== -1) {
    babStore.items[index] = updated
  }
  if (kosakataStore.bab?.id === id) {
    kosakataStore.bab = updated
  }
  return updated
}

export async function removeBab(id) {
  await api.deleteBab(id)
  babStore.items = babStore.items.filter((item) => item.id !== id)

  if (kosakataStore.babId === id) {
    resetKosakata()
  }
}

export async function loadBabDetail(id) {
  kosakataStore.babId = id
  kosakataStore.bab = null
  kosakataStore.items = []
  kosakataStore.status = 'loading'
  kosakataStore.error = ''

  try {
    const [bab, items] = await Promise.all([api.getBab(id), api.getKosakataList(id)])
    if (kosakataStore.babId !== id) {
      return
    }
    kosakataStore.bab = bab
    kosakataStore.items = items
    kosakataStore.status = 'success'

    const index = babStore.items.findIndex((item) => item.id === id)
    if (index !== -1) {
      babStore.items[index] = bab
    }
  } catch (error) {
    if (kosakataStore.babId !== id) {
      return
    }
    kosakataStore.status = 'error'
    kosakataStore.error = errorMessage(error)
  }
}

export async function applyGeneratedItems(generatedItems) {
  if (!Array.isArray(generatedItems) || generatedItems.length === 0) {
    return
  }

  const items = [...kosakataStore.items]
  let changed = false

  for (const generated of generatedItems) {
    const index = items.findIndex((item) => item.id === generated.id)
    if (index !== -1) {
      items[index] = generated
      changed = true
    }
  }

  if (!changed) {
    return
  }

  kosakataStore.items = items
  if (kosakataStore.babId != null) {
    syncBabCounts(kosakataStore.babId, items)
  }
}

export async function addKosakata(babId, input) {
  const item = await api.createKosakata(babId, input)
  if (kosakataStore.babId === babId) {
    const items = [...kosakataStore.items, item]
    kosakataStore.items = items
    syncBabCounts(babId, items)
  }
  return item
}

export async function editKosakata(id, patch) {
  const updated = await api.updateKosakata(id, patch)
  const index = kosakataStore.items.findIndex((item) => item.id === id)
  if (index !== -1) {
    const items = [...kosakataStore.items]
    items[index] = updated
    kosakataStore.items = items
    syncBabCounts(kosakataStore.babId, items)
  }
  return updated
}

export async function removeKosakata(id) {
  await api.deleteKosakata(id)
  const items = kosakataStore.items.filter((item) => item.id !== id)
  kosakataStore.items = items
  syncBabCounts(kosakataStore.babId, items)
}

export async function removeManyKosakata(ids) {
  const deleted = []
  const failures = []

  for (const id of ids) {
    try {
      await api.deleteKosakata(id)
      deleted.push(id)
    } catch (error) {
      failures.push({ id, message: errorMessage(error) })
    }
  }

  if (deleted.length > 0) {
    const removed = new Set(deleted)
    const items = kosakataStore.items.filter((item) => !removed.has(item.id))
    kosakataStore.items = items
    syncBabCounts(kosakataStore.babId, items)
  }

  if (failures.length > 0) {
    const error = new Error(`${failures.length} kata gagal dihapus.`)
    error.deleted = deleted
    error.failures = failures
    throw error
  }

  return deleted
}

export function resetKosakata() {
  kosakataStore.babId = null
  kosakataStore.bab = null
  kosakataStore.items = []
  kosakataStore.status = 'idle'
  kosakataStore.error = ''
}
