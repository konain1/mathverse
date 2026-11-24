import { useSettings, type Theme } from '@/state/settings';
import type { ShapeFamily } from '@/topics/types';

/**
 * three.js can't read CSS variables, so the 3D palette mirrors src/styles/tokens.css.
 * Keep the two in sync when changing colours.
 */
export const SHAPE_COLORS: Record<Theme, Record<ShapeFamily, string>> = {
  dark: { triangle: '#FFB84C', square: '#2DD4BF', rectangle: '#FB7191', cube: '#A78BFA' },
  light: { triangle: '#B86A00', square: '#0D8C7D', rectangle: '#D03460', cube: '#6848DE' },
};

export interface SceneColors {
  grid: string;
  section: string;
  ink: string;
  muted: string;
  bad: string;
  ok: string;
  glowOpacity: number;
}

export const SCENE_COLORS: Record<Theme, SceneColors> = {
  dark: { grid: '#2B3B72', section: '#4A5FA8', ink: '#E6ECFF', muted: '#96A2CD', bad: '#FF6B6B', ok: '#34D399', glowOpacity: 0.32 },
  light: { grid: '#BCC8EA', section: '#8296CF', ink: '#0C1638', muted: '#485684', bad: '#D63333', ok: '#059669', glowOpacity: 0.18 },
};

export function usePalette() {
  const theme = useSettings((s) => s.theme);
  return { theme, shape: SHAPE_COLORS[theme], scene: SCENE_COLORS[theme] };
}
