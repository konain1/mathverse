import { expect, it } from 'vitest';
import { FLAT_CUES } from '@/topics/shared/flat/flatState';
import { describeTopicContract } from '@/topics/shared/testTopic';
import { buildPlan, dims } from './buildSteps';
import { questions } from './questions';
import { solution } from './solutionSteps';

describeTopicContract('rectangle perimeter & area', questions, buildPlan, solution, FLAT_CUES, {
  sizeOf: (q, p) => Math.max(dims(q.id, p).l, dims(q.id, p).b),
});

it('worked examples', () => {
  expect(questions[0]!.answers({ l: 7, b: 4 })[0]!.value).toBe(22);
  expect(questions[1]!.answers({ l: 8, b: 5 })[0]!.value).toBe(40);
  expect(questions[2]!.answers({ l: 9, b: 4 }).map((x) => x.value)).toEqual([4, 26]);
  expect(questions[3]!.answers({ b: 4 }).map((x) => x.value)).toEqual([8, 4, 32]);
});
