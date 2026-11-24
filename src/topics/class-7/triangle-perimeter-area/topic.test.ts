import { expect, it } from 'vitest';
import { TRI_CUES } from '@/topics/shared/tri/triState';
import { describeTopicContract } from '@/topics/shared/testTopic';
import { buildPlan } from './buildSteps';
import { questions } from './questions';
import { solution } from './solutionSteps';

describeTopicContract('triangle perimeter & area', questions, buildPlan, solution, TRI_CUES);

it('worked examples', () => {
  expect(questions[0]!.answers({ i: 0 })[0]!.value).toBe(16);
  expect(questions[1]!.answers({ b: 8, h: 5, x: 3 })[0]!.value).toBe(20);
  expect(questions[2]!.answers({ b: 6, h: 7, x: 2 })[0]!.value).toBe(7);
  expect(questions[3]!.answers({ k: 1 }).map((x) => x.value)).toEqual([6, 2.4]);
  expect(questions[3]!.answers({ k: 2 }).map((x) => x.value)).toEqual([24, 4.8]);
});
