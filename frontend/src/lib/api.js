import { downloadBlob, filenameFromDisposition } from './download.js'

const API_URL = (import.meta.env?.VITE_API_URL || '').replace(/\/+$/, '')

export const API_BASE_URL = API_URL

export class ApiError extends Error {
  constructor(message, code = 'UNKNOWN_ERROR', status = 0, details = []) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.status = status
    this.details = details
  }
}

async function request(path, { method = 'GET', body } = {}) {
  let response

  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new ApiError(
      'Tidak bisa terhubung ke backend. Pastikan server Go sedang berjalan.',
      'NETWORK_ERROR',
    )
  }

  if (response.status === 204) {
    return null
  }

  let payload = null
  try {
    payload = await response.json()
  } catch {
    payload = null
  }

  if (!response.ok || !payload || payload.success !== true) {
    throw new ApiError(
      payload?.error?.message || `Request gagal (HTTP ${response.status})`,
      payload?.error?.code || 'HTTP_ERROR',
      response.status,
      payload?.error?.details || [],
    )
  }

  return payload.data
}

export const getHealth = () => request('/api/health')

export const lookupWord = (q) => request(`/api/lookup?q=${encodeURIComponent(q)}`)

export const generateTTS = (ids) => request('/api/tts/generate', { method: 'POST', body: { ids } })

export const audioURL = (id, lang) => `${API_URL}/api/audio/${id}/${lang}`
export const downloadBabAudio = (babId) =>
  fetch(`${API_URL}/api/download/audio/${babId}`, { method: 'POST' })
    .then(async (res) => {
      if (!res.ok) {
        let msg = 'Gagal download audio gabungan'
        try {
          const data = await res.json()
          msg = data?.error?.message || msg
        } catch {
          // ignore
        }
        throw new ApiError(msg, 'DOWNLOAD_ERROR', res.status)
      }
      const blob = await res.blob()
      const disposition = res.headers.get('Content-Disposition') || ''
      const filename = filenameFromDisposition(disposition, `bab-${babId}-audio.mp3`)
      downloadBlob(blob, filename)
      return filename
    })

export async function exportBab(babId) {
  let response
  try {
    response = await fetch(`${API_URL}/api/export/bab/${babId}`)
  } catch {
    throw new ApiError('Tidak bisa terhubung ke backend.', 'NETWORK_ERROR')
  }
  if (!response.ok) {
    throw new ApiError(`Gagal export bab (HTTP ${response.status})`, 'EXPORT_ERROR', response.status)
  }
  const data = await response.json()
  const filename = filenameFromDisposition(
    response.headers.get('Content-Disposition') || '',
    `bab-${babId}.json`,
  )
  return { data, filename }
}
export const getBabList = () => request('/api/bab')
export const getBab = (id) => request(`/api/bab/${id}`)
export const createBab = (data) => request('/api/bab', { method: 'POST', body: data })
export const updateBab = (id, data) => request(`/api/bab/${id}`, { method: 'PATCH', body: data })
export const deleteBab = (id) => request(`/api/bab/${id}`, { method: 'DELETE' })

export const getKosakataList = (babId) => request(`/api/bab/${babId}/kosakata`)
export const createKosakata = (babId, data) =>
  request(`/api/bab/${babId}/kosakata`, { method: 'POST', body: data })
export const updateKosakata = (id, data) =>
  request(`/api/kosakata/${id}`, { method: 'PATCH', body: data })
export const deleteKosakata = (id) => request(`/api/kosakata/${id}`, { method: 'DELETE' })
export const importKosakata = (babId, kosakata) =>
  request(`/api/bab/${babId}/import`, { method: 'POST', body: { kosakata } })

export const getLessons = () => request('/api/lessons')
export const createLesson = (data) => request('/api/lessons', { method: 'POST', body: data })
export const updateLesson = (id, data) =>
  request(`/api/lessons/${id}`, { method: 'PATCH', body: data })
export const deleteLesson = (id) => request(`/api/lessons/${id}`, { method: 'DELETE' })

export const getKanjiLessons = (lessonId) =>
  request(`/api/kanji-lessons${lessonId ? `?lessonId=${lessonId}` : ''}`)
export const createKanjiLesson = (data) =>
  request('/api/kanji-lessons', { method: 'POST', body: data })
export const updateKanjiLesson = (id, data) =>
  request(`/api/kanji-lessons/${id}`, { method: 'PATCH', body: data })
export const deleteKanjiLesson = (id) =>
  request(`/api/kanji-lessons/${id}`, { method: 'DELETE' })
export const importKanjiLessons = (lessonId, items) =>
  request('/api/kanji-lessons/import', { method: 'POST', body: { lessonId, items } })
