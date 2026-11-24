import { intSqrt, primeFactors, smallestMultiplierForSquare, squareArea } from '@/lib/geometry/formulas';
import { tx, type Params, type SolutionScript } from '@/topics/contract';
import { step, tileAll, tileRow } from '@/topics/shared/flat/steps';

const remember = tx(
  'n² = n × n squares ka grid. √N = us grid ki ek side. Perfect square ke prime factors poore jodon mein bant jaate hain.',
  'n² = a grid of n × n squares. √N = one side of that grid. A perfect square’s prime factors pair up completely.',
  'n² = n × n वर्गों की जाली। √N = उस जाली की एक भुजा। पूर्ण वर्ग के अभाज्य गुणनखंड पूरे जोड़ों में बँट जाते हैं।',
);

/** "2 × 2 × 3 × 3" → pairs "(2 × 2) × (3 × 3)", unpaired listed separately. */
function pairUp(n: number) {
  const f = primeFactors(n);
  const pairs: number[] = [];
  const single: number[] = [];
  const counts = new Map<number, number>();
  for (const p of f) counts.set(p, (counts.get(p) ?? 0) + 1);
  for (const [p, c] of counts) {
    for (let i = 0; i < Math.floor(c / 2); i++) pairs.push(p);
    if (c % 2) single.push(p);
  }
  const text = [...pairs.map((p) => `(${p} × ${p})`), ...single.map(String)].join(' × ');
  return { text, pairs, single };
}

export function solution(id: string, p: Params): SolutionScript {
  switch (id) {
    case 'root-of-square': {
      const n = p.n!;
      const N = squareArea(n);
      return {
        steps: [
          step('grid', 'grid', 4.5, [
            `${N} squares ko ek poore square mein jamaya.`,
            `${N} squares arranged into one full square.`,
            `${N} वर्गों को एक पूरे वर्ग में जमाया।`,
          ], `N = ${N}`),
          step(
            'side',
            'sides',
            4.5,
            [
              `Har side par ${n} squares hain, kyunki ${n} × ${n} = ${N}. Isliye √${N} = ${n}.`,
              `Each side has ${n} squares, because ${n} × ${n} = ${N}. So √${N} = ${n}.`,
              `हर भुजा पर ${n} वर्ग हैं, क्योंकि ${n} × ${n} = ${N}। इसलिए √${N} = ${n}।`,
            ],
            `\\sqrt{${N}} = ${intSqrt(N)}`,
            [
              'Square root, square ka ulta hai: area se side wapas.',
              'A square root undoes squaring: from the area back to the side.',
              'वर्गमूल, वर्ग का उल्टा है: क्षेत्रफल से भुजा वापस।',
            ],
          ),
        ],
        remember,
        mistake: tx('√N ko N ÷ 2 samajhna.', 'Thinking √N means N ÷ 2.', '√N को N ÷ 2 समझना।'),
      };
    }
    case 'not-perfect': {
      const n = p.n!;
      const e = p.e!;
      const N = n * n + e;
      return {
        steps: [
          step('grid', 'grid', 4, [
            `${n} × ${n} = ${n * n} squares se poora square bana.`,
            `${n} × ${n} = ${n * n} squares make a full square.`,
            `${n} × ${n} = ${n * n} वर्गों से पूरा वर्ग बना।`,
          ], `${n}^2 = ${n * n} \\le ${N}`),
          step(
            'extra',
            'grid-extra',
            4.5,
            [
              `${N} − ${n * n} = ${e} squares bach gaye. Agla square ${n + 1} × ${n + 1} = ${(n + 1) ** 2} chahiye, jo ${N} se zyada hai.`,
              `${N} − ${n * n} = ${e} squares are left over. The next square, ${n + 1} × ${n + 1} = ${(n + 1) ** 2}, needs more than ${N}.`,
              `${N} − ${n * n} = ${e} वर्ग बच गए। अगला वर्ग ${n + 1} × ${n + 1} = ${(n + 1) ** 2} चाहिए, जो ${N} से ज़्यादा है।`,
            ],
            `${n}^2 = ${n * n} < ${N} < ${(n + 1) ** 2} = ${n + 1}^2`,
            [
              `${N} perfect square nahi hai, kyunki ye do lagataar squares ${n * n} aur ${(n + 1) ** 2} ke beech mein hai.`,
              `${N} is not a perfect square: it lies between the consecutive squares ${n * n} and ${(n + 1) ** 2}.`,
              `${N} पूर्ण वर्ग नहीं है, क्योंकि यह दो लगातार वर्गों ${n * n} और ${(n + 1) ** 2} के बीच है।`,
            ],
          ),
        ],
        remember,
        mistake: tx('Bade square (n + 1)² ko chun lena, jiske liye squares kam pad jaate hain.', 'Choosing the bigger square (n + 1)², which needs more squares than you have.', 'बड़ा वर्ग (n + 1)² चुन लेना, जिसके लिए वर्ग कम पड़ जाते हैं।'),
      };
    }
    case 'smallest-multiplier': {
      const N = p.k! * p.m! * p.m!;
      const mult = smallestMultiplierForSquare(N);
      const root = intSqrt(N * mult);
      const { text } = pairUp(N);
      return {
        steps: [
          step(
            'factors',
            'intro',
            5,
            [
              `Prime factors ke jode banao: ${N} = ${text}. ${mult} akela bacha hai.`,
              `Pair up the prime factors: ${N} = ${text}. ${mult} is left without a partner.`,
              `अभाज्य गुणनखंडों के जोड़े बनाओ: ${N} = ${text}। ${mult} अकेला बचा है।`,
            ],
            `${N} = ${text.replace(/×/g, '\\times')}`,
            [
              'Perfect square mein har prime factor jode mein aata hai (har jode se root mein ek number jaata hai).',
              'In a perfect square every prime factor comes in pairs (each pair gives one number to the root).',
              'पूर्ण वर्ग में हर अभाज्य गुणनखंड जोड़े में आता है (हर जोड़े से मूल में एक संख्या जाती है)।',
            ],
          ),
          step(
            'multiply',
            'grid',
            5,
            [
              `${mult} ka jodidaar laao: ${N} × ${mult} = ${N * mult} = ${root} × ${root}. Ab ye ${root} × ${root} ka poora grid hai.`,
              `Give ${mult} a partner: ${N} × ${mult} = ${N * mult} = ${root} × ${root}. Now it is a full ${root} × ${root} grid.`,
              `${mult} का जोड़ीदार लाओ: ${N} × ${mult} = ${N * mult} = ${root} × ${root}। अब यह ${root} × ${root} की पूरी जाली है।`,
            ],
            `${N} \\times ${mult} = ${N * mult} = ${root}^2`,
          ),
        ],
        remember,
        mistake: tx('Number ko khud se guna kar dena. Wo square to banata hai, par sabse chhota multiplier nahi.', 'Multiplying the number by itself. That makes a square, but not with the smallest multiplier.', 'संख्या को ख़ुद से गुणा कर देना। उससे वर्ग बनता है, पर सबसे छोटे गुणक से नहीं।'),
      };
    }
    default: {
      const n = p.n!;
      const N = squareArea(n);
      return {
        steps: [
          tileRow(n),
          tileAll(n, n),
          step(
            'square',
            'grid',
            4,
            [
              `Kul ${N} squares. Isliye ${n}² = ${n} × ${n} = ${N}. Naam bhi isi se aaya: "square" number!`,
              `${N} squares in all. So ${n}² = ${n} × ${n} = ${N}. That's where the name comes from: a "square" number!`,
              `कुल ${N} वर्ग। इसलिए ${n}² = ${n} × ${n} = ${N}। नाम भी इसी से आया: "वर्ग" संख्या!`,
            ],
            `${n}^2 = ${n} \\times ${n} = ${N}`,
          ),
        ],
        remember,
        mistake: tx(`${n}² ko ${n} × 2 samajh lena.`, `Reading ${n}² as ${n} × 2.`, `${n}² को ${n} × 2 समझ लेना।`),
      };
    }
  }
}
