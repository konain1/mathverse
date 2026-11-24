/**
 * Reusable guided-construction recipes. A topic's buildSteps.ts picks a recipe
 * (or writes its own steps) and passes the numbers from its question.
 * All lengths in cm; the figure is built on the ground grid (y = 0) and pulled up.
 */
import type { BuildPlan, GuidedStep } from '@/topics/contract';
import type { GuideOverlay } from '@/features/build/scene/GhostLayer';
import { GRID_EXTENT } from '@/features/build/store';
import { counts, edgeLength, pointPos, type Construction, type CEdge, type CFace } from '@/lib/geometry/construction';
import { checkCube, checkSquare, type Issue } from '@/lib/geometry/validators';
import { add, cross, normalize, roundTo, scale, sub, type Vec3 } from '@/lib/geometry/vector';

export const sameLen = (x: number, y: number) => Math.abs(x - y) < 1e-6;
export const onGround = (c: Construction, ids: readonly string[]) => ids.every((id) => Math.abs(pointPos(c, id)[1]) < 1e-9);
const idNum = (id: string) => Number(id.slice(1));

export function firstPoint(c: Construction): Vec3 | undefined {
  const pts = Object.values(c.points).sort((x, y) => idNum(x.id) - idNum(y.id));
  return pts[0]?.pos;
}

export function groundEdges(c: Construction): CEdge[] {
  return Object.values(c.edges).filter((e) => onGround(c, [e.a, e.b]));
}

/** A ground square face of side a (the base of the cube), if one exists. */
export function findSquare(c: Construction, a: number): CFace | undefined {
  return Object.values(c.faces).find(
    (f) => f.points.length === 4 && onGround(c, f.points) && checkSquare(c, f.points, { side: a }).ok,
  );
}

export const inGrid = (p: Vec3) => Math.abs(p[0]) <= GRID_EXTENT && Math.abs(p[2]) <= GRID_EXTENT;

/** End point for "draw an a cm line from here": prefer +x, else −x. */
export function lineEnd(start: Vec3, a: number): Vec3 {
  const plus = add(start, [a, 0, 0]);
  return inGrid(plus) ? plus : add(start, [-a, 0, 0]);
}

/** The rectangle of width w standing on edge P→Q, on the side that fits in the grid (prefer +z / "towards you"). */
export function rectOnEdge(P: Vec3, Q: Vec3, a: number): [Vec3, Vec3] {
  const dir = normalize(sub(Q, P));
  let n = scale(normalize(cross(dir, [0, 1, 0])), a);
  if (n[2] < 0 || (n[2] === 0 && n[0] < 0)) n = scale(n, -1);
  let R = add(Q, n);
  let S = add(P, n);
  if (!inGrid(R) || !inGrid(S)) {
    R = sub(Q, n);
    S = sub(P, n);
  }
  return [R, S];
}

function cubeSegments(origin: Vec3, a: number): [Vec3, Vec3][] {
  const o = origin;
  const base: Vec3[] = [o, add(o, [a, 0, 0]), add(o, [a, 0, a]), add(o, [0, 0, a])];
  const top = base.map((p) => add(p, [0, a, 0]));
  const segs: [Vec3, Vec3][] = [];
  for (let i = 0; i < 4; i++) {
    segs.push([base[i]!, base[(i + 1) % 4]!], [top[i]!, top[(i + 1) % 4]!], [base[i]!, top[i]!]);
  }
  return segs;
}

/** Camera that frames a figure of size `size` sitting at the origin corner. */
export function homeFor(size: number, center: Vec3) {
  const dist = 2.6 * size + 6;
  const dir = normalize([1, 1.15, 1.45]);
  return { position: add(center, scale(dir, dist)), target: center };
}

/** Point → a cm line → square face → pull up a cm. */
export function cubePlan(a: number): BuildPlan {
  const steps: GuidedStep[] = [
    {
      id: 'point',
      tool: 'point',
      instruction: {
        hinglish: 'Pehle grid par ek point rakho. Ye cube ka pehla corner hoga.',
        en: 'First, place a point on the grid. It will be the first corner of the cube.',
        hi: 'पहले जाली पर एक बिंदु रखो। यह घन का पहला कोना होगा।',
      },
      guide: (c) => (counts(c).V === 0 ? { points: [[0, 0, 0]] } : undefined),
      evaluate: (c) => ({ done: counts(c).V >= 1, issues: [] }),
    },
    {
      id: 'edge',
      tool: 'line',
      instruction: {
        hinglish: `Ab is point se ${a} cm ki line kheencho. Line ke upar length live dikhegi.`,
        en: `Now draw a ${a} cm line from this point. Its length shows live on the line.`,
        hi: `अब इस बिंदु से ${a} cm की रेखा खींचो। रेखा पर लंबाई साथ-साथ दिखेगी।`,
      },
      guide: (c) => {
        const start = firstPoint(c) ?? [0, 0, 0];
        const end = lineEnd(start, a);
        return { points: [end], segments: [[start, end]] };
      },
      evaluate: (c) => {
        const edges = groundEdges(c);
        const done = edges.some((e) => sameLen(edgeLength(c, e.id), a));
        const issues: Issue[] = done
          ? []
          : edges.map((e) => ({
              code: 'line-wrong-length',
              entities: [e.id],
              values: { actual: roundTo(edgeLength(c, e.id), 2), expected: a },
            }));
        return { done, issues };
      },
    },
    {
      id: 'square',
      tool: 'face',
      faceIntent: 'square',
      instruction: {
        hinglish: `Ab is line par ${a} cm × ${a} cm ka square face banao. Face tool se baaki do corners chuno.`,
        en: `Now make a ${a} cm × ${a} cm square face on this line. Use the Face tool to pick the other two corners.`,
        hi: `अब इस रेखा पर ${a} cm × ${a} cm का वर्ग फलक बनाओ। फलक टूल से बाकी दो कोने चुनो।`,
      },
      guide: (c) => {
        const e = groundEdges(c).find((x) => sameLen(edgeLength(c, x.id), a));
        if (!e) return undefined;
        const P = pointPos(c, e.a);
        const Q = pointPos(c, e.b);
        const [R, S] = rectOnEdge(P, Q, a);
        return { points: [R, S], segments: [[Q, R], [R, S], [S, P]] };
      },
      evaluate: (c) => {
        if (findSquare(c, a)) return { done: true, issues: [] };
        const issues = Object.values(c.faces).flatMap((f) =>
          checkSquare(c, f.points, { side: a }).issues.map((i) => ({ ...i, entities: [...i.entities, f.id] })),
        );
        return { done: false, issues };
      },
    },
    {
      id: 'pull',
      tool: 'extrude',
      instruction: {
        hinglish: `Ab Push-pull tool se is square ko ${a} cm upar kheencho. Cube taiyaar!`,
        en: `Now use Push-pull to pull this square up by ${a} cm. Your cube is ready!`,
        hi: `अब खींचो टूल से इस वर्ग को ${a} cm ऊपर खींचो। घन तैयार!`,
      },
      guide: (c) => {
        const f = findSquare(c, a);
        if (!f) return undefined;
        const base = f.points.map((id) => pointPos(c, id));
        const top = base.map((p) => add(p, [0, a, 0]));
        return {
          segments: [
            ...top.map((p, i) => [p, top[(i + 1) % 4]!] as [Vec3, Vec3]),
            ...base.map((p, i) => [p, top[i]!] as [Vec3, Vec3]),
          ],
        };
      },
      evaluate: (c) => {
        const r = checkCube(c, { side: a });
        const { V, E, F } = counts(c);
        return { done: r.ok, issues: V === 8 && E === 12 && F === 6 ? r.issues : [] };
      },
    },
  ];

  return {
    steps,
    check: (c) => checkCube(c, { side: a }),
    target: { segments: cubeSegments([0, 0, 0], a) },
    hints: {
      nudge: {
        hinglish: `Cube ki saari 12 edges barabar hoti hain: har edge ${a} cm.`,
        en: `All 12 edges of a cube are equal: each is ${a} cm.`,
        hi: `घन के सभी 12 किनारे बराबर होते हैं: हर किनारा ${a} cm।`,
      },
      clue: {
        hinglish: `Pehle zameen par ${a} cm × ${a} cm ka square face banao, phir Push-pull se use ${a} cm upar kheencho.`,
        en: `First make a ${a} cm × ${a} cm square face on the ground, then Push-pull it up by ${a} cm.`,
        hi: `पहले ज़मीन पर ${a} cm × ${a} cm का वर्ग फलक बनाओ, फिर खींचो टूल से उसे ${a} cm ऊपर खींचो।`,
      },
    },
    home: homeFor(a, [a / 2, a * 0.35, a / 2]),
  };
}

/** Index of the current step: steps are done in order, so count the leading done ones. */
export function currentStepIndex(plan: BuildPlan, c: Construction): number {
  let i = 0;
  while (i < plan.steps.length && plan.steps[i]!.evaluate(c).done) i++;
  return i;
}

export type { GuideOverlay };
