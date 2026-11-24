import { expect, it } from 'vitest';
import { TRI_CUES } from '@/topics/shared/tri/triState';
import { describeTopicContract } from '@/topics/shared/testTopic';
import { buildPlan } from './buildSteps';
import { questions } from './questions';
import { anglesOf, solution } from './solutionSteps';

describeTopicContract('exterior angle', questions, () => buildPlan(), solution, TRI_CUES);

it('worked examples', () => {
  expect(questions[0]!.answers({ a: 50, b: 60 })[0]!.value).toBe(110);
  expect(questions[1]!.answers({ a: 45, b: 65 })[0]!.value).toBe(65);
  expect(questions[2]!.answers({ e: 100 })[0]!.value).toBe(50);
  expect(questions[3]!.answers({ a: 70, b: 50 }).map((x) => x.value)).toEqual([120, 360]);
  for (const q of questions) expect(anglesOf(q.id, q.params).reduce((s, x) => s + x, 0)).toBeCloseTo(180, 9);
});
