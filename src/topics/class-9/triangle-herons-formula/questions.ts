import { heronArea, semiPerimeter, triangleHeight } from '@/lib/geometry/formulas';
import { randInt } from '@/lib/random';
import { defineQuestion, tx, type QuestionTemplate } from '@/topics/contract';
import { LATTICE, sidesOf } from '@/topics/shared/tri/lattice';

/** Triangles with whole-number sides AND area that can be built on the grid. */
export const HERON_TRIS = ['iso566', 'iso558', 'right345', 'right6810'] as const;
export const sidesFor = (i: number) => sidesOf(LATTICE[HERON_TRIS[i]!]);
const S = tx('Semi-perimeter (s)', 'Semi-perimeter (s)', 'अर्धपरिमाप (s)');
const AREA = tx('Area', 'Area', 'क्षेत्रफल');
const givenSides = (i: number) =>
  sidesFor(i).map((v, k) => ({ label: tx(['a = BC', 'b = CA', 'c = AB'][k]!, ['a = BC', 'b = CA', 'c = AB'][k]!, ['a = BC', 'b = CA', 'c = AB'][k]!), value: v, unit: 'cm' as const }));
const sidesTx = (i: number) => sidesFor(i).join(' cm, ') + ' cm';
const pickI = (rng: () => number) => ({ i: randInt(rng, 0, HERON_TRIS.length - 1) });

export const questions: QuestionTemplate[] = [
  defineQuestion({
    id: 'semi-perimeter',
    level: 'basic',
    params: { i: 0 },
    generate: pickI,
    prompt: ({ i }) =>
      tx(
        `Ek triangle ki sides ${sidesTx(i)} hain. Uska semi-perimeter (s) nikalo.`,
        `A triangle has sides of ${sidesTx(i)}. Find its semi-perimeter (s).`,
        `एक त्रिभुज की भुजाएँ ${sidesTx(i)} हैं। उसका अर्धपरिमाप (s) निकालो।`,
      ),
    given: ({ i }) => givenSides(i),
    find: () => [S],
    answers: ({ i }) => [{ id: 's', label: S, value: semiPerimeter(...sidesFor(i)), unit: 'cm' }],
    mistakes: ({ i }) => [
      { answerId: 's', value: 2 * semiPerimeter(...sidesFor(i)), message: tx('Ye poora perimeter hai. Semi matlab aadha: ÷ 2.', "That's the whole perimeter. Semi means half: ÷ 2.", 'यह पूरा परिमाप है। अर्ध यानी आधा: ÷ 2।') },
    ],
  }),
  defineQuestion({
    id: 'area',
    level: 'medium',
    params: { i: 1 },
    generate: pickI,
    prompt: ({ i }) =>
      tx(
        `Heron's formula se ${sidesTx(i)} sides wale triangle ka area nikalo.`,
        `Use Heron's formula to find the area of a triangle with sides of ${sidesTx(i)}.`,
        `हीरोन के सूत्र से ${sidesTx(i)} भुजाओं वाले त्रिभुज का क्षेत्रफल निकालो।`,
      ),
    given: ({ i }) => givenSides(i),
    find: () => [AREA],
    answers: ({ i }) => [{ id: 'area', label: AREA, value: heronArea(...sidesFor(i)), unit: 'cm2' }],
    mistakes: ({ i }) => {
      const [a, b, c] = sidesFor(i);
      const s = semiPerimeter(a, b, c);
      return [
        { answerId: 'area', value: s * (s - a) * (s - b) * (s - c), message: tx('Square root lena bhool gaye: area = √(s(s − a)(s − b)(s − c)).', 'You forgot the square root: area = √(s(s − a)(s − b)(s − c)).', 'वर्गमूल लेना भूल गए: क्षेत्रफल = √(s(s − a)(s − b)(s − c))।') },
      ];
    },
  }),
  defineQuestion({
    id: 'check-height',
    level: 'hard',
    params: { i: 0 },
    generate: pickI,
    prompt: ({ i }) =>
      tx(
        `${sidesTx(i)} sides wale triangle ka area Heron's formula se nikalo, phir base a = ${sidesFor(i)[0]} cm par height nikalo.`,
        `Find the area of the triangle with sides ${sidesTx(i)} using Heron's formula, then find the height on the base a = ${sidesFor(i)[0]} cm.`,
        `${sidesTx(i)} भुजाओं वाले त्रिभुज का क्षेत्रफल हीरोन के सूत्र से निकालो, फिर आधार a = ${sidesFor(i)[0]} cm पर ऊँचाई निकालो।`,
      ),
    given: ({ i }) => givenSides(i),
    find: () => [AREA, tx('Height on a', 'Height on a', 'a पर ऊँचाई')],
    answers: ({ i }) => {
      const area = heronArea(...sidesFor(i));
      return [
        { id: 'area', label: AREA, value: area, unit: 'cm2' },
        { id: 'h', label: tx('Height', 'Height', 'ऊँचाई'), value: triangleHeight(area, sidesFor(i)[0]), unit: 'cm' },
      ];
    },
    mistakes: ({ i }) => [
      { answerId: 'h', value: heronArea(...sidesFor(i)) / sidesFor(i)[0], message: tx('h = 2 × area ÷ base.', 'h = 2 × area ÷ base.', 'h = 2 × क्षेत्रफल ÷ आधार।') },
    ],
  }),
  defineQuestion({
    id: 'paint-cost',
    level: 'challenge',
    params: { i: 3, r: 3 },
    generate: (rng) => ({ ...pickI(rng), r: randInt(rng, 2, 6) }),
    prompt: ({ i, r }) =>
      tx(
        `Ek triangular board ki sides ${sidesTx(i)} hain. Use ₹${r} per cm² ki dar se paint karna hai. Area aur kharcha nikalo.`,
        `A triangular board has sides of ${sidesTx(i)}. It is to be painted at ₹${r} per cm². Find the area and the cost.`,
        `एक त्रिभुजाकार बोर्ड की भुजाएँ ${sidesTx(i)} हैं। उसे ₹${r} प्रति cm² की दर से रंगना है। क्षेत्रफल और ख़र्च निकालो।`,
      ),
    given: ({ i, r }) => [...givenSides(i), { label: tx('Dar (per cm²)', 'Rate (per cm²)', 'दर (प्रति cm²)'), value: r, unit: 'rupees' as const }],
    find: () => [AREA, tx('Kharcha', 'Cost', 'ख़र्च')],
    answers: ({ i, r }) => {
      const area = heronArea(...sidesFor(i));
      return [
        { id: 'area', label: AREA, value: area, unit: 'cm2' },
        { id: 'cost', label: tx('Kharcha', 'Cost', 'ख़र्च'), value: area * r, unit: 'rupees' },
      ];
    },
    mistakes: ({ i, r }) => {
      const s = sidesFor(i);
      return [{ answerId: 'cost', value: (s[0] + s[1] + s[2]) * r, message: tx('Paint poori satah par lagta hai: area × dar, perimeter × dar nahi.', 'Paint covers the surface: area × rate, not perimeter × rate.', 'रंग पूरी सतह पर लगता है: क्षेत्रफल × दर, परिमाप × दर नहीं।') }];
    },
  }),
];
