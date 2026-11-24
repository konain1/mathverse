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
      `Square ki chaaron sides barabar hain: AB = BC = CD = DA = ${a} cm. Barabar sides par ek jaisa nishaan (tick) lagate hain.`,
      `All four sides of a square are equal: AB = BC = CD = DA = ${a} cm. Equal sides get the same tick mark.`,
      `वर्ग की चारों भुजाएँ बराबर हैं: AB = BC = CD = DA = ${a} cm। बराबर भुजाओं पर एक जैसा निशान लगाते हैं।`,
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
      'Rectangle ki opposite sides parallel aur barabar hoti hain. Isliye ek jodi par ek tick, doosri par do.',
      "A rectangle's opposite sides are parallel and equal. So one pair gets one tick, the other pair two.",
      'आयत की सम्मुख भुजाएँ समांतर और बराबर होती हैं। इसलिए एक जोड़ी पर एक निशान, दूसरी पर दो।',
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
      'Kisi bhi quadrilateral ke chaaron angles ka sum 360° hota hai. Yahan chaaron barabar hain, to har ek 90°.',
      'The four angles of any quadrilateral add up to 360°. Here all four are equal, so each is 90°.',
      'किसी भी चतुर्भुज के चारों कोणों का योग 360° होता है। यहाँ चारों बराबर हैं, तो हर एक 90°।',
    ],
  );

export function perimeterWalk(l: number, b: number): SolutionStep {
  const why: Tri = [
    'Fence, lace ya border jitni lambi chahiye, wahi perimeter hai. Ye ek length hai, isliye unit cm hai (cm² nahi).',
    'The length of fence, lace or border you need is the perimeter. It is a length, so the unit is cm (not cm²).',
    'बाड़, लेस या किनारी जितनी लंबी चाहिए, वही परिमाप है। यह एक लंबाई है, इसलिए इकाई cm है (cm² नहीं)।',
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
      'Har unit square ka area 1 cm² hai. Jitne squares se figure poori dhak jaaye, utna hi area.',
      'Each unit square has an area of 1 cm². However many squares cover the figure exactly, that is the area.',
      'हर इकाई वर्ग का क्षेत्रफल 1 cm² है। जितने वर्गों से आकृति पूरी ढक जाए, उतना ही क्षेत्रफल।',
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
      `Diagonal ne right triangle ABC banaya: B par 90°, legs AB = ${l} cm aur BC = ${b} cm. AC iska hypotenuse hai.`,
      `The diagonal makes a right triangle ABC: 90° at B, legs AB = ${l} cm and BC = ${b} cm. AC is its hypotenuse.`,
      `विकर्ण ने समकोण त्रिभुज ABC बनाया: B पर 90°, भुजाएँ AB = ${l} cm और BC = ${b} cm। AC इसका कर्ण है।`,
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
      `Pythagoras: dono legs par bane squares milakar hypotenuse wale square ke barabar: ${l}² + ${b}² = ${l * l} + ${b * b} = ${s}. To AC = √${s} = ${r.text}${r.exact ? '' : ` ≈ ${fmt(d)}`} cm.`,
      `Pythagoras: the squares on the two legs together equal the square on the hypotenuse: ${l}² + ${b}² = ${l * l} + ${b * b} = ${s}. So AC = √${s} = ${r.text}${r.exact ? '' : ` ≈ ${fmt(d)}`} cm.`,
      `पाइथागोरस: दोनों भुजाओं पर बने वर्ग मिलकर कर्ण वाले वर्ग के बराबर: ${l}² + ${b}² = ${l * l} + ${b * b} = ${s}। तो AC = √${s} = ${r.text}${r.exact ? '' : ` ≈ ${fmt(d)}`} cm।`,
    ],
    `\\begin{aligned} AC^2 &= ${l}^2 + ${b}^2 = ${l * l} + ${b * b} = ${s} \\\\ AC &= \\sqrt{${s}} = ${r.tex}${approx}${CM} \\end{aligned}`,
    [
      'Right triangle mein sabse lambi side (90° ke saamne) ka square, baaki do sides ke squares ke jod ke barabar hota hai.',
      'In a right triangle, the square of the longest side (opposite the 90°) equals the sum of the squares of the other two sides.',
      'समकोण त्रिभुज में सबसे लंबी भुजा (90° के सामने) का वर्ग, बाकी दो भुजाओं के वर्गों के योग के बराबर होता है।',
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
      `Ek triangle ko utha ke ghumao: wo doosre par bilkul fit baith jaata hai. AB = CD, BC = DA aur AC dono mein common, isliye SSS se dono congruent.`,
      `Lift one triangle and turn it: it fits exactly on the other. AB = CD, BC = DA and AC is shared, so by SSS they are congruent.`,
      `एक त्रिभुज को उठाकर घुमाओ: वह दूसरे पर बिल्कुल फ़िट बैठ जाता है। AB = CD, BC = DA और AC दोनों में उभयनिष्ठ, इसलिए SSS से दोनों सर्वांगसम।`,
    ],
    `\\triangle ABC \\cong \\triangle CDA\\ (\\text{SSS})`,
    [
      `Congruent matlab bilkul ek jaise: ek ko doosre par rakho to poora dhak jaaye. Isliye har triangle ka area ${kindHl} ka aadha hai.`,
      `Congruent means exactly alike: put one on the other and it covers it completely. So each triangle has half the ${kindHl}'s area.`,
      'सर्वांगसम यानी बिल्कुल एक जैसे: एक को दूसरे पर रखो तो पूरा ढक जाए। इसलिए हर त्रिभुज का क्षेत्रफल आकृति का आधा है।',
    ],
  );

export const bothDiagonals = (square: boolean) =>
  step(
    'diagonals',
    'diagonals',
    4.5,
    square
      ? [
          'Dono diagonals AC aur BD barabar hain, aur O par ek doosre ko aadha-aadha kaatte hain, wo bhi 90° par.',
          'The diagonals AC and BD are equal, and they cut each other in half at O, at 90°.',
          'दोनों विकर्ण AC और BD बराबर हैं, और O पर एक-दूसरे को आधा-आधा काटते हैं, वह भी 90° पर।',
        ]
      : [
          'Dono diagonals AC aur BD barabar hain, aur O par ek doosre ko aadha-aadha kaatte hain (par 90° par nahi).',
          'The diagonals AC and BD are equal and cut each other in half at O (but not at 90°).',
          'दोनों विकर्ण AC और BD बराबर हैं, और O पर एक-दूसरे को आधा-आधा काटते हैं (पर 90° पर नहीं)।',
        ],
    square ? `AC = BD,\\quad OA = OB = OC = OD,\\quad \\angle AOB = 90^\\circ` : `AC = BD,\\quad OA = OB = OC = OD`,
  );
