import { expect, it } from 'vitest';
import { FLAT_CUES } from '@/topics/shared/flat/flatState';
import { describeTopicContract } from '@/topics/shared/testTopic';
import { buildPlan } from './buildSteps';
import { questions } from './questions';
import { solution } from './solutionSteps';

describeTopicContract('square perimeter & area', questions, buildPlan, solution, FLAT_CUES, { sizeOf: (_q, p) => p.a! });

it('worked examples', () => {
  expect(questions[0]!.answers({ a: 5 })[0]!.value).toBe(20);
  expect(questions[1]!.answers({ a: 6 })[0]!.value).toBe(36);
  expect(questions[2]!.answers({ a: 7 }).map((x) => x.value)).toEqual([7, 49]);
  expect(questions[3]!.answers({ a: 8, r: 3 }).map((x) => x.value)).toEqual([32, 96]);
});
