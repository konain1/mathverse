import { hypotenuse, missingLeg } from '@/lib/geometry/formulas';
import { lengthText } from '@/lib/format';
import { tx, type Params, type SolutionScript } from '@/topics/contract';
import { CM, step } from '@/topics/shared/flat/steps';
import { sidesOf } from '@/topics/shared/tri/lattice';
import { ruleOf, triOf } from './questions';

const remember = tx(
  'SSS: 3 sides. SAS: 2 sides + beech ka angle. ASA: 2 angles + beech ki side. RHS: right angle + hypotenuse + ek side. Congruent triangles ke saare matching hisse barabar hote hain.',
  'SSS: 3 sides. SAS: 2 sides + the angle between. ASA: 2 angles + the side between. RHS: right angle + hypotenuse + one side. All matching parts of congruent triangles are equal.',
  'SSS: 3 भुजाएँ। SAS: 2 भुजाएँ + बीच का कोण। ASA: 2 कोण + बीच की भुजा। RHS: समकोण + कर्ण + एक भुजा। सर्वांगसम त्रिभुजों के सभी संगत भाग बराबर होते हैं।',
);

const MATCH: Record<string, [string, string, string]> = {
  SSS: ['Teeno sides barabar: AB = DE, BC = EF, CA = FD (1, 2, 3 tick).', 'All three sides match: AB = DE, BC = EF, CA = FD (1, 2, 3 ticks).', 'तीनों भुजाएँ बराबर: AB = DE, BC = EF, CA = FD (1, 2, 3 निशान)।'],
  SAS: ['Do sides (AB = DE, BC = EF) aur unke BEECH ka angle ∠B = ∠E barabar.', 'Two sides (AB = DE, BC = EF) and the angle BETWEEN them, ∠B = ∠E, match.', 'दो भुजाएँ (AB = DE, BC = EF) और उनके बीच का कोण ∠B = ∠E बराबर।'],
  ASA: ['Do angles (∠B = ∠E, ∠C = ∠F) aur unke BEECH ki side BC = EF barabar.', 'Two angles (∠B = ∠E, ∠C = ∠F) and the side BETWEEN them, BC = EF, match.', 'दो कोण (∠B = ∠E, ∠C = ∠F) और उनके बीच की भुजा BC = EF बराबर।'],
  RHS: ['Right angle (∠B = ∠E = 90°), hypotenuse (AC = DF) aur ek side (BC = EF) barabar.', 'The right angle (∠B = ∠E = 90°), the hypotenuse (AC = DF) and one side (BC = EF) match.', 'समकोण (∠B = ∠E = 90°), कर्ण (AC = DF) और एक भुजा (BC = EF) बराबर।'],
};

export function solution(id: string, p: Params): SolutionScript {
  const rule = ruleOf(id);
  const tri = triOf(id, p);
  const [a, b, c] = sidesOf(tri);
  const answer = (() => {
    switch (id) {
      case 'sas':
        return step('answer', 'match', 4.5, [
          `Ab CA = FD, aur Pythagoras se CA = √(${a}² + ${c}²) = ${hypotenuse(a, c)} cm.`,
          `Now CA = FD, and by Pythagoras CA = √(${a}² + ${c}²) = ${hypotenuse(a, c)} cm.`,
          `अब CA = FD, और पाइथागोरस से CA = √(${a}² + ${c}²) = ${hypotenuse(a, c)} cm।`,
        ], `CA = \\sqrt{${a}^2 + ${c}^2} = ${hypotenuse(a, c)}${CM}`);
      case 'asa':
        return step('answer', 'match', 4.5, [
          '∠D = ∠A = 180° − 45° − 45° = 90°.',
          '∠D = ∠A = 180° − 45° − 45° = 90°.',
          '∠D = ∠A = 180° − 45° − 45° = 90°।',
        ], `\\angle D = \\angle A = 90^\\circ`);
      case 'rhs':
        return step('answer', 'match', 4.5, [
          `DE = AB = √(${b}² − ${a}²) = ${missingLeg(b, a)} cm.`,
          `DE = AB = √(${b}² − ${a}²) = ${missingLeg(b, a)} cm.`,
          `DE = AB = √(${b}² − ${a}²) = ${missingLeg(b, a)} cm।`,
        ], `DE = \\sqrt{${b}^2 - ${a}^2} = ${missingLeg(b, a)}${CM}`);
      default:
        return step('answer', 'match', 4, [
          `EF = BC = ${lengthText(a)}.`,
          `EF = BC = ${lengthText(a)}.`,
          `EF = BC = ${lengthText(a)}।`,
        ]);
    }
  })();
  return {
    steps: [
      step('intro', 'intro', 3.5, [
        'Triangle ABC, aur paas mein ek aur triangle DEF (ghooma ya palta hua).',
        'Triangle ABC, and next to it another triangle DEF (turned or flipped).',
        'त्रिभुज ABC, और पास में एक और त्रिभुज DEF (घूमा या पलटा हुआ)।',
      ]),
      step('match', 'match', 5, MATCH[rule]!, `\\triangle ABC \\cong \\triangle DEF\\ (\\text{${rule}})`, [
        'Itni cheezein barabar hon to triangle ki shape poori tarah tay ho jaati hai: doosra triangle alag ban hi nahi sakta.',
        'When these parts match, the shape of the triangle is completely fixed: the other triangle cannot come out different.',
        'इतनी चीज़ें बराबर हों तो त्रिभुज का आकार पूरी तरह तय हो जाता है: दूसरा त्रिभुज अलग बन ही नहीं सकता।',
      ]),
      step('superpose', 'superpose', 6, [
        'DEF ko utha ke khiskao, ghumao aur zaroorat ho to palto: wo ABC par bilkul fit baith jaata hai.',
        'Lift DEF, slide it, turn it and, if needed, flip it: it fits exactly on ABC.',
        'DEF को उठाकर खिसकाओ, घुमाओ और ज़रूरत हो तो पलटो: वह ABC पर बिल्कुल फ़िट बैठ जाता है।',
      ]),
      answer,
    ],
    remember,
    mistake: tx(
      'SAS mein angle do sides ke beech hona chahiye. Agar angle beech mein nahi hai (SSA), to congruence pakki nahi.',
      'In SAS the angle must be between the two sides. If it isn’t (SSA), congruence is not guaranteed.',
      'SAS में कोण दो भुजाओं के बीच होना चाहिए। अगर कोण बीच में नहीं है (SSA), तो सर्वांगसमता पक्की नहीं।',
    ),
  };
}
