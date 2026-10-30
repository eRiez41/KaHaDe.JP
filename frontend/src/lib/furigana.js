import { toRomaji } from 'wanakana'

// Furigana readings for example words used across the app.
// Each entry is a list of segments: a plain string, or [kanji, reading].
export const RUBY = {
  // Group names
  '五段': [['五', 'ご'], ['段', 'だん']],
  '一段': [['一', 'いち'], ['段', 'だん']],
  '不規則': [['不', 'ふ'], ['規', 'き'], ['則', 'そく']],

  // Godan examples (masu form)
  '書きます': [['書', 'か'], 'きます'],
  '泳ぎます': [['泳', 'およ'], 'ぎます'],
  '話します': [['話', 'はな'], 'します'],
  '待ちます': [['待', 'ま'], 'ちます'],
  '死にます': [['死', 'し'], 'にます'],
  '飲みます': [['飲', 'の'], 'みます'],
  '遊びます': [['遊', 'あそ'], 'びます'],
  '取ります': [['取', 'と'], 'ります'],
  '買います': [['買', 'か'], 'います'],

  // Ichidan examples
  '食べます': [['食', 'た'], 'べます'],
  '見ます': [['見', 'み'], 'ます'],
  '起きます': [['起', 'お'], 'きます'],
  '寝ます': [['寝', 'ね'], 'ます'],
  '出ます': [['出', 'で'], 'ます'],
  '出来ます': [['出', 'で'], ['来', 'き'], 'ます'],
  '借ります': [['借', 'か'], 'ります'],
  '浴びます': [['浴', 'あ'], 'びます'],
  '伸びます': [['伸', 'の'], 'びます'],
  '詫びます': [['詫', 'わ'], 'びます'],
  '信じます': [['信', 'しん'], 'じます'],
  '落ちます': [['落', 'お'], 'ちます'],
  '過ぎます': [['過', 'す'], 'ぎます'],
  '感じます': [['感', 'かん'], 'じます'],
  '閉じます': [['閉', 'と'], 'じます'],
  '降ります': [['降', 'お'], 'ります'],
  '用います': [['用', 'もち'], 'います'],
  '飽きます': [['飽', 'あ'], 'きます'],
  '懲ります': [['懲', 'こ'], 'ります'],

  // Irregular
  '来ます': [['来', 'き'], 'ます'],
  '来て': [['来', 'き'], 'て'],
  '来る': [['来', 'き'], 'る'],
  '来ない': [['来', 'こ'], 'ない'],
  '来なかった': [['来', 'こ'], 'なかった'],
  '来なくて': [['来', 'こ'], 'なくて'],
  '来ないで': [['来', 'こ'], 'ないで'],

  // Dictionary form
  '書く': [['書', 'か'], 'く'],
  '食べる': [['食', 'た'], 'べる'],
  '見る': [['見', 'み'], 'る'],
  '行く': [['行', 'い'], 'く'],
  '帰る': [['帰', 'かえ'], 'る'],
  '入る': [['入', 'はい'], 'る'],
  '走る': [['走', 'はし'], 'る'],
  '切る': [['切', 'き'], 'る'],
  '知る': [['知', 'し'], 'る'],
  '要る': [['要', 'い'], 'る'],
  '減る': [['減', 'へ'], 'る'],
  '滑る': [['滑', 'すべ'], 'る'],

  // Te-form examples
  '書いて': [['書', 'か'], 'いて'],
  '買って': [['買', 'か'], 'って'],
  '待って': [['待', 'ま'], 'って'],
  '取って': [['取', 'と'], 'って'],
  '飲んで': [['飲', 'の'], 'んで'],
  '遊んで': [['遊', 'あそ'], 'んで'],
  '死んで': [['死', 'し'], 'んで'],
  '泳いで': [['泳', 'およ'], 'いで'],
  '話して': [['話', 'はな'], 'して'],
  '食べて': [['食', 'た'], 'べて'],
  '見て': [['見', 'み'], 'て'],

  // Exceptions
  '行きます': [['行', 'い'], 'きます'],
  '行って': [['行', 'い'], 'って'],
  '行いて': [['行', 'い'], 'いて'],
  '帰って': [['帰', 'かえ'], 'って'],
  '入って': [['入', 'はい'], 'って'],
  '走って': [['走', 'はし'], 'って'],
  '切って': [['切', 'き'], 'って'],
  '知って': [['知', 'し'], 'って'],
  '要って': [['要', 'い'], 'って'],
  '減って': [['減', 'へ'], 'って'],
  '滑って': [['滑', 'すべ'], 'って'],
}

const KANJI_RE = /[\u4e00-\u9faf\u3005\u3006]/

// Reading of a leading kanji run, learned from the dictionary.
// Used to build furigana for derived forms (e.g. 食べます → 食べる).
const KANJI_PREFIX = (() => {
  const map = {}
  for (const segments of Object.values(RUBY)) {
    const kanji = []
    const readings = []
    for (const segment of segments) {
      if (!Array.isArray(segment)) break
      kanji.push(segment[0])
      readings.push(segment[1])
    }
    const key = kanji.join('')
    if (key && !map[key]) map[key] = readings.join('')
  }
  return map
})()

export function hasKanji(text) {
  return KANJI_RE.test(text || '')
}

// Returns segment list, or null when the text has no kanji (kana-only).
export function rubySegments(text) {
  if (!text) return []
  if (RUBY[text]) return RUBY[text]
  if (!hasKanji(text)) return null

  const run = text.match(/[\u4e00-\u9faf\u3005\u3006]+/)?.[0] ?? ''
  for (let len = run.length; len > 0; len--) {
    const key = run.slice(0, len)
    const reading = KANJI_PREFIX[key]
    if (reading) {
      return [[key, reading], text.slice(key.length)]
    }
  }
  return [text]
}

// Romaji used as ruby for kana-only words.
export function romajiOf(text) {
  try {
    return toRomaji(text)
  } catch {
    return ''
  }
}
