import { expect, it } from 'vitest';
import { TRI_CUES } from '@/topics/shared/tri/triState';
import { describeTopicContract } from '@/topics/shared/testTopic';
import { buildPlan } from './buildSteps';
import { questions } from './questions';
import { anglesOf, solution } from './solutionSteps';

describeTopicContract('angle sum', questions, (id) => buildPlan(id), solution, TRI_CUES);

it('worked examples, and every variant really adds to 180° with all angles positive', () => {
  expect(questions[0]!.answers({ b: 50, c: 60 })[0]!.value).toBe(70);
  expect(questions[1]!.answers({ c: 35 })[0]!.value).toBe(55);
  expect(questions[2]!.answers({ a: 40 }).map((x) => x.value)).toEqual([70, 70]);
  expect(questions[3]!.answers({ p: 2, q: 3, r: 4 }).map((x) => x.value)).toEqual([40, 60, 80]);
  for (const q of questions) {
    const angles = anglesOf(q.id, q.params);
    expect(angles.reduce((s, x) => s + x, 0)).toBeCloseTo(180, 9);
    expect(Math.min(...angles)).toBeGreaterThan(0);
  }
});
