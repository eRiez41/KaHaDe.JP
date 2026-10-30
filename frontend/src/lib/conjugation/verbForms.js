// Conjugation table for every masu-based verb module. The base comes from
// masuBase.js (or from the jisho analyzer), so this file only applies endings.

const GODAN_A = {
  い: 'わ',
  き: 'か',
  ぎ: 'が',
  し: 'さ',
  じ: 'ざ',
  ち: 'た',
  に: 'な',
  び: 'ば',
  み: 'ま',
  り: 'ら',
}

const GODAN_E = {
  い: 'え',
  き: 'け',
  ぎ: 'げ',
  し: 'せ',
  じ: 'ぜ',
  ち: 'て',
  に: 'ね',
  び: 'べ',
  み: 'め',
  り: 'れ',
}

const GODAN_O = {
  い: 'お',
  き: 'こ',
  ぎ: 'ご',
  し: 'そ',
  じ: 'ぞ',
  ち: 'と',
  に: 'の',
  び: 'ぼ',
  み: 'も',
  り: 'ろ',
}

const GODAN_TA = {
  い: 'った',
  き: 'いた',
  ぎ: 'いだ',
  し: 'した',
  じ: 'じた',
  ち: 'った',
  に: 'んだ',
  び: 'んだ',
  み: 'んだ',
  り: 'った',
}

const GODAN_TE = {
  い: 'って',
  き: 'いて',
  ぎ: 'いで',
  し: 'して',
  じ: 'じて',
  ち: 'って',
  に: 'んで',
  び: 'んで',
  み: 'んで',
  り: 'って',
}

const U_TO_I = {
  う: 'い',
  く: 'き',
  ぐ: 'ぎ',
  す: 'し',
  つ: 'ち',
  ぬ: 'に',
  ぶ: 'び',
  む: 'み',
  る: 'り',
}

export { U_TO_I }

function godanTable(base) {
  const stem = base.stem
  const pre = stem.slice(0, -1)
  const last = stem.slice(-1)
  const a = pre + GODAN_A[last]
  const e = pre + GODAN_E[last]
  const o = pre + GODAN_O[last]
  const iku = base.kamus === 'いく' || base.kamus === '行く'
  const ta = iku ? pre + 'った' : pre + GODAN_TA[last]
  const te = iku ? pre + 'って' : pre + GODAN_TE[last]
  return {
    masu: base.hira,
    masuNeg: stem + 'ません',
    masuPast: stem + 'ました',
    masuPastNeg: stem + 'ませんでした',
    kamus: base.kamus,
    nai: a + 'ない',
    nakatta: a + 'なかった',
    te,
    ta,
    tara: ta + 'ら',
    taraNeg: a + 'なかったら',
    kanou: e + 'る',
    kanouNeg: e + 'ない',
    ishou: o + 'う',
    meirei: e,
    eba: e + 'ば',
    ebaNeg: a + 'なければ',
    ukemi: a + 'れる',
    shieki: a + 'せる',
    shiekiukemi: a + 'せられる',
    nasai: stem + 'なさい',
    sonkeigo: `お${stem}になる`,
    kenjougo: `お${stem}する`,
  }
}

function ichidanTable(base) {
  const stem = base.stem
  return {
    masu: base.hira,
    masuNeg: stem + 'ません',
    masuPast: stem + 'ました',
    masuPastNeg: stem + 'ませんでした',
    kamus: base.kamus,
    nai: stem + 'ない',
    nakatta: stem + 'なかった',
    te: stem + 'て',
    ta: stem + 'た',
    tara: stem + 'たら',
    taraNeg: stem + 'なかったら',
    kanou: stem + 'られる',
    kanouNeg: stem + 'られない',
    ishou: stem + 'よう',
    meirei: stem + 'ろ',
    eba: stem + 'れば',
    ebaNeg: stem + 'なければ',
    ukemi: stem + 'られる',
    shieki: stem + 'させる',
    shiekiukemi: stem + 'させられる',
    nasai: stem + 'なさい',
    sonkeigo: `お${stem}になる`,
    kenjougo: `お${stem}する`,
  }
}

function suruTable(base) {
  const noun = base.suruNoun ?? ''
  const stem = base.stem
  const katakana = base.inputType === 'katakana' || base.inputType === 'mixed'
  const sonkeigo = noun
    ? katakana
      ? `${noun}なさる`
      : `ご${noun}になる`
    : 'なさる'
  const kenjougo = noun ? (katakana ? `${noun}いたす` : `ご${noun}する`) : 'いたす'
  return {
    masu: base.hira,
    masuNeg: stem + 'ません',
    masuPast: stem + 'ました',
    masuPastNeg: stem + 'ませんでした',
    kamus: base.kamus,
    nai: noun + 'しない',
    nakatta: noun + 'しなかった',
    te: noun + 'して',
    ta: noun + 'した',
    tara: noun + 'したら',
    taraNeg: noun + 'しなかったら',
    kanou: noun + 'できる',
    kanouNeg: noun + 'できない',
    ishou: noun + 'しよう',
    meirei: noun + 'しろ',
    eba: noun + 'すれば',
    ebaNeg: noun + 'しなければ',
    ukemi: noun + 'される',
    shieki: noun + 'させる',
    shiekiukemi: noun + 'させられる',
    nasai: noun + 'しなさい',
    sonkeigo,
    kenjougo,
  }
}

function kuruTable(base) {
  const kanji = base.kamus === '来る'
  return {
    masu: kanji ? '来ます' : 'きます',
    masuNeg: kanji ? '来ません' : 'きません',
    masuPast: kanji ? '来ました' : 'きました',
    masuPastNeg: kanji ? '来ませんでした' : 'きませんでした',
    kamus: base.kamus,
    nai: kanji ? '来ない' : 'こない',
    nakatta: kanji ? '来なかった' : 'こなかった',
    te: kanji ? '来て' : 'きて',
    ta: kanji ? '来た' : 'きた',
    tara: kanji ? '来たら' : 'きたら',
    taraNeg: kanji ? '来なかったら' : 'こなかったら',
    kanou: kanji ? '来られる' : 'こられる',
    kanouNeg: kanji ? '来られない' : 'こられない',
    ishou: kanji ? '来よう' : 'こよう',
    meirei: kanji ? '来い' : 'こい',
    eba: kanji ? '来れば' : 'くれば',
    ebaNeg: kanji ? '来なければ' : 'こなければ',
    ukemi: kanji ? '来られる' : 'こられる',
    shieki: kanji ? '来させる' : 'こさせる',
    shiekiukemi: kanji ? '来させられる' : 'こさせられる',
    nasai: kanji ? '来なさい' : 'きなさい',
    sonkeigo: 'いらっしゃる',
    kenjougo: '参る',
  }
}

function aruTable(base) {
  const stem = base.stem
  return {
    masu: base.hira,
    masuNeg: stem + 'ません',
    masuPast: stem + 'ました',
    masuPastNeg: stem + 'ませんでした',
    kamus: base.kamus,
    nai: 'ない',
    nakatta: 'なかった',
    te: 'あって',
    ta: 'あった',
    tara: 'あったら',
    taraNeg: 'なかったら',
    kanou: 'ありうる',
    kanouNeg: 'ありえない',
    ishou: 'あろう',
    meirei: 'あれ',
    eba: 'あれば',
    ebaNeg: 'なければ',
    ukemi: 'あられる',
    shieki: 'あらせる',
    shiekiukemi: 'あらせられる',
    nasai: 'ありなさい',
    sonkeigo: 'ございます',
    kenjougo: 'ございます',
  }
}

import { SPECIAL_KEIGO } from './keigo.js'

export function conjugateAll(base) {
  // Analyzers store the normalized input as inputHira; tables use `hira`.
  // Dictionary-form input does not end in ます, so rebuild the polite form
  // from the masu stem before applying the endings.
  const rawHira = base.hira ?? base.inputHira
  const hira =
    rawHira?.endsWith('ます') || !base.stem ? rawHira : `${base.stem}ます`
  const normalized = { ...base, hira }
  const table = computeTable(normalized)
  const special = SPECIAL_KEIGO[normalized.kamus]
  if (special) {
    table.sonkeigo = special[0]
    table.kenjougo = special[1]
  }
  return table
}

function computeTable(base) {
  if (base.kamus === 'ある' || base.kamus === '有る') {
    return aruTable(base)
  }
  if (base.suruNoun !== null && base.suruNoun !== undefined) {
    return suruTable(base)
  }
  if (base.golongan === 'irregular') {
    return kuruTable(base)
  }
  if (base.golongan === 'ichidan') {
    return ichidanTable(base)
  }
  return godanTable(base)
}

// Indonesian passive is irregular enough that a small map beats blind
// prefixing. Unknown verbs fall back to a neutral phrase.
const PASSIVE = {
  makan: 'dimakan',
  minum: 'diminum',
  melihat: 'dilihat',
  mendengar: 'didengar',
  membaca: 'dibaca',
  menulis: 'ditulis',
  membeli: 'dibeli',
  menjual: 'dijual',
  mengambil: 'diambil',
  memanggil: 'dipanggil',
  menunggu: 'ditunggu',
  mengajar: 'diajari',
  membantu: 'dibantu',
  mencuci: 'dicuci',
  membersihkan: 'dibersihkan',
  membuat: 'dibuat',
  menggunakan: 'digunakan',
  memakai: 'dipakai',
  meminjam: 'dipinjam',
  mengembalikan: 'dikembalikan',
  mencuri: 'dicuri',
  memukul: 'dipukul',
  menendang: 'ditendang',
  menyuruh: 'disuruh',
  mengajak: 'diajak',
  mengirim: 'dikirim',
  memberi: 'diberi',
  menunjukkan: 'ditunjukkan',
  mengatakan: 'dikatakan',
  menanyakan: 'ditanyakan',
  mengunjungi: 'dikunjungi',
  memasak: 'dimasak',
  menyanyi: 'dinyanyikan',
  membawa: 'dibawa',
  memotong: 'dipotong',
  merusak: 'dirusak',
  memperbaiki: 'diperbaiki',
  menyimpan: 'disimpan',
  membayar: 'dibayar',
  menjelaskan: 'dijelaskan',
  mengingat: 'diingat',
  melupakan: 'dilupakan',
  belajar: 'dipelajari',
  menyalin: 'disalin',
  menerima: 'diterima',
  menemukan: 'ditemukan',
  mencari: 'dicari',
  menjemput: 'dijemput',
  mengantar: 'diantar',
  menolong: 'ditolong',
  menceritakan: 'diceritakan',
  bertanya: 'ditanyai',
  menjawab: 'dijawab',
  menikah: 'dinikahi',
  memotret: 'difoto',
  menyalakan: 'dinyalakan',
  mematikan: 'dimatikan',
  membuka: 'dibuka',
  menutup: 'ditutup',
  memasukkan: 'dimasukkan',
  mengeluarkan: 'dikeluarkan',
  memulai: 'dimulai',
  bekerja: 'dikerjakan',
  bermain: 'dimainkan',
}

// Rare verbs (such as ある) have no natural Indonesian passive. Instead of
// inventing "mengalami ada", fall back to a metalinguistic description.
function passiveForm(meaning, suffix = '') {
  const direct = PASSIVE[meaning]
  if (direct) return suffix ? `${direct}${suffix}` : direct
  return `bentuk pasif${suffix} dari "${meaning}"`
}

export function verbGloss(kind, meaning) {
  const m = meaning || ''
  if (!m) return ''
  const table = {
    plain: m,
    masu: m,
    masuNeg: `tidak ${m}`,
    masuPast: `sudah ${m}`,
    masuPastNeg: `tidak ${m} (lampau)`,
    nai: `tidak ${m}`,
    nakatta: `tidak ${m} (lampau)`,
    te: `${m}, lalu ...`,
    ta: `sudah ${m}`,
    tara: `kalau ${m}`,
    taraNeg: `kalau tidak ${m}`,
    kanou: `bisa ${m}`,
    kanouNeg: `tidak bisa ${m}`,
    kanouPast: `bisa ${m} (lampau)`,
    ishou: `mari ${m}`,
    ishouPolite: `mari ${m} (sopan)`,
    meirei: `${m}!`,
    meireiNeg: `jangan ${m}`,
    nasai: `${m} (perintah halus)`,
    eba: `kalau ${m}`,
    ebaNeg: `kalau tidak ${m}`,
    ukemi: passiveForm(m),
    ukemiNeg: passiveForm(m, ' (negatif)'),
    ukemiPast: passiveForm(m, ' (lampau)'),
    shieki: `menyuruh ${m}`,
    shiekiNeg: `tidak menyuruh ${m}`,
    shiekiPast: `menyuruh ${m} (lampau)`,
    shiekiukemi: `disuruh ${m}`,
    shiekiukemiNeg: `tidak disuruh ${m}`,
    shiekiukemiPast: `disuruh ${m} (lampau)`,
    sonkeigo: `${m} (bentuk hormat)`,
    kenjougo: `${m} (bentuk rendah hati)`,
  }
  return table[kind] ?? m
}

export function politeOf(ruForm) {
  return ruForm.endsWith('る') ? `${ruForm.slice(0, -1)}ます` : ruForm
}
