import { Check } from 'lucide-react';
import { useT } from '@/i18n';
import { cn } from '@/lib/cn';

export const PHASES = ['understand', 'build', 'solve', 'try'] as const;
export type Phase = (typeof PHASES)[number];

/** Understand → Build → Solve → Try yourself. Students may jump around; done phases get a tick. */
export function PhaseTabs({ phase, onChange, done }: { phase: Phase; onChange: (p: Phase) => void; done: Partial<Record<Phase, boolean>> }) {
  const t = useT();
  return (
    <nav aria-label={t('play.phases.label')}>
      <ol className="grid grid-cols-4 gap-1 rounded-card border border-line/70 p-1">
        {PHASES.map((p, i) => (
          <li key={p}>
            <button
              type="button"
              onClick={() => onChange(p)}
              aria-current={phase === p ? 'step' : undefined}
              className={cn(
                'flex min-h-[48px] w-full flex-col items-center justify-center gap-0.5 rounded-control px-1 text-[11px] font-bold leading-tight sm:text-xs',
                phase === p ? 'bg-accent text-bg' : 'text-muted hover:text-ink',
              )}
            >
              <span className="num flex h-5 w-5 items-center justify-center rounded-full border border-current text-[10px]">
                {done[p] && phase !== p ? <Check className="h-3 w-3" aria-hidden="true" /> : i + 1}
              </span>
              {t(`play.phases.${p}`)}
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}
