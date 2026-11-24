import { missingLeg, rectangleArea, rectangleDiagonal } from '@/lib/geometry/formulas';
import { tx, type Params, type SolutionScript } from '@/topics/contract';
import { CM, CM2, drawDiagonal, flipStep, intro, pythagStep, rightTriangle, splitStep, step } from '@/topics/shared/flat/steps';

const remember = tx(
  'Rectangle ka diagonal: d² = l² + b² (Pythagoras). Diagonal rectangle ko do congruent triangles mein baantta hai.',
  'Diagonal of a rectangle: d² = l² + b² (Pythagoras). The diagonal splits the rectangle into two congruent triangles.',
  'आयत का विकर्ण: d² = l² + b² (पाइथागोरस)। विकर्ण आयत को दो सर्वांगसम त्रिभुजों में बाँटता है।',
);

export function solution(id: string, p: Params): SolutionScript {
  const l = p.l!;
  const b = p.b!;
  switch (id) {
    case 'missing-side': {
      const d = rectangleDiagonal(l, b);
      const bb = missingLeg(d, l);
      return {
        steps: [
          intro(l, b),
          drawDiagonal(),
          rightTriangle(l, b),
          step(
            'reverse',
            'pythag',
            6,
            [
              `Pythagoras ulta: b² = d² − l² = ${d * d} − ${l * l} = ${bb * bb}. To b = √${bb * bb} = ${bb} cm.`,
              `Pythagoras backwards: b² = d² − l² = ${d * d} − ${l * l} = ${bb * bb}. So b = √${bb * bb} = ${bb} cm.`,
              `पाइथागोरस उल्टा: b² = d² − l² = ${d * d} − ${l * l} = ${bb * bb}। तो b = √${bb * bb} = ${bb} cm।`,
            ],
            `b = \\sqrt{d^2 - l^2} = \\sqrt{${d * d} - ${l * l}} = ${bb}${CM}`,
          ),
        ],
        remember,
        mistake: tx('d − l kar dena. Squares ko ghataao, sides ko nahi.', 'Doing d − l. Subtract the squares, not the sides.', 'd − l कर देना। वर्गों को घटाओ, भुजाओं को नहीं।'),
      };
    }
    case 'congruent-halves': {
      const A = rectangleArea(l, b);
      return {
        steps: [
          intro(l, b),
          drawDiagonal(),
          splitStep(),
          flipStep(),
          step(
            'half',
            'split',
            4,
            [`Har triangle = ${l} × ${b} ÷ 2 = ${A / 2} cm².`, `Each triangle = ${l} × ${b} ÷ 2 = ${A / 2} cm².`, `हर त्रिभुज = ${l} × ${b} ÷ 2 = ${A / 2} cm²।`],
            `\\dfrac{l \\times b}{2} = \\dfrac{${A}}{2} = ${A / 2}${CM2}`,
            [
              'Isi se triangle ka formula aata hai: ½ × base × height.',
              'This is where the triangle formula comes from: ½ × base × height.',
              'इसी से त्रिभुज का सूत्र आता है: ½ × आधार × ऊँचाई।',
            ],
          ),
        ],
        remember,
        mistake: tx('Poore rectangle ka area likh dena.', 'Writing the whole rectangle’s area.', 'पूरे आयत का क्षेत्रफल लिख देना।'),
      };
    }
    default:
      return {
        steps: [intro(l, b), drawDiagonal(), rightTriangle(l, b), pythagStep(l, b)],
        remember,
        mistake: tx('Diagonal = l + b maan lena. Diagonal hamesha l + b se chhota hai.', 'Taking the diagonal as l + b. It is always shorter than l + b.', 'विकर्ण = l + b मान लेना। विकर्ण हमेशा l + b से छोटा है।'),
      };
  }
}
