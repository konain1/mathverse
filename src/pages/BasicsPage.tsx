import { ArrowLeft, ArrowRight, Lightbulb, RotateCcw } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { StageLayout } from '@/components/stage/StageLayout';
import { BASICS_BY_FAMILY, CONCEPT_BY_ID } from '@/features/basics/concepts';
import { BasicsScene, basicsHome } from '@/features/basics/BasicsScene';
import { SolveCanvas } from '@/features/solve/SolveCanvas';
import { useReducedMotionPref } from '@/hooks/useMediaQuery';
import { useLocalize, useT } from '@/i18n';
import { cn } from '@/lib/cn';
import type { ShapeFamily } from '@/topics/types';
import NotFoundPage from './NotFoundPage';

const PLAY_MS = 4200;

/** t goes 0 → 1 over PLAY_MS, then holds; `replay` restarts it. Reduced motion: shows the end state. */
function useLoopT(key: string, reduced: boolean) {
  const [t, setT] = useState(reduced ? 1 : 0);
  const [run, setRun] = useState(0);
  useEffect(() => {
    if (reduced) {
      setT(1);
      return;
    }
    setT(0);
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const k = Math.min(1, (now - start) / PLAY_MS);
      setT(k);
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [key, run, reduced]);
  return { t, replay: () => setRun((r) => r + 1) };
}

const isFamily = (f: string): f is ShapeFamily => f in BASICS_BY_FAMILY;

export default function BasicsPage() {
  const { family = '', conceptId } = useParams();
  const [search] = useSearchParams();
  const from = search.get('from');
  const navigate = useNavigate();
  const t = useT();
  const loc = useLocalize();
  const reduced = useReducedMotionPref();
  const ids = isFamily(family) ? BASICS_BY_FAMILY[family] : [];
  const id = conceptId ?? ids[0] ?? '';
  const concept = CONCEPT_BY_ID.get(id);
  const { t: time, replay } = useLoopT(id, reduced);
  const home = useMemo(() => basicsHome(concept?.solid ?? false), [concept]);
  if (!isFamily(family) || !concept || !ids.includes(id)) return <NotFoundPage />;

  const index = ids.indexOf(id);
  const q = from ? `?from=${encodeURIComponent(from)}` : '';
  const go = (k: number) => navigate(`/basics/${family}/${ids[k]}${q}`, { replace: true });
  const last = index === ids.length - 1;

  return (
    <StageLayout
      family={family}
      panelLabel={t('basics.title')}
      stage={
        <div className="absolute inset-0">
          {/* key: each concept starts from its own camera view */}
          <SolveCanvas key={concept.solid ? 'solid' : 'flat'} family={family} home={home} label={loc(concept.title)}>
            <BasicsScene id={id} t={time} family={family} />
          </SolveCanvas>
          <button
            type="button"
            onClick={replay}
            className="glass absolute bottom-3 right-3 z-10 flex min-h-[44px] items-center gap-2 rounded-control px-3 text-sm font-semibold"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            {t('basics.replay')}
          </button>
        </div>
      }
      panel={
        <div className="flex flex-col gap-5">
          {from && (
            <Link to={`/topic/${from}`} className="inline-flex min-h-[44px] w-fit items-center gap-2 text-sm font-semibold text-muted hover:text-ink">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              {t('basics.backToTopic')}
            </Link>
          )}

          <nav aria-label={t('basics.title')}>
            <ul className="flex flex-wrap gap-1.5">
              {ids.map((cid, i) => {
                const c = CONCEPT_BY_ID.get(cid)!;
                const on = cid === id;
                return (
                  <li key={cid}>
                    <Link
                      to={`/basics/${family}/${cid}${q}`}
                      replace
                      aria-current={on ? 'page' : undefined}
                      className={cn(
                        'inline-flex min-h-[36px] items-center rounded-full border px-3 text-xs font-bold',
                        on ? 'border-accent bg-accent text-bg' : i < index ? 'border-accent/50 text-ink' : 'border-line text-muted hover:border-accent/70',
                      )}
                    >
                      {loc(c.title)}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div>
            <p className="num text-xs font-bold text-accent">{t('basics.of', { n: index + 1, total: ids.length })}</p>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight">{loc(concept.title)}</h1>
          </div>

          <ul className="flex flex-col gap-2.5" aria-live="polite">
            {concept.lines.map((line, i) => (
              <li key={i} className="flex gap-3 text-base leading-relaxed">
                <span aria-hidden="true" className="mt-2.5 h-2 w-2 shrink-0 rounded-full bg-accent" />
                <span>{loc(line)}</span>
              </li>
            ))}
          </ul>

          <div className="glass flex gap-3 rounded-card p-4">
            <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold text-muted">{t('basics.lifeExample')}</p>
              <p className="mt-0.5 font-semibold">{loc(concept.example)}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button type="button" className="btn-ghost flex-1" disabled={index === 0} onClick={() => go(index - 1)}>
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              {t('basics.prev')}
            </button>
            {!last && (
              <button type="button" className="btn-primary flex-1" onClick={() => go(index + 1)}>
                {t('basics.next')}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>
          {last && (
            <div className="glass rounded-card p-4 text-sm font-semibold">
              {t('basics.allDone')}
              {from && (
                <Link to={`/topic/${from}`} className="btn-primary mt-3 w-full">
                  {t('basics.backToTopic')}
                </Link>
              )}
            </div>
          )}
        </div>
      }
    />
  );
}
