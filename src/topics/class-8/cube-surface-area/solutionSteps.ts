import { cubeLSA, cubeTSA, squareArea } from '@/lib/geometry/formulas';
import { tx, type Params, type SolutionScript, type SolutionStep } from '@/topics/contract';

const CM2 = '\\,\\text{cm}^2';

function shared(a: number) {
  const f = squareArea(a);
  const intro: SolutionStep = {
    id: 'intro',
    cue: 'intro',
    duration: 3.5,
    narration: tx(
      `Ye hai ${a} cm side wala cube. Iske 6 faces hain, aur har face ek square hai.`,
      `Here is the cube with side ${a} cm. It has 6 faces, and every face is a square.`,
      `यह है ${a} cm भुजा वाला घन। इसके 6 फलक हैं, और हर फलक एक वर्ग है।`,
    ),
    formula: `\\text{faces} = 6,\\quad a = ${a}\\,\\text{cm}`,
    why: tx(
      'Cube ki saari 12 edges barabar hoti hain, isliye har face ki dono sides barabar hain: har face square hai.',
      'All 12 edges of a cube are equal, so both sides of every face are equal: every face is a square.',
      'घन के सभी 12 किनारे बराबर होते हैं, इसलिए हर फलक की दोनों भुजाएँ बराबर हैं: हर फलक वर्ग है।',
    ),
  };
  const oneFace: SolutionStep = {
    id: 'one-face',
    cue: 'one-face',
    duration: 4.5,
    narration: tx(
      `Pehle ek face ka area: ${a} cm × ${a} cm = ${f} cm². Grid mein gin ke dekho: ${f} chhote squares.`,
      `First, the area of one face: ${a} cm × ${a} cm = ${f} cm². Count the grid: ${f} small squares.`,
      `पहले एक फलक का क्षेत्रफल: ${a} cm × ${a} cm = ${f} cm²। जाली में गिनकर देखो: ${f} छोटे वर्ग।`,
    ),
    formula: `a \\times a = ${a} \\times ${a} = ${f}${CM2}`,
    why: tx(
      `Square ka area = side × side. Har chhota square 1 cm × 1 cm = 1 cm² hai, to ${f} squares = ${f} cm².`,
      `Area of a square = side × side. Each small square is 1 cm × 1 cm = 1 cm², so ${f} squares = ${f} cm².`,
      `वर्ग का क्षेत्रफल = भुजा × भुजा। हर छोटा वर्ग 1 cm × 1 cm = 1 cm² है, तो ${f} वर्ग = ${f} cm²।`,
    ),
  };
  return { f, intro, oneFace };
}

function unfoldStep(a: number, total: number, faces: number, cue = 'unfold'): SolutionStep {
  return {
    id: cue,
    cue,
    duration: 5,
    narration: tx(
      `Ab cube ko kholo: ye uska net hai. Saaf dikhta hai ki ${faces} barabar squares hain, har ek ${squareArea(a)} cm².`,
      `Now open the cube flat: this is its net. You can clearly see ${faces} equal squares of ${squareArea(a)} cm² each.`,
      `अब घन को खोलो: यह उसका जाल है। साफ़ दिखता है कि ${faces} बराबर वर्ग हैं, हर एक ${squareArea(a)} cm²।`,
    ),
    formula: `${faces} \\times ${squareArea(a)} = ${total}${CM2}`,
    why: tx(
      'Net matlab cube ko khol ke flat karna. Jitna kaagaz net mein lagta hai, utna hi surface area hai.',
      'A net is the cube opened out flat. The paper the net uses is exactly the surface area.',
      'जाल यानी घन को खोलकर सपाट करना। जाल में जितना कागज़ लगता है, उतना ही पृष्ठीय क्षेत्रफल है।',
    ),
  };
}

export function solution(questionId: string, p: Params): SolutionScript {
  const a = p.a!;
  const tsa = cubeTSA(a);
  const lsa = cubeLSA(a);
  const { f, intro, oneFace } = shared(a);

  const remember = tx(
    'TSA = 6a² (saare 6 faces), LSA = 4a² (sirf 4 deewarein). Area hamesha square units (cm²) mein.',
    'TSA = 6a² (all 6 faces), LSA = 4a² (only the 4 walls). Area is always in square units (cm²).',
    'कुल पृष्ठीय क्षेत्रफल = 6a² (सभी 6 फलक), पार्श्व = 4a² (सिर्फ़ 4 दीवारें)। क्षेत्रफल हमेशा वर्ग इकाई (cm²) में।',
  );

  switch (questionId) {
    case 'lsa-and-tsa':
      return {
        steps: [
          intro,
          oneFace,
          {
            id: 'walls',
            cue: 'walls',
            duration: 5,
            narration: tx(
              `LSA matlab sirf 4 deewarein (aage, peeche, left, right): ${f}, ${2 * f}, ${3 * f}, ${lsa} cm².`,
              `LSA means only the 4 walls (front, back, left, right): ${f}, ${2 * f}, ${3 * f}, ${lsa} cm².`,
              `पार्श्व पृष्ठीय क्षेत्रफल यानी सिर्फ़ 4 दीवारें (आगे, पीछे, बाएँ, दाएँ): ${f}, ${2 * f}, ${3 * f}, ${lsa} cm²।`,
            ),
            formula: `\\text{LSA} = 4a^2 = 4 \\times ${f} = ${lsa}${CM2}`,
            why: tx(
              'Kamre ki deewaron par paint karte waqt chhat aur farsh nahi gine jaate. Wahi LSA hai.',
              'When you paint the walls of a room, the ceiling and floor are not counted. That is the LSA.',
              'कमरे की दीवारें रंगते समय छत और फ़र्श नहीं गिने जाते। वही पार्श्व पृष्ठीय क्षेत्रफल है।',
            ),
          },
          {
            id: 'lids',
            cue: 'lids',
            duration: 4,
            narration: tx(
              `TSA ke liye upar aur neeche ke 2 faces bhi jodo: ${lsa} + ${f} + ${f} = ${tsa} cm².`,
              `For TSA, also add the top and bottom faces: ${lsa} + ${f} + ${f} = ${tsa} cm².`,
              `कुल के लिए ऊपर और नीचे के 2 फलक भी जोड़ो: ${lsa} + ${f} + ${f} = ${tsa} cm²।`,
            ),
            formula: `\\text{TSA} = 6a^2 = 6 \\times ${f} = ${tsa}${CM2}`,
            why: tx(
              'TSA = LSA + 2 × (ek face). Cube mein ye 4a² + 2a² = 6a² hota hai.',
              'TSA = LSA + 2 × (one face). For a cube that is 4a² + 2a² = 6a².',
              'कुल = पार्श्व + 2 × (एक फलक)। घन में यह 4a² + 2a² = 6a² होता है।',
            ),
          },
          unfoldStep(a, tsa, 6),
        ],
        remember,
        mistake: tx(
          'LSA aur TSA ko ulat dena. LSA chhota hota hai (4 faces), TSA bada (6 faces).',
          'Swapping LSA and TSA. LSA is smaller (4 faces), TSA is bigger (6 faces).',
          'पार्श्व और कुल को उलट देना। पार्श्व छोटा होता है (4 फलक), कुल बड़ा (6 फलक)।',
        ),
      };

    case 'side-from-tsa':
      return {
        steps: [
          {
            id: 'all',
            cue: 'all-faces',
            duration: 4,
            narration: tx(
              `Hume pata hai ki 6 faces ka total area ${tsa} cm² hai. Saare faces barabar hain.`,
              `We know the 6 faces together have an area of ${tsa} cm². All the faces are equal.`,
              `हमें पता है कि 6 फलकों का कुल क्षेत्रफल ${tsa} cm² है। सभी फलक बराबर हैं।`,
            ),
            formula: `6a^2 = ${tsa}`,
          },
          {
            id: 'divide',
            cue: 'one-face',
            duration: 4.5,
            narration: tx(
              `To ek face ka area = ${tsa} ÷ 6 = ${f} cm².`,
              `So one face has an area of ${tsa} ÷ 6 = ${f} cm².`,
              `तो एक फलक का क्षेत्रफल = ${tsa} ÷ 6 = ${f} cm²।`,
            ),
            formula: `a^2 = \\dfrac{${tsa}}{6} = ${f}`,
            why: tx(
              '6 barabar hisse hain, to ek hissa = total ÷ 6.',
              'There are 6 equal parts, so one part = total ÷ 6.',
              '6 बराबर हिस्से हैं, तो एक हिस्सा = कुल ÷ 6।',
            ),
          },
          {
            id: 'root',
            cue: 'one-face',
            duration: 4.5,
            narration: tx(
              `Kaunsi side ka square ${f} deta hai? ${a} × ${a} = ${f}. Isliye side = ${a} cm.`,
              `Which side makes a square of ${f}? ${a} × ${a} = ${f}. So the side is ${a} cm.`,
              `किस भुजा का वर्ग ${f} देता है? ${a} × ${a} = ${f}। इसलिए भुजा = ${a} cm।`,
            ),
            formula: `a = \\sqrt{${f}} = ${a}\\,\\text{cm}`,
            why: tx(
              'Square root ulta kaam karta hai: area se side wapas laata hai.',
              'A square root works backwards: it takes you from the area back to the side.',
              'वर्गमूल उल्टा काम करता है: क्षेत्रफल से भुजा वापस लाता है।',
            ),
          },
          {
            id: 'check',
            cue: 'count-faces',
            duration: 5,
            narration: tx(
              `Check karo: 6 × ${a}² = 6 × ${f} = ${tsa} cm². Bilkul sahi!`,
              `Check: 6 × ${a}² = 6 × ${f} = ${tsa} cm². Exactly right!`,
              `जाँचो: 6 × ${a}² = 6 × ${f} = ${tsa} cm²। बिल्कुल सही!`,
            ),
            formula: `6 \\times ${a}^2 = ${tsa}${CM2}\\ \\checkmark`,
          },
        ],
        remember: tx(
          'Ulta sawaal: TSA ÷ 6 = ek face ka area, phir square root se side.',
          'Reverse question: TSA ÷ 6 = one face, then a square root gives the side.',
          'उल्टा सवाल: कुल ÷ 6 = एक फलक, फिर वर्गमूल से भुजा।',
        ),
        mistake: tx(
          `${tsa} ÷ 6 = ${f} par ruk jaana. Wo ek face ka area hai, side nahi.`,
          `Stopping at ${tsa} ÷ 6 = ${f}. That is the area of one face, not the side.`,
          `${tsa} ÷ 6 = ${f} पर रुक जाना। वह एक फलक का क्षेत्रफल है, भुजा नहीं।`,
        ),
      };

    case 'open-box': {
      const open = tsa - f;
      return {
        steps: [
          intro,
          {
            id: 'lid',
            cue: 'lid-off',
            duration: 4,
            narration: tx(
              'Dabba upar se khula hai, to upar wala face hai hi nahi. Sirf 5 faces bache.',
              'The box is open at the top, so the top face is not there. Only 5 faces are left.',
              'डिब्बा ऊपर से खुला है, तो ऊपर वाला फलक है ही नहीं। सिर्फ़ 5 फलक बचे।',
            ),
            formula: `6 - 1 = 5\\ \\text{faces}`,
          },
          oneFace,
          {
            id: 'five',
            cue: 'count-five',
            duration: 5,
            narration: tx(
              `Ab 5 faces ek-ek karke: ${f}, ${2 * f}, ${3 * f}, ${4 * f}, ${open} cm².`,
              `Now the 5 faces one by one: ${f}, ${2 * f}, ${3 * f}, ${4 * f}, ${open} cm².`,
              `अब 5 फलक एक-एक करके: ${f}, ${2 * f}, ${3 * f}, ${4 * f}, ${open} cm²।`,
            ),
            formula: `\\text{Area} = 6a^2 - a^2 = 5a^2 = 5 \\times ${f} = ${open}${CM2}`,
            why: tx(
              'Bahar se paint: 4 deewarein aur neeche ka tala dikhte hain. Dhakkan nahi hai, to wo face nahi gina.',
              'Painting the outside covers the 4 walls and the base. There is no lid, so that face is not counted.',
              'बाहर से रंगने पर 4 दीवारें और नीचे का तला आते हैं। ढक्कन नहीं है, तो वह फलक नहीं गिना।',
            ),
          },
          unfoldStep(a, open, 5, 'unfold-open'),
        ],
        remember: tx(
          'Pehle gino kitne faces sach mein hain. Khula dabba = 5 faces = 5a².',
          'First count how many faces really exist. An open box = 5 faces = 5a².',
          'पहले गिनो कितने फलक सच में हैं। खुला डिब्बा = 5 फलक = 5a²।',
        ),
        mistake: tx(
          'Bina soche 6a² laga dena, jabki dhakkan hai hi nahi.',
          'Using 6a² without thinking, even though there is no lid.',
          'बिना सोचे 6a² लगा देना, जबकि ढक्कन है ही नहीं।',
        ),
      };
    }

    default: // tsa-from-side
      return {
        steps: [
          intro,
          oneFace,
          {
            id: 'count',
            cue: 'count-faces',
            duration: 6,
            narration: tx(
              `Ab saare 6 faces ek-ek karke: ${f}, ${2 * f}, ${3 * f}, ${4 * f}, ${5 * f}, ${tsa} cm².`,
              `Now all 6 faces one by one: ${f}, ${2 * f}, ${3 * f}, ${4 * f}, ${5 * f}, ${tsa} cm².`,
              `अब सभी 6 फलक एक-एक करके: ${f}, ${2 * f}, ${3 * f}, ${4 * f}, ${5 * f}, ${tsa} cm²।`,
            ),
            formula: `\\underbrace{${f} + ${f} + \\dots + ${f}}_{6\\ \\text{faces}} = ${tsa}${CM2}`,
          },
          {
            id: 'formula',
            cue: 'formula',
            duration: 4,
            narration: tx(
              `Isliye TSA = 6 × a² = 6 × ${f} = ${tsa} cm².`,
              `So TSA = 6 × a² = 6 × ${f} = ${tsa} cm².`,
              `इसलिए कुल पृष्ठीय क्षेत्रफल = 6 × a² = 6 × ${f} = ${tsa} cm²।`,
            ),
            formula: `\\text{TSA} = 6a^2 = 6 \\times ${a}^2 = ${tsa}${CM2}`,
            why: tx(
              '6 faces, aur har face ka area a². Baar-baar jodne ki jagah 6 se guna kar do.',
              '6 faces, each with area a². Instead of adding six times, multiply by 6.',
              '6 फलक, और हर फलक का क्षेत्रफल a²। बार-बार जोड़ने के बजाय 6 से गुणा करो।',
            ),
          },
          unfoldStep(a, tsa, 6),
        ],
        remember,
        mistake: tx(
          `Sirf ek face (${f} cm²) likh dena, ya 6 × ${a} = ${6 * a} kar dena. Har face side × side hai.`,
          `Writing just one face (${f} cm²), or doing 6 × ${a} = ${6 * a}. Each face is side × side.`,
          `सिर्फ़ एक फलक (${f} cm²) लिख देना, या 6 × ${a} = ${6 * a} कर देना। हर फलक भुजा × भुजा है।`,
        ),
      };
  }
}
