<script>
  import { importTemplate } from '../lib/import.js'
  import { downloadJSON } from '../lib/download.js'

  let {
    rawText = $bindable(''),
    fileName = '',
    parsing = false,
    error = '',
    template = importTemplate,
    templateFileName = 'template-import-kosakata.json',
    placeholder = '[{"jepang":"猫","hira":"ねこ","arti":"kucing"}]',
    onFile,
    onParse,
  } = $props()

  let dragging = $state(false)

  function pickFile(event) {
    const file = event.currentTarget.files?.[0]
    if (file) {
      onFile(file)
    }
    event.currentTarget.value = ''
  }

  function dropFile(event) {
    event.preventDefault()
    dragging = false
    const file = event.dataTransfer?.files?.[0]
    if (file) {
      onFile(file)
    }
  }

  function downloadTemplate() {
    downloadJSON(template, templateFileName)
  }
</script>

<div class="space-y-4">
  <div
    class="rounded-lg border-2 border-dashed p-5 text-center transition {dragging
      ? 'border-primary bg-primary/5'
      : 'border-outline-variant bg-surface-container'}"
    role="region"
    aria-label="Area upload file JSON"
    ondragover={(event) => {
      event.preventDefault()
      dragging = true
    }}
    ondragleave={() => (dragging = false)}
    ondrop={dropFile}
  >
    <svg viewBox="0 0 24 24" class="mx-auto h-10 w-10 text-on-surface-variant" fill="currentColor" aria-hidden="true">
      <path d="M12 3a4 4 0 0 1 4 4v1h1a3 3 0 0 1 0 6h-3v5a1 1 0 1 1-2 0v-5H9a3 3 0 1 1 0-6h1V7a4 4 0 0 1 4-4Z" />
    </svg>
    <p class="mt-2 text-body-md font-medium">Tarik file JSON ke sini</p>
    <p class="mt-1 text-label-md text-on-surface-variant">{fileName || 'atau pilih file dari perangkat'}</p>
    <label class="btn btn-tonal mt-3 cursor-pointer">
      Pilih File
      <input type="file" accept="application/json,.json" class="sr-only" onchange={pickFile} />
    </label>
  </div>

  <div class="space-y-1.5">
    <label for="import-json" class="label">Atau paste JSON</label>
    <textarea
      id="import-json"
      bind:value={rawText}
      rows="8"
      spellcheck="false"
      class="field min-h-40 resize-y py-3 font-mono text-body-md"
      {placeholder}
    ></textarea>
  </div>

  {#if error}
    <p class="rounded-md bg-error/10 px-3 py-2 text-body-md text-error" role="alert">{error}</p>
  {/if}

  <div class="flex flex-wrap items-center gap-2">
    <button type="button" class="btn btn-primary" onclick={onParse} disabled={parsing || !rawText.trim()}>
      {parsing ? 'Memeriksa...' : 'Parse & Lanjut'}
    </button>
    <button type="button" class="btn btn-ghost" onclick={downloadTemplate}>
      Download Template
    </button>
  </div>
</div>
