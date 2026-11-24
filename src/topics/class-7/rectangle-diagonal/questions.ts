import { missingLeg, rectangleArea, rectangleDiagonal } from '@/lib/geometry/formulas';
import { pick } from '@/lib/random';
import { defineQuestion, tx, type QuestionTemplate } from '@/topics/contract';
import { randRect, randTriple } from '@/topics/shared/flat/params';

const LEN = tx('Length (l)', 'Length (l)', 'लंबाई (l)');
const BR = tx('Breadth (b)', 'Breadth (b)', 'चौड़ाई (b)');
const DIAG = tx('Diagonal (AC)', 'Diagonal (AC)', 'विकर्ण (AC)');

export const questions: QuestionTemplate[] = [
  defineQuestion({
    id: 'diagonal-triple',
    level: 'basic',
    params: { l: 8, b: 6 },
    generate: (rng) => {
      const { l, b } = randTriple(rng);
      return { l, b };
    },
    prompt: ({ l, b }) =>
      tx(
        `Ek rectangle ${l} cm lamba aur ${b} cm chauda hai. Uske diagonal ki length nikalo.`,
        `A rectangle is ${l} cm long and ${b} cm wide. Find the length of its diagonal.`,
        `एक आयत ${l} cm लंबा और ${b} cm चौड़ा है। उसके विकर्ण की लंबाई निकालो।`,
      ),
    given: ({ l, b }) => [
      { label: LEN, value: l, unit: 'cm' },
      { label: BR, value: b, unit: 'cm' },
    ],
    find: () => [DIAG],
    answers: ({ l, b }) => [{ id: 'd', label: DIAG, value: rectangleDiagonal(l, b), unit: 'cm' }],
    mistakes: ({ l, b }) => [
      {
        answerId: 'd',
        value: l + b,
        message: tx(
          'Diagonal seedha raasta hai, isliye l + b se chhota hota hai. Pythagoras lagao: d² = l² + b².',
          'The diagonal is the shortcut, so it is shorter than l + b. Use Pythagoras: d² = l² + b².',
          'विकर्ण सीधा रास्ता है, इसलिए l + b से छोटा होता है। पाइथागोरस लगाओ: d² = l² + b²।',
        ),
      },
      {
        answerId: 'd',
        value: l * l + b * b,
        message: tx('Ye d² hai. Ab square root lo.', "That's d². Now take the square root.", 'यह d² है। अब वर्गमूल लो।'),
      },
    ],
  }),
  defineQuestion({
    id: 'diagonal-decimal',
    level: 'medium',
    params: { l: 6, b: 3 },
    generate: (rng) => randRect(rng),
    prompt: ({ l, b }) =>
      tx(
        `${l} cm × ${b} cm ke rectangle ka diagonal kitna hai? (2 decimal tak)`,
        `How long is the diagonal of a ${l} cm × ${b} cm rectangle? (to 2 decimals)`,
        `${l} cm × ${b} cm के आयत का विकर्ण कितना है? (2 दशमलव तक)`,
      ),
    given: ({ l, b }) => [
      { label: LEN, value: l, unit: 'cm' },
      { label: BR, value: b, unit: 'cm' },
    ],
    find: () => [DIAG],
    answers: ({ l, b }) => [{ id: 'd', label: DIAG, value: rectangleDiagonal(l, b), unit: 'cm', tolerance: 0.02 }],
    mistakes: ({ l, b }) => [
      {
        answerId: 'd',
        value: l + b,
        message: tx('Diagonal l + b nahi hota. d² = l² + b², phir √.', "The diagonal isn't l + b. d² = l² + b², then √.", 'विकर्ण l + b नहीं होता। d² = l² + b², फिर √।'),
      },
    ],
  }),
  defineQuestion({
    id: 'missing-side',
    level: 'hard',
    params: { l: 8, b: 6 },
    generate: (rng) => {
      const { l, b } = randTriple(rng);
      return { l, b };
    },
    prompt: ({ l, b }) =>
      tx(
        `Ek rectangle ka diagonal ${rectangleDiagonal(l, b)} cm aur length ${l} cm hai. Breadth kitni hai?`,
        `A rectangle has a diagonal of ${rectangleDiagonal(l, b)} cm and a length of ${l} cm. What is its breadth?`,
        `एक आयत का विकर्ण ${rectangleDiagonal(l, b)} cm और लंबाई ${l} cm है। चौड़ाई कितनी है?`,
      ),
    given: ({ l, b }) => [
      { label: DIAG, value: rectangleDiagonal(l, b), unit: 'cm' },
      { label: LEN, value: l, unit: 'cm' },
    ],
    find: () => [BR],
    answers: ({ l, b }) => [{ id: 'b', label: BR, value: missingLeg(rectangleDiagonal(l, b), l), unit: 'cm' }],
    mistakes: ({ l, b }) => [
      {
        answerId: 'b',
        value: rectangleDiagonal(l, b) - l,
        message: tx('Sides ko seedha ghataate nahi. b² = d² − l², phir √.', "Don't just subtract the sides. b² = d² − l², then √.", 'भुजाओं को सीधा घटाते नहीं। b² = d² − l², फिर √।'),
      },
    ],
  }),
  defineQuestion({
    id: 'congruent-halves',
    level: 'challenge',
    params: { l: 8, b: 6 },
    generate: (rng) => pick(rng, [{ l: 4, b: 3 }, { l: 8, b: 6 }, { l: 6, b: 4 }, { l: 10, b: 4 }, { l: 8, b: 5 }]),
    prompt: ({ l, b }) =>
      tx(
        `${l} cm × ${b} cm ke rectangle ka diagonal use do triangles mein baantta hai. Ek triangle ka area kitna hai?`,
        `The diagonal of a ${l} cm × ${b} cm rectangle splits it into two triangles. What is the area of one triangle?`,
        `${l} cm × ${b} cm के आयत का विकर्ण उसे दो त्रिभुजों में बाँटता है। एक त्रिभुज का क्षेत्रफल कितना है?`,
      ),
    given: ({ l, b }) => [
      { label: LEN, value: l, unit: 'cm' },
      { label: BR, value: b, unit: 'cm' },
    ],
    find: () => [tx('Ek triangle ka area', 'Area of one triangle', 'एक त्रिभुज का क्षेत्रफल')],
    answers: ({ l, b }) => [{ id: 'area', label: tx('Area', 'Area', 'क्षेत्रफल'), value: rectangleArea(l, b) / 2, unit: 'cm2' }],
    mistakes: ({ l, b }) => [
      {
        answerId: 'area',
        value: rectangleArea(l, b),
        message: tx('Ye poore rectangle ka area hai. Dono triangles barabar hain, to aadha.', "That's the whole rectangle. The two triangles are equal, so take half.", 'यह पूरे आयत का क्षेत्रफल है। दोनों त्रिभुज बराबर हैं, तो आधा।'),
      },
    ],
  }),
];
