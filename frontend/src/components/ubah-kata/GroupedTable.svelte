<script>
  import GroupSection from './GroupSection.svelte'

  let { groups = [], isOpen, isPinned, onToggleGroup, onPin } = $props()
</script>

<section class="uk-card uk-table-card uk-groups-card">
  {#if groups.length}
    {#each groups as group (group.name)}
      <GroupSection
        {group}
        open={isOpen?.(group.name) ?? false}
        onToggle={() => onToggleGroup?.(group.name)}
        {onPin}
        {isPinned}
      />
    {/each}
  {:else}
    <p class="uk-empty">
      Semua pola untuk kata ini sudah tampil di tabel lain, atau belum tersedia untuk kelas
      katanya.
    </p>
  {/if}
</section>
