import { Pause, Play, SkipBack, SkipForward } from 'lucide-react';
import { useT } from '@/i18n';
import { cn } from '@/lib/cn';
import { stepStart } from './timeline';
import { SPEEDS, type Player } from './usePlayer';

/** Previous / Play-Pause / Next, speed 0.5×–2×, and a scrubber with a tick per step. */
export function StepControls({ player, durations }: { player: Player; durations: number[] }) {
  const t = useT();
  const btn = 'grid h-11 w-11 place-items-center rounded-control text-ink hover:bg-surface/70 disabled:opacity-35';
  return (
    <div className="glass pointer-events-auto flex w-full max-w-2xl flex-col gap-2 rounded-panel p-2 shadow-lift sm:p-3">
      <div className="relative px-1">
        <input
          type="range"
          min={0}
          max={player.total}
          step={0.01}
          value={player.time}
          onChange={(e) => player.seek(Number(e.target.value))}
          aria-label={t('play.solve.scrubber')}
          aria-valuetext={t('play.solve.stepOf', { n: player.index + 1, total: durations.length })}
          className="w-full accent-[rgb(var(--accent))]"
        />
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-1 top-1/2 h-0">
          {durations.slice(1).map((_, i) => (
            <span
              key={i}
              className="absolute h-2 w-px -translate-y-1/2 bg-ink/40"
              style={{ left: `${(stepStart(durations, i + 1) / player.total) * 100}%` }}
            />
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <button type="button" className={btn} onClick={player.prev} aria-label={t('play.solve.prev')} title={t('play.solve.prev')}>
            <SkipBack className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={player.toggle}
            aria-label={player.playing ? t('play.solve.pause') : t('play.solve.play')}
            className="grid h-12 w-12 place-items-center rounded-full bg-accent text-bg shadow-glow"
          >
            {player.playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 translate-x-px" />}
          </button>
          <button
            type="button"
            className={btn}
            onClick={player.next}
            disabled={player.index >= durations.length - 1 && player.t >= 1}
            aria-label={t('play.solve.next')}
            title={t('play.solve.next')}
          >
            <SkipForward className="h-5 w-5" />
          </button>
        </div>
        <span className="num text-sm text-muted">
          {t('play.solve.stepOf', { n: player.index + 1, total: durations.length })}
        </span>
        <div role="radiogroup" aria-label={t('play.solve.speed')} className="flex rounded-control border border-line/70 p-0.5">
          {SPEEDS.map((s) => (
            <button
              key={s}
              type="button"
              role="radio"
              aria-checked={player.speed === s}
              onClick={() => player.setSpeed(s)}
              className={cn(
                'num min-h-[40px] min-w-[44px] rounded-[0.6rem] px-1.5 text-xs font-bold',
                player.speed === s ? 'bg-ink text-bg' : 'text-muted hover:text-ink',
              )}
            >
              {s}×
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
