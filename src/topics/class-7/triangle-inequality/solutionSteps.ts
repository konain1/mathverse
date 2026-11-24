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
            'Pehle ek misaal: jab do chhoti lakdiyan milkar bhi lambi lakdi jitni nahi hoti, to unke sire kabhi nahi milte.',
            "First an example: when the two short sticks together aren't as long as the long one, their ends never meet.",
            'पहले एक उदाहरण: जब दो छोटी लकड़ियाँ मिलकर भी लंबी लकड़ी जितनी नहीं होतीं, तो उनके सिरे कभी नहीं मिलते।',
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
      `${a} cm aur ${b} cm ki sides ke beech ka angle kholo. Teesri side ${b - a} cm se zyada aur ${a + b} cm se kam rehti hai.`,
      `Open the angle between the ${a} cm and ${b} cm sides. The third side stays above ${b - a} cm and below ${a + b} cm.`,
      `${a} cm और ${b} cm की भुजाओं के बीच का कोण खोलो। तीसरी भुजा ${b - a} cm से ज़्यादा और ${a + b} cm से कम रहती है।`,
    ],
    `${b} - ${a} < c < ${b} + ${a}`,
    [
      'Angle bilkul band ho to teesri side = fark; bilkul khula (180°) to = jod. Dono hi baar triangle chapta hai.',
      'With the angle fully closed the third side = the difference; fully open (180°) it = the sum. Both times the triangle is flat.',
      'कोण पूरा बंद हो तो तीसरी भुजा = अंतर; पूरा खुला (180°) तो = योग। दोनों बार त्रिभुज चपटा है।',
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
