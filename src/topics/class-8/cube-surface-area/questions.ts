import { cubeLSA, cubeTSA, cubeVolume, cubeEdgeTotal, squareArea, squareSideFromArea } from '@/lib/geometry/formulas';
import { randInt } from '@/lib/random';
import { defineQuestion, tx, type QuestionTemplate } from '@/topics/contract';

const SIDE = tx('Side (a)', 'Side (a)', 'भुजा (a)');
const TSA = tx('Total surface area (TSA)', 'Total surface area (TSA)', 'कुल पृष्ठीय क्षेत्रफल');
const LSA = tx('Lateral surface area (LSA)', 'Lateral surface area (LSA)', 'पार्श्व पृष्ठीय क्षेत्रफल');

export const questions: QuestionTemplate[] = [
  defineQuestion({
    id: 'tsa-from-side',
    level: 'basic',
    params: { a: 4 },
    generate: (rng) => ({ a: randInt(rng, 2, 9) }),
    prompt: ({ a }) =>
      tx(
        `Ek cube ki side ${a} cm hai. Uska total surface area (TSA) nikalo.`,
        `A cube has a side of ${a} cm. Find its total surface area (TSA).`,
        `एक घन की भुजा ${a} cm है। उसका कुल पृष्ठीय क्षेत्रफल निकालो।`,
      ),
    given: ({ a }) => [{ label: SIDE, value: a, unit: 'cm' }],
    find: () => [TSA],
    answers: ({ a }) => [{ id: 'tsa', label: TSA, value: cubeTSA(a), unit: 'cm2' }],
    mistakes: ({ a }) => {
      const face = squareArea(a);
      return [
        {
          answerId: 'tsa',
          value: face,
          message: tx(
            `Tumne sirf ek face ka area nikala (${a} × ${a} = ${face}). Cube ke 6 faces hote hain: ab 6 × ${face} karo.`,
            `You found the area of just one face (${a} × ${a} = ${face}). A cube has 6 faces: now work out 6 × ${face}.`,
            `तुमने सिर्फ़ एक फलक का क्षेत्रफल निकाला (${a} × ${a} = ${face})। घन के 6 फलक होते हैं: अब 6 × ${face} करो।`,
          ),
        },
        {
          answerId: 'tsa',
          value: cubeLSA(a),
          message: tx(
            `Ye LSA hai (sirf 4 deewarein). TSA mein upar aur neeche ke faces bhi judte hain: 6 × ${face}.`,
            `That's the LSA (only the 4 walls). TSA also adds the top and bottom: 6 × ${face}.`,
            `यह पार्श्व पृष्ठीय क्षेत्रफल है (सिर्फ़ 4 दीवारें)। कुल में ऊपर और नीचे के फलक भी जुड़ते हैं: 6 × ${face}।`,
          ),
        },
        {
          answerId: 'tsa',
          value: cubeVolume(a),
          message: tx(
            `Ye volume hai (${a} × ${a} × ${a}). Surface area matlab bahar ki satah: 6 faces ka area, cm² mein.`,
            `That's the volume (${a} × ${a} × ${a}). Surface area is the outside: the area of the 6 faces, in cm².`,
            `यह आयतन है (${a} × ${a} × ${a})। पृष्ठीय क्षेत्रफल यानी बाहरी सतह: 6 फलकों का क्षेत्रफल, cm² में।`,
          ),
        },
        {
          answerId: 'tsa',
          value: 6 * a,
          message: tx(
            `Tumne 6 × ${a} kiya. Har face ka area side × side hota hai: 6 × ${a} × ${a}.`,
            `You did 6 × ${a}. Each face's area is side × side: 6 × ${a} × ${a}.`,
            `तुमने 6 × ${a} किया। हर फलक का क्षेत्रफल भुजा × भुजा होता है: 6 × ${a} × ${a}।`,
          ),
        },
        {
          answerId: 'tsa',
          value: cubeEdgeTotal(a),
          message: tx(
            `Ye saari 12 edges ki total length hai (cm mein), area nahi.`,
            `That's the total length of all 12 edges (in cm), not an area.`,
            `यह सभी 12 किनारों की कुल लंबाई है (cm में), क्षेत्रफल नहीं।`,
          ),
        },
      ];
    },
  }),

  defineQuestion({
    id: 'lsa-and-tsa',
    level: 'medium',
    params: { a: 5 },
    generate: (rng) => ({ a: randInt(rng, 3, 10) }),
    prompt: ({ a }) =>
      tx(
        `Ek cube-shaped dabbe ki side ${a} cm hai. Uska lateral surface area (LSA) aur total surface area (TSA) nikalo.`,
        `A cube-shaped box has a side of ${a} cm. Find its lateral surface area (LSA) and total surface area (TSA).`,
        `घन के आकार के एक डिब्बे की भुजा ${a} cm है। उसका पार्श्व पृष्ठीय क्षेत्रफल और कुल पृष्ठीय क्षेत्रफल निकालो।`,
      ),
    given: ({ a }) => [{ label: SIDE, value: a, unit: 'cm' }],
    find: () => [LSA, TSA],
    answers: ({ a }) => [
      { id: 'lsa', label: LSA, value: cubeLSA(a), unit: 'cm2' },
      { id: 'tsa', label: TSA, value: cubeTSA(a), unit: 'cm2' },
    ],
    mistakes: ({ a }) => [
      {
        answerId: 'lsa',
        value: cubeTSA(a),
        message: tx(
          `Ye TSA hai. LSA mein sirf 4 side wale faces (deewarein) aate hain: 4 × ${squareArea(a)}.`,
          `That's the TSA. LSA counts only the 4 side faces (the walls): 4 × ${squareArea(a)}.`,
          `यह कुल पृष्ठीय क्षेत्रफल है। पार्श्व में सिर्फ़ 4 बगल के फलक (दीवारें) आते हैं: 4 × ${squareArea(a)}।`,
        ),
      },
      {
        answerId: 'tsa',
        value: cubeLSA(a),
        message: tx(
          `Ye LSA hai. TSA mein upar aur neeche ke 2 faces bhi jodo: 6 × ${squareArea(a)}.`,
          `That's the LSA. For TSA, also add the top and bottom faces: 6 × ${squareArea(a)}.`,
          `यह पार्श्व पृष्ठीय क्षेत्रफल है। कुल में ऊपर और नीचे के 2 फलक भी जोड़ो: 6 × ${squareArea(a)}।`,
        ),
      },
      ...(['lsa', 'tsa'] as const).map((id) => ({
        answerId: id,
        value: squareArea(a),
        message: tx(
          `${squareArea(a)} sirf ek face ka area hai. Ab gino kitne faces chahiye.`,
          `${squareArea(a)} is the area of just one face. Now count how many faces you need.`,
          `${squareArea(a)} सिर्फ़ एक फलक का क्षेत्रफल है। अब गिनो कितने फलक चाहिए।`,
        ),
      })),
    ],
  }),

  defineQuestion({
    id: 'side-from-tsa',
    level: 'hard',
    params: { a: 5 },
    generate: (rng) => ({ a: randInt(rng, 2, 10) }),
    prompt: ({ a }) =>
      tx(
        `Ek cube ka total surface area ${cubeTSA(a)} cm² hai. Uski side kitni hai?`,
        `The total surface area of a cube is ${cubeTSA(a)} cm². How long is its side?`,
        `एक घन का कुल पृष्ठीय क्षेत्रफल ${cubeTSA(a)} cm² है। उसकी भुजा कितनी है?`,
      ),
    given: ({ a }) => [{ label: TSA, value: cubeTSA(a), unit: 'cm2' }],
    find: () => [SIDE],
    answers: ({ a }) => [{ id: 'side', label: SIDE, value: squareSideFromArea(cubeTSA(a) / 6), unit: 'cm' }],
    mistakes: ({ a }) => {
      const face = cubeTSA(a) / 6;
      return [
        {
          answerId: 'side',
          value: face,
          message: tx(
            `${cubeTSA(a)} ÷ 6 = ${face} ek face ka area hai, side nahi. Ab iska square root lo: √${face}.`,
            `${cubeTSA(a)} ÷ 6 = ${face} is the area of one face, not the side. Now take its square root: √${face}.`,
            `${cubeTSA(a)} ÷ 6 = ${face} एक फलक का क्षेत्रफल है, भुजा नहीं। अब इसका वर्गमूल लो: √${face}।`,
          ),
        },
        {
          answerId: 'side',
          value: cubeTSA(a) / 4,
          message: tx(
            `TSA mein 6 faces hote hain, 4 nahi. Pehle ÷ 6 karo.`,
            `TSA covers 6 faces, not 4. Divide by 6 first.`,
            `कुल पृष्ठीय क्षेत्रफल में 6 फलक होते हैं, 4 नहीं। पहले 6 से भाग दो।`,
          ),
        },
      ];
    },
  }),

  defineQuestion({
    id: 'open-box',
    level: 'challenge',
    params: { a: 10 },
    generate: (rng) => ({ a: randInt(rng, 3, 10) }),
    prompt: ({ a }) =>
      tx(
        `Ek cube-shaped dabba upar se khula hai (dhakkan nahi hai). Uski side ${a} cm hai. Dabbe ko bahar se paint karna hai. Kitne area par paint lagega?`,
        `A cube-shaped box has no lid. Its side is ${a} cm. The outside of the box is to be painted. What area will be painted?`,
        `घन के आकार का एक डिब्बा ऊपर से खुला है (ढक्कन नहीं है)। उसकी भुजा ${a} cm है। डिब्बे को बाहर से रंगना है। कितने क्षेत्रफल पर रंग लगेगा?`,
      ),
    given: ({ a }) => [{ label: SIDE, value: a, unit: 'cm' }],
    find: () => [tx('Paint hone wala area', 'Area to be painted', 'रंगा जाने वाला क्षेत्रफल')],
    answers: ({ a }) => [
      {
        id: 'area',
        label: tx('Paint ka area', 'Painted area', 'रंगा जाने वाला क्षेत्रफल'),
        value: cubeTSA(a) - squareArea(a),
        unit: 'cm2',
      },
    ],
    mistakes: ({ a }) => [
      {
        answerId: 'area',
        value: cubeTSA(a),
        message: tx(
          `Dhakkan nahi hai! 6 mein se upar wala face hatao: 6a² − a² = 5a².`,
          `There's no lid! Remove the top face from the 6: 6a² − a² = 5a².`,
          `ढक्कन नहीं है! 6 में से ऊपर वाला फलक हटाओ: 6a² − a² = 5a²।`,
        ),
      },
      {
        answerId: 'area',
        value: cubeLSA(a),
        message: tx(
          `Neeche wala face bhi bahar se paint hoga. 4 deewarein + 1 tala = 5 faces.`,
          `The bottom is painted on the outside too. 4 walls + 1 base = 5 faces.`,
          `नीचे वाला फलक भी बाहर से रंगा जाएगा। 4 दीवारें + 1 तला = 5 फलक।`,
        ),
      },
    ],
  }),
];
