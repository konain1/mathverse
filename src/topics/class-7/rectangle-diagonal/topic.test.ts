import { expect, it } from 'vitest';
import { FLAT_CUES } from '@/topics/shared/flat/flatState';
import { describeTopicContract } from '@/topics/shared/testTopic';
import { buildPlan } from './buildSteps';
import { questions } from './questions';
import { solution } from './solutionSteps';

describeTopicContract('rectangle diagonal', questions, buildPlan, solution, FLAT_CUES, { sizeOf: (_q, p) => Math.max(p.l!, p.b!) });

it('worked examples', () => {
  expect(questions[0]!.answers({ l: 8, b: 6 })[0]!.value).toBe(10);
  expect(questions[1]!.answers({ l: 6, b: 3 })[0]!.value).toBeCloseTo(6.708, 3);
  expect(questions[2]!.answers({ l: 8, b: 6 })[0]!.value).toBe(6);
  expect(questions[3]!.answers({ l: 8, b: 6 })[0]!.value).toBe(24);
});
