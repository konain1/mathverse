import { useEffect, type RefObject } from 'react';
import { faceVertices } from '@/lib/geometry/construction';
import type { Vec3 } from '@/lib/geometry/vector';
import { useBuildStore } from '../BuildProvider';
import { GRID_EXTENT, type Tool } from '../store';
import { targetAtPosition } from '../targeting';

const TOOL_KEYS: Record<string, Tool> = { p: 'point', l: 'line', f: 'face', e: 'extrude', m: 'move', r: 'rotate' };
const clamp = (n: number) => Math.max(-GRID_EXTENT, Math.min(GRID_EXTENT, n));

function isTyping(el: EventTarget | null) {
  return el instanceof HTMLElement && (el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName));
}

/**
 * Keyboard support for build mode.
 * Anywhere in the workspace: tool letters, undo/redo, Esc.
 * With the canvas focused: arrow keys move a grid cursor, Enter/Space acts at it,
 * and during push-pull ↑/↓ change the height.
 */
export function useBuildKeyboard(canvasHost: RefObject<HTMLElement>) {
  const store = useBuildStore();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isTyping(e.target) || e.altKey) return;
      const s = store.getState();
      const mod = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();

      if (mod && key === 'z') {
        e.preventDefault();
        if (e.shiftKey) s.redo();
        else s.undo();
        return;
      }
      if (mod && key === 'y') {
        e.preventDefault();
        s.redo();
        return;
      }
      if (mod) return;
      if (e.key === 'Escape') {
        s.cancel();
        return;
      }
      if (TOOL_KEYS[key] && !e.shiftKey) {
        s.setTool(TOOL_KEYS[key]!);
        return;
      }

      // canvas-only keys
      if (!canvasHost.current?.contains(document.activeElement)) return;
      const c = s.history.present;
      if (s.draft?.kind === 'extrude' && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
        e.preventDefault();
        s.setExtrudeHeight(s.draft.height + (e.key === 'ArrowUp' ? 1 : -1));
        return;
      }
      const delta: Record<string, [number, number]> = {
        ArrowLeft: [-1, 0],
        ArrowRight: [1, 0],
        ArrowUp: [0, -1],
        ArrowDown: [0, 1],
      };
      if (delta[e.key]) {
        e.preventDefault();
        const base: Vec3 = s.hover?.pos ?? [0, 0, 0];
        const [dx, dz] = delta[e.key]!;
        s.hoverAt(targetAtPosition(c, [clamp(base[0] + dx), base[1], clamp(base[2] + dz)]));
        return;
      }
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        // re-resolve: the figure may have changed since the cursor last moved
        const t = targetAtPosition(c, s.hover?.pos ?? [0, 0, 0]);
        s.hoverAt(t);
        if (s.draft?.kind === 'extrude') {
          s.tap({ ...t, faceId: s.draft.faceId, pos: faceVertices(c, s.draft.faceId)[0]! });
        } else s.tap(t);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [store, canvasHost]);
}
