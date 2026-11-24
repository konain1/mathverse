/**
 * Solution-step builders shared by the square and rectangle topics.
 * Every number is computed here from l and b with src/lib/geometry.
 */
import { surd, fmt } from '@/lib/format';
import { rectangleArea, rectanglePerimeter, squareArea, squarePerimeter } from '@/lib/geometry/formulas';
import { tx, type SolutionStep } from '@/topics/contract';
import type { LocalizedText } from '@/topics/types';

export const CM = '\\,\\text{cm}';
export const CM2 = '\\,\\text{cm}^2';

type Tri = [string, string, string];
export function step(id: string, cue: string, duration: number, n: Tri, formula?: string, why?: Tri): SolutionStep {
  return { id, cue, duration, narration: tx(...n), ...(formula && { formula }), ...(why && { why: tx(...why) }) };
}
export const L = (hinglish: string, en: string, hi: string): LocalizedText => tx(hinglish, en, hi);

export const intro = (l: number, b: number) =>
  l === b
    ? step('intro', 'intro', 3.5, [
        `Ye ${l} cm side wala square ABCD hai.`,
        `This is the square ABCD with side ${l} cm.`,
        `यह ${l} cm भुजा वाला वर्ग ABCD है।`,
      ])
    : step('intro', 'intro', 3.5, [
        `Ye ${l} cm × ${b} cm ka rectangle ABCD hai: length ${l} cm, breadth ${b} cm.`,
        `This is the ${l} cm × ${b} cm rectangle ABCD: length ${l} cm, breadth ${b} cm.`,
        `यह ${l} cm × ${b} cm का आयत ABCD है: लंबाई ${l} cm, चौड़ाई ${b} cm।`,
      ]);

export const equalSides = (a: number) =>
  step(
    'sides',
    'sides',
    4,
    [
      `Square ki chaaron sides barabar hain: har side ${a} cm.`,
      `All four sides of a square are equal: each is ${a} cm.`,
      `वर्ग की चारों भुजाएँ बराबर हैं: हर भुजा ${a} cm।`,
    ],
    `AB = BC = CD = DA = ${a}${CM}`,
    [
      'Square ki pehchaan yahi hai: chaaron sides barabar aur chaaron angles 90°.',
      'That is what makes a square: four equal sides and four 90° angles.',
      'वर्ग की पहचान यही है: चारों भुजाएँ बराबर और चारों कोण 90°।',
    ],
  );

export const oppositeSides = (l: number, b: number) =>
  step(
    'opposite',
    'opposite',
    4.5,
    [
      `Rectangle mein aamne-saamne ki sides barabar hain: AB = CD = ${l} cm aur BC = DA = ${b} cm.`,
      `In a rectangle, opposite sides are equal: AB = CD = ${l} cm and BC = DA = ${b} cm.`,
      `आयत में आमने-सामने की भुजाएँ बराबर हैं: AB = CD = ${l} cm और BC = DA = ${b} cm।`,
    ],
    `AB = CD = ${l}${CM},\\quad BC = DA = ${b}${CM}`,
    [
      'Saamne wali sides barabar hoti hain. Ek jodi par 1 nishaan, doosri par 2.',
      'Opposite sides are equal. One pair gets 1 tick, the other gets 2.',
      'सामने वाली भुजाएँ बराबर होती हैं। एक जोड़ी पर 1 निशान, दूसरी पर 2।',
    ],
  );

export const rightAngles = () =>
  step(
    'angles',
    'angles',
    4,
    [
      'Chaaron corners par 90° ka angle hai. Total: 4 × 90° = 360°.',
      'Every corner is a 90° angle. Total: 4 × 90° = 360°.',
      'चारों कोनों पर 90° का कोण है। कुल: 4 × 90° = 360°।',
    ],
    `\\angle A = \\angle B = \\angle C = \\angle D = 90^\\circ`,
    [
      'Chaar angles milkar 360° hote hain. Chaaron barabar, to har ek 90°.',
      'Four angles always make 360°. All four are equal, so each is 90°.',
      'चार कोण मिलकर 360° होते हैं। चारों बराबर, तो हर एक 90°।',
    ],
  );

export function perimeterWalk(l: number, b: number): SolutionStep {
  const why: Tri = [
    'Perimeter = kinare ki poori lambai. Isliye unit cm hai, cm² nahi.',
    'Perimeter = the length all the way round. So it is in cm, not cm².',
    'परिमाप = किनारे की पूरी लंबाई। इसलिए इकाई cm है, cm² नहीं।',
  ];
  if (l === b) {
    const P = squarePerimeter(l);
    return step(
      'perimeter',
      'perimeter',
      5,
      [
        `Perimeter matlab chaaron taraf ek poora chakkar: ${l} + ${l} + ${l} + ${l} = ${P} cm.`,
        `Perimeter means one full trip around: ${l} + ${l} + ${l} + ${l} = ${P} cm.`,
        `परिमाप यानी चारों तरफ़ एक पूरा चक्कर: ${l} + ${l} + ${l} + ${l} = ${P} cm।`,
      ],
      `P = 4a = 4 \\times ${l} = ${P}${CM}`,
      why,
    );
  }
  const P = rectanglePerimeter(l, b);
  return step(
    'perimeter',
    'perimeter',
    5,
    [
      `Ek poora chakkar: ${l} + ${b} + ${l} + ${b} = ${P} cm.`,
      `One full trip around: ${l} + ${b} + ${l} + ${b} = ${P} cm.`,
      `एक पूरा चक्कर: ${l} + ${b} + ${l} + ${b} = ${P} cm।`,
    ],
    `P = 2(l + b) = 2(${l} + ${b}) = ${P}${CM}`,
    why,
  );
}

export const tileRow = (l: number) =>
  step(
    'row',
    'tile-row',
    3.5,
    [
      `Area naapne ke liye 1 cm × 1 cm ke unit squares bichhao. Pehli row mein ${l} squares aaye.`,
      `To measure area, lay 1 cm × 1 cm unit squares. The first row takes ${l} squares.`,
      `क्षेत्रफल नापने के लिए 1 cm × 1 cm के इकाई वर्ग बिछाओ। पहली पंक्ति में ${l} वर्ग आए।`,
    ],
    `\\text{row} = ${l}`,
    [
      'Har unit square = 1 cm². Jitne squares lage, utna area.',
      'Each unit square = 1 cm². However many squares it takes is the area.',
      'हर इकाई वर्ग = 1 cm²। जितने वर्ग लगे, उतना क्षेत्रफल।',
    ],
  );

export function tileAll(l: number, b: number): SolutionStep {
  const totals = Array.from({ length: b }, (_, i) => l * (i + 1));
  const list = totals.length > 5 ? `${totals.slice(0, 3).join(', ')}, …, ${totals[totals.length - 1]}` : totals.join(', ');
  return step(
    'rows',
    'tile-all',
    5,
    [
      `Aisi ${b} rows: ${list} squares.`,
      `${b} rows like that: ${list} squares.`,
      `ऐसी ${b} पंक्तियाँ: ${list} वर्ग।`,
    ],
    `${l} \\times ${b} = ${l * b}`,
  );
}

export function areaFormula(l: number, b: number): SolutionStep {
  if (l === b) {
    const A = squareArea(l);
    return step(
      'area',
      'area',
      4,
      [
        `Isliye area = side × side = ${l} × ${l} = ${A} cm².`,
        `So the area = side × side = ${l} × ${l} = ${A} cm².`,
        `इसलिए क्षेत्रफल = भुजा × भुजा = ${l} × ${l} = ${A} cm²।`,
      ],
      `A = a^2 = ${l}^2 = ${A}${CM2}`,
      [
        'Rows ki ginti × har row ke squares. Square mein dono a hain, isliye a².',
        'Number of rows × squares in each row. In a square both are a, so it is a².',
        'पंक्तियों की संख्या × हर पंक्ति के वर्ग। वर्ग में दोनों a हैं, इसलिए a²।',
      ],
    );
  }
  const A = rectangleArea(l, b);
  return step(
    'area',
    'area',
    4,
    [
      `Isliye area = length × breadth = ${l} × ${b} = ${A} cm².`,
      `So the area = length × breadth = ${l} × ${b} = ${A} cm².`,
      `इसलिए क्षेत्रफल = लंबाई × चौड़ाई = ${l} × ${b} = ${A} cm²।`,
    ],
    `A = l \\times b = ${l} \\times ${b} = ${A}${CM2}`,
    [
      'Breadth jitni rows, aur har row mein length jitne squares: l × b.',
      'As many rows as the breadth, each with as many squares as the length: l × b.',
      'चौड़ाई जितनी पंक्तियाँ, और हर पंक्ति में लंबाई जितने वर्ग: l × b।',
    ],
  );
}

export const drawDiagonal = () =>
  step('diagonal', 'diagonal', 3.5, [
    'Ab corner A se bilkul saamne wale corner C tak diagonal AC kheencho.',
    'Now draw the diagonal AC from corner A to the opposite corner C.',
    'अब कोने A से ठीक सामने वाले कोने C तक विकर्ण AC खींचो।',
  ]);

export const rightTriangle = (l: number, b: number) =>
  step(
    'triangle',
    'right-triangle',
    4,
    [
      `Diagonal se right triangle bana: AB = ${l}, BC = ${b}, aur B par 90°.`,
      `The diagonal makes a right triangle: AB = ${l}, BC = ${b}, and B is 90°.`,
      `विकर्ण से समकोण त्रिभुज बना: AB = ${l}, BC = ${b}, और B पर 90°।`,
    ],
    `\\angle B = 90^\\circ`,
  );

/** d² = l² + b², then d = √(…) in simplest surd form and as a decimal. */
export function pythagStep(l: number, b: number): SolutionStep {
  const s = l * l + b * b;
  const r = surd(s);
  const d = Math.sqrt(s);
  const approx = r.exact ? '' : ` \\approx ${fmt(d)}`;
  return step(
    'pythagoras',
    'pythag',
    6,
    [
      `Pythagoras: ${l}² + ${b}² = ${s}. Isliye AC = √${s} = ${r.text}${r.exact ? '' : ` ≈ ${fmt(d)}`} cm.`,
      `Pythagoras: ${l}² + ${b}² = ${s}. So AC = √${s} = ${r.text}${r.exact ? '' : ` ≈ ${fmt(d)}`} cm.`,
      `पाइथागोरस: ${l}² + ${b}² = ${s}। इसलिए AC = √${s} = ${r.text}${r.exact ? '' : ` ≈ ${fmt(d)}`} cm।`,
    ],
    `\\begin{aligned} AC^2 &= ${l}^2 + ${b}^2 = ${l * l} + ${b * b} = ${s} \\\\ AC &= \\sqrt{${s}} = ${r.tex}${approx}${CM} \\end{aligned}`,
    [
      'Do chhoti sides ke squares ka jod = sabse lambi side ka square.',
      'The two short sides squared and added = the longest side squared.',
      'दो छोटी भुजाओं के वर्गों का योग = सबसे लंबी भुजा का वर्ग।',
    ],
  );
}

export const splitStep = () =>
  step(
    'split',
    'split',
    4,
    [
      'Diagonal ne rectangle ko do triangles mein baant diya: ABC aur CDA.',
      'The diagonal splits the rectangle into two triangles: ABC and CDA.',
      'विकर्ण ने आयत को दो त्रिभुजों में बाँट दिया: ABC और CDA।',
    ],
    `\\triangle ABC,\\ \\triangle CDA`,
  );

export const flipStep = (kindHl = 'rectangle') =>
  step(
    'flip',
    'flip',
    5.5,
    [
      `Ek triangle ko utha ke ghumao. Wo doosre par poora fit ho jaata hai: dono congruent hain.`,
      `Lift one triangle and turn it. It fits exactly on the other: they are congruent.`,
      `एक त्रिभुज को उठाकर घुमाओ। वह दूसरे पर पूरा फ़िट हो जाता है: दोनों सर्वांगसम हैं।`,
    ],
    `\\triangle ABC \\cong \\triangle CDA\\ (\\text{SSS})`,
    [
      `Teeno sides barabar hain (SSS). Isliye har triangle ${kindHl} ka theek aadha hai.`,
      `All three sides match (SSS). So each triangle is exactly half the ${kindHl}.`,
      'तीनों भुजाएँ बराबर हैं (SSS)। इसलिए हर त्रिभुज आकृति का ठीक आधा है।',
    ],
  );

export const bothDiagonals = (square: boolean) =>
  step(
    'diagonals',
    'diagonals',
    4.5,
    square
      ? [
          'Dono diagonals barabar hain. Wo beech (O) mein 90° par milte hain.',
          'Both diagonals are equal. They meet in the middle (O) at 90°.',
          'दोनों विकर्ण बराबर हैं। वे बीच (O) में 90° पर मिलते हैं।',
        ]
      : [
          'Dono diagonals barabar hain. Wo beech (O) mein ek doosre ko aadha karte hain.',
          'Both diagonals are equal. They cut each other in half at O.',
          'दोनों विकर्ण बराबर हैं। वे O पर एक-दूसरे को आधा करते हैं।',
        ],
    square ? `AC = BD,\\quad OA = OB = OC = OD,\\quad \\angle AOB = 90^\\circ` : `AC = BD,\\quad OA = OB = OC = OD`,
  );
