// Verb dictionaries used to resolve ambiguous masu-stem patterns.
// Keys include both the kanji form and the kana (masu) form.

// Godan verbs whose masu-stem ends in an i-dan kana, so they look Ichidan.
export const GODAN_LOOKS_ICHIDAN = new Set([
  '帰ります',
  'かえります',
  '入ります',
  'はいります',
  '走ります',
  'はしります',
  '切ります',
  'きります',
  '知ります',
  'しります',
  '要ります',
  'いります',
  '減ります',
  'へります',
  '滑ります',
  'すべります',
  '蹴ります',
  'けります',
  '混じります',
  'まじります',
  '限ります',
  'かぎります',
  '焦ります',
  'あせります',
  '握ります',
  'にぎります',
  '座ります',
  'すわります',
  '光ります',
  'ひかります',
  '怒ります',
  'おこります',
  '困ります',
  'こまります',
])

// Ichidan verbs whose masu-stem ends in an i-dan kana (or has no kana at all).
export const ICHIDAN_STEMS = new Set([
  '見ます',
  'みます',
  '寝ます',
  'ねます',
  '出ます',
  'でます',
  '得ます',
  'えます',
  '経ます',
  'へます',
  '着ます',
  '似ます',
  'にます',
  '煮ます',
  '居ます',
  'います',
  '起きます',
  'おきます',
  '借ります',
  'かります',
  '浴びます',
  'あびます',
  '伸びます',
  'のびます',
  '詫びます',
  'わびます',
  '信じます',
  'しんじます',
  '落ちます',
  'おちます',
  '過ぎます',
  'すぎます',
  '感じます',
  'かんじます',
  '閉じます',
  'とじます',
  '降ります',
  'おります',
  '出来ます',
  'できます',
  '用います',
  'もちいます',
  '飽きます',
  'あきます',
  '懲ります',
  'こります',
])

// 行く is the one -ki verb that becomes -tte.
export const SPECIAL_IKU = new Set(['行きます', 'いきます'])

export function isGodanLooksIchidan(key) {
  return GODAN_LOOKS_ICHIDAN.has(key)
}

export function isKnownIchidan(key) {
  return ICHIDAN_STEMS.has(key)
}

export function isSpecialIku(key) {
  return SPECIAL_IKU.has(key)
}

// ---------------------------------------------------------------------------
// Dictionary-form exception sets for the v2 conjugation engine.
// The masu-form sets above stay untouched so the legacy modules keep working.
// ---------------------------------------------------------------------------

// Godan verbs that end in -ru and look like Ichidan verbs. Kana entries are
// included because the v2 engine works on readings first.
export const GODAN_LOOKS_ICHIDAN_KAMUS = new Set([
  '帰る',
  'かえる',
  '入る',
  'はいる',
  '走る',
  'はしる',
  '切る',
  'きる',
  '知る',
  'しる',
  '要る',
  '減る',
  'へる',
  '滑る',
  'すべる',
  '蹴る',
  'ける',
  '混じる',
  'まじる',
  '限る',
  'かぎる',
  '焦る',
  'あせる',
  '握る',
  'にぎる',
  '座る',
  'すわる',
  '光る',
  'ひかる',
  '怒る',
  'おこる',
  '困る',
  'こまる',
])

// Ichidan verbs whose kana form would otherwise be ambiguous with a Godan verb.
export const ICHIDAN_KAMUS = new Set([
  '見る',
  'みる',
  '寝る',
  'ねる',
  '出る',
  'でる',
  '得る',
  'える',
  '経る',
  'へる',
  '着る',
  'きる',
  '似る',
  'にる',
  '煮る',
  'にる',
  '居る',
  'いる',
  '起きる',
  'おきる',
  '借りる',
  'かりる',
  '浴びる',
  'あびる',
  '伸びる',
  'のびる',
  '詫びる',
  'わびる',
  '信じる',
  'しんじる',
  '落ちる',
  'おちる',
  '過ぎる',
  'すぎる',
  '感じる',
  'かんじる',
  '閉じる',
  'とじる',
  '降りる',
  'おりる',
  '出来る',
  'できる',
  '用いる',
  'もちいる',
  '飽きる',
  'あきる',
  '懲りる',
  'こりる',
])

export const ARU_KAMUS = new Set(['ある', '有る'])
export const IKU_KAMUS = new Set(['行く', 'いく'])
export const KURU_KAMUS = new Set(['来る', 'くる'])
export const SURU_KAMUS = new Set(['する', '為る'])

export function isGodanLooksIchidanKamus(key) {
  return GODAN_LOOKS_ICHIDAN_KAMUS.has(key)
}

export function isKnownIchidanKamus(key) {
  return ICHIDAN_KAMUS.has(key)
}

export function isAruKamus(key) {
  return ARU_KAMUS.has(key)
}

export function isIkuKamus(key) {
  return IKU_KAMUS.has(key)
}

export function isKuruKamus(key) {
  return KURU_KAMUS.has(key)
}

export function isSuruKamus(key) {
  return SURU_KAMUS.has(key)
}

export function isSuruCompoundKamus(key) {
  return key.length > 2 && key.endsWith('する')
}
