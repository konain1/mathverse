import { anglesFromRatio, isoscelesBaseAngle, thirdAngle } from '@/lib/geometry/formulas';
import { tx, type Params, type SolutionScript } from '@/topics/contract';
import { step } from '@/topics/shared/flat/steps';

const remember = tx(
  'Kisi bhi triangle ke teeno angles ka jod hamesha 180° hota hai.',
  'The three angles of any triangle always add up to 180°.',
  'किसी भी त्रिभुज के तीनों कोणों का योग हमेशा 180° होता है।',
);
const why = (): [string, string, string] => [
  'Teeno kone ek seedhi line par ek doosre se sat kar baith jaate hain, aur seedhi line ka angle 180° hota hai.',
  'The three corners fit together side by side on a straight line, and a straight angle is 180°.',
  'तीनों कोने एक सीधी रेखा पर एक-दूसरे से सटकर बैठ जाते हैं, और सीधी रेखा का कोण 180° होता है।',
];

/** Angles at A, B, C for each question (used by the scene too). */
export function anglesOf(id: string, p: Params): [number, number, number] {
  switch (id) {
    case 'right-triangle':
      return [thirdAngle(90, p.c!), 90, p.c!];
    case 'isosceles-base': {
      const base = isoscelesBaseAngle(p.a!);
      return [p.a!, base, base];
    }
    case 'ratio':
      return anglesFromRatio(p.p!, p.q!, p.r!);
    default:
      return [thirdAngle(p.b!, p.c!), p.b!, p.c!];
  }
}

export function solution(id: string, p: Params): SolutionScript {
  const [A, B, C] = anglesOf(id, p);
  const tear = step(
    'tear',
    'tear',
    6,
    [
      'Triangle ke teeno kone kaat ke alag karo, aur unhe ek seedhi line par saath-saath rakho.',
      'Tear off the three corners of the triangle and place them side by side on a straight line.',
      'त्रिभुज के तीनों कोने काटकर अलग करो, और उन्हें एक सीधी रेखा पर साथ-साथ रखो।',
    ],
    undefined,
    why(),
  );
  const line = step(
    'line',
    'line-up',
    4.5,
    [
      'Dekho: teeno milkar bilkul ek seedhi line banate hain, yaani 180°.',
      'Look: together they make exactly a straight line, which is 180°.',
      'देखो: तीनों मिलकर बिल्कुल एक सीधी रेखा बनाते हैं, यानी 180°।',
    ],
    `\\angle A + \\angle B + \\angle C = 180^\\circ`,
  );
  switch (id) {
    case 'right-triangle':
      return {
        steps: [
          step('given', 'angles', 4, [
            `∠B = 90° aur ∠C = ${C}°. ∠A dhoondhna hai.`,
            `∠B = 90° and ∠C = ${C}°. We need ∠A.`,
            `∠B = 90° और ∠C = ${C}°। ∠A ढूँढना है।`,
          ]),
          tear,
          line,
          step(
            'solve',
            'solved',
            4.5,
            [`∠A = 180° − 90° − ${C}° = ${A}°.`, `∠A = 180° − 90° − ${C}° = ${A}°.`, `∠A = 180° − 90° − ${C}° = ${A}°।`],
            `\\angle A = 90^\\circ - ${C}^\\circ = ${A}^\\circ`,
            [
              'Right triangle mein baaki do angles milkar hamesha 90° hote hain.',
              'In a right triangle, the other two angles always add up to 90°.',
              'समकोण त्रिभुज में बाकी दो कोण मिलकर हमेशा 90° होते हैं।',
            ],
          ),
        ],
        remember,
        mistake: tx('90° wala angle ghatana bhool jaana.', 'Forgetting to subtract the 90° angle.', '90° वाला कोण घटाना भूल जाना।'),
      };
    case 'isosceles-base':
      return {
        steps: [
          step('given', 'angles', 4, [
            `AB = AC, isliye ∠B = ∠C. ∠A = ${A}°.`,
            `AB = AC, so ∠B = ∠C. ∠A = ${A}°.`,
            `AB = AC, इसलिए ∠B = ∠C। ∠A = ${A}°।`,
          ], `\\angle B = \\angle C`, [
            'Isosceles triangle mein barabar sides ke saamne wale angles barabar hote hain.',
            'In an isosceles triangle, the angles opposite the equal sides are equal.',
            'समद्विबाहु त्रिभुज में बराबर भुजाओं के सामने वाले कोण बराबर होते हैं।',
          ]),
          tear,
          line,
          step(
            'solve',
            'solved',
            5,
            [
              `∠B + ∠C = 180° − ${A}° = ${180 - A}°. Dono barabar: ${180 - A}° ÷ 2 = ${B}°.`,
              `∠B + ∠C = 180° − ${A}° = ${180 - A}°. They are equal: ${180 - A}° ÷ 2 = ${B}°.`,
              `∠B + ∠C = 180° − ${A}° = ${180 - A}°। दोनों बराबर: ${180 - A}° ÷ 2 = ${B}°।`,
            ],
            `\\angle B = \\angle C = \\dfrac{180^\\circ - ${A}^\\circ}{2} = ${B}^\\circ`,
          ),
        ],
        remember,
        mistake: tx('180° − ∠A ko hi ek angle samajh lena; wo dono ka jod hai.', 'Taking 180° − ∠A as one angle; it is both together.', '180° − ∠A को ही एक कोण समझ लेना; वह दोनों का योग है।'),
      };
    case 'ratio': {
      const n = p.p! + p.q! + p.r!;
      const k = 180 / n;
      return {
        steps: [
          step('parts', 'angles', 4.5, [
            `Kul hisse: ${p.p} + ${p.q} + ${p.r} = ${n}. Saare angles milkar 180°.`,
            `Total parts: ${p.p} + ${p.q} + ${p.r} = ${n}. All the angles together make 180°.`,
            `कुल हिस्से: ${p.p} + ${p.q} + ${p.r} = ${n}। सारे कोण मिलकर 180°।`,
          ], `${n}\\ \\text{parts} = 180^\\circ`),
          tear,
          line,
          step(
            'solve',
            'solved',
            5.5,
            [
              `Ek hissa = 180° ÷ ${n} = ${k}°. Isliye angles: ${A}°, ${B}°, ${C}°.`,
              `One part = 180° ÷ ${n} = ${k}°. So the angles are ${A}°, ${B}°, ${C}°.`,
              `एक हिस्सा = 180° ÷ ${n} = ${k}°। इसलिए कोण: ${A}°, ${B}°, ${C}°।`,
            ],
            `${p.p}k + ${p.q}k + ${p.r}k = 180^\\circ \\Rightarrow k = ${k}^\\circ`,
          ),
        ],
        remember,
        mistake: tx('Ratio ke numbers ko hi angles maan lena.', 'Taking the ratio numbers as the angles.', 'अनुपात की संख्याओं को ही कोण मान लेना।'),
      };
    }
    default:
      return {
        steps: [
          step('given', 'angles', 4, [
            `∠B = ${B}° aur ∠C = ${C}° diye hain. ∠A dhoondhna hai.`,
            `∠B = ${B}° and ∠C = ${C}° are given. We need ∠A.`,
            `∠B = ${B}° और ∠C = ${C}° दिए हैं। ∠A ढूँढना है।`,
          ]),
          tear,
          line,
          step(
            'solve',
            'solved',
            4.5,
            [`∠A = 180° − ${B}° − ${C}° = ${A}°.`, `∠A = 180° − ${B}° − ${C}° = ${A}°.`, `∠A = 180° − ${B}° − ${C}° = ${A}°।`],
            `\\angle A = 180^\\circ - ${B}^\\circ - ${C}^\\circ = ${A}^\\circ`,
          ),
        ],
        remember,
        mistake: tx('180° ki jagah 360° se ghatana.', 'Subtracting from 360° instead of 180°.', '180° की जगह 360° से घटाना।'),
      };
  }
}
