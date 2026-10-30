import { toRomaji } from './kuromoji.js'

const DEBOUNCE_MS = 250

class RomajiAutofill {
  touched = $state(false)
  busy = $state(false)
  notice = $state('')

  #getSource
  #setResult
  #timer = null
  #requestId = 0

  constructor(getSource, setResult) {
    this.#getSource = getSource
    this.#setResult = setResult
  }

  schedule() {
    if (this.touched) {
      return
    }

    clearTimeout(this.#timer)
    this.#timer = setTimeout(() => this.generate(), DEBOUNCE_MS)
  }

  async generate() {
    const text = this.#getSource()
    const current = ++this.#requestId

    if (!text) {
      if (!this.touched) {
        this.#setResult('')
      }
      this.busy = false
      this.notice = ''
      return
    }

    this.busy = true
    this.notice = ''

    try {
      const result = await toRomaji(text)
      if (current === this.#requestId && !this.touched) {
        this.#setResult(result)
      }
    } catch {
      if (current === this.#requestId) {
        this.notice = 'Gagal membuat romaji otomatis. Isi manual.'
      }
    } finally {
      if (current === this.#requestId) {
        this.busy = false
      }
    }
  }

  markManual() {
    this.touched = true
    this.busy = false
    this.notice = ''
    clearTimeout(this.#timer)
    this.#requestId += 1
  }

  reset() {
    this.touched = false
    this.busy = false
    this.notice = ''
    clearTimeout(this.#timer)
    this.#requestId += 1
  }

  dispose() {
    clearTimeout(this.#timer)
    this.#requestId += 1
  }
}

export function createRomajiAutofill(getSource, setResult) {
  return new RomajiAutofill(getSource, setResult)
}
