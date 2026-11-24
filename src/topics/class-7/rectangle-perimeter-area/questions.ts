import { rectangleArea, rectanglePerimeter } from '@/lib/geometry/formulas';
import { randInt } from '@/lib/random';
import { defineQuestion, tx, type QuestionTemplate } from '@/topics/contract';
import { randRect } from '@/topics/shared/flat/params';

const LEN = tx('Length (l)', 'Length (l)', 'लंबाई (l)');
const BR = tx('Breadth (b)', 'Breadth (b)', 'चौड़ाई (b)');
const PER = tx('Perimeter', 'Perimeter', 'परिमाप');
const AREA = tx('Area', 'Area', 'क्षेत्रफल');

export const questions: QuestionTemplate[] = [
  defineQuestion({
    id: 'perimeter',
    level: 'basic',
    params: { l: 7, b: 4 },
    generate: (rng) => randRect(rng),
    prompt: ({ l, b }) =>
      tx(
        `Ek rectangle ki length ${l} cm aur breadth ${b} cm hai. Uska perimeter nikalo.`,
        `A rectangle is ${l} cm long and ${b} cm wide. Find its perimeter.`,
        `एक आयत की लंबाई ${l} cm और चौड़ाई ${b} cm है। उसका परिमाप निकालो।`,
      ),
    given: ({ l, b }) => [
      { label: LEN, value: l, unit: 'cm' },
      { label: BR, value: b, unit: 'cm' },
    ],
    find: () => [PER],
    answers: ({ l, b }) => [{ id: 'p', label: PER, value: rectanglePerimeter(l, b), unit: 'cm' }],
    mistakes: ({ l, b }) => [
      {
        answerId: 'p',
        value: l + b,
        message: tx(
          `${l} + ${b} sirf aadha chakkar hai. Chaaron sides: 2 × (${l} + ${b}).`,
          `${l} + ${b} is only half the way round. All four sides: 2 × (${l} + ${b}).`,
          `${l} + ${b} सिर्फ़ आधा चक्कर है। चारों भुजाएँ: 2 × (${l} + ${b})।`,
        ),
      },
      {
        answerId: 'p',
        value: rectangleArea(l, b),
        message: tx('Ye area hai (l × b). Perimeter mein sides jodte hain.', "That's the area (l × b). Perimeter adds the sides.", 'यह क्षेत्रफल है (l × b)। परिमाप में भुजाएँ जोड़ते हैं।'),
      },
      {
        answerId: 'p',
        value: 2 * l + b,
        message: tx('Ek side chhoot gayi. Do lengths aur do breadths jodo.', 'One side is missing. Add two lengths and two breadths.', 'एक भुजा छूट गई। दो लंबाइयाँ और दो चौड़ाइयाँ जोड़ो।'),
      },
    ],
  }),
  defineQuestion({
    id: 'area',
    level: 'medium',
    params: { l: 8, b: 5 },
    generate: (rng) => randRect(rng),
    prompt: ({ l, b }) =>
      tx(
        `Ek ${l} cm × ${b} cm ke rectangle shaped card ka area kitna hai?`,
        `What is the area of a ${l} cm × ${b} cm rectangular card?`,
        `${l} cm × ${b} cm के एक आयताकार कार्ड का क्षेत्रफल कितना है?`,
      ),
    given: ({ l, b }) => [
      { label: LEN, value: l, unit: 'cm' },
      { label: BR, value: b, unit: 'cm' },
    ],
    find: () => [AREA],
    answers: ({ l, b }) => [{ id: 'area', label: AREA, value: rectangleArea(l, b), unit: 'cm2' }],
    mistakes: ({ l, b }) => [
      {
        answerId: 'area',
        value: rectanglePerimeter(l, b),
        message: tx('Ye perimeter hai. Area = length × breadth, cm² mein.', "That's the perimeter. Area = length × breadth, in cm².", 'यह परिमाप है। क्षेत्रफल = लंबाई × चौड़ाई, cm² में।'),
      },
      {
        answerId: 'area',
        value: l + b,
        message: tx('Area mein guna hota hai, jod nahi.', 'Area multiplies; it doesn’t add.', 'क्षेत्रफल में गुणा होता है, जोड़ नहीं।'),
      },
    ],
  }),
  defineQuestion({
    id: 'breadth-from-area',
    level: 'hard',
    params: { l: 9, b: 4 },
    generate: (rng) => randRect(rng),
    prompt: ({ l, b }) =>
      tx(
        `Ek rectangle ka area ${rectangleArea(l, b)} cm² aur length ${l} cm hai. Breadth aur perimeter nikalo.`,
        `A rectangle has an area of ${rectangleArea(l, b)} cm² and a length of ${l} cm. Find its breadth and perimeter.`,
        `एक आयत का क्षेत्रफल ${rectangleArea(l, b)} cm² और लंबाई ${l} cm है। चौड़ाई और परिमाप निकालो।`,
      ),
    given: ({ l, b }) => [
      { label: AREA, value: rectangleArea(l, b), unit: 'cm2' },
      { label: LEN, value: l, unit: 'cm' },
    ],
    find: () => [BR, PER],
    answers: ({ l, b }) => {
      const breadth = rectangleArea(l, b) / l;
      return [
        { id: 'b', label: BR, value: breadth, unit: 'cm' },
        { id: 'p', label: PER, value: rectanglePerimeter(l, breadth), unit: 'cm' },
      ];
    },
    mistakes: ({ l, b }) => [
      {
        answerId: 'b',
        value: rectangleArea(l, b) - l,
        message: tx('Area = l × b, isliye b = area ÷ l (minus nahi).', 'Area = l × b, so b = area ÷ l (not minus).', 'क्षेत्रफल = l × b, इसलिए b = क्षेत्रफल ÷ l (घटाना नहीं)।'),
      },
    ],
  }),
  defineQuestion({
    id: 'length-double',
    level: 'challenge',
    params: { b: 4 },
    generate: (rng) => ({ b: randInt(rng, 2, 5) }),
    prompt: ({ b }) =>
      tx(
        `Ek rectangle ki length uski breadth ki double hai. Perimeter ${rectanglePerimeter(2 * b, b)} cm hai. Length, breadth aur area nikalo.`,
        `A rectangle's length is double its breadth. Its perimeter is ${rectanglePerimeter(2 * b, b)} cm. Find the length, breadth and area.`,
        `एक आयत की लंबाई उसकी चौड़ाई की दुगुनी है। परिमाप ${rectanglePerimeter(2 * b, b)} cm है। लंबाई, चौड़ाई और क्षेत्रफल निकालो।`,
      ),
    given: ({ b }) => [{ label: PER, value: rectanglePerimeter(2 * b, b), unit: 'cm' }],
    find: () => [LEN, BR, AREA],
    answers: ({ b }) => {
      const breadth = rectanglePerimeter(2 * b, b) / 6;
      return [
        { id: 'l', label: LEN, value: 2 * breadth, unit: 'cm' },
        { id: 'b', label: BR, value: breadth, unit: 'cm' },
        { id: 'area', label: AREA, value: rectangleArea(2 * breadth, breadth), unit: 'cm2' },
      ];
    },
    mistakes: ({ b }) => [
      {
        answerId: 'b',
        value: rectanglePerimeter(2 * b, b) / 4,
        message: tx(
          'Ye square jaisa maan liya. l = 2b hai, to P = 2(2b + b) = 6b. Isliye b = P ÷ 6.',
          'That treats it like a square. l = 2b, so P = 2(2b + b) = 6b. So b = P ÷ 6.',
          'यह वर्ग जैसा मान लिया। l = 2b है, तो P = 2(2b + b) = 6b। इसलिए b = P ÷ 6।',
        ),
      },
    ],
  }),
];
