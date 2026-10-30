import './styles/app.css'
import { mount } from 'svelte'
import Alpine from 'alpinejs'

import App from './App.svelte'
import { registerModals } from './lib/modals.js'

const target = document.getElementById('app')

if (!target) {
  throw new Error('Root element #app not found')
}

registerModals()
window.Alpine = Alpine

const app = mount(App, { target })
Alpine.start()

// The splash lives outside #app so Svelte never has to know about it.
// Keep it visible long enough to read as an opening animation, then fade out.
const splash = document.getElementById('boot-splash')

if (splash) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const elapsed = performance.now() - (window.__bootAt ?? 0)
  const wait = reducedMotion ? 0 : Math.max(0, 420 - elapsed)

  setTimeout(() => {
    splash.classList.add('boot-done')
    splash.addEventListener('transitionend', () => splash.remove(), { once: true })
    // Fallback in case the transition never fires (e.g. element hidden early).
    setTimeout(() => splash.remove(), 800)
  }, wait)
}

export default app
