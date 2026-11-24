import { exteriorAngle, thirdAngle } from '@/lib/geometry/formulas';
import { randInt } from '@/lib/random';
import { defineQuestion, tx, type QuestionTemplate } from '@/topics/contract';

const ANG = (s: string) => tx(s, s, s);
const EXT = tx('Exterior ∠ACD', 'Exterior ∠ACD', 'बहिष्कोण ∠ACD');

/** Two interior angles that leave room for a third of at least 20°. */
const pair = (rng: () => number) => {
  const a = 5 * randInt(rng, 6, 16);
  return { a, b: 5 * randInt(rng, 6, (160 - a) / 5) };
};

export const questions: QuestionTemplate[] = [
  defineQuestion({
    id: 'exterior-sum',
    level: 'basic',
    params: { a: 50, b: 60 },
    generate: pair,
    prompt: ({ a, b }) =>
      tx(
        `Triangle ABC mein ∠A = ${a}° aur ∠B = ${b}° hai. Side BC ko D tak badhaya gaya. Exterior angle ∠ACD kitna hai?`,
        `In triangle ABC, ∠A = ${a}° and ∠B = ${b}°. Side BC is extended to D. What is the exterior angle ∠ACD?`,
        `त्रिभुज ABC में ∠A = ${a}° और ∠B = ${b}° है। भुजा BC को D तक बढ़ाया गया। बहिष्कोण ∠ACD कितना है?`,
      ),
    given: ({ a, b }) => [
      { label: ANG('∠A'), value: a, unit: 'deg' },
      { label: ANG('∠B'), value: b, unit: 'deg' },
    ],
    find: () => [EXT],
    answers: ({ a, b }) => [{ id: 'ext', label: EXT, value: exteriorAngle(a, b), unit: 'deg' }],
    mistakes: ({ a, b }) => [
      {
        answerId: 'ext',
        value: thirdAngle(a, b),
        message: tx('Ye andar wala ∠C hai. Exterior angle uske saath seedhi line banata hai: 180° − ∠C.', 'That’s the inside angle ∠C. The exterior angle makes a straight line with it: 180° − ∠C.', 'यह अंदर वाला ∠C है। बहिष्कोण उसके साथ सीधी रेखा बनाता है: 180° − ∠C।'),
      },
      {
        answerId: 'ext',
        value: 180 - a,
        message: tx('Exterior angle = dono opposite interior angles ka jod: ∠A + ∠B.', 'Exterior angle = the sum of both opposite interior angles: ∠A + ∠B.', 'बहिष्कोण = दोनों अंतराभिमुख कोणों का योग: ∠A + ∠B।'),
      },
    ],
  }),
  defineQuestion({
    id: 'missing-interior',
    level: 'medium',
    params: { a: 45, b: 65 },
    generate: pair,
    prompt: ({ a, b }) =>
      tx(
        `Exterior angle ∠ACD = ${exteriorAngle(a, b)}° aur ∠A = ${a}° hai. ∠B kitna hai?`,
        `The exterior angle ∠ACD = ${exteriorAngle(a, b)}° and ∠A = ${a}°. What is ∠B?`,
        `बहिष्कोण ∠ACD = ${exteriorAngle(a, b)}° और ∠A = ${a}° है। ∠B कितना है?`,
      ),
    given: ({ a, b }) => [
      { label: EXT, value: exteriorAngle(a, b), unit: 'deg' },
      { label: ANG('∠A'), value: a, unit: 'deg' },
    ],
    find: () => [ANG('∠B')],
    answers: ({ a, b }) => [{ id: 'b', label: ANG('∠B'), value: exteriorAngle(a, b) - a, unit: 'deg' }],
    mistakes: ({ a, b }) => [
      {
        answerId: 'b',
        value: 180 - exteriorAngle(a, b) - a,
        message: tx('Exterior angle khud hi ∠A + ∠B hai. Seedha ghatao: ∠ACD − ∠A.', 'The exterior angle already equals ∠A + ∠B. Just subtract: ∠ACD − ∠A.', 'बहिष्कोण ख़ुद ही ∠A + ∠B है। सीधे घटाओ: ∠ACD − ∠A।'),
      },
    ],
  }),
  defineQuestion({
    id: 'isosceles',
    level: 'hard',
    params: { e: 100 },
    generate: (rng) => ({ e: 10 * randInt(rng, 4, 16) }),
    prompt: ({ e }) =>
      tx(
        `Triangle ABC mein ∠A = ∠B hai, aur exterior angle ∠ACD = ${e}° hai. ∠A kitna hai?`,
        `In triangle ABC, ∠A = ∠B, and the exterior angle ∠ACD = ${e}°. What is ∠A?`,
        `त्रिभुज ABC में ∠A = ∠B है, और बहिष्कोण ∠ACD = ${e}° है। ∠A कितना है?`,
      ),
    given: ({ e }) => [{ label: EXT, value: e, unit: 'deg' }],
    find: () => [ANG('∠A')],
    answers: ({ e }) => [{ id: 'a', label: ANG('∠A'), value: e / 2, unit: 'deg' }],
    mistakes: ({ e }) => [
      {
        answerId: 'a',
        value: 180 - e,
        message: tx('Ye ∠C hai. ∠A + ∠B = exterior angle, aur dono barabar: ÷ 2.', 'That is ∠C. ∠A + ∠B = the exterior angle, and they are equal: ÷ 2.', 'यह ∠C है। ∠A + ∠B = बहिष्कोण, और दोनों बराबर: ÷ 2।'),
      },
    ],
  }),
  defineQuestion({
    id: 'all-exterior',
    level: 'challenge',
    params: { a: 70, b: 50 },
    generate: pair,
    prompt: ({ a, b }) =>
      tx(
        `Triangle ABC mein ∠A = ${a}° aur ∠B = ${b}° hai. C par exterior angle kitna hai? Aur teeno corners ke exterior angles ka jod kitna hoga?`,
        `In triangle ABC, ∠A = ${a}° and ∠B = ${b}°. What is the exterior angle at C? And what is the sum of the exterior angles at all three corners?`,
        `त्रिभुज ABC में ∠A = ${a}° और ∠B = ${b}° है। C पर बहिष्कोण कितना है? और तीनों कोनों के बहिष्कोणों का योग कितना होगा?`,
      ),
    given: ({ a, b }) => [
      { label: ANG('∠A'), value: a, unit: 'deg' },
      { label: ANG('∠B'), value: b, unit: 'deg' },
    ],
    find: () => [tx('C par exterior angle', 'Exterior angle at C', 'C पर बहिष्कोण'), tx('Teeno exterior angles ka jod', 'Sum of all three exterior angles', 'तीनों बहिष्कोणों का योग')],
    answers: ({ a, b }) => {
      const c = thirdAngle(a, b);
      return [
        { id: 'ext', label: tx('Exterior ∠C', 'Exterior ∠C', 'बहिष्कोण C'), value: exteriorAngle(a, b), unit: 'deg' },
        { id: 'sum', label: tx('Jod', 'Sum', 'योग'), value: exteriorAngle(a, b) + exteriorAngle(b, c) + exteriorAngle(c, a), unit: 'deg' },
      ];
    },
    mistakes: () => [
      {
        answerId: 'sum',
        value: 180,
        message: tx('180° andar wale angles ka jod hai. Har exterior = 180° − interior, to teeno = 540° − 180° = 360°.', '180° is the inside angles. Each exterior = 180° − interior, so all three = 540° − 180° = 360°.', '180° अंदर वाले कोणों का योग है। हर बहिष्कोण = 180° − अंतःकोण, तो तीनों = 540° − 180° = 360°।'),
      },
    ],
  }),
];
