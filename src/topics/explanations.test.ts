/**
 * Keeps explanations short enough for any student to read at a glance:
 * one idea per step, about two lines on a phone.
 * If this fails for a new topic, split the step or move detail into "Kyun?".
 */
import { describe, expect, it } from 'vitest';
import { LANGS } from './types';

type Text = Record<(typeof LANGS)[number], string>;
type Mod = { solution: (id: string, p: Record<string, number>) => { steps: { id: string; narration: Text; why?: Text }[] } };
const sols = import.meta.glob<Mod>('./class-*/*/solutionSteps.ts', { eager: true });
const qs = import.meta.glob<{ questions: { id: string; params: Record<string, number> }[] }>('./class-*/*/questions.ts', { eager: true });

/** Devanagari takes a few more characters for the same idea. */
const MAX = { narration: { hinglish: 100, en: 100, hi: 110 }, why: { hinglish: 100, en: 100, hi: 110 } };

describe('explanations stay short', () => {
  for (const [path, mod] of Object.entries(sols)) {
    const topic = path.split('/')[2]!;
    const q = qs[path.replace('solutionSteps', 'questions')]!;
    it(topic, () => {
      for (const question of q.questions)
        for (const step of mod.solution(question.id, question.params).steps)
          for (const lang of LANGS) {
            const where = `${topic}/${question.id}/${step.id} [${lang}]`;
            expect(step.narration[lang].length, `${where}: ${step.narration[lang]}`).toBeLessThanOrEqual(MAX.narration[lang]);
            if (step.why) expect(step.why[lang].length, `${where} why: ${step.why[lang]}`).toBeLessThanOrEqual(MAX.why[lang]);
          }
    });
  }
});
