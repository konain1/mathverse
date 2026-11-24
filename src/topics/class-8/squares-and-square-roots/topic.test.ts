import { expect, it } from 'vitest';
import { FLAT_CUES } from '@/topics/shared/flat/flatState';
import { describeTopicContract } from '@/topics/shared/testTopic';
import { buildPlan, sideOf } from './buildSteps';
import { questions } from './questions';
import { solution } from './solutionSteps';

describeTopicContract('squares and square roots', questions, buildPlan, solution, FLAT_CUES, { sizeOf: (q, p) => sideOf(q.id, p) });

it('worked examples', () => {
  expect(questions[0]!.answers({ n: 5 })[0]!.value).toBe(25);
  expect(questions[1]!.answers({ n: 7 })[0]!.value).toBe(7);
  expect(questions[2]!.answers({ n: 5, e: 5 }).map((a) => a.value)).toEqual([5, 5]); // 30 → 5×5 + 5
  expect(questions[3]!.answers({ k: 2, m: 3 }).map((a) => a.value)).toEqual([2, 6]); // 18 × 2 = 36 = 6²
});

it('"not perfect" never accidentally makes a perfect square', () => {
  for (let n = 3; n <= 8; n++) for (let e = 1; e <= 2 * n; e++) expect(Number.isInteger(Math.sqrt(n * n + e))).toBe(false);
});
