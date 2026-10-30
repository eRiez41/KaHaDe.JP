<script>
  import Furigana from '../Furigana.svelte'

  let show = $state(true)
</script>

<section class="card space-y-3 p-4 sm:p-5">
  <button type="button" class="flex w-full items-center justify-between text-left" onclick={() => (show = !show)}>
    <h2 class="text-title-md font-bold">Apa itu bentuk ない?</h2>
    <svg
      viewBox="0 0 20 20"
      class="h-5 w-5 transition-transform {show ? 'rotate-180' : ''}"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z"
      />
    </svg>
  </button>

  {#if show}
    <div class="space-y-3 text-body-md text-on-surface-variant">
      <p>
        Bentuk ない adalah bentuk negatif biasa (non-sopan). Dipakai saat berbicara dengan teman
        atau keluarga, dan menjadi dasar pola seperti ~ないでください (tolong jangan),
        ~なければなりません (harus), serta ~なくてもいいです (tidak perlu).
      </p>

      <div class="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div class="rounded-lg border border-outline-variant p-3">
          <p class="font-semibold text-on-surface">
            Golongan I (<Furigana text="五段" /> / Godan)
          </p>
          <p class="mt-1">Akhiran i-dan diubah ke a-dan, lalu tambah ない</p>
          <p class="mt-1 flex flex-wrap items-center gap-1">
            Contoh:
            <Furigana text="書きます" />→<Furigana text="書かない" />,
            <Furigana text="飲みます" />→<Furigana text="飲まない" />,
            <Furigana text="買います" />→<Furigana text="買わない" />
          </p>
        </div>
        <div class="rounded-lg border border-outline-variant p-3">
          <p class="font-semibold text-on-surface">
            Golongan II (<Furigana text="一段" /> / Ichidan)
          </p>
          <p class="mt-1">Buang ます, lalu tambah ない</p>
          <p class="mt-1 flex flex-wrap items-center gap-1">
            Contoh:
            <Furigana text="食べます" />→<Furigana text="食べない" />,
            <Furigana text="見ます" />→<Furigana text="見ない" />
          </p>
        </div>
        <div class="rounded-lg border border-outline-variant p-3">
          <p class="font-semibold text-on-surface">
            Golongan III (<Furigana text="不規則" /> / Irregular)
          </p>
          <p class="mt-1 flex flex-wrap items-center gap-1">
            <Furigana text="します" />→<Furigana text="しない" />,
            <Furigana text="来ます" />→<Furigana text="来ない" />
          </p>
          <p class="mt-1">Wajib hafal</p>
        </div>
      </div>

      <div class="rounded-lg bg-status-warning/10 p-3 text-on-surface">
        <p class="flex flex-wrap items-center gap-1 font-semibold">
          Pengecualian: <Furigana text="あります" /> → <Furigana text="ない" /> (bukan
          <Furigana text="あらない" />)
        </p>
        <p class="mt-1 flex flex-wrap items-center gap-1">
          Godan yang terlihat Ichidan:
          <Furigana text="帰ります" />→<Furigana text="帰らない" />,
          <Furigana text="入ります" />→<Furigana text="入らない" />,
          <Furigana text="走ります" />→<Furigana text="走らない" /> dll.
        </p>
      </div>
    </div>
  {/if}
</section>
