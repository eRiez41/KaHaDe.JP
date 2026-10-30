let modalOpen = $state(false)

export const generateUi = {
  get open() {
    return modalOpen
  },
  openModal() {
    modalOpen = true
  },
  closeModal() {
    modalOpen = false
  },
  toggle() {
    modalOpen = !modalOpen
  },
}
