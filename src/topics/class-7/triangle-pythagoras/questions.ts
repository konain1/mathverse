import { classifyByAngles, hypotenuse, missingLeg } from '@/lib/geometry/formulas';
import { pick } from '@/lib/random';
import { defineQuestion, tx, type QuestionTemplate } from '@/topics/contract';
import { LATTICE, sidesOf, type Tri } from '@/topics/shared/tri/lattice';
import { YES_NO } from '@/topics/shared/tri/words';

const ANG = (s: string) => tx(s, s, s);
/** Legs (BC, BA) that fit the grid with a whole-number hypotenuse. */
const LEGS: readonly [number, number][] = [[3, 4], [4, 3], [6, 8], [8, 6]];
export const rightTri = (a: number, b: number): Tri => [[0, 0, -b], [0, 0, 0], [a, 0, 0]];
export const CHECK_TRIS = ['right345', 'right6810', 'iso566', 'iso558'] as const;

export const questions: QuestionTemplate[] = [
  defineQuestion({
    id: 'hypotenuse',
    level: 'basic',
    params: { a: 6, b: 8 },
    generate: (rng) => {
      const [a, b] = pick(rng, LEGS);
      return { a, b };
    },
    prompt: ({ a, b }) =>
      tx(
        `Right triangle ABC mein ∠B = 90°, BC = ${a} cm aur AB = ${b} cm hai. Hypotenuse AC kitna hai?`,
        `In right triangle ABC, ∠B = 90°, BC = ${a} cm and AB = ${b} cm. How long is the hypotenuse AC?`,
        `समकोण त्रिभुज ABC में ∠B = 90°, BC = ${a} cm और AB = ${b} cm है। कर्ण AC कितना है?`,
      ),
    given: ({ a, b }) => [
      { label: ANG('BC'), value: a, unit: 'cm' },
      { label: ANG('AB'), value: b, unit: 'cm' },
    ],
    find: () => [ANG('AC')],
    answers: ({ a, b }) => [{ id: 'ac', label: ANG('AC'), value: hypotenuse(a, b), unit: 'cm' }],
    mistakes: ({ a, b }) => [
      {
        answerId: 'ac',
        value: a + b,
        message: tx('Sides seedhe nahi judte. Squares judte hain: AC² = BC² + AB².', "The sides don't add directly. Their squares do: AC² = BC² + AB².", 'भुजाएँ सीधे नहीं जुड़तीं। वर्ग जुड़ते हैं: AC² = BC² + AB²।'),
      },
      {
        answerId: 'ac',
        value: a * a + b * b,
        message: tx('Ye AC² hai. Ab square root lo.', "That's AC². Now take the square root.", 'यह AC² है। अब वर्गमूल लो।'),
      },
    ],
  }),
  defineQuestion({
    id: 'missing-leg',
    level: 'medium',
    params: { a: 8, b: 6 },
    generate: (rng) => {
      const [a, b] = pick(rng, LEGS);
      return { a, b };
    },
    prompt: ({ a, b }) =>
      tx(
        `Right triangle ABC mein ∠B = 90°, hypotenuse AC = ${hypotenuse(a, b)} cm aur BC = ${a} cm hai. AB kitna hai?`,
        `In right triangle ABC, ∠B = 90°, the hypotenuse AC = ${hypotenuse(a, b)} cm and BC = ${a} cm. How long is AB?`,
        `समकोण त्रिभुज ABC में ∠B = 90°, कर्ण AC = ${hypotenuse(a, b)} cm और BC = ${a} cm है। AB कितना है?`,
      ),
    given: ({ a, b }) => [
      { label: ANG('AC'), value: hypotenuse(a, b), unit: 'cm' },
      { label: ANG('BC'), value: a, unit: 'cm' },
    ],
    find: () => [ANG('AB')],
    answers: ({ a, b }) => [{ id: 'ab', label: ANG('AB'), value: missingLeg(hypotenuse(a, b), a), unit: 'cm' }],
    mistakes: ({ a, b }) => [
      {
        answerId: 'ab',
        value: hypotenuse(a, b) - a,
        message: tx('Squares ghatao, sides nahi: AB² = AC² − BC².', 'Subtract the squares, not the sides: AB² = AC² − BC².', 'वर्ग घटाओ, भुजाएँ नहीं: AB² = AC² − BC²।'),
      },
      {
        answerId: 'ab',
        value: Math.round(hypotenuse(hypotenuse(a, b), a) * 100) / 100,
        message: tx('Hypotenuse sabse lambi side hai; baaki side nikaalne ke liye squares ghatate hain, jodte nahi.', 'The hypotenuse is the longest side; to find a leg you subtract squares, not add them.', 'कर्ण सबसे लंबी भुजा है; दूसरी भुजा निकालने के लिए वर्ग घटाते हैं, जोड़ते नहीं।'),
      },
    ],
  }),
  defineQuestion({
    id: 'is-right',
    level: 'hard',
    params: { i: 2 },
    generate: (rng) => ({ i: Math.floor(rng() * CHECK_TRIS.length) }),
    prompt: ({ i }) => {
      const s = [...sidesOf(LATTICE[CHECK_TRIS[i]!])].sort((x, y) => x - y);
      return tx(
        `Kya ${s.join(' cm, ')} cm sides wala triangle right-angled hai? Do chhoti sides ke squares ka jod bhi likho.`,
        `Is a triangle with sides ${s.join(' cm, ')} cm right-angled? Also give the sum of the squares of the two shorter sides.`,
        `क्या ${s.join(' cm, ')} cm भुजाओं वाला त्रिभुज समकोण है? दो छोटी भुजाओं के वर्गों का योग भी लिखो।`,
      );
    },
    given: ({ i }) =>
      [...sidesOf(LATTICE[CHECK_TRIS[i]!])].sort((x, y) => x - y).map((v, k) => ({ label: tx(`Side ${k + 1}`, `Side ${k + 1}`, `भुजा ${k + 1}`), value: v, unit: 'cm' as const })),
    find: () => [tx('Chhoti sides ke squares ka jod', 'Sum of squares of the shorter sides', 'छोटी भुजाओं के वर्गों का योग'), tx('Right-angled?', 'Right-angled?', 'समकोण?')],
    answers: ({ i }) => {
      const s = [...sidesOf(LATTICE[CHECK_TRIS[i]!])].sort((x, y) => x - y) as [number, number, number];
      return [
        { id: 'sum', label: tx('a² + b²', 'a² + b²', 'a² + b²'), value: s[0] * s[0] + s[1] * s[1], unit: 'none' },
        { id: 'right', label: tx('Right-angled?', 'Right-angled?', 'समकोण?'), options: YES_NO, value: classifyByAngles(...s) === 'right' ? 0 : 1, unit: 'none' },
      ];
    },
    mistakes: ({ i }) => {
      const s = [...sidesOf(LATTICE[CHECK_TRIS[i]!])].sort((x, y) => x - y) as [number, number, number];
      const right = classifyByAngles(...s) === 'right';
      return [
        right
          ? { answerId: 'right', value: 1, message: tx(`${s[0]}² + ${s[1]}² = ${s[2]}² hai, to ye right triangle hai.`, `${s[0]}² + ${s[1]}² = ${s[2]}², so it is a right triangle.`, `${s[0]}² + ${s[1]}² = ${s[2]}² है, तो यह समकोण त्रिभुज है।`) }
          : { answerId: 'right', value: 0, message: tx(`${s[0]}² + ${s[1]}² ≠ ${s[2]}², isliye right triangle nahi.`, `${s[0]}² + ${s[1]}² ≠ ${s[2]}², so it isn't a right triangle.`, `${s[0]}² + ${s[1]}² ≠ ${s[2]}², इसलिए समकोण त्रिभुज नहीं।`) },
      ];
    },
  }),
  defineQuestion({
    id: 'ladder',
    level: 'challenge',
    params: { c: 10, g: 6 },
    generate: (rng) => {
      const [c, g] = pick(rng, [[5, 3], [5, 4], [10, 6], [10, 8]] as const);
      return { c, g };
    },
    prompt: ({ c, g }) =>
      tx(
        `${c} cm lambi ek model seedhi deewar se tiki hai. Seedhi ka neeche wala sira deewar se ${g} cm door hai. Seedhi deewar par kitni oonchai tak pahunchti hai?`,
        `A ${c} cm model ladder leans against a wall. Its foot is ${g} cm from the wall. How high up the wall does it reach?`,
        `${c} cm लंबी एक मॉडल सीढ़ी दीवार से टिकी है। सीढ़ी का नीचे वाला सिरा दीवार से ${g} cm दूर है। सीढ़ी दीवार पर कितनी ऊँचाई तक पहुँचती है?`,
      ),
    given: ({ c, g }) => [
      { label: tx('Seedhi', 'Ladder', 'सीढ़ी'), value: c, unit: 'cm' },
      { label: tx('Deewar se doori', 'Distance from wall', 'दीवार से दूरी'), value: g, unit: 'cm' },
    ],
    find: () => [tx('Oonchai', 'Height', 'ऊँचाई')],
    answers: ({ c, g }) => [{ id: 'h', label: tx('Oonchai', 'Height', 'ऊँचाई'), value: missingLeg(c, g), unit: 'cm' }],
    mistakes: ({ c, g }) => [
      {
        answerId: 'h',
        value: c - g,
        message: tx('Seedhi hypotenuse hai (90° ke saamne). Oonchai² = seedhi² − doori².', 'The ladder is the hypotenuse (opposite the 90°). Height² = ladder² − distance².', 'सीढ़ी कर्ण है (90° के सामने)। ऊँचाई² = सीढ़ी² − दूरी²।'),
      },
    ],
  }),
];

/** Legs (BC = a along the ground, BA = b up) for each question. */
export function legsOf(id: string, p: Record<string, number>): [number, number] | undefined {
  if (id === 'hypotenuse' || id === 'missing-leg') return [p.a!, p.b!];
  if (id === 'ladder') return [p.g!, missingLeg(p.c!, p.g!)];
  return undefined;
}
