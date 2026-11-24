import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import * as THREE from 'three';
import { faceVertices, pointPos } from '@/lib/geometry/construction';
import { centroid, closestLineParamToRay } from '@/lib/geometry/polygon';
import type { Vec3 } from '@/lib/geometry/vector';
import { useBuildStore } from '../BuildProvider';
import { extrudeAxis, type Target } from '../store';
import { faceHit, groundHit } from '../targeting';

const TAP_SLOP = { mouse: 6, touch: 12, pen: 8 } as const;
const SNAP_RADIUS = { mouse: 16, touch: 30, pen: 20 } as const;
type PType = keyof typeof TAP_SLOP;
const ptype = (e: PointerEvent): PType => (e.pointerType === 'touch' || e.pointerType === 'pen' ? e.pointerType : 'mouse');

/**
 * Turns raw pointer events on the canvas into build actions:
 *  - tap (press + release without moving) → store.tap
 *  - one-finger / left-button drag → dragStart/Move/End (line, move, push-pull)
 *  - a second finger cancels everything (that gesture belongs to the camera)
 * Snapping: existing points within a screen radius win, else the 1 cm grid.
 */
export function InteractionLayer() {
  const store = useBuildStore();
  const { camera, gl } = useThree();

  useEffect(() => {
    const el = gl.domElement;
    const raycaster = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    const tmp = new THREE.Vector3();
    const active = new Map<number, PointerEvent>();
    let g: { id: number; x: number; y: number; type: PType; multi: boolean; dragging: boolean; start: Target | null } | null =
      null;

    const ray = (e: PointerEvent): { origin: Vec3; dir: Vec3 } => {
      const r = el.getBoundingClientRect();
      ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      raycaster.setFromCamera(ndc, camera);
      const o = raycaster.ray.origin;
      const d = raycaster.ray.direction;
      return { origin: [o.x, o.y, o.z], dir: [d.x, d.y, d.z] };
    };

    const target = (e: PointerEvent): Target | null => {
      const s = store.getState();
      const c = s.history.present;
      const { origin, dir } = ray(e);
      const r = el.getBoundingClientRect();
      const movingId = s.draft?.kind === 'move' ? s.draft.pointId : undefined;

      // 1) snap to an existing point near the pointer (screen space)
      let best: { id: string; d: number } | undefined;
      const radius = SNAP_RADIUS[ptype(e)];
      for (const p of Object.values(c.points)) {
        if (p.id === movingId) continue;
        tmp.set(...p.pos).project(camera);
        if (tmp.z > 1) continue; // behind the camera
        const sx = ((tmp.x + 1) / 2) * r.width + r.left;
        const sy = ((1 - tmp.y) / 2) * r.height + r.top;
        const d = Math.hypot(sx - e.clientX, sy - e.clientY);
        if (d < radius && (!best || d < best.d)) best = { id: p.id, d };
      }
      const faceId = s.tool === 'extrude' || s.tool === 'face' ? faceHit(c, origin, dir) : undefined;
      if (best) return { pos: pointPos(c, best.id), pointId: best.id, ...(faceId && { faceId }) };

      // 2) the grid (or the moving point's own height)
      const planeY = movingId ? pointPos(c, movingId)[1] : 0;
      const pos = groundHit(origin, dir, planeY);
      if (!pos) return faceId ? { pos: centroid(faceVertices(c, faceId)), faceId } : null;
      return { pos, ...(faceId && { faceId }) };
    };

    /** Push-pull: how far along the face's axis the pointer ray passes. */
    const updateExtrude = (e: PointerEvent) => {
      const s = store.getState();
      if (s.draft?.kind !== 'extrude') return;
      const c = s.history.present;
      const base = centroid(faceVertices(c, s.draft.faceId));
      const { origin, dir } = ray(e);
      const h = closestLineParamToRay(base, extrudeAxis(c, s.draft.faceId), origin, dir);
      if (h !== null) s.setExtrudeHeight(h);
    };

    const onDown = (e: PointerEvent) => {
      active.set(e.pointerId, e);
      if (active.size > 1) {
        if (g?.dragging) store.getState().cancel();
        if (g) g.multi = true;
        return;
      }
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      if (store.getState().tool === 'rotate') return;
      g = { id: e.pointerId, x: e.clientX, y: e.clientY, type: ptype(e), multi: false, dragging: false, start: target(e) };
    };

    const onMove = (e: PointerEvent) => {
      if (active.has(e.pointerId)) active.set(e.pointerId, e);
      const s = store.getState();
      if (s.tool === 'rotate') return;
      if (g && g.id === e.pointerId && !g.multi && !g.dragging) {
        const moved = Math.hypot(e.clientX - g.x, e.clientY - g.y);
        const canDrag =
          g.start &&
          ((s.tool === 'line' && s.draft?.kind !== 'line') ||
            (s.tool === 'move' && g.start.pointId) ||
            (s.tool === 'extrude' && (g.start.faceId || s.draft?.kind === 'extrude')));
        if (moved > TAP_SLOP[g.type] && canDrag) {
          g.dragging = true;
          if (s.draft?.kind !== 'extrude') s.dragStart(g.start!);
          else store.setState({ dragging: true });
        }
      }
      if (g?.multi) return;
      const t = target(e);
      if (g?.dragging && t) s.dragMove(t);
      else s.hoverAt(t);
      updateExtrude(e);
    };

    const onUp = (e: PointerEvent) => {
      active.delete(e.pointerId);
      if (!g || g.id !== e.pointerId) return;
      const gesture = g;
      g = null;
      if (gesture.multi) return;
      const s = store.getState();
      const t = target(e) ?? gesture.start;
      if (gesture.dragging) {
        if (t) s.dragEnd(t);
        else s.cancel();
      } else if (Math.hypot(e.clientX - gesture.x, e.clientY - gesture.y) <= TAP_SLOP[gesture.type] && t) {
        s.tap(t);
      }
      // fingers don't hover: clear the ghost unless a draft needs it
      if (e.pointerType !== 'mouse' && !store.getState().draft) s.hoverAt(null);
    };

    const onCancel = (e: PointerEvent) => {
      active.delete(e.pointerId);
      if (g?.id === e.pointerId) {
        if (g.dragging) store.getState().cancel();
        g = null;
      }
    };
    const onLeave = (e: PointerEvent) => {
      if (e.pointerType === 'mouse' && !g) store.getState().hoverAt(null);
    };

    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerup', onUp);
    el.addEventListener('pointercancel', onCancel);
    el.addEventListener('pointerleave', onLeave);
    const noMenu = (e: Event) => e.preventDefault(); // right-drag rotates the camera
    el.addEventListener('contextmenu', noMenu);
    return () => {
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerup', onUp);
      el.removeEventListener('pointercancel', onCancel);
      el.removeEventListener('pointerleave', onLeave);
      el.removeEventListener('contextmenu', noMenu);
    };
  }, [store, camera, gl]);

  return null;
}
