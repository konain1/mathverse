import { usePalette } from '@/design/palette';
import type { ShapeFamily } from '@/topics/types';

export function useSceneColors(family: ShapeFamily) {
  const { shape, scene, theme } = usePalette();
  return { ...scene, accent: shape[family], theme };
}
export type BuildColors = ReturnType<typeof useSceneColors>;
