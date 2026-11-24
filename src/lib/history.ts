/** Generic undo/redo stack of immutable snapshots. */
export interface History<T> {
  past: readonly T[];
  present: T;
  future: readonly T[];
}

export const MAX_HISTORY = 200;

export const createHistory = <T>(present: T): History<T> => ({ past: [], present, future: [] });

export function pushHistory<T>(h: History<T>, next: T, limit = MAX_HISTORY): History<T> {
  if (next === h.present) return h;
  const past = [...h.past, h.present];
  return { past: past.length > limit ? past.slice(past.length - limit) : past, present: next, future: [] };
}

export function undo<T>(h: History<T>): History<T> {
  if (h.past.length === 0) return h;
  return { past: h.past.slice(0, -1), present: h.past[h.past.length - 1]!, future: [h.present, ...h.future] };
}

export function redo<T>(h: History<T>): History<T> {
  if (h.future.length === 0) return h;
  return { past: [...h.past, h.present], present: h.future[0]!, future: h.future.slice(1) };
}

/** Reset is itself undoable (students hit it by accident). */
export function resetHistory<T>(h: History<T>, initial: T): History<T> {
  return pushHistory(h, initial);
}

export const canUndo = <T>(h: History<T>) => h.past.length > 0;
export const canRedo = <T>(h: History<T>) => h.future.length > 0;
