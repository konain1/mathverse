/**
 * Contract checks every playable topic should pass. Call from a topic's
 * topic.test.ts: `describeTopicContract(questions, buildPlan, solution, cues)`.
 */
import { describe, expect, it } from 'vitest';
import { gradeAnswers } from '@/lib/grading';
import { seededRng } from '@/lib/random';
import { LANGS } from '@/topics/types';
import type { BuildPlan, Params, QuestionTemplate, SolutionScript } from '@/topics/contract';

export function describeTopicContract(
  name: string,
  questions: QuestionTemplate[],
  buildPlan: (id: string, p: Params) => BuildPlan,
  solution: (id: string, p: Params) => SolutionScript,
  cues: readonly string[],
  { maxSide = 10, sizeOf }: { maxSide?: number; sizeOf?: (q: QuestionTemplate, p: Params) => number } = {},
) {
  describe(`${name}: plugin contract`, () => {
    it('has one question per level, unique ids', () => {
      expect(questions.map((q) => q.level)).toEqual(['basic', 'medium', 'hard', 'challenge']);
      expect(new Set(questions.map((q) => q.id)).size).toBe(questions.length);
    });

    it.each(questions.map((q) => [q.id, q] as const))('%s: worked example + 60 variants stay valid', (_, q) => {
      const rng = seededRng(2024);
      const variants = [q.params, ...Array.from({ length: 60 }, () => q.generate(rng))];
      for (const p of variants) {
        for (const lang of LANGS) expect(q.prompt(p)[lang].length).toBeGreaterThan(10);
        const answers = q.answers(p);
        expect(answers.length).toBe(q.find(p).length);
        for (const a of answers) {
          expect(Number.isFinite(a.value), `${q.id} ${a.id}`).toBe(true);
          // typing the exact answer passes, and no "mistake" equals the right answer
          const r = gradeAnswers([a], { [a.id]: String(a.value) }, q.mistakes?.(p) ?? []);
          expect(r.allCorrect, `${q.id} ${JSON.stringify(p)}`).toBe(true);
        }
        if (sizeOf) expect(sizeOf(q, p), `${q.id} must fit the grid`).toBeLessThanOrEqual(maxSide);
        const plan = buildPlan(q.id, p);
        expect(plan.steps.length).toBeGreaterThan(0);
        const s = solution(q.id, p);
        expect(s.steps.length).toBeGreaterThan(1);
        for (const st of s.steps) {
          expect(cues, `${q.id}: unknown cue "${st.cue}"`).toContain(st.cue);
          for (const lang of LANGS) expect(st.narration[lang].trim()).not.toBe('');
        }
      }
    });
  });
}
