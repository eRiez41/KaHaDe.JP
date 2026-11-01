<script>
  let { result = null, noun = 'kata', onReset, onClose } = $props()
</script>

<div class="space-y-4 py-2">
  <div class="rounded-lg bg-status-ready/10 p-4 text-status-ready">
    <p class="text-title-md">{result?.inserted || 0} {noun} berhasil di-import</p>
    {#if result?.skipped}
      <p class="mt-1 text-body-md">{result.skipped} baris dilewati.</p>
    {/if}
  </div>

  {#if result?.errors?.length}
    <div class="rounded-md bg-status-error-row/50 p-3">
      <p class="text-label-lg text-error">Sebagian baris gagal</p>
      <ul class="mt-1 space-y-1 text-body-md text-on-surface-variant">
        {#each result.errors.slice(0, 5) as item (item.row)}
          <li>Baris {item.row}: {item.message}</li>
        {/each}
      </ul>
    </div>
  {/if}

  <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
    <button type="button" class="btn btn-ghost" onclick={onReset}>Import Lagi</button>
    <button type="button" class="btn btn-primary" onclick={onClose}>Tutup</button>
  </div>
</div>
