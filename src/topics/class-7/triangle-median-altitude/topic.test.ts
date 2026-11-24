import { expect, it } from 'vitest';
import { TRI_CUES } from '@/topics/shared/tri/triState';
import { describeTopicContract } from '@/topics/shared/testTopic';
import { buildPlan } from './buildSteps';
import { questions, triOf } from './questions';
import { solution } from './solutionSteps';

describeTopicContract('median & altitude', questions, buildPlan, solution, TRI_CUES, {
  sizeOf: (q, p) => Math.max(...triOf(q.id, p).map((v) => Math.max(Math.abs(v[0]), Math.abs(v[2])))),
});

it('worked examples', () => {
  expect(questions[0]!.answers({ m: 3, x: 2, h: 4 })[0]!.value).toBe(3);
  expect(questions[1]!.answers({ b: 6, h: 4, x: 2 })[0]!.value).toBe(4);
  expect(questions[3]!.answers({ w: 6 })[0]!.value).toBe(4);
  expect(questions[3]!.answers({ w: 8 })[0]!.value).toBe(3);
});
