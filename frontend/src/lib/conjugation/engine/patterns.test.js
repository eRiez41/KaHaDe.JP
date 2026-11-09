import { describe, expect, test } from 'vitest'

import { buildIAdjectiveForms, buildNaAdjectiveForms, buildNounForms, buildVerbForms } from './conjugate.js'
import {
  GROUP_ORDER,
  buildPatternTables,
  listAllPatterns,
  loadPatterns,
} from '../patternsLoader.js'

function verbAnalysis(kamus = 'たべる', golongan = 'ichidan', meaning = 'makan') {
  return {
    classType: 'verb',
    kamus,
    meaning,
    forms: buildVerbForms(kamus, { golongan }),
  }
}

describe('pattern database', () => {
  test('has at least 25 Phase 1 verb patterns', () => {
    const patterns = loadPatterns({ classType: 'verb', phase: 1 })
    expect(patterns.length).toBeGreaterThanOrEqual(25)
  })

  test('every id is unique', () => {
    const ids = listAllPatterns().map((pattern) => pattern.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  test('Phase 2 patterns are gated out', () => {
    const phase1 = loadPatterns({ classType: 'verb', phase: 1 }).map((pattern) => pattern.id)
    expect(phase1).not.toContain('tara')
    expect(phase1).not.toContain('passive')
    expect(phase1).not.toContain('causative')
  })

  test('only patterns for the requested class are returned', () => {
    const adjective = loadPatterns({ classType: 'i-adjective', phase: 1 })
    expect(adjective.every((pattern) => pattern.classes.includes('i-adjective'))).toBe(true)
  })
})

describe('pattern slots', () => {
  const { rows, groups } = buildPatternTables(verbAnalysis())
  const byId = new Map(rows.map((row) => [row.id, row]))

  test('Bentuk Dasar is the first group', () => {
    expect(groups[0].name).toBe('Bentuk Dasar')
    expect(GROUP_ORDER[0]).toBe('Bentuk Dasar')
  })

  test('base te form', () => {
    expect(byId.get('base_te').jp).toBe('たべて')
    expect(byId.get('base_masu_stem').jp).toBe('たべ')
  })

  test('te_iru', () => {
    expect(byId.get('te_iru').jp).toBe('たべている')
    expect(byId.get('te_iru').romaji).toBe('tabeteiru')
  })

  test('te_kudasai', () => {
    expect(byId.get('te_kudasai').jp).toBe('たべてください')
    expect(byId.get('te_kudasai').romaji).toBe('tabete kudasai')
  })

  test('te_mo_ii', () => {
    expect(byId.get('te_mo_ii').jp).toBe('たべてもいいです')
  })

  test('te_wa_ikenai', () => {
    expect(byId.get('te_wa_ikenai').jp).toBe('たべてはいけません')
  })

  test('te_kara', () => {
    expect(byId.get('te_kara').jp).toBe('たべてから')
  })

  test('te_shimau', () => {
    expect(byId.get('te_shimau').jp).toBe('たべてしまう')
  })

  test('tai', () => {
    expect(byId.get('tai').jp).toBe('たべたいです')
    expect(byId.get('tai').romaji).toBe('tabetai desu')
  })

  test('takunakatta', () => {
    expect(byId.get('takunakatta').jp).toBe('たべたくなかったです')
  })

  test('nai_de_kudasai', () => {
    expect(byId.get('nai_de_kudasai').jp).toBe('たべないでください')
    expect(byId.get('nai_de_kudasai').romaji).toBe('tabenaide kudasai')
  })

  test('nakereba_narimasen', () => {
    expect(byId.get('nakereba_narimasen').jp).toBe('たべなければなりません')
    expect(byId.get('nakereba_narimasen').romaji).toBe('tabenakereba narimasen')
  })

  test('nakute_mo_ii', () => {
    expect(byId.get('nakute_mo_ii').jp).toBe('たべなくてもいいです')
  })

  test('koto_ga_dekiru', () => {
    expect(byId.get('koto_ga_dekiru').jp).toBe('たべることができます')
    expect(byId.get('koto_ga_dekiru').romaji).toBe('taberu koto ga dekimasu')
  })

  test('koto_ga_aru uses ta-form', () => {
    expect(byId.get('koto_ga_aru').jp).toBe('たべたことがあります')
    expect(byId.get('koto_ga_aru').romaji).toBe('tabeta koto ga arimasu')
  })

  test('koto_ni_suru', () => {
    expect(byId.get('koto_ni_suru').jp).toBe('たべることにします')
  })

  test('mae_ni', () => {
    expect(byId.get('mae_ni').jp).toBe('たべるまえに')
  })

  test('ato_de', () => {
    expect(byId.get('ato_de').jp).toBe('たべたあとで')
  })

  test('tari', () => {
    expect(byId.get('tari').jp).toBe('たべたり')
  })

  test('ni_iku', () => {
    expect(byId.get('ni_iku').jp).toBe('たべにいきます')
    expect(byId.get('ni_iku').romaji).toBe('tabe ni ikimasu')
  })

  test('nagara', () => {
    expect(byId.get('nagara').jp).toBe('たべながら')
  })

  test('keigo is kana only', () => {
    expect(byId.get('sonkeigo').jp).toBe('めしあがる')
    expect(byId.get('kenjougo').jp).toBe('いただく')
  })

  test('meaning is filled from the dictionary gloss', () => {
    expect(byId.get('te_iru').meaning).toBe('sedang makan')
    expect(byId.get('koto_ga_aru').meaning).toBe('pernah makan')
  })
})

describe('adjective and noun patterns', () => {
  test('i-adjective extra forms', () => {
    const { rows } = buildPatternTables({
      classType: 'i-adjective',
      kamus: 'たかい',
      meaning: 'tinggi',
      forms: buildIAdjectiveForms('たかい'),
    })
    const byId = new Map(rows.map((row) => [row.id, row]))
    expect(byId.get('base_adj_te').jp).toBe('たかくて')
    expect(byId.get('base_adj_adverb').jp).toBe('たかく')
    expect(byId.get('i_naru').jp).toBe('たかくなる')
    expect(byId.get('i_sou').jp).toBe('たかそう')
    expect(byId.get('i_sugiru').jp).toBe('たかすぎる')
  })

  test('na-adjective extra forms', () => {
    const { rows } = buildPatternTables({
      classType: 'na-adjective',
      kamus: 'げんき',
      meaning: 'sehat',
      forms: buildNaAdjectiveForms('げんき'),
    })
    const byId = new Map(rows.map((row) => [row.id, row]))
    expect(byId.get('base_na_te').jp).toBe('げんきで')
    expect(byId.get('base_na_adverb').jp).toBe('げんきに')
    expect(byId.get('base_na_attributive').jp).toBe('げんきな')
    expect(byId.get('na_naru').jp).toBe('げんきになる')
  })

  test('noun extra forms', () => {
    const { rows } = buildPatternTables({
      classType: 'noun',
      kamus: 'がくせい',
      meaning: 'siswa',
      forms: buildNounForms('がくせい'),
    })
    const byId = new Map(rows.map((row) => [row.id, row]))
    expect(byId.get('base_noun_de').jp).toBe('がくせいで')
    expect(byId.get('noun_naru').jp).toBe('がくせいになる')
  })
})
