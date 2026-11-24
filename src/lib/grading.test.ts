import { describe, expect, it } from 'vitest';
import { computeStars, gradeAnswers, parseNumber } from './grading';
import { randInt, seededRng } from './random';

const L = { hinglish: 'x', en: 'x', hi: 'x' };

describe('parseNumber', () => {
  it.each([
    ['96', 96],
    [' 96.0 ', 96],
    ['96 cm²', 96],
    ['1,000', 1000],
    ['-3', -3],
    ['5.66cm', 5.66],
    ['.5', 0.5],
  ])('%s → %s', (s, n) => expect(parseNumber(s)).toBe(n));
  it.each(['', 'abc', 'cm 5'])('%s → null', (s) => expect(parseNumber(s)).toBeNull());
});

describe('gradeAnswers', () => {
  const specs = [{ id: 'tsa', label: L, value: 96, unit: 'cm2' as const }];
  const mistakes = [
    { answerId: 'tsa', value: 16, message: { hinglish: 'one face', en: 'one face', hi: 'one face' } },
    { answerId: 'tsa', value: 64, message: { hinglish: 'LSA', en: 'LSA', hi: 'LSA' } },
  ];
  it('accepts the right answer with units', () => {
    expect(gradeAnswers(specs, { tsa: '96 cm²' }).allCorrect).toBe(true);
  });
  it('recognises a common mistake', () => {
    const r = gradeAnswers(specs, { tsa: '16' }, mistakes);
    expect(r.allCorrect).toBe(false);
    expect(r.results[0]!.mistake?.message.en).toBe('one face');
  });
  it('unknown wrong answers have no mistake attached; blanks are wrong', () => {
    expect(gradeAnswers(specs, { tsa: '95' }, mistakes).results[0]!.mistake).toBeUndefined();
    expect(gradeAnswers(specs, {}).results[0]!.correct).toBe(false);
  });
  it('tolerance for decimals', () => {
    const d = [{ id: 'd', label: L, value: 4 * Math.SQRT2, unit: 'cm' as const }];
    expect(gradeAnswers(d, { d: '5.66' }).allCorrect).toBe(true);
    expect(gradeAnswers(d, { d: '5.7' }).allCorrect).toBe(false);
  });
});

describe('stars', () => {
  it('3 for a clean solve, fewer with mistakes, hints or a wrong build, never below 1', () => {
    expect(computeStars({ wrongAttempts: 0, hintsUsed: 0, buildOk: true })).toBe(3);
    expect(computeStars({ wrongAttempts: 1, hintsUsed: 0, buildOk: true })).toBe(2);
    expect(computeStars({ wrongAttempts: 0, hintsUsed: 2, buildOk: true })).toBe(2);
    expect(computeStars({ wrongAttempts: 5, hintsUsed: 1, buildOk: false })).toBe(1);
  });
});

describe('seeded rng', () => {
  it('is deterministic and within range', () => {
    const a = seededRng(42);
    const b = seededRng(42);
    const xs = Array.from({ length: 50 }, () => randInt(a, 2, 9));
    expect(xs).toEqual(Array.from({ length: 50 }, () => randInt(b, 2, 9)));
    expect(Math.min(...xs)).toBeGreaterThanOrEqual(2);
    expect(Math.max(...xs)).toBeLessThanOrEqual(9);
  });
});
