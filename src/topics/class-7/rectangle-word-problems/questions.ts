import { pathAreaInside, pathAreaOutside, rectangleArea, rectanglePerimeter, tilesToCover } from '@/lib/geometry/formulas';
import { pick, randInt } from '@/lib/random';
import { defineQuestion, tx, type QuestionTemplate } from '@/topics/contract';
import { randRect } from '@/topics/shared/flat/params';

const LEN = tx('Length', 'Length', 'लंबाई');
const BR = tx('Breadth', 'Breadth', 'चौड़ाई');

export const questions: QuestionTemplate[] = [
  defineQuestion({
    id: 'ribbon',
    level: 'basic',
    params: { l: 9, b: 6, r: 2 },
    generate: (rng) => ({ ...randRect(rng), r: randInt(rng, 2, 5) }),
    prompt: ({ l, b, r }) =>
      tx(
        `${l} cm × ${b} cm ke greeting card ke chaaron taraf ribbon lagana hai. Ribbon ₹${r} per cm hai. Kitna ribbon lagega aur kharcha kitna?`,
        `Ribbon is to go all around a ${l} cm × ${b} cm greeting card. Ribbon costs ₹${r} per cm. How much ribbon is needed, and what does it cost?`,
        `${l} cm × ${b} cm के ग्रीटिंग कार्ड के चारों ओर रिबन लगाना है। रिबन ₹${r} प्रति cm है। कितना रिबन लगेगा और ख़र्च कितना?`,
      ),
    given: ({ l, b, r }) => [
      { label: LEN, value: l, unit: 'cm' },
      { label: BR, value: b, unit: 'cm' },
      { label: tx('Ribbon ka rate (per cm)', 'Ribbon rate (per cm)', 'रिबन की दर (प्रति cm)'), value: r, unit: 'rupees' },
    ],
    find: () => [tx('Ribbon ki length', 'Length of ribbon', 'रिबन की लंबाई'), tx('Kharcha', 'Cost', 'ख़र्च')],
    answers: ({ l, b, r }) => [
      { id: 'ribbon', label: tx('Ribbon', 'Ribbon', 'रिबन'), value: rectanglePerimeter(l, b), unit: 'cm' },
      { id: 'cost', label: tx('Kharcha', 'Cost', 'ख़र्च'), value: rectanglePerimeter(l, b) * r, unit: 'rupees' },
    ],
    mistakes: ({ l, b, r }) => [
      {
        answerId: 'cost',
        value: rectangleArea(l, b) * r,
        message: tx('Ribbon kinare par lagta hai: perimeter × rate, area × rate nahi.', 'Ribbon goes along the edge: perimeter × rate, not area × rate.', 'रिबन किनारे पर लगता है: परिमाप × दर, क्षेत्रफल × दर नहीं।'),
      },
      {
        answerId: 'ribbon',
        value: l + b,
        message: tx('Ye aadha chakkar hai. Chaaron taraf: 2(l + b).', "That's half way round. All the way: 2(l + b).", 'यह आधा चक्कर है। चारों ओर: 2(l + b)।'),
      },
    ],
  }),
  defineQuestion({
    id: 'tiles',
    level: 'medium',
    params: { t: 2, i: 5, j: 3 },
    generate: (rng) => {
      const t = pick(rng, [2, 3]);
      const max = Math.floor(10 / t);
      const i = randInt(rng, 2, max);
      return { t, i, j: randInt(rng, 1, i) };
    },
    prompt: ({ t, i, j }) =>
      tx(
        `${t * i} cm × ${t * j} cm ki ek tray mein ${t} cm × ${t} cm ki square tiles lagani hain. Kitni tiles lagengi?`,
        `A ${t * i} cm × ${t * j} cm tray is to be covered with ${t} cm × ${t} cm square tiles. How many tiles are needed?`,
        `${t * i} cm × ${t * j} cm की एक ट्रे में ${t} cm × ${t} cm की वर्गाकार टाइलें लगानी हैं। कितनी टाइलें लगेंगी?`,
      ),
    given: ({ t, i, j }) => [
      { label: LEN, value: t * i, unit: 'cm' },
      { label: BR, value: t * j, unit: 'cm' },
      { label: tx('Tile ki side', 'Tile side', 'टाइल की भुजा'), value: t, unit: 'cm' },
    ],
    find: () => [tx('Tiles', 'Tiles', 'टाइलें')],
    answers: ({ t, i, j }) => [{ id: 'n', label: tx('Tiles', 'Tiles', 'टाइलें'), value: tilesToCover(t * i, t * j, t), unit: 'tiles' }],
    mistakes: ({ t, i, j }) => [
      {
        answerId: 'n',
        value: rectangleArea(t * i, t * j) / t,
        message: tx(
          `Tile ki side (${t}) se nahi, tile ke area (${t * t} cm²) se divide karo.`,
          `Divide by the tile's area (${t * t} cm²), not its side (${t}).`,
          `टाइल की भुजा (${t}) से नहीं, टाइल के क्षेत्रफल (${t * t} cm²) से भाग दो।`,
        ),
      },
      {
        answerId: 'n',
        value: rectangleArea(t * i, t * j),
        message: tx('Ye tray ka area hai (cm²). Har tile kitni jagah leti hai, us se baanto.', "That's the tray's area (cm²). Divide by the space one tile takes.", 'यह ट्रे का क्षेत्रफल है (cm²)। हर टाइल कितनी जगह लेती है, उससे भाग दो।'),
      },
    ],
  }),
  defineQuestion({
    id: 'frame',
    level: 'hard',
    params: { l: 6, b: 4, w: 1 },
    generate: (rng) => {
      const w = pick(rng, [1, 2]);
      return { ...randRect(rng, 10 - 2 * w), w };
    },
    prompt: ({ l, b, w }) =>
      tx(
        `${l} cm × ${b} cm ki photo ke chaaron taraf ${w} cm chauda frame hai. Frame ka area kitna hai?`,
        `A ${l} cm × ${b} cm photo has a frame ${w} cm wide all around it. What is the area of the frame?`,
        `${l} cm × ${b} cm की फ़ोटो के चारों ओर ${w} cm चौड़ा फ़्रेम है। फ़्रेम का क्षेत्रफल कितना है?`,
      ),
    given: ({ l, b, w }) => [
      { label: tx('Photo ki length', 'Photo length', 'फ़ोटो की लंबाई'), value: l, unit: 'cm' },
      { label: tx('Photo ki breadth', 'Photo breadth', 'फ़ोटो की चौड़ाई'), value: b, unit: 'cm' },
      { label: tx('Frame ki chaudai', 'Frame width', 'फ़्रेम की चौड़ाई'), value: w, unit: 'cm' },
    ],
    find: () => [tx('Frame ka area', 'Area of the frame', 'फ़्रेम का क्षेत्रफल')],
    answers: ({ l, b, w }) => [{ id: 'frame', label: tx('Frame', 'Frame', 'फ़्रेम'), value: pathAreaOutside(l, b, w), unit: 'cm2' }],
    mistakes: ({ l, b, w }) => [
      {
        answerId: 'frame',
        value: rectangleArea(l + 2 * w, b + 2 * w),
        message: tx('Ye photo + frame dono ka area hai. Andar ki photo ka area ghatao.', "That's photo and frame together. Subtract the photo's area.", 'यह फ़ोटो + फ़्रेम दोनों का क्षेत्रफल है। अंदर की फ़ोटो का क्षेत्रफल घटाओ।'),
      },
      {
        answerId: 'frame',
        value: rectanglePerimeter(l, b) * w,
        message: tx(
          'Perimeter × chaudai mein chaaron kone ke chhote squares chhoot jaate hain.',
          'Perimeter × width misses the four little corner squares.',
          'परिमाप × चौड़ाई में चारों कोनों के छोटे वर्ग छूट जाते हैं।',
        ),
      },
      {
        answerId: 'frame',
        value: rectangleArea(l + w, b + w) - rectangleArea(l, b),
        message: tx(`Frame dono taraf hai: length mein 2 × ${w} judega, ${w} nahi.`, `The frame is on both sides: add 2 × ${w} to the length, not ${w}.`, `फ़्रेम दोनों तरफ़ है: लंबाई में 2 × ${w} जुड़ेगा, ${w} नहीं।`),
      },
    ],
  }),
  defineQuestion({
    id: 'inner-path',
    level: 'challenge',
    params: { L: 10, B: 8, w: 2 },
    generate: (rng) => {
      const w = pick(rng, [1, 2]);
      const L = randInt(rng, 2 * w + 3, 10);
      return { L, B: randInt(rng, 2 * w + 2, L - 1), w };
    },
    prompt: ({ L, B, w }) =>
      tx(
        `${L} cm × ${B} cm ke lawn model ke andar, kinare ke saath-saath chaaron taraf ${w} cm chauda rasta hai. Raste ka area aur bacha hua lawn kitna hai?`,
        `Inside a ${L} cm × ${B} cm lawn model, a path ${w} cm wide runs along all four edges. Find the area of the path and of the lawn that is left.`,
        `${L} cm × ${B} cm के लॉन मॉडल के अंदर, किनारे के साथ-साथ चारों ओर ${w} cm चौड़ा रास्ता है। रास्ते का क्षेत्रफल और बचा हुआ लॉन कितना है?`,
      ),
    given: ({ L, B, w }) => [
      { label: LEN, value: L, unit: 'cm' },
      { label: BR, value: B, unit: 'cm' },
      { label: tx('Raste ki chaudai', 'Path width', 'रास्ते की चौड़ाई'), value: w, unit: 'cm' },
    ],
    find: () => [tx('Raste ka area', 'Area of the path', 'रास्ते का क्षेत्रफल'), tx('Bacha lawn', 'Lawn left', 'बचा लॉन')],
    answers: ({ L, B, w }) => [
      { id: 'path', label: tx('Rasta', 'Path', 'रास्ता'), value: pathAreaInside(L, B, w), unit: 'cm2' },
      { id: 'lawn', label: tx('Bacha lawn', 'Lawn left', 'बचा लॉन'), value: rectangleArea(L - 2 * w, B - 2 * w), unit: 'cm2' },
    ],
    mistakes: ({ L, B, w }) => [
      {
        answerId: 'lawn',
        value: rectangleArea(L - w, B - w),
        message: tx(`Rasta dono taraf hai: har dimension se 2 × ${w} ghatao.`, `The path is on both sides: take 2 × ${w} off each dimension.`, `रास्ता दोनों तरफ़ है: हर विमा से 2 × ${w} घटाओ।`),
      },
      {
        answerId: 'path',
        value: rectanglePerimeter(L, B) * w,
        message: tx('Perimeter × chaudai mein chaaron kone do baar gine jaate hain.', 'Perimeter × width counts the four corners twice.', 'परिमाप × चौड़ाई में चारों कोने दो बार गिने जाते हैं।'),
      },
    ],
  }),
];
