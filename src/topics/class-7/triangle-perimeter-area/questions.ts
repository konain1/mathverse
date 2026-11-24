import { hypotenuse, triangleArea, triangleHeight, trianglePerimeter } from '@/lib/geometry/formulas';
import { pick, randInt } from '@/lib/random';
import { defineQuestion, tx, type QuestionTemplate } from '@/topics/contract';
import { LATTICE, sidesOf, triFromBase, type Tri } from '@/topics/shared/tri/lattice';

export const INT_TRIS = ['iso566', 'iso558', 'right345', 'right6810'] as const;
const B = tx('Base (b)', 'Base (b)', 'आधार (b)');
const H = tx('Height (h)', 'Height (h)', 'ऊँचाई (h)');
const AREA = tx('Area', 'Area', 'क्षेत्रफल');

const baseHeight = (rng: () => number) => {
  const b = pick(rng, [4, 6, 8, 10]);
  return { b, h: randInt(rng, 2, 8), x: randInt(rng, 1, b - 1) };
};

export const questions: QuestionTemplate[] = [
  defineQuestion({
    id: 'perimeter',
    level: 'basic',
    params: { i: 0 },
    generate: (rng) => ({ i: randInt(rng, 0, INT_TRIS.length - 1) }),
    prompt: ({ i }) => {
      const s = sidesOf(LATTICE[INT_TRIS[i]!]);
      return tx(
        `Ek triangle ki sides ${s.join(' cm, ')} cm hain. Uska perimeter nikalo.`,
        `A triangle has sides of ${s.join(' cm, ')} cm. Find its perimeter.`,
        `एक त्रिभुज की भुजाएँ ${s.join(' cm, ')} cm हैं। उसका परिमाप निकालो।`,
      );
    },
    given: ({ i }) => sidesOf(LATTICE[INT_TRIS[i]!]).map((v, k) => ({ label: tx(['BC', 'CA', 'AB'][k]!, ['BC', 'CA', 'AB'][k]!, ['BC', 'CA', 'AB'][k]!), value: v, unit: 'cm' as const })),
    find: () => [tx('Perimeter', 'Perimeter', 'परिमाप')],
    answers: ({ i }) => [{ id: 'p', label: tx('Perimeter', 'Perimeter', 'परिमाप'), value: trianglePerimeter(...sidesOf(LATTICE[INT_TRIS[i]!])), unit: 'cm' }],
    mistakes: ({ i }) => {
      const [a, b, c] = sidesOf(LATTICE[INT_TRIS[i]!]);
      return [{ answerId: 'p', value: a + b, message: tx('Teesri side bhi jodo: perimeter = teeno sides.', 'Add the third side too: perimeter = all three sides.', 'तीसरी भुजा भी जोड़ो: परिमाप = तीनों भुजाएँ।') }, { answerId: 'p', value: a * b * c, message: tx('Perimeter mein jodte hain, guna nahi.', 'Perimeter adds; it doesn’t multiply.', 'परिमाप में जोड़ते हैं, गुणा नहीं।') }];
    },
  }),
  defineQuestion({
    id: 'area',
    level: 'medium',
    params: { b: 8, h: 5, x: 3 },
    generate: baseHeight,
    prompt: ({ b, h }) =>
      tx(
        `Ek triangle ka base ${b} cm aur height ${h} cm hai. Uska area nikalo.`,
        `A triangle has a base of ${b} cm and a height of ${h} cm. Find its area.`,
        `एक त्रिभुज का आधार ${b} cm और ऊँचाई ${h} cm है। उसका क्षेत्रफल निकालो।`,
      ),
    given: ({ b, h }) => [
      { label: B, value: b, unit: 'cm' },
      { label: H, value: h, unit: 'cm' },
    ],
    find: () => [AREA],
    answers: ({ b, h }) => [{ id: 'area', label: AREA, value: triangleArea(b, h), unit: 'cm2' }],
    mistakes: ({ b, h }) => [
      {
        answerId: 'area',
        value: b * h,
        message: tx('Ye parallelogram ka area hai (b × h). Triangle uska aadha: ½ × b × h.', "That's the parallelogram's area (b × h). The triangle is half of it: ½ × b × h.", 'यह समांतर चतुर्भुज का क्षेत्रफल है (b × h)। त्रिभुज उसका आधा: ½ × b × h।'),
      },
    ],
  }),
  defineQuestion({
    id: 'height-from-area',
    level: 'hard',
    params: { b: 6, h: 7, x: 2 },
    generate: baseHeight,
    prompt: ({ b, h }) =>
      tx(
        `Ek triangle ka area ${triangleArea(b, h)} cm² aur base ${b} cm hai. Uski height kitni hai?`,
        `A triangle has an area of ${triangleArea(b, h)} cm² and a base of ${b} cm. What is its height?`,
        `एक त्रिभुज का क्षेत्रफल ${triangleArea(b, h)} cm² और आधार ${b} cm है। उसकी ऊँचाई कितनी है?`,
      ),
    given: ({ b, h }) => [
      { label: AREA, value: triangleArea(b, h), unit: 'cm2' },
      { label: B, value: b, unit: 'cm' },
    ],
    find: () => [H],
    answers: ({ b, h }) => [{ id: 'h', label: H, value: triangleHeight(triangleArea(b, h), b), unit: 'cm' }],
    mistakes: ({ b, h }) => [
      { answerId: 'h', value: triangleArea(b, h) / b, message: tx('h = 2 × area ÷ base. ½ ko waapas laane ke liye 2 se guna karo.', 'h = 2 × area ÷ base. Multiply by 2 to undo the ½.', 'h = 2 × क्षेत्रफल ÷ आधार। ½ को वापस लाने के लिए 2 से गुणा करो।') },
    ],
  }),
  defineQuestion({
    id: 'hypotenuse-height',
    level: 'challenge',
    params: { k: 1 },
    generate: (rng) => ({ k: randInt(rng, 1, 2) }),
    prompt: ({ k }) =>
      tx(
        `Right triangle ki legs ${3 * k} cm aur ${4 * k} cm hain. Uska area kitna hai, aur hypotenuse par height kitni hai?`,
        `A right triangle has legs of ${3 * k} cm and ${4 * k} cm. What is its area, and what is the height to the hypotenuse?`,
        `एक समकोण त्रिभुज की भुजाएँ ${3 * k} cm और ${4 * k} cm हैं। उसका क्षेत्रफल कितना है, और कर्ण पर ऊँचाई कितनी है?`,
      ),
    given: ({ k }) => [
      { label: tx('Leg 1', 'Leg 1', 'भुजा 1'), value: 3 * k, unit: 'cm' },
      { label: tx('Leg 2', 'Leg 2', 'भुजा 2'), value: 4 * k, unit: 'cm' },
    ],
    find: () => [AREA, tx('Hypotenuse par height', 'Height to the hypotenuse', 'कर्ण पर ऊँचाई')],
    answers: ({ k }) => {
      const area = triangleArea(3 * k, 4 * k);
      return [
        { id: 'area', label: AREA, value: area, unit: 'cm2' },
        { id: 'h', label: tx('Height', 'Height', 'ऊँचाई'), value: triangleHeight(area, hypotenuse(3 * k, 4 * k)), unit: 'cm' },
      ];
    },
    mistakes: ({ k }) => [
      { answerId: 'h', value: 4 * k, message: tx('Ye ek leg ki height hai. Hypotenuse ko base maano: h = 2 × area ÷ hypotenuse.', "That's the height to a leg. Take the hypotenuse as the base: h = 2 × area ÷ hypotenuse.", 'यह एक भुजा पर ऊँचाई है। कर्ण को आधार मानो: h = 2 × क्षेत्रफल ÷ कर्ण।') },
    ],
  }),
];

export function triOf(id: string, p: Record<string, number>): Tri {
  if (id === 'perimeter') return LATTICE[INT_TRIS[p.i!]!];
  if (id === 'hypotenuse-height') return [[0, 0, -4 * p.k!], [0, 0, 0], [3 * p.k!, 0, 0]];
  return triFromBase(p.b!, p.x!, p.h!);
}
