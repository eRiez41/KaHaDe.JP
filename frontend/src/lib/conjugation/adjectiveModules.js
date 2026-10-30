export const ADJECTIVE_MODULES = {
  'i-kei': {
    title: 'Adjektiva-i (い形容詞)',
    subtitle: 'Bab 8, 12, 16 · Klasifikasi & Konjugasi Lengkap',
    heading: 'Apa itu adjektiva-i?',
    classification: {
      groupName: 'Adjektiva-i (い形容詞)',
      description:
        'Kata sifat yang berakhiran い dalam bentuk dasarnya, misalnya 高い (tinggi), 忙しい (sibuk), 暑い (panas). Bentuk positif sekarang (高い, 忙しい) adalah bentuk dasar; semua perubahan berangkat dari sini. Berbeda dengan kata kerja, adjektiva-i TIDAK punya sub-golongan (G1/G2/G3); yang ada hanyalah kelompok ini dan adjektiva-na.',
    },
    conjugationTable: {
      headers: ['Bentuk', 'Biasa (Plain)', 'Sopan (Polite)'],
      rows: [
        ['Positif Non-Lampau', '高い', '高いです'],
        ['Negatif Non-Lampau', '高くない', '高くないです / 高くありません'],
        ['Positif Lampau', '高かった', '高かったです'],
        ['Negatif Lampau', '高くなかった', '高くなかったです / 高くありませんでした'],
        ['Te-form (Sambung)', '高くて', '—'],
      ],
      note:
        'Bentuk sopan negatif punya dua variasi: 〜くないです (lebih percakapan) dan 〜くありません (lebih formal)[reference:2][reference:3].',
    },
    groups: [
      {
        title: 'Negatif: い → くない',
        rule: 'Buang い, lalu tambah くない. Sopan: くないです / くありません.',
        examples: [
          ['高い', '高くない'],
          ['忙しい', '忙しくない'],
        ],
      },
      {
        title: 'Lampau: い → かった',
        rule: 'Buang い, lalu tambah かった. Sopan: かったです.',
        examples: [
          ['高い', '高かった'],
          ['忙しい', '忙しかった'],
        ],
      },
      {
        title: 'Negatif Lampau: い → くなかった',
        rule: 'Buang い, lalu tambah くなかった. Sopan: くなかったです / くありませんでした.',
        examples: [
          ['高い', '高くなかった'],
          ['忙しい', '忙しくなかった'],
        ],
      },
      {
        title: 'Sambung (Te-form): い → くて',
        rule: 'Buang い, lalu tambah くて untuk menyambung dua sifat atau sebab-akibat ringan.',
        examples: [
          ['高い', '高くて'],
          ['忙しい', '忙しくて'],
        ],
      },
      {
        title: 'Modifikasi Kata Benda: い + N',
        rule: 'Adjektiva-i langsung menempel pada kata benda tanpa perubahan.',
        examples: [
          ['高い山', 'gunung yang tinggi'],
          ['新しい車', 'mobil baru'],
        ],
      },
    ],
    exceptions: [
      {
        word: 'いい (bagus)',
        type: 'Irregular total',
        explanation:
          'Bentuk positif tetap いい. Namun negatif dan lampau diambil dari よい: よくない, よかった, よくなかった, よくて. Bentuk sopan: いいです, よくないです, よかったです, よくなかったです[reference:4][reference:5].',
      },
      {
        word: 'かっこいい (keren)',
        type: 'Irregular (mengikuti いい)',
        explanation:
          'Karena merupakan gabungan 格好 (kakkō) + いい, konjugasinya mengikuti いい: かっこよくない, かっこよかった, かっこよくなかった, かっこよくて.',
      },
      {
        word: 'かわいい (imut)',
        type: 'Reguler (bukan irregular)',
        explanation:
          'Meskipun berakhiran い dan terdengar mirip, かわいい tetap adjektiva-i reguler: かわいくない, かわいかった, かわいくなかった[reference:7].',
      },
    ],
    traps: [
      {
        word: 'きれい (cantik/bersih)',
        warning:
          'Berakhiran い tetapi ini ADJEKTIVA-NA, bukan adjektiva-i. Konjugasinya: きれいじゃない, きれいだった, きれいで — BUKAN きれくない[reference:8][reference:9].',
      },
      {
        word: '嫌い (benci)',
        warning:
          'Juga berakhiran い tetapi termasuk ADJEKTIVA-NA: 嫌いじゃない, 嫌いだった, 嫌いで[reference:10].',
      },
    ],
    usageNotes: [
      'とても + adjektiva positif = "sangat ..."',
      'あまり + adjektiva negatif = "tidak terlalu ..."',
      'Contoh: とても高いです (sangat mahal) / あまり高くないです (tidak terlalu mahal)[reference:11].',
    ],
    commonAdjectives: [
      ['高い', 'tinggi/mahal'],
      ['安い', 'murah'],
      ['新しい', 'baru'],
      ['古い', 'lama'],
      ['忙しい', 'sibuk'],
      ['暑い', 'panas (cuaca)'],
      ['寒い', 'dingin'],
      ['面白い', 'menarik'],
      ['難しい', 'sulit'],
      ['楽しい', 'menyenangkan'],
    ],
  },

  'na-kei': {
    title: 'Adjektiva-na (な形容詞)',
    subtitle: 'Bab 8, 12, 16 · Klasifikasi & Konjugasi Lengkap',
    heading: 'Apa itu adjektiva-na?',
    classification: {
      groupName: 'Adjektiva-na (な形容詞 / 形容動詞)',
      description:
        'Kata sifat yang memerlukan な saat menerangkan kata benda, misalnya 元気な人 (orang sehat), 静かな部屋 (kamar tenang). Dalam bentuk predikat, な hilang dan diganti だ/です. Secara gramatikal, adjektiva-na berperilaku seperti kata benda + だ/です, sehingga konjugasinya mengikuti pola kata benda[reference:12]. Sama seperti adjektiva-i, tidak ada sub-golongan G1/G2/G3 di dalam adjektiva-na.',
    },
    conjugationTable: {
      headers: ['Bentuk', 'Biasa (Plain)', 'Sopan (Polite)'],
      rows: [
        ['Positif Non-Lampau', '静かだ', '静かです'],
        ['Negatif Non-Lampau', '静かじゃない', '静かじゃないです / 静かではありません'],
        ['Positif Lampau', '静かだった', '静かでした'],
        ['Negatif Lampau', '静かじゃなかった', '静かじゃなかったです / 静かではありませんでした'],
        ['Te-form (Sambung)', '静かで', '—'],
        ['Adverbia (Menerangkan Verba)', '静かに', '—'],
      ],
      note:
        'Bentuk じゃないです dan ではありません sama-sama benar; じゃないです lebih percakapan, ではありません lebih formal[reference:13][reference:14].',
    },
    groups: [
      {
        title: 'Negatif: だ → じゃない',
        rule: 'Buang だ, lalu tambah じゃない. Sopan: じゃないです / ではありません.',
        examples: [
          ['元気だ', '元気じゃない'],
          ['静かだ', '静かじゃない'],
        ],
      },
      {
        title: 'Lampau: だ → だった',
        rule: 'Buang だ, lalu tambah だった. Sopan: でした.',
        examples: [
          ['元気だ', '元気だった'],
          ['静かだ', '静かだった'],
        ],
      },
      {
        title: 'Negatif Lampau: だ → じゃなかった',
        rule: 'Buang だ, lalu tambah じゃなかった. Sopan: じゃなかったです / ではありませんでした.',
        examples: [
          ['元気だ', '元気じゃなかった'],
          ['静かだ', '静かじゃなかった'],
        ],
      },
      {
        title: 'Sambung (Te-form): だ → で',
        rule: 'Buang だ, lalu tambah で untuk menyambung dua sifat atau sebab-akibat ringan.',
        examples: [
          ['元気だ', '元気で'],
          ['静かだ', '静かで'],
        ],
      },
      {
        title: 'Modifikasi Kata Benda: な + N',
        rule: 'Tambahkan な di antara adjektiva-na dan kata benda.',
        examples: [
          ['静かな部屋', 'kamar yang tenang'],
          ['元気な人', 'orang yang sehat'],
        ],
      },
      {
        title: 'Adverbia: な → に',
        rule: 'Ubah な menjadi に untuk menerangkan kata kerja (bagaimana tindakan dilakukan).',
        examples: [
          ['静かに話す', 'berbicara dengan tenang'],
          ['きれいになる', 'menjadi cantik/bersih'],
        ],
      },
    ],
    exceptions: [
      {
        word: 'きれい (cantik/bersih)',
        type: 'Trap (bukan irregular, tapi sering disalahartikan)',
        explanation:
          'Berakhiran い tetapi termasuk adjektiva-na. Konjugasi: きれいじゃない, きれいだった, きれいで, きれいに. Jangan pernah mengubahnya menjadi きれくない[reference:15][reference:16].',
      },
      {
        word: '嫌い (benci)',
        type: 'Trap (sama seperti きれい)',
        explanation:
          'Juga berakhiran い tetapi adjektiva-na: 嫌いじゃない, 嫌いだった, 嫌いで[reference:17].',
      },
    ],
    traps: [
      {
        word: 'Salah kira きれい & 嫌い sebagai adjektiva-i',
        warning:
          'Ini kesalahan paling umum. Selalu cek apakah kata tersebut memerlukan な di depan kata benda. Jika ya, itu adjektiva-na[reference:18].',
      },
    ],
    usageNotes: [
      'とても + adjektiva-na positif = "sangat ..."',
      'あまり + adjektiva-na negatif = "tidak terlalu ..."',
      'Contoh: とても静かです (sangat tenang) / あまり静かじゃないです (tidak terlalu tenang).',
    ],
    commonAdjectives: [
      ['元気', 'sehat/energik'],
      ['静か', 'tenang'],
      ['きれい', 'cantik/bersih'],
      ['便利', 'praktis'],
      ['有名', 'terkenal'],
      ['大切', 'penting'],
      ['親切', 'baik hati'],
      ['好き', 'suka'],
      ['嫌い', 'benci'],
      ['上手', 'mahir'],
      ['下手', 'tidak mahir'],
    ],
  },
}