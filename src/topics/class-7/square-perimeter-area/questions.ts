import { squareArea, squarePerimeter } from '@/lib/geometry/formulas';
import { randInt } from '@/lib/random';
import { defineQuestion, tx, type QuestionTemplate } from '@/topics/contract';

const SIDE = tx('Side (a)', 'Side (a)', 'भुजा (a)');
const PER = tx('Perimeter', 'Perimeter', 'परिमाप');
const AREA = tx('Area', 'Area', 'क्षेत्रफल');

export const questions: QuestionTemplate[] = [
  defineQuestion({
    id: 'perimeter',
    level: 'basic',
    params: { a: 5 },
    generate: (rng) => ({ a: randInt(rng, 2, 10) }),
    prompt: ({ a }) =>
      tx(
        `Ek square ki side ${a} cm hai. Uska perimeter nikalo.`,
        `A square has a side of ${a} cm. Find its perimeter.`,
        `एक वर्ग की भुजा ${a} cm है। उसका परिमाप निकालो।`,
      ),
    given: ({ a }) => [{ label: SIDE, value: a, unit: 'cm' }],
    find: () => [PER],
    answers: ({ a }) => [{ id: 'p', label: PER, value: squarePerimeter(a), unit: 'cm' }],
    mistakes: ({ a }) => [
      {
        answerId: 'p',
        value: squareArea(a),
        message: tx(
          `Ye area hai (${a} × ${a}). Perimeter mein chaaron sides jodte hain.`,
          `That's the area (${a} × ${a}). Perimeter adds up all four sides.`,
          `यह क्षेत्रफल है (${a} × ${a})। परिमाप में चारों भुजाएँ जोड़ते हैं।`,
        ),
      },
      {
        answerId: 'p',
        value: 2 * a,
        message: tx(
          'Tumne sirf do sides jodi. Square ki chaar sides hoti hain.',
          'You added only two sides. A square has four.',
          'तुमने सिर्फ़ दो भुजाएँ जोड़ीं। वर्ग की चार भुजाएँ होती हैं।',
        ),
      },
    ],
  }),
  defineQuestion({
    id: 'area',
    level: 'medium',
    params: { a: 6 },
    generate: (rng) => ({ a: randInt(rng, 2, 10) }),
    prompt: ({ a }) =>
      tx(
        `Ek square tile ki side ${a} cm hai. Uska area kitna hai?`,
        `A square tile has a side of ${a} cm. What is its area?`,
        `एक वर्गाकार टाइल की भुजा ${a} cm है। उसका क्षेत्रफल कितना है?`,
      ),
    given: ({ a }) => [{ label: SIDE, value: a, unit: 'cm' }],
    find: () => [AREA],
    answers: ({ a }) => [{ id: 'area', label: AREA, value: squareArea(a), unit: 'cm2' }],
    mistakes: ({ a }) => [
      {
        answerId: 'area',
        value: squarePerimeter(a),
        message: tx(
          'Ye perimeter hai (chaaron sides ka jod). Area = side × side, cm² mein.',
          "That's the perimeter (all four sides added). Area = side × side, in cm².",
          'यह परिमाप है (चारों भुजाओं का योग)। क्षेत्रफल = भुजा × भुजा, cm² में।',
        ),
      },
      {
        answerId: 'area',
        value: 2 * a,
        message: tx(`${a} × 2 nahi, ${a} × ${a}.`, `Not ${a} × 2, but ${a} × ${a}.`, `${a} × 2 नहीं, ${a} × ${a}।`),
      },
    ],
  }),
  defineQuestion({
    id: 'side-from-perimeter',
    level: 'hard',
    params: { a: 7 },
    generate: (rng) => ({ a: randInt(rng, 2, 10) }),
    prompt: ({ a }) =>
      tx(
        `Ek square ka perimeter ${squarePerimeter(a)} cm hai. Uski side aur area nikalo.`,
        `The perimeter of a square is ${squarePerimeter(a)} cm. Find its side and its area.`,
        `एक वर्ग का परिमाप ${squarePerimeter(a)} cm है। उसकी भुजा और क्षेत्रफल निकालो।`,
      ),
    given: ({ a }) => [{ label: PER, value: squarePerimeter(a), unit: 'cm' }],
    find: () => [SIDE, AREA],
    answers: ({ a }) => [
      { id: 'side', label: SIDE, value: squarePerimeter(a) / 4, unit: 'cm' },
      { id: 'area', label: AREA, value: squareArea(squarePerimeter(a) / 4), unit: 'cm2' },
    ],
    mistakes: ({ a }) => [
      {
        answerId: 'side',
        value: squarePerimeter(a) / 2,
        message: tx(
          'Square ki chaar barabar sides hain, isliye perimeter ÷ 4.',
          'A square has four equal sides, so divide the perimeter by 4.',
          'वर्ग की चार बराबर भुजाएँ हैं, इसलिए परिमाप ÷ 4।',
        ),
      },
      {
        answerId: 'area',
        value: squarePerimeter(a),
        message: tx(
          'Ye perimeter hi hai. Pehle side nikalo, phir side × side.',
          'That is still the perimeter. Find the side first, then side × side.',
          'यह परिमाप ही है। पहले भुजा निकालो, फिर भुजा × भुजा।',
        ),
      },
    ],
  }),
  defineQuestion({
    id: 'lace-cost',
    level: 'challenge',
    params: { a: 8, r: 3 },
    generate: (rng) => ({ a: randInt(rng, 3, 10), r: randInt(rng, 2, 6) }),
    prompt: ({ a, r }) =>
      tx(
        `Ek square rumaal ki side ${a} cm hai. Uske chaaron kinaron par lace lagani hai, jo ₹${r} per cm milti hai. Kitni lace lagegi aur kitna kharcha hoga?`,
        `A square handkerchief has a side of ${a} cm. Lace is to be sewn along all four edges, at ₹${r} per cm. How much lace is needed and what will it cost?`,
        `एक वर्गाकार रूमाल की भुजा ${a} cm है। उसके चारों किनारों पर लेस लगानी है, जो ₹${r} प्रति cm मिलती है। कितनी लेस लगेगी और कितना ख़र्च होगा?`,
      ),
    given: ({ a, r }) => [
      { label: SIDE, value: a, unit: 'cm' },
      { label: tx('Lace ka rate (per cm)', 'Lace rate (per cm)', 'लेस की दर (प्रति cm)'), value: r, unit: 'rupees' },
    ],
    find: () => [tx('Lace ki length', 'Length of lace', 'लेस की लंबाई'), tx('Kharcha', 'Cost', 'ख़र्च')],
    answers: ({ a, r }) => [
      { id: 'lace', label: tx('Lace', 'Lace', 'लेस'), value: squarePerimeter(a), unit: 'cm' },
      { id: 'cost', label: tx('Kharcha', 'Cost', 'ख़र्च'), value: squarePerimeter(a) * r, unit: 'rupees' },
    ],
    mistakes: ({ a, r }) => [
      {
        answerId: 'cost',
        value: squareArea(a) * r,
        message: tx(
          'Lace sirf kinare par lagti hai, poore kapde par nahi. Perimeter se guna karo, area se nahi.',
          'Lace goes only along the edge, not over the whole cloth. Multiply the perimeter, not the area.',
          'लेस सिर्फ़ किनारे पर लगती है, पूरे कपड़े पर नहीं। परिमाप से गुणा करो, क्षेत्रफल से नहीं।',
        ),
      },
      {
        answerId: 'cost',
        value: a * r,
        message: tx('Ye sirf ek kinara hai. Chaaron kinare chahiye.', "That's just one edge. You need all four.", 'यह सिर्फ़ एक किनारा है। चारों किनारे चाहिए।'),
      },
      {
        answerId: 'lace',
        value: squareArea(a),
        message: tx('Lace ek length hai: chaaron sides jodo.', 'Lace is a length: add the four sides.', 'लेस एक लंबाई है: चारों भुजाएँ जोड़ो।'),
      },
    ],
  }),
];
