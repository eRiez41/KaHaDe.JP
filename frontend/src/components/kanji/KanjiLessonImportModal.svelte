<script>
  import ImportModalShell from '../ImportModalShell.svelte'
  import ImportPreviewStep from '../ImportPreviewStep.svelte'
  import ImportProgressStep from '../ImportProgressStep.svelte'
  import ImportResultStep from '../ImportResultStep.svelte'
  import ImportUploadStep from '../ImportUploadStep.svelte'
  import { importKanjiLessons } from '../../lib/api.js'
  import { kanjiLessonTemplate, parseImportText, prepareImportRows } from '../../lib/import.js'
  import { toast } from '../../lib/toast.svelte.js'

  let {
    open = $bindable(false),
    lessonId = null,
    lessonName = '',
    existingItems = [],
    onImported,
  } = $props()

  let titles = $derived({
    upload: lessonName ? `Import · ${lessonName}` : 'Import Kanji Lesson',
    preview: 'Preview & Validasi',
    importing: 'Mengimport...',
    done: 'Import Selesai',
  })
  const stepNumbers = { upload: 1, preview: 2, importing: 3, done: 4 }

  let step = $state('upload')
  let rawText = $state('')
  let fileName = $state('')
  let parsing = $state(false)
  let parseError = $state('')
  let rows = $state([])
  let importing = $state(false)
  let progress = $state(0)
  let importTotal = $state(0)
  let importError = $state('')
  let result = $state(null)
  let wasOpen = false

  function reset() {
    step = 'upload'
    rawText = ''
    fileName = ''
    parsing = false
    parseError = ''
    rows = []
    importing = false
    progress = 0
    importTotal = 0
    importError = ''
    result = null
  }

  $effect(() => {
    if (open && !wasOpen) {
      reset()
    }
    wasOpen = open
  })

  function close() {
    if (importing || step === 'importing') {
      return
    }
    open = false
    if (step === 'done') {
      setTimeout(reset, 300)
      return
    }
    reset()
  }

  async function handleFile(file) {
    parseError = ''
    if (file.size > 2 * 1024 * 1024) {
      parseError = 'Ukuran file maksimal 2 MB.'
      return
    }
    fileName = file.name
    try {
      rawText = await file.text()
      await parse()
    } catch {
      parseError = 'Gagal membaca file.'
    }
  }

  async function parse() {
    if (parsing) {
      return
    }
    parsing = true
    parseError = ''
    importError = ''
    try {
      const items = parseImportText(rawText)
      rows = await prepareImportRows(items, existingItems, { existingLabel: 'data lesson' })
      step = 'preview'
    } catch (error) {
      parseError = error?.message || 'Gagal memproses JSON.'
    } finally {
      parsing = false
    }
  }

  function toggleRow(index) {
    const row = rows.find((entry) => entry.index === index)
    if (row && row.level !== 'error') {
      row.selected = !row.selected
    }
  }

  function toggleAll(selected) {
    for (const row of rows) {
      if (row.level !== 'error') {
        row.selected = selected
      }
    }
  }

  async function runImport(payload) {
    if (importing || payload.length === 0) {
      return
    }

    importing = true
    importError = ''
    step = 'importing'
    importTotal = payload.length
    progress = 0
    const timer = window.setInterval(() => {
      if (progress < payload.length - 1) {
        progress += 1
      }
    }, 90)

    try {
      const response = await importKanjiLessons(lessonId, payload)
      progress = payload.length
      result = {
        inserted: response?.inserted || 0,
        skipped: response?.skipped || 0,
        errors: response?.errors || [],
      }
      step = 'done'
      toast.success(`${result.inserted} kanji berhasil di-import.`)
      await onImported?.(response)
    } catch (error) {
      importError = error?.message || 'Gagal import JSON.'
      toast.error(importError)
      step = 'preview'
    } finally {
      window.clearInterval(timer)
      importing = false
    }
  }
</script>

<ImportModalShell
  {open}
  title={titles[step]}
  step={stepNumbers[step]}
  closable={step !== 'importing'}
  onClose={close}
>
  {#if step === 'upload'}
    <ImportUploadStep
      bind:rawText
      {fileName}
      {parsing}
      error={parseError}
      template={kanjiLessonTemplate}
      templateFileName="template-import-kanji-lesson.json"
      placeholder={'[{"kanji":"日","hira":"ひ","romaji":"hi","arti":"matahari"}]'}
      onFile={handleFile}
      onParse={parse}
    />
  {:else if step === 'preview'}
    {#if importError}
      <p class="mb-3 rounded-md bg-error/10 px-3 py-2 text-body-md text-error" role="alert">
        {importError}
      </p>
    {/if}
    <ImportPreviewStep
      {rows}
      noun="Kanji"
      onToggleRow={toggleRow}
      onToggleAll={toggleAll}
      onImport={runImport}
      onBack={() => (step = 'upload')}
    />
  {:else if step === 'importing'}
    <ImportProgressStep {progress} total={importTotal} />
  {:else}
    <ImportResultStep {result} noun="kanji" onReset={reset} onClose={close} />
  {/if}
</ImportModalShell>
