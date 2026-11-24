import { rectangleArea, rectangleDiagonal, rectanglePerimeter } from '@/lib/geometry/formulas';
import { tx, type Params, type SolutionScript } from '@/topics/contract';
import { CM, CM2, bothDiagonals, intro, oppositeSides, rightAngles, rightTriangle, step } from '@/topics/shared/flat/steps';

const remember = tx(
  'Rectangle: opposite sides barabar aur parallel, chaaron angles 90°, diagonals barabar aur ek doosre ko aadha karte hain.',
  'Rectangle: opposite sides equal and parallel, all angles 90°, diagonals equal and bisecting each other.',
  'आयत: सम्मुख भुजाएँ बराबर और समांतर, सभी कोण 90°, विकर्ण बराबर और एक-दूसरे को समद्विभाजित करते हैं।',
);

export function solution(id: string, p: Params): SolutionScript {
  const l = p.l!;
  const b = p.b!;
  switch (id) {
    case 'diagonals-equal': {
      const d = rectangleDiagonal(l, b);
      return {
        steps: [
          intro(l, b),
          bothDiagonals(false),
          step(
            'answer',
            'diagonals',
            4.5,
            [`BD = AC = ${d} cm. O beech mein hai, to OA = ${d} ÷ 2 = ${d / 2} cm.`, `BD = AC = ${d} cm. O is the midpoint, so OA = ${d} ÷ 2 = ${d / 2} cm.`, `BD = AC = ${d} cm। O बीच में है, तो OA = ${d} ÷ 2 = ${d / 2} cm।`],
            `BD = ${d}${CM},\\quad OA = \\dfrac{${d}}{2} = ${d / 2}${CM}`,
            [
              'Dono diagonals ki lambai √(l² + b²) aati hai. Isliye dono barabar.',
              'Both diagonals come out as √(l² + b²). So they are equal.',
              'दोनों विकर्णों की लंबाई √(l² + b²) आती है। इसलिए दोनों बराबर।',
            ],
          ),
        ],
        remember,
        mistake: tx('OA ko poora diagonal maan lena.', 'Taking OA as the whole diagonal.', 'OA को पूरा विकर्ण मान लेना।'),
      };
    }
    case 'triangle-angles':
      return {
        steps: [
          intro(l, b),
          rightAngles(),
          rightTriangle(l, b),
          step(
            'sum',
            'right-triangle',
            5,
            [
              'Teeno angles milkar 180°. ∠B = 90°, to baaki do milkar 90°.',
              'The three angles make 180°. ∠B = 90°, so the other two make 90°.',
              'तीनों कोण मिलकर 180°। ∠B = 90°, तो बाकी दो मिलकर 90°।',
            ],
            `\\angle BAC + \\angle BCA = 180^\\circ - 90^\\circ = 90^\\circ`,
          ),
        ],
        remember,
        mistake: tx('Do angles ka sum 180° likh dena: wo teeno ka hai.', 'Writing 180° for two angles: that is all three.', 'दो कोणों का योग 180° लिख देना: वह तीनों का है।'),
      };
    case 'perimeter-diagonal': {
      const s = rectanglePerimeter(l, b) / 2;
      const d = rectangleDiagonal(l, b);
      const area = rectangleArea(l, b);
      return {
        steps: [
          step('sum', 'perimeter', 4.5, [
            `Perimeter ${2 * s} cm, to l + b = ${s}.`,
            `The perimeter is ${2 * s} cm, so l + b = ${s}.`,
            `परिमाप ${2 * s} cm, तो l + b = ${s}।`,
          ], `l + b = \\dfrac{${2 * s}}{2} = ${s}`),
          step(
            'pythagoras',
            'pythag',
            5,
            [`Diagonal se: l² + b² = ${d}² = ${d * d}.`, `From the diagonal: l² + b² = ${d}² = ${d * d}.`, `विकर्ण से: l² + b² = ${d}² = ${d * d}।`],
            `l^2 + b^2 = ${d * d}`,
          ),
          step(
            'identity',
            'area',
            6,
            [
              `(l + b)² = l² + b² + 2lb, to ${s * s} = ${d * d} + 2lb. Isliye 2lb = ${s * s - d * d} aur area = lb = ${area} cm².`,
              `(l + b)² = l² + b² + 2lb, so ${s * s} = ${d * d} + 2lb. Hence 2lb = ${s * s - d * d} and the area = lb = ${area} cm².`,
              `(l + b)² = l² + b² + 2lb, तो ${s * s} = ${d * d} + 2lb। इसलिए 2lb = ${s * s - d * d} और क्षेत्रफल = lb = ${area} cm²।`,
            ],
            `lb = \\dfrac{(l+b)^2 - (l^2 + b^2)}{2} = \\dfrac{${s * s} - ${d * d}}{2} = ${area}${CM2}`,
            [
              'l aur b alag-alag nikale bina bhi area mil gaya: identity (a + b)² = a² + b² + 2ab ka kamaal.',
              'We got the area without finding l and b separately, thanks to the identity (a + b)² = a² + b² + 2ab.',
              'l और b अलग-अलग निकाले बिना भी क्षेत्रफल मिल गया: सर्वसमिका (a + b)² = a² + b² + 2ab का कमाल।',
            ],
          ),
        ],
        remember,
        mistake: tx('d² ÷ 2 laga dena, jo sirf square ke liye sahi hai.', 'Using d² ÷ 2, which is only right for a square.', 'd² ÷ 2 लगा देना, जो सिर्फ़ वर्ग के लिए सही है।'),
      };
    }
    default:
      return {
        steps: [intro(l, b), oppositeSides(l, b), rightAngles()],
        remember,
        mistake: tx('Baazu wali side ko saamne wali samajh lena.', 'Mixing up the side next to it with the side opposite.', 'बगल वाली भुजा को सामने वाली समझ लेना।'),
      };
  }
}
