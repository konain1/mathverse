import { expect, it } from 'vitest';
import { TRI_CUES } from '@/topics/shared/tri/triState';
import { describeTopicContract } from '@/topics/shared/testTopic';
import { buildPlan } from './buildSteps';
import { questions } from './questions';
import { solution } from './solutionSteps';

describeTopicContract('types of triangles', questions, buildPlan, solution, TRI_CUES);

it('choices match the classification', () => {
  // 5, 5, 6 → isosceles (1); 5, 5, 8 → isosceles + obtuse (2)
  expect(questions[0]!.answers({ i: 0 })[0]!.value).toBe(1);
  expect(questions[2]!.answers({ i: 1 }).map((a) => a.value)).toEqual([1, 2]);
  // 3-4-5 → scalene + right
  expect(questions[2]!.answers({ i: 2 }).map((a) => a.value)).toEqual([2, 1]);
  // 100°, 40°, 40° → obtuse
  expect(questions[1]!.answers({ j: 6 })[0]!.value).toBe(2);
  // apex 90° → base 45°, right
  expect(questions[3]!.answers({ a: 90 }).map((a) => a.value)).toEqual([45, 1]);
  expect(questions[0]!.answers({ i: 0 })[0]!.options).toHaveLength(3);
});
