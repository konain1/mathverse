import { lengthText } from '@/lib/format';
import { squareDiagonal } from '@/lib/geometry/formulas';
import type { Params, SceneProps } from '@/topics/contract';
import { FlatOverlay, FlatScene, flatHome, pythagPoints } from '@/topics/shared/flat/FlatScene';
import { axisQuad, diamondQuad, type FlatConfig } from '@/topics/shared/flat/flatState';

const isDiamond = (id: string) => id === 'area-from-diagonal' || id === 'diagonal-from-area';
const cfg = (p: Params, id: string): FlatConfig =>
  isDiamond(id) ? { corners: diamondQuad(p.k!), kind: 'square' } : { corners: axisQuad(p.a!, p.a!), kind: 'square' };

export default function Scene(props: SceneProps) {
  const a = props.params.a ?? 0;
  const labels = isDiamond(props.questionId)
    ? undefined
    : { diagonal: lengthText(squareDiagonal(a)), squares: [`${a * a} cm²`, `${a * a} cm²`, `${2 * a * a} cm²`] as [string, string, string] };
  return <FlatScene {...props} cfg={cfg(props.params, props.questionId)} family="square" labels={labels} />;
}
export function Overlay(props: SceneProps) {
  return <FlatOverlay {...props} cfg={cfg(props.params, props.questionId)} />;
}
export const home = (p: Params, id: string) =>
  isDiamond(id) ? flatHome(cfg(p, id).corners, 1.3) : flatHome(pythagPoints(cfg(p, id).corners), 1.05);
