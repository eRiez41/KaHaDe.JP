import { derived, get, writable } from 'svelte/store'

const initialState = {
  status: 'hidden',
  playing: false,
  loading: false,
  current: null,
  queue: [],
  currentIndex: -1,
  position: 0,
  total: 0,
  currentTime: 0,
  duration: 0,
  progress: 0,
  speed: 1,
  volume: 1,
  error: '',
}

export const playerState = writable({ ...initialState })

export const currentTrack = derived(playerState, (state) => state.current)
export const progress = derived(playerState, (state) => state.progress)

export function updatePlayerState(patch) {
  playerState.update((state) => ({ ...state, ...patch }))
}

export function resetPlayerState(patch = {}) {
  playerState.set({ ...initialState, ...patch })
}

export function getPlayerState() {
  return get(playerState)
}
