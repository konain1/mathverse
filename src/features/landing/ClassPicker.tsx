import { useRef, type KeyboardEvent } from 'react';
import { useT } from '@/i18n';
import { cn } from '@/lib/cn';
import { useSettings } from '@/state/settings';
import { CLASS_LEVELS, type ClassLevel } from '@/topics/types';

export function ClassPicker() {
  const t = useT();
  const value = useSettings((s) => s.classLevel);
  const setValue = useSettings((s) => s.setClassLevel);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  // Radio-group keyboard pattern: arrows move + select
  const onKeyDown = (e: KeyboardEvent, index: number) => {
    const delta = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
    if (!delta) return;
    e.preventDefault();
    const next = (index + delta + CLASS_LEVELS.length) % CLASS_LEVELS.length;
    setValue(CLASS_LEVELS[next] as ClassLevel);
    refs.current[next]?.focus();
  };

  return (
    <div className="flex flex-col gap-2">
      <span id="class-picker-label" className="text-sm font-semibold text-muted">
        {t('landing.classPickerLabel')}
      </span>
      <div role="radiogroup" aria-labelledby="class-picker-label" className="glass inline-flex rounded-card p-1">
        {CLASS_LEVELS.map((c, i) => (
          <button
            key={c}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={value === c}
            tabIndex={value === c ? 0 : -1}
            onClick={() => setValue(c)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={cn(
              'min-h-[48px] min-w-[96px] rounded-control px-4 font-extrabold transition-colors',
              value === c ? 'bg-accent text-bg shadow-glow' : 'text-muted hover:text-ink',
            )}
          >
            {t('landing.classOption', { n: c })}
          </button>
        ))}
      </div>
    </div>
  );
}
