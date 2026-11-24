import { describe, expect, it } from 'vitest';
import { gradeAnswers } from '@/lib/grading';
import { seededRng } from '@/lib/random';
import { buildPlan } from './buildSteps';
import { questions } from './questions';
import { vState } from './sceneState';
import { solution } from './solutionSteps';

const byId = (id: string) => questions.find((q) => q.id === id)!;

describe('cube volume topic', () => {
  it('one question per level', () => {
    expect(questions.map((q) => q.level)).toEqual(['basic', 'medium', 'hard', 'challenge']);
  });

  it('worked examples', () => {
    expect(byId('volume-from-side').answers({ a: 4 })[0]!.value).toBe(64);
    expect(byId('side-from-volume').answers({ a: 5 })[0]!.value).toBe(5);
    expect(byId('double-side').answers({ a: 3 }).map((x) => x.value)).toEqual([216, 8]);
    expect(byId('small-cubes').answers({ s: 2, k: 3 })[0]!.value).toBe(27);
  });

  it('spots "4 × 4" and "4 + 4 + 4" for a 4 cm cube', () => {
    const q = byId('volume-from-side');
    const r16 = gradeAnswers(q.answers({ a: 4 }), { volume: '16' }, q.mistakes!({ a: 4 }));
    expect(r16.results[0]!.mistake?.message.hinglish).toMatch(/sirf neeche ki ek layer/);
    const r12 = gradeAnswers(q.answers({ a: 4 }), { volume: '12' }, q.mistakes!({ a: 4 }));
    expect(r12.results[0]!.mistake?.message.hinglish).toMatch(/jod diya/);
  });

  it('variants stay valid and buildable (cube side ≤ 10 cm)', () => {
    for (const q of questions) {
      const rng = seededRng(11);
      for (let i = 0; i < 40; i++) {
        const p = q.generate(rng);
        const side = q.id === 'small-cubes' ? p.s! * p.k! : p.a!;
        expect(side).toBeLessThanOrEqual(10);
        expect(buildPlan(q.id, p).steps).toHaveLength(4);
        for (const ans of q.answers(p)) {
          expect(Number.isInteger(ans.value)).toBe(true);
          expect(gradeAnswers([ans], { [ans.id]: String(ans.value) }, q.mistakes?.(p)).allCorrect).toBe(true);
        }
      }
    }
  });

  it('the fill counter matches a³ at the end and layers are counted', () => {
    expect(vState('base-row', 1, 'volume-from-side', { a: 4 }).counted).toBe(4);
    expect(vState('base-layer', 1, 'volume-from-side', { a: 4 }).counted).toBe(16);
    const end = vState('layers', 1, 'volume-from-side', { a: 4 });
    expect(end.counted).toBe(64);
    expect(end.layers).toBe(4);
    expect(vState('big-fill', 1, 'double-side', { a: 3 }).counted).toBe(216);
    expect(vState('layers', 1, 'small-cubes', { s: 2, k: 3 }).counted).toBe(27);
  });

  it('solutions reference only cues the scene handles', () => {
    const known = ['intro', 'base-row', 'base-layer', 'layers', 'formula', 'small', 'big-frame', 'big-fill', 'octants'];
    for (const q of questions) for (const s of solution(q.id, q.params).steps) expect(known).toContain(s.cue);
  });
});
