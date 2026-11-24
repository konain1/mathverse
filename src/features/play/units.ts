import { useT } from '@/i18n';
import type { Unit } from '@/topics/contract';

export function useUnitLabel() {
  const t = useT();
  return (u: Unit) =>
    ({
      cm: 'cm',
      cm2: 'cm²',
      cm3: 'cm³',
      deg: '°',
      times: t('play.units.times'),
      cubes: t('play.units.cubes'),
      squares: t('play.units.squares'),
      tiles: t('play.units.tiles'),
      rupees: '₹',
      none: '',
    })[u];
}

/** Money is written before the number (₹ 120); everything else after it. */
export const unitIsPrefix = (u: Unit) => u === 'rupees';

export function useFormatValue() {
  const unit = useUnitLabel();
  return (value: number, u: Unit) => (unitIsPrefix(u) ? `${unit(u)} ${value}` : `${value} ${unit(u)}`.trim());
}
