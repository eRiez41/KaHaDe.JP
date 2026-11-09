import { beforeEach, describe, expect, test, vi } from 'vitest'

vi.mock('../api.js', () => {
  const FIXTURES = {
    たべる: {
      query: 'たべる',
      word: '食べる',
      reading: 'たべる',
      meanings: ['makan'],
      meaningsEn: ['to eat'],
      partsOfSpeech: ['Ichidan verb', 'Transitive verb'],
      jlpt: 'N5',
      isCommon: true,
      translated: true,
    },
    のむ: {
      query: 'のむ',
      word: '飲む',
      reading: 'のむ',
      meanings: ['minum'],
      meaningsEn: ['to drink'],
      partsOfSpeech: ['Godan verb with mu ending', 'Transitive verb'],
      jlpt: 'N5',
      isCommon: true,
      translated: true,
    },
    かえる: {
      query: 'かえる',
      word: '帰る',
      reading: 'かえる',
      meanings: ['pulang'],
      meaningsEn: ['to return home'],
      partsOfSpeech: ['Godan verb with ru ending', 'Intransitive verb'],
      jlpt: 'N5',
      isCommon: true,
      translated: true,
    },
    帰る: {
      query: '帰る',
      word: '帰る',
      reading: 'かえる',
      meanings: ['pulang'],
      meaningsEn: ['to return home'],
      partsOfSpeech: ['Godan verb with ru ending', 'Intransitive verb'],
      jlpt: 'N5',
      isCommon: true,
      translated: true,
    },
    変える: {
      query: '変える',
      word: '変える',
      reading: 'かえる',
      meanings: ['mengubah'],
      meaningsEn: ['to change'],
      partsOfSpeech: ['Ichidan verb', 'Transitive verb'],
      jlpt: 'N4',
      isCommon: true,
      translated: true,
    },
    蛙: {
      query: '蛙',
      word: '蛙',
      reading: 'かえる',
      meanings: ['katak'],
      meaningsEn: ['frog'],
      partsOfSpeech: ['Noun'],
      jlpt: 'N3',
      isCommon: false,
      translated: true,
    },
    がくせい: {
      query: 'がくせい',
      word: '学生',
      reading: 'がくせい',
      meanings: ['siswa'],
      meaningsEn: ['student'],
      partsOfSpeech: ['Noun'],
      jlpt: 'N5',
      isCommon: true,
      translated: true,
    },
    たかい: {
      query: 'たかい',
      word: '高い',
      reading: 'たかい',
      meanings: ['tinggi'],
      meaningsEn: ['tall', 'expensive'],
      partsOfSpeech: ['I-adjective'],
      jlpt: 'N5',
      isCommon: true,
      translated: true,
    },
    げんき: {
      query: 'げんき',
      word: '元気',
      reading: 'げんき',
      meanings: ['sehat'],
      meaningsEn: ['healthy'],
      partsOfSpeech: ['Na-adjective', 'Noun'],
      jlpt: 'N5',
      isCommon: true,
      translated: true,
    },
    いい: {
      query: 'いい',
      word: 'いい',
      reading: 'いい',
      meanings: ['bagus'],
      meaningsEn: ['good'],
      partsOfSpeech: ['I-adjective'],
      jlpt: 'N5',
      isCommon: true,
      translated: true,
    },
  }

  return {
    lookupWord: vi.fn(async (query) => {
      const entry = FIXTURES[query]
      if (entry) {
        return structuredClone(entry)
      }
      const error = new Error('kata tidak ditemukan di kamus')
      error.status = 404
      throw error
    }),
  }
})

import { lookupWord } from '../api.js'
import { analyzeWord } from './validate.js'

describe('analyzeWord', () => {
  beforeEach(() => {
    vi.mocked(lookupWord).mockClear()
  })

  test('dictionary input produces one candidate', async () => {
    const result = await analyzeWord('たべる')
    expect(result.candidates).toHaveLength(1)
    expect(result.candidates[0].classType).toBe('verb')
    expect(result.candidates[0].golongan).toBe('ichidan')
    expect(result.input.form).toBe('dictionary')
  })

  test('masu input reverses to dictionary form', async () => {
    const result = await analyzeWord('たべます')
    expect(result.input.form).toBe('masu')
    expect(result.candidates[0].kamus).toBe('たべる')
    expect(result.candidates[0].primary[0].jp).toBe('たべます')
  })

  test('romaji input is normalized', async () => {
    const result = await analyzeWord('tabemasu')
    expect(result.input.hira).toBe('たべます')
    expect(result.candidates[0].kamus).toBe('たべる')
  })

  test('katakana input is normalized to hiragana', async () => {
    const result = await analyzeWord('タベマス')
    expect(result.input.hira).toBe('たべます')
  })

  test('て-form input reverses correctly', async () => {
    const result = await analyzeWord('のんで')
    expect(result.candidates[0].kamus).toBe('のむ')
    expect(result.candidates[0].golongan).toBe('godan')
  })

  test('かえる shows three ambiguity candidates', async () => {
    const result = await analyzeWord('かえる')
    expect(result.candidates).toHaveLength(3)
    expect(result.candidates.map((candidate) => candidate.classType)).toEqual([
      'verb',
      'verb',
      'noun',
    ])
    expect(result.candidates.map((candidate) => candidate.golongan)).toEqual([
      'godan',
      'ichidan',
      null,
    ])
  })

  test('かえって keeps only the matching candidate', async () => {
    const result = await analyzeWord('かえって')
    expect(result.candidates).toHaveLength(1)
    expect(result.candidates[0].word).toBe('帰る')
  })

  test('noun input is classified', async () => {
    const result = await analyzeWord('がくせい')
    expect(result.candidates[0].classType).toBe('noun')
    expect(result.candidates[0].primary[0].jp).toBe('がくせいです')
  })

  test('i-adjective input has the expected forms', async () => {
    const result = await analyzeWord('たかい')
    const candidate = result.candidates[0]
    expect(candidate.classType).toBe('i-adjective')
    expect(candidate.primary[0].jp).toBe('たかいです')
    expect(candidate.forms.neg).toBe('たかくない')
  })

  test('na-adjective input is classified before noun', async () => {
    const result = await analyzeWord('げんき')
    expect(result.candidates[0].classType).toBe('na-adjective')
    expect(result.candidates[0].primary[4].jp).toBe('げんきだ')
  })

  test('いい keeps the いい surface and uses よ stem', async () => {
    const result = await analyzeWord('いい')
    expect(result.candidates[0].forms.past).toBe('よかった')
    expect(result.candidates[0].primary[4].jp).toBe('いい')
  })

  test('unknown word throws a friendly error', async () => {
    await expect(analyzeWord('ぬぬぬ')).rejects.toThrow(/tidak ditemukan/)
  })

  test('input is validated before network calls', async () => {
    await expect(analyzeWord('')).rejects.toThrow(/kosong/)
    await expect(analyzeWord('a b')).rejects.toThrow(/tanpa spasi/)
  })
})
