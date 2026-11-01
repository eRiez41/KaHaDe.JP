import { getKanjiLessons, getLessons } from './api.js'

class KanjiLessonStore {
  lessons = $state([])
  items = $state([])
  status = $state('loading')
  error = $state('')
  search = $state('')
  page = $state(1)
  selectedLessonId = $state('all')
  pageSize = 50

  get selectedLesson() {
    if (this.selectedLessonId === 'all') {
      return null
    }
    return this.lessons.find((lesson) => String(lesson.id) === this.selectedLessonId) || null
  }

  get scoped() {
    return this.selectedLesson
      ? this.items.filter((item) => item.lessonId === this.selectedLesson.id)
      : this.items
  }

  get filtered() {
    const query = this.search.trim().toLowerCase()
    if (!query) {
      return this.scoped
    }
    return this.scoped.filter((item) =>
      [item.kanji, item.hira, item.romaji, item.arti].some((value) =>
        String(value || '').toLowerCase().includes(query),
      ),
    )
  }

  get totalPages() {
    return Math.max(1, Math.ceil(this.filtered.length / this.pageSize))
  }

  get paged() {
    return this.filtered.slice((this.page - 1) * this.pageSize, this.page * this.pageSize)
  }

  get showLessonColumn() {
    return this.selectedLessonId === 'all'
  }

  get defaultLessonId() {
    return this.selectedLesson?.id || this.lessons[0]?.id || null
  }

  get targetItems() {
    return this.selectedLesson
      ? this.items.filter((item) => item.lessonId === this.selectedLesson.id)
      : []
  }

  get flashcardTitle() {
    return `Flashcard Kanji Lesson · ${this.selectedLesson?.nama || 'Semua Lesson'}`
  }

  resetPage() {
    this.page = 1
  }

  clampPage() {
    if (this.page > this.totalPages) {
      this.page = this.totalPages
    }
  }

  async load({ silent = false } = {}) {
    if (!silent) {
      this.status = 'loading'
    }
    this.error = ''
    try {
      const [lessonList, lessonItems] = await Promise.all([getLessons(), getKanjiLessons()])
      this.lessons = lessonList
      this.items = lessonItems
      if (
        this.selectedLessonId !== 'all' &&
        !lessonList.some((lesson) => String(lesson.id) === this.selectedLessonId)
      ) {
        this.selectedLessonId = 'all'
      }
      this.status = 'success'
    } catch (loadError) {
      this.error = loadError?.message || 'Gagal memuat kanji lesson.'
      this.status = 'error'
    }
  }
}

export function createKanjiLessonStore() {
  return new KanjiLessonStore()
}
