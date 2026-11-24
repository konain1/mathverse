import { expect, it } from 'vitest';
import { TRI_CUES } from '@/topics/shared/tri/triState';
import { describeTopicContract } from '@/topics/shared/testTopic';
import { buildPlan } from './buildSteps';
import { questions, TRIPLES } from './questions';
import { solution } from './solutionSteps';

describeTopicContract('triangle inequality', questions, buildPlan, solution, TRI_CUES);

it('worked examples', () => {
  expect(questions[0]!.answers({ t: 0 })[0]!.value).toBe(0); // 3,4,5 yes
  expect(questions[0]!.answers({ t: 5 })[0]!.value).toBe(1); // 2,3,6 no
  expect(questions[0]!.answers({ t: 10 })[0]!.value).toBe(1); // 2,3,5 flat → no
  expect(questions[1]!.answers({ a: 5, b: 8 }).map((x) => x.value)).toEqual([4, 12]);
  expect(questions[2]!.answers({ a: 4, b: 7 })[0]!.value).toBe(7); // 4..10
  expect(questions[3]!.answers({ a: 6, b: 9 }).map((x) => x.value)).toEqual([19, 29]);
  expect(TRIPLES.length).toBeGreaterThan(10);
});
