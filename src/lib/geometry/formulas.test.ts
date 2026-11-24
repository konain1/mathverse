import { describe, expect, it } from 'vitest';
import * as F from './formulas';

describe('square', () => {
  it('side 4 cm', () => {
    expect(F.squarePerimeter(4)).toBe(16);
    expect(F.squareArea(4)).toBe(16);
    expect(F.squareDiagonal(4)).toBeCloseTo(5.656854, 6);
  });
  it('area from diagonal: d = 10 → 50 (d²/2), consistent with side 5√2', () => {
    expect(F.squareAreaFromDiagonal(10)).toBe(50);
    expect(F.squareArea(F.squareDiagonal(5))).toBeCloseTo(50, 9);
    expect(F.squareAreaFromDiagonal(F.squareDiagonal(7))).toBeCloseTo(49, 9);
  });
  it('side from area', () => expect(F.squareSideFromArea(144)).toBe(12));
  it('rejects non-positive sides', () => {
    expect(() => F.squareArea(0)).toThrow();
    expect(() => F.squarePerimeter(-2)).toThrow();
    expect(() => F.squareArea(Number.NaN)).toThrow();
  });
});

describe('rectangle', () => {
  it('7 × 4', () => {
    expect(F.rectanglePerimeter(7, 4)).toBe(22);
    expect(F.rectangleArea(7, 4)).toBe(28);
  });
  it('diagonal by Pythagoras: 8 × 6 → 10', () => expect(F.rectangleDiagonal(8, 6)).toBe(10));
  it('path 2.5 m wide outside a 30 m × 20 m garden (NCERT-style) = 275 m²', () => {
    // (30+5)(20+5) − 600 = 875 − 600 = 275
    expect(F.pathAreaOutside(30, 20, 2.5)).toBe(275);
  });
  it('path 2 m wide inside a 20 m × 15 m field = 124 m²', () => {
    // 300 − 16 × 11 = 300 − 176 = 124
    expect(F.pathAreaInside(20, 15, 2)).toBe(124);
    expect(() => F.pathAreaInside(4, 4, 2)).toThrow();
  });
  it('tiles: 5 m × 4 m floor with 50 cm tiles → 80 tiles (all in cm)', () => {
    expect(F.tilesToCover(500, 400, 50)).toBe(80);
    expect(F.tilesToCover(6, 4, 2, 1)).toBe(12);
    expect(() => F.tilesToCover(5, 4, 2)).toThrow();
  });
});

describe('triangle', () => {
  it('triangle inequality is strict', () => {
    expect(F.isValidTriangle(3, 4, 5)).toBe(true);
    expect(F.isValidTriangle(1, 2, 3)).toBe(false); // degenerate
    expect(F.isValidTriangle(2, 2, 5)).toBe(false);
    expect(F.isValidTriangle(0, 1, 1)).toBe(false);
  });
  it('whole-number third sides: 5 and 8 → 4 … 12 (9 values)', () => {
    expect(F.wholeThirdSides(5, 8)).toEqual([4, 5, 6, 7, 8, 9, 10, 11, 12]);
    expect(F.wholeThirdSides(4, 4)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });
  it('area = ½ b h', () => {
    expect(F.triangleArea(10, 6)).toBe(30);
    expect(F.triangleHeight(30, 10)).toBe(6);
  });
  it("Heron's formula", () => {
    expect(F.semiPerimeter(3, 4, 5)).toBe(6);
    expect(F.heronArea(3, 4, 5)).toBe(6);
    // NCERT Class 9: sides 40, 24, 32 m → s = 48, area = 384 m²
    expect(F.heronArea(40, 24, 32)).toBe(384);
    // equilateral side 10: (√3/4)·100
    expect(F.heronArea(10, 10, 10)).toBeCloseTo((Math.sqrt(3) / 4) * 100, 9);
    expect(() => F.heronArea(1, 2, 3)).toThrow();
  });
  it('Heron agrees with ½bh for a right triangle', () => {
    expect(F.heronArea(6, 8, 10)).toBeCloseTo(F.triangleArea(6, 8), 9);
  });
  it('isosceles base angles and ratio angles', () => {
    expect(F.isoscelesBaseAngle(40)).toBe(70);
    expect(F.isoscelesBaseAngle(90)).toBe(45);
    expect(F.anglesFromRatio(2, 3, 4)).toEqual([40, 60, 80]);
    expect(F.anglesFromRatio(1, 2, 3)).toEqual([30, 60, 90]);
    expect(() => F.isoscelesBaseAngle(180)).toThrow();
  });
  it('angle sum & exterior angle', () => {
    expect(F.thirdAngle(50, 60)).toBe(70);
    expect(() => F.thirdAngle(100, 80)).toThrow();
    expect(F.exteriorAngle(50, 60)).toBe(110);
    // exterior + adjacent interior = 180
    expect(F.exteriorAngle(50, 60) + F.thirdAngle(50, 60)).toBe(180);
  });
  it('Pythagoras', () => {
    expect(F.hypotenuse(3, 4)).toBe(5);
    expect(F.hypotenuse(5, 12)).toBe(13);
    expect(F.missingLeg(13, 5)).toBe(12);
    expect(() => F.missingLeg(5, 5)).toThrow();
    expect(F.isPythagoreanTriple(8, 15, 17)).toBe(true);
    expect(F.isPythagoreanTriple(17, 8, 15)).toBe(true);
    expect(F.isPythagoreanTriple(2, 3, 4)).toBe(false);
  });
  it('classification by sides', () => {
    expect(F.classifyBySides(5, 5, 5)).toBe('equilateral');
    expect(F.classifyBySides(5, 5, 8)).toBe('isosceles');
    expect(F.classifyBySides(5, 8, 5)).toBe('isosceles');
    expect(F.classifyBySides(4, 5, 6)).toBe('scalene');
  });
  it('classification by angles', () => {
    expect(F.classifyByAngles(3, 4, 5)).toBe('right');
    expect(F.classifyByAngles(5, 5, 5)).toBe('acute');
    expect(F.classifyByAngles(4, 5, 6)).toBe('acute'); // 16+25 > 36
    expect(F.classifyByAngles(2, 3, 4)).toBe('obtuse'); // 4+9 < 16
    expect(F.classifyByAngles(1, 1, Math.SQRT2)).toBe('right');
  });
});

describe('cube & cuboid', () => {
  it('cube side 4 cm: TSA 96, LSA 64, volume 64', () => {
    expect(F.cubeTSA(4)).toBe(96);
    expect(F.cubeLSA(4)).toBe(64);
    expect(F.cubeVolume(4)).toBe(64);
    expect(F.cubeEdgeTotal(4)).toBe(48);
    expect(F.cubeDiagonal(1)).toBeCloseTo(Math.sqrt(3), 12);
  });
  it('cube is a cuboid with l = b = h', () => {
    for (const a of [1, 3, 7.5]) {
      expect(F.cuboidTSA(a, a, a)).toBeCloseTo(F.cubeTSA(a), 9);
      expect(F.cuboidLSA(a, a, a)).toBeCloseTo(F.cubeLSA(a), 9);
      expect(F.cuboidVolume(a, a, a)).toBeCloseTo(F.cubeVolume(a), 9);
    }
  });
  it('cuboid 8 × 6 × 4', () => {
    expect(F.cuboidLSA(8, 6, 4)).toBe(112); // 2·4·(8+6)
    expect(F.cuboidTSA(8, 6, 4)).toBe(208); // 2(48+24+32)
    expect(F.cuboidVolume(8, 6, 4)).toBe(192);
    expect(F.cuboidDiagonal(12, 4, 3)).toBe(13);
  });
  it('small cubes that fit', () => {
    expect(F.smallCubesThatFit(4, 4, 4, 1)).toBe(64);
    expect(F.smallCubesThatFit(10, 8, 6, 2)).toBe(60); // 5 × 4 × 3
    expect(F.smallCubesThatFit(5, 5, 5, 2)).toBe(8); // only whole cubes
  });
  it('painted cube counts add up to n³', () => {
    for (const n of [2, 3, 4, 7]) {
      const c = F.paintedCubeCounts(n);
      expect(c.three + c.two + c.one + c.zero).toBe(n ** 3);
      expect(c.three).toBe(8);
    }
    expect(F.paintedCubeCounts(3)).toEqual({ three: 8, two: 12, one: 6, zero: 1 });
    expect(() => F.paintedCubeCounts(1)).toThrow();
  });
  it("Euler's formula = 2 for cube and cuboid, also triangular prism", () => {
    expect(F.eulerCharacteristic(8, 12, 6)).toBe(2);
    expect(F.eulerCharacteristic(6, 9, 5)).toBe(2);
  });
});

describe('squares, cubes, roots', () => {
  it('perfect squares and cubes', () => {
    expect(F.isPerfectSquare(25)).toBe(true);
    expect(F.isPerfectSquare(26)).toBe(false);
    expect(F.isPerfectSquare(0)).toBe(true);
    expect(F.isPerfectSquare(-4)).toBe(false);
    expect(F.isPerfectCube(27)).toBe(true);
    expect(F.isPerfectCube(-64)).toBe(true);
    expect(F.isPerfectCube(30)).toBe(false);
    expect(F.intSqrt(1764)).toBe(42);
    expect(F.intCbrt(13824)).toBe(24);
    expect(F.intCbrt(-27)).toBe(-3);
    expect(() => F.intSqrt(50)).toThrow();
  });
  it('prime factors and surds', () => {
    expect(F.primeFactors(72)).toEqual([2, 2, 2, 3, 3]);
    expect(F.primeFactors(97)).toEqual([97]);
    expect(F.simplifySqrt(72)).toEqual({ outside: 6, inside: 2 });
    expect(F.simplifySqrt(32)).toEqual({ outside: 4, inside: 2 });
    expect(F.simplifySqrt(49)).toEqual({ outside: 7, inside: 1 });
    expect(F.simplifySqrt(7)).toEqual({ outside: 1, inside: 7 });
  });
  it('smallest multipliers (NCERT Class 8 exercises)', () => {
    expect(F.smallestMultiplierForSquare(252)).toBe(7); // 2²·3²·7
    expect(F.smallestMultiplierForSquare(180)).toBe(5); // 2²·3²·5
    expect(F.smallestMultiplierForCube(243)).toBe(3); // 3⁵ → ×3 = 3⁶
    expect(F.smallestMultiplierForCube(72)).toBe(3); // 2³·3² → ×3
    expect(F.smallestMultiplierForCube(100)).toBe(10); // 2²·5² → ×2·5
  });
});
