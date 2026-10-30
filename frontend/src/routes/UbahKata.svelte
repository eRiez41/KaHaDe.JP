<script>
  import { toast } from '../lib/toast.svelte.js'

  // Urutan disesuaikan dengan alur belajar Minna no Nihongo (Bab 8 → Bab 50).
  // Tandai `soon: true` untuk item yang belum siap; sisanya otomatis bisa dipakai.
  const items = [
    {
      id: 'i-kei',
      title: 'Kata Sifat -i (い形容詞): ～くて, ～かった, ～くない',
      chapter: 'Bab 8, 12, 16',
      desc: 'Cara menyambungkan kata sifat -i, mengubahnya ke bentuk lampau (sudah), dan bentuk negatif (tidak).',
    },
    {
      id: 'na-kei',
      title: 'Kata Sifat -na (な形容詞): ～で, ～だった, ～じゃない',
      chapter: 'Bab 8, 12, 16',
      desc: 'Cara menyambungkan kata sifat -na, mengubahnya ke bentuk lampau (sudah), dan bentuk negatif (tidak).',
    },
    {
      id: 'masu-te',
      title: 'Bentuk Masu (ます) → Bentuk Te (て形 / Te-kei)',
      chapter: 'Bab 14',
      desc: 'Bentuk dasar untuk menyambungkan kalimat, meminta tolong (～てください), atau menyatakan sedang melakukan sesuatu.',
    },
    {
      id: 'masu-nai',
      title: 'Bentuk Masu (ます) → Bentuk Negatif (ない形 / Nai-kei)',
      chapter: 'Bab 17',
      desc: 'Bentuk negatif standar (tidak melakukan). Sering dipakai untuk larangan (～ないでください) atau sebelum pola kalimat tertentu.',
    },
    {
      id: 'masu-jisho',
      title: 'Bentuk Masu (ます) ↔ Bentuk Kamus (辞書形 / Jisho-kei)',
      chapter: 'Bab 18',
      desc: 'Cara mengubah kata kerja dari bentuk sopan ke bentuk dasar kamus, dan sebaliknya. Termasuk pengenalan 3 golongan kata kerja.',
    },
    {
      id: 'masu-ta',
      title: 'Bentuk Masu (ます) → Bentuk Lampau (た形 / Ta-kei)',
      chapter: 'Bab 19',
      desc: 'Bentuk sederhana untuk menyatakan kejadian yang sudah selesai atau pernah dialami di masa lalu.',
    },
    {
      id: 'masu-tara',
      title: 'Bentuk Masu (ます) → Pengandaian (～たら / -tara)',
      chapter: 'Bab 25',
      desc: 'Pola "jika..." atau "kalau...". Digunakan untuk menyatakan syarat atau kejadian yang mungkin terjadi di masa depan.',
    },
    {
      id: 'masu-kanou',
      title: 'Bentuk Masu (ます) → Bentuk Bisa (可能形 / Kanou-kei)',
      chapter: 'Bab 27',
      desc: 'Mengubah kata kerja untuk menyatakan kemampuan ("bisa melakukan") atau kemungkinan ("bisa terjadi").',
    },
    {
      id: 'masu-ishou',
      title: 'Bentuk Masu (ます) → Bentuk Ajakan (意向形 / Ikou-kei)',
      chapter: 'Bab 31',
      desc: 'Digunakan untuk menyatakan niat diri sendiri ("saya akan...") atau mengajak orang lain ("mari kita...").',
    },
    {
      id: 'masu-meirei',
      title: 'Bentuk Masu (ます) → Bentuk Perintah (命令形 / Meirei-kei)',
      chapter: 'Bab 33',
      desc: 'Bentuk imperatif untuk memberi perintah tegas, instruksi langsung, atau peringatan ("Lakukan!").',
    },
    {
      id: 'masu-eba',
      title: 'Bentuk Masu (ます) → Pengandaian Murni (～えば / -eba)',
      chapter: 'Bab 35',
      desc: 'Pola "jika..." yang menekankan syarat mutlak. Jika syaratnya terpenuhi, hasilnya pasti terjadi.',
    },
    {
      id: 'masu-ukemi',
      title: 'Bentuk Masu (ます) → Bentuk Pasif (受身形 / Ukemi-kei)',
      chapter: 'Bab 37',
      desc: 'Menyatakan subjek "dikenai" tindakan oleh orang lain ("di-"). Bisa juga untuk kalimat yang merugikan subjek.',
    },
    {
      id: 'masu-shieki',
      title: 'Bentuk Masu (ます) → Bentuk Menyuruh (使役形 / Shieki-kei)',
      chapter: 'Bab 48',
      desc: 'Menyatakan bahwa subjek membuat, menyuruh, atau membiarkan orang lain melakukan sesuatu.',
    },
    {
      id: 'masu-shiekiukemi',
      title: 'Bentuk Masu (ます) → Pasif-Kausatif (使役受身形 / Shieki-Ukemi-kei)',
      chapter: 'Bab 48',
      desc: 'Gabungan bentuk suruh dan pasif. Menyatakan perasaan "dipaksa" atau "dibuat melakukan" sesuatu oleh orang lain.',
    },
    {
      id: 'keigo',
      title: 'Bahasa Sopan (敬語 / Keigo): Sonkeigo & Kenjougo',
      chapter: 'Bab 49–50',
      desc: 'Pengenalan bahasa hormat (尊敬語 / Sonkeigo) untuk orang lain, dan bahasa rendah (謙譲語 / Kenjougo) untuk merendahkan diri sendiri.',
    },
  ]

  function handleClick(item) {
    if (item.soon) {
      toast.info('Fitur ini segera hadir')
      return
    }
    window.location.hash = `#ubah-kata/${item.id}`
  }
</script>

<section class="space-y-6">
  <header class="space-y-2">
    <h1 class="text-headline-lg font-bold tracking-tight">Perubahan Kata</h1>
    <p class="text-body-md text-on-surface-variant">
      Peta Jalan Konjugasi Bahasa Jepang · Minna no Nihongo
    </p>
    <p class="text-label-md text-on-surface-variant">
      Urutan disesuaikan dengan alur belajar Minna no Nihongo. Klik kartu untuk mulai berlatih.
    </p>
  </header>

  <ol class="grid list-none grid-cols-1 gap-3 p-0 sm:grid-cols-2 lg:grid-cols-3">
    {#each items as item, i (item.id)}
      <li class="h-full">
        <button
          type="button"
          class="card card-hover flex h-full w-full items-start gap-3 p-4 text-left {item.soon
            ? 'opacity-90'
            : 'border-2 border-outline shadow-level-2'}"
          onclick={() => handleClick(item)}
        >
          <span
            class="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-surface-high text-label-md font-bold text-on-surface-variant"
          >
            {i + 1}
          </span>
          <span class="min-w-0 flex-1 space-y-1">
            <span class="flex items-start justify-between gap-2">
              <span class="text-title-md font-bold leading-snug">{item.title}</span>
              {#if item.soon}
                <span class="chip shrink-0 bg-surface-high text-on-surface-variant">
                  <svg viewBox="0 0 20 20" class="h-3.5 w-3.5" fill="currentColor" aria-hidden="true">
                    <path
                      fill-rule="evenodd"
                      d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  Segera
                </span>
              {/if}
            </span>
            <span class="block text-label-md font-semibold uppercase tracking-wide text-primary">
              {item.chapter}
            </span>
            <span class="block text-body-md text-on-surface-variant leading-relaxed">{item.desc}</span>
          </span>
        </button>
      </li>
    {/each}
  </ol>
</section>