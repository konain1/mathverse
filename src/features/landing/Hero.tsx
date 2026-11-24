import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShapeIcon } from '@/components/ShapeIcon';
import { FAMILY_TEXT } from '@/design/familyClasses';
import { useT, type MessageKey } from '@/i18n';
import { useCoarsePointer, useReducedMotionPref } from '@/hooks/useMediaQuery';
import { cn } from '@/lib/cn';
import { BlueprintStage } from '@/three/BlueprintStage';
import { LazyCanvas } from '@/three/LazyCanvas';
import { MorphShape } from '@/three/MorphShape';
import { LABELLED_EDGES, MORPH_SEQUENCE, edgeLengthCm, type MorphShapeKey } from '@/three/morphShapes';

const SHAPE_NAME: Record<MorphShapeKey, MessageKey> = {
  cube: 'shapes.cubeSingle',
  triangle: 'shapes.triangle',
  square: 'shapes.square',
  rectangle: 'shapes.rectangle',
};

const HOLD_MS = 3600;
const PAUSE_AFTER_PICK_MS = 9000;

/** Registration ticks in the corners of the drawing sheet. */
function CornerTicks() {
  const base = 'pointer-events-none absolute h-4 w-4 border-accent/70';
  return (
    <>
      <span className={cn(base, 'left-3 top-3 border-l-2 border-t-2')} />
      <span className={cn(base, 'right-3 top-3 border-r-2 border-t-2')} />
      <span className={cn(base, 'bottom-3 left-3 border-b-2 border-l-2')} />
      <span className={cn(base, 'bottom-3 right-3 border-b-2 border-r-2')} />
    </>
  );
}

export function Hero() {
  const t = useT();
  const reduced = useReducedMotionPref();
  const coarse = useCoarsePointer();
  const [shape, setShape] = useState<MorphShapeKey>('cube');
  const pausedUntil = useRef(0);

  useEffect(() => {
    if (reduced) return;
    const id = window.setInterval(() => {
      if (Date.now() < pausedUntil.current || document.hidden) return;
      setShape((s) => MORPH_SEQUENCE[(MORPH_SEQUENCE.indexOf(s) + 1) % MORPH_SEQUENCE.length]!);
    }, HOLD_MS);
    return () => window.clearInterval(id);
  }, [reduced]);

  const pick = (s: MorphShapeKey) => {
    pausedUntil.current = Date.now() + PAUSE_AFTER_PICK_MS;
    setShape(s);
  };

  const enter = (delay: number) => ({
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as const },
  });

  return (
    <section className="mx-auto grid max-w-page items-center gap-8 px-4 pb-10 pt-8 sm:px-6 lg:grid-cols-[1.02fr_1fr] lg:gap-12 lg:pb-20 lg:pt-16">
      <div className="max-w-xl">
        <motion.h1 {...enter(0)} className="text-display text-balance">
          {t('landing.heroTitle')}
        </motion.h1>
        <motion.p {...enter(0.08)} className="mt-5 max-w-[34rem] text-lg leading-relaxed text-muted">
          {t('landing.heroBody')}
        </motion.p>
        <motion.div {...enter(0.16)} className="mt-8 flex flex-wrap gap-3">
          <Link to="/topic/cube-surface-area" className="btn-primary px-6 text-base">
            {t('landing.ctaStart')}
          </Link>
          <Link to="/build" className="btn-ghost px-6 text-base">
            {t('landing.ctaFreeBuild')}
          </Link>
          <a href="#topics" className="btn inline-flex px-3 text-base text-muted underline-offset-4 hover:text-ink hover:underline">
            {t('landing.ctaBrowse')}
          </a>
        </motion.div>
      </div>

      <div className="glass relative overflow-hidden rounded-panel shadow-lift">
        <div className="relative">
          <CornerTicks />
          <LazyCanvas
            label={t('landing.heroCanvasLabel')}
            className="h-[340px] w-full sm:h-[420px] lg:h-[460px]"
            camera={{ position: [4.4, 4.1, 5.6], fov: 36 }}
          >
            <BlueprintStage>
              <MorphShape shape={shape} labels />
            </BlueprintStage>
          </LazyCanvas>
        </div>
        {!coarse && (
          <span className="pointer-events-none absolute right-6 top-5 text-xs text-faint">{t('landing.heroDragHint')}</span>
        )}
        <div className="flex flex-col gap-3 border-t border-line/50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2 text-sm font-semibold" aria-live="polite">
            <span className={FAMILY_TEXT[shape]}>
              <ShapeIcon family={shape} />
            </span>
            {t('landing.heroCaption', {
              shape: t(SHAPE_NAME[shape]),
              len: edgeLengthCm(shape, LABELLED_EDGES.front),
            })}
          </p>
          <div role="group" aria-label={t('landing.heroShapePicker')} className="flex gap-1.5">
            {MORPH_SEQUENCE.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => pick(s)}
                aria-pressed={shape === s}
                aria-label={t(SHAPE_NAME[s])}
                title={t(SHAPE_NAME[s])}
                className={cn(
                  'grid h-11 w-11 place-items-center rounded-control border transition-colors',
                  FAMILY_TEXT[s],
                  shape === s ? 'border-current bg-surface/70' : 'border-line/70 opacity-70 hover:opacity-100',
                )}
              >
                <ShapeIcon family={s} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
