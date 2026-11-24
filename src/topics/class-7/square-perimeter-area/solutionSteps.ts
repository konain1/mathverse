import { squareArea, squarePerimeter } from '@/lib/geometry/formulas';
import { tx, type Params, type SolutionScript } from '@/topics/contract';
import { CM, areaFormula, equalSides, intro, perimeterWalk, step, tileAll, tileRow } from '@/topics/shared/flat/steps';

const remember = tx(
  'Perimeter = 4a (cm mein, ek length). Area = a² (cm² mein, jagah).',
  'Perimeter = 4a (in cm, a length). Area = a² (in cm², the space).',
  'परिमाप = 4a (cm में, एक लंबाई)। क्षेत्रफल = a² (cm² में, जगह)।',
);

export function solution(id: string, p: Params): SolutionScript {
  const a = p.a!;
  const P = squarePerimeter(a);
  const A = squareArea(a);
  switch (id) {
    case 'area':
      return {
        steps: [intro(a, a), tileRow(a), tileAll(a, a), areaFormula(a, a)],
        remember,
        mistake: tx('Area ki jagah 4a (perimeter) likh dena.', 'Writing 4a (the perimeter) instead of the area.', 'क्षेत्रफल की जगह 4a (परिमाप) लिख देना।'),
      };
    case 'side-from-perimeter':
      return {
        steps: [
          step('walk', 'perimeter', 5, [
            `Chaaron sides milakar ${P} cm hain.`,
            `All four sides together make ${P} cm.`,
            `चारों भुजाएँ मिलकर ${P} cm हैं।`,
          ], `4a = ${P}`),
          step(
            'side',
            'sides',
            4,
            [
              `Chaaron sides barabar hain, to ek side = ${P} ÷ 4 = ${a} cm.`,
              `The four sides are equal, so one side = ${P} ÷ 4 = ${a} cm.`,
              `चारों भुजाएँ बराबर हैं, तो एक भुजा = ${P} ÷ 4 = ${a} cm।`,
            ],
            `a = \\dfrac{${P}}{4} = ${a}${CM}`,
          ),
          tileAll(a, a),
          areaFormula(a, a),
        ],
        remember,
        mistake: tx('Perimeter ko 2 se divide karna. Square mein 4 sides hain.', 'Dividing the perimeter by 2. A square has 4 sides.', 'परिमाप को 2 से भाग देना। वर्ग में 4 भुजाएँ हैं।'),
      };
    case 'lace-cost': {
      const r = p.r!;
      return {
        steps: [
          intro(a, a),
          perimeterWalk(a, a),
          step(
            'cost',
            'perimeter',
            4.5,
            [
              `Har cm lace ₹${r} ki hai, to ${P} cm ka kharcha = ${P} × ${r} = ₹${P * r}.`,
              `Each cm of lace costs ₹${r}, so ${P} cm costs ${P} × ${r} = ₹${P * r}.`,
              `हर cm लेस ₹${r} की है, तो ${P} cm का ख़र्च = ${P} × ${r} = ₹${P * r}।`,
            ],
            `\\text{Cost} = ${P} \\times ${r} = \\text{₹}\\,${P * r}`,
            [
              'Kinare par lagne wali cheez (lace, fence, tape) hamesha perimeter se judti hai.',
              'Anything that runs along the edge (lace, fence, tape) always goes with the perimeter.',
              'किनारे पर लगने वाली चीज़ (लेस, बाड़, टेप) हमेशा परिमाप से जुड़ती है।',
            ],
          ),
        ],
        remember,
        mistake: tx('Area (a²) se guna kar dena, jabki lace sirf kinare par lagti hai.', 'Multiplying by the area (a²), though lace only runs along the edge.', 'क्षेत्रफल (a²) से गुणा कर देना, जबकि लेस सिर्फ़ किनारे पर लगती है।'),
      };
    }
    default:
      return {
        steps: [intro(a, a), equalSides(a), perimeterWalk(a, a)],
        remember,
        mistake: tx(`a × a = ${A} likh dena: wo area hai, perimeter nahi.`, `Writing a × a = ${A}: that's the area, not the perimeter.`, `a × a = ${A} लिख देना: वह क्षेत्रफल है, परिमाप नहीं।`),
      };
  }
}
