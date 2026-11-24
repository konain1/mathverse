import { expect, it } from 'vitest';
import { FLAT_CUES } from '@/topics/shared/flat/flatState';
import { describeTopicContract } from '@/topics/shared/testTopic';
import { buildPlan } from './buildSteps';
import { questions } from './questions';
import { solution } from './solutionSteps';

describeTopicContract('rectangle properties', questions, buildPlan, solution, FLAT_CUES, { sizeOf: (_q, p) => Math.max(p.l!, p.b!) });

it('worked examples', () => {
  expect(questions[0]!.answers({ l: 7, b: 4 }).map((x) => x.value)).toEqual([7, 4]);
  expect(questions[1]!.answers({ l: 8, b: 6 }).map((x) => x.value)).toEqual([10, 5]);
  expect(questions[2]!.answers({ l: 7, b: 4 }).map((x) => x.value)).toEqual([90, 90]);
  // P = 28, d = 10 → (14² − 10²) / 2 = 48 = 8 × 6
  expect(questions[3]!.answers({ l: 8, b: 6 })[0]!.value).toBe(48);
});
