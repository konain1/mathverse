import { expect, it } from 'vitest';
import { TRI_CUES } from '@/topics/shared/tri/triState';
import { describeTopicContract } from '@/topics/shared/testTopic';
import { buildPlan } from './buildSteps';
import { questions } from './questions';
import { solution } from './solutionSteps';

describeTopicContract('congruence', questions, buildPlan, solution, TRI_CUES);

it('rules and worked examples', () => {
  expect(questions.map((q) => q.answers(q.params)[0]!.value)).toEqual([0, 1, 2, 3]); // SSS, SAS, ASA, RHS
  expect(questions[1]!.answers({ k: 1 })[1]!.value).toBe(5);
  expect(questions[2]!.answers({ k: 3 })[1]!.value).toBe(90);
  expect(questions[3]!.answers({ h: 10, s: 6 })[1]!.value).toBe(8);
});

it('the copy to build fits on the grid', () => {
  for (const q of questions) {
    const plan = buildPlan(q.id, q.params);
    for (const [p1, p2] of plan.target.segments!) for (const v of [p1, p2]) expect(Math.abs(v[2])).toBeLessThanOrEqual(10);
  }
});
