import { roundTo } from '@/lib/geometry/vector';

/** "4 cm", "5.66 cm": whole numbers stay whole, others get up to 2 decimals. */
export function formatCm(x: number): string {
  const r = roundTo(x, 2);
  return `${Number.isInteger(r) ? r : r.toFixed(2).replace(/0$/, '')} cm`;
}
