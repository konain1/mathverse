import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLocalize, useT } from '@/i18n';
import { useProgress } from '@/state/progress';
import { Stars } from './Stars';
import { useTopicBundle } from './useTopicBundle';

const NONE: Record<string, number> = {};

/** The topic's questions (one per level) with the student's best stars. */
export function QuestionList({ topicId }: { topicId: string }) {
  const t = useT();
  const loc = useLocalize();
  const state = useTopicBundle(topicId);
  const stars = useProgress((s) => s.stars[topicId] ?? NONE); // stable fallback: a new {} would re-render forever
  if (state.status !== 'ready' || !state.bundle) return <p className="text-sm text-muted">{t('play.loading')}</p>;
  return (
    <section aria-labelledby="questions-title">
      <h2 id="questions-title" className="text-sm font-semibold text-muted">
        {t('topic.questionsTitle')}
      </h2>
      <ul className="mt-2 space-y-2">
        {state.bundle.questions.map((q) => (
          <li key={q.id}>
            <Link
              to={`/topic/${topicId}/q/${q.id}`}
              className="glass group flex min-h-[64px] items-center gap-3 rounded-card px-4 py-3 transition-colors hover:border-accent/70"
            >
              <span className="w-24 shrink-0 text-xs font-bold text-accent">{t(`levels.${q.level}`)}</span>
              <span className="min-w-0 flex-1">
                <span className="line-clamp-2 text-sm font-semibold">{loc(q.prompt(q.params))}</span>
                {stars[q.id] ? (
                  <span className="mt-1 flex items-center gap-2 text-xs text-muted">
                    <Stars n={stars[q.id]!} size="sm" />
                  </span>
                ) : null}
              </span>
              <ArrowRight className="h-5 w-5 shrink-0 text-faint group-hover:text-ink" aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
