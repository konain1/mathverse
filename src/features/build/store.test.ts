import { describe, expect, it } from 'vitest';
import { counts, findPointAt } from '@/lib/geometry/construction';
import type { Vec3 } from '@/lib/geometry/vector';
import { createBuildStore, selectCanUndo, type Target } from './store';

const T = (pos: Vec3, extra: Partial<Target> = {}): Target => ({ pos, ...extra });
const C = (s: ReturnType<typeof createBuildStore>) => s.getState().history.present;

describe('build store', () => {
  it('guided cube flow: point → line chain → face → push-pull', () => {
    const s = createBuildStore();
    const st = () => s.getState();
    st().setTool('point');
    st().tap(T([0, 0, 0]));
    expect(counts(C(s)).V).toBe(1);

    st().setTool('line');
    const p0 = findPointAt(C(s), [0, 0, 0])!;
    st().tap(T([0, 0, 0], { pointId: p0 }));
    st().tap(T([4, 0, 0]));
    st().tap(T([4, 0, 4])); // chains from previous end
    st().tap(T([0, 0, 4]));
    st().tap(T([0, 0, 0], { pointId: p0 })); // closing into an existing point ends the chain
    expect(counts(C(s))).toEqual({ V: 4, E: 4, F: 0 });
    expect(st().draft).toBeNull();

    st().setTool('face');
    st().tap(T([2, 0, 2])); // tap inside the closed loop
    expect(counts(C(s)).F).toBe(1);
    expect(st().feedback).toBeNull(); // it's a valid square

    st().setTool('extrude');
    const faceId = Object.keys(C(s).faces)[0]!;
    st().tap(T([2, 0, 2], { faceId }));
    st().setExtrudeHeight(4);
    st().tap(T([2, 0, 2], { faceId }));
    expect(counts(C(s))).toEqual({ V: 8, E: 12, F: 6 });

    st().check();
    expect(st().feedback).toMatchObject({ kind: 'success', analysis: { solid: { shape: 'cube', dims: [4, 4, 4] } } });
  });

  it('a wrong square is flagged right after the step, and undo removes it', () => {
    const s = createBuildStore();
    s.getState().setTool('face');
    s.getState().setFaceIntent('square');
    for (const p of [[0, 0, 0], [4, 0, 0], [4, 0, 3], [0, 0, 3]] as Vec3[]) s.getState().tap(T(p));
    const fb = s.getState().feedback;
    expect(fb?.kind).toBe('issues');
    expect(fb?.kind === 'issues' && fb.issues[0]!.code).toBe('side-mismatch');
    s.getState().undo();
    expect(counts(C(s)).F).toBe(0);
    expect(s.getState().feedback).toBeNull();
    s.getState().redo();
    expect(counts(C(s)).F).toBe(1);
  });

  it('extrude height is clamped so nothing goes below the ground', () => {
    const s = createBuildStore();
    s.getState().setTool('face');
    for (const p of [[0, 0, 0], [3, 0, 0], [3, 0, 3], [0, 0, 3]] as Vec3[]) s.getState().tap(T(p));
    const faceId = Object.keys(C(s).faces)[0]!;
    s.getState().setTool('extrude');
    s.getState().dragStart(T([1, 0, 1], { faceId }));
    s.getState().setExtrudeHeight(-5);
    expect(s.getState().draft).toMatchObject({ height: 0 });
    s.getState().setExtrudeHeight(99);
    expect(s.getState().draft).toMatchObject({ height: 12 });
    s.getState().setExtrudeHeight(3);
    s.getState().dragEnd(T([1, 0, 1]));
    expect(counts(C(s)).V).toBe(8);
  });

  it('drag-to-draw a line (touch) does not chain', () => {
    const s = createBuildStore();
    s.getState().dragStart(T([0, 0, 0]));
    s.getState().dragEnd(T([5, 0, 0]));
    expect(counts(C(s)).E).toBe(1);
    expect(s.getState().draft).toBeNull();
  });

  it('move a point by dragging; undo cancels a pending draft first', () => {
    const s = createBuildStore();
    s.getState().tap(T([0, 0, 0]));
    s.getState().tap(T([3, 0, 0]));
    const id = findPointAt(C(s), [3, 0, 0])!;
    s.getState().setTool('move');
    s.getState().dragStart(T([3, 0, 0], { pointId: id }));
    s.getState().dragEnd(T([4, 0, 0]));
    expect(C(s).points[id]!.pos).toEqual([4, 0, 0]);
    s.getState().setTool('line');
    s.getState().tap(T([1, 0, 1]));
    expect(selectCanUndo(s.getState())).toBe(true);
    s.getState().undo(); // cancels the half-drawn line
    expect(C(s).points[id]!.pos).toEqual([4, 0, 0]);
    s.getState().undo(); // undoes the move
    expect(C(s).points[id]!.pos).toEqual([3, 0, 0]);
  });

  it('placing a point twice explains why nothing happened; reset is undoable', () => {
    const s = createBuildStore();
    s.getState().setTool('point');
    s.getState().tap(T([1, 0, 1]));
    s.getState().tap(T([1, 0, 1]));
    expect(s.getState().feedback).toEqual({ kind: 'error', error: 'point-exists' });
    s.getState().reset();
    expect(counts(C(s)).V).toBe(0);
    s.getState().undo();
    expect(counts(C(s)).V).toBe(1);
  });
});
