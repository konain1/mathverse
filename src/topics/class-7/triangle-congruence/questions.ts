import { hypotenuse, missingLeg, thirdAngle } from '@/lib/geometry/formulas';
import { pick, randInt } from '@/lib/random';
import { defineQuestion, tx, type QuestionTemplate } from '@/topics/contract';
import { LATTICE, sidesOf, triFromBase, type Tri } from '@/topics/shared/tri/lattice';
import { RULE_OPTIONS, RULES } from '@/topics/shared/tri/words';
import { lengthText } from '@/lib/format';

const ANG = (s: string) => tx(s, s, s);
export const SSS_TRIS = ['scaleneAcute', 'iso566', 'right345', 'scaleneObtuse'] as const;
const RULE_LABEL = tx('Congruence ka rule', 'Congruence rule', 'सर्वांगसमता का नियम');
export const rightTri = (base: number, up: number): Tri => [[0, 0, -up], [0, 0, 0], [base, 0, 0]];

/** What each rule needs: shown when a student picks a rule that doesn't fit. */
const NEEDS: Record<(typeof RULES)[number], ReturnType<typeof tx>> = {
  SSS: tx('SSS ke liye teeno sides barabar chahiye.', 'SSS needs all three sides equal.', 'SSS के लिए तीनों भुजाएँ बराबर चाहिए।'),
  SAS: tx('SAS ke liye do sides aur unke BEECH ka angle chahiye.', 'SAS needs two sides and the angle BETWEEN them.', 'SAS के लिए दो भुजाएँ और उनके बीच का कोण चाहिए।'),
  ASA: tx('ASA ke liye do angles aur unke BEECH ki side chahiye.', 'ASA needs two angles and the side BETWEEN them.', 'ASA के लिए दो कोण और उनके बीच की भुजा चाहिए।'),
  RHS: tx('RHS sirf right triangles ke liye: right angle, hypotenuse aur ek side.', 'RHS is only for right triangles: right angle, hypotenuse and one side.', 'RHS सिर्फ़ समकोण त्रिभुजों के लिए: समकोण, कर्ण और एक भुजा।'),
};
const ruleMistakes = (right: (typeof RULES)[number]) =>
  RULES.filter((r) => r !== right).map((r) => ({ answerId: 'rule', value: RULES.indexOf(r), message: NEEDS[r] }));
const ruleAnswer = (r: (typeof RULES)[number]) => ({ id: 'rule', label: RULE_LABEL, options: RULE_OPTIONS, value: RULES.indexOf(r), unit: 'none' as const });

export const questions: QuestionTemplate[] = [
  defineQuestion({
    id: 'sss',
    level: 'basic',
    params: { i: 0 },
    generate: (rng) => ({ i: randInt(rng, 0, SSS_TRIS.length - 1) }),
    prompt: ({ i }) => {
      const a = lengthText(sidesOf(LATTICE[SSS_TRIS[i]!])[0]);
      return tx(
        `Triangles ABC aur DEF mein AB = DE, BC = EF aur CA = FD hai. Ye kis rule se congruent hain? Agar BC = ${a} hai to EF kitna?`,
        `In triangles ABC and DEF, AB = DE, BC = EF and CA = FD. By which rule are they congruent? If BC = ${a}, what is EF?`,
        `त्रिभुज ABC और DEF में AB = DE, BC = EF और CA = FD है। ये किस नियम से सर्वांगसम हैं? अगर BC = ${a} है तो EF कितना?`,
      );
    },
    given: ({ i }) => [{ label: ANG('BC'), value: Math.round(sidesOf(LATTICE[SSS_TRIS[i]!])[0] * 100) / 100, unit: 'cm' }],
    find: () => [RULE_LABEL, ANG('EF')],
    answers: ({ i }) => [ruleAnswer('SSS'), { id: 'ef', label: ANG('EF'), value: sidesOf(LATTICE[SSS_TRIS[i]!])[0], unit: 'cm' }],
    mistakes: () => ruleMistakes('SSS'),
  }),
  defineQuestion({
    id: 'sas',
    level: 'medium',
    params: { k: 1 },
    generate: (rng) => ({ k: randInt(rng, 1, 2) }),
    prompt: ({ k }) =>
      tx(
        `AB = DE = ${4 * k} cm, BC = EF = ${3 * k} cm aur ∠B = ∠E = 90°. Triangles ABC aur DEF kis rule se congruent hain? CA kitna hai?`,
        `AB = DE = ${4 * k} cm, BC = EF = ${3 * k} cm and ∠B = ∠E = 90°. By which rule are triangles ABC and DEF congruent? How long is CA?`,
        `AB = DE = ${4 * k} cm, BC = EF = ${3 * k} cm और ∠B = ∠E = 90°। त्रिभुज ABC और DEF किस नियम से सर्वांगसम हैं? CA कितना है?`,
      ),
    given: ({ k }) => [
      { label: ANG('AB = DE'), value: 4 * k, unit: 'cm' },
      { label: ANG('BC = EF'), value: 3 * k, unit: 'cm' },
      { label: ANG('∠B = ∠E'), value: 90, unit: 'deg' },
    ],
    find: () => [RULE_LABEL, ANG('CA')],
    answers: ({ k }) => [ruleAnswer('SAS'), { id: 'ca', label: ANG('CA'), value: hypotenuse(3 * k, 4 * k), unit: 'cm' }],
    mistakes: () => ruleMistakes('SAS'),
  }),
  defineQuestion({
    id: 'asa',
    level: 'hard',
    params: { k: 3 },
    generate: (rng) => ({ k: randInt(rng, 2, 5) }),
    prompt: ({ k }) =>
      tx(
        `∠B = ∠E = 45°, ∠C = ∠F = 45° aur BC = EF = ${2 * k} cm. Triangles ABC aur DEF kis rule se congruent hain? ∠D kitna hai?`,
        `∠B = ∠E = 45°, ∠C = ∠F = 45° and BC = EF = ${2 * k} cm. By which rule are triangles ABC and DEF congruent? What is ∠D?`,
        `∠B = ∠E = 45°, ∠C = ∠F = 45° और BC = EF = ${2 * k} cm। त्रिभुज ABC और DEF किस नियम से सर्वांगसम हैं? ∠D कितना है?`,
      ),
    given: ({ k }) => [
      { label: ANG('∠B = ∠E'), value: 45, unit: 'deg' },
      { label: ANG('∠C = ∠F'), value: 45, unit: 'deg' },
      { label: ANG('BC = EF'), value: 2 * k, unit: 'cm' },
    ],
    find: () => [RULE_LABEL, ANG('∠D')],
    answers: () => [ruleAnswer('ASA'), { id: 'd', label: ANG('∠D'), value: thirdAngle(45, 45), unit: 'deg' }],
    mistakes: () => ruleMistakes('ASA'),
  }),
  defineQuestion({
    id: 'rhs',
    level: 'challenge',
    params: { h: 10, s: 6 },
    generate: (rng) => {
      const [h, s] = pick(rng, [[5, 3], [5, 4], [10, 6], [10, 8]] as const);
      return { h, s };
    },
    prompt: ({ h, s }) =>
      tx(
        `∠B = ∠E = 90°, hypotenuse AC = DF = ${h} cm aur BC = EF = ${s} cm. Triangles kis rule se congruent hain? DE kitna hai?`,
        `∠B = ∠E = 90°, hypotenuse AC = DF = ${h} cm and BC = EF = ${s} cm. By which rule are the triangles congruent? How long is DE?`,
        `∠B = ∠E = 90°, कर्ण AC = DF = ${h} cm और BC = EF = ${s} cm। त्रिभुज किस नियम से सर्वांगसम हैं? DE कितना है?`,
      ),
    given: ({ h, s }) => [
      { label: ANG('∠B = ∠E'), value: 90, unit: 'deg' },
      { label: ANG('AC = DF'), value: h, unit: 'cm' },
      { label: ANG('BC = EF'), value: s, unit: 'cm' },
    ],
    find: () => [RULE_LABEL, ANG('DE')],
    answers: ({ h, s }) => [ruleAnswer('RHS'), { id: 'de', label: ANG('DE'), value: missingLeg(h, s), unit: 'cm' }],
    mistakes: () => ruleMistakes('RHS'),
  }),
];

/** Triangle ABC for each question (DEF is a copy). */
export function triOf(id: string, p: Record<string, number>): Tri {
  switch (id) {
    case 'sas':
      return rightTri(3 * p.k!, 4 * p.k!);
    case 'asa':
      return triFromBase(2 * p.k!, p.k!, p.k!);
    case 'rhs':
      return rightTri(p.s!, missingLeg(p.h!, p.s!));
    default:
      return LATTICE[SSS_TRIS[p.i!]!];
  }
}
export const ruleOf = (id: string) => ({ sss: 'SSS', sas: 'SAS', asa: 'ASA', rhs: 'RHS' })[id] as (typeof RULES)[number];
