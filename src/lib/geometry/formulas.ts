/**
 * School mensuration & number formulas (NCERT Classes 7–9).
 * Every answer shown in the app must come from these functions, never be hard-coded.
 * All lengths share one unit; areas come out in unit², volumes in unit³.
 */

function assertPositive(...xs: number[]) {
  for (const x of xs) if (!(Number.isFinite(x) && x > 0)) throw new RangeError(`Expected a positive number, got ${x}`);
}

// ─── Square ──────────────────────────────────────────────────────────────
export const squarePerimeter = (a: number) => (assertPositive(a), 4 * a);
export const squareArea = (a: number) => (assertPositive(a), a * a);
/** d = a√2 */
export const squareDiagonal = (a: number) => (assertPositive(a), a * Math.SQRT2);
/** A square is a rhombus, so area = ½·d₁·d₂ = d²/2 */
export const squareAreaFromDiagonal = (d: number) => (assertPositive(d), (d * d) / 2);
export const squareSideFromArea = (area: number) => (assertPositive(area), Math.sqrt(area));

// ─── Rectangle ───────────────────────────────────────────────────────────
export const rectanglePerimeter = (l: number, b: number) => (assertPositive(l, b), 2 * (l + b));
export const rectangleArea = (l: number, b: number) => (assertPositive(l, b), l * b);
/** Diagonal by Pythagoras: √(l² + b²) */
export const rectangleDiagonal = (l: number, b: number) => (assertPositive(l, b), Math.hypot(l, b));

/**
 * Uniform path of width w running OUTSIDE a rectangle l × b:
 * area = (l + 2w)(b + 2w) − l·b
 */
export function pathAreaOutside(l: number, b: number, w: number): number {
  assertPositive(l, b, w);
  return (l + 2 * w) * (b + 2 * w) - l * b;
}
/** Uniform path of width w running INSIDE the boundary: area = l·b − (l − 2w)(b − 2w). */
export function pathAreaInside(l: number, b: number, w: number): number {
  assertPositive(l, b, w);
  if (2 * w >= Math.min(l, b)) throw new RangeError('Path is wider than the field');
  return l * b - (l - 2 * w) * (b - 2 * w);
}
/** Number of t × t tiles needed to cover l × b exactly (throws if they don't fit exactly). */
export function tilesToCover(l: number, b: number, tileL: number, tileB = tileL): number {
  assertPositive(l, b, tileL, tileB);
  const across = l / tileL;
  const down = b / tileB;
  const whole = (x: number) => Math.abs(x - Math.round(x)) < 1e-9;
  if (!whole(across) || !whole(down)) throw new RangeError('Tiles do not fit exactly');
  return Math.round(across) * Math.round(down);
}

// ─── Triangle ────────────────────────────────────────────────────────────
/** Strict triangle inequality: each side < sum of the other two. */
export function isValidTriangle(a: number, b: number, c: number): boolean {
  if (!(a > 0 && b > 0 && c > 0)) return false;
  return a + b > c && b + c > a && a + c > b;
}
export const trianglePerimeter = (a: number, b: number, c: number) => {
  if (!isValidTriangle(a, b, c)) throw new RangeError('Not a triangle');
  return a + b + c;
};
/** Every whole-number third side that makes a triangle with sides a and b (|a − b| < c < a + b). */
export function wholeThirdSides(a: number, b: number): number[] {
  const out: number[] = [];
  for (let c = 1; c < a + b; c++) if (isValidTriangle(a, b, c)) out.push(c);
  return out;
}
/** Area = ½ × base × height */
export const triangleArea = (base: number, height: number) => (assertPositive(base, height), (base * height) / 2);
export const semiPerimeter = (a: number, b: number, c: number) => trianglePerimeter(a, b, c) / 2;
/** Heron: √(s(s−a)(s−b)(s−c)) */
export function heronArea(a: number, b: number, c: number): number {
  const s = semiPerimeter(a, b, c);
  return Math.sqrt(s * (s - a) * (s - b) * (s - c));
}
/** Height on `base` given the area. */
export const triangleHeight = (area: number, base: number) => (assertPositive(area, base), (2 * area) / base);

/** Third angle from the angle sum property (all in degrees). */
export function thirdAngle(a: number, b: number): number {
  assertPositive(a, b);
  const c = 180 - a - b;
  if (c <= 0) throw new RangeError('Two angles already make 180° or more');
  return c;
}
/** Base angle of an isosceles triangle with apex angle `apex`: (180° − apex) ÷ 2. */
export function isoscelesBaseAngle(apex: number): number {
  if (!(apex > 0 && apex < 180)) throw new RangeError('Apex angle must be between 0° and 180°');
  return (180 - apex) / 2;
}
/** Angles of a triangle whose angles are in the ratio p : q : r. */
export function anglesFromRatio(p: number, q: number, r: number): [number, number, number] {
  assertPositive(p, q, r);
  const k = 180 / (p + q + r);
  return [p * k, q * k, r * k];
}
/** Exterior angle = sum of the two interior opposite angles. */
export function exteriorAngle(oppA: number, oppB: number): number {
  assertPositive(oppA, oppB);
  if (oppA + oppB >= 180) throw new RangeError('Interior opposite angles must add to less than 180°');
  return oppA + oppB;
}

/** Hypotenuse c = √(a² + b²) */
export const hypotenuse = (a: number, b: number) => (assertPositive(a, b), Math.hypot(a, b));
/** Other leg = √(c² − a²) */
export function missingLeg(hyp: number, leg: number): number {
  assertPositive(hyp, leg);
  if (leg >= hyp) throw new RangeError('A leg must be shorter than the hypotenuse');
  return Math.sqrt(hyp * hyp - leg * leg);
}
/** True if a² + b² = c² for some ordering (integer-exact). */
export function isPythagoreanTriple(a: number, b: number, c: number): boolean {
  const [x, y, z] = [a, b, c].sort((p, q) => p - q) as [number, number, number];
  return x > 0 && Math.abs(x * x + y * y - z * z) < 1e-9;
}

export type TriangleBySides = 'equilateral' | 'isosceles' | 'scalene';
export type TriangleByAngles = 'acute' | 'right' | 'obtuse';

export function classifyBySides(a: number, b: number, c: number, eps = 1e-9): TriangleBySides {
  if (!isValidTriangle(a, b, c)) throw new RangeError('Not a triangle');
  const ab = Math.abs(a - b) < eps;
  const bc = Math.abs(b - c) < eps;
  const ac = Math.abs(a - c) < eps;
  if (ab && bc) return 'equilateral';
  if (ab || bc || ac) return 'isosceles';
  return 'scalene';
}
/** Uses the converse of Pythagoras on the longest side (exact for whole numbers). */
export function classifyByAngles(a: number, b: number, c: number, eps = 1e-9): TriangleByAngles {
  if (!isValidTriangle(a, b, c)) throw new RangeError('Not a triangle');
  const [x, y, z] = [a, b, c].sort((p, q) => p - q) as [number, number, number];
  const diff = x * x + y * y - z * z;
  if (Math.abs(diff) <= eps * z * z) return 'right';
  return diff > 0 ? 'acute' : 'obtuse';
}

// ─── Cube & cuboid ───────────────────────────────────────────────────────
export const cubeLSA = (a: number) => (assertPositive(a), 4 * a * a);
export const cubeTSA = (a: number) => (assertPositive(a), 6 * a * a);
export const cubeVolume = (a: number) => (assertPositive(a), a * a * a);
/** Space diagonal a√3 */
export const cubeDiagonal = (a: number) => (assertPositive(a), a * Math.sqrt(3));
export const cubeEdgeTotal = (a: number) => (assertPositive(a), 12 * a);

export const cuboidLSA = (l: number, b: number, h: number) => (assertPositive(l, b, h), 2 * h * (l + b));
export const cuboidTSA = (l: number, b: number, h: number) => (assertPositive(l, b, h), 2 * (l * b + b * h + h * l));
export const cuboidVolume = (l: number, b: number, h: number) => (assertPositive(l, b, h), l * b * h);
export const cuboidDiagonal = (l: number, b: number, h: number) => (assertPositive(l, b, h), Math.hypot(l, b, h));

/** How many s-cubes fit in an L × B × H box (whole cubes only). */
export function smallCubesThatFit(L: number, B: number, H: number, s: number): number {
  assertPositive(L, B, H, s);
  const f = (x: number) => Math.floor(x / s + 1e-9);
  return f(L) * f(B) * f(H);
}

/**
 * An n×n×n cube painted on all faces, cut into n³ unit cubes:
 * how many small cubes have 3, 2, 1, 0 painted faces.
 */
export function paintedCubeCounts(n: number): { three: number; two: number; one: number; zero: number } {
  // n = 1 is a single cube painted on all 6 faces, outside these categories.
  if (!Number.isInteger(n) || n < 2) throw new RangeError('n must be a whole number ≥ 2');
  const k = n - 2;
  return { three: 8, two: 12 * k, one: 6 * k * k, zero: k * k * k };
}

/** Euler's formula for polyhedra: V − E + F (= 2 for cubes, cuboids, prisms, pyramids). */
export const eulerCharacteristic = (V: number, E: number, F: number) => V - E + F;

// ─── Squares, cubes and roots ────────────────────────────────────────────
export function isPerfectSquare(n: number): boolean {
  if (!Number.isInteger(n) || n < 0) return false;
  const r = Math.round(Math.sqrt(n));
  return r * r === n;
}
export function isPerfectCube(n: number): boolean {
  if (!Number.isInteger(n)) return false;
  const r = Math.round(Math.cbrt(n));
  return r * r * r === n;
}
/** Exact integer square root; throws if n is not a perfect square. */
export function intSqrt(n: number): number {
  if (!isPerfectSquare(n)) throw new RangeError(`${n} is not a perfect square`);
  return Math.round(Math.sqrt(n));
}
/** Exact integer cube root (works for negatives); throws if n is not a perfect cube. */
export function intCbrt(n: number): number {
  if (!isPerfectCube(n)) throw new RangeError(`${n} is not a perfect cube`);
  return Math.round(Math.cbrt(n));
}

/** Prime factorisation, ascending: 72 → [2, 2, 2, 3, 3]. */
export function primeFactors(n: number): number[] {
  if (!Number.isInteger(n) || n < 2) return [];
  const out: number[] = [];
  let m = n;
  for (let p = 2; p * p <= m; p++) {
    while (m % p === 0) {
      out.push(p);
      m /= p;
    }
  }
  if (m > 1) out.push(m);
  return out;
}

/** Simplest surd form of √n: √72 → { outside: 6, inside: 2 } (i.e. 6√2). */
export function simplifySqrt(n: number): { outside: number; inside: number } {
  if (!Number.isInteger(n) || n < 0) throw new RangeError('n must be a whole number');
  if (n === 0) return { outside: 0, inside: 1 };
  let outside = 1;
  let inside = n;
  for (let k = Math.floor(Math.sqrt(n)); k >= 2; k--) {
    if (inside % (k * k) === 0) {
      outside *= k;
      inside /= k * k;
      break;
    }
  }
  return { outside, inside };
}

/** Smallest whole number to multiply n by to make it a perfect square (NCERT Class 8). */
export function smallestMultiplierForSquare(n: number): number {
  const counts = new Map<number, number>();
  for (const p of primeFactors(n)) counts.set(p, (counts.get(p) ?? 0) + 1);
  let m = 1;
  for (const [p, c] of counts) if (c % 2) m *= p;
  return m;
}
/** Smallest whole number to multiply n by to make it a perfect cube. */
export function smallestMultiplierForCube(n: number): number {
  const counts = new Map<number, number>();
  for (const p of primeFactors(n)) counts.set(p, (counts.get(p) ?? 0) + 1);
  let m = 1;
  for (const [p, c] of counts) if (c % 3) m *= p ** (3 - (c % 3));
  return m;
}
