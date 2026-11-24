import { missingLeg, triangleArea, triangleHeight } from '@/lib/geometry/formulas';
import { pick, randInt } from '@/lib/random';
import { defineQuestion, tx, type QuestionTemplate } from '@/topics/contract';
import { triFromBase } from '@/topics/shared/tri/lattice';

const ANG = (s: string) => tx(s, s, s);

export const questions: QuestionTemplate[] = [
  defineQuestion({
    id: 'median-half',
    level: 'basic',
    params: { m: 3, x: 2, h: 4 },
    generate: (rng) => {
      const m = randInt(rng, 2, 5);
      return { m, x: randInt(rng, 1, 2 * m - 1), h: randInt(rng, 2, 6) };
    },
    prompt: ({ m }) =>
      tx(
        `Triangle ABC mein BC = ${2 * m} cm hai. AM median hai (M side BC par hai). BM kitna hai?`,
        `In triangle ABC, BC = ${2 * m} cm. AM is a median (M is on BC). How long is BM?`,
        `त्रिभुज ABC में BC = ${2 * m} cm है। AM माध्यिका है (M भुजा BC पर है)। BM कितना है?`,
      ),
    given: ({ m }) => [{ label: ANG('BC'), value: 2 * m, unit: 'cm' }],
    find: () => [ANG('BM')],
    answers: ({ m }) => [{ id: 'bm', label: ANG('BM'), value: (2 * m) / 2, unit: 'cm' }],
    mistakes: ({ m }) => [
      {
        answerId: 'bm',
        value: 2 * m,
        message: tx('Median saamne wali side ko do barabar hisson mein baantti hai: BM aadha hai.', 'A median cuts the opposite side into two equal halves: BM is half.', 'माध्यिका सामने वाली भुजा को दो बराबर हिस्सों में बाँटती है: BM आधा है।'),
      },
    ],
  }),
  defineQuestion({
    id: 'altitude-from-area',
    level: 'medium',
    params: { b: 6, h: 4, x: 2 },
    generate: (rng) => {
      const b = pick(rng, [4, 6, 8, 10]);
      return { b, h: randInt(rng, 2, 8), x: randInt(rng, 1, b - 1) };
    },
    prompt: ({ b, h }) =>
      tx(
        `Triangle ABC ka area ${triangleArea(b, h)} cm² aur base BC = ${b} cm hai. A se BC par altitude kitni lambi hai?`,
        `Triangle ABC has an area of ${triangleArea(b, h)} cm² and base BC = ${b} cm. How long is the altitude from A to BC?`,
        `त्रिभुज ABC का क्षेत्रफल ${triangleArea(b, h)} cm² और आधार BC = ${b} cm है। A से BC पर शीर्षलंब कितना लंबा है?`,
      ),
    given: ({ b, h }) => [
      { label: tx('Area', 'Area', 'क्षेत्रफल'), value: triangleArea(b, h), unit: 'cm2' },
      { label: ANG('BC'), value: b, unit: 'cm' },
    ],
    find: () => [tx('Altitude (h)', 'Altitude (h)', 'शीर्षलंब (h)')],
    answers: ({ b, h }) => [{ id: 'h', label: tx('Altitude', 'Altitude', 'शीर्षलंब'), value: triangleHeight(triangleArea(b, h), b), unit: 'cm' }],
    mistakes: ({ b, h }) => [
      {
        answerId: 'h',
        value: triangleArea(b, h) / b,
        message: tx('Area = ½ × b × h hai, isliye h = 2 × area ÷ b. 2 se guna karna mat bhoolo.', 'Area = ½ × b × h, so h = 2 × area ÷ b. Don’t forget the × 2.', 'क्षेत्रफल = ½ × b × h, इसलिए h = 2 × क्षेत्रफल ÷ b। 2 से गुणा करना मत भूलो।'),
      },
    ],
  }),
  defineQuestion({
    id: 'counts',
    level: 'hard',
    params: { k: 1 },
    generate: () => ({ k: 1 }),
    prompt: () =>
      tx(
        'Ek triangle mein kitni medians aur kitni altitudes kheenchi ja sakti hain? (Teeno medians bana ke dekho: wo ek hi point par milti hain.)',
        'How many medians and how many altitudes can a triangle have? (Draw all three medians: they meet at one point.)',
        'एक त्रिभुज में कितनी माध्यिकाएँ और कितने शीर्षलंब खींचे जा सकते हैं? (तीनों माध्यिकाएँ बनाकर देखो: वे एक ही बिंदु पर मिलती हैं।)',
      ),
    given: () => [{ label: tx('Corners', 'Corners', 'कोने'), value: 3, unit: 'none' }],
    find: () => [tx('Medians', 'Medians', 'माध्यिकाएँ'), tx('Altitudes', 'Altitudes', 'शीर्षलंब')],
    answers: () => [
      { id: 'medians', label: tx('Medians', 'Medians', 'माध्यिकाएँ'), value: 3, unit: 'none' },
      { id: 'altitudes', label: tx('Altitudes', 'Altitudes', 'शीर्षलंब'), value: 3, unit: 'none' },
    ],
    mistakes: () => [
      {
        answerId: 'medians',
        value: 1,
        message: tx('Har corner se ek median nikalti hai, aur corners teen hain.', 'One median comes from each corner, and there are three corners.', 'हर कोने से एक माध्यिका निकलती है, और कोने तीन हैं।'),
      },
    ],
  }),
  defineQuestion({
    id: 'isosceles-median',
    level: 'challenge',
    params: { w: 6 },
    generate: (rng) => ({ w: pick(rng, [6, 8]) }),
    prompt: ({ w }) =>
      tx(
        `Isosceles triangle ABC mein AB = AC = 5 cm aur BC = ${w} cm hai. A se median AM kitni lambi hai?`,
        `In isosceles triangle ABC, AB = AC = 5 cm and BC = ${w} cm. How long is the median AM from A?`,
        `समद्विबाहु त्रिभुज ABC में AB = AC = 5 cm और BC = ${w} cm है। A से माध्यिका AM कितनी लंबी है?`,
      ),
    given: ({ w }) => [
      { label: ANG('AB = AC'), value: 5, unit: 'cm' },
      { label: ANG('BC'), value: w, unit: 'cm' },
    ],
    find: () => [ANG('AM')],
    answers: ({ w }) => [{ id: 'am', label: ANG('AM'), value: missingLeg(5, w / 2), unit: 'cm' }],
    mistakes: ({ w }) => [
      {
        answerId: 'am',
        value: w,
        message: tx(`AM base nahi hai. Right triangle ABM banao: AB = 5, BM = ${w / 2}, phir AM² = AB² − BM².`, `AM isn't the base. Use right triangle ABM: AB = 5, BM = ${w / 2}, then AM² = AB² − BM².`, `AM आधार नहीं है। समकोण त्रिभुज ABM लो: AB = 5, BM = ${w / 2}, फिर AM² = AB² − BM²।`),
      },
    ],
  }),
];

/** The triangle for each question (also built by the student). */
export function triOf(id: string, p: Record<string, number>) {
  switch (id) {
    case 'median-half':
      return triFromBase(2 * p.m!, p.x!, p.h!);
    case 'altitude-from-area':
      return triFromBase(p.b!, p.x!, p.h!);
    case 'counts':
      return triFromBase(6, 2, 4);
    default:
      return triFromBase(p.w!, p.w! / 2, missingLeg(5, p.w! / 2));
  }
}
