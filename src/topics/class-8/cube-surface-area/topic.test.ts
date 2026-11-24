import { describe, expect, it } from 'vitest';
import { seededRng } from '@/lib/random';
import { gradeAnswers } from '@/lib/grading';
import { cubeTSA } from '@/lib/geometry/formulas';
import { buildPlan } from './buildSteps';
import { questions } from './questions';
import { saState } from './sceneState';
import { solution } from './solutionSteps';

describe('cube surface area topic', () => {
  it('has one question per level', () => {
    expect(questions.map((q) => q.level)).toEqual(['basic', 'medium', 'hard', 'challenge']);
  });

  it('worked example: side 4 cm → TSA 96 cm²', () => {
    const q = questions[0]!;
    expect(q.answers(q.params)[0]).toMatchObject({ value: 96, unit: 'cm2' });
    expect(gradeAnswers(q.answers(q.params), { tsa: '96' }).allCorrect).toBe(true);
    const r = gradeAnswers(q.answers(q.params), { tsa: '16' }, q.mistakes!(q.params));
    expect(r.results[0]!.mistake?.message.hinglish).toMatch(/sirf ek face/);
  });

  it('medium 5 cm: LSA 100, TSA 150; hard: TSA 150 → side 5; challenge 10 cm open box → 500', () => {
    expect(questions[1]!.answers({ a: 5 }).map((x) => x.value)).toEqual([100, 150]);
    expect(questions[2]!.answers({ a: 5 })[0]!.value).toBe(5);
    expect(questions[3]!.answers({ a: 10 })[0]!.value).toBe(500);
  });

  it('generated variants are always valid and never collide a mistake with the answer', () => {
    for (const q of questions) {
      const rng = seededRng(7);
      for (let i = 0; i < 40; i++) {
        const p = q.generate(rng);
        expect(p.a).toBeGreaterThanOrEqual(2);
        expect(p.a).toBeLessThanOrEqual(10);
        for (const ans of q.answers(p)) {
          expect(Number.isFinite(ans.value)).toBe(true);
          const ok = gradeAnswers([ans], { [ans.id]: String(ans.value) }, q.mistakes?.(p) ?? []);
          expect(ok.allCorrect).toBe(true);
        }
      }
    }
  });

  it('every question has a build plan and a solution whose cues the scene understands', () => {
    const known = ['intro', 'one-face', 'count-faces', 'formula', 'all-faces', 'walls', 'lids', 'unfold', 'lid-off', 'count-five', 'unfold-open'];
    for (const q of questions) {
      expect(buildPlan(q.id, q.params).steps.length).toBe(4);
      const s = solution(q.id, q.params);
      expect(s.steps.length).toBeGreaterThan(2);
      for (const step of s.steps) expect(known).toContain(step.cue);
    }
  });

  it('the face counter reaches exactly TSA at the end of counting', () => {
    const a = 4;
    expect(saState('count-faces', 0, 'tsa-from-side').counted).toBe(1);
    expect(saState('count-faces', 1, 'tsa-from-side').counted * a * a).toBe(cubeTSA(a));
    expect(saState('walls', 1, 'lsa-and-tsa').counted).toBe(4);
    expect(saState('count-five', 1, 'open-box').counted).toBe(5);
    expect(saState('count-five', 0.5, 'open-box').hideTop).toBe(true);
  });
});
