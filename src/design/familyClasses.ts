import type { ShapeFamily } from '@/topics/types';

/** Static class names (Tailwind can't see dynamically built ones like `text-${family}`). */
export const FAMILY_TEXT: Record<ShapeFamily, string> = {
  triangle: 'text-triangle',
  square: 'text-square',
  rectangle: 'text-rectangle',
  cube: 'text-cube',
};
