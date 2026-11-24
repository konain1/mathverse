import { squareArea } from '@/lib/geometry/formulas';
import { pick, randInt } from '@/lib/random';
import { defineQuestion, tx, type QuestionTemplate } from '@/topics/contract';

export const questions: QuestionTemplate[] = [
  defineQuestion({
    id: 'sides-angles',
    level: 'basic',
    params: { a: 5 },
    generate: (rng) => ({ a: randInt(rng, 2, 10) }),
    prompt: ({ a }) =>
      tx(
        `Square ABCD mein AB = ${a} cm hai. CD kitni lambi hai, aur ∠B kitne degree ka hai?`,
        `In square ABCD, AB = ${a} cm. How long is CD, and how many degrees is ∠B?`,
        `वर्ग ABCD में AB = ${a} cm है। CD कितनी लंबी है, और ∠B कितने अंश का है?`,
      ),
    given: ({ a }) => [{ label: tx('AB', 'AB', 'AB'), value: a, unit: 'cm' }],
    find: () => [tx('CD', 'CD', 'CD'), tx('∠B', '∠B', '∠B')],
    answers: ({ a }) => [
      { id: 'cd', label: tx('CD', 'CD', 'CD'), value: a, unit: 'cm' },
      { id: 'b', label: tx('∠B', '∠B', '∠B'), value: 90, unit: 'deg' },
    ],
    mistakes: () => [
      {
        answerId: 'b',
        value: 360,
        message: tx('360° chaaron angles ka total hai. Ek corner = 90°.', '360° is all four angles together. One corner = 90°.', '360° चारों कोणों का योग है। एक कोना = 90°।'),
      },
      {
        answerId: 'b',
        value: 180,
        message: tx('180° seedhi line hai. Square ke corner par 90°.', '180° is a straight line. A square’s corner is 90°.', '180° सीधी रेखा है। वर्ग के कोने पर 90°।'),
      },
    ],
  }),
  defineQuestion({
    id: 'diagonal-angles',
    level: 'medium',
    params: { a: 6 },
    generate: (rng) => ({ a: randInt(rng, 3, 10) }),
    prompt: ({ a }) =>
      tx(
        `${a} cm side wale square ABCD ke dono diagonals O par milte hain. ∠BAC aur ∠AOB kitne degree ke hain?`,
        `The diagonals of square ABCD (side ${a} cm) meet at O. How many degrees are ∠BAC and ∠AOB?`,
        `${a} cm भुजा वाले वर्ग ABCD के दोनों विकर्ण O पर मिलते हैं। ∠BAC और ∠AOB कितने अंश के हैं?`,
      ),
    given: ({ a }) => [{ label: tx('Side', 'Side', 'भुजा'), value: a, unit: 'cm' }],
    find: () => [tx('∠BAC', '∠BAC', '∠BAC'), tx('∠AOB', '∠AOB', '∠AOB')],
    answers: () => [
      { id: 'bac', label: tx('∠BAC', '∠BAC', '∠BAC'), value: (180 - 90) / 2, unit: 'deg' },
      { id: 'aob', label: tx('∠AOB', '∠AOB', '∠AOB'), value: 90, unit: 'deg' },
    ],
    mistakes: () => [
      {
        answerId: 'bac',
        value: 90,
        message: tx('∠BAD = 90° hai; diagonal use do barabar hisson mein baantta hai: 45°.', '∠BAD is 90°; the diagonal splits it into two equal parts: 45°.', '∠BAD = 90° है; विकर्ण उसे दो बराबर हिस्सों में बाँटता है: 45°।'),
      },
      {
        answerId: 'aob',
        value: 180,
        message: tx('Square ke diagonals ek doosre par lamb (90°) hote hain.', "A square's diagonals are perpendicular (90°).", 'वर्ग के विकर्ण एक-दूसरे पर लंब (90°) होते हैं।'),
      },
    ],
  }),
  defineQuestion({
    id: 'diagonals-bisect',
    level: 'hard',
    params: { k: 3 },
    generate: (rng) => ({ k: randInt(rng, 2, 5) }),
    prompt: ({ k }) =>
      tx(
        `Square ABCD ke diagonals O par milte hain. AC = ${2 * k} cm hai. BD aur OB kitne hain?`,
        `The diagonals of square ABCD meet at O. AC = ${2 * k} cm. How long are BD and OB?`,
        `वर्ग ABCD के विकर्ण O पर मिलते हैं। AC = ${2 * k} cm है। BD और OB कितने हैं?`,
      ),
    given: ({ k }) => [{ label: tx('AC', 'AC', 'AC'), value: 2 * k, unit: 'cm' }],
    find: () => [tx('BD', 'BD', 'BD'), tx('OB', 'OB', 'OB')],
    answers: ({ k }) => [
      { id: 'bd', label: tx('BD', 'BD', 'BD'), value: 2 * k, unit: 'cm' },
      { id: 'ob', label: tx('OB', 'OB', 'OB'), value: (2 * k) / 2, unit: 'cm' },
    ],
    mistakes: ({ k }) => [
      {
        answerId: 'ob',
        value: 2 * k,
        message: tx('OB sirf aadha diagonal hai: O beech ka point hai.', 'OB is only half a diagonal: O is the midpoint.', 'OB सिर्फ़ आधा विकर्ण है: O बीच का बिंदु है।'),
      },
    ],
  }),
  defineQuestion({
    id: 'four-triangles',
    level: 'challenge',
    params: { a: 6 },
    generate: (rng) => ({ a: pick(rng, [2, 4, 6, 8, 10]) }),
    prompt: ({ a }) =>
      tx(
        `${a} cm side wale square ke dono diagonals kheenche gaye. Isse 4 triangles bane. Har triangle ka area kitna hai?`,
        `Both diagonals of a square of side ${a} cm are drawn, making 4 triangles. What is the area of each triangle?`,
        `${a} cm भुजा वाले वर्ग के दोनों विकर्ण खींचे गए। इससे 4 त्रिभुज बने। हर त्रिभुज का क्षेत्रफल कितना है?`,
      ),
    given: ({ a }) => [{ label: tx('Side', 'Side', 'भुजा'), value: a, unit: 'cm' }],
    find: () => [tx('Ek triangle ka area', 'Area of one triangle', 'एक त्रिभुज का क्षेत्रफल')],
    answers: ({ a }) => [{ id: 'area', label: tx('Area', 'Area', 'क्षेत्रफल'), value: squareArea(a) / 4, unit: 'cm2' }],
    mistakes: ({ a }) => [
      {
        answerId: 'area',
        value: squareArea(a) / 2,
        message: tx('Ye ek diagonal se bane triangle ka area hai. Do diagonals se 4 barabar triangles bante hain.', "That's the triangle from one diagonal. Two diagonals make 4 equal triangles.", 'यह एक विकर्ण से बने त्रिभुज का क्षेत्रफल है। दो विकर्णों से 4 बराबर त्रिभुज बनते हैं।'),
      },
      {
        answerId: 'area',
        value: squareArea(a),
        message: tx('Ye poore square ka area hai. Ab 4 se baanto.', "That's the whole square. Now divide by 4.", 'यह पूरे वर्ग का क्षेत्रफल है। अब 4 से बाँटो।'),
      },
    ],
  }),
];
