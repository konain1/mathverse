import { expect, it } from 'vitest';
import { TRI_CUES } from '@/topics/shared/tri/triState';
import { describeTopicContract } from '@/topics/shared/testTopic';
import { buildPlan } from './buildSteps';
import { questions } from './questions';
import { solution } from './solutionSteps';

describeTopicContract('Pythagoras', questions, buildPlan, solution, TRI_CUES);

it('worked examples', () => {
  expect(questions[0]!.answers({ a: 6, b: 8 })[0]!.value).toBe(10);
  expect(questions[1]!.answers({ a: 8, b: 6 })[0]!.value).toBe(6);
  expect(questions[2]!.answers({ i: 0 }).map((x) => x.value)).toEqual([25, 0]); // 3-4-5 → yes
  expect(questions[2]!.answers({ i: 2 }).map((x) => x.value)).toEqual([50, 1]); // 5-5-6 → no
  expect(questions[3]!.answers({ c: 10, g: 6 })[0]!.value).toBe(8);
});
