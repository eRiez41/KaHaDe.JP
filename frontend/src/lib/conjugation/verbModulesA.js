// Metadata + copy for the first half of the verb modules (Bab 9–33).
export const VERB_MODULES_A = {
  'masu-jisho': {
    title: 'ます ⇄ 辞書形',
    subtitle: 'Bab 9 & 14 · Bolak-balik bentuk kamus',
    formLabel: 'Bentuk kamus',
    mainKey: 'kamus',
    intro:
      'Bentuk kamus (辞書形) adalah bentuk dasar yang dipakai di kamus. Dari bentuk ます kita bisa membuka bentuk kamus, dan dari bentuk kamus kita bisa membentuk ます. Arah input dideteksi otomatis.',
    groups: [
      {
        title: 'Golongan I (Godan)',
        rule: 'Akhiran i-dan pada ます kembali ke u-dan; arah sebaliknya u-dan menjadi i-dan.',
        examples: [['書きます', '書く'], ['飲みます', '飲む'], ['買います', '買う']],
      },
      {
        title: 'Golongan II (Ichidan)',
        rule: 'Buang ます lalu tambah る; dari kamus, buang る lalu tambah ます.',
        examples: [['食べます', '食べる'], ['見ます', '見る']],
      },
      {
        title: 'Golongan III (Irregular)',
        rule: 'します ⇄ する, 来ます ⇄ 来る. Wajib hafal.',
        examples: [['します', 'する'], ['来ます', '来る']],
      },
    ],
    exception:
      '帰ります, 入ります, 走ります berakhiran seperti Ichidan tetapi Godan. Untuk arah kamus→ます, golongan ditentukan dari data kamus, bukan dari huruf terakhir saja.',
    note: 'Masukkan bentuk ます (mis. たべます) atau bentuk kamus (mis. たべる).',
  },

  'masu-ta': {
    title: 'ます → た',
    subtitle: 'Bab 19 · Bentuk lampau biasa',
    formLabel: 'Bentuk た',
    mainKey: 'ta',
    intro:
      'Bentuk た menyatakan kejadian yang sudah selesai. Dipakai dalam percakapan biasa; bentuk sopannya adalah ました.',
    groups: [
      {
        title: 'Golongan I (Godan)',
        rule: 'Pola sama dengan bentuk て, tetapi て→た dan で→だ.',
        examples: [['書きます', '書いた'], ['飲みます', '飲んだ'], ['買います', '買った']],
      },
      {
        title: 'Golongan II (Ichidan)',
        rule: 'Buang ます, tambah た.',
        examples: [['食べます', '食べた'], ['見ます', '見た']],
      },
      {
        title: 'Golongan III (Irregular)',
        rule: 'します → した, 来ます → 来た.',
        examples: [['します', 'した'], ['来ます', '来た']],
      },
    ],
    exception: '行きます → 行った (bukan 行いた). あります → あった.',
    forms: [
      { key: 'ta', label: 'Bentuk た', gloss: 'ta', note: 'Lampau biasa' },
      { key: 'masuPast', label: 'ました', gloss: 'masuPast', note: 'Lampau sopan' },
      { key: 'nakatta', label: 'なかった', gloss: 'nakatta', note: 'Negatif lampau biasa' },
      {
        key: 'masuPastNeg',
        label: 'ませんでした',
        gloss: 'masuPastNeg',
        note: 'Negatif lampau sopan',
      },
      { key: 'te', label: 'Bentuk て', gloss: 'te', note: 'Bentuk sambung' },
    ],
    patterns: (t, m) => [
      { jp: `${t.ta}ことがあります`, meaning: `pernah ${m}`, note: 'Pengalaman' },
      { jp: `${t.ta}り、…`, meaning: `${m}, lalu …`, note: 'Daftar kegiatan' },
    ],
    rule: 'Bentuk た mengikuti pola bentuk て: て→た dan で→だ.',
  },

  'masu-tara': {
    title: 'ます → 条件形 (~たら)',
    subtitle: 'Bab 25 · Pengandaian ~tara',
    formLabel: 'Bentuk たら',
    mainKey: 'tara',
    intro:
      'Bentuk たら berarti "kalau/jika" atau "setelah". Dibentuk dari bentuk た + ら, jadi kuasai bentuk た terlebih dahulu.',
    groups: [
      {
        title: 'Golongan I (Godan)',
        rule: 'Bentuk た + ら.',
        examples: [['書きます', '書いたら'], ['飲みます', '飲んだら'], ['買います', '買ったら']],
      },
      {
        title: 'Golongan II (Ichidan)',
        rule: 'Buang ます, tambah たら.',
        examples: [['食べます', '食べたら'], ['見ます', '見たら']],
      },
      {
        title: 'Golongan III (Irregular)',
        rule: 'します → したら, 来ます → 来たら.',
        examples: [['します', 'したら'], ['来ます', '来たら']],
      },
    ],
    exception: '行きます → 行ったら. あります → あったら.',
    forms: [
      { key: 'tara', label: 'Bentuk たら', gloss: 'tara', note: 'Kalau / setelah' },
      { key: 'taraNeg', label: 'なかったら', gloss: 'taraNeg', note: 'Kalau tidak' },
      { key: 'masuPast', label: 'ました', gloss: 'masuPast', note: 'Lampau sopan' },
      { key: 'eba', label: 'Bentuk ば', gloss: 'eba', note: 'Pembanding: kondisi murni' },
    ],
    patterns: (t, m) => [
      { jp: `${t.tara}どうですか`, meaning: `bagaimana kalau ${m}?`, note: 'Saran' },
      { jp: `もし${t.tara}`, meaning: `kalau ${m}`, note: 'Pengandaian' },
      { jp: `${t.tara}いいです`, meaning: `sebaiknya ${m}`, note: 'Saran halus' },
    ],
    rule: 'Bentuk たら = bentuk た + ら.',
  },

  'masu-kanou': {
    title: 'ます → 可能形',
    subtitle: 'Bab 27 · Bentuk potensial',
    formLabel: 'Bentuk 可能',
    mainKey: 'kanou',
    intro:
      'Bentuk potensial menyatakan kemampuan atau kemungkinan: "bisa melakukan". Untuk Ichidan, bentuknya sama dengan pasif; konteks kalimat yang membedakan.',
    groups: [
      {
        title: 'Golongan I (Godan)',
        rule: 'Akhiran i-dan berubah ke e-dan, lalu tambah る.',
        examples: [['書きます', '書ける'], ['飲みます', '飲める'], ['話します', '話せる']],
      },
      {
        title: 'Golongan II (Ichidan)',
        rule: 'Buang ます, tambah られる.',
        examples: [['食べます', '食べられる'], ['見ます', '見られる']],
      },
      {
        title: 'Golongan III (Irregular)',
        rule: 'します → できる, 来ます → 来られる.',
        examples: [['します', 'できる'], ['来ます', '来られる']],
      },
    ],
    exception: 'あります → ありうる/ありえる (mungkin ada). Bentuk ini khusus dan tidak dipakai untuk "bisa memiliki".',
    forms: [
      { key: 'kanou', label: 'Bentuk 可能', gloss: 'kanou', note: 'Bisa melakukan' },
      { key: 'kanouNeg', label: '可能 negatif', gloss: 'kanouNeg', note: 'Tidak bisa' },
      { key: 'kanouPast', label: '可能 lampau', gloss: 'kanouPast', note: 'Dulu bisa' },
      { key: 'kanouPolite', label: '可能 sopan', gloss: 'kanou', note: 'Bentuk ます' },
    ],
    patterns: (t, m) => [
      { jp: `${t.kamus}ことができます`, meaning: `bisa ${m}`, note: 'Bentuk sopan' },
      { jp: `${t.kanou}ようになる`, meaning: `menjadi bisa ${m}`, note: 'Perubahan kemampuan' },
    ],
    note: 'Bentuk ら抜き (食べれる) umum di percakapan, tetapi 食べられる adalah bentuk standar.',
    rule: 'Godan: i-dan → e-dan + る. Ichidan: stem + られる.',
  },

  'masu-ishou': {
    title: 'ます → 意向形',
    subtitle: 'Bab 31 · Bentuk volisional',
    formLabel: 'Bentuk 意向',
    mainKey: 'ishou',
    intro:
      'Bentuk 意向 menyatakan ajakan ("mari") atau niat pembicara ("akan"). Bentuk sopannya ましょう.',
    groups: [
      {
        title: 'Golongan I (Godan)',
        rule: 'Akhiran i-dan berubah ke o-dan, lalu tambah う.',
        examples: [['書きます', '書こう'], ['飲みます', '飲もう'], ['話します', '話そう']],
      },
      {
        title: 'Golongan II (Ichidan)',
        rule: 'Buang ます, tambah よう.',
        examples: [['食べます', '食べよう'], ['見ます', '見よう']],
      },
      {
        title: 'Golongan III (Irregular)',
        rule: 'します → しよう, 来ます → 来よう.',
        examples: [['します', 'しよう'], ['来ます', '来よう']],
      },
    ],
    exception: 'あります → あろう (bentuk sastra/jarang).',
    forms: [
      { key: 'ishou', label: 'Bentuk 意向', gloss: 'ishou', note: 'Mari / akan' },
      { key: 'ishouPolite', label: 'ましょう', gloss: 'ishouPolite', note: 'Ajakan sopan' },
      { key: 'masu', label: 'Bentuk ます', gloss: 'masu', note: 'Netral sopan' },
      { key: 'masuNeg', label: 'ません', gloss: 'masuNeg', note: 'Negatif sopan' },
    ],
    patterns: (t, m) => [
      { jp: `${t.ishouPolite}か`, meaning: `mau saya ${m}?`, note: 'Menawarkan bantuan' },
      { jp: `${t.masuNeg}か`, meaning: `mau ${m} bersama?`, note: 'Ajakan' },
      { jp: `${t.kamus}つもりです`, meaning: `berniat ${m}`, note: 'Niat' },
    ],
    rule: 'Godan: i-dan → o-dan + う. Ichidan: stem + よう.',
  },

  'masu-meirei': {
    title: 'ます → 命令形',
    subtitle: 'Bab 33 · Bentuk perintah',
    formLabel: 'Bentuk 命令',
    mainKey: 'meirei',
    intro:
      'Bentuk 命令 adalah perintah tegas. Nadanya kasar, dipakai oleh atasan, pelatih, atau dalam situasi darurat. Untuk percakapan sopan gunakan てください.',
    groups: [
      {
        title: 'Golongan I (Godan)',
        rule: 'Akhiran i-dan berubah ke e-dan.',
        examples: [['書きます', '書け'], ['飲みます', '飲め'], ['話します', '話せ']],
      },
      {
        title: 'Golongan II (Ichidan)',
        rule: 'Buang ます, tambah ろ.',
        examples: [['食べます', '食べろ'], ['見ます', '見ろ']],
      },
      {
        title: 'Golongan III (Irregular)',
        rule: 'します → しろ, 来ます → 来い.',
        examples: [['します', 'しろ'], ['来ます', '来い']],
      },
    ],
    exception: 'あります → あれ (sangat jarang).',
    forms: [
      { key: 'meirei', label: 'Bentuk 命令', gloss: 'meirei', note: 'Perintah tegas' },
      { key: 'meireiNeg', label: 'な', gloss: 'meireiNeg', note: 'Larangan tegas' },
      { key: 'nasai', label: 'なさい', gloss: 'nasai', note: 'Perintah halus' },
      { key: 'te', label: 'Bentuk て', gloss: 'te', note: 'Dasar てください' },
    ],
    patterns: (t, m) => [
      { jp: `${t.meirei}！`, meaning: `${m}!`, note: 'Perintah langsung' },
      { jp: `${t.meireiNeg}`, meaning: `jangan ${m}`, note: 'Larangan' },
      { jp: `${t.nasai}`, meaning: `${m} (perintah halus)`, note: 'Dari atasan ke bawahan' },
    ],
    note: 'Hindari bentuk 命令 kepada orang yang belum akrab; gunakan てください.',
    rule: 'Godan: i-dan → e-dan. Ichidan: stem + ろ.',
  },

}
