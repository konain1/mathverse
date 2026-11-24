import { classifyByAngles, hypotenuse, missingLeg } from '@/lib/geometry/formulas';
import { tx, type Params, type SolutionScript } from '@/topics/contract';
import { CM, step } from '@/topics/shared/flat/steps';
import { LATTICE, sidesOf } from '@/topics/shared/tri/lattice';
import { CHECK_TRIS, legsOf } from './questions';

const remember = tx(
  'Right triangle mein: hypotenuse² = baaki do sides ke squares ka jod (c² = a² + b²). Hypotenuse hamesha 90° ke saamne aur sabse lamba.',
  'In a right triangle: hypotenuse² = sum of the squares of the other two sides (c² = a² + b²). The hypotenuse is opposite the 90° and is the longest.',
  'समकोण त्रिभुज में: कर्ण² = बाकी दो भुजाओं के वर्गों का योग (c² = a² + b²)। कर्ण हमेशा 90° के सामने और सबसे लंबा।',
);
const mistake = tx('Sides ko seedha jod dena (a + b) ya square root lena bhool jaana.', 'Adding the sides directly (a + b), or forgetting the square root.', 'भुजाओं को सीधा जोड़ देना (a + b) या वर्गमूल लेना भूल जाना।');

function proofSteps(a: number, b: number) {
  const c2 = a * a + b * b;
  return [
    step(
      'squares',
      'squares',
      5,
      [
        `Teeno sides par squares banao: ${a}² = ${a * a}, ${b}² = ${b * b}, aur hypotenuse par ${c2}.`,
        `Build a square on each side: ${a}² = ${a * a}, ${b}² = ${b * b}, and ${c2} on the hypotenuse.`,
        `तीनों भुजाओं पर वर्ग बनाओ: ${a}² = ${a * a}, ${b}² = ${b * b}, और कर्ण पर ${c2}।`,
      ],
      `${a * a} + ${b * b} = ${c2}`,
    ),
    step(
      'proof1',
      'proof-1',
      5,
      [
        `Ek bada square lo (side ${a + b}). Usme triangle ki 4 copies rakho: beech mein c² bacha.`,
        `Take a big square (side ${a + b}). Put 4 copies of the triangle in it: c² is left in the middle.`,
        `एक बड़ा वर्ग लो (भुजा ${a + b})। उसमें त्रिभुज की 4 प्रतियाँ रखो: बीच में c² बचा।`,
      ],
      `(a+b)^2 - 4 \\times \\triangle = c^2`,
    ),
    step(
      'proof2',
      'proof-2',
      6,
      [
        'Wahi 4 triangles khiskao. Ab bachi jagah a² aur b² hai. Isliye c² = a² + b².',
        'Slide the same 4 triangles. Now the space left is a² and b². So c² = a² + b².',
        'वही 4 त्रिभुज खिसकाओ। अब बची जगह a² और b² है। इसलिए c² = a² + b²।',
      ],
      `c^2 = a^2 + b^2`,
      [
        'Wahi bada square, wahi 4 triangles: to bachi jagah bhi wahi.',
        'Same big square, same 4 triangles: so the space left is the same.',
        'वही बड़ा वर्ग, वही 4 त्रिभुज: तो बची जगह भी वही।',
      ],
    ),
  ];
}

export function solution(id: string, p: Params): SolutionScript {
  const legs = legsOf(id, p);
  const intro = step('intro', 'intro', 3, ['Ye right triangle ABC hai: B par 90°.', 'This is right triangle ABC: 90° at B.', 'यह समकोण त्रिभुज ABC है: B पर 90°।']);
  if (!legs) {
    const s = [...sidesOf(LATTICE[CHECK_TRIS[p.i!]!])].sort((x, y) => x - y) as [number, number, number];
    const right = classifyByAngles(...s) === 'right';
    return {
      steps: [
        step('intro', 'intro', 3, [`Sides: ${s.join(', ')} cm.`, `Sides: ${s.join(', ')} cm.`, `भुजाएँ: ${s.join(', ')} cm।`]),
        step(
          'squares',
          'squares',
          5,
          [
            `Chhoti do sides ke squares: ${s[0]}² + ${s[1]}² = ${s[0] ** 2 + s[1] ** 2}. Sabse lambi ka square: ${s[2]}² = ${s[2] ** 2}.`,
            `Squares of the two shorter sides: ${s[0]}² + ${s[1]}² = ${s[0] ** 2 + s[1] ** 2}. Longest side squared: ${s[2]}² = ${s[2] ** 2}.`,
            `छोटी दो भुजाओं के वर्ग: ${s[0]}² + ${s[1]}² = ${s[0] ** 2 + s[1] ** 2}। सबसे लंबी का वर्ग: ${s[2]}² = ${s[2] ** 2}।`,
          ],
          `${s[0] ** 2 + s[1] ** 2}\\ ${right ? '=' : '\\neq'}\\ ${s[2] ** 2}`,
        ),
        step(
          'verdict',
          'solved',
          4,
          right
            ? ['Barabar hain, isliye triangle right-angled hai (Pythagoras ka ulta).', 'They are equal, so the triangle is right-angled (the converse of Pythagoras).', 'बराबर हैं, इसलिए त्रिभुज समकोण है (पाइथागोरस का विलोम)।']
            : ['Barabar nahi, isliye ye right-angled nahi hai.', 'Not equal, so it is not right-angled.', 'बराबर नहीं, इसलिए यह समकोण नहीं है।'],
        ),
      ],
      remember,
      mistake: tx('Sabse lambi side ki jagah koi aur side ko hypotenuse maan lena.', 'Treating a side other than the longest as the hypotenuse.', 'सबसे लंबी भुजा की जगह किसी और भुजा को कर्ण मान लेना।'),
    };
  }
  const [a, b] = legs;
  const c = hypotenuse(a, b);
  const final =
    id === 'hypotenuse'
      ? step('solve', 'squares', 4, [`AC = √${a * a + b * b} = ${c} cm.`, `AC = √${a * a + b * b} = ${c} cm.`, `AC = √${a * a + b * b} = ${c} cm।`], `AC = \\sqrt{${a}^2 + ${b}^2} = ${c}${CM}`)
      : id === 'missing-leg'
        ? step('solve', 'squares', 4.5, [`AB² = ${c}² − ${a}² = ${c * c - a * a}, to AB = ${b} cm.`, `AB² = ${c}² − ${a}² = ${c * c - a * a}, so AB = ${b} cm.`, `AB² = ${c}² − ${a}² = ${c * c - a * a}, तो AB = ${b} cm।`], `AB = \\sqrt{${c}^2 - ${a}^2} = ${missingLeg(c, a)}${CM}`)
        : step(
            'solve',
            'squares',
            5,
            [
              `Seedhi hypotenuse hai (${c} cm), zameen ${a} cm. Oonchai = √(${c}² − ${a}²) = √${c * c - a * a} = ${b} cm.`,
              `The ladder is the hypotenuse (${c} cm), the ground ${a} cm. Height = √(${c}² − ${a}²) = √${c * c - a * a} = ${b} cm.`,
              `सीढ़ी कर्ण है (${c} cm), ज़मीन ${a} cm। ऊँचाई = √(${c}² − ${a}²) = √${c * c - a * a} = ${b} cm।`,
            ],
            `h = \\sqrt{${c}^2 - ${a}^2} = ${b}${CM}`,
          );
  return { steps: [intro, ...proofSteps(a, b), final], remember, mistake };
}
