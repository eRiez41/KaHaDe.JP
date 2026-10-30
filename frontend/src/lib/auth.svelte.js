const SESSION_KEY = 'kahade-admin-session'
const PASSWORD = 'admin'

export const auth = $state({
  isAdmin: false,
  checked: false,
})

export function initAuth() {
  if (auth.checked) {
    return auth.isAdmin
  }
  try {
    auth.isAdmin = sessionStorage.getItem(SESSION_KEY) === '1'
  } catch {
    auth.isAdmin = false
  }
  auth.checked = true
  return auth.isAdmin
}

export function login(password) {
  const value = String(password || '').trim()
  if (value === PASSWORD) {
    try {
      sessionStorage.setItem(SESSION_KEY, '1')
    } catch {
      // ignore
    }
    auth.isAdmin = true
    return true
  }
  return false
}

export function logout() {
  try {
    sessionStorage.removeItem(SESSION_KEY)
  } catch {
    // ignore
  }
  auth.isAdmin = false
}
