import { squareArea } from '@/lib/geometry/formulas';
import { tx, type Params, type SolutionScript } from '@/topics/contract';
import { CM, CM2, bothDiagonals, equalSides, intro, rightAngles, step } from '@/topics/shared/flat/steps';

const remember = tx(
  'Square: 4 barabar sides, 4 right angles, diagonals barabar aur ek doosre ko 90° par aadha karte hain.',
  'Square: 4 equal sides, 4 right angles, and equal diagonals that bisect each other at 90°.',
  'वर्ग: 4 बराबर भुजाएँ, 4 समकोण, विकर्ण बराबर और एक-दूसरे को 90° पर समद्विभाजित करते हैं।',
);

export function solution(id: string, p: Params): SolutionScript {
  switch (id) {
    case 'diagonal-angles': {
      const a = p.a!;
      return {
        steps: [
          intro(a, a),
          rightAngles(),
          bothDiagonals(true),
          step(
            'half',
            'right-triangle',
            5,
            [
              'Diagonal 90° wale corner ko do barabar hisson mein baantta hai: 90° ÷ 2 = 45°.',
              'The diagonal splits the 90° corner into two equal parts: 90° ÷ 2 = 45°.',
              'विकर्ण 90° वाले कोने को दो बराबर हिस्सों में बाँटता है: 90° ÷ 2 = 45°।',
            ],
            `\\angle BAC = \\dfrac{180^\\circ - 90^\\circ}{2} = 45^\\circ,\\quad \\angle AOB = 90^\\circ`,
            [
              'Triangle ABC mein AB = BC, isliye A aur C par angles barabar.',
              'In triangle ABC, AB = BC, so the angles at A and C are equal.',
              'त्रिभुज ABC में AB = BC, इसलिए A और C पर कोण बराबर।',
            ],
          ),
        ],
        remember,
        mistake: tx('∠BAC ko 90° samajh lena. Wo poore corner ka aadha hai.', 'Taking ∠BAC as 90°. It is half of the corner.', '∠BAC को 90° समझ लेना। वह पूरे कोने का आधा है।'),
      };
    }
    case 'diagonals-bisect': {
      const k = p.k!;
      return {
        steps: [
          step('intro', 'intro', 3.5, [
            `Ye square diagonals se bana hai: AC = ${2 * k} cm.`,
            `This square was built from its diagonals: AC = ${2 * k} cm.`,
            `यह वर्ग विकर्णों से बना है: AC = ${2 * k} cm।`,
          ]),
          bothDiagonals(true),
          step(
            'answer',
            'diagonals',
            4.5,
            [
              `Diagonals barabar: BD = AC = ${2 * k} cm. O beech mein hai, to OB = ${2 * k} ÷ 2 = ${k} cm.`,
              `The diagonals are equal: BD = AC = ${2 * k} cm. O is the midpoint, so OB = ${2 * k} ÷ 2 = ${k} cm.`,
              `विकर्ण बराबर: BD = AC = ${2 * k} cm। O बीच में है, तो OB = ${2 * k} ÷ 2 = ${k} cm।`,
            ],
            `BD = ${2 * k}${CM},\\quad OB = \\dfrac{BD}{2} = ${k}${CM}`,
          ),
        ],
        remember,
        mistake: tx('OB ko poora diagonal samajh lena.', 'Taking OB as the whole diagonal.', 'OB को पूरा विकर्ण समझ लेना।'),
      };
    }
    case 'four-triangles': {
      const a = p.a!;
      const A = squareArea(a);
      return {
        steps: [
          intro(a, a),
          bothDiagonals(true),
          step(
            'four',
            'four-triangles',
            5.5,
            [
              `Diagonals se 4 barabar triangles bane. Har ek = ${A} ÷ 4 = ${A / 4} cm².`,
              `The diagonals make 4 equal triangles. Each = ${A} ÷ 4 = ${A / 4} cm².`,
              `विकर्णों से 4 बराबर त्रिभुज बने। हर एक = ${A} ÷ 4 = ${A / 4} cm²।`,
            ],
            `\\dfrac{a^2}{4} = \\dfrac{${A}}{4} = ${A / 4}${CM2}`,
            [
              'O se chaaron corners ki doori barabar hai. Isliye chaaron triangles ek jaise.',
              'O is the same distance from all four corners. So the four triangles match.',
              'O से चारों कोनों की दूरी बराबर है। इसलिए चारों त्रिभुज एक जैसे।',
            ],
          ),
        ],
        remember,
        mistake: tx('Ek diagonal wala triangle (a² ÷ 2) le lena.', 'Using the one-diagonal triangle (a² ÷ 2).', 'एक विकर्ण वाला त्रिभुज (a² ÷ 2) ले लेना।'),
      };
    }
    default: {
      const a = p.a!;
      return {
        steps: [intro(a, a), equalSides(a), rightAngles()],
        remember,
        mistake: tx('Ek angle ko 360° likh dena. 360° chaaron ka total hai.', 'Writing one angle as 360°. 360° is all four together.', 'एक कोण को 360° लिख देना। 360° चारों का योग है।'),
      };
    }
  }
}
