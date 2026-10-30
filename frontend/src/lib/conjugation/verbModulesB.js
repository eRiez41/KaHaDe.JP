// Metadata + copy for the second half of the verb modules (Bab 35–50).
export const VERB_MODULES_B = {
  'masu-eba': {
    title: 'ます → 条件形 (~えば)',
    subtitle: 'Bab 35 · Pengandaian ~eba',
    formLabel: 'Bentuk ば',
    mainKey: 'eba',
    intro:
      'Bentuk ば menyatakan syarat logis: "kalau A, maka B". Lebih formal daripada たら dan sering dipakai dalam peribahasa serta pola kewajiban.',
    groups: [
      {
        title: 'Golongan I (Godan)',
        rule: 'Akhiran i-dan berubah ke e-dan, lalu tambah ば.',
        examples: [['書きます', '書けば'], ['飲みます', '飲めば'], ['話します', '話せば']],
      },
      {
        title: 'Golongan II (Ichidan)',
        rule: 'Buang ます, tambah れば.',
        examples: [['食べます', '食べれば'], ['見ます', '見れば']],
      },
      {
        title: 'Golongan III (Irregular)',
        rule: 'します → すれば, 来ます → 来れば.',
        examples: [['します', 'すれば'], ['来ます', '来れば']],
      },
    ],
    exception: 'あります → あれば.',
    forms: [
      { key: 'eba', label: 'Bentuk ば', gloss: 'eba', note: 'Kalau' },
      { key: 'ebaNeg', label: 'なければ', gloss: 'ebaNeg', note: 'Kalau tidak' },
      { key: 'tara', label: 'Bentuk たら', gloss: 'tara', note: 'Pembanding percakapan' },
      { key: 'masu', label: 'Bentuk ます', gloss: 'masu', note: 'Netral sopan' },
    ],
    patterns: (t, m) => [
      { jp: `${t.ebaNeg}なりません`, meaning: `harus ${m}`, note: 'Kewajiban' },
      { jp: `${t.eba}いい`, meaning: `sebaiknya ${m}`, note: 'Saran' },
      { jp: `${t.eba}ほど`, meaning: `semakin ${m}, semakin …`, note: 'Perbandingan' },
    ],
    rule: 'Godan: i-dan → e-dan + ば. Ichidan: stem + れば.',
  },

  'masu-ukemi': {
    title: 'ます → 受身形',
    subtitle: 'Bab 37 · Bentuk pasif',
    formLabel: 'Bentuk pasif',
    mainKey: 'ukemi',
    intro:
      'Bentuk pasif menyatakan bahwa subjek dikenai tindakan. Pelaku biasanya ditandai に. Untuk Ichidan, bentuk pasif sama dengan bentuk potensial.',
    groups: [
      {
        title: 'Golongan I (Godan)',
        rule: 'Akhiran i-dan berubah ke a-dan, lalu tambah れる.',
        examples: [['書きます', '書かれる'], ['飲みます', '飲まれる'], ['話します', '話される']],
      },
      {
        title: 'Golongan II (Ichidan)',
        rule: 'Buang ます, tambah られる.',
        examples: [['食べます', '食べられる'], ['見ます', '見られる']],
      },
      {
        title: 'Golongan III (Irregular)',
        rule: 'します → される, 来ます → 来られる.',
        examples: [['します', 'される'], ['来ます', '来られる']],
      },
    ],
    exception: 'あります → あられる sangat jarang; biasanya diganti ungkapan lain.',
    forms: [
      { key: 'ukemi', label: 'Bentuk pasif', gloss: 'ukemi', note: 'Dikenai tindakan' },
      { key: 'ukemiNeg', label: 'Pasif negatif', gloss: 'ukemiNeg', note: 'Tidak dikenai' },
      { key: 'ukemiPast', label: 'Pasif lampau', gloss: 'ukemiPast', note: 'Sudah dikenai' },
      { key: 'ukemiPolite', label: 'Pasif sopan', gloss: 'ukemi', note: 'Bentuk ます' },
    ],
    patterns: (t) => [
      { jp: `〜に${t.ukemi}`, meaning: 'dikenai tindakan oleh …', note: 'Pelaku ditandai に' },
      { jp: `${t.ukemi}ている`, meaning: 'sedang dikenai / dalam keadaan …', note: 'Keadaan' },
    ],
    note: 'Ichidan: pasif = potensial. Bedakan dari konteks dan partikel.',
    rule: 'Godan: i-dan → a-dan + れる. Ichidan: stem + られる.',
  },

  'masu-shieki': {
    title: 'ます → 使役形',
    subtitle: 'Bab 48 · Bentuk kausatif',
    formLabel: 'Bentuk kausatif',
    mainKey: 'shieki',
    intro:
      'Bentuk kausatif berarti "menyuruh" atau "membiarkan" seseorang melakukan sesuatu. Pelaku yang disuruh ditandai に (untuk verba intransitif) atau を (untuk verba transitif).',
    groups: [
      {
        title: 'Golongan I (Godan)',
        rule: 'Akhiran i-dan berubah ke a-dan, lalu tambah せる.',
        examples: [['書きます', '書かせる'], ['飲みます', '飲ませる'], ['話します', '話させる']],
      },
      {
        title: 'Golongan II (Ichidan)',
        rule: 'Buang ます, tambah させる.',
        examples: [['食べます', '食べさせる'], ['見ます', '見させる']],
      },
      {
        title: 'Golongan III (Irregular)',
        rule: 'します → させる, 来ます → 来させる.',
        examples: [['します', 'させる'], ['来ます', '来させる']],
      },
    ],
    exception: 'Bentuk singkat Godan: 飲ませる → 飲ます (lebih kasual).',
    forms: [
      { key: 'shieki', label: 'Bentuk kausatif', gloss: 'shieki', note: 'Menyuruh / membiarkan' },
      { key: 'shiekiNeg', label: 'Kausatif negatif', gloss: 'shiekiNeg', note: 'Tidak menyuruh' },
      { key: 'shiekiPast', label: 'Kausatif lampau', gloss: 'shiekiPast', note: 'Sudah menyuruh' },
      { key: 'shiekiPolite', label: 'Kausatif sopan', gloss: 'shieki', note: 'Bentuk ます' },
      {
        key: 'shiekiShort',
        label: 'Bentuk singkat',
        gloss: 'shieki',
        note: 'Kasual (Godan)',
        godanOnly: true,
      },
    ],
    patterns: (t, m) => [
      {
        jp: `${t.shieki.slice(0, -1)}てください`,
        meaning: `tolong izinkan saya ${m}`,
        note: 'Minta izin',
      },
      { jp: `${t.shieki}`, meaning: `menyuruh/membiarkan ${m}`, note: 'Dua nuansa' },
    ],
    note: 'Konteks menentukan "menyuruh" atau "membiarkan". Bentuk singkat hanya untuk Godan.',
    rule: 'Godan: i-dan → a-dan + せる. Ichidan: stem + させる.',
  },

  'masu-shiekiukemi': {
    title: 'ます → 使役受身形',
    subtitle: 'Bab 48 · Kausatif-pasif',
    formLabel: 'Bentuk kausatif-pasif',
    mainKey: 'shiekiukemi',
    intro:
      'Bentuk kausatif-pasif berarti "disuruh" atau "terpaksa" melakukan sesuatu. Dibentuk dari kausatif + pasif.',
    groups: [
      {
        title: 'Golongan I (Godan)',
        rule: 'Akhiran i-dan berubah ke a-dan, lalu tambah せられる.',
        examples: [['書きます', '書かせられる'], ['飲みます', '飲ませられる']],
      },
      {
        title: 'Golongan II (Ichidan)',
        rule: 'Buang ます, tambah させられる.',
        examples: [['食べます', '食べさせられる'], ['見ます', '見させられる']],
      },
      {
        title: 'Golongan III (Irregular)',
        rule: 'します → させられる, 来ます → 来させられる.',
        examples: [['します', 'させられる'], ['来ます', '来させられる']],
      },
    ],
    exception: 'Bentuk singkat Godan: 飲ませられる → 飲まされる (kasual).',
    forms: [
      { key: 'shiekiukemi', label: 'Kausatif-pasif', gloss: 'shiekiukemi', note: 'Disuruh / terpaksa' },
      {
        key: 'shiekiukemiNeg',
        label: 'Negatif',
        gloss: 'shiekiukemiNeg',
        note: 'Tidak disuruh',
      },
      {
        key: 'shiekiukemiPast',
        label: 'Lampau',
        gloss: 'shiekiukemiPast',
        note: 'Sudah disuruh',
      },
      {
        key: 'shiekiukemiPolite',
        label: 'Sopan',
        gloss: 'shiekiukemi',
        note: 'Bentuk ます',
      },
      {
        key: 'shiekiukemiShort',
        label: 'Bentuk singkat',
        gloss: 'shiekiukemi',
        note: 'Kasual (Godan)',
        godanOnly: true,
      },
    ],
    patterns: (t, m) => [
      { jp: `${t.shiekiukemi}`, meaning: `disuruh ${m}`, note: 'Kausatif-pasif' },
      { jp: `${t.shiekiukemiShort}`, meaning: `terpaksa ${m}`, note: 'Bentuk singkat' },
    ],
    rule: 'Bentuk kausatif + pasif: せる → せられる, させる → させられる.',
  },

  'masu-keigo': {
    title: 'ます → 敬語',
    subtitle: 'Bab 49–50 · Sonkeigo & Kenjougo',
    formLabel: 'Sonkeigo',
    mainKey: 'sonkeigo',
    intro:
      '敬語 (keigo) adalah bahasa hormat. Sonkeigo meninggikan lawan bicara, kenjougo merendahkan diri sendiri. Banyak verba penting memakai bentuk khusus yang wajib dihafal.',
    groups: [
      {
        title: 'Sonkeigo (hormat)',
        rule: 'Pola umum: お + stem ます + になる.',
        examples: [['行きます', 'いらっしゃる'], ['食べます', '召し上がる'], ['見ます', 'ご覧になる']],
      },
      {
        title: 'Kenjougo (rendah hati)',
        rule: 'Pola umum: お + stem ます + する.',
        examples: [['行きます', '参る'], ['食べます', 'いただく'], ['見ます', '拝見する']],
      },
      {
        title: 'Kata benda + する',
        rule: 'ご + kata benda + になる / する.',
        examples: [['勉強します', 'ご勉強になる'], ['連絡します', 'ご連絡する']],
      },
    ],
    exception:
      'Verba khusus: 行く/来る/いる → いらっしゃる, 食べる/飲む → 召し上がる, 言う → おっしゃる, する → なさる, 見る → ご覧になる.',
    forms: [
      { key: 'sonkeigo', label: 'Sonkeigo', gloss: 'sonkeigo', note: 'Meninggikan lawan bicara' },
      { key: 'kenjougo', label: 'Kenjougo', gloss: 'kenjougo', note: 'Merendahkan diri' },
      { key: 'masu', label: 'Bentuk ます', gloss: 'masu', note: 'Sopan netral' },
      {
        key: 'sonkeigoRequest',
        label: 'Permintaan hormat',
        gloss: 'sonkeigo',
        note: 'お/ご + … + ください',
      },
    ],
    patterns: (t, m) => [
      { jp: `${t.sonkeigoRequest}`, meaning: `tolong ${m} (hormat)`, note: 'Permintaan' },
      {
        jp: `${t.kenjougo}`,
        meaning: `saya ${m} (rendah hati)`,
        note: 'Tentang diri sendiri',
      },
    ],
    note: 'Jangan memakai sonkeigo untuk tindakan diri sendiri, dan jangan memakai kenjougo untuk tindakan lawan bicara.',
    rule: 'Pola umum: sonkeigo お + stem + になる; kenjougo お + stem + する. Verba khusus memakai bentuk sendiri.',
  },
}
