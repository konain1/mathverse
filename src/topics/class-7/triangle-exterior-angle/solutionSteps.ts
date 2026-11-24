import { exteriorAngle, thirdAngle } from '@/lib/geometry/formulas';
import { tx, type Params, type SolutionScript } from '@/topics/contract';
import { step } from '@/topics/shared/flat/steps';

/** Interior angles at A, B, C for a question. */
export function anglesOf(id: string, p: Params): [number, number, number] {
  if (id === 'isosceles') {
    const a = p.e! / 2;
    return [a, a, thirdAngle(a, a)];
  }
  return [p.a!, p.b!, thirdAngle(p.a!, p.b!)];
}

const remember = tx(
  'Exterior angle = dono opposite interior angles ka jod. Aur exterior + uske paas wala interior = 180°.',
  'Exterior angle = sum of the two opposite interior angles. And exterior + its neighbouring interior = 180°.',
  'बहिष्कोण = दोनों अंतराभिमुख कोणों का योग। और बहिष्कोण + उसके पास वाला अंतःकोण = 180°।',
);

export function solution(id: string, p: Params): SolutionScript {
  const [A, B] = anglesOf(id, p);
  const E = exteriorAngle(A, B);
  const intro = step('intro', 'angles', 4, [
    'Triangle ABC aur uske teeno andar wale angles.',
    'Triangle ABC and its three inside angles.',
    'त्रिभुज ABC और उसके तीनों अंतःकोण।',
  ]);
  const extend = step('extend', 'exterior', 4.5, [
    `Side BC ko C ke aage D tak badhao. C par bahar ek naya angle bana: exterior angle ∠ACD.`,
    `Extend side BC beyond C to D. A new angle appears outside at C: the exterior angle ∠ACD.`,
    `भुजा BC को C के आगे D तक बढ़ाओ। C पर बाहर एक नया कोण बना: बहिष्कोण ∠ACD।`,
  ], `\\angle ACB + \\angle ACD = 180^\\circ`, [
    'BCD ek seedhi line hai, isliye C par dono angles milkar 180°.',
    'BCD is a straight line, so the two angles at C add up to 180°.',
    'BCD एक सीधी रेखा है, इसलिए C पर दोनों कोण मिलकर 180°।',
  ]);
  const fill = step(
    'fill',
    'fill-exterior',
    6,
    [
      `Ab ∠A aur ∠B ko kaat ke C ke bahar wale angle mein rakho: dono milkar use bilkul bhar dete hain. ${A}° + ${B}° = ${E}°.`,
      `Now cut out ∠A and ∠B and place them in the outside angle at C: together they fill it exactly. ${A}° + ${B}° = ${E}°.`,
      `अब ∠A और ∠B को काटकर C के बाहर वाले कोण में रखो: दोनों मिलकर उसे बिल्कुल भर देते हैं। ${A}° + ${B}° = ${E}°।`,
    ],
    `\\angle ACD = \\angle A + \\angle B`,
    [
      `∠A + ∠B + ∠C = 180° aur ∠ACD + ∠C = 180°. Dono mein se ∠C hatao: ∠ACD = ∠A + ∠B.`,
      `∠A + ∠B + ∠C = 180° and ∠ACD + ∠C = 180°. Take ∠C away from both: ∠ACD = ∠A + ∠B.`,
      `∠A + ∠B + ∠C = 180° और ∠ACD + ∠C = 180°। दोनों में से ∠C हटाओ: ∠ACD = ∠A + ∠B।`,
    ],
  );
  switch (id) {
    case 'missing-interior':
      return {
        steps: [
          intro,
          extend,
          fill,
          step('solve', 'fill-exterior', 4, [`∠B = ${E}° − ${A}° = ${B}°.`, `∠B = ${E}° − ${A}° = ${B}°.`, `∠B = ${E}° − ${A}° = ${B}°।`], `\\angle B = ${E}^\\circ - ${A}^\\circ = ${B}^\\circ`),
        ],
        remember,
        mistake: tx('Pehle 180° se ghata dena, jabki exterior angle hi ∠A + ∠B hai.', 'Subtracting from 180° first, though the exterior angle already is ∠A + ∠B.', 'पहले 180° से घटा देना, जबकि बहिष्कोण ही ∠A + ∠B है।'),
      };
    case 'isosceles':
      return {
        steps: [
          intro,
          extend,
          fill,
          step('solve', 'fill-exterior', 4, [
            `∠A + ∠B = ${E}° aur ∠A = ∠B, to ∠A = ${E}° ÷ 2 = ${A}°.`,
            `∠A + ∠B = ${E}° and ∠A = ∠B, so ∠A = ${E}° ÷ 2 = ${A}°.`,
            `∠A + ∠B = ${E}° और ∠A = ∠B, तो ∠A = ${E}° ÷ 2 = ${A}°।`,
          ], `\\angle A = \\dfrac{${E}^\\circ}{2} = ${A}^\\circ`),
        ],
        remember,
        mistake: tx('180° − exterior le lena: wo ∠C hai.', 'Taking 180° − exterior: that is ∠C.', '180° − बहिष्कोण ले लेना: वह ∠C है।'),
      };
    case 'all-exterior':
      return {
        steps: [
          intro,
          extend,
          fill,
          step(
            'sum',
            'solved',
            5.5,
            [
              `Har corner par exterior = 180° − interior. Teeno: 3 × 180° − (∠A + ∠B + ∠C) = 540° − 180° = 360°.`,
              `At every corner, exterior = 180° − interior. All three: 3 × 180° − (∠A + ∠B + ∠C) = 540° − 180° = 360°.`,
              `हर कोने पर बहिष्कोण = 180° − अंतःकोण। तीनों: 3 × 180° − (∠A + ∠B + ∠C) = 540° − 180° = 360°।`,
            ],
            `(180^\\circ - A) + (180^\\circ - B) + (180^\\circ - C) = 360^\\circ`,
            [
              'Triangle ke chaaron taraf ek chakkar lagao: har corner par jitna mudte ho, wahi exterior angle hai. Poora chakkar = 360°.',
              'Walk once round the triangle: at each corner you turn by the exterior angle. One full turn = 360°.',
              'त्रिभुज के चारों ओर एक चक्कर लगाओ: हर कोने पर जितना मुड़ते हो, वही बहिष्कोण है। पूरा चक्कर = 360°।',
            ],
          ),
        ],
        remember,
        mistake: tx('Exterior angles ka jod bhi 180° maan lena.', 'Assuming the exterior angles also add to 180°.', 'बहिष्कोणों का योग भी 180° मान लेना।'),
      };
    default:
      return {
        steps: [intro, extend, fill],
        remember,
        mistake: tx('Exterior ki jagah andar wala ∠C likh dena.', 'Writing the inside angle ∠C instead of the exterior angle.', 'बहिष्कोण की जगह अंदर वाला ∠C लिख देना।'),
      };
  }
}
