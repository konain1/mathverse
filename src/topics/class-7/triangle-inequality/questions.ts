import { isValidTriangle, wholeThirdSides } from '@/lib/geometry/formulas';
import { randInt } from '@/lib/random';
import { defineQuestion, tx, type QuestionTemplate } from '@/topics/contract';
import { YES_NO } from '@/topics/shared/tri/words';

export const TRIPLES: readonly [number, number, number][] = [
  [3, 4, 5], [4, 5, 6], [5, 6, 8], [2, 3, 4], [6, 7, 8], // can form
  [2, 3, 6], [3, 4, 8], [1, 2, 5], [2, 5, 8], [4, 4, 9], // can't
  [2, 3, 5], [3, 4, 7], // a + b = c: flat, not a triangle
];
const twoSides = (rng: () => number) => {
  const a = randInt(rng, 3, 9);
  let b = randInt(rng, 3, 9);
  if (b === a) b = a === 9 ? 8 : a + 1;
  return { a: Math.min(a, b), b: Math.max(a, b) };
};

export const questions: QuestionTemplate[] = [
  defineQuestion({
    id: 'can-form',
    level: 'basic',
    params: { t: 6 },
    generate: (rng) => ({ t: randInt(rng, 0, TRIPLES.length - 1) }),
    prompt: ({ t }) => {
      const [a, b, c] = TRIPLES[t]!;
      return tx(
        `Kya ${a} cm, ${b} cm aur ${c} cm ki teen lakdiyon se triangle ban sakta hai?`,
        `Can three sticks of ${a} cm, ${b} cm and ${c} cm make a triangle?`,
        `क्या ${a} cm, ${b} cm और ${c} cm की तीन लकड़ियों से त्रिभुज बन सकता है?`,
      );
    },
    given: ({ t }) => TRIPLES[t]!.map((v, k) => ({ label: tx(`Lakdi ${k + 1}`, `Stick ${k + 1}`, `लकड़ी ${k + 1}`), value: v, unit: 'cm' as const })),
    find: () => [tx('Triangle banega?', 'Will it make a triangle?', 'त्रिभुज बनेगा?')],
    answers: ({ t }) => [{ id: 'ok', label: tx('Triangle banega?', 'Will it make a triangle?', 'त्रिभुज बनेगा?'), options: YES_NO, value: isValidTriangle(...TRIPLES[t]!) ? 0 : 1, unit: 'none' }],
    mistakes: ({ t }) => {
      const [a, b, c] = TRIPLES[t]!;
      return isValidTriangle(a, b, c)
        ? [{ answerId: 'ok', value: 1, message: tx(`Sabse chhoti do: ${a} + ${b} = ${a + b}, jo ${c} se bada hai. Ban jayega.`, `The two shortest: ${a} + ${b} = ${a + b}, which is more than ${c}. It works.`, `सबसे छोटी दो: ${a} + ${b} = ${a + b}, जो ${c} से बड़ा है। बन जाएगा।`) }]
        : [{ answerId: 'ok', value: 0, message: tx(`${a} + ${b} = ${a + b}, jo ${c} se bada nahi. Dono lakdiyan milkar bhi ${c} cm tak nahi pahunchti.`, `${a} + ${b} = ${a + b}, which is not more than ${c}. The two sticks together can't reach across ${c} cm.`, `${a} + ${b} = ${a + b}, जो ${c} से बड़ा नहीं। दोनों लकड़ियाँ मिलकर भी ${c} cm तक नहीं पहुँचतीं।`) }];
    },
  }),
  defineQuestion({
    id: 'third-range',
    level: 'medium',
    params: { a: 5, b: 8 },
    generate: twoSides,
    prompt: ({ a, b }) =>
      tx(
        `Ek triangle ki do sides ${a} cm aur ${b} cm hain. Teesri side ki sabse chhoti aur sabse badi whole-number length kya ho sakti hai?`,
        `Two sides of a triangle are ${a} cm and ${b} cm. What are the smallest and largest whole-number lengths the third side can have?`,
        `एक त्रिभुज की दो भुजाएँ ${a} cm और ${b} cm हैं। तीसरी भुजा की सबसे छोटी और सबसे बड़ी पूर्ण संख्या वाली लंबाई क्या हो सकती है?`,
      ),
    given: ({ a, b }) => [
      { label: tx('Side 1', 'Side 1', 'भुजा 1'), value: a, unit: 'cm' },
      { label: tx('Side 2', 'Side 2', 'भुजा 2'), value: b, unit: 'cm' },
    ],
    find: () => [tx('Sabse chhoti', 'Smallest', 'सबसे छोटी'), tx('Sabse badi', 'Largest', 'सबसे बड़ी')],
    answers: ({ a, b }) => {
      const all = wholeThirdSides(a, b);
      return [
        { id: 'min', label: tx('Sabse chhoti', 'Smallest', 'सबसे छोटी'), value: all[0]!, unit: 'cm' },
        { id: 'max', label: tx('Sabse badi', 'Largest', 'सबसे बड़ी'), value: all[all.length - 1]!, unit: 'cm' },
      ];
    },
    mistakes: ({ a, b }) => [
      { answerId: 'max', value: a + b, message: tx(`${a + b} par dono sides seedhi line ban jaati hain: triangle nahi. Usse 1 kam.`, `At ${a + b} the two sides lie flat in a straight line: no triangle. One less.`, `${a + b} पर दोनों भुजाएँ सीधी रेखा बन जाती हैं: त्रिभुज नहीं। उससे 1 कम।`) },
      { answerId: 'min', value: b - a, message: tx(`${b - a} par bhi triangle chapta ho jaata hai. Usse 1 zyada.`, `At ${b - a} the triangle also goes flat. One more.`, `${b - a} पर भी त्रिभुज चपटा हो जाता है। उससे 1 ज़्यादा।`) },
    ],
  }),
  defineQuestion({
    id: 'count',
    level: 'hard',
    params: { a: 4, b: 7 },
    generate: twoSides,
    prompt: ({ a, b }) =>
      tx(
        `Do sides ${a} cm aur ${b} cm hain. Teesri side ki kitni whole-number lengths possible hain?`,
        `Two sides are ${a} cm and ${b} cm. How many whole-number lengths are possible for the third side?`,
        `दो भुजाएँ ${a} cm और ${b} cm हैं। तीसरी भुजा की कितनी पूर्ण संख्या वाली लंबाइयाँ संभव हैं?`,
      ),
    given: ({ a, b }) => [
      { label: tx('Side 1', 'Side 1', 'भुजा 1'), value: a, unit: 'cm' },
      { label: tx('Side 2', 'Side 2', 'भुजा 2'), value: b, unit: 'cm' },
    ],
    find: () => [tx('Kitni values', 'How many values', 'कितने मान')],
    answers: ({ a, b }) => [{ id: 'n', label: tx('Ginti', 'Count', 'गिनती'), value: wholeThirdSides(a, b).length, unit: 'none' }],
    mistakes: ({ a, b }) => [
      { answerId: 'n', value: wholeThirdSides(a, b).length + 2, message: tx(`Dono kinaare (${b - a} aur ${a + b}) shaamil nahi; wahan triangle chapta hai.`, `Leave out both ends (${b - a} and ${a + b}); the triangle is flat there.`, `दोनों सिरे (${b - a} और ${a + b}) शामिल नहीं; वहाँ त्रिभुज चपटा है।`) },
    ],
  }),
  defineQuestion({
    id: 'perimeter-bounds',
    level: 'challenge',
    params: { a: 6, b: 9 },
    generate: twoSides,
    prompt: ({ a, b }) =>
      tx(
        `Ek triangle ki do sides ${a} cm aur ${b} cm hain, aur teesri side bhi whole number hai. Perimeter ki sabse chhoti aur sabse badi value kya ho sakti hai?`,
        `A triangle has two sides of ${a} cm and ${b} cm, and the third side is a whole number too. What are the smallest and largest possible perimeters?`,
        `एक त्रिभुज की दो भुजाएँ ${a} cm और ${b} cm हैं, और तीसरी भुजा भी पूर्ण संख्या है। परिमाप का सबसे छोटा और सबसे बड़ा मान क्या हो सकता है?`,
      ),
    given: ({ a, b }) => [
      { label: tx('Side 1', 'Side 1', 'भुजा 1'), value: a, unit: 'cm' },
      { label: tx('Side 2', 'Side 2', 'भुजा 2'), value: b, unit: 'cm' },
    ],
    find: () => [tx('Sabse chhota perimeter', 'Smallest perimeter', 'सबसे छोटा परिमाप'), tx('Sabse bada perimeter', 'Largest perimeter', 'सबसे बड़ा परिमाप')],
    answers: ({ a, b }) => {
      const all = wholeThirdSides(a, b);
      return [
        { id: 'min', label: tx('Min', 'Min', 'न्यूनतम'), value: a + b + all[0]!, unit: 'cm' },
        { id: 'max', label: tx('Max', 'Max', 'अधिकतम'), value: a + b + all[all.length - 1]!, unit: 'cm' },
      ];
    },
    mistakes: ({ a, b }) => [
      { answerId: 'max', value: 2 * (a + b), message: tx('Teesri side a + b ke barabar nahi ho sakti; usse kam honi chahiye.', "The third side can't equal a + b; it has to be less.", 'तीसरी भुजा a + b के बराबर नहीं हो सकती; उससे कम होनी चाहिए।') },
    ],
  }),
];

/** Two sides the student builds (at a right angle, which always works). */
export function sidesForBuild(id: string, p: Record<string, number>): [number, number] {
  if (id === 'can-form') {
    const [a, b] = TRIPLES[p.t!]!;
    return [Math.min(a, 10), Math.min(b, 10)];
  }
  return [p.a!, p.b!];
}
