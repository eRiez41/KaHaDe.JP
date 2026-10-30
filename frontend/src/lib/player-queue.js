import { buildEntries } from './player-tracks.js'

export function createQueue(items) {
  const queue = []
  let itemTotal = 0

  for (const item of Array.isArray(items) ? items : []) {
    const entries = buildEntries(item, itemTotal)
    if (entries.length > 0) {
      queue.push(...entries)
      itemTotal += 1
    }
  }

  return { queue, itemTotal }
}

export function reindexQueue(queue) {
  const order = new Map()
  for (const entry of queue) {
    if (!order.has(entry.itemId)) {
      order.set(entry.itemId, order.size)
    }
    entry.itemIndex = order.get(entry.itemId)
  }
  return order.size
}

export function getNextTarget(queue, currentIndex, current) {
  if (!current) {
    return -1
  }

  let target = queue.findIndex(
    (entry, index) =>
      index > currentIndex && entry.lang === 'jp' && entry.itemIndex > current.itemIndex,
  )
  if (target === -1) {
    target = queue.findIndex(
      (entry, index) => index > currentIndex && entry.itemIndex > current.itemIndex,
    )
  }
  return target
}

export function getPreviousTarget(queue, currentIndex, current) {
  if (!current) {
    return -1
  }
  if (current.lang === 'id' && currentIndex > 0) {
    return currentIndex - 1
  }

  for (let index = currentIndex - 1; index >= 0; index -= 1) {
    if (queue[index].itemIndex < current.itemIndex && queue[index].lang === 'jp') {
      return index
    }
  }
  return -1
}

export function removeQueueItem(queue, itemId) {
  const removed = queue.filter((entry) => entry.itemId === itemId)
  const next = queue.filter((entry) => entry.itemId !== itemId)
  return {
    removed,
    queue: next,
    itemTotal: reindexQueue(next),
  }
}

export function refreshQueueItem(queue, item) {
  const insertAt = queue.findIndex((entry) => entry.itemId === item.id)
  if (insertAt === -1) {
    return null
  }

  const itemIndex = queue[insertAt].itemIndex
  const entries = buildEntries(item, itemIndex)
  const next = [
    ...queue.slice(0, insertAt),
    ...entries,
    ...queue.slice(insertAt).filter((entry) => entry.itemId !== item.id),
  ]

  return {
    queue: next,
    entries,
    itemTotal: reindexQueue(next),
  }
}
