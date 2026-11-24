import { hypotenuse, triangleArea, triangleHeight, trianglePerimeter } from '@/lib/geometry/formulas';
import { fmt } from '@/lib/format';
import { tx, type Params, type SolutionScript } from '@/topics/contract';
import { CM, CM2, step } from '@/topics/shared/flat/steps';
import { sidesOf } from '@/topics/shared/tri/lattice';
import { triOf } from './questions';

const remember = tx(
  'Perimeter = teeno sides ka jod. Area = ½ × base × height (height base par 90°). Triangle apni copy ke saath parallelogram banata hai.',
  'Perimeter = the three sides added. Area = ½ × base × height (the height meets the base at 90°). A triangle and its copy make a parallelogram.',
  'परिमाप = तीनों भुजाओं का योग। क्षेत्रफल = ½ × आधार × ऊँचाई (ऊँचाई आधार पर 90°)। त्रिभुज अपनी प्रति के साथ समांतर चतुर्भुज बनाता है।',
);

function areaSteps(b: number, h: number) {
  const A = triangleArea(b, h);
  return [
    step('height', 'altitude', 4, [
      `Height: A se base BC par seedhi line (90°): h = ${h} cm.`,
      `Height: a straight line from A down to the base BC (at 90°): h = ${h} cm.`,
      `ऊँचाई: A से आधार BC पर सीधी रेखा (90°): h = ${h} cm।`,
    ]),
    step(
      'copy',
      'copy',
      5.5,
      [
        'Triangle ki ek copy banao aur use AC ke beech se 180° ghumao. Dono milkar ek parallelogram ban gaye.',
        'Make a copy of the triangle and turn it 180° about the middle of AC. Together they make a parallelogram.',
        'त्रिभुज की एक प्रति बनाओ और उसे AC के बीच से 180° घुमाओ। दोनों मिलकर एक समांतर चतुर्भुज बन गए।',
      ],
      undefined,
      [
        'Copy bilkul same triangle hai, isliye parallelogram ka area triangle ka double hai.',
        'The copy is exactly the same triangle, so the parallelogram has double the triangle’s area.',
        'प्रति बिल्कुल वही त्रिभुज है, इसलिए समांतर चतुर्भुज का क्षेत्रफल त्रिभुज का दुगुना है।',
      ],
    ),
    step(
      'rectangle',
      'rectangle',
      5.5,
      [
        `Parallelogram ka ek tukda kaat ke doosri taraf lagao: ${b} × ${h} ka rectangle! Area = ${b * h} cm².`,
        `Cut a piece off the parallelogram and move it to the other side: a ${b} × ${h} rectangle! Area = ${b * h} cm².`,
        `समांतर चतुर्भुज का एक टुकड़ा काटकर दूसरी तरफ़ लगाओ: ${b} × ${h} का आयत! क्षेत्रफल = ${b * h} cm²।`,
      ],
      `b \\times h = ${b} \\times ${h} = ${b * h}`,
    ),
    step(
      'half',
      'rectangle',
      4,
      [`Triangle iska aadha: ½ × ${b} × ${h} = ${A} cm².`, `The triangle is half of it: ½ × ${b} × ${h} = ${A} cm².`, `त्रिभुज इसका आधा: ½ × ${b} × ${h} = ${A} cm²।`],
      `A = \\tfrac{1}{2} \\times ${b} \\times ${h} = ${A}${CM2}`,
    ),
  ];
}

export function solution(id: string, p: Params): SolutionScript {
  const tri = triOf(id, p);
  const intro = step('intro', 'intro', 3, ['Ye triangle ABC hai.', 'Here is triangle ABC.', 'यह त्रिभुज ABC है।']);
  switch (id) {
    case 'area':
      return { steps: [intro, ...areaSteps(p.b!, p.h!)], remember, mistake: tx('½ bhool jaana: b × h parallelogram ka area hai.', 'Forgetting the ½: b × h is the parallelogram.', '½ भूल जाना: b × h समांतर चतुर्भुज का क्षेत्रफल है।') };
    case 'height-from-area': {
      const A = triangleArea(p.b!, p.h!);
      return {
        steps: [
          intro,
          ...areaSteps(p.b!, p.h!).slice(1, 3),
          step(
            'solve',
            'altitude',
            5,
            [`½ × ${p.b} × h = ${A}, to h = 2 × ${A} ÷ ${p.b} = ${p.h} cm.`, `½ × ${p.b} × h = ${A}, so h = 2 × ${A} ÷ ${p.b} = ${p.h} cm.`, `½ × ${p.b} × h = ${A}, तो h = 2 × ${A} ÷ ${p.b} = ${p.h} cm।`],
            `h = \\dfrac{2A}{b} = \\dfrac{2 \\times ${A}}{${p.b}} = ${triangleHeight(A, p.b!)}${CM}`,
          ),
        ],
        remember,
        mistake: tx('Area ÷ base kar ke 2 se guna karna bhool jaana.', 'Doing area ÷ base and forgetting to multiply by 2.', 'क्षेत्रफल ÷ आधार करके 2 से गुणा करना भूल जाना।'),
      };
    }
    case 'hypotenuse-height': {
      const a = 3 * p.k!;
      const b = 4 * p.k!;
      const area = triangleArea(a, b);
      const c = hypotenuse(a, b);
      return {
        steps: [
          intro,
          step('legs', 'intro', 4, [
            `Right triangle mein ek leg base aur doosra height hai: area = ½ × ${a} × ${b} = ${area} cm².`,
            `In a right triangle one leg is the base and the other the height: area = ½ × ${a} × ${b} = ${area} cm².`,
            `समकोण त्रिभुज में एक भुजा आधार और दूसरी ऊँचाई है: क्षेत्रफल = ½ × ${a} × ${b} = ${area} cm²।`,
          ], `A = \\tfrac12 \\times ${a} \\times ${b} = ${area}${CM2}`),
          step(
            'other-base',
            'altitude',
            5.5,
            [
              `Ab hypotenuse (${c} cm) ko base maano. Area wahi hai: ½ × ${c} × h = ${area}, to h = ${fmt(triangleHeight(area, c))} cm.`,
              `Now take the hypotenuse (${c} cm) as the base. The area is the same: ½ × ${c} × h = ${area}, so h = ${fmt(triangleHeight(area, c))} cm.`,
              `अब कर्ण (${c} cm) को आधार मानो। क्षेत्रफल वही है: ½ × ${c} × h = ${area}, तो h = ${fmt(triangleHeight(area, c))} cm।`,
            ],
            `h = \\dfrac{2 \\times ${area}}{${c}} = ${fmt(triangleHeight(area, c))}${CM}`,
            [
              'Kisi bhi side ko base maan sakte ho; bas height usi side par 90° honi chahiye.',
              'Any side can be the base; the height just has to meet that side at 90°.',
              'किसी भी भुजा को आधार मान सकते हो; बस ऊँचाई उसी भुजा पर 90° होनी चाहिए।',
            ],
          ),
        ],
        remember,
        mistake: tx('Hypotenuse par height ko kisi leg ke barabar maan lena.', 'Taking the height to the hypotenuse as one of the legs.', 'कर्ण पर ऊँचाई को किसी भुजा के बराबर मान लेना।'),
      };
    }
    default: {
      const s = sidesOf(tri);
      return {
        steps: [
          intro,
          step('walk', 'perimeter', 5, [
            `Chaaron taraf ek chakkar: ${s.join(' + ')} = ${trianglePerimeter(...s)} cm.`,
            `Once around: ${s.join(' + ')} = ${trianglePerimeter(...s)} cm.`,
            `एक पूरा चक्कर: ${s.join(' + ')} = ${trianglePerimeter(...s)} cm।`,
          ], `P = ${s.join(' + ')} = ${trianglePerimeter(...s)}${CM}`),
        ],
        remember,
        mistake: tx('Ek side jodna bhool jaana.', 'Forgetting to add one side.', 'एक भुजा जोड़ना भूल जाना।'),
      };
    }
  }
}
