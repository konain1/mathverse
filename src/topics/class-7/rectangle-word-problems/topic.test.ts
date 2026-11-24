import { expect, it } from 'vitest';
import { FLAT_CUES } from '@/topics/shared/flat/flatState';
import { describeTopicContract } from '@/topics/shared/testTopic';
import { buildPlan, outerSize } from './buildSteps';
import { questions } from './questions';
import { solution } from './solutionSteps';

describeTopicContract('rectangle word problems', questions, buildPlan, solution, FLAT_CUES, { sizeOf: (q, p) => outerSize(q.id, p) });

it('worked examples', () => {
  expect(questions[0]!.answers({ l: 9, b: 6, r: 2 }).map((x) => x.value)).toEqual([30, 60]);
  expect(questions[1]!.answers({ t: 2, i: 5, j: 3 })[0]!.value).toBe(15); // 10 × 6 tray, 2 cm tiles
  expect(questions[2]!.answers({ l: 6, b: 4, w: 1 })[0]!.value).toBe(24); // 8 × 6 − 6 × 4
  expect(questions[3]!.answers({ L: 10, B: 8, w: 2 }).map((x) => x.value)).toEqual([56, 24]); // 80 − 6 × 4
});

it('inner path always leaves some lawn', () => {
  for (const L of [7, 8, 9, 10]) for (let B = 6; B < L; B++) expect((L - 4) * (B - 4)).toBeGreaterThan(0);
});
