import { describe, expect, test } from 'vitest'

import {
  buildIAdjectiveForms,
  buildNaAdjectiveForms,
  buildNounForms,
  buildPrimaryRows,
  conjugate,
} from './conjugate.js'

describe('godan conjugation', () => {
  test('のむ — full basic set', () => {
    expect(conjugate('のむ', 'masu')).toBe('のみます')
    expect(conjugate('のむ', 'masen')).toBe('のみません')
    expect(conjugate('のむ', 'mashita')).toBe('のみました')
    expect(conjugate('のむ', 'masendeshita')).toBe('のみませんでした')
    expect(conjugate('のむ', 'te_form')).toBe('のんで')
    expect(conjugate('のむ', 'ta_form')).toBe('のんだ')
    expect(conjugate('のむ', 'nai_form')).toBe('のまない')
    expect(conjugate('のむ', 'nakatta')).toBe('のまなかった')
  })

  test('のむ — derived forms', () => {
    expect(conjugate('のむ', 'potential')).toBe('のめる')
    expect(conjugate('のむ', 'passive')).toBe('のまれる')
    expect(conjugate('のむ', 'causative')).toBe('のませる')
    expect(conjugate('のむ', 'ba')).toBe('のめば')
    expect(conjugate('のむ', 'volitional')).toBe('のもう')
    expect(conjugate('のむ', 'imperative')).toBe('のめ')
    expect(conjugate('のむ', 'tai')).toBe('のみたい')
  })

  test('かう — う ending', () => {
    expect(conjugate('かう', 'masu')).toBe('かいます')
    expect(conjugate('かう', 'te_form')).toBe('かって')
    expect(conjugate('かう', 'nai_form')).toBe('かわない')
    expect(conjugate('かう', 'potential')).toBe('かえる')
    expect(conjugate('かう', 'passive')).toBe('かわれる')
  })

  test('かく — く ending', () => {
    expect(conjugate('かく', 'masu')).toBe('かきます')
    expect(conjugate('かく', 'te_form')).toBe('かいて')
    expect(conjugate('かく', 'ta_form')).toBe('かいた')
    expect(conjugate('かく', 'nai_form')).toBe('かかない')
  })

  test('いそぐ — ぐ ending', () => {
    expect(conjugate('いそぐ', 'te_form')).toBe('いそいで')
    expect(conjugate('いそぐ', 'ta_form')).toBe('いそいだ')
    expect(conjugate('いそぐ', 'nai_form')).toBe('いそがない')
  })

  test('はなす — す ending', () => {
    expect(conjugate('はなす', 'te_form')).toBe('はなして')
    expect(conjugate('はなす', 'nai_form')).toBe('はなさない')
  })

  test('まつ — つ ending', () => {
    expect(conjugate('まつ', 'te_form')).toBe('まって')
    expect(conjugate('まつ', 'nai_form')).toBe('またない')
  })

  test('しぬ — ぬ ending', () => {
    expect(conjugate('しぬ', 'te_form')).toBe('しんで')
    expect(conjugate('しぬ', 'nai_form')).toBe('しなない')
  })

  test('あそぶ — ぶ ending', () => {
    expect(conjugate('あそぶ', 'te_form')).toBe('あそんで')
    expect(conjugate('あそぶ', 'nai_form')).toBe('あそばない')
  })

  test('とる — る ending (godan)', () => {
    expect(conjugate('とる', 'te_form')).toBe('とって')
    expect(conjugate('とる', 'nai_form')).toBe('とらない')
  })
})

describe('ichidan conjugation', () => {
  test('たべる — basic set', () => {
    expect(conjugate('たべる', 'masu')).toBe('たべます')
    expect(conjugate('たべる', 'te_form')).toBe('たべて')
    expect(conjugate('たべる', 'ta_form')).toBe('たべた')
    expect(conjugate('たべる', 'nai_form')).toBe('たべない')
    expect(conjugate('たべる', 'nakatta')).toBe('たべなかった')
  })

  test('たべる — derived forms', () => {
    expect(conjugate('たべる', 'potential')).toBe('たべられる')
    expect(conjugate('たべる', 'passive')).toBe('たべられる')
    expect(conjugate('たべる', 'causative')).toBe('たべさせる')
    expect(conjugate('たべる', 'ba')).toBe('たべれば')
    expect(conjugate('たべる', 'volitional')).toBe('たべよう')
    expect(conjugate('たべる', 'imperative')).toBe('たべろ')
  })

  test('みる / おきる / ねる', () => {
    expect(conjugate('みる', 'te_form')).toBe('みて')
    expect(conjugate('おきる', 'masu')).toBe('おきます')
    expect(conjugate('ねる', 'nai_form')).toBe('ねない')
  })
})

describe('irregular conjugation', () => {
  test('する', () => {
    expect(conjugate('する', 'masu')).toBe('します')
    expect(conjugate('する', 'te_form')).toBe('して')
    expect(conjugate('する', 'ta_form')).toBe('した')
    expect(conjugate('する', 'nai_form')).toBe('しない')
    expect(conjugate('する', 'potential')).toBe('できる')
    expect(conjugate('する', 'ba')).toBe('すれば')
    expect(conjugate('する', 'volitional')).toBe('しよう')
    expect(conjugate('する', 'imperative')).toBe('しろ')
  })

  test('くる', () => {
    expect(conjugate('くる', 'masu')).toBe('きます')
    expect(conjugate('くる', 'te_form')).toBe('きて')
    expect(conjugate('くる', 'ta_form')).toBe('きた')
    expect(conjugate('くる', 'nai_form')).toBe('こない')
    expect(conjugate('くる', 'potential')).toBe('こられる')
    expect(conjugate('くる', 'ba')).toBe('くれば')
    expect(conjugate('くる', 'volitional')).toBe('こよう')
    expect(conjugate('くる', 'imperative')).toBe('こい')
  })

  test('compound する', () => {
    expect(conjugate('べんきょうする', 'masu')).toBe('べんきょうします')
    expect(conjugate('べんきょうする', 'te_form')).toBe('べんきょうして')
    expect(conjugate('べんきょうする', 'nai_form')).toBe('べんきょうしない')
    expect(conjugate('べんきょうする', 'potential')).toBe('べんきょうできる')
  })
})

describe('exceptions', () => {
  test('いく uses って', () => {
    expect(conjugate('いく', 'te_form')).toBe('いって')
    expect(conjugate('いく', 'ta_form')).toBe('いった')
    expect(conjugate('いく', 'nai_form')).toBe('いかない')
    expect(conjugate('いく', 'potential')).toBe('いける')
  })

  test('ある has no あらない', () => {
    expect(conjugate('ある', 'nai_form')).toBe('ない')
    expect(conjugate('ある', 'nakatta')).toBe('なかった')
    expect(conjugate('ある', 'te_form')).toBe('あって')
    expect(conjugate('ある', 'ta_form')).toBe('あった')
    expect(conjugate('ある', 'potential')).toBe('ありうる')
  })

  test('godan verbs that look Ichidan', () => {
    expect(conjugate('かえる', 'te_form')).toBe('かえって')
    expect(conjugate('はしる', 'te_form')).toBe('はしって')
    expect(conjugate('しる', 'te_form')).toBe('しって')
    expect(conjugate('はいる', 'masu')).toBe('はいります')
  })

  test('default きる is Ichidan', () => {
    expect(conjugate('きる', 'te_form')).toBe('きて')
    expect(conjugate('きる', 'masu')).toBe('きます')
  })

  test('special keigo', () => {
    expect(conjugate('たべる', 'sonkeigo')).toBe('めしあがる')
    expect(conjugate('たべる', 'kenjougo')).toBe('いただく')
    expect(conjugate('いく', 'sonkeigo')).toBe('いらっしゃる')
    expect(conjugate('する', 'kenjougo')).toBe('いたす')
  })

  test('unknown target throws', () => {
    expect(() => conjugate('たべる', 'tidak_ada')).toThrow(/tidak dikenali/)
  })
})

describe('adjectives and nouns', () => {
  test('i-adjective たかい', () => {
    const forms = buildIAdjectiveForms('たかい')
    expect(forms.neg).toBe('たかくない')
    expect(forms.past).toBe('たかかった')
    expect(forms.te).toBe('たかくて')
    expect(forms.adverb).toBe('たかく')
    expect(forms.naru).toBe('たかくなる')
  })

  test('i-adjective いい is irregular', () => {
    const forms = buildIAdjectiveForms('いい')
    expect(forms.neg).toBe('よくない')
    expect(forms.past).toBe('よかった')
    expect(forms.te).toBe('よくて')
    expect(forms.sou).toBe('よさそう')
  })

  test('i-adjective かっこいい', () => {
    const forms = buildIAdjectiveForms('かっこいい')
    expect(forms.past).toBe('かっこよかった')
    expect(forms.neg).toBe('かっこよくない')
  })

  test('na-adjective げんき', () => {
    const forms = buildNaAdjectiveForms('げんき')
    expect(forms.plain).toBe('げんきだ')
    expect(forms.neg).toBe('げんきじゃない')
    expect(forms.past).toBe('げんきだった')
    expect(forms.te).toBe('げんきで')
    expect(forms.naru).toBe('げんきになる')
  })

  test('noun がくせい', () => {
    const forms = buildNounForms('がくせい')
    expect(forms.plain).toBe('がくせいだ')
    expect(forms.politePast).toBe('がくせいでした')
    expect(forms.pastNeg).toBe('がくせいじゃなかった')
    expect(forms.naru).toBe('がくせいになる')
  })

  test('primary rows are always eight', () => {
    for (const analysis of [
      { classType: 'verb', forms: buildIAdjectiveForms('x'), kamus: 'x' },
      { classType: 'i-adjective', kamus: 'たかい', forms: buildIAdjectiveForms('たかい') },
      { classType: 'na-adjective', kamus: 'げんき', forms: buildNaAdjectiveForms('げんき') },
      { classType: 'noun', kamus: 'がくせい', forms: buildNounForms('がくせい') },
    ]) {
      if (analysis.classType === 'verb') {
        analysis.forms = {
          masu: 'たべます',
          masen: 'たべません',
          mashita: 'たべました',
          masendeshita: 'たべませんでした',
          kamus: 'たべる',
          nai: 'たべない',
          ta: 'たべた',
          nakatta: 'たべなかった',
        }
      }
      expect(buildPrimaryRows(analysis)).toHaveLength(8)
    }
  })
})
