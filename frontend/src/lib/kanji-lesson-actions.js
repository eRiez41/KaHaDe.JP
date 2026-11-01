import { deleteKanjiLesson, deleteLesson } from './api.js'
import { toast } from './toast.svelte.js'

export function confirmDeleteKanji(item, onDeleted) {
  window.dispatchEvent(
    new CustomEvent('open-confirm', {
      detail: {
        title: 'Hapus kanji lesson?',
        message: `"${item.kanji}" (${item.arti}) akan dihapus permanen.`,
        confirmLabel: 'Hapus Kanji',
        onConfirm: async () => {
          await deleteKanjiLesson(item.id)
          await onDeleted?.()
          toast.success(`"${item.kanji}" dihapus.`)
        },
      },
    }),
  )
}

export function confirmDeleteLesson(lesson, onDeleted) {
  window.dispatchEvent(
    new CustomEvent('open-confirm', {
      detail: {
        title: 'Hapus lesson?',
        message: `Lesson "${lesson.nama}" beserta ${lesson.countKanji} kanji akan dihapus permanen.`,
        confirmLabel: 'Hapus Lesson',
        onConfirm: async () => {
          await deleteLesson(lesson.id)
          await onDeleted?.(lesson)
          toast.success(`Lesson "${lesson.nama}" dihapus.`)
        },
      },
    }),
  )
}
