export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.style.display = 'none'
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function downloadJSON(data, filename) {
  downloadBlob(
    new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }),
    filename,
  )
}

export function filenameFromDisposition(header, fallback) {
  const disposition = header || ''
  const match = disposition.match(/filename="?([^";]+)"?/)
  return match?.[1] || fallback
}
