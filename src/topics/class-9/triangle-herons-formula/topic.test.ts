import { expect, it } from 'vitest';
import { TRI_CUES } from '@/topics/shared/tri/triState';
import { describeTopicContract } from '@/topics/shared/testTopic';
import { buildPlan } from './buildSteps';
import { questions } from './questions';
import { solution } from './solutionSteps';

describeTopicContract("Heron's formula", questions, buildPlan, solution, TRI_CUES);

it('worked examples', () => {
  expect(questions[0]!.answers({ i: 0 })[0]!.value).toBe(8); // 6,5,5
  expect(questions[1]!.answers({ i: 1 })[0]!.value).toBe(12); // 8,5,5
  expect(questions[2]!.answers({ i: 0 }).map((x) => x.value)).toEqual([12, 4]);
  expect(questions[3]!.answers({ i: 3, r: 3 }).map((x) => x.value)).toEqual([24, 72]); // 6-8-10
});
