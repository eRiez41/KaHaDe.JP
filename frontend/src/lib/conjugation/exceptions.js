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
