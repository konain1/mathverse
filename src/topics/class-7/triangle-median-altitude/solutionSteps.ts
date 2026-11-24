import { missingLeg, triangleArea } from '@/lib/geometry/formulas';
import { tx, type Params, type SolutionScript } from '@/topics/contract';
import { CM, step } from '@/topics/shared/flat/steps';

const remember = tx(
  'Median: corner se saamne wali side ke midpoint tak. Altitude: corner se saamne wali side par 90°. Har triangle mein 3 + 3.',
  'Median: from a corner to the midpoint of the opposite side. Altitude: from a corner, meeting the opposite side at 90°. Every triangle has 3 of each.',
  'माध्यिका: कोने से सामने वाली भुजा के मध्य-बिंदु तक। शीर्षलंब: कोने से सामने वाली भुजा पर 90°। हर त्रिभुज में 3 + 3।',
);
const intro = step('intro', 'intro', 3, ['Ye triangle ABC hai.', 'Here is triangle ABC.', 'यह त्रिभुज ABC है।']);

export function solution(id: string, p: Params): SolutionScript {
  switch (id) {
    case 'altitude-from-area': {
      const A = triangleArea(p.b!, p.h!);
      return {
        steps: [
          intro,
          step('altitude', 'altitude', 4.5, [
            'Altitude AD: A se seedhi BC par, 90° banate hue. Yahi triangle ki height (h) hai.',
            'Altitude AD: straight down from A to BC, at 90°. This is the height (h) of the triangle.',
            'शीर्षलंब AD: A से सीधे BC पर, 90° बनाते हुए। यही त्रिभुज की ऊँचाई (h) है।',
          ]),
          step(
            'solve',
            'altitude',
            5,
            [
              `Area = ½ × ${p.b} × h = ${A}, to h = 2 × ${A} ÷ ${p.b} = ${p.h} cm.`,
              `Area = ½ × ${p.b} × h = ${A}, so h = 2 × ${A} ÷ ${p.b} = ${p.h} cm.`,
              `क्षेत्रफल = ½ × ${p.b} × h = ${A}, तो h = 2 × ${A} ÷ ${p.b} = ${p.h} cm।`,
            ],
            `h = \\dfrac{2 \\times ${A}}{${p.b}} = ${p.h}${CM}`,
          ),
        ],
        remember,
        mistake: tx('h = area ÷ base kar dena; ½ ki wajah se 2 se guna karna padta hai.', 'Doing h = area ÷ base; the ½ means you must multiply by 2.', 'h = क्षेत्रफल ÷ आधार कर देना; ½ की वजह से 2 से गुणा करना पड़ता है।'),
      };
    }
    case 'counts':
      return {
        steps: [
          intro,
          step('median', 'median', 4, [
            'A se BC ke midpoint M tak pehli median.',
            'The first median, from A to the midpoint M of BC.',
            'A से BC के मध्य-बिंदु M तक पहली माध्यिका।',
          ]),
          step(
            'medians',
            'medians',
            5,
            [
              'B aur C se bhi median. Teeno ek point G par milti hain. Altitudes bhi teen hoti hain.',
              'One more from B and one from C. All three meet at one point, G. There are 3 altitudes too.',
              'B और C से भी माध्यिका। तीनों एक बिंदु G पर मिलती हैं। शीर्षलंब भी तीन होते हैं।',
            ],
            `3\\ \\text{medians},\\ 3\\ \\text{altitudes}`,
            [
              'Har corner ke saamne ek side hai, aur har corner se us side tak ek median aur ek altitude.',
              'Each corner faces one side, and from each corner there is one median and one altitude to that side.',
              'हर कोने के सामने एक भुजा है, और हर कोने से उस भुजा तक एक माध्यिका और एक शीर्षलंब।',
            ],
          ),
        ],
        remember,
        mistake: tx('Sirf ek median samajhna.', 'Thinking a triangle has only one median.', 'त्रिभुज में सिर्फ़ एक माध्यिका समझना।'),
      };
    case 'isosceles-median': {
      const w = p.w!;
      const am = missingLeg(5, w / 2);
      return {
        steps: [
          intro,
          step('median', 'median', 4.5, [
            `Median AM base ko aadha karti hai: BM = ${w / 2} cm.`,
            `The median AM halves the base: BM = ${w / 2} cm.`,
            `माध्यिका AM आधार को आधा करती है: BM = ${w / 2} cm।`,
          ]),
          step(
            'altitude',
            'altitude',
            4.5,
            [
              'Isosceles triangle mein apex se median hi altitude bhi hai: AM ⟂ BC.',
              'In an isosceles triangle, the median from the apex is also the altitude: AM ⟂ BC.',
              'समद्विबाहु त्रिभुज में शीर्ष से माध्यिका ही शीर्षलंब भी है: AM ⟂ BC।',
            ],
            undefined,
            [
              'Dono taraf ke triangles ek jaise hain, isliye M par dono angles 90° hain.',
              'The two halves are identical triangles, so both angles at M are 90°.',
              'दोनों तरफ़ के त्रिभुज एक जैसे हैं, इसलिए M पर दोनों कोण 90° हैं।',
            ],
          ),
          step(
            'solve',
            'altitude',
            5,
            [`Pythagoras: AM² = 5² − ${w / 2}² = ${25 - (w / 2) ** 2}, to AM = ${am} cm.`, `Pythagoras: AM² = 5² − ${w / 2}² = ${25 - (w / 2) ** 2}, so AM = ${am} cm.`, `पाइथागोरस: AM² = 5² − ${w / 2}² = ${25 - (w / 2) ** 2}, तो AM = ${am} cm।`],
            `AM = \\sqrt{5^2 - ${w / 2}^2} = ${am}${CM}`,
          ),
        ],
        remember,
        mistake: tx('Poori base ko BM maan lena.', 'Taking the whole base as BM.', 'पूरे आधार को BM मान लेना।'),
      };
    }
    default: {
      const m = p.m!;
      return {
        steps: [
          intro,
          step(
            'median',
            'median',
            5,
            [
              `Median AM, BC ko do barabar hisson mein baantti hai. BC = ${2 * m}, to BM = MC = ${m} cm.`,
              `The median AM splits BC into two equal parts. BC = ${2 * m}, so BM = MC = ${m} cm.`,
              `माध्यिका AM, BC को दो बराबर हिस्सों में बाँटती है। BC = ${2 * m}, तो BM = MC = ${m} cm।`,
            ],
            `BM = \\dfrac{BC}{2} = ${m}${CM}`,
          ),
        ],
        remember,
        mistake: tx('Median ko altitude samajh lena: median 90° par nahi milti (aam taur par).', 'Mixing up median and altitude: a median usually does not meet the side at 90°.', 'माध्यिका को शीर्षलंब समझ लेना: माध्यिका (आम तौर पर) 90° पर नहीं मिलती।'),
      };
    }
  }
}
