<script>
  import KanjiLessonFormModal from './KanjiLessonFormModal.svelte'
  import KanjiLessonImportModal from './KanjiLessonImportModal.svelte'
  import LessonFormModal from './LessonFormModal.svelte'

  let {
    formOpen = $bindable(false),
    item = null,
    lessons = [],
    defaultLessonId = null,
    importOpen = $bindable(false),
    targetLessonId = null,
    targetLessonName = '',
    existingItems = [],
    lessonFormOpen = $bindable(false),
    lessonItem = null,
    onCloseForm,
    onSavedForm,
    onCloseLesson,
    onSavedLesson,
    onImported,
  } = $props()
</script>

<KanjiLessonFormModal
  open={formOpen}
  {item}
  {lessons}
  {defaultLessonId}
  onClose={onCloseForm}
  onSaved={onSavedForm}
/>

<LessonFormModal
  open={lessonFormOpen}
  item={lessonItem}
  onClose={onCloseLesson}
  onSaved={onSavedLesson}
/>

<KanjiLessonImportModal
  bind:open={importOpen}
  lessonId={targetLessonId}
  lessonName={targetLessonName}
  {existingItems}
  onImported={onImported}
/>
