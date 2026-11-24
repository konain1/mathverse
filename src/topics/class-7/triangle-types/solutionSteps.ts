import { classifyByAngles, classifyBySides, isoscelesBaseAngle } from '@/lib/geometry/formulas';
import { fmt, lengthText } from '@/lib/format';
import { tx, type Params, type SolutionScript } from '@/topics/contract';
import { step } from '@/topics/shared/flat/steps';
import { sidesOf } from '@/topics/shared/tri/lattice';
import { ANGLE_OPTIONS, SIDE_OPTIONS, ANGLE_KINDS, SIDE_KINDS } from '@/topics/shared/tri/words';
import { ANGLE_SETS, kindFromAngles, latticeTri } from './questions';

const remember = tx(
  'Sides se: equilateral (3 barabar), isosceles (2 barabar), scalene (koi barabar nahi). Angles se: acute (sab < 90°), right (ek = 90°), obtuse (ek > 90°).',
  'By sides: equilateral (3 equal), isosceles (2 equal), scalene (none equal). By angles: acute (all < 90°), right (one = 90°), obtuse (one > 90°).',
  'भुजाओं से: समबाहु (3 बराबर), समद्विबाहु (2 बराबर), विषमबाहु (कोई बराबर नहीं)। कोणों से: न्यूनकोण (सब < 90°), समकोण (एक = 90°), अधिककोण (एक > 90°)।',
);
const mistake = tx(
  'Sirf ek cheez dekh ke dono type bata dena. Sides aur angles alag-alag dekho.',
  'Deciding both types from one feature. Check sides and angles separately.',
  'सिर्फ़ एक चीज़ देखकर दोनों प्रकार बता देना। भुजाएँ और कोण अलग-अलग देखो।',
);

export function solution(id: string, p: Params): SolutionScript {
  if (id === 'by-angles' || id === 'isosceles-apex') {
    const angles = id === 'by-angles' ? ANGLE_SETS[p.j!]! : [p.a!, isoscelesBaseAngle(p.a!), isoscelesBaseAngle(p.a!)];
    const kind = kindFromAngles(angles);
    const name = ANGLE_OPTIONS[ANGLE_KINDS.indexOf(kind)]!;
    const big = Math.max(...angles);
    return {
      steps: [
        ...(id === 'isosceles-apex'
          ? [
              step(
                'base',
                'sides',
                4.5,
                [
                  `Barabar sides ke saamne ke angles barabar: har base angle = (180° − ${p.a}°) ÷ 2 = ${angles[1]}°.`,
                  `Angles opposite equal sides are equal: each base angle = (180° − ${p.a}°) ÷ 2 = ${angles[1]}°.`,
                  `बराबर भुजाओं के सामने के कोण बराबर: हर आधार कोण = (180° − ${p.a}°) ÷ 2 = ${angles[1]}°।`,
                ],
                `\\dfrac{180^\\circ - ${p.a}^\\circ}{2} = ${angles[1]}^\\circ`,
              ),
            ]
          : []),
        step('angles', 'angles', 4.5, [
          `Angles: ${angles.join('°, ')}°. Sabse bada angle ${big}° hai.`,
          `The angles are ${angles.join('°, ')}°. The biggest is ${big}°.`,
          `कोण: ${angles.join('°, ')}°। सबसे बड़ा कोण ${big}° है।`,
        ]),
        step(
          'kind',
          'solved',
          4.5,
          [
            `${big}° ${big === 90 ? 'bilkul 90° hai' : big > 90 ? '90° se bada hai' : '90° se chhota hai'}, isliye ye ${name.hinglish} triangle hai.`,
            `${big}° ${big === 90 ? 'is exactly 90°' : big > 90 ? 'is more than 90°' : 'is less than 90°'}, so it is an ${name.en.toLowerCase()} triangle.`,
            `${big}° ${big === 90 ? 'ठीक 90° है' : big > 90 ? '90° से बड़ा है' : '90° से छोटा है'}, इसलिए यह ${name.hi} त्रिभुज है।`,
          ],
          undefined,
          [
            'Sirf sabse bada angle dekhna kaafi hai: triangle mein do angles kabhi 90° ya usse bade nahi ho sakte.',
            'Checking only the biggest angle is enough: a triangle can never have two angles of 90° or more.',
            'सिर्फ़ सबसे बड़ा कोण देखना काफ़ी है: त्रिभुज में दो कोण कभी 90° या उससे बड़े नहीं हो सकते।',
          ],
        ),
      ],
      remember,
      mistake,
    };
  }
  const tri = latticeTri(p.i!);
  const s = sidesOf(tri);
  const bs = classifyBySides(...s, 1e-6);
  const ba = classifyByAngles(...s, 1e-6);
  const sorted = [...s].sort((x, y) => x - y);
  const sq = sorted.map((x) => fmt(x * x));
  const steps = [
    step('intro', 'intro', 3, [
      'Ye triangle ABC hai. Pehle sides dekho, phir angles.',
      'Here is triangle ABC. Look at the sides first, then the angles.',
      'यह त्रिभुज ABC है। पहले भुजाएँ देखो, फिर कोण।',
    ]),
    step(
      'sides',
      'sides',
      5,
      [
        `Sides: ${s.map((x) => lengthText(x)).join(', ')}. Barabar sides par ek jaise tick lage. Isliye ye ${SIDE_OPTIONS[SIDE_KINDS.indexOf(bs)]!.hinglish} hai.`,
        `Sides: ${s.map((x) => lengthText(x)).join(', ')}. Equal sides get the same tick. So it is ${SIDE_OPTIONS[SIDE_KINDS.indexOf(bs)]!.en.toLowerCase()}.`,
        `भुजाएँ: ${s.map((x) => lengthText(x)).join(', ')}। बराबर भुजाओं पर एक जैसे निशान लगे। इसलिए यह ${SIDE_OPTIONS[SIDE_KINDS.indexOf(bs)]!.hi} है।`,
      ],
    ),
  ];
  if (id === 'both')
    steps.push(
      step(
        'angles',
        'solved',
        6,
        [
          `Sabse lambi side ka square ${sq[2]}, baaki do ka jod ${sq[0]} + ${sq[1]} = ${fmt(sorted[0]! ** 2 + sorted[1]! ** 2)}. ${ba === 'right' ? 'Barabar' : ba === 'acute' ? 'Jod bada' : 'Jod chhota'}, isliye ${ANGLE_OPTIONS[ANGLE_KINDS.indexOf(ba)]!.hinglish}.`,
          `The longest side squared is ${sq[2]}; the other two squared add to ${sq[0]} + ${sq[1]} = ${fmt(sorted[0]! ** 2 + sorted[1]! ** 2)}. ${ba === 'right' ? 'Equal' : ba === 'acute' ? 'The sum is bigger' : 'The sum is smaller'}, so ${ANGLE_OPTIONS[ANGLE_KINDS.indexOf(ba)]!.en.toLowerCase()}.`,
          `सबसे लंबी भुजा का वर्ग ${sq[2]}, बाकी दो का योग ${sq[0]} + ${sq[1]} = ${fmt(sorted[0]! ** 2 + sorted[1]! ** 2)}। ${ba === 'right' ? 'बराबर' : ba === 'acute' ? 'योग बड़ा' : 'योग छोटा'}, इसलिए ${ANGLE_OPTIONS[ANGLE_KINDS.indexOf(ba)]!.hi}।`,
        ],
        `${sq[0]} + ${sq[1]}\\ ${ba === 'right' ? '=' : ba === 'acute' ? '>' : '<'}\\ ${sq[2]}`,
        [
          'Pythagoras ka ulta: agar a² + b² = c² to sabse badi side ke saamne 90°; zyada ho to acute, kam ho to obtuse.',
          'Pythagoras in reverse: if a² + b² = c², the angle opposite the longest side is 90°; more means acute, less means obtuse.',
          'पाइथागोरस का उल्टा: अगर a² + b² = c² तो सबसे बड़ी भुजा के सामने 90°; ज़्यादा हो तो न्यूनकोण, कम हो तो अधिककोण।',
        ],
      ),
    );
  return { steps, remember, mistake };
}
