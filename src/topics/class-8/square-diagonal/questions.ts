import { squareAreaFromDiagonal, squareDiagonal } from '@/lib/geometry/formulas';
import { randInt } from '@/lib/random';
import { defineQuestion, tx, type QuestionTemplate } from '@/topics/contract';

const SIDE = tx('Side (a)', 'Side (a)', 'भुजा (a)');
const DIAG = tx('Diagonal (d)', 'Diagonal (d)', 'विकर्ण (d)');
const AREA = tx('Area', 'Area', 'क्षेत्रफल');
/** a√2 answers are decimals: accept √2 ≈ 1.41 or 1.414 and 2-decimal rounding. */
const tolFor = (a: number) => 0.006 * a + 0.02;

export const questions: QuestionTemplate[] = [
  defineQuestion({
    id: 'diagonal-from-side',
    level: 'basic',
    params: { a: 4 },
    generate: (rng) => ({ a: randInt(rng, 2, 10) }),
    prompt: ({ a }) =>
      tx(
        `Ek square ki side ${a} cm hai. Uska diagonal kitna lamba hai? (√2 ≈ 1.414 lo, 2 decimal tak likho.)`,
        `A square has a side of ${a} cm. How long is its diagonal? (Use √2 ≈ 1.414, answer to 2 decimals.)`,
        `एक वर्ग की भुजा ${a} cm है। उसका विकर्ण कितना लंबा है? (√2 ≈ 1.414 लो, 2 दशमलव तक लिखो।)`,
      ),
    given: ({ a }) => [{ label: SIDE, value: a, unit: 'cm' }],
    find: () => [DIAG],
    answers: ({ a }) => [{ id: 'd', label: DIAG, value: squareDiagonal(a), unit: 'cm', tolerance: tolFor(a) }],
    mistakes: ({ a }) => [
      {
        answerId: 'd',
        value: 2 * a,
        message: tx(
          'Diagonal side ka double nahi hota. Right triangle banao: d² = a² + a².',
          "The diagonal isn't double the side. Use the right triangle: d² = a² + a².",
          'विकर्ण भुजा का दुगुना नहीं होता। समकोण त्रिभुज बनाओ: d² = a² + a²।',
        ),
      },
      {
        answerId: 'd',
        value: 2 * a * a,
        message: tx('Ye d² hai. Ab iska square root lo.', "That's d². Now take its square root.", 'यह d² है। अब इसका वर्गमूल लो।'),
      },
    ],
  }),
  defineQuestion({
    id: 'area-from-diagonal',
    level: 'medium',
    params: { k: 3 },
    generate: (rng) => ({ k: randInt(rng, 2, 5) }),
    prompt: ({ k }) =>
      tx(
        `Ek square ka diagonal ${2 * k} cm hai. Uska area nikalo.`,
        `The diagonal of a square is ${2 * k} cm. Find its area.`,
        `एक वर्ग का विकर्ण ${2 * k} cm है। उसका क्षेत्रफल निकालो।`,
      ),
    given: ({ k }) => [{ label: DIAG, value: 2 * k, unit: 'cm' }],
    find: () => [AREA],
    answers: ({ k }) => [{ id: 'area', label: AREA, value: squareAreaFromDiagonal(2 * k), unit: 'cm2' }],
    mistakes: ({ k }) => [
      {
        answerId: 'area',
        value: (2 * k) ** 2,
        message: tx(
          'Ye diagonal par bane bade square ka area hai. Hamara square uska aadha hai: d² ÷ 2.',
          "That's the area of the big square on the diagonal. Our square is half of it: d² ÷ 2.",
          'यह विकर्ण पर बने बड़े वर्ग का क्षेत्रफल है। हमारा वर्ग उसका आधा है: d² ÷ 2।',
        ),
      },
      {
        answerId: 'area',
        value: 2 * k * 2,
        message: tx('Diagonal ko 2 se guna nahi karte. Area = d² ÷ 2.', "Don't multiply the diagonal by 2. Area = d² ÷ 2.", 'विकर्ण को 2 से गुणा नहीं करते। क्षेत्रफल = d² ÷ 2।'),
      },
    ],
  }),
  defineQuestion({
    id: 'side-from-diagonal',
    level: 'hard',
    params: { a: 5 },
    generate: (rng) => ({ a: randInt(rng, 2, 10) }),
    prompt: ({ a }) =>
      tx(
        `Ek square ka diagonal ${a}√2 cm hai. Uski side kitni hai?`,
        `The diagonal of a square is ${a}√2 cm. How long is its side?`,
        `एक वर्ग का विकर्ण ${a}√2 cm है। उसकी भुजा कितनी है?`,
      ),
    given: ({ a }) => [{ label: tx(`Diagonal (= ${a}√2)`, `Diagonal (= ${a}√2)`, `विकर्ण (= ${a}√2)`), value: Math.round(squareDiagonal(a) * 100) / 100, unit: 'cm' }],
    find: () => [SIDE],
    answers: ({ a }) => [{ id: 'side', label: SIDE, value: squareDiagonal(a) / Math.SQRT2, unit: 'cm' }],
    mistakes: ({ a }) => [
      {
        answerId: 'side',
        value: Math.round(squareDiagonal(a) * 100) / 100,
        message: tx('Ye diagonal hi hai. Side = diagonal ÷ √2.', "That's the diagonal itself. Side = diagonal ÷ √2.", 'यह विकर्ण ही है। भुजा = विकर्ण ÷ √2।'),
      },
      {
        answerId: 'side',
        value: squareDiagonal(a) / 2,
        message: tx('÷ 2 nahi, ÷ √2. d = a√2, isliye a = d ÷ √2.', 'Not ÷ 2 but ÷ √2. d = a√2, so a = d ÷ √2.', '÷ 2 नहीं, ÷ √2। d = a√2, इसलिए a = d ÷ √2।'),
      },
    ],
  }),
  defineQuestion({
    id: 'diagonal-from-area',
    level: 'challenge',
    params: { k: 5 },
    generate: (rng) => ({ k: randInt(rng, 2, 5) }),
    prompt: ({ k }) =>
      tx(
        `Ek square ka area ${2 * k * k} cm² hai. Uska diagonal kitna hai?`,
        `The area of a square is ${2 * k * k} cm². How long is its diagonal?`,
        `एक वर्ग का क्षेत्रफल ${2 * k * k} cm² है। उसका विकर्ण कितना है?`,
      ),
    given: ({ k }) => [{ label: AREA, value: 2 * k * k, unit: 'cm2' }],
    find: () => [DIAG],
    answers: ({ k }) => [{ id: 'd', label: DIAG, value: Math.sqrt(2 * (2 * k * k)), unit: 'cm' }],
    mistakes: ({ k }) => [
      {
        answerId: 'd',
        value: Math.round(Math.sqrt(2 * k * k) * 100) / 100,
        message: tx(
          'Ye side hai (√area). Diagonal ke liye: d² = 2 × area.',
          "That's the side (√area). For the diagonal: d² = 2 × area.",
          'यह भुजा है (√क्षेत्रफल)। विकर्ण के लिए: d² = 2 × क्षेत्रफल।',
        ),
      },
      {
        answerId: 'd',
        value: 4 * k * k,
        message: tx('Ye d² hai. Ab square root lo.', "That's d². Now take the square root.", 'यह d² है। अब वर्गमूल लो।'),
      },
    ],
  }),
];
