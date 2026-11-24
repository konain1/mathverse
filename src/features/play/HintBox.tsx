import { Lightbulb } from 'lucide-react';
import { useLocalize, useT } from '@/i18n';
import type { BuildPlan } from '@/topics/contract';

/** Three levels: nudge → clue → reveal (the whole figure appears as a dashed ghost). */
export function HintBox({ plan, level, onMore }: { plan: BuildPlan; level: number; onMore: () => void }) {
  const t = useT();
  const loc = useLocalize();
  const lines = [loc(plan.hints.nudge), loc(plan.hints.clue), t('play.build.hintReveal')].slice(0, level);
  return (
    <div className="rounded-card border border-accent/40 p-3">
      {lines.length > 0 && (
        <ol className="space-y-2 text-sm">
          {lines.map((l, i) => (
            <li key={i} className="flex gap-2">
              <span className="num shrink-0 text-xs font-bold text-accent">{t('play.build.hintTitle', { n: i + 1 })}</span>
              <span>{l}</span>
            </li>
          ))}
        </ol>
      )}
      {level < 3 && (
        <button type="button" onClick={onMore} className="btn-ghost mt-2 w-full text-sm">
          <Lightbulb className="h-4 w-4" aria-hidden="true" />
          {level === 0 ? t('play.build.useHint') : t('play.build.nextHint')}
        </button>
      )}
    </div>
  );
}
