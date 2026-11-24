import { lengthText } from '@/lib/format';
import { rectangleDiagonal } from '@/lib/geometry/formulas';
import type { Params, SceneProps } from '@/topics/contract';
import { FlatOverlay, FlatScene, flatHome, pythagPoints } from '@/topics/shared/flat/FlatScene';
import { axisQuad, type FlatConfig } from '@/topics/shared/flat/flatState';

const cfg = (p: Params): FlatConfig => ({ corners: axisQuad(p.l!, p.b!), kind: 'rectangle' });

export default function Scene(props: SceneProps) {
  const { l, b } = props.params as { l: number; b: number };
  const d2 = l * l + b * b;
  return (
    <FlatScene
      {...props}
      cfg={cfg(props.params)}
      family="rectangle"
      labels={{ diagonal: lengthText(rectangleDiagonal(l, b)), squares: [`${l * l} cm²`, `${b * b} cm²`, `${d2} cm²`] }}
    />
  );
}
export function Overlay(props: SceneProps) {
  return <FlatOverlay {...props} cfg={cfg(props.params)} />;
}
export const home = (p: Params, id: string) =>
  id === 'congruent-halves' ? flatHome(cfg(p).corners) : flatHome(pythagPoints(cfg(p).corners), 1.05);
