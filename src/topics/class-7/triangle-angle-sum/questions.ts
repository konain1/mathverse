import { anglesFromRatio, isoscelesBaseAngle, thirdAngle } from '@/lib/geometry/formulas';
import { pick, randInt } from '@/lib/random';
import { defineQuestion, tx, type QuestionTemplate } from '@/topics/contract';

const ANG = (s: string) => tx(s, s, s);
export const RATIOS: readonly [number, number, number][] = [
  [1, 2, 3], [2, 3, 4], [1, 1, 2], [3, 4, 5], [4, 5, 6], [5, 6, 7],
];

export const questions: QuestionTemplate[] = [
  defineQuestion({
    id: 'third-angle',
    level: 'basic',
    params: { b: 50, c: 60 },
    generate: (rng) => {
      const b = 5 * randInt(rng, 6, 16);
      return { b, c: 5 * randInt(rng, 6, (160 - b) / 5) };
    },
    prompt: ({ b, c }) =>
      tx(
        `Triangle ABC mein ∠B = ${b}° aur ∠C = ${c}° hai. ∠A kitna hai?`,
        `In triangle ABC, ∠B = ${b}° and ∠C = ${c}°. What is ∠A?`,
        `त्रिभुज ABC में ∠B = ${b}° और ∠C = ${c}° है। ∠A कितना है?`,
      ),
    given: ({ b, c }) => [
      { label: ANG('∠B'), value: b, unit: 'deg' },
      { label: ANG('∠C'), value: c, unit: 'deg' },
    ],
    find: () => [ANG('∠A')],
    answers: ({ b, c }) => [{ id: 'a', label: ANG('∠A'), value: thirdAngle(b, c), unit: 'deg' }],
    mistakes: ({ b, c }) => [
      {
        answerId: 'a',
        value: 360 - b - c,
        message: tx('Triangle ke angles ka jod 180° hai, 360° nahi (360° quadrilateral ka hai).', 'A triangle’s angles add to 180°, not 360° (360° is for a quadrilateral).', 'त्रिभुज के कोणों का योग 180° है, 360° नहीं (360° चतुर्भुज का है)।'),
      },
      {
        answerId: 'a',
        value: b + c,
        message: tx('Ye ∠B + ∠C hai. ∠A = 180° − (∠B + ∠C).', 'That is ∠B + ∠C. ∠A = 180° − (∠B + ∠C).', 'यह ∠B + ∠C है। ∠A = 180° − (∠B + ∠C)।'),
      },
      {
        answerId: 'a',
        value: 180 - b,
        message: tx('Sirf ek angle ghataya. Dono ghatao.', 'You subtracted only one angle. Subtract both.', 'सिर्फ़ एक कोण घटाया। दोनों घटाओ।'),
      },
    ],
  }),
  defineQuestion({
    id: 'right-triangle',
    level: 'medium',
    params: { c: 35 },
    generate: (rng) => ({ c: 5 * randInt(rng, 4, 14) }),
    prompt: ({ c }) =>
      tx(
        `Ek right triangle ABC mein ∠B = 90° aur ∠C = ${c}° hai. ∠A kitna hai?`,
        `In a right triangle ABC, ∠B = 90° and ∠C = ${c}°. What is ∠A?`,
        `एक समकोण त्रिभुज ABC में ∠B = 90° और ∠C = ${c}° है। ∠A कितना है?`,
      ),
    given: ({ c }) => [
      { label: ANG('∠B'), value: 90, unit: 'deg' },
      { label: ANG('∠C'), value: c, unit: 'deg' },
    ],
    find: () => [ANG('∠A')],
    answers: ({ c }) => [{ id: 'a', label: ANG('∠A'), value: thirdAngle(90, c), unit: 'deg' }],
    mistakes: ({ c }) => [
      {
        answerId: 'a',
        value: 180 - c,
        message: tx('90° wala angle bhi ghatana hai: 180° − 90° − ' + c + '°.', 'Subtract the 90° too: 180° − 90° − ' + c + '°.', '90° वाला कोण भी घटाना है: 180° − 90° − ' + c + '°।'),
      },
    ],
  }),
  defineQuestion({
    id: 'isosceles-base',
    level: 'hard',
    params: { a: 40 },
    generate: (rng) => ({ a: 10 * randInt(rng, 2, 16) }),
    prompt: ({ a }) =>
      tx(
        `Isosceles triangle ABC mein AB = AC aur ∠A = ${a}° hai. ∠B aur ∠C kitne hain?`,
        `In isosceles triangle ABC, AB = AC and ∠A = ${a}°. What are ∠B and ∠C?`,
        `समद्विबाहु त्रिभुज ABC में AB = AC और ∠A = ${a}° है। ∠B और ∠C कितने हैं?`,
      ),
    given: ({ a }) => [{ label: ANG('∠A'), value: a, unit: 'deg' }],
    find: () => [ANG('∠B'), ANG('∠C')],
    answers: ({ a }) => {
      const each = isoscelesBaseAngle(a);
      return [
        { id: 'b', label: ANG('∠B'), value: each, unit: 'deg' },
        { id: 'c', label: ANG('∠C'), value: each, unit: 'deg' },
      ];
    },
    mistakes: ({ a }) => [
      {
        answerId: 'b',
        value: 180 - a,
        message: tx('Ye dono base angles ka jod hai. Dono barabar hain, to 2 se baanto.', 'That is both base angles together. They are equal, so halve it.', 'यह दोनों आधार कोणों का योग है। दोनों बराबर हैं, तो 2 से बाँटो।'),
      },
    ],
  }),
  defineQuestion({
    id: 'ratio',
    level: 'challenge',
    params: { p: 2, q: 3, r: 4 },
    generate: (rng) => {
      const [p, q, r] = pick(rng, RATIOS);
      return { p, q, r };
    },
    prompt: ({ p, q, r }) =>
      tx(
        `Ek triangle ke angles ${p} : ${q} : ${r} ke ratio mein hain. Teeno angles nikalo.`,
        `The angles of a triangle are in the ratio ${p} : ${q} : ${r}. Find all three angles.`,
        `एक त्रिभुज के कोण ${p} : ${q} : ${r} के अनुपात में हैं। तीनों कोण निकालो।`,
      ),
    given: ({ p, q, r }) => [{ label: tx('Ratio ka jod', 'Sum of ratio parts', 'अनुपात का योग'), value: p + q + r, unit: 'none' }],
    find: () => [ANG('∠A'), ANG('∠B'), ANG('∠C')],
    answers: ({ p, q, r }) => {
      const [A, B, C] = anglesFromRatio(p, q, r);
      return [
        { id: 'a', label: tx(`∠A (${p} hisse)`, `∠A (${p} parts)`, `∠A (${p} हिस्से)`), value: A, unit: 'deg' },
        { id: 'b', label: tx(`∠B (${q} hisse)`, `∠B (${q} parts)`, `∠B (${q} हिस्से)`), value: B, unit: 'deg' },
        { id: 'c', label: tx(`∠C (${r} hisse)`, `∠C (${r} parts)`, `∠C (${r} हिस्से)`), value: C, unit: 'deg' },
      ];
    },
    mistakes: ({ p, q, r }) => [
      {
        answerId: 'a',
        value: p,
        message: tx(`Ratio sirf hisse batata hai. Ek hissa = 180° ÷ ${p + q + r}.`, `The ratio only gives parts. One part = 180° ÷ ${p + q + r}.`, `अनुपात सिर्फ़ हिस्से बताता है। एक हिस्सा = 180° ÷ ${p + q + r}।`),
      },
    ],
  }),
];
