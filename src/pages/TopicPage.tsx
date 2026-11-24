import { ArrowLeft, BookOpen, Hammer } from 'lucide-react';
import { BASICS_BY_FAMILY, CONCEPT_BY_ID } from '@/features/basics/concepts';
import { Link, useParams } from 'react-router-dom';
import { ShapeIcon } from '@/components/ShapeIcon';
import { FAMILY_NAME } from '@/features/landing/FamilyPanel';
import { useLocalize, useT } from '@/i18n';
import { BlueprintStage } from '@/three/BlueprintStage';
import { LazyCanvas } from '@/three/LazyCanvas';
import { MorphShape } from '@/three/MorphShape';
import { chapterText } from '@/topics/ncertChapters';
import { classesFor, getTopic } from '@/topics/registry';
import { DIFFICULTIES } from '@/topics/types';
import { QuestionList } from '@/features/play/QuestionList';
import NotFoundPage from './NotFoundPage';

export default function TopicPage() {
  const { topicId = '' } = useParams();
  const t = useT();
  const loc = useLocalize();
  const topic = getTopic(topicId);
  if (!topic) return <NotFoundPage />;
  const { meta, playable } = topic;

  return (
    <div data-accent={meta.family} className="mx-auto grid max-w-page gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_1.05fr] lg:py-14">
      <div className="flex flex-col gap-6">
        <Link to="/#topics" className="inline-flex min-h-[44px] w-fit items-center gap-2 text-sm font-semibold text-muted hover:text-ink">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {t('topic.back')}
        </Link>

        <div>
          <p className="flex items-center gap-2 font-bold text-accent">
            <ShapeIcon family={meta.family} />
            {t(FAMILY_NAME[meta.family])}
          </p>
          <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">{loc(meta.title)}</h1>
          <p className="mt-4 max-w-[36rem] text-lg leading-relaxed text-muted">{loc(meta.summary)}</p>
        </div>

        <section aria-labelledby="ncert-title">
          <h2 id="ncert-title" className="text-sm font-semibold text-muted">
            {t('topic.alsoTaughtIn')}
          </h2>
          <ul className="mt-2 flex flex-wrap gap-2">
            {classesFor(meta).map((c) => (
              <li key={c} className="rounded-full border border-line/80 px-3 py-1.5 text-sm">
                {t('topic.ncertRef', { n: c, chapter: loc(chapterText(meta.ncert[c] ?? '')) })}
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="levels-title">
          <h2 id="levels-title" className="text-sm font-semibold text-muted">
            {t('topic.levelsTitle')}
          </h2>
          <ul className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
            {DIFFICULTIES.filter((d) => meta.levels.includes(d)).map((d) => {
              const rank = DIFFICULTIES.indexOf(d) + 1;
              return (
                <li key={d} className="glass flex items-center justify-between rounded-control px-3 py-2.5">
                  <span className="font-bold">{t(`levels.${d}`)}</span>
                  <span className="flex items-end gap-0.5" aria-hidden="true">
                    {DIFFICULTIES.map((_, i) => (
                      <span key={i} className={`w-1 rounded-full ${i < rank ? 'bg-accent' : 'bg-line'}`} style={{ height: 6 + i * 3 }} />
                    ))}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>

        {meta.prerequisites.length > 0 && (
          <section aria-labelledby="prereq-title">
            <h2 id="prereq-title" className="text-sm font-semibold text-muted">
              {t('topic.prerequisitesTitle')}
            </h2>
            <ul className="mt-2 flex flex-wrap gap-2">
              {meta.prerequisites.map((id) => {
                const p = getTopic(id);
                if (!p) return null;
                return (
                  <li key={id} data-accent={p.meta.family}>
                    <Link
                      to={`/topic/${id}`}
                      className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-line/80 px-3 text-sm font-semibold hover:border-accent"
                    >
                      <span className="text-accent">
                        <ShapeIcon family={p.meta.family} className="h-4 w-4" />
                      </span>
                      {loc(p.meta.title)}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        <section aria-labelledby="basics-title" className="glass rounded-card p-5">
          <div className="flex gap-3">
            <BookOpen className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
            <div>
              <h2 id="basics-title" className="font-extrabold">
                {t('basics.sectionTitle')}
              </h2>
              <p className="mt-1 text-sm text-muted">{t('basics.sectionBody')}</p>
            </div>
          </div>
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {BASICS_BY_FAMILY[meta.family].map((id) => (
              <li key={id}>
                <Link
                  to={`/basics/${meta.family}/${id}?from=${meta.id}`}
                  className="inline-flex min-h-[36px] items-center rounded-full border border-line/80 px-3 text-xs font-bold hover:border-accent"
                >
                  {loc(CONCEPT_BY_ID.get(id)!.title)}
                </Link>
              </li>
            ))}
          </ul>
          <Link to={`/basics/${meta.family}?from=${meta.id}`} className="btn-primary mt-4 text-sm">
            {t('basics.open')}
          </Link>
        </section>

        {playable && <QuestionList topicId={meta.id} />}

        {!playable && (
          <div className="glass flex gap-4 rounded-card p-5">
            <Hammer className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
            <div>
              <h2 className="font-extrabold">{t('topic.comingSoonTitle')}</h2>
              <p className="mt-1 text-sm text-muted">{t('topic.comingSoonBody')}</p>
              <Link to="/build" className="btn-ghost mt-3 text-sm">
                {t('topic.freeBuildNudge')}
              </Link>
            </div>
          </div>
        )}
      </div>

      <div className="glass relative h-[320px] overflow-hidden rounded-panel shadow-lift sm:h-[420px] lg:sticky lg:top-24 lg:h-[520px]">
        <LazyCanvas label={loc(meta.title)} className="h-full w-full" camera={{ position: [4.4, 4.1, 5.6], fov: 36 }}>
          <BlueprintStage>
            <MorphShape shape={meta.family} labels />
          </BlueprintStage>
        </LazyCanvas>
      </div>
    </div>
  );
}
