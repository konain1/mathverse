import { heronArea, semiPerimeter, triangleHeight } from '@/lib/geometry/formulas';
import { fmt } from '@/lib/format';
import { tx, type Params, type SolutionScript } from '@/topics/contract';
import { CM, CM2, step } from '@/topics/shared/flat/steps';
import { sidesFor } from './questions';

const remember = tx(
  'Heron: s = (a + b + c) ÷ 2, area = √(s(s − a)(s − b)(s − c)). Height na pata ho tab bhi teen sides kaafi hain.',
  'Heron: s = (a + b + c) ÷ 2, area = √(s(s − a)(s − b)(s − c)). Three sides are enough even without the height.',
  'हीरोन: s = (a + b + c) ÷ 2, क्षेत्रफल = √(s(s − a)(s − b)(s − c))। ऊँचाई पता न हो तब भी तीन भुजाएँ काफ़ी हैं।',
);

export function solution(id: string, p: Params): SolutionScript {
  const [a, b, c] = sidesFor(p.i!);
  const s = semiPerimeter(a, b, c);
  const prod = s * (s - a) * (s - b) * (s - c);
  const area = heronArea(a, b, c);
  const intro = step('intro', 'intro', 3, [`Sides: a = ${a}, b = ${b}, c = ${c} cm.`, `Sides: a = ${a}, b = ${b}, c = ${c} cm.`, `भुजाएँ: a = ${a}, b = ${b}, c = ${c} cm।`]);
  const semi = step(
    'semi',
    'semi',
    5,
    [
      `Aadha chakkar: s = (${a} + ${b} + ${c}) ÷ 2 = ${s} cm.`,
      `Half way round: s = (${a} + ${b} + ${c}) ÷ 2 = ${s} cm.`,
      `आधा चक्कर: s = (${a} + ${b} + ${c}) ÷ 2 = ${s} cm।`,
    ],
    `s = \\dfrac{a + b + c}{2} = \\dfrac{${a + b + c}}{2} = ${s}${CM}`,
  );
  const heron = step(
    'heron',
    'semi',
    6,
    [
      `s − a = ${s - a}, s − b = ${s - b}, s − c = ${s - c}. Area = √(${s} × ${s - a} × ${s - b} × ${s - c}) = √${prod} = ${area} cm².`,
      `s − a = ${s - a}, s − b = ${s - b}, s − c = ${s - c}. Area = √(${s} × ${s - a} × ${s - b} × ${s - c}) = √${prod} = ${area} cm².`,
      `s − a = ${s - a}, s − b = ${s - b}, s − c = ${s - c}। क्षेत्रफल = √(${s} × ${s - a} × ${s - b} × ${s - c}) = √${prod} = ${area} cm²।`,
    ],
    `A = \\sqrt{${s}(${s - a})(${s - b})(${s - c})} = \\sqrt{${prod}} = ${area}${CM2}`,
    [
      'Heron ka formula sirf teen sides se area deta hai, jab height naapna mushkil ho (jaise khet ya plot mein).',
      'Heron’s formula gives the area from just the three sides, handy when the height is hard to measure (like in a field).',
      'हीरोन का सूत्र सिर्फ़ तीन भुजाओं से क्षेत्रफल देता है, जब ऊँचाई नापना मुश्किल हो (जैसे खेत में)।',
    ],
  );
  const mistake = tx('Last mein square root lena bhool jaana, ya s ki jagah poora perimeter le lena.', 'Forgetting the final square root, or using the whole perimeter instead of s.', 'अंत में वर्गमूल लेना भूल जाना, या s की जगह पूरा परिमाप ले लेना।');
  switch (id) {
    case 'semi-perimeter':
      return { steps: [intro, semi], remember, mistake };
    case 'check-height': {
      const h = triangleHeight(area, a);
      return {
        steps: [
          intro,
          semi,
          heron,
          step(
            'check',
            'altitude',
            5,
            [
              `Height on a: h = 2 × ${area} ÷ ${a} = ${fmt(h)} cm. Altitude naap ke dekho: wahi aata hai! Aur ½ × ${a} × ${fmt(h)} = ${area}. ✓`,
              `Height on a: h = 2 × ${area} ÷ ${a} = ${fmt(h)} cm. Measure the altitude: it matches! And ½ × ${a} × ${fmt(h)} = ${area}. ✓`,
              `a पर ऊँचाई: h = 2 × ${area} ÷ ${a} = ${fmt(h)} cm। शीर्षलंब नापकर देखो: वही आता है! और ½ × ${a} × ${fmt(h)} = ${area}। ✓`,
            ],
            `h = \\dfrac{2 \\times ${area}}{${a}} = ${fmt(h)}${CM}`,
          ),
        ],
        remember,
        mistake,
      };
    }
    case 'paint-cost':
      return {
        steps: [
          intro,
          semi,
          heron,
          step('cost', 'semi', 4, [
            `Kharcha = ${area} cm² × ₹${p.r} = ₹${area * p.r!}.`,
            `Cost = ${area} cm² × ₹${p.r} = ₹${area * p.r!}.`,
            `ख़र्च = ${area} cm² × ₹${p.r} = ₹${area * p.r!}।`,
          ], `\\text{Cost} = ${area} \\times ${p.r} = \\text{₹}\\,${area * p.r!}`),
        ],
        remember,
        mistake,
      };
    default:
      return { steps: [intro, semi, heron], remember, mistake };
  }
}
