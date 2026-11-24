import { rectangleArea, rectangleDiagonal, rectanglePerimeter } from '@/lib/geometry/formulas';
import { defineQuestion, tx, type QuestionTemplate } from '@/topics/contract';
import { randRect, randTriple } from '@/topics/shared/flat/params';

const ANGLE = (n: string) => tx(n, n, n);

export const questions: QuestionTemplate[] = [
  defineQuestion({
    id: 'opposite-sides',
    level: 'basic',
    params: { l: 7, b: 4 },
    generate: (rng) => randRect(rng),
    prompt: ({ l, b }) =>
      tx(
        `Rectangle ABCD mein AB = ${l} cm aur BC = ${b} cm hai. CD aur DA kitne hain?`,
        `In rectangle ABCD, AB = ${l} cm and BC = ${b} cm. How long are CD and DA?`,
        `आयत ABCD में AB = ${l} cm और BC = ${b} cm है। CD और DA कितने हैं?`,
      ),
    given: ({ l, b }) => [
      { label: ANGLE('AB'), value: l, unit: 'cm' },
      { label: ANGLE('BC'), value: b, unit: 'cm' },
    ],
    find: () => [ANGLE('CD'), ANGLE('DA')],
    answers: ({ l, b }) => [
      { id: 'cd', label: ANGLE('CD'), value: l, unit: 'cm' },
      { id: 'da', label: ANGLE('DA'), value: b, unit: 'cm' },
    ],
    mistakes: ({ l, b }) => [
      {
        answerId: 'cd',
        value: b,
        message: tx('CD, AB ke saamne hai (BC ke nahi). Opposite sides barabar.', 'CD is opposite AB (not BC). Opposite sides are equal.', 'CD, AB के सामने है (BC के नहीं)। सम्मुख भुजाएँ बराबर।'),
      },
      {
        answerId: 'da',
        value: l,
        message: tx('DA, BC ke saamne hai.', 'DA is opposite BC.', 'DA, BC के सामने है।'),
      },
    ],
  }),
  defineQuestion({
    id: 'diagonals-equal',
    level: 'medium',
    params: { l: 8, b: 6 },
    generate: (rng) => {
      const { l, b } = randTriple(rng);
      return { l, b };
    },
    prompt: ({ l, b }) =>
      tx(
        `Rectangle ABCD ke diagonals O par milte hain. AC = ${rectangleDiagonal(l, b)} cm hai. BD aur OA kitne hain?`,
        `The diagonals of rectangle ABCD meet at O. AC = ${rectangleDiagonal(l, b)} cm. How long are BD and OA?`,
        `आयत ABCD के विकर्ण O पर मिलते हैं। AC = ${rectangleDiagonal(l, b)} cm है। BD और OA कितने हैं?`,
      ),
    given: ({ l, b }) => [{ label: ANGLE('AC'), value: rectangleDiagonal(l, b), unit: 'cm' }],
    find: () => [ANGLE('BD'), ANGLE('OA')],
    answers: ({ l, b }) => [
      { id: 'bd', label: ANGLE('BD'), value: rectangleDiagonal(l, b), unit: 'cm' },
      { id: 'oa', label: ANGLE('OA'), value: rectangleDiagonal(l, b) / 2, unit: 'cm' },
    ],
    mistakes: ({ l, b }) => [
      {
        answerId: 'oa',
        value: rectangleDiagonal(l, b),
        message: tx('OA aadha diagonal hai: diagonals ek doosre ko beech se kaatte hain.', 'OA is half a diagonal: the diagonals cut each other in half.', 'OA आधा विकर्ण है: विकर्ण एक-दूसरे को बीच से काटते हैं।'),
      },
    ],
  }),
  defineQuestion({
    id: 'triangle-angles',
    level: 'hard',
    params: { l: 7, b: 4 },
    generate: (rng) => randRect(rng),
    prompt: ({ l, b }) =>
      tx(
        `${l} cm × ${b} cm ke rectangle ABCD mein diagonal AC kheencha. ∠ABC kitna hai, aur ∠BAC + ∠BCA kitna?`,
        `In the ${l} cm × ${b} cm rectangle ABCD, the diagonal AC is drawn. What is ∠ABC, and what is ∠BAC + ∠BCA?`,
        `${l} cm × ${b} cm के आयत ABCD में विकर्ण AC खींचा। ∠ABC कितना है, और ∠BAC + ∠BCA कितना?`,
      ),
    given: ({ l, b }) => [
      { label: tx('Length', 'Length', 'लंबाई'), value: l, unit: 'cm' },
      { label: tx('Breadth', 'Breadth', 'चौड़ाई'), value: b, unit: 'cm' },
    ],
    find: () => [ANGLE('∠ABC'), ANGLE('∠BAC + ∠BCA')],
    answers: () => [
      { id: 'abc', label: ANGLE('∠ABC'), value: 90, unit: 'deg' },
      { id: 'sum', label: ANGLE('∠BAC + ∠BCA'), value: 180 - 90, unit: 'deg' },
    ],
    mistakes: () => [
      {
        answerId: 'sum',
        value: 180,
        message: tx('180° teeno angles ka total hai; ∠B pehle hi 90° le chuka.', '180° is all three angles; ∠B already takes 90°.', '180° तीनों कोणों का योग है; ∠B पहले ही 90° ले चुका।'),
      },
    ],
  }),
  defineQuestion({
    id: 'perimeter-diagonal',
    level: 'challenge',
    params: { l: 8, b: 6 },
    generate: (rng) => {
      const { l, b } = randTriple(rng);
      return { l, b };
    },
    prompt: ({ l, b }) =>
      tx(
        `Ek rectangle ka perimeter ${rectanglePerimeter(l, b)} cm aur diagonal ${rectangleDiagonal(l, b)} cm hai. Uska area nikalo.`,
        `A rectangle has a perimeter of ${rectanglePerimeter(l, b)} cm and a diagonal of ${rectangleDiagonal(l, b)} cm. Find its area.`,
        `एक आयत का परिमाप ${rectanglePerimeter(l, b)} cm और विकर्ण ${rectangleDiagonal(l, b)} cm है। उसका क्षेत्रफल निकालो।`,
      ),
    given: ({ l, b }) => [
      { label: tx('Perimeter', 'Perimeter', 'परिमाप'), value: rectanglePerimeter(l, b), unit: 'cm' },
      { label: tx('Diagonal', 'Diagonal', 'विकर्ण'), value: rectangleDiagonal(l, b), unit: 'cm' },
    ],
    find: () => [tx('Area', 'Area', 'क्षेत्रफल')],
    answers: ({ l, b }) => {
      const s = rectanglePerimeter(l, b) / 2;
      const d = rectangleDiagonal(l, b);
      return [{ id: 'area', label: tx('Area', 'Area', 'क्षेत्रफल'), value: (s * s - d * d) / 2, unit: 'cm2' }];
    },
    mistakes: ({ l, b }) => [
      {
        answerId: 'area',
        value: (rectangleDiagonal(l, b) ** 2) / 2,
        message: tx('d² ÷ 2 sirf square ke liye hai. Yahan (l + b)² − d² = 2lb use karo.', 'd² ÷ 2 works only for a square. Here use (l + b)² − d² = 2lb.', 'd² ÷ 2 सिर्फ़ वर्ग के लिए है। यहाँ (l + b)² − d² = 2lb लगाओ।'),
      },
      {
        answerId: 'area',
        value: rectangleArea(l, b) * 2,
        message: tx('Ye 2lb hai. Area = lb, to 2 se baanto.', "That's 2lb. Area = lb, so divide by 2.", 'यह 2lb है। क्षेत्रफल = lb, तो 2 से भाग दो।'),
      },
    ],
  }),
];
