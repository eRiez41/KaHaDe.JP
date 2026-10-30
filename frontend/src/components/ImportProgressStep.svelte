<script>
  let { progress = 0, total = 0 } = $props()

  const percent = $derived(total ? (progress / total) * 100 : 0)
</script>

<div class="space-y-4 py-6 text-center" aria-live="polite">
  <p class="text-body-lg font-medium">Menyimpan kosakata...</p>
  <div class="mx-auto h-2 max-w-md overflow-hidden rounded-full bg-surface-container">
    <div
      class="h-full rounded-full bg-primary transition-all duration-200"
      style={`width: ${percent}%`}
    ></div>
  </div>
  <p class="text-body-md tabular-nums text-on-surface-variant">{progress}/{total}</p>
  <p class="text-label-md text-on-surface-variant">
    Modal tidak bisa ditutup selama proses import.
  </p>
</div>
