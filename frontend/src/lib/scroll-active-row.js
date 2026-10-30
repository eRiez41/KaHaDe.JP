// Scrolls a table container just enough to reveal `row`, accounting for a
// sticky header. The page itself is never scrolled.
export function keepRowVisible(shell, row, { padding = 12 } = {}) {
  const header = shell.querySelector('thead')
  const shellRect = shell.getBoundingClientRect()
  const rowRect = row.getBoundingClientRect()
  const headerHeight = header ? header.getBoundingClientRect().height : 0
  const topLimit = shellRect.top + headerHeight + padding
  const bottomLimit = shellRect.bottom - padding

  let delta = 0
  if (rowRect.top < topLimit) {
    delta = rowRect.top - topLimit
  } else if (rowRect.bottom > bottomLimit) {
    delta = rowRect.bottom - bottomLimit
  }
  if (delta === 0) return

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  shell.scrollTo({
    top: shell.scrollTop + delta,
    behavior: reduceMotion ? 'auto' : 'smooth',
  })
}
