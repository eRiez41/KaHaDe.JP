import Alpine from 'alpinejs'

import { createBab, renameBab } from './stores/data.svelte.js'

function registerBabFormModal() {
  Alpine.data('babFormModal', () => ({
    open: false,
    mode: 'create',
    babId: null,
    nama: '',
    error: '',
    submitting: false,
    onSuccess: null,

    init() {
      this.handleOpen = (event) => this.openForm(event.detail || {})
      this.handleClose = () => this.close()
      this.handleKeydown = (event) => {
        if (event.key === 'Escape' && this.open) {
          this.close()
        }
      }
      this.handleSubmit = (event) => {
        event.preventDefault()
        this.submit()
      }
      window.addEventListener('open-bab-form', this.handleOpen)
      document.addEventListener('keydown', this.handleKeydown)
      this.$el
        .querySelectorAll('[data-modal-close]')
        .forEach((el) => el.addEventListener('click', this.handleClose))
      this.$el
        .querySelector('[data-modal-form]')
        ?.addEventListener('submit', this.handleSubmit)
    },

    destroy() {
      window.removeEventListener('open-bab-form', this.handleOpen)
      document.removeEventListener('keydown', this.handleKeydown)
      this.$el
        .querySelectorAll('[data-modal-close]')
        .forEach((el) => el.removeEventListener('click', this.handleClose))
      this.$el
        .querySelector('[data-modal-form]')
        ?.removeEventListener('submit', this.handleSubmit)
    },

    openForm(detail) {
      this.mode = detail.mode === 'rename' ? 'rename' : 'create'
      this.babId = detail.id ?? null
      this.nama = detail.nama ?? ''
      this.onSuccess = typeof detail.onSuccess === 'function' ? detail.onSuccess : null
      this.error = ''
      this.submitting = false
      this.open = true
      this.$nextTick(() => this.$refs.namaInput?.focus())
    },

    close() {
      if (!this.submitting) {
        this.open = false
      }
    },

    async submit() {
      if (this.submitting) {
        return
      }

      const nama = this.nama.trim()
      if (!nama) {
        this.error = 'Nama bab wajib diisi'
        this.$refs.namaInput?.focus()
        return
      }

      this.submitting = true
      this.error = ''

      try {
        if (this.mode === 'create') {
          const bab = await createBab(nama)
          this.open = false
          this.onSuccess?.(bab)
          window.location.hash = `#bab/${bab.id}`
        } else {
          const updated = await renameBab(this.babId, nama)
          this.open = false
          this.onSuccess?.(updated)
        }
      } catch (error) {
        this.error = error?.message || 'Gagal menyimpan bab'
      } finally {
        this.submitting = false
      }
    },
  }))
}

function registerConfirmModal() {
  Alpine.data('confirmModal', () => ({
    open: false,
    title: '',
    message: '',
    confirmLabel: 'Hapus',
    error: '',
    busy: false,
    action: null,

    init() {
      this.handleOpen = (event) => this.openConfirm(event.detail || {})
      this.handleClose = () => this.close()
      this.handleKeydown = (event) => {
        if (event.key === 'Escape' && this.open) {
          this.close()
        }
      }
      this.handleConfirm = () => this.confirm()
      window.addEventListener('open-confirm', this.handleOpen)
      document.addEventListener('keydown', this.handleKeydown)
      this.$el
        .querySelectorAll('[data-modal-close]')
        .forEach((el) => el.addEventListener('click', this.handleClose))
      this.$el
        .querySelector('[data-modal-confirm]')
        ?.addEventListener('click', this.handleConfirm)
    },

    destroy() {
      window.removeEventListener('open-confirm', this.handleOpen)
      document.removeEventListener('keydown', this.handleKeydown)
      this.$el
        .querySelectorAll('[data-modal-close]')
        .forEach((el) => el.removeEventListener('click', this.handleClose))
      this.$el
        .querySelector('[data-modal-confirm]')
        ?.removeEventListener('click', this.handleConfirm)
    },

    openConfirm(detail) {
      this.title = detail.title || 'Hapus data?'
      this.message = detail.message || 'Tindakan ini tidak bisa dibatalkan.'
      this.confirmLabel = detail.confirmLabel || 'Hapus'
      this.action = typeof detail.onConfirm === 'function' ? detail.onConfirm : null
      this.error = ''
      this.busy = false
      this.open = true
      this.$nextTick(() => this.$refs.confirmButton?.focus())
    },

    close() {
      if (!this.busy) {
        this.open = false
      }
    },

    async confirm() {
      if (!this.action || this.busy) {
        return
      }

      this.busy = true
      this.error = ''

      try {
        await this.action()
        this.open = false
      } catch (error) {
        this.error = error?.message || 'Tindakan gagal. Coba lagi.'
      } finally {
        this.busy = false
      }
    },
  }))
}

export function registerModals() {
  registerBabFormModal()
  registerConfirmModal()
  return Alpine
}
