import { isValidTriangle, wholeThirdSides } from '@/lib/geometry/formulas';
import { tx, type Params, type SolutionScript } from '@/topics/contract';
import { step } from '@/topics/shared/flat/steps';
import { TRIPLES } from './questions';

const remember = tx(
  'Kisi bhi do sides ka jod teesri se bada hona chahiye. Teesri side hamesha (dono ka fark) aur (dono ka jod) ke beech hoti hai.',
  'Any two sides must add up to more than the third. The third side always lies between (their difference) and (their sum).',
  'किन्हीं दो भुजाओं का योग तीसरी से बड़ा होना चाहिए। तीसरी भुजा हमेशा (दोनों के अंतर) और (दोनों के योग) के बीच होती है।',
);
const mistake = tx(
  'Barabar wale case ko sahi maan lena (a + b = c). Tab triangle chapta hokar seedhi line ban jaata hai.',
  'Accepting the equal case (a + b = c). Then the triangle collapses into a straight line.',
  'बराबर वाले मामले को सही मान लेना (a + b = c)। तब त्रिभुज चपटा होकर सीधी रेखा बन जाता है।',
);

export function solution(id: string, p: Params): SolutionScript {
  if (id === 'can-form') {
    const [a, b, c] = [...TRIPLES[p.t!]!].sort((x, y) => x - y) as [number, number, number];
    const ok = isValidTriangle(a, b, c);
    return {
      steps: [
        step(
          'rods',
          'rods',
          6,
          [
            'Do chhoti lakdiyan milkar lambi wali se chhoti hon, to unke sire kabhi nahi milte.',
            'If the two short sticks together are shorter than the long one, their ends never meet.',
            'दो छोटी लकड़ियाँ मिलकर लंबी वाली से छोटी हों, तो उनके सिरे कभी नहीं मिलते।',
          ],
          `a + b \\le c \\Rightarrow \\text{no triangle}`,
        ),
        step(
          'check',
          'solved',
          5,
          ok
            ? [`Yahan ${a} + ${b} = ${a + b} > ${c}. Haan, triangle ban jayega.`, `Here ${a} + ${b} = ${a + b} > ${c}. Yes, it makes a triangle.`, `यहाँ ${a} + ${b} = ${a + b} > ${c}। हाँ, त्रिभुज बन जाएगा।`]
            : [`Yahan ${a} + ${b} = ${a + b}, jo ${c} se bada nahi. Triangle nahi banega.`, `Here ${a} + ${b} = ${a + b}, which is not more than ${c}. No triangle.`, `यहाँ ${a} + ${b} = ${a + b}, जो ${c} से बड़ा नहीं। त्रिभुज नहीं बनेगा।`],
          `${a} + ${b} = ${a + b}\\ ${ok ? '>' : '\\le'}\\ ${c}`,
          [
            'Sirf do sabse chhoti sides ka jod check karna kaafi hai: baaki jod apne aap bade honge.',
            'Checking the two shortest sides is enough: the other sums are automatically bigger.',
            'सिर्फ़ दो सबसे छोटी भुजाओं का योग जाँचना काफ़ी है: बाकी योग अपने आप बड़े होंगे।',
          ],
        ),
      ],
      remember,
      mistake,
    };
  }
  const a = p.a!;
  const b = p.b!;
  const all = wholeThirdSides(a, b);
  const sweep = step(
    'range',
    'range',
    7,
    [
      `Angle kholte jao: teesri side ${b - a} cm se badi aur ${a + b} cm se chhoti rehti hai.`,
      `Open the angle: the third side stays above ${b - a} cm and below ${a + b} cm.`,
      `कोण खोलते जाओ: तीसरी भुजा ${b - a} cm से बड़ी और ${a + b} cm से छोटी रहती है।`,
    ],
    `${b} - ${a} < c < ${b} + ${a}`,
    [
      'Angle bilkul band ya bilkul khula ho, to triangle chapta ho jaata hai.',
      'With the angle fully closed or fully open, the triangle goes flat.',
      'कोण पूरा बंद या पूरा खुला हो, तो त्रिभुज चपटा हो जाता है।',
    ],
  );
  const whole = step(
    'whole',
    'range',
    5,
    [
      `Whole numbers: ${all[0]} se ${all[all.length - 1]} tak, kul ${all.length}.`,
      `Whole numbers: ${all[0]} to ${all[all.length - 1]}, ${all.length} in all.`,
      `पूर्ण संख्याएँ: ${all[0]} से ${all[all.length - 1]} तक, कुल ${all.length}।`,
    ],
    `c \\in \\{${all[0]}, \\dots, ${all[all.length - 1]}\\}`,
  );
  const steps = [sweep, whole];
  if (id === 'perimeter-bounds')
    steps.push(
      step(
        'perimeter',
        'range',
        4.5,
        [
          `Perimeter = ${a} + ${b} + c: sabse chhota ${a + b + all[0]!} cm, sabse bada ${a + b + all[all.length - 1]!} cm.`,
          `Perimeter = ${a} + ${b} + c: smallest ${a + b + all[0]!} cm, largest ${a + b + all[all.length - 1]!} cm.`,
          `परिमाप = ${a} + ${b} + c: सबसे छोटा ${a + b + all[0]!} cm, सबसे बड़ा ${a + b + all[all.length - 1]!} cm।`,
        ],
        `${a + b + all[0]!} \\le P \\le ${a + b + all[all.length - 1]!}`,
      ),
    );
  return { steps, remember, mistake };
}
