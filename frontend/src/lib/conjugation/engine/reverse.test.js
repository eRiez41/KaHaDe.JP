import { describe, expect, test } from 'vitest'

import { detectForm } from './detectForm.js'
import { AMBIGUOUS_KANA, reverseToKamus } from './reverse.js'

describe('form detection', () => {
  test.each([
    ['たべる', 'dictionary'],
    ['たべます', 'masu'],
    ['たべました', 'masu'],
    ['たべません', 'masu'],
    ['たべませんでした', 'masu'],
    ['たべて', 'te'],
    ['のんで', 'te'],
    ['たべた', 'ta'],
    ['のんだ', 'ta'],
    ['たべない', 'nai'],
    ['たべなかった', 'nai'],
  ])('%s → %s', (input, form) => {
    expect(detectForm(input).form).toBe(form)
  })
})

describe('reverse masu', () => {
  test('ichidan', () => {
    expect(reverseToKamus('たべます').kamus).toBe('たべる')
  })

  test('godan', () => {
    expect(reverseToKamus('のみます').kamus).toBe('のむ')
    expect(reverseToKamus('かいます').kamus).toBe('かう')
    expect(reverseToKamus('かきます').kamus).toBe('かく')
  })

  test('irregular', () => {
    expect(reverseToKamus('します').kamus).toBe('する')
    expect(reverseToKamus('きます').kamus).toBe('くる')
  })

  test('negative and past variants', () => {
    expect(reverseToKamus('たべません').kamus).toBe('たべる')
    expect(reverseToKamus('たべました').kamus).toBe('たべる')
    expect(reverseToKamus('たべませんでした').kamus).toBe('たべる')
  })
})

describe('reverse te-form', () => {
  test.each([
    ['たべて', 'たべる'],
    ['みて', 'みる'],
    ['のんで', 'のむ'],
    ['とって', 'とる'],
    ['かいて', 'かく'],
    ['いそいで', 'いそぐ'],
    ['はなして', 'はなす'],
    ['まって', 'まつ'],
    ['あそんで', 'あそぶ'],
    ['しんで', 'しぬ'],
  ])('%s → %s', (input, expected) => {
    expect(reverseToKamus(input).kamus).toBe(expected)
  })

  test('irregular and exceptions', () => {
    expect(reverseToKamus('して').kamus).toBe('する')
    expect(reverseToKamus('きて').kamus).toBe('くる')
    expect(reverseToKamus('いって').kamus).toBe('いく')
    expect(reverseToKamus('かえって').kamus).toBe('かえる')
    expect(reverseToKamus('はしって').kamus).toBe('はしる')
  })
})

describe('reverse ta-form', () => {
  test.each([
    ['たべた', 'たべる'],
    ['のんだ', 'のむ'],
    ['とった', 'とる'],
    ['かいた', 'かく'],
    ['いそいだ', 'いそぐ'],
    ['はなした', 'はなす'],
    ['まった', 'まつ'],
    ['あそんだ', 'あそぶ'],
    ['しんだ', 'しぬ'],
  ])('%s → %s', (input, expected) => {
    expect(reverseToKamus(input).kamus).toBe(expected)
  })

  test('irregular and exceptions', () => {
    expect(reverseToKamus('した').kamus).toBe('する')
    expect(reverseToKamus('きた').kamus).toBe('くる')
    expect(reverseToKamus('いった').kamus).toBe('いく')
  })
})

describe('reverse nai-form', () => {
  test.each([
    ['たべない', 'たべる'],
    ['のまない', 'のむ'],
    ['かわない', 'かう'],
    ['かかない', 'かく'],
    ['いかない', 'いく'],
    ['しない', 'する'],
    ['こない', 'くる'],
  ])('%s → %s', (input, expected) => {
    expect(reverseToKamus(input).kamus).toBe(expected)
  })

  test('nakatta', () => {
    expect(reverseToKamus('たべなかった').kamus).toBe('たべる')
    expect(reverseToKamus('のまなかった').kamus).toBe('のむ')
  })
})

describe('ambiguity', () => {
  test('かえる has three curated candidates', () => {
    const result = reverseToKamus('かえる')
    expect(result.kandidat).toHaveLength(3)
    expect(result.kandidat.map((item) => item.word)).toEqual(['帰る', '変える', '蛙'])
  })

  test('きる has three curated candidates', () => {
    expect(reverseToKamus('きる').kandidat.map((item) => item.word)).toEqual([
      '切る',
      '着る',
      '斬る',
    ])
  })

  test('いる has three curated candidates', () => {
    expect(reverseToKamus('いる').kandidat.map((item) => item.word)).toEqual([
      '居る',
      '要る',
      '射る',
    ])
  })

  test('curated map is exposed', () => {
    expect(Object.keys(AMBIGUOUS_KANA)).toEqual(['かえる', 'きる', 'いる'])
  })

  test('empty input throws', () => {
    expect(() => reverseToKamus('')).toThrow(/kosong/)
  })
})
