<script>
  import ConjugationTabs from '../components/ubah-kata/ConjugationTabs.svelte'
  import GroupedTable from '../components/ubah-kata/GroupedTable.svelte'
  import InputSection from '../components/ubah-kata/InputSection.svelte'
  import MainTable from '../components/ubah-kata/MainTable.svelte'
  import PinnedTable from '../components/ubah-kata/PinnedTable.svelte'
  import SummaryCard from '../components/ubah-kata/SummaryCard.svelte'
  import { analyzeWord } from '../lib/conjugation/index.js'
  import { toast } from '../lib/toast.svelte.js'
  import '../styles/ubah-kata.css'

  const MAX_PINS = 10
  const DEFAULT_OPEN = []

  let input = $state('')
  let loading = $state(false)
  let error = $state('')
  let result = $state(null)
  let activeIndex = $state(0)
  let pinned = $state({})
  let openGroups = $state({})

  const active = $derived(result?.candidates?.[activeIndex] ?? null)
  const activeKey = $derived(`${activeIndex}`)
  const pinnedIds = $derived(active ? (pinned[activeKey] ?? []) : [])
  const pinnedRows = $derived(
    active ? active.patterns.filter((row) => pinnedIds.includes(row.id)) : [],
  )
  const openNames = $derived(active ? (openGroups[activeKey] ?? DEFAULT_OPEN) : DEFAULT_OPEN)
  const mainForms = $derived(new Set((active?.primary ?? []).map((row) => row.jp)))
  const availableGroups = $derived.by(() => {
    if (!active) return []
    const pinnedSet = new Set(pinnedIds)
    return active.groups
      .map((group) => ({
        name: group.name,
        rows: group.rows.filter(
          (row) => !pinnedSet.has(row.id) && !mainForms.has(row.jp),
        ),
      }))
      .filter((group) => group.rows.length > 0)
  })

  async function runAnalyze(raw) {
    const value = (raw ?? input).trim()
    if (!value) {
      error = 'Masukkan kata yang ingin dianalisis.'
      return
    }
    if (value.length > 50) {
      error = 'Input terlalu panjang. Maksimal 50 karakter.'
      return
    }

    error = ''
    loading = true
    try {
      const next = await analyzeWord(value)
      result = next
      activeIndex = next.active ?? 0
      pinned = {}
      openGroups = {}
      requestAnimationFrame(() => {
        document.getElementById('uk-result')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    } catch (e) {
      result = null
      error = e?.message || 'Gagal menganalisis kata.'
      toast.error(error)
    } finally {
      loading = false
    }
  }

  function useExample(example) {
    input = example
    runAnalyze(example)
  }

  function selectCandidate(index) {
    activeIndex = index
  }

  function isPinned(id) {
    return pinnedIds.includes(id)
  }

  function togglePin(id) {
    const current = pinned[activeKey] ?? []
    const next = current.includes(id)
      ? current.filter((item) => item !== id)
      : [...current, id]
    if (next.length > MAX_PINS) {
      toast.info(`Maksimal ${MAX_PINS} bentuk boleh disematkan.`)
      return
    }
    pinned = { ...pinned, [activeKey]: next }
  }

  function isOpen(name) {
    return openNames.includes(name)
  }

  function toggleGroup(name) {
    const current = openGroups[activeKey] ?? DEFAULT_OPEN
    const next = current.includes(name)
      ? current.filter((item) => item !== name)
      : [...current, name]
    openGroups = { ...openGroups, [activeKey]: next }
  }
</script>

<section class="uk-page">
  <header class="mb-6 space-y-2">
    <h1 class="text-headline-lg font-bold tracking-tight">Perubahan Kata</h1>
    <p class="max-w-2xl text-body-md text-on-surface-variant">
      Masukkan satu kata Jepang dalam bentuk apa pun. Sistem mendeteksi kelas kata dan golongan
      verba, lalu menampilkan bentuk sopan, biasa, serta pola Minna no Nihongo Bab 1–20.
    </p>
  </header>

  <InputSection
    bind:value={input}
    {loading}
    onAnalyze={() => runAnalyze()}
    onExample={useExample}
  />

  {#if error}
    <div class="uk-error" role="alert">{error}</div>
  {/if}

  {#if loading}
    <div class="uk-loading" role="status">Mencari kata di kamus…</div>
  {/if}

  {#if result?.candidates?.length}
    <div id="uk-result">
      <ConjugationTabs
        candidates={result.candidates}
        active={activeIndex}
        onChange={selectCandidate}
      />

      {#if active}
        <SummaryCard analysis={active} input={result.input} />
        <MainTable rows={active.primary} meaning={active.meaning} classType={active.classType} />
        <PinnedTable rows={pinnedRows} onUnpin={togglePin} />
        <GroupedTable
          groups={availableGroups}
          isOpen={isOpen}
          isPinned={isPinned}
          onToggleGroup={toggleGroup}
          onPin={togglePin}
        />
      {/if}
    </div>
  {/if}
</section>
