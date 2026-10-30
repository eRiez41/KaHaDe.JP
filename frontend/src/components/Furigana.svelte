<script>
  import { romajiOf, rubySegments } from '../lib/furigana.js'

  let { text = '', class: className = '' } = $props()

  const parsed = $derived.by(() => {
    const segments = rubySegments(text)
    // null means the text is kana-only, so romaji is shown as its reading.
    if (segments === null) {
      const romaji = romajiOf(text)
      return romaji ? { kind: 'kana', romaji } : { kind: 'plain' }
    }
    return { kind: 'segments', segments }
  })
</script>

<span class="jp-ruby {className}">
  {#if parsed.kind === 'segments'}
    {#each parsed.segments as segment}
      {#if Array.isArray(segment)}
        <ruby>{segment[0]}<rt>{segment[1]}</rt></ruby>
      {:else}
        {segment}
      {/if}
    {/each}
  {:else if parsed.kind === 'kana'}
    <ruby>{text}<rt>{parsed.romaji}</rt></ruby>
  {:else}
    {text}
  {/if}
</span>
