let nextId = 0

export const toasts = $state([])

export function dismissToast(id) {
  const index = toasts.findIndex((item) => item.id === id)
  if (index !== -1) {
    toasts.splice(index, 1)
  }
}

export function pushToast(message, type = 'info', duration = 3500) {
  if (!message) {
    return null
  }

  const id = ++nextId
  toasts.push({ id, message, type })
  if (duration > 0) {
    window.setTimeout(() => dismissToast(id), duration)
  }
  return id
}

let loadingToastId = null

export const toast = {
  success(message) {
    pushToast(message, 'success')
  },
  error(message) {
    pushToast(message, 'error', 5000)
  },
  info(message) {
    pushToast(message, 'info')
  },
  loading(message) {
    if (loadingToastId) {
      dismissToast(loadingToastId)
    }
    loadingToastId = pushToast(message, 'info', 0)
    return loadingToastId
  },
  dismiss(id) {
    if (id) {
      dismissToast(id)
      if (loadingToastId === id) {
        loadingToastId = null
      }
      return
    }
    if (loadingToastId) {
      dismissToast(loadingToastId)
      loadingToastId = null
    }
  },
}
