import { cubeVolume, intCbrt, primeFactors, smallCubesThatFit, squareArea } from '@/lib/geometry/formulas';
import { tx, type Params, type SolutionScript, type SolutionStep } from '@/topics/contract';

const CM3 = '\\,\\text{cm}^3';

/** "16, 32, 48, 64": running totals after each layer. */
const layerTotals = (perLayer: number, layers: number) =>
  Array.from({ length: layers }, (_, i) => perLayer * (i + 1)).join(', ');

function fillSteps(n: number, unit: 'unit' | 'small'): SolutionStep[] {
  const layer = squareArea(n);
  const total = cubeVolume(n);
  const cubesHl = unit === 'unit' ? 'unit cubes' : 'chhote cubes';
  const cubesEn = unit === 'unit' ? 'unit cubes' : 'small cubes';
  const cubesHi = unit === 'unit' ? 'इकाई घन' : 'छोटे घन';
  return [
    {
      id: 'row',
      cue: 'base-row',
      duration: 3.5,
      narration: tx(
        `Neeche ki pehli row mein ${n} ${cubesHl} aate hain.`,
        `The first row along the bottom holds ${n} ${cubesEn}.`,
        `नीचे की पहली पंक्ति में ${n} ${cubesHi} आते हैं।`,
      ),
      formula: `\\text{row} = ${n}`,
    },
    {
      id: 'layer',
      cue: 'base-layer',
      duration: 4.5,
      narration: tx(
        `Aisi ${n} rows milkar pehli layer banti hai: ${n} × ${n} = ${layer} ${cubesHl}.`,
        `${n} such rows make the first layer: ${n} × ${n} = ${layer} ${cubesEn}.`,
        `ऐसी ${n} पंक्तियाँ मिलकर पहली परत बनाती हैं: ${n} × ${n} = ${layer} ${cubesHi}।`,
      ),
      formula: `${n} \\times ${n} = ${layer}`,
      why: tx(
        'Ek layer rectangle jaisi hai: (rows ki ginti) × (har row ke cubes).',
        'A layer is like a rectangle: (number of rows) × (cubes in each row).',
        'एक परत आयत जैसी है: (पंक्तियों की संख्या) × (हर पंक्ति के घन)।',
      ),
    },
    {
      id: 'layers',
      cue: 'layers',
      duration: 6,
      narration: tx(
        `Ab layer par layer: ${layerTotals(layer, n)}. Kul ${n} layers.`,
        `Now layer on layer: ${layerTotals(layer, n)}. ${n} layers in all.`,
        `अब परत पर परत: ${layerTotals(layer, n)}। कुल ${n} परतें।`,
      ),
      formula: `${layer} \\times ${n} = ${total}`,
    },
  ];
}

export function solution(questionId: string, p: Params): SolutionScript {
  switch (questionId) {
    case 'side-from-volume': {
      const a = p.a!;
      const V = cubeVolume(a);
      const side = intCbrt(V);
      const factors = primeFactors(V);
      const groups = Array.from({ length: factors.length / 3 }, (_, i) => factors.slice(i * 3, i * 3 + 3).join(' × '));
      const prev = a > 2 ? `${a - 1}³ = ${cubeVolume(a - 1)}, ` : '';
      return {
        steps: [
          {
            id: 'total',
            cue: 'formula',
            duration: 4,
            narration: tx(
              `Is cube mein ${V} unit cubes hain (volume ${V} cm³). Side kitni lambi hai?`,
              `This cube holds ${V} unit cubes (volume ${V} cm³). How long is a side?`,
              `इस घन में ${V} इकाई घन हैं (आयतन ${V} cm³)। भुजा कितनी लंबी है?`,
            ),
            formula: `a^3 = ${V}`,
          },
          {
            id: 'trial',
            cue: 'formula',
            duration: 5,
            narration: tx(
              `Wo number dhoondo jo teen baar guna karne par ${V} de: ${prev}${a}³ = ${V} ✓`,
              `Find the number that gives ${V} when multiplied by itself three times: ${prev}${a}³ = ${V} ✓`,
              `वह संख्या ढूँढो जो तीन बार गुणा करने पर ${V} दे: ${prev}${a}³ = ${V} ✓`,
            ),
            formula: `a = \\sqrt[3]{${V}}`,
            why: tx(
              `NCERT tareeka: prime factors ko teen-teen ke group mein baanto: ${V} = (${groups.join(') × (')}). Har group se ek number: ${side}.`,
              `The NCERT method: split the prime factors into groups of three: ${V} = (${groups.join(') × (')}). Take one number from each group: ${side}.`,
              `NCERT तरीका: अभाज्य गुणनखंडों को तीन-तीन के समूह में बाँटो: ${V} = (${groups.join(') × (')})। हर समूह से एक संख्या: ${side}।`,
            ),
          },
          {
            id: 'row',
            cue: 'base-row',
            duration: 4,
            narration: tx(
              `Ek row mein ${side} cubes: yahi side hai. a = ${side} cm.`,
              `One row holds ${side} cubes: that is the side. a = ${side} cm.`,
              `एक पंक्ति में ${side} घन: यही भुजा है। a = ${side} cm।`,
            ),
            formula: `a = \\sqrt[3]{${V}} = ${side}\\,\\text{cm}`,
          },
        ],
        remember: tx(
          'Cube root, cube ka ulta hai: a³ = V ho to a = ∛V.',
          'The cube root undoes cubing: if a³ = V then a = ∛V.',
          'घनमूल, घन का उल्टा है: a³ = V हो तो a = ∛V।',
        ),
        mistake: tx(
          `${V} ÷ 3 kar dena. Cube root ka matlab teen se bhaag nahi hai.`,
          `Doing ${V} ÷ 3. A cube root does not mean dividing by three.`,
          `${V} ÷ 3 कर देना। घनमूल का मतलब तीन से भाग नहीं है।`,
        ),
      };
    }

    case 'double-side': {
      const a = p.a!;
      const v1 = cubeVolume(a);
      const v2 = cubeVolume(2 * a);
      return {
        steps: [
          {
            id: 'small',
            cue: 'small',
            duration: 4,
            narration: tx(
              `Pehla cube: side ${a} cm, volume ${a} × ${a} × ${a} = ${v1} cm³.`,
              `First cube: side ${a} cm, volume ${a} × ${a} × ${a} = ${v1} cm³.`,
              `पहला घन: भुजा ${a} cm, आयतन ${a} × ${a} × ${a} = ${v1} cm³।`,
            ),
            formula: `${a}^3 = ${v1}${CM3}`,
          },
          {
            id: 'frame',
            cue: 'big-frame',
            duration: 3.5,
            narration: tx(
              `Ab side double: ${2 * a} cm. Naya cube har taraf do guna lamba hai: lambai, chaudai, oonchai teeno.`,
              `Now double the side: ${2 * a} cm. The new cube is twice as long in every direction: length, breadth and height.`,
              `अब भुजा दुगुनी: ${2 * a} cm। नया घन हर तरफ़ दुगुना लंबा है: लंबाई, चौड़ाई, ऊँचाई तीनों।`,
            ),
            formula: `2a = ${2 * a}\\,\\text{cm}`,
          },
          {
            id: 'fill',
            cue: 'big-fill',
            duration: 6,
            narration: tx(
              `Naya volume: ${2 * a} × ${2 * a} × ${2 * a} = ${v2} cm³.`,
              `New volume: ${2 * a} × ${2 * a} × ${2 * a} = ${v2} cm³.`,
              `नया आयतन: ${2 * a} × ${2 * a} × ${2 * a} = ${v2} cm³।`,
            ),
            formula: `(2a)^3 = ${2 * a}^3 = ${v2}${CM3}`,
          },
          {
            id: 'octants',
            cue: 'octants',
            duration: 5,
            narration: tx(
              `Dekho, bade cube mein purane jaise 8 cube samaa gaye (har rang ek purana cube). ${v2} ÷ ${v1} = 8 guna.`,
              `Look: the big cube holds 8 copies of the old cube (one per colour). ${v2} ÷ ${v1} = 8 times.`,
              `देखो, बड़े घन में पुराने जैसे 8 घन समा गए (हर रंग एक पुराना घन)। ${v2} ÷ ${v1} = 8 गुना।`,
            ),
            formula: `\\dfrac{${v2}}{${v1}} = 2 \\times 2 \\times 2 = 8`,
            why: tx(
              'Teeno dimensions 2 guna hui. Volume teeno ka guna hai, isliye 2 × 2 × 2 = 8 guna.',
              'All three dimensions doubled. Volume multiplies all three, so 2 × 2 × 2 = 8 times.',
              'तीनों विमाएँ 2 गुना हुईं। आयतन तीनों का गुणा है, इसलिए 2 × 2 × 2 = 8 गुना।',
            ),
          },
        ],
        remember: tx(
          'Side k guna → volume k³ guna. Side double → volume 8 guna.',
          'Side × k → volume × k³. Double the side → 8 times the volume.',
          'भुजा k गुना → आयतन k³ गुना। भुजा दुगुनी → आयतन 8 गुना।',
        ),
        mistake: tx(
          'Side double hone par volume bhi sirf double samajh lena.',
          'Thinking the volume only doubles when the side doubles.',
          'भुजा दुगुनी होने पर आयतन भी सिर्फ़ दुगुना समझ लेना।',
        ),
      };
    }

    case 'small-cubes': {
      const s = p.s!;
      const k = p.k!;
      const A = s * k;
      const n = smallCubesThatFit(A, A, A, s);
      return {
        steps: [
          {
            id: 'intro',
            cue: 'intro',
            duration: 3.5,
            narration: tx(
              `Bada cube ${A} cm ka hai, aur har chhota cube ${s} cm ka.`,
              `The big cube is ${A} cm, and each small cube is ${s} cm.`,
              `बड़ा घन ${A} cm का है, और हर छोटा घन ${s} cm का।`,
            ),
            formula: `A = ${A}\\,\\text{cm},\\quad s = ${s}\\,\\text{cm}`,
          },
          {
            id: 'edge',
            cue: 'base-row',
            duration: 4,
            narration: tx(
              `Ek edge par kitne chhote cubes? ${A} ÷ ${s} = ${k}.`,
              `How many small cubes along one edge? ${A} ÷ ${s} = ${k}.`,
              `एक किनारे पर कितने छोटे घन? ${A} ÷ ${s} = ${k}।`,
            ),
            formula: `${A} \\div ${s} = ${k}`,
          },
          ...fillSteps(k, 'small').slice(1),
          {
            id: 'check',
            cue: 'formula',
            duration: 4.5,
            narration: tx(
              `Volume se check: bada cube ${cubeVolume(A)} cm³, chhota ${cubeVolume(s)} cm³. ${cubeVolume(A)} ÷ ${cubeVolume(s)} = ${n}.`,
              `Check with volumes: big cube ${cubeVolume(A)} cm³, small ${cubeVolume(s)} cm³. ${cubeVolume(A)} ÷ ${cubeVolume(s)} = ${n}.`,
              `आयतन से जाँचो: बड़ा घन ${cubeVolume(A)} cm³, छोटा ${cubeVolume(s)} cm³। ${cubeVolume(A)} ÷ ${cubeVolume(s)} = ${n}।`,
            ),
            formula: `\\dfrac{${A}^3}{${s}^3} = \\dfrac{${cubeVolume(A)}}{${cubeVolume(s)}} = ${n}`,
            why: tx(
              `Har chhota cube ${cubeVolume(s)} cm³ jagah leta hai. Kul jagah ko ek cube ki jagah se baanto.`,
              `Each small cube takes up ${cubeVolume(s)} cm³. Divide the total space by the space of one cube.`,
              `हर छोटा घन ${cubeVolume(s)} cm³ जगह लेता है। कुल जगह को एक घन की जगह से भाग दो।`,
            ),
          },
        ],
        remember: tx(
          'Ek edge par ginti nikalo (A ÷ s), phir uska cube: (A ÷ s)³.',
          'Count along one edge (A ÷ s), then cube it: (A ÷ s)³.',
          'एक किनारे पर गिनती निकालो (A ÷ s), फिर उसका घन: (A ÷ s)³।',
        ),
        mistake: tx(
          `Bade volume ko side (${s}) se divide kar dena. Chhote cube ke volume (${s}³) se divide karo.`,
          `Dividing the big volume by the side (${s}). Divide by the small cube's volume (${s}³).`,
          `बड़े आयतन को भुजा (${s}) से भाग दे देना। छोटे घन के आयतन (${s}³) से भाग दो।`,
        ),
      };
    }

    default: {
      const a = p.a!;
      const V = cubeVolume(a);
      return {
        steps: [
          {
            id: 'intro',
            cue: 'intro',
            duration: 4,
            narration: tx(
              `Ye ${a} cm side wala cube hai. Volume matlab andar ki jagah: isme kitne 1 cm ke unit cubes samaate hain?`,
              `This is the cube with side ${a} cm. Volume is the space inside: how many 1 cm unit cubes fit in it?`,
              `यह ${a} cm भुजा वाला घन है। आयतन यानी अंदर की जगह: इसमें कितने 1 cm के इकाई घन समाते हैं?`,
            ),
            formula: `1\\ \\text{unit cube} = 1\\,\\text{cm}^3`,
            why: tx(
              '1 cm × 1 cm × 1 cm ka cube = 1 cm³. Area jaise 1 cm² ke squares se naapte hain, volume 1 cm³ ke cubes se.',
              'A 1 cm × 1 cm × 1 cm cube = 1 cm³. Just as area is measured in 1 cm² squares, volume is measured in 1 cm³ cubes.',
              '1 cm × 1 cm × 1 cm का घन = 1 cm³। जैसे क्षेत्रफल 1 cm² के वर्गों से नापते हैं, आयतन 1 cm³ के घनों से।',
            ),
          },
          ...fillSteps(a, 'unit'),
          {
            id: 'formula',
            cue: 'formula',
            duration: 4.5,
            narration: tx(
              `Kul ${V} unit cubes, yaani volume = ${V} cm³. Formula: a × a × a = a³.`,
              `${V} unit cubes in all, so the volume = ${V} cm³. Formula: a × a × a = a³.`,
              `कुल ${V} इकाई घन, यानी आयतन = ${V} cm³। सूत्र: a × a × a = a³।`,
            ),
            formula: `V = a^3 = ${a}^3 = ${V}${CM3}`,
            why: tx(
              'Volume = lambai × chaudai × oonchai. Cube mein teeno barabar (a) hain, isliye a³.',
              'Volume = length × breadth × height. In a cube all three equal a, so it is a³.',
              'आयतन = लंबाई × चौड़ाई × ऊँचाई। घन में तीनों बराबर (a) हैं, इसलिए a³।',
            ),
          },
        ],
        remember: tx(
          'Volume = a³, hamesha cubic units (cm³) mein.',
          'Volume = a³, always in cubic units (cm³).',
          'आयतन = a³, हमेशा घन इकाई (cm³) में।',
        ),
        mistake: tx(
          `a × a (sirf ek layer = ${squareArea(a)}) ya a + a + a (= ${3 * a}) likh dena.`,
          `Writing a × a (just one layer = ${squareArea(a)}) or a + a + a (= ${3 * a}).`,
          `a × a (सिर्फ़ एक परत = ${squareArea(a)}) या a + a + a (= ${3 * a}) लिख देना।`,
        ),
      };
    }
  }
}
