/**
 * Guided recipes for triangles: an exact triangle (with optional median /
 * altitude / extended side), "any triangle of this type", and a congruent copy
 * of a triangle that is already on the grid.
 */
import type { GuideOverlay } from '@/features/build/scene/GhostLayer';
import { addFaceAt, emptyConstruction, findEdge, findPointAt, pointPos, type Construction, type CFace } from '@/lib/geometry/construction';
import type { TriangleByAngles, TriangleBySides } from '@/lib/geometry/formulas';
import { checkTriangle, describeTriangle, type Issue } from '@/lib/geometry/validators';
import { add, angleBetweenDeg, cross, distance, dot, isRightAngle, midpoint, normalize, scale, sub, type Vec3 } from '@/lib/geometry/vector';
import { tx, type BuildPlan, type GuidedStep } from '@/topics/contract';
import type { Tri } from '@/topics/shared/tri/lattice';
import { sidesOf } from '@/topics/shared/tri/lattice';
import { edgeLength } from '@/lib/geometry/construction';
import { groundEdges, homeFor, inGrid, lineEnd, onGround, sameLen } from './recipes';

type Seg = [Vec3, Vec3];
const triSegs = ([A, B, C]: Tri): Seg[] => [[A, B], [B, C], [C, A]];
const sorted = (xs: number[]) => [...xs].sort((p, q) => p - q);

export function triangleFaces(c: Construction): CFace[] {
  return Object.values(c.faces).filter((f) => f.points.length === 3 && onGround(c, f.points));
}

/** A triangle face whose sides match `target` (any position / orientation). */
export function findTriangle(c: Construction, target: Tri, except?: string): CFace | undefined {
  const want = sorted(sidesOf(target));
  return triangleFaces(c).find((f) => {
    if (f.id === except) return false;
    const [p, q, r] = f.points.map((id) => pointPos(c, id)) as Tri;
    const got = sorted(sidesOf([p, q, r]));
    return got.every((g, i) => sameLen(g, want[i]!));
  });
}

/** Which built point is A, B, C — matched by the length of the opposite side. */
export function labelVertices(c: Construction, f: CFace, target: Tri): Record<'A' | 'B' | 'C', Vec3> | undefined {
  const [a, b, cc] = sidesOf(target);
  const pts = f.points.map((id) => pointPos(c, id));
  const perms = [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]];
  for (const [i, j, k] of perms) {
    const A = pts[i!]!;
    const B = pts[j!]!;
    const C = pts[k!]!;
    if (sameLen(distance(B, C), a) && sameLen(distance(C, A), b) && sameLen(distance(A, B), cc)) return { A, B, C };
  }
  return undefined;
}

const hasEdgeBetween = (c: Construction, p: Vec3, q: Vec3) => {
  const a = findPointAt(c, p);
  const b = findPointAt(c, q);
  return Boolean(a && b && findEdge(c, a, b));
};

/** Foot of the perpendicular from P onto line QR. */
export function footOf(P: Vec3, Q: Vec3, R: Vec3): Vec3 {
  const d = normalize(sub(R, Q));
  return add(Q, scale(d, dot(sub(P, Q), d)));
}

export interface TriExtras {
  /** median from A, or all three medians */
  median?: 'A' | 'all';
  altitude?: boolean;
  /** extend BC beyond C by this many cm */
  extend?: number;
}

const L = tx;
const sidesText = (t: Tri) => {
  const [a, b, c] = sidesOf(t).map((x) => {
    const r = Math.round(x * 100) / 100;
    return Number.isInteger(r) ? `${r}` : `${r}`;
  });
  return { a, b, c };
};

/** Exact triangle: B → BC → pick A, plus optional median / altitude / extension steps. */
export function exactTrianglePlan(tri: Tri, extras: TriExtras = {}): BuildPlan {
  const [A0, B0, C0] = tri;
  const [a] = sidesOf(tri);
  const { b: bTxt, c: cTxt } = sidesText(tri);
  const face = (c: Construction) => findTriangle(c, tri);
  const vertsOf = (c: Construction) => {
    const f = face(c);
    return f ? labelVertices(c, f, tri) : undefined;
  };

  const steps: GuidedStep[] = [
    {
      id: 'point',
      tool: 'point',
      instruction: L('Pehle corner B rakho.', 'First place corner B.', 'पहले कोना B रखो।'),
      guide: (c) => (Object.keys(c.points).length === 0 ? { points: [B0] } : undefined),
      evaluate: (c) => ({ done: Object.keys(c.points).length >= 1, issues: [] }),
    },
    {
      id: 'base',
      tool: 'line',
      instruction: L(`Ab base BC kheencho: ${a} cm.`, `Now draw the base BC: ${a} cm.`, `अब आधार BC खींचो: ${a} cm।`),
      guide: (c) => {
        const start = Object.values(c.points)[0]?.pos ?? B0;
        const end = lineEnd(start, a);
        return { points: [end], segments: [[start, end]] };
      },
      evaluate: (c) => {
        const done = groundEdges(c).some((e) => sameLen(edgeLength(c, e.id), a));
        const issues: Issue[] = done
          ? []
          : groundEdges(c).map((e) => ({ code: 'line-wrong-length', entities: [e.id], values: { actual: Math.round(edgeLength(c, e.id) * 100) / 100, expected: a } }));
        return { done, issues };
      },
    },
    {
      id: 'apex',
      tool: 'face',
      faceIntent: 'triangle',
      instruction: L(
        `Ab Face tool se B, C aur teesra corner A chuno, jahan AB = ${cTxt} cm aur AC = ${bTxt} cm ho.`,
        `Now with the Face tool pick B, C and the third corner A, where AB = ${cTxt} cm and AC = ${bTxt} cm.`,
        `अब फलक टूल से B, C और तीसरा कोना A चुनो, जहाँ AB = ${cTxt} cm और AC = ${bTxt} cm हो।`,
      ),
      guide: (c) => {
        const e = groundEdges(c).find((x) => sameLen(edgeLength(c, x.id), a));
        if (!e) return undefined;
        const P = pointPos(c, e.a);
        const Q = pointPos(c, e.b);
        const u = normalize(sub(Q, P));
        const w = cross(u, [0, 1, 0]);
        const along = A0[0] - B0[0];
        const up = -(A0[2] - B0[2]);
        let Ap = add(add(P, scale(u, along)), scale(w, -up));
        if (!inGrid(Ap)) Ap = add(add(P, scale(u, along)), scale(w, up));
        return { points: [Ap], segments: [[P, Ap], [Q, Ap]] };
      },
      evaluate: (c) => {
        if (face(c)) return { done: true, issues: [] };
        const want = sidesOf(tri);
        const issues = triangleFaces(c).flatMap((f) =>
          checkTriangle(c, f.points, { sides: want }).issues.map((i) => ({ ...i, entities: [...i.entities, f.id] })),
        );
        return { done: false, issues };
      },
    },
  ];

  const extraSegs: Seg[] = [];
  const medianStep = (from: 'A' | 'B' | 'C'): GuidedStep => {
    const others = (['A', 'B', 'C'] as const).filter((v) => v !== from) as ['A' | 'B' | 'C', 'A' | 'B' | 'C'];
    const target = (v: Record<'A' | 'B' | 'C', Vec3>): Seg => [v[from], midpoint(v[others[0]], v[others[1]])];
    const canon = { A: A0, B: B0, C: C0 };
    extraSegs.push(target(canon));
    return {
      id: `median-${from}`,
      tool: 'line',
      instruction: L(
        `Median kheencho: ${from} se saamne wali side ${others.join('')} ke beech (midpoint) tak.`,
        `Draw the median: from ${from} to the midpoint of the opposite side ${others.join('')}.`,
        `माध्यिका खींचो: ${from} से सामने वाली भुजा ${others.join('')} के मध्य-बिंदु तक।`,
      ),
      guide: (c) => {
        const v = vertsOf(c);
        if (!v) return undefined;
        const [p, q] = target(v);
        return { points: [q], segments: [[p, q]] };
      },
      evaluate: (c) => {
        const v = vertsOf(c);
        if (!v) return { done: false, issues: [] };
        const [p, q] = target(v);
        return { done: hasEdgeBetween(c, p, q), issues: [] };
      },
    };
  };
  if (extras.median === 'A') steps.push(medianStep('A'));
  if (extras.median === 'all') steps.push(medianStep('A'), medianStep('B'), medianStep('C'));
  if (extras.altitude) {
    extraSegs.push([A0, footOf(A0, B0, C0)]);
    steps.push({
      id: 'altitude',
      tool: 'line',
      instruction: L(
        'Altitude kheencho: A se BC par seedhi khadi line, jo BC se 90° banaye.',
        'Draw the altitude: from A straight down to BC, meeting it at 90°.',
        'शीर्षलंब खींचो: A से BC पर सीधी खड़ी रेखा, जो BC से 90° बनाए।',
      ),
      guide: (c) => {
        const v = vertsOf(c);
        if (!v) return undefined;
        const D = footOf(v.A, v.B, v.C);
        return { points: [D], segments: [[v.A, D]] };
      },
      evaluate: (c) => {
        const v = vertsOf(c);
        if (!v) return { done: false, issues: [] };
        return { done: hasEdgeBetween(c, v.A, footOf(v.A, v.B, v.C)), issues: [] };
      },
    });
  }
  if (extras.extend) {
    const e = extras.extend;
    extraSegs.push([C0, add(C0, scale(normalize(sub(C0, B0)), e))]);
    steps.push({
      id: 'extend',
      tool: 'line',
      instruction: L(
        `Ab side BC ko C ke aage ${e} cm badhao (point D tak).`,
        `Now extend side BC beyond C by ${e} cm (to point D).`,
        `अब भुजा BC को C के आगे ${e} cm बढ़ाओ (बिंदु D तक)।`,
      ),
      guide: (c) => {
        const v = vertsOf(c);
        if (!v) return undefined;
        const D = add(v.C, scale(normalize(sub(v.C, v.B)), e));
        return { points: [D], segments: [[v.C, D]] };
      },
      evaluate: (c) => {
        const v = vertsOf(c);
        if (!v) return { done: false, issues: [] };
        const cid = findPointAt(c, v.C);
        const dir = normalize(sub(v.C, v.B));
        const done = Object.values(c.edges).some((ed) => {
          if (ed.a !== cid && ed.b !== cid) return false;
          const other = pointPos(c, ed.a === cid ? ed.b : ed.a);
          return angleBetweenDeg(sub(other, v.C), dir) < 0.5;
        });
        return { done, issues: [] };
      },
    });
  }

  return {
    steps,
    check: (c) => {
      const failing = steps.map((s) => s.evaluate(c)).filter((r) => !r.done);
      if (failing.length === 0) return { ok: true, issues: [] };
      const issues = failing.flatMap((r) => r.issues);
      return {
        ok: false,
        issues: issues.length ? issues : [{ code: 'count-mismatch', entities: [], values: { what: 'edges', actual: Object.keys(c.edges).length, expected: 3 + extraSegs.length } }],
      };
    },
    target: { segments: [...triSegs(tri), ...extraSegs] },
    hints: {
      nudge: L(
        `Teen sides chahiye: BC = ${a} cm, CA = ${bTxt} cm, AB = ${cTxt} cm.`,
        `You need three sides: BC = ${a} cm, CA = ${bTxt} cm, AB = ${cTxt} cm.`,
        `तीन भुजाएँ चाहिए: BC = ${a} cm, CA = ${bTxt} cm, AB = ${cTxt} cm।`,
      ),
      clue: L(
        `Base BC ${a} cm ki line kheencho. A, B se ${Math.abs(A0[0])} cm ${A0[0] >= 0 ? 'right' : 'left'} aur ${-A0[2]} cm upar hai.`,
        `Draw the ${a} cm base BC. A is ${Math.abs(A0[0])} cm ${A0[0] >= 0 ? 'right of' : 'left of'} B and ${-A0[2]} cm up.`,
        `आधार BC ${a} cm की रेखा खींचो। A, B से ${Math.abs(A0[0])} cm ${A0[0] >= 0 ? 'दाएँ' : 'बाएँ'} और ${-A0[2]} cm ऊपर है।`,
      ),
    },
    home: homeFor(Math.max(a, -A0[2]) * 1.1, [(Math.min(A0[0], 0) + Math.max(A0[0], C0[0])) / 2, 0, A0[2] / 2]),
  };
}

const SIDE_NAMES: Record<TriangleBySides, [string, string, string]> = {
  equilateral: ['equilateral', 'equilateral', 'समबाहु'],
  isosceles: ['isosceles', 'isosceles', 'समद्विबाहु'],
  scalene: ['scalene', 'scalene', 'विषमबाहु'],
};
const ANGLE_NAMES: Record<TriangleByAngles, [string, string, string]> = {
  acute: ['acute', 'acute', 'न्यूनकोण'],
  right: ['right', 'right', 'समकोण'],
  obtuse: ['obtuse', 'obtuse', 'अधिककोण'],
};

/** "Build any triangle that is …" — checked by classifying what the student built. */
export function anyTrianglePlan(opts: { bySides?: TriangleBySides; byAngles?: TriangleByAngles; example: Tri }): BuildPlan {
  const { bySides, byAngles, example } = opts;
  const words = [bySides && SIDE_NAMES[bySides], byAngles && ANGLE_NAMES[byAngles]].filter(Boolean) as [string, string, string][];
  const kind = (i: 0 | 1 | 2) => words.map((w) => w[i]).join(' ') || ['koi bhi', 'any', 'कोई भी'][i];
  const fits = (c: Construction, f: CFace) => {
    const d = describeTriangle(c, f.points);
    return Boolean(d && (!bySides || d.bySides === bySides) && (!byAngles || d.byAngles === byAngles));
  };
  const issuesFor = (c: Construction): Issue[] =>
    triangleFaces(c)
      .filter((f) => !fits(c, f))
      .map((f) => {
        const d = describeTriangle(c, f.points);
        return d
          ? {
              code: 'triangle-type-mismatch' as const,
              entities: [f.id],
              values: { actualType: byAngles && d.byAngles !== byAngles ? d.byAngles : d.bySides, expectedType: byAngles && d.byAngles !== byAngles ? byAngles : (bySides ?? '') },
            }
          : { code: 'collinear' as const, entities: [f.id] };
      });
  const steps: GuidedStep[] = [
    {
      id: 'triangle',
      tool: 'face',
      faceIntent: 'triangle',
      instruction: L(
        `Face tool se teen corners chun ke ek ${kind(0)} triangle banao. Ghost ek misaal hai; tum apna bhi bana sakte ho.`,
        `With the Face tool, pick three corners to make an ${kind(1)} triangle. The ghost is one example; you can make your own.`,
        `फलक टूल से तीन कोने चुनकर एक ${kind(2)} त्रिभुज बनाओ। भूत एक उदाहरण है; तुम अपना भी बना सकते हो।`,
      ),
      guide: (c) => (triangleFaces(c).some((f) => fits(c, f)) ? undefined : { points: [...example], segments: triSegs(example) }),
      evaluate: (c) => (triangleFaces(c).some((f) => fits(c, f)) ? { done: true, issues: [] } : { done: false, issues: issuesFor(c) }),
    },
  ];
  return {
    steps,
    check: (c) => {
      const ok = triangleFaces(c).some((f) => fits(c, f));
      const issues = issuesFor(c);
      return ok ? { ok, issues: [] } : { ok, issues: issues.length ? issues : [{ code: 'count-mismatch', entities: [], values: { what: 'faces', actual: 0, expected: 1 } }] };
    },
    target: { segments: triSegs(example) },
    hints: {
      nudge: L(
        `${kind(0)} triangle ki pehchaan yaad karo.`,
        `Remember what makes a triangle ${kind(1)}.`,
        `${kind(2)} त्रिभुज की पहचान याद करो।`,
      ),
      clue: L(
        byAngles === 'right' ? 'Ek corner par 90° chahiye: ek side x ki taraf, doosri z ki taraf.' : byAngles === 'obtuse' ? 'Apex ko base ke bahar ki taraf le jao, ek angle 90° se bada ho jayega.' : 'Apex ko base ke beech ke upar rakho.',
        byAngles === 'right' ? 'One corner must be 90°: one side along x, the other along z.' : byAngles === 'obtuse' ? 'Move the apex past the end of the base so one angle goes over 90°.' : 'Put the apex above the middle of the base.',
        byAngles === 'right' ? 'एक कोने पर 90° चाहिए: एक भुजा x की ओर, दूसरी z की ओर।' : byAngles === 'obtuse' ? 'शीर्ष को आधार के बाहर की ओर ले जाओ, एक कोण 90° से बड़ा हो जाएगा।' : 'शीर्ष को आधार के बीच के ऊपर रखो।',
      ),
    },
    home: homeFor(7, [3, 0, -2]),
  };
}

/** A triangle is already on the grid; the student builds a congruent one beside it. */
export function congruentCopyPlan(tri: Tri, offset: Vec3 = [0, 0, 4]): BuildPlan {
  const init = addFaceAt(emptyConstruction(), [...tri], 'triangle');
  if (!init.ok) throw new Error(`bad triangle: ${init.error}`);
  const original = Object.keys(init.c.faces)[0]!;
  const copy = tri.map((p) => add(p, offset)) as Tri;
  const steps: GuidedStep[] = [
    {
      id: 'copy',
      tool: 'face',
      faceIntent: 'triangle',
      instruction: L(
        'Triangle ABC pehle se bana hai. Ab iske bilkul barabar (congruent) triangle DEF banao, neeche ghost wali jagah par ya kahin bhi.',
        'Triangle ABC is already drawn. Now build a triangle DEF exactly equal (congruent) to it, where the ghost is or anywhere else.',
        'त्रिभुज ABC पहले से बना है। अब इसके बिल्कुल बराबर (सर्वांगसम) त्रिभुज DEF बनाओ, भूत वाली जगह पर या कहीं भी।',
      ),
      guide: (c) => (findTriangle(c, tri, original) ? undefined : { points: [...copy], segments: triSegs(copy) }),
      evaluate: (c) => {
        if (findTriangle(c, tri, original)) return { done: true, issues: [] };
        const issues = triangleFaces(c)
          .filter((f) => f.id !== original)
          .flatMap((f) => checkTriangle(c, f.points, { sides: sidesOf(tri) }).issues.map((i) => ({ ...i, entities: [...i.entities, f.id] })));
        return { done: false, issues };
      },
    },
  ];
  return {
    initial: init.c,
    steps,
    check: (c) => {
      const r = steps[0]!.evaluate(c);
      return r.done ? { ok: true, issues: [] } : { ok: false, issues: r.issues.length ? r.issues : [{ code: 'count-mismatch', entities: [], values: { what: 'faces', actual: Object.keys(c.faces).length, expected: 2 } }] };
    },
    target: { segments: [...triSegs(tri), ...triSegs(copy)] },
    hints: {
      nudge: L('Congruent matlab teeno sides barabar.', 'Congruent means all three sides equal.', 'सर्वांगसम यानी तीनों भुजाएँ बराबर।'),
      clue: L(
        'Har corner ko ek hi doori par neeche khiskao: shape wahi rahegi.',
        'Shift every corner by the same amount: the shape stays the same.',
        'हर कोने को एक ही दूरी पर नीचे खिसकाओ: आकार वही रहेगा।',
      ),
    },
    // frame both the original and the copy below it
    home: homeFor(12, [3, 0, (Math.min(...tri.map((p) => p[2])) + Math.max(...copy.map((p) => p[2]))) / 2 + 1]),
  };
}

export const isRight = (a: Vec3, v: Vec3, b: Vec3) => isRightAngle(angleBetweenDeg(sub(a, v), sub(b, v)));
export type { GuideOverlay };
