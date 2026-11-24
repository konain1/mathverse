import { useRef, type ReactNode } from 'react';
import { useT } from '@/i18n';
import { StageLayout } from '@/components/stage/StageLayout';
import type { ShapeFamily } from '@/topics/types';
import { useBuild } from '../BuildProvider';
import { useBuildKeyboard } from './useBuildKeyboard';

/** Build workspace: focusable canvas (keyboard building), status on top, toolbar at the bottom. */
export function WorkspaceLayout({
  family,
  panel,
  canvas,
  toolbar,
  status,
  canvasLabel,
  overlay,
}: {
  family: ShapeFamily;
  panel: ReactNode;
  canvas: ReactNode;
  toolbar: ReactNode;
  status: ReactNode;
  canvasLabel: string;
  /** extra content over the canvas (e.g. the celebration) */
  overlay?: ReactNode;
}) {
  const t = useT();
  const host = useRef<HTMLDivElement>(null);
  const feedback = useBuild((s) => s.feedback);
  useBuildKeyboard(host);

  return (
    <StageLayout
      family={family}
      panelLabel={t('build.sandbox.panel')}
      openSignal={feedback}
      panel={panel}
      stage={
        <>
          <div
            ref={host}
            tabIndex={0}
            role="application"
            aria-label={canvasLabel}
            className="absolute inset-0 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent"
          >
            {canvas}
          </div>
          {overlay}
        </>
      }
      top={<div className="glass pointer-events-auto max-w-xl rounded-card px-3 py-1.5 shadow-lift sm:px-4 sm:py-2">{status}</div>}
      bottom={toolbar}
    />
  );
}
