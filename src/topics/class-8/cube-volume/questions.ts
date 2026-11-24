import { cubeTSA, cubeVolume, intCbrt, smallCubesThatFit, squareArea } from '@/lib/geometry/formulas';
import { pick, randInt } from '@/lib/random';
import { defineQuestion, tx, type QuestionTemplate } from '@/topics/contract';

const SIDE = tx('Side (a)', 'Side (a)', 'भुजा (a)');
const VOL = tx('Volume', 'Volume', 'आयतन');

export const questions: QuestionTemplate[] = [
  defineQuestion({
    id: 'volume-from-side',
    level: 'basic',
    params: { a: 4 },
    generate: (rng) => ({ a: randInt(rng, 2, 7) }),
    prompt: ({ a }) =>
      tx(
        `Ek cube ki side ${a} cm hai. Uska volume nikalo.`,
        `A cube has a side of ${a} cm. Find its volume.`,
        `एक घन की भुजा ${a} cm है। उसका आयतन निकालो।`,
      ),
    given: ({ a }) => [{ label: SIDE, value: a, unit: 'cm' }],
    find: () => [VOL],
    answers: ({ a }) => [{ id: 'volume', label: VOL, value: cubeVolume(a), unit: 'cm3' }],
    mistakes: ({ a }) => [
      {
        answerId: 'volume',
        value: 3 * a,
        message: tx(
          `Tumne ${a} + ${a} + ${a} jod diya. Volume mein guna hota hai: ${a} × ${a} × ${a}.`,
          `You added ${a} + ${a} + ${a}. Volume multiplies: ${a} × ${a} × ${a}.`,
          `तुमने ${a} + ${a} + ${a} जोड़ दिया। आयतन में गुणा होता है: ${a} × ${a} × ${a}।`,
        ),
      },
      {
        answerId: 'volume',
        value: squareArea(a),
        message: tx(
          `Tumne ${a} × ${a} kiya: ye sirf neeche ki ek layer ke cubes hain. Abhi ${a} layers se guna karo: ${a} × ${a} × ${a}.`,
          `You did ${a} × ${a}: that's only the bottom layer of cubes. Now multiply by the ${a} layers: ${a} × ${a} × ${a}.`,
          `तुमने ${a} × ${a} किया: यह सिर्फ़ नीचे की एक परत के घन हैं। अब ${a} परतों से गुणा करो: ${a} × ${a} × ${a}।`,
        ),
      },
      {
        answerId: 'volume',
        value: cubeTSA(a),
        message: tx(
          `Ye surface area (6a²) hai, yaani bahar ki satah. Volume andar ki jagah hai: a³.`,
          `That's the surface area (6a²), the outside. Volume is the space inside: a³.`,
          `यह पृष्ठीय क्षेत्रफल (6a²) है, यानी बाहरी सतह। आयतन अंदर की जगह है: a³।`,
        ),
      },
    ],
  }),

  defineQuestion({
    id: 'side-from-volume',
    level: 'medium',
    params: { a: 5 },
    generate: (rng) => ({ a: randInt(rng, 2, 9) }),
    prompt: ({ a }) =>
      tx(
        `Ek cube ka volume ${cubeVolume(a)} cm³ hai. Uski side kitni hai?`,
        `The volume of a cube is ${cubeVolume(a)} cm³. How long is its side?`,
        `एक घन का आयतन ${cubeVolume(a)} cm³ है। उसकी भुजा कितनी है?`,
      ),
    given: ({ a }) => [{ label: VOL, value: cubeVolume(a), unit: 'cm3' }],
    find: () => [SIDE],
    answers: ({ a }) => [{ id: 'side', label: SIDE, value: intCbrt(cubeVolume(a)), unit: 'cm' }],
    mistakes: ({ a }) => [
      {
        answerId: 'side',
        value: cubeVolume(a) / 3,
        message: tx(
          `Cube root ka matlab ÷ 3 nahi hai. Wo number dhoondo jise teen baar guna karne par ${cubeVolume(a)} aaye.`,
          `A cube root is not ÷ 3. Find the number that, multiplied by itself three times, gives ${cubeVolume(a)}.`,
          `घनमूल का मतलब ÷ 3 नहीं है। वह संख्या ढूँढो जिसे तीन बार गुणा करने पर ${cubeVolume(a)} आए।`,
        ),
      },
      {
        answerId: 'side',
        value: squareArea(a),
        message: tx(
          `${squareArea(a)} ek layer ke cubes hain (${a} × ${a}). Side us layer ki ek row hai: ${a}.`,
          `${squareArea(a)} is one layer of cubes (${a} × ${a}). The side is one row of that layer: ${a}.`,
          `${squareArea(a)} एक परत के घन हैं (${a} × ${a})। भुजा उस परत की एक पंक्ति है: ${a}।`,
        ),
      },
    ],
  }),

  defineQuestion({
    id: 'double-side',
    level: 'hard',
    params: { a: 3 },
    generate: (rng) => ({ a: randInt(rng, 2, 4) }),
    prompt: ({ a }) =>
      tx(
        `Ek cube ki side ${a} cm hai. Agar side double kar di jaaye (${2 * a} cm), to naya volume kitna hoga aur volume kitne guna ho jayega?`,
        `A cube has a side of ${a} cm. If the side is doubled (${2 * a} cm), what is the new volume, and how many times bigger is the volume?`,
        `एक घन की भुजा ${a} cm है। अगर भुजा दुगुनी कर दी जाए (${2 * a} cm), तो नया आयतन कितना होगा और आयतन कितने गुना हो जाएगा?`,
      ),
    given: ({ a }) => [
      { label: SIDE, value: a, unit: 'cm' },
      { label: tx('Nayi side', 'New side', 'नई भुजा'), value: 2 * a, unit: 'cm' },
    ],
    find: () => [tx('Naya volume', 'New volume', 'नया आयतन'), tx('Kitne guna', 'How many times', 'कितने गुना')],
    answers: ({ a }) => [
      { id: 'newVolume', label: tx('Naya volume', 'New volume', 'नया आयतन'), value: cubeVolume(2 * a), unit: 'cm3' },
      { id: 'ratio', label: tx('Kitne guna', 'How many times', 'कितने गुना'), value: cubeVolume(2 * a) / cubeVolume(a), unit: 'times' },
    ],
    mistakes: ({ a }) => [
      {
        answerId: 'ratio',
        value: 2,
        message: tx(
          'Side double hui, par volume mein teen dimensions hain: 2 × 2 × 2 = 8 guna.',
          'The side doubled, but volume has three dimensions: 2 × 2 × 2 = 8 times.',
          'भुजा दुगुनी हुई, पर आयतन में तीन विमाएँ हैं: 2 × 2 × 2 = 8 गुना।',
        ),
      },
      {
        answerId: 'ratio',
        value: 4,
        message: tx(
          '4 guna to area hota hai (2 × 2). Volume mein teesri dimension bhi double hoti hai: 2 × 2 × 2 = 8.',
          '4 times is what happens to area (2 × 2). Volume doubles the third dimension too: 2 × 2 × 2 = 8.',
          '4 गुना तो क्षेत्रफल होता है (2 × 2)। आयतन में तीसरी विमा भी दुगुनी होती है: 2 × 2 × 2 = 8।',
        ),
      },
      {
        answerId: 'newVolume',
        value: 2 * cubeVolume(a),
        message: tx(
          `Tumne purane volume ko 2 se guna kiya. Naye cube ka volume seedha nikalo: ${2 * a} × ${2 * a} × ${2 * a}.`,
          `You multiplied the old volume by 2. Work out the new cube directly: ${2 * a} × ${2 * a} × ${2 * a}.`,
          `तुमने पुराने आयतन को 2 से गुणा किया। नए घन का आयतन सीधे निकालो: ${2 * a} × ${2 * a} × ${2 * a}।`,
        ),
      },
    ],
  }),

  defineQuestion({
    id: 'small-cubes',
    level: 'challenge',
    params: { s: 2, k: 3 },
    generate: (rng) => {
      const s = pick(rng, [2, 3] as const);
      const k = randInt(rng, 2, s === 2 ? 5 : 3);
      return { s, k };
    },
    prompt: ({ s, k }) =>
      tx(
        `${s * k} cm side wale ek bade cube ko ${s} cm side wale chhote cubes mein kaata gaya. Kitne chhote cubes banenge?`,
        `A big cube of side ${s * k} cm is cut into small cubes of side ${s} cm. How many small cubes are made?`,
        `${s * k} cm भुजा वाले एक बड़े घन को ${s} cm भुजा वाले छोटे घनों में काटा गया। कितने छोटे घन बनेंगे?`,
      ),
    given: ({ s, k }) => [
      { label: tx('Bade cube ki side', 'Big cube side', 'बड़े घन की भुजा'), value: s * k, unit: 'cm' },
      { label: tx('Chhote cube ki side', 'Small cube side', 'छोटे घन की भुजा'), value: s, unit: 'cm' },
    ],
    find: () => [tx('Chhote cubes ki ginti', 'Number of small cubes', 'छोटे घनों की संख्या')],
    answers: ({ s, k }) => [
      {
        id: 'count',
        label: tx('Chhote cubes', 'Small cubes', 'छोटे घन'),
        value: smallCubesThatFit(s * k, s * k, s * k, s),
        unit: 'cubes',
      },
    ],
    mistakes: ({ s, k }) => [
      {
        answerId: 'count',
        value: k,
        message: tx(
          `${k} cubes to sirf ek row mein aate hain. Poore cube mein ${k} × ${k} × ${k}.`,
          `${k} cubes fit in just one row. The whole cube holds ${k} × ${k} × ${k}.`,
          `${k} घन तो सिर्फ़ एक पंक्ति में आते हैं। पूरे घन में ${k} × ${k} × ${k}।`,
        ),
      },
      {
        answerId: 'count',
        value: k * k,
        message: tx(
          `${k * k} ek layer hai. Aisi ${k} layers hain: ${k * k} × ${k}.`,
          `${k * k} is one layer. There are ${k} such layers: ${k * k} × ${k}.`,
          `${k * k} एक परत है। ऐसी ${k} परतें हैं: ${k * k} × ${k}।`,
        ),
      },
      {
        answerId: 'count',
        value: cubeVolume(s * k) / s,
        message: tx(
          `Volume ko side (${s}) se divide nahi karte. Chhote cube ke volume (${s}³ = ${cubeVolume(s)}) se divide karo.`,
          `Don't divide the volume by the side (${s}). Divide by the small cube's volume (${s}³ = ${cubeVolume(s)}).`,
          `आयतन को भुजा (${s}) से भाग नहीं देते। छोटे घन के आयतन (${s}³ = ${cubeVolume(s)}) से भाग दो।`,
        ),
      },
    ],
  }),
];
