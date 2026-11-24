import { intSqrt, primeFactors, smallestMultiplierForSquare, squareArea } from '@/lib/geometry/formulas';
import { pick, randInt } from '@/lib/random';
import { defineQuestion, tx, type QuestionTemplate } from '@/topics/contract';

const SQUARES = tx('Unit squares', 'Unit squares', 'इकाई वर्ग');
const SIDE_SQ = tx('Har side par squares', 'Squares along each side', 'हर भुजा पर वर्ग');

/** (k, m) with N = k·m² and the finished square (side k·m) fitting the 10 cm grid. */
const MULTIPLIER_CASES: readonly [number, number][] = [
  [2, 1], [2, 2], [2, 3], [2, 4], [2, 5], [3, 1], [3, 2], [3, 3], [5, 1], [5, 2], [7, 1],
];

export const questions: QuestionTemplate[] = [
  defineQuestion({
    id: 'square-of-n',
    level: 'basic',
    params: { n: 5 },
    generate: (rng) => ({ n: randInt(rng, 2, 10) }),
    prompt: ({ n }) =>
      tx(
        `${n} ka square kitna hai? ${n} × ${n} ka grid bana ke unit squares gino.`,
        `What is the square of ${n}? Build a ${n} × ${n} grid and count the unit squares.`,
        `${n} का वर्ग कितना है? ${n} × ${n} की जाली बनाकर इकाई वर्ग गिनो।`,
      ),
    given: ({ n }) => [{ label: tx('Number', 'Number', 'संख्या'), value: n, unit: 'none' }],
    find: () => [SQUARES],
    answers: ({ n }) => [{ id: 'sq', label: tx(`${n}²`, `${n}²`, `${n}²`), value: squareArea(n), unit: 'squares' }],
    mistakes: ({ n }) => [
      {
        answerId: 'sq',
        value: 2 * n,
        message: tx(`${n}² matlab ${n} × ${n}, ${n} × 2 nahi.`, `${n}² means ${n} × ${n}, not ${n} × 2.`, `${n}² यानी ${n} × ${n}, ${n} × 2 नहीं।`),
      },
      {
        answerId: 'sq',
        value: 4 * n,
        message: tx('Ye bahar ka kinara (perimeter) hai. Andar ke saare squares gino.', "That's the outside edge (perimeter). Count all the squares inside.", 'यह बाहरी किनारा (परिमाप) है। अंदर के सारे वर्ग गिनो।'),
      },
    ],
  }),
  defineQuestion({
    id: 'root-of-square',
    level: 'medium',
    params: { n: 7 },
    generate: (rng) => ({ n: randInt(rng, 2, 10) }),
    prompt: ({ n }) =>
      tx(
        `${squareArea(n)} unit squares se ek poora square grid banana hai. Har side par kitne squares honge? (√${squareArea(n)} kitna hai?)`,
        `${squareArea(n)} unit squares are to be arranged into a full square grid. How many squares along each side? (What is √${squareArea(n)}?)`,
        `${squareArea(n)} इकाई वर्गों से एक पूरी वर्ग जाली बनानी है। हर भुजा पर कितने वर्ग होंगे? (√${squareArea(n)} कितना है?)`,
      ),
    given: ({ n }) => [{ label: SQUARES, value: squareArea(n), unit: 'squares' }],
    find: () => [SIDE_SQ],
    answers: ({ n }) => [{ id: 'root', label: SIDE_SQ, value: intSqrt(squareArea(n)), unit: 'squares' }],
    mistakes: ({ n }) => [
      {
        answerId: 'root',
        value: squareArea(n) / 2,
        message: tx('Square root ka matlab ÷ 2 nahi. Wo number dhoondo jo khud se guna hokar ye de.', 'A square root is not ÷ 2. Find the number that, times itself, gives this.', 'वर्गमूल का मतलब ÷ 2 नहीं। वह संख्या ढूँढो जो ख़ुद से गुणा होकर यह दे।'),
      },
    ],
  }),
  defineQuestion({
    id: 'not-perfect',
    level: 'hard',
    params: { n: 5, e: 5 },
    generate: (rng) => {
      const n = randInt(rng, 3, 8);
      return { n, e: randInt(rng, 1, 2 * n) };
    },
    prompt: ({ n, e }) =>
      tx(
        `Tumhare paas ${n * n + e} unit squares hain. Inse sabse bada poora square grid kitne ka banega, aur kitne squares bachenge?`,
        `You have ${n * n + e} unit squares. What is the biggest full square grid you can make, and how many squares are left over?`,
        `तुम्हारे पास ${n * n + e} इकाई वर्ग हैं। इनसे सबसे बड़ी पूरी वर्ग जाली कितने की बनेगी, और कितने वर्ग बचेंगे?`,
      ),
    given: ({ n, e }) => [{ label: SQUARES, value: n * n + e, unit: 'squares' }],
    find: () => [SIDE_SQ, tx('Bache hue squares', 'Squares left over', 'बचे हुए वर्ग')],
    answers: ({ n, e }) => [
      { id: 'side', label: SIDE_SQ, value: Math.floor(Math.sqrt(n * n + e)), unit: 'squares' },
      { id: 'left', label: tx('Bache hue', 'Left over', 'बचे हुए'), value: n * n + e - squareArea(Math.floor(Math.sqrt(n * n + e))), unit: 'squares' },
    ],
    mistakes: ({ n, e }) => [
      {
        answerId: 'side',
        value: n + 1,
        message: tx(
          `${n + 1} × ${n + 1} = ${(n + 1) ** 2} squares chahiye, jo ${n * n + e} se zyada hain.`,
          `${n + 1} × ${n + 1} needs ${(n + 1) ** 2} squares, more than ${n * n + e}.`,
          `${n + 1} × ${n + 1} के लिए ${(n + 1) ** 2} वर्ग चाहिए, जो ${n * n + e} से ज़्यादा हैं।`,
        ),
      },
    ],
  }),
  defineQuestion({
    id: 'smallest-multiplier',
    level: 'challenge',
    params: { k: 2, m: 3 },
    generate: (rng) => {
      const [k, m] = pick(rng, MULTIPLIER_CASES);
      return { k, m };
    },
    prompt: ({ k, m }) =>
      tx(
        `${k * m * m} ko sabse chhote kis number se guna karein ki wo perfect square ban jaaye? Aur wo square kis number ka square hoga?`,
        `By what smallest number must ${k * m * m} be multiplied to make a perfect square? And that square is the square of which number?`,
        `${k * m * m} को सबसे छोटी किस संख्या से गुणा करें कि वह पूर्ण वर्ग बन जाए? और वह वर्ग किस संख्या का वर्ग होगा?`,
      ),
    given: ({ k, m }) => [{ label: tx('Number', 'Number', 'संख्या'), value: k * m * m, unit: 'none' }],
    find: () => [tx('Sabse chhota guna', 'Smallest multiplier', 'सबसे छोटा गुणक'), tx('Square root', 'Square root', 'वर्गमूल')],
    answers: ({ k, m }) => {
      const N = k * m * m;
      const mult = smallestMultiplierForSquare(N);
      return [
        { id: 'mult', label: tx('Guna karo', 'Multiply by', 'गुणा करो'), value: mult, unit: 'none' },
        { id: 'root', label: tx('√(naya number)', '√(new number)', '√(नई संख्या)'), value: intSqrt(N * mult), unit: 'none' },
      ];
    },
    mistakes: ({ k, m }) => {
      const N = k * m * m;
      return [
        {
          answerId: 'mult',
          value: N,
          message: tx(
            `Number ko khud se guna karna hamesha square deta hai, par wo sabse chhota nahi. Prime factors ke jode banao: ${primeFactors(N).join(' × ')}.`,
            `Multiplying the number by itself always works, but it isn't the smallest. Pair up the prime factors: ${primeFactors(N).join(' × ')}.`,
            `संख्या को ख़ुद से गुणा करना हमेशा वर्ग देता है, पर वह सबसे छोटा नहीं। अभाज्य गुणनखंडों के जोड़े बनाओ: ${primeFactors(N).join(' × ')}।`,
          ),
        },
      ];
    },
  }),
];
