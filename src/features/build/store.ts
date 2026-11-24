/**
 * Build-mode state machine. One store per workspace (see BuildProvider), so a
 * topic page and a "try yourself" canvas never share state.
 *
 * Input is device-agnostic: the pointer layer and the keyboard both turn what
 * the student did into a Target (a snapped grid position, maybe an existing
 * point or face) and call tap / dragStart / dragMove / dragEnd.
 */
import { createStore } from 'zustand/vanilla';
import {
  addFace,
  addFaceAt,
  addPoint,
  addSegment,
  extrudeFace,
  faceVertices,
  movePoint,
  pointPos,
  type Construction,
  type FaceIntent,
  type OpError,
  type OpResult,
} from '@/lib/geometry/construction';
import { loopAt } from '@/lib/geometry/loops';
import { centroid, polygonNormal } from '@/lib/geometry/polygon';
import { analyzeConstruction, checkFaceIntent, type Analysis, type Issue } from '@/lib/geometry/validators';
import { dot, equals, scale, sub, type Vec3 } from '@/lib/geometry/vector';
import { canRedo, canUndo, createHistory, pushHistory, redo, resetHistory, undo, type History } from '@/lib/history';
import { emptyConstruction } from '@/lib/geometry/construction';

export const TOOLS = ['point', 'line', 'face', 'extrude', 'move', 'rotate'] as const;
export type Tool = (typeof TOOLS)[number];

/** Grid half-size in cm: points live in [-GRID_EXTENT, GRID_EXTENT]. */
export const GRID_EXTENT = 10;
export const MAX_EXTRUDE = 12;

export interface Target {
  pos: Vec3;
  /** set when the pointer snapped to an existing point */
  pointId?: string;
  /** set when the pointer is over a face */
  faceId?: string;
}

export type Draft =
  | { kind: 'line'; start: Target }
  | { kind: 'face'; picks: Target[] }
  | { kind: 'extrude'; faceId: string; height: number }
  | { kind: 'move'; pointId: string };

export type Feedback =
  | { kind: 'issues'; issues: Issue[]; source: 'step' | 'check' }
  | { kind: 'error'; error: OpError | 'below-ground' }
  | { kind: 'success'; analysis: Analysis }
  | null;

export interface BuildOptions {
  initial?: Construction;
  /** Topic-specific final check (Phase 3). Defaults to a generic analysis. */
  check?: (c: Construction) => Feedback;
}

export interface BuildState {
  history: History<Construction>;
  tool: Tool;
  faceIntent: FaceIntent;
  draft: Draft | null;
  dragging: boolean;
  hover: Target | null;
  feedback: Feedback;
  /** ids created by the last action (for the pop-in animation) */
  lastCreated: string[];
  cameraResetTick: number;

  setTool: (tool: Tool) => void;
  setFaceIntent: (intent: FaceIntent) => void;
  hoverAt: (t: Target | null) => void;
  tap: (t: Target) => void;
  dragStart: (t: Target) => void;
  dragMove: (t: Target) => void;
  dragEnd: (t: Target) => void;
  setExtrudeHeight: (h: number) => void;
  cancel: () => void;
  undo: () => void;
  redo: () => void;
  reset: () => void;
  check: () => void;
  dismissFeedback: () => void;
  resetCamera: () => void;
}

/** Direction a face is pushed: straight up for flat faces, outwards for side faces. */
export function extrudeAxis(c: Construction, faceId: string): Vec3 {
  const pts = faceVertices(c, faceId);
  const n = polygonNormal(pts);
  if (Math.abs(n[1]) > 0.9) return [0, 1, 0];
  const all = Object.values(c.points).map((p) => p.pos);
  const outward = sub(centroid(pts), centroid(all));
  return dot(n, outward) < 0 ? scale(n, -1) : n;
}

/** Height limits so a figure never goes below the ground grid. */
export function extrudeRange(c: Construction, faceId: string): [number, number] {
  const axis = extrudeAxis(c, faceId);
  if (axis[1] === 1) {
    const minY = Math.min(...faceVertices(c, faceId).map((p) => p[1]));
    return [-minY, MAX_EXTRUDE];
  }
  return [-MAX_EXTRUDE, MAX_EXTRUDE];
}

const genericCheck = (c: Construction): Feedback => {
  const analysis = analyzeConstruction(c);
  return analysis.issues.length ? { kind: 'issues', issues: analysis.issues, source: 'check' } : { kind: 'success', analysis };
};

export function createBuildStore(opts: BuildOptions = {}) {
  const initial = opts.initial ?? emptyConstruction();
  const runCheck = opts.check ?? genericCheck;

  return createStore<BuildState>()((set, get) => {
    const present = () => get().history.present;

    /** Apply an operation result: push history, or show why it failed. */
    const commit = (r: OpResult, stepFaceId?: string): boolean => {
      if (!r.ok) {
        set({ feedback: { kind: 'error', error: r.error } });
        return false;
      }
      if (r.c === present()) return false;
      let feedback: Feedback = null;
      if (stepFaceId) {
        // validate right after the step, so mistakes show while they're fresh
        const v = checkFaceIntent(r.c, stepFaceId);
        if (!v.ok) feedback = { kind: 'issues', issues: v.issues, source: 'step' };
      }
      set((s) => ({ history: pushHistory(s.history, r.c), lastCreated: r.created, feedback }));
      return true;
    };

    const commitFace = (r: OpResult & { id?: string }) => commit(r, r.ok ? r.id : undefined);

    const commitLine = (start: Target, end: Target, chain: boolean) => {
      if (equals(start.pos, end.pos)) {
        set({ draft: null });
        return;
      }
      const ok = commit(addSegment(present(), start.pos, end.pos));
      // keep drawing from the end point, unless we connected into existing geometry
      set({ draft: ok && chain && !end.pointId ? { kind: 'line', start: { pos: end.pos } } : null });
    };

    const commitExtrude = (faceId: string, height: number) => {
      if (height === 0) return;
      const c = present();
      const r = extrudeFace(c, faceId, scale(extrudeAxis(c, faceId), height));
      commit(r);
      set({ draft: null });
    };

    const commitMove = (pointId: string, pos: Vec3) => {
      if (pos[1] < 0) {
        set({ feedback: { kind: 'error', error: 'below-ground' }, draft: null });
        return;
      }
      const r = movePoint(present(), pointId, pos);
      if (r.ok || r.error !== 'same-point') commit(r);
      set({ draft: null });
    };

    return {
      history: createHistory(initial),
      tool: 'line',
      faceIntent: 'square',
      draft: null,
      dragging: false,
      hover: null,
      feedback: null,
      lastCreated: [],
      cameraResetTick: 0,

      setTool: (tool) => set({ tool, draft: null, dragging: false }),
      setFaceIntent: (faceIntent) => set({ faceIntent, draft: null }),
      hoverAt: (hover) => set({ hover }),

      tap: (t) => {
        const { tool, draft, faceIntent } = get();
        const c = present();
        switch (tool) {
          case 'point': {
            const r = addPoint(c, t.pos);
            if (r.ok && r.created.length === 0) set({ feedback: { kind: 'error', error: 'point-exists' } });
            else commit(r);
            return;
          }
          case 'line': {
            if (draft?.kind !== 'line') set({ draft: { kind: 'line', start: t } });
            else commitLine(draft.start, t, true);
            return;
          }
          case 'face': {
            const picks = draft?.kind === 'face' ? draft.picks : [];
            if (picks.length === 0 && !t.pointId) {
              const loop = loopAt(c, t.pos);
              if (loop) {
                commitFace(addFace(c, loop, faceIntent));
                return;
              }
            }
            const expected = faceIntent === 'triangle' ? 3 : 4;
            const first = picks[0];
            if (first && picks.length >= 3 && equals(first.pos, t.pos)) {
              commitFace(addFaceAt(c, picks.map((p) => p.pos), faceIntent));
              set({ draft: null });
              return;
            }
            if (picks.some((p) => equals(p.pos, t.pos))) return;
            const next = [...picks, t];
            if (next.length === expected) {
              commitFace(addFaceAt(c, next.map((p) => p.pos), faceIntent));
              set({ draft: null });
            } else set({ draft: { kind: 'face', picks: next } });
            return;
          }
          case 'extrude': {
            if (draft?.kind === 'extrude' && draft.height !== 0) commitExtrude(draft.faceId, draft.height);
            else if (t.faceId) set({ draft: { kind: 'extrude', faceId: t.faceId, height: 0 } });
            return;
          }
          case 'move': {
            if (draft?.kind === 'move') commitMove(draft.pointId, t.pos);
            else if (t.pointId) set({ draft: { kind: 'move', pointId: t.pointId } });
            return;
          }
          case 'rotate':
            return;
        }
      },

      dragStart: (t) => {
        const { tool } = get();
        if (tool === 'line') set({ draft: { kind: 'line', start: t }, dragging: true });
        else if (tool === 'move' && t.pointId) set({ draft: { kind: 'move', pointId: t.pointId }, dragging: true });
        else if (tool === 'extrude' && t.faceId) set({ draft: { kind: 'extrude', faceId: t.faceId, height: 0 }, dragging: true });
      },
      dragMove: (t) => set({ hover: t }),
      dragEnd: (t) => {
        const { draft, dragging } = get();
        set({ dragging: false });
        if (!dragging || !draft) return;
        if (draft.kind === 'line') commitLine(draft.start, t, false);
        else if (draft.kind === 'move') commitMove(draft.pointId, t.pos);
        else if (draft.kind === 'extrude') {
          if (draft.height !== 0) commitExtrude(draft.faceId, draft.height);
          else set({ draft: null });
        }
      },

      setExtrudeHeight: (h) => {
        const { draft } = get();
        if (draft?.kind !== 'extrude') return;
        const [lo, hi] = extrudeRange(present(), draft.faceId);
        const height = Math.max(lo, Math.min(hi, Math.round(h)));
        if (height !== draft.height) set({ draft: { ...draft, height } });
      },

      cancel: () => set({ draft: null, dragging: false }),
      undo: () => {
        if (get().draft) return set({ draft: null, dragging: false });
        set((s) => ({ history: undo(s.history), feedback: null, lastCreated: [] }));
      },
      redo: () => set((s) => ({ history: redo(s.history), draft: null, feedback: null, lastCreated: [] })),
      reset: () =>
        set((s) => ({ history: resetHistory(s.history, initial), draft: null, feedback: null, lastCreated: [] })),
      check: () => set({ feedback: runCheck(present()), draft: null }),
      dismissFeedback: () => set({ feedback: null }),
      resetCamera: () => set((s) => ({ cameraResetTick: s.cameraResetTick + 1 })),
    };
  });
}

export type BuildStore = ReturnType<typeof createBuildStore>;

// ─── selectors ───────────────────────────────────────────────────────────
export const selectConstruction = (s: BuildState) => s.history.present;
export const selectCanUndo = (s: BuildState) => canUndo(s.history) || s.draft !== null;
export const selectCanRedo = (s: BuildState) => canRedo(s.history);

/** Entity ids that should glow red (from the latest issues). */
export function highlightedIds(feedback: Feedback): Set<string> {
  return new Set(feedback?.kind === 'issues' ? feedback.issues.flatMap((i) => i.entities) : []);
}

/** Position of the pending start of a line/move (for ghosts). */
export function draftAnchor(s: BuildState): Vec3 | undefined {
  const d = s.draft;
  if (d?.kind === 'line') return d.start.pos;
  if (d?.kind === 'move') return pointPos(s.history.present, d.pointId);
  return undefined;
}
