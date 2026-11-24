/**
 * Guided recipes for flat figures on the ground grid: squares and rectangles
 * (optionally with diagonals), a square built from its diagonals, and a
 * rectangle inside / around another (frames and paths).
 */
import type { BuildPlan, GuidedStep } from '@/topics/contract';
import type { GuideOverlay } from '@/features/build/scene/GhostLayer';
import { counts, edgeLength, findEdge, pointPos, type Construction, type CFace } from '@/lib/geometry/construction';
import { checkRectangle, checkSquare, type CheckResult, type Issue } from '@/lib/geometry/validators';
import { add, angleBetweenDeg, isRightAngle, midpoint, normalize, roundTo, scale, sub, equals, type Vec3 } from '@/lib/geometry/vector';
import { tx } from '@/topics/contract';
import { firstPoint, groundEdges, homeFor, lineEnd, onGround, rectOnEdge, sameLen } from './recipes';

type Seg = [Vec3, Vec3];
const loop = (pts: Vec3[]): Seg[] => pts.map((p, i) => [p, pts[(i + 1) % pts.length]!]);
const isSquare = (l: number, b: number) => sameLen(l, b);

/** A ground quad face with these side lengths (l × b in either orientation). */
export function findQuad(c: Construction, l: number, b: number): CFace | undefined {
  return Object.values(c.faces).find(
    (f) =>
      f.points.length === 4 &&
      onGround(c, f.points) &&
      (isSquare(l, b)
        ? checkSquare(c, f.points, { side: l }).ok
        : checkRectangle(c, f.points, { length: l, breadth: b }).ok),
  );
}

function quadIssues(c: Construction, l: number, b: number): Issue[] {
  return Object.values(c.faces).flatMap((f) => {
    const r = isSquare(l, b) ? checkSquare(c, f.points, { side: l }) : checkRectangle(c, f.points, { length: l, breadth: b });
    return r.issues.map((i) => ({ ...i, entities: [...i.entities, f.id] }));
  });
}

/** How many of the face's two diagonals have been drawn. */
export function diagonalsDrawn(c: Construction, f: CFace): number {
  const [p0, p1, p2, p3] = f.points as [string, string, string, string];
  return (findEdge(c, p0, p2) ? 1 : 0) + (findEdge(c, p1, p3) ? 1 : 0);
}

function lineStep(len: number, instruction: ReturnType<typeof tx>): GuidedStep {
  return {
    id: 'edge',
    tool: 'line',
    instruction,
    guide: (c) => {
      const start = firstPoint(c) ?? [0, 0, 0];
      const end = lineEnd(start, len);
      return { points: [end], segments: [[start, end]] };
    },
    evaluate: (c) => {
      const edges = groundEdges(c);
      const done = edges.some((e) => sameLen(edgeLength(c, e.id), len));
      const issues: Issue[] = done
        ? []
        : edges.map((e) => ({ code: 'line-wrong-length', entities: [e.id], values: { actual: roundTo(edgeLength(c, e.id), 2), expected: len } }));
      return { done, issues };
    },
  };
}

const pointStep = (what: ReturnType<typeof tx>): GuidedStep => ({
  id: 'point',
  tool: 'point',
  instruction: what,
  guide: (c) => (counts(c).V === 0 ? { points: [[0, 0, 0]] } : undefined),
  evaluate: (c) => ({ done: counts(c).V >= 1, issues: [] }),
});

export interface QuadOptions {
  l: number;
  b: number;
  /** 0, 1 (AC) or 2 (AC and BD) */
  diagonals?: 0 | 1 | 2;
}

/** Point → l cm line → l × b face (square if l = b) → optional diagonals. */
export function quadPlan({ l, b, diagonals = 0 }: QuadOptions): BuildPlan {
  const sq = isSquare(l, b);
  const name = sq ? tx('square', 'square', 'वर्ग') : tx('rectangle', 'rectangle', 'आयत');
  const dims = `${l} cm × ${b} cm`;
  const steps: GuidedStep[] = [
    pointStep(
      tx(
        `Pehle grid par ek point rakho. Ye ${name.hinglish} ka corner A hoga.`,
        `First, place a point on the grid. It will be corner A of the ${name.en}.`,
        `पहले जाली पर एक बिंदु रखो। यह ${name.hi} का कोना A होगा।`,
      ),
    ),
    lineStep(
      l,
      tx(
        `Ab A se ${l} cm ki line kheencho (side AB).`,
        `Now draw a ${l} cm line from A (side AB).`,
        `अब A से ${l} cm की रेखा खींचो (भुजा AB)।`,
      ),
    ),
    {
      id: 'face',
      tool: 'face',
      faceIntent: sq ? 'square' : 'rectangle',
      instruction: tx(
        `Ab is line par ${dims} ka ${name.hinglish} face banao. Face tool se baaki do corners C aur D chuno.`,
        `Now make the ${dims} ${name.en} face on this line. Use the Face tool to pick the other corners C and D.`,
        `अब इस रेखा पर ${dims} का ${name.hi} फलक बनाओ। फलक टूल से बाकी कोने C और D चुनो।`,
      ),
      guide: (c) => {
        const e = groundEdges(c).find((x) => sameLen(edgeLength(c, x.id), l));
        if (!e) return undefined;
        const P = pointPos(c, e.a);
        const Q = pointPos(c, e.b);
        const [R, S] = rectOnEdge(P, Q, b);
        return { points: [R, S], segments: [[Q, R], [R, S], [S, P]] };
      },
      evaluate: (c) => (findQuad(c, l, b) ? { done: true, issues: [] } : { done: false, issues: quadIssues(c, l, b) }),
    },
  ];
  const diagGuide = (k: 0 | 1) => (c: Construction): GuideOverlay | undefined => {
    const f = findQuad(c, l, b);
    if (!f) return undefined;
    const p = f.points.map((id) => pointPos(c, id));
    return { segments: [k === 0 ? [p[0]!, p[2]!] : [p[1]!, p[3]!]] };
  };
  if (diagonals >= 1)
    steps.push({
      id: 'diag1',
      tool: 'line',
      instruction: tx(
        'Ab diagonal AC kheencho: ek corner se bilkul saamne wale corner tak.',
        'Now draw the diagonal AC: from one corner to the opposite corner.',
        'अब विकर्ण AC खींचो: एक कोने से ठीक सामने वाले कोने तक।',
      ),
      guide: diagGuide(0),
      evaluate: (c) => {
        const f = findQuad(c, l, b);
        return { done: Boolean(f && diagonalsDrawn(c, f) >= 1), issues: [] };
      },
    });
  if (diagonals === 2)
    steps.push({
      id: 'diag2',
      tool: 'line',
      instruction: tx('Ab doosra diagonal BD bhi kheencho.', 'Now draw the other diagonal, BD.', 'अब दूसरा विकर्ण BD भी खींचो।'),
      guide: (c) => {
        const f = findQuad(c, l, b);
        if (!f) return undefined;
        const p = f.points.map((id) => pointPos(c, id));
        const [p0, , p2] = f.points as [string, string, string, string];
        return { segments: [findEdge(c, p0, p2) ? [p[1]!, p[3]!] : [p[0]!, p[2]!]] };
      },
      evaluate: (c) => {
        const f = findQuad(c, l, b);
        return { done: Boolean(f && diagonalsDrawn(c, f) === 2), issues: [] };
      },
    });

  const corners: Vec3[] = [[0, 0, 0], [l, 0, 0], [l, 0, b], [0, 0, b]];
  const target: GuideOverlay = {
    segments: [
      ...loop(corners),
      ...(diagonals >= 1 ? [[corners[0]!, corners[2]!] as Seg] : []),
      ...(diagonals === 2 ? [[corners[1]!, corners[3]!] as Seg] : []),
    ],
  };
  const check = (c: Construction): CheckResult => {
    const f = findQuad(c, l, b);
    if (!f) {
      const issues = quadIssues(c, l, b);
      return {
        ok: false,
        issues: issues.length ? issues : [{ code: 'count-mismatch', entities: [], values: { what: 'faces', actual: counts(c).F, expected: 1 } }],
      };
    }
    if (diagonalsDrawn(c, f) < diagonals)
      return { ok: false, issues: [{ code: 'count-mismatch', entities: [f.id], values: { what: 'edges', actual: counts(c).E, expected: 4 + diagonals } }] };
    return { ok: true, issues: [] };
  };

  return {
    steps,
    check,
    target,
    hints: {
      nudge: sq
        ? tx(`Square ki chaaron sides ${l} cm aur har corner 90°.`, `All four sides are ${l} cm and every corner is 90°.`, `चारों भुजाएँ ${l} cm और हर कोना 90°।`)
        : tx(
            `Aamne-saamne ki sides barabar: do sides ${l} cm, do ${b} cm. Har corner 90°.`,
            `Opposite sides are equal: two sides of ${l} cm, two of ${b} cm. Every corner is 90°.`,
            `आमने-सामने की भुजाएँ बराबर: दो भुजाएँ ${l} cm, दो ${b} cm। हर कोना 90°।`,
          ),
      clue: tx(
        `Pehle ${l} cm ki line kheencho, phir Face tool se ${dims} ka face banao${diagonals ? ', phir corner se saamne wale corner tak diagonal' : ''}.`,
        `Draw a ${l} cm line first, then make the ${dims} face with the Face tool${diagonals ? ', then the diagonal from corner to opposite corner' : ''}.`,
        `पहले ${l} cm की रेखा खींचो, फिर फलक टूल से ${dims} का फलक बनाओ${diagonals ? ', फिर कोने से सामने वाले कोने तक विकर्ण' : ''}।`,
      ),
    },
    home: homeFor(Math.max(l, b) * 1.05, [l / 2, 0, b / 2]),
  };
}

/** A square built from its diagonals: AC (2k) then BD (2k) crossing it at the middle at 90°, then the face. */
export function diamondPlan(k: number): BuildPlan {
  const d = 2 * k;
  const A: Vec3 = [0, 0, k];
  const C: Vec3 = [d, 0, k];
  const groundLines = (c: Construction) => groundEdges(c).filter((e) => sameLen(edgeLength(c, e.id), d));
  const ends = (c: Construction, id: string): Seg => {
    const e = c.edges[id]!;
    return [pointPos(c, e.a), pointPos(c, e.b)];
  };
  /** Two d-long lines that bisect each other at right angles. */
  const crossing = (c: Construction): [string, string] | undefined => {
    const ls = groundLines(c);
    for (let i = 0; i < ls.length; i++)
      for (let j = i + 1; j < ls.length; j++) {
        const [a1, a2] = ends(c, ls[i]!.id);
        const [b1, b2] = ends(c, ls[j]!.id);
        if (equals(midpoint(a1, a2), midpoint(b1, b2)) && isRightAngle(angleBetweenDeg(sub(a2, a1), sub(b2, b1))))
          return [ls[i]!.id, ls[j]!.id];
      }
    return undefined;
  };
  const faceOn = (c: Construction) => {
    const pair = crossing(c);
    if (!pair) return undefined;
    const tips = pair.flatMap((id) => ends(c, id));
    return Object.values(c.faces).find(
      (f) =>
        f.points.length === 4 &&
        checkSquare(c, f.points).ok &&
        f.points.every((p) => tips.some((t) => equals(t, pointPos(c, p)))),
    );
  };

  const steps: GuidedStep[] = [
    {
      id: 'ac',
      tool: 'line',
      instruction: tx(
        `Pehle diagonal AC kheencho: ${d} cm ki seedhi line.`,
        `First draw the diagonal AC: a straight line of ${d} cm.`,
        `पहले विकर्ण AC खींचो: ${d} cm की सीधी रेखा।`,
      ),
      guide: () => ({ points: [A, C], segments: [[A, C]] }),
      evaluate: (c) => {
        const done = groundLines(c).length >= 1;
        const issues: Issue[] = done
          ? []
          : groundEdges(c).map((e) => ({ code: 'line-wrong-length', entities: [e.id], values: { actual: roundTo(edgeLength(c, e.id), 2), expected: d } }));
        return { done, issues };
      },
    },
    {
      id: 'bd',
      tool: 'line',
      instruction: tx(
        `Ab diagonal BD: ye bhi ${d} cm ka hai, AC ke bilkul beech se guzarta hai aur 90° banata hai.`,
        `Now the diagonal BD: also ${d} cm, passing through the exact middle of AC at 90°.`,
        `अब विकर्ण BD: यह भी ${d} cm का है, AC के ठीक बीच से गुज़रता है और 90° बनाता है।`,
      ),
      guide: (c) => {
        const first = groundLines(c)[0];
        if (!first) return undefined;
        const [p, q] = ends(c, first.id);
        const M = midpoint(p, q);
        const n = scale(normalize([-(q[2] - p[2]), 0, q[0] - p[0]]), k);
        const B = sub(M, n);
        const D = add(M, n);
        return { points: [B, D], segments: [[B, D]] };
      },
      evaluate: (c) => {
        if (crossing(c)) return { done: true, issues: [] };
        const ls = groundLines(c);
        const issues: Issue[] = [];
        if (ls.length >= 2) {
          const [a1, a2] = ends(c, ls[0]!.id);
          for (const other of ls.slice(1)) {
            const [b1, b2] = ends(c, other.id);
            const ang = angleBetweenDeg(sub(a2, a1), sub(b2, b1));
            if (!isRightAngle(ang)) issues.push({ code: 'angle-not-right', entities: [other.id], values: { actual: roundTo(ang, 1), shape: 'square' } });
            else issues.push({ code: 'not-bisected', entities: [other.id] });
          }
        }
        return { done: false, issues };
      },
    },
    {
      id: 'face',
      tool: 'face',
      faceIntent: 'square',
      instruction: tx(
        'Ab chaaron sire A, B, C, D ek-ek karke jodo. Jo bana, wo square hai!',
        'Now join the four ends A, B, C, D in order. What you get is a square!',
        'अब चारों सिरे A, B, C, D एक-एक करके जोड़ो। जो बना, वह वर्ग है!',
      ),
      guide: (c) => {
        const pair = crossing(c);
        if (!pair) return undefined;
        const [a1, a2] = ends(c, pair[0]);
        const [b1, b2] = ends(c, pair[1]);
        return { segments: loop([a1, b1, a2, b2]) };
      },
      evaluate: (c) => ({ done: Boolean(faceOn(c)), issues: [] }),
    },
  ];
  const B: Vec3 = [k, 0, 0];
  const D: Vec3 = [k, 0, d];
  return {
    steps,
    check: (c) =>
      faceOn(c)
        ? { ok: true, issues: [] }
        : { ok: false, issues: steps.flatMap((s) => s.evaluate(c).issues) },
    target: { segments: [...loop([A, B, C, D]), [A, C], [B, D]] },
    hints: {
      nudge: tx(
        `Square ke diagonals barabar hote hain (${d} cm) aur ek doosre ko beech mein 90° par kaatte hain.`,
        `A square's diagonals are equal (${d} cm) and cut each other in half at 90°.`,
        `वर्ग के विकर्ण बराबर होते हैं (${d} cm) और एक-दूसरे को बीच में 90° पर काटते हैं।`,
      ),
      clue: tx(
        `${d} cm ki ek line, phir uske beech se ${d} cm ki khadi line (+ jaisi), phir chaaron sire jodo.`,
        `One ${d} cm line, then a ${d} cm line across its middle (like a +), then join the four ends.`,
        `${d} cm की एक रेखा, फिर उसके बीच से ${d} cm की आड़ी रेखा (+ जैसी), फिर चारों सिरे जोड़ो।`,
      ),
    },
    home: homeFor(d * 1.05, [k, 0, k]),
  };
}

/** Bounding box of a face on the ground. */
function bbox(c: Construction, f: CFace) {
  const ps = f.points.map((id) => pointPos(c, id));
  return {
    minX: Math.min(...ps.map((p) => p[0])),
    maxX: Math.max(...ps.map((p) => p[0])),
    minZ: Math.min(...ps.map((p) => p[2])),
    maxZ: Math.max(...ps.map((p) => p[2])),
  };
}

const rectCorners = (x0: number, z0: number, l: number, b: number): Vec3[] => [
  [x0, 0, z0],
  [x0 + l, 0, z0],
  [x0 + l, 0, z0 + b],
  [x0, 0, z0 + b],
];

/**
 * Two rectangles w cm apart all round: a photo and its frame (mode "outside"),
 * or a lawn and the path inside its edge (mode "inside"). Outer sits at the origin.
 */
export function nestedPlan({ L, B, w, mode }: { L: number; B: number; w: number; mode: 'outside' | 'inside' }): BuildPlan {
  const l = L - 2 * w;
  const b = B - 2 * w;
  const outer = rectCorners(0, 0, L, B);
  const inner = rectCorners(w, w, l, b);
  const [firstDims, secondDims] = mode === 'outside' ? [[l, b], [L, B]] : [[L, B], [l, b]];
  const firstGuide = mode === 'outside' ? inner : outer;
  const findFirst = (c: Construction) => findQuad(c, firstDims[0]!, firstDims[1]!);
  const findSecond = (c: Construction) => {
    const first = findFirst(c);
    if (!first) return undefined;
    const fb = bbox(c, first);
    const sign = mode === 'outside' ? 1 : -1; // outer grows by w, inner shrinks by w
    return Object.values(c.faces).find((f) => {
      if (f.id === first.id) return false;
      const ok = f.points.length === 4 && (secondDims[0] === secondDims[1] ? checkSquare(c, f.points, { side: secondDims[0] }).ok : checkRectangle(c, f.points, { length: secondDims[0], breadth: secondDims[1] }).ok);
      if (!ok) return false;
      const sb = bbox(c, f);
      return sameLen(sb.minX, fb.minX - sign * w) && sameLen(sb.maxX, fb.maxX + sign * w) && sameLen(sb.minZ, fb.minZ - sign * w) && sameLen(sb.maxZ, fb.maxZ + sign * w);
    });
  };
  const dimsTx = (d: number[]) => `${d[0]} cm × ${d[1]} cm`;
  const intent = (d: number[]) => (d[0] === d[1] ? 'square' : 'rectangle') as 'square' | 'rectangle';
  const steps: GuidedStep[] = [
    {
      id: 'first',
      tool: 'face',
      faceIntent: intent(firstDims),
      instruction:
        mode === 'outside'
          ? tx(
              `Pehle photo banao: ${dimsTx(firstDims)} ka rectangle face (ghost wali jagah par).`,
              `First build the photo: a ${dimsTx(firstDims)} rectangle face (where the ghost shows).`,
              `पहले फ़ोटो बनाओ: ${dimsTx(firstDims)} का आयत फलक (भूत वाली जगह पर)।`,
            )
          : tx(
              `Pehle poora lawn banao: ${dimsTx(firstDims)} ka rectangle face.`,
              `First build the whole lawn: a ${dimsTx(firstDims)} rectangle face.`,
              `पहले पूरा लॉन बनाओ: ${dimsTx(firstDims)} का आयत फलक।`,
            ),
      guide: (c) => (findFirst(c) ? undefined : { points: firstGuide, segments: loop(firstGuide) }),
      evaluate: (c) => (findFirst(c) ? { done: true, issues: [] } : { done: false, issues: quadIssues(c, firstDims[0]!, firstDims[1]!) }),
    },
    {
      id: 'second',
      tool: 'face',
      faceIntent: intent(secondDims),
      instruction:
        mode === 'outside'
          ? tx(
              `Ab frame ka bahar wala kinara: har taraf ${w} cm bahar, yaani ${dimsTx(secondDims)}.`,
              `Now the outer edge of the frame: ${w} cm out on every side, so ${dimsTx(secondDims)}.`,
              `अब फ़्रेम का बाहरी किनारा: हर तरफ़ ${w} cm बाहर, यानी ${dimsTx(secondDims)}।`,
            )
          : tx(
              `Ab raste ka andar wala kinara: har taraf ${w} cm andar, yaani ${dimsTx(secondDims)}.`,
              `Now the inner edge of the path: ${w} cm in from every side, so ${dimsTx(secondDims)}.`,
              `अब रास्ते का अंदरूनी किनारा: हर तरफ़ ${w} cm अंदर, यानी ${dimsTx(secondDims)}।`,
            ),
      guide: (c) => {
        const f = findFirst(c);
        if (!f) return undefined;
        const fb = bbox(c, f);
        const s = mode === 'outside' ? w : -w;
        const pts = rectCorners(fb.minX - s, fb.minZ - s, fb.maxX - fb.minX + 2 * s, fb.maxZ - fb.minZ + 2 * s);
        return { points: pts, segments: loop(pts) };
      },
      evaluate: (c) => {
        if (findSecond(c)) return { done: true, issues: [] };
        const first = findFirst(c);
        // right size but not evenly placed → say so
        const misplaced = Object.values(c.faces).filter((f) => f.id !== first?.id && f.points.length === 4 && (secondDims[0] === secondDims[1] ? checkSquare(c, f.points, { side: secondDims[0] }).ok : checkRectangle(c, f.points, { length: secondDims[0], breadth: secondDims[1] }).ok));
        const issues: Issue[] = misplaced.map((f) => ({ code: 'border-uneven', entities: [f.id], values: { w } }));
        return { done: false, issues };
      },
    },
  ];
  return {
    steps,
    check: (c) => (findSecond(c) ? { ok: true, issues: [] } : { ok: false, issues: steps.flatMap((s) => s.evaluate(c).issues) }),
    target: { segments: [...loop(outer), ...loop(inner)] },
    hints: {
      nudge: tx(
        `Do rectangles chahiye: ek ${dimsTx(secondDims)}, ek ${dimsTx(firstDims)}, beech mein har taraf ${w} cm.`,
        `You need two rectangles, ${dimsTx(secondDims)} and ${dimsTx(firstDims)}, with ${w} cm between them on every side.`,
        `दो आयत चाहिए: एक ${dimsTx(secondDims)}, एक ${dimsTx(firstDims)}, बीच में हर तरफ़ ${w} cm।`,
      ),
      clue: tx(
        `Bade rectangle ke corner se ${w} cm right aur ${w} cm neeche chhote rectangle ka corner hai.`,
        `The small rectangle's corner is ${w} cm right and ${w} cm down from the big one's corner.`,
        `बड़े आयत के कोने से ${w} cm दाएँ और ${w} cm नीचे छोटे आयत का कोना है।`,
      ),
    },
    home: homeFor(Math.max(L, B) * 1.05, [L / 2, 0, B / 2]),
  };
}
