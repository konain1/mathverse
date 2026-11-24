import { classifyByAngles, classifyBySides, isoscelesBaseAngle } from '@/lib/geometry/formulas';
import { lengthText } from '@/lib/format';
import { randInt } from '@/lib/random';
import { defineQuestion, tx, type QuestionTemplate } from '@/topics/contract';
import { LATTICE, LATTICE_KEYS, sidesOf } from '@/topics/shared/tri/lattice';
import { ANGLE_KINDS, ANGLE_OPTIONS, SIDE_KINDS, SIDE_OPTIONS } from '@/topics/shared/tri/words';

/** Angle sets (A, B, C) of each kind, for the "by angles" question. */
export const ANGLE_SETS: readonly [number, number, number][] = [
  [70, 50, 60], [60, 60, 60], [70, 45, 65], [90, 30, 60], [90, 45, 45], [90, 25, 65], [100, 40, 40], [120, 30, 30], [110, 35, 35], [95, 50, 35],
];
const latticeIndex = (rng: () => number) => randInt(rng, 0, LATTICE_KEYS.length - 1);
export const latticeTri = (i: number) => LATTICE[LATTICE_KEYS[i]!];
const sidesTxt = (i: number) => sidesOf(latticeTri(i)).map((x) => lengthText(x)).join(', ');
const bySidesOf = (i: number) => classifyBySides(...sidesOf(latticeTri(i)), 1e-6);
const byAnglesOf = (i: number) => classifyByAngles(...sidesOf(latticeTri(i)), 1e-6);
/** Largest angle decides acute / right / obtuse. */
export const kindFromAngles = (angles: readonly number[]) => {
  const m = Math.max(...angles);
  return m === 90 ? 'right' : m > 90 ? 'obtuse' : 'acute';
};

const SIDE_LABEL = tx('Sides ke hisaab se', 'By sides', 'भुजाओं के आधार पर');
const ANGLE_LABEL = tx('Angles ke hisaab se', 'By angles', 'कोणों के आधार पर');

const sideMistakes = (answerId: string) => [
  { answerId, value: 0, message: tx('Equilateral mein teeno sides barabar hoti hain. Yahan aisa nahi hai.', 'An equilateral triangle has all three sides equal. Not here.', 'समबाहु त्रिभुज में तीनों भुजाएँ बराबर होती हैं। यहाँ ऐसा नहीं है।') },
  { answerId, value: 1, message: tx('Isosceles ke liye kam se kam do sides barabar chahiye. Sides dhyan se milao.', 'Isosceles needs at least two equal sides. Compare the sides carefully.', 'समद्विबाहु के लिए कम से कम दो भुजाएँ बराबर चाहिए। भुजाएँ ध्यान से मिलाओ।') },
  { answerId, value: 2, message: tx('Scalene matlab koi bhi do sides barabar nahi. Yahan do sides barabar hain.', 'Scalene means no two sides are equal. Here two sides are equal.', 'विषमबाहु यानी कोई भी दो भुजाएँ बराबर नहीं। यहाँ दो भुजाएँ बराबर हैं।') },
];
const angleMistakes = (answerId: string) => [
  { answerId, value: 0, message: tx('Acute mein teeno angles 90° se chhote hote hain. Sabse bada angle dekho.', 'In an acute triangle all three angles are under 90°. Look at the biggest angle.', 'न्यूनकोण में तीनों कोण 90° से छोटे होते हैं। सबसे बड़ा कोण देखो।') },
  { answerId, value: 1, message: tx('Right triangle mein ek angle bilkul 90° hota hai.', 'A right triangle has one angle of exactly 90°.', 'समकोण त्रिभुज में एक कोण ठीक 90° होता है।') },
  { answerId, value: 2, message: tx('Obtuse mein ek angle 90° se bada hota hai.', 'An obtuse triangle has one angle bigger than 90°.', 'अधिककोण में एक कोण 90° से बड़ा होता है।') },
];

export const questions: QuestionTemplate[] = [
  defineQuestion({
    id: 'by-sides',
    level: 'basic',
    params: { i: 0 },
    generate: (rng) => ({ i: latticeIndex(rng) }),
    prompt: ({ i }) =>
      tx(
        `Ek triangle ki sides ${sidesTxt(i)} hain. Sides ke hisaab se ye kaunsa triangle hai?`,
        `A triangle has sides ${sidesTxt(i)}. What kind of triangle is it by its sides?`,
        `एक त्रिभुज की भुजाएँ ${sidesTxt(i)} हैं। भुजाओं के आधार पर यह कौन-सा त्रिभुज है?`,
      ),
    given: ({ i }) => sidesOf(latticeTri(i)).map((v, k) => ({ label: tx(['BC', 'CA', 'AB'][k]!, ['BC', 'CA', 'AB'][k]!, ['BC', 'CA', 'AB'][k]!), value: Math.round(v * 100) / 100, unit: 'cm' as const })),
    find: () => [SIDE_LABEL],
    answers: ({ i }) => [{ id: 'sides', label: SIDE_LABEL, options: SIDE_OPTIONS, value: SIDE_KINDS.indexOf(bySidesOf(i)), unit: 'none' }],
    mistakes: ({ i }) => sideMistakes('sides').filter((m) => m.value !== SIDE_KINDS.indexOf(bySidesOf(i))),
  }),
  defineQuestion({
    id: 'by-angles',
    level: 'medium',
    params: { j: 0 },
    generate: (rng) => ({ j: randInt(rng, 0, ANGLE_SETS.length - 1) }),
    prompt: ({ j }) => {
      const [A, B, C] = ANGLE_SETS[j]!;
      return tx(
        `Ek triangle ke angles ${A}°, ${B}° aur ${C}° hain. Angles ke hisaab se ye kaunsa triangle hai?`,
        `A triangle has angles of ${A}°, ${B}° and ${C}°. What kind of triangle is it by its angles?`,
        `एक त्रिभुज के कोण ${A}°, ${B}° और ${C}° हैं। कोणों के आधार पर यह कौन-सा त्रिभुज है?`,
      );
    },
    given: ({ j }) => ANGLE_SETS[j]!.map((v, k) => ({ label: tx(`∠${'ABC'[k]}`, `∠${'ABC'[k]}`, `∠${'ABC'[k]}`), value: v, unit: 'deg' as const })),
    find: () => [ANGLE_LABEL],
    answers: ({ j }) => [{ id: 'angles', label: ANGLE_LABEL, options: ANGLE_OPTIONS, value: ANGLE_KINDS.indexOf(kindFromAngles(ANGLE_SETS[j]!)), unit: 'none' }],
    mistakes: ({ j }) => angleMistakes('angles').filter((m) => m.value !== ANGLE_KINDS.indexOf(kindFromAngles(ANGLE_SETS[j]!))),
  }),
  defineQuestion({
    id: 'both',
    level: 'hard',
    params: { i: 1 },
    generate: (rng) => ({ i: latticeIndex(rng) }),
    prompt: ({ i }) =>
      tx(
        `Sides ${sidesTxt(i)} wala triangle sides ke hisaab se aur angles ke hisaab se kaunsa hai? (Hint: sabse lambi side ka square baaki do ke squares ke jod se compare karo.)`,
        `What kind of triangle has sides ${sidesTxt(i)}, by sides and by angles? (Hint: compare the square of the longest side with the sum of the squares of the other two.)`,
        `भुजाएँ ${sidesTxt(i)} वाला त्रिभुज भुजाओं के आधार पर और कोणों के आधार पर कौन-सा है? (संकेत: सबसे लंबी भुजा के वर्ग की तुलना बाकी दो के वर्गों के योग से करो।)`,
      ),
    given: ({ i }) => sidesOf(latticeTri(i)).map((v, k) => ({ label: tx(['BC', 'CA', 'AB'][k]!, ['BC', 'CA', 'AB'][k]!, ['BC', 'CA', 'AB'][k]!), value: Math.round(v * 100) / 100, unit: 'cm' as const })),
    find: () => [SIDE_LABEL, ANGLE_LABEL],
    answers: ({ i }) => [
      { id: 'sides', label: SIDE_LABEL, options: SIDE_OPTIONS, value: SIDE_KINDS.indexOf(bySidesOf(i)), unit: 'none' },
      { id: 'angles', label: ANGLE_LABEL, options: ANGLE_OPTIONS, value: ANGLE_KINDS.indexOf(byAnglesOf(i)), unit: 'none' },
    ],
    mistakes: ({ i }) => [
      ...sideMistakes('sides').filter((m) => m.value !== SIDE_KINDS.indexOf(bySidesOf(i))),
      ...angleMistakes('angles').filter((m) => m.value !== ANGLE_KINDS.indexOf(byAnglesOf(i))),
    ],
  }),
  defineQuestion({
    id: 'isosceles-apex',
    level: 'challenge',
    params: { a: 100 },
    generate: (rng) => ({ a: 10 * randInt(rng, 2, 16) }),
    prompt: ({ a }) =>
      tx(
        `Ek isosceles triangle ka apex angle (barabar sides ke beech) ${a}° hai. Har base angle kitna hai, aur angles ke hisaab se ye kaunsa triangle hai?`,
        `An isosceles triangle has an apex angle (between the equal sides) of ${a}°. What is each base angle, and what kind of triangle is it by angles?`,
        `एक समद्विबाहु त्रिभुज का शीर्ष कोण (बराबर भुजाओं के बीच) ${a}° है। हर आधार कोण कितना है, और कोणों के आधार पर यह कौन-सा त्रिभुज है?`,
      ),
    given: ({ a }) => [{ label: tx('Apex angle', 'Apex angle', 'शीर्ष कोण'), value: a, unit: 'deg' }],
    find: () => [tx('Base angle', 'Base angle', 'आधार कोण'), ANGLE_LABEL],
    answers: ({ a }) => [
      { id: 'base', label: tx('Base angle', 'Base angle', 'आधार कोण'), value: isoscelesBaseAngle(a), unit: 'deg' },
      { id: 'angles', label: ANGLE_LABEL, options: ANGLE_OPTIONS, value: ANGLE_KINDS.indexOf(kindFromAngles([a, isoscelesBaseAngle(a), isoscelesBaseAngle(a)])), unit: 'none' },
    ],
    mistakes: ({ a }) => [
      {
        answerId: 'base',
        value: 180 - a,
        message: tx('Ye dono base angles ka jod hai: 2 se baanto.', 'That is both base angles together: halve it.', 'यह दोनों आधार कोणों का योग है: 2 से बाँटो।'),
      },
      ...angleMistakes('angles').filter((m) => m.value !== ANGLE_KINDS.indexOf(kindFromAngles([a, isoscelesBaseAngle(a), isoscelesBaseAngle(a)]))),
    ],
  }),
];

