import { rectangleArea, rectanglePerimeter } from '@/lib/geometry/formulas';
import { tx, type Params, type SolutionScript } from '@/topics/contract';
import { CM, areaFormula, intro, oppositeSides, perimeterWalk, step, tileAll, tileRow } from '@/topics/shared/flat/steps';
import { dims } from './buildSteps';

const remember = tx(
  'Perimeter = 2(l + b), cm mein (kinara). Area = l × b, cm² mein (jagah).',
  'Perimeter = 2(l + b), in cm (the edge). Area = l × b, in cm² (the space).',
  'परिमाप = 2(l + b), cm में (किनारा)। क्षेत्रफल = l × b, cm² में (जगह)।',
);

export function solution(id: string, p: Params): SolutionScript {
  const { l, b } = dims(id, p);
  const P = rectanglePerimeter(l, b);
  const A = rectangleArea(l, b);
  switch (id) {
    case 'area':
      return {
        steps: [intro(l, b), tileRow(l), tileAll(l, b), areaFormula(l, b)],
        remember,
        mistake: tx('Area ki jagah 2(l + b) likhna.', 'Writing 2(l + b) for the area.', 'क्षेत्रफल की जगह 2(l + b) लिखना।'),
      };
    case 'breadth-from-area':
      return {
        steps: [
          step('given', 'grid', 4, [
            `${A} unit squares, aur har row mein ${l} squares (length).`,
            `${A} unit squares, with ${l} squares in each row (the length).`,
            `${A} इकाई वर्ग, और हर पंक्ति में ${l} वर्ग (लंबाई)।`,
          ], `l \\times b = ${A}`),
          step(
            'rows',
            'tile-all',
            4.5,
            [
              `Kitni rows? ${A} ÷ ${l} = ${b}. Yahi breadth hai: ${b} cm.`,
              `How many rows? ${A} ÷ ${l} = ${b}. That is the breadth: ${b} cm.`,
              `कितनी पंक्तियाँ? ${A} ÷ ${l} = ${b}। यही चौड़ाई है: ${b} cm।`,
            ],
            `b = \\dfrac{${A}}{${l}} = ${b}${CM}`,
          ),
          perimeterWalk(l, b),
        ],
        remember,
        mistake: tx('b = area − l kar dena. Area guna se bana hai, to bhaag karo.', 'Doing b = area − l. Area comes from multiplying, so divide.', 'b = क्षेत्रफल − l कर देना। क्षेत्रफल गुणा से बना है, तो भाग दो।'),
      };
    case 'length-double':
      return {
        steps: [
          step(
            'setup',
            'perimeter',
            5,
            [
              `l = 2b hai. To perimeter = 2(l + b) = 2(2b + b) = 6b = ${P} cm.`,
              `l = 2b. So the perimeter = 2(l + b) = 2(2b + b) = 6b = ${P} cm.`,
              `l = 2b है। तो परिमाप = 2(l + b) = 2(2b + b) = 6b = ${P} cm।`,
            ],
            `2(2b + b) = 6b = ${P}`,
            [
              'Jab ek cheez doosre ke roop mein di ho (l = 2b), to sab kuch ek hi letter (b) mein likh do.',
              'When one quantity is given in terms of another (l = 2b), write everything using one letter (b).',
              'जब एक राशि दूसरी के रूप में दी हो (l = 2b), तो सब कुछ एक ही अक्षर (b) में लिख दो।',
            ],
          ),
          step(
            'solve',
            'opposite',
            4.5,
            [`b = ${P} ÷ 6 = ${b} cm, aur l = 2 × ${b} = ${l} cm.`, `b = ${P} ÷ 6 = ${b} cm, and l = 2 × ${b} = ${l} cm.`, `b = ${P} ÷ 6 = ${b} cm, और l = 2 × ${b} = ${l} cm।`],
            `b = \\dfrac{${P}}{6} = ${b}${CM},\\quad l = ${l}${CM}`,
          ),
          tileAll(l, b),
          areaFormula(l, b),
        ],
        remember,
        mistake: tx('P ÷ 4 kar dena, jaise square ho.', 'Doing P ÷ 4 as if it were a square.', 'P ÷ 4 कर देना, जैसे वर्ग हो।'),
      };
    default:
      return {
        steps: [intro(l, b), oppositeSides(l, b), perimeterWalk(l, b)],
        remember,
        mistake: tx(`Sirf l + b = ${l + b} likhna: wo aadha chakkar hai.`, `Writing just l + b = ${l + b}: that's half way round.`, `सिर्फ़ l + b = ${l + b} लिखना: वह आधा चक्कर है।`),
      };
  }
}
