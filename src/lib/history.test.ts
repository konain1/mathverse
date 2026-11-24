import { describe, expect, it } from 'vitest';
import { canRedo, canUndo, createHistory, pushHistory, redo, resetHistory, undo } from './history';

describe('history', () => {
  it('undo / redo walk the snapshots', () => {
    let h = createHistory(0);
    h = pushHistory(h, 1);
    h = pushHistory(h, 2);
    expect(h.present).toBe(2);
    h = undo(h);
    expect(h.present).toBe(1);
    expect(canRedo(h)).toBe(true);
    h = redo(h);
    expect(h.present).toBe(2);
  });
  it('a new action clears the redo stack', () => {
    let h = pushHistory(pushHistory(createHistory('a'), 'b'), 'c');
    h = undo(h);
    h = pushHistory(h, 'x');
    expect(canRedo(h)).toBe(false);
    expect(h.past).toEqual(['a', 'b']);
  });
  it('undo at the start is a no-op; reset is undoable; limit is respected', () => {
    const h0 = createHistory(0);
    expect(undo(h0)).toBe(h0);
    expect(canUndo(h0)).toBe(false);
    const h = resetHistory(pushHistory(h0, 5), 0);
    expect(undo(h).present).toBe(5);
    let big = createHistory(0);
    for (let i = 1; i <= 10; i++) big = pushHistory(big, i, 3);
    expect(big.past).toEqual([7, 8, 9]);
  });
});
