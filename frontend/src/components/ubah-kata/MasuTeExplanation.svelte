<script>
  import Furigana from '../Furigana.svelte'

  let show = $state(true)
</script>

<section class="card space-y-3 p-4 sm:p-5">
  <button type="button" class="flex w-full items-center justify-between text-left" onclick={() => (show = !show)}>
    <h2 class="text-title-md font-bold">Apa itu bentuk て?</h2>
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
        Bentuk sambung verba/adjektiva berakhiran て (atau で). Fungsi: menyambung kalimat, sedang berlangsung (~ている),
        permintaan (~てください), izin (~てもいい), larangan (~てはいけない), selesai (~てしまう), coba (~てみる), alasan, cara.
      </p>

      <div class="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div class="rounded-lg border border-outline-variant p-3">
          <p class="font-semibold text-on-surface">
            Golongan I (<Furigana text="五段" /> / Godan)
          </p>
          <p class="mt-1">Akhiran -ki/-gi/-shi/-chi/-ni/-mi/-bi/-ri/-i</p>
          <p class="mt-1 flex flex-wrap items-center gap-1">
            Contoh:
            <Furigana text="書きます" />→<Furigana text="書いて" />,
            <Furigana text="飲みます" />→<Furigana text="飲んで" />,
            <Furigana text="買います" />→<Furigana text="買って" />
          </p>
        </div>
        <div class="rounded-lg border border-outline-variant p-3">
          <p class="font-semibold text-on-surface">
            Golongan II (<Furigana text="一段" /> / Ichidan)
          </p>
          <p class="mt-1">Stem ます berakhiran -e/-i, buang ます + て</p>
          <p class="mt-1 flex flex-wrap items-center gap-1">
            Contoh:
            <Furigana text="食べます" />→<Furigana text="食べて" />,
            <Furigana text="見ます" />→<Furigana text="見て" />
          </p>
        </div>
        <div class="rounded-lg border border-outline-variant p-3">
          <p class="font-semibold text-on-surface">
            Golongan III (<Furigana text="不規則" /> / Irregular)
          </p>
          <p class="mt-1 flex flex-wrap items-center gap-1">
            <Furigana text="します" />→<Furigana text="して" />,
            <Furigana text="来ます" />→<Furigana text="来て" />
          </p>
          <p class="mt-1">Wajib hafal</p>
        </div>
      </div>

      <div class="rounded-lg bg-status-warning/10 p-3 text-on-surface">
        <p class="flex flex-wrap items-center gap-1 font-semibold">
          Pengecualian: <Furigana text="行きます" /> → <Furigana text="行って" /> (bukan
          <Furigana text="行いて" />)
        </p>
        <p class="mt-1 flex flex-wrap items-center gap-1">
          Godan yang terlihat Ichidan:
          <Furigana text="帰ります" />、
          <Furigana text="入ります" />、
          <Furigana text="走ります" />、
          <Furigana text="切ります" /> dll → tetap Godan.
        </p>
      </div>
    </div>
  {/if}
</section>
