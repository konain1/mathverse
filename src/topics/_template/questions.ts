import { cubeEdgeTotal } from '@/lib/geometry/formulas';
import { randInt } from '@/lib/random';
import { defineQuestion, tx, type QuestionTemplate } from '@/topics/contract';

export const questions: QuestionTemplate[] = [
  defineQuestion({
    id: 'edge-total',
    level: 'basic',
    params: { a: 4 }, // the worked example
    generate: (rng) => ({ a: randInt(rng, 2, 9) }), // "Try yourself" variants: keep them buildable (≤ 10 cm)
    prompt: ({ a }) =>
      tx(
        `Ek cube ki side ${a} cm hai. Uski saari edges ki total length nikalo.`,
        `A cube has a side of ${a} cm. Find the total length of all its edges.`,
        `एक घन की भुजा ${a} cm है। उसके सभी किनारों की कुल लंबाई निकालो।`,
      ),
    given: ({ a }) => [{ label: tx('Side (a)', 'Side (a)', 'भुजा (a)'), value: a, unit: 'cm' }],
    find: () => [tx('Total length', 'Total length', 'कुल लंबाई')],
    // ALWAYS compute answers with src/lib/geometry — never type numbers in
    answers: ({ a }) => [{ id: 'total', label: tx('Total length', 'Total length', 'कुल लंबाई'), value: cubeEdgeTotal(a), unit: 'cm' }],
    mistakes: ({ a }) => [
      {
        answerId: 'total',
        value: 4 * a,
        message: tx(
          'Ye sirf ek face ki edges hain. Cube mein 12 edges hoti hain.',
          'That is only one face’s edges. A cube has 12 edges.',
          'यह सिर्फ़ एक फलक के किनारे हैं। घन में 12 किनारे होते हैं।',
        ),
      },
    ],
  }),
];
