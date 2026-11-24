import { expect, it } from 'vitest';
import { gradeAnswers } from '@/lib/grading';
import { FLAT_CUES } from '@/topics/shared/flat/flatState';
import { describeTopicContract } from '@/topics/shared/testTopic';
import { buildPlan } from './buildSteps';
import { questions } from './questions';
import { solution } from './solutionSteps';

describeTopicContract('square diagonal', questions, buildPlan, solution, FLAT_CUES, {
  sizeOf: (q, p) => (q.id.includes('area') ? 2 * p.k! : p.a!),
});

it('worked examples and √2 rounding', () => {
  const [d, area, side, fromArea] = questions;
  expect(d!.answers({ a: 4 })[0]!.value).toBeCloseTo(5.657, 3);
  // students may use √2 ≈ 1.41 or 1.414
  expect(gradeAnswers(d!.answers({ a: 4 }), { d: '5.66' }).allCorrect).toBe(true);
  expect(gradeAnswers(d!.answers({ a: 4 }), { d: '5.64' }).allCorrect).toBe(true);
  expect(gradeAnswers(d!.answers({ a: 10 }), { d: '14.1' }).allCorrect).toBe(true);
  expect(gradeAnswers(d!.answers({ a: 4 }), { d: '8' }).allCorrect).toBe(false);
  expect(area!.answers({ k: 3 })[0]!.value).toBe(18);
  expect(side!.answers({ a: 5 })[0]!.value).toBeCloseTo(5, 9);
  expect(fromArea!.answers({ k: 5 })[0]!.value).toBe(10);
});
