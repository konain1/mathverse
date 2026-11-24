import { describe, expect, it } from 'vitest';
import { EDGES, LABELLED_EDGES, easeInOutCubic, edgeLengthCm, shapeVertices } from './morphShapes';

describe('morph shapes', () => {
  it('cube has 12 equal 4 cm edges', () => {
    for (const e of EDGES) expect(edgeLengthCm('cube', e)).toBe(4);
  });
  it('square is the cube base flattened (4 cm), rectangle is 7 cm × 4 cm', () => {
    expect(edgeLengthCm('square', LABELLED_EDGES.front)).toBe(4);
    expect(edgeLengthCm('square', LABELLED_EDGES.height)).toBe(0);
    expect(edgeLengthCm('rectangle', LABELLED_EDGES.front)).toBe(7);
    expect(edgeLengthCm('rectangle', LABELLED_EDGES.side)).toBe(4);
  });
  it('triangle has a 5 cm base and two equal slanted sides', () => {
    expect(edgeLengthCm('triangle', LABELLED_EDGES.front)).toBe(5);
    const v = shapeVertices('triangle');
    expect(v[0]).toEqual(v[1]); // apex
    expect(edgeLengthCm('triangle', [2, 1])).toBe(edgeLengthCm('triangle', [3, 0]));
  });
  it('easing starts at 0, ends at 1, is symmetric', () => {
    expect(easeInOutCubic(0)).toBe(0);
    expect(easeInOutCubic(1)).toBe(1);
    expect(easeInOutCubic(0.5)).toBe(0.5);
  });
});
