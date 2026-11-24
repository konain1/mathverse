import { pathAreaInside, pathAreaOutside, rectangleArea, rectanglePerimeter, tilesToCover } from '@/lib/geometry/formulas';
import { tx, type Params, type SolutionScript } from '@/topics/contract';
import { CM2, intro, perimeterWalk, step } from '@/topics/shared/flat/steps';

const remember = tx(
  'Kinare wali cheez (ribbon, fence) → perimeter. Dhakne wali cheez (tiles, paint) → area. Frame/rasta = bada area − chhota area.',
  'Things along the edge (ribbon, fence) → perimeter. Things that cover (tiles, paint) → area. Frame/path = big area − small area.',
  'किनारे वाली चीज़ (रिबन, बाड़) → परिमाप। ढकने वाली चीज़ (टाइलें, रंग) → क्षेत्रफल। फ़्रेम/रास्ता = बड़ा क्षेत्रफल − छोटा क्षेत्रफल।',
);

export function solution(id: string, p: Params): SolutionScript {
  switch (id) {
    case 'tiles': {
      const t = p.t!;
      const l = t * p.i!;
      const b = t * p.j!;
      const n = tilesToCover(l, b, t);
      return {
        steps: [
          intro(l, b),
          step(
            'fit',
            'tile-all',
            5.5,
            [
              `Length mein ${l} ÷ ${t} = ${p.i} tiles, breadth mein ${b} ÷ ${t} = ${p.j} tiles. Kul ${p.i} × ${p.j} = ${n} tiles.`,
              `${l} ÷ ${t} = ${p.i} tiles along the length, ${b} ÷ ${t} = ${p.j} along the breadth. ${p.i} × ${p.j} = ${n} tiles in all.`,
              `लंबाई में ${l} ÷ ${t} = ${p.i} टाइलें, चौड़ाई में ${b} ÷ ${t} = ${p.j} टाइलें। कुल ${p.i} × ${p.j} = ${n} टाइलें।`,
            ],
            `\\dfrac{${l}}{${t}} \\times \\dfrac{${b}}{${t}} = ${p.i} \\times ${p.j} = ${n}`,
          ),
          step(
            'check',
            'area',
            4.5,
            [
              `Area se check: tray ${rectangleArea(l, b)} cm², ek tile ${t * t} cm². ${rectangleArea(l, b)} ÷ ${t * t} = ${n}.`,
              `Check with areas: tray ${rectangleArea(l, b)} cm², one tile ${t * t} cm². ${rectangleArea(l, b)} ÷ ${t * t} = ${n}.`,
              `क्षेत्रफल से जाँचो: ट्रे ${rectangleArea(l, b)} cm², एक टाइल ${t * t} cm²। ${rectangleArea(l, b)} ÷ ${t * t} = ${n}।`,
            ],
            `\\dfrac{${rectangleArea(l, b)}}{${t * t}} = ${n}`,
            [
              'Tiles poori jagah dhakti hain, isliye area ka hisaab lagta hai.',
              'Tiles cover the whole surface, so it is an area calculation.',
              'टाइलें पूरी जगह ढकती हैं, इसलिए क्षेत्रफल का हिसाब लगता है।',
            ],
          ),
        ],
        remember,
        mistake: tx('Area ko tile ki side se divide kar dena.', "Dividing the area by the tile's side.", 'क्षेत्रफल को टाइल की भुजा से भाग देना।'),
      };
    }
    case 'frame': {
      const { l, b, w } = p as { l: number; b: number; w: number };
      const L = l + 2 * w;
      const B = b + 2 * w;
      const F = pathAreaOutside(l, b, w);
      return {
        steps: [
          step('intro', 'intro', 4, [
            `Photo ${l} × ${b} hai. Frame har taraf ${w} cm, to bahar ka size (${l} + 2×${w}) × (${b} + 2×${w}) = ${L} × ${B}.`,
            `The photo is ${l} × ${b}. The frame adds ${w} cm on every side, so the outside is (${l} + 2×${w}) × (${b} + 2×${w}) = ${L} × ${B}.`,
            `फ़ोटो ${l} × ${b} है। फ़्रेम हर तरफ़ ${w} cm, तो बाहरी आकार (${l} + 2×${w}) × (${b} + 2×${w}) = ${L} × ${B}।`,
          ], `${L} \\times ${B}`),
          step(
            'subtract',
            'frame-subtract',
            5.5,
            [
              `Tareeka 1: bada area − photo = ${L * B} − ${l * b} = ${F} cm².`,
              `Method 1: big area − photo = ${L * B} − ${l * b} = ${F} cm².`,
              `तरीका 1: बड़ा क्षेत्रफल − फ़ोटो = ${L * B} − ${l * b} = ${F} cm²।`,
            ],
            `${L} \\times ${B} - ${l} \\times ${b} = ${F}${CM2}`,
          ),
          step(
            'strips',
            'frame',
            6,
            [
              `Tareeka 2 (check): upar-neeche ki 2 patti ${L} × ${w}, aur side ki 2 patti ${w} × ${b}: ${2 * L * w} + ${2 * w * b} = ${F} cm². Dono same!`,
              `Method 2 (check): 2 strips of ${L} × ${w} top and bottom, and 2 of ${w} × ${b} at the sides: ${2 * L * w} + ${2 * w * b} = ${F} cm². Both match!`,
              `तरीका 2 (जाँच): ऊपर-नीचे की 2 पट्टियाँ ${L} × ${w}, और बगल की 2 पट्टियाँ ${w} × ${b}: ${2 * L * w} + ${2 * w * b} = ${F} cm²। दोनों बराबर!`,
            ],
            `2(${L} \\times ${w}) + 2(${w} \\times ${b}) = ${F}${CM2}`,
            [
              'Patti tod ke jodne se kone do baar nahi gine jaate, isliye ye perimeter × chaudai se alag aata hai.',
              "Splitting into strips doesn't count the corners twice, which is why it differs from perimeter × width.",
              'पट्टियाँ तोड़कर जोड़ने से कोने दो बार नहीं गिने जाते, इसलिए यह परिमाप × चौड़ाई से अलग आता है।',
            ],
          ),
        ],
        remember,
        mistake: tx('Bahar ke size mein sirf ek baar w jodna. Frame dono taraf hai: 2w.', 'Adding w only once to the outside size. The frame is on both sides: 2w.', 'बाहरी आकार में सिर्फ़ एक बार w जोड़ना। फ़्रेम दोनों तरफ़ है: 2w।'),
      };
    }
    case 'inner-path': {
      const { L, B, w } = p as { L: number; B: number; w: number };
      const l = L - 2 * w;
      const b = B - 2 * w;
      const P = pathAreaInside(L, B, w);
      return {
        steps: [
          step('intro', 'intro', 4, [
            `Lawn ${L} × ${B} hai. Rasta andar har taraf ${w} cm, to bacha lawn (${L} − 2×${w}) × (${B} − 2×${w}) = ${l} × ${b}.`,
            `The lawn is ${L} × ${B}. The path takes ${w} cm from every side, so the lawn left is (${L} − 2×${w}) × (${B} − 2×${w}) = ${l} × ${b}.`,
            `लॉन ${L} × ${B} है। रास्ता अंदर हर तरफ़ ${w} cm, तो बचा लॉन (${L} − 2×${w}) × (${B} − 2×${w}) = ${l} × ${b}।`,
          ], `${l} \\times ${b} = ${l * b}${CM2}`),
          step(
            'subtract',
            'frame-subtract',
            5.5,
            [`Rasta = poora lawn − bacha lawn = ${L * B} − ${l * b} = ${P} cm².`, `Path = whole lawn − lawn left = ${L * B} − ${l * b} = ${P} cm².`, `रास्ता = पूरा लॉन − बचा लॉन = ${L * B} − ${l * b} = ${P} cm²।`],
            `${L} \\times ${B} - ${l} \\times ${b} = ${P}${CM2}`,
          ),
          step(
            'strips',
            'frame',
            6,
            [
              `Check: 2 patti ${L} × ${w} aur 2 patti ${w} × ${b}: ${2 * L * w} + ${2 * w * b} = ${P} cm².`,
              `Check: 2 strips of ${L} × ${w} and 2 of ${w} × ${b}: ${2 * L * w} + ${2 * w * b} = ${P} cm².`,
              `जाँच: 2 पट्टियाँ ${L} × ${w} और 2 पट्टियाँ ${w} × ${b}: ${2 * L * w} + ${2 * w * b} = ${P} cm²।`,
            ],
            `2(${L} \\times ${w}) + 2(${w} \\times ${b}) = ${P}${CM2}`,
          ),
        ],
        remember,
        mistake: tx('Andar wale rectangle ke liye har side se sirf w ghatana; 2w ghatao.', 'Taking only w off each side for the inner rectangle; take 2w.', 'अंदर वाले आयत के लिए हर तरफ़ से सिर्फ़ w घटाना; 2w घटाओ।'),
      };
    }
    default: {
      const { l, b, r } = p as { l: number; b: number; r: number };
      const P = rectanglePerimeter(l, b);
      return {
        steps: [
          intro(l, b),
          perimeterWalk(l, b),
          step(
            'cost',
            'perimeter',
            4.5,
            [`Kharcha = ${P} cm × ₹${r} = ₹${P * r}.`, `Cost = ${P} cm × ₹${r} = ₹${P * r}.`, `ख़र्च = ${P} cm × ₹${r} = ₹${P * r}।`],
            `\\text{Cost} = ${P} \\times ${r} = \\text{₹}\\,${P * r}`,
          ),
        ],
        remember,
        mistake: tx('Ribbon ke liye area lena. Ribbon sirf kinare par lagta hai.', 'Using the area for the ribbon. Ribbon only goes along the edge.', 'रिबन के लिए क्षेत्रफल लेना। रिबन सिर्फ़ किनारे पर लगता है।'),
      };
    }
  }
}
