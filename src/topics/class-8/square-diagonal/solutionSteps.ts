import { fmt } from '@/lib/format';
import { squareAreaFromDiagonal, squareDiagonal } from '@/lib/geometry/formulas';
import { tx, type Params, type SolutionScript } from '@/topics/contract';
import { CM, CM2, bothDiagonals, drawDiagonal, intro, pythagStep, rightTriangle, step } from '@/topics/shared/flat/steps';

const remember = tx(
  'Square ka diagonal = a√2 (≈ 1.414 × a). Diagonal se area = d² ÷ 2.',
  'Diagonal of a square = a√2 (≈ 1.414 × a). Area from the diagonal = d² ÷ 2.',
  'वर्ग का विकर्ण = a√2 (≈ 1.414 × a)। विकर्ण से क्षेत्रफल = d² ÷ 2।',
);

function diamondIntro(k: number) {
  return step('intro', 'intro', 3.5, [
    `Is square ke dono diagonals ${2 * k} cm ke hain.`,
    `Both diagonals of this square are ${2 * k} cm.`,
    `इस वर्ग के दोनों विकर्ण ${2 * k} cm के हैं।`,
  ]);
}

function halfSquare(d: number) {
  const A = squareAreaFromDiagonal(d);
  return step(
    'half',
    'diag-square',
    6,
    [
      `Diagonals ke siron se ek bada square banao: uski side ${d} cm, area ${d * d} cm². Bahar ke 4 triangles andar ke 4 triangles jaise hain, to hamara square uska aadha: ${d * d} ÷ 2 = ${A} cm².`,
      `Build a big square through the ends of the diagonals: side ${d} cm, area ${d * d} cm². The 4 outer triangles match the 4 inner ones, so our square is half: ${d * d} ÷ 2 = ${A} cm².`,
      `विकर्णों के सिरों से एक बड़ा वर्ग बनाओ: भुजा ${d} cm, क्षेत्रफल ${d * d} cm²। बाहर के 4 त्रिभुज अंदर के 4 त्रिभुजों जैसे हैं, तो हमारा वर्ग उसका आधा: ${d * d} ÷ 2 = ${A} cm²।`,
    ],
    `A = \\dfrac{d^2}{2} = \\dfrac{${d}^2}{2} = ${A}${CM2}`,
    [
      'Square ek rhombus bhi hai, aur rhombus ka area = ½ × d₁ × d₂. Square mein d₁ = d₂ = d, isliye d² ÷ 2.',
      'A square is also a rhombus, and a rhombus has area ½ × d₁ × d₂. In a square d₁ = d₂ = d, so d² ÷ 2.',
      'वर्ग एक समचतुर्भुज भी है, और समचतुर्भुज का क्षेत्रफल = ½ × d₁ × d₂। वर्ग में d₁ = d₂ = d, इसलिए d² ÷ 2।',
    ],
  );
}

export function solution(id: string, p: Params): SolutionScript {
  switch (id) {
    case 'area-from-diagonal': {
      const k = p.k!;
      return {
        steps: [diamondIntro(k), bothDiagonals(true), halfSquare(2 * k)],
        remember,
        mistake: tx('d² ko hi area samajh lena. Wo bade square ka area hai; hamara aadha.', 'Taking d² as the area. That is the big square; ours is half.', 'd² को ही क्षेत्रफल समझ लेना। वह बड़े वर्ग का है; हमारा आधा।'),
      };
    }
    case 'diagonal-from-area': {
      const k = p.k!;
      const A = 2 * k * k;
      const d = 2 * k;
      return {
        steps: [
          step('given', 'intro', 3.5, [
            `Square ka area ${A} cm² hai. Diagonal d chahiye.`,
            `The square's area is ${A} cm². We need the diagonal d.`,
            `वर्ग का क्षेत्रफल ${A} cm² है। विकर्ण d चाहिए।`,
          ], `A = ${A}${CM2}`),
          halfSquare(d),
          step(
            'reverse',
            'diagonals',
            5,
            [
              `Ulta chalo: d² ÷ 2 = ${A}, to d² = ${2 * A}, aur d = √${2 * A} = ${d} cm.`,
              `Work backwards: d² ÷ 2 = ${A}, so d² = ${2 * A}, and d = √${2 * A} = ${d} cm.`,
              `उल्टा चलो: d² ÷ 2 = ${A}, तो d² = ${2 * A}, और d = √${2 * A} = ${d} cm।`,
            ],
            `d = \\sqrt{2A} = \\sqrt{${2 * A}} = ${d}${CM}`,
          ),
        ],
        remember,
        mistake: tx('√area nikal ke ruk jaana. Wo side hai, diagonal nahi.', 'Stopping at √area. That is the side, not the diagonal.', '√क्षेत्रफल निकालकर रुक जाना। वह भुजा है, विकर्ण नहीं।'),
      };
    }
    case 'side-from-diagonal': {
      const a = p.a!;
      return {
        steps: [
          intro(a, a),
          drawDiagonal(),
          rightTriangle(a, a),
          step(
            'reverse',
            'pythag',
            6,
            [
              `a² + a² = d², yaani 2a² = (${a}√2)² = ${2 * a * a}. To a² = ${a * a} aur a = ${a} cm. Shortcut: a = d ÷ √2.`,
              `a² + a² = d², so 2a² = (${a}√2)² = ${2 * a * a}. Then a² = ${a * a} and a = ${a} cm. Shortcut: a = d ÷ √2.`,
              `a² + a² = d², यानी 2a² = (${a}√2)² = ${2 * a * a}। तो a² = ${a * a} और a = ${a} cm। शॉर्टकट: a = d ÷ √2।`,
            ],
            `a = \\dfrac{d}{\\sqrt{2}} = \\dfrac{${a}\\sqrt{2}}{\\sqrt{2}} = ${a}${CM}`,
          ),
        ],
        remember,
        mistake: tx('d ÷ 2 kar dena. Sahi hai d ÷ √2.', 'Doing d ÷ 2. The right step is d ÷ √2.', 'd ÷ 2 कर देना। सही है d ÷ √2।'),
      };
    }
    default: {
      const a = p.a!;
      const d = squareDiagonal(a);
      return {
        steps: [
          intro(a, a),
          drawDiagonal(),
          rightTriangle(a, a),
          pythagStep(a, a),
          step(
            'rule',
            'right-triangle',
            4,
            [
              `Har square ke liye: d = a√2. Yahan ${a} × 1.414 ≈ ${fmt(d)} cm.`,
              `For every square: d = a√2. Here ${a} × 1.414 ≈ ${fmt(d)} cm.`,
              `हर वर्ग के लिए: d = a√2। यहाँ ${a} × 1.414 ≈ ${fmt(d)} cm।`,
            ],
            `d = a\\sqrt{2} = ${a}\\sqrt{2} \\approx ${fmt(d)}${CM}`,
            [
              'd² = a² + a² = 2a², isliye d = √(2a²) = a√2.',
              'd² = a² + a² = 2a², so d = √(2a²) = a√2.',
              'd² = a² + a² = 2a², इसलिए d = √(2a²) = a√2।',
            ],
          ),
        ],
        remember,
        mistake: tx('Diagonal ko 2a samajhna. Diagonal side se lamba hai, par double nahi.', 'Thinking the diagonal is 2a. It is longer than the side, but not double.', 'विकर्ण को 2a समझना। विकर्ण भुजा से लंबा है, पर दुगुना नहीं।'),
      };
    }
  }
}
