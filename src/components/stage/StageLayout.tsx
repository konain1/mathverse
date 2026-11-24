import { ChevronDown, ChevronUp } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { useT } from '@/i18n';
import { cn } from '@/lib/cn';
import type { ShapeFamily } from '@/topics/types';

/**
 * App-style layout used by build and solve.
 * Desktop: left panel | large stage (canvas) with overlays on top and bottom.
 * Phone: stage on top, panel as a collapsible bottom sheet.
 */
export function StageLayout({
  family,
  panel,
  stage,
  top,
  bottom,
  panelLabel,
  openSignal,
}: {
  family: ShapeFamily;
  panel: ReactNode;
  stage: ReactNode;
  top?: ReactNode;
  bottom?: ReactNode;
  panelLabel: string;
  /** when this value changes, the phone sheet opens (e.g. new feedback) */
  openSignal?: unknown;
}) {
  const t = useT();
  const [sheetOpen, setSheetOpen] = useState(() =>
    typeof window === 'undefined' || !window.matchMedia ? true : window.matchMedia('(min-width: 1024px)').matches,
  );
  useEffect(() => {
    if (openSignal) setSheetOpen(true);
  }, [openSignal]);

  return (
    <div data-accent={family} className="flex h-[calc(100dvh-4rem)] flex-col lg:grid lg:grid-cols-[minmax(340px,400px)_1fr] lg:grid-rows-[minmax(0,1fr)]">
      <section className="relative order-1 min-h-0 flex-1 lg:order-2">
        {stage}
        {top && <div className="pointer-events-none absolute inset-x-3 top-3 flex justify-center">{top}</div>}
        {bottom && <div className="pointer-events-none absolute inset-x-2 bottom-3 flex justify-center">{bottom}</div>}
      </section>
      <aside
        aria-label={panelLabel}
        className={cn(
          'order-2 flex min-h-0 flex-col border-t border-line/60 bg-bg/80 backdrop-blur-xl lg:order-1 lg:max-h-none lg:border-r lg:border-t-0',
          sheetOpen ? 'max-h-[46dvh]' : 'max-h-12',
        )}
      >
        <button
          type="button"
          onClick={() => setSheetOpen((o) => !o)}
          aria-expanded={sheetOpen}
          className="flex min-h-[48px] w-full shrink-0 items-center justify-center gap-2 text-sm font-semibold text-muted lg:hidden"
        >
          {sheetOpen ? <ChevronDown className="h-4 w-4" aria-hidden="true" /> : <ChevronUp className="h-4 w-4" aria-hidden="true" />}
          <span>{sheetOpen ? t('build.sandbox.hidePanel') : t('build.sandbox.showPanel')}</span>
        </button>
        <div className={cn('min-h-0 flex-1 overflow-y-auto px-4 pb-6 sm:px-6 lg:pt-6', !sheetOpen && 'hidden lg:block')}>{panel}</div>
      </aside>
    </div>
  );
}
