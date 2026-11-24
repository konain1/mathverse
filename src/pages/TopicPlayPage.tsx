import { useCallback, useMemo } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { PHASES, PhaseTabs, type Phase } from '@/features/play/PhaseTabs';
import { QuestionHeader } from '@/features/play/QuestionHeader';
import { BuildView } from '@/features/play/BuildView';
import { SolveView } from '@/features/play/SolveView';
import { TryView } from '@/features/play/TryView';
import { UnderstandView } from '@/features/play/UnderstandView';
import { useTopicBundle, type TopicBundle } from '@/features/play/useTopicBundle';
import { useLocalize, useT } from '@/i18n';
import { useProgress } from '@/state/progress';
import NotFoundPage from './NotFoundPage';

function Play({ bundle, questionId }: { bundle: TopicBundle; questionId: string }) {
  const loc = useLocalize();
  const [search, setSearch] = useSearchParams();
  const phase: Phase = (PHASES as readonly string[]).includes(search.get('step') ?? '') ? (search.get('step') as Phase) : 'understand';
  const setPhase = useCallback((p: Phase) => setSearch({ step: p }, { replace: false }), [setSearch]);

  const { topic, questions } = bundle;
  const topicId = topic.meta.id;
  const family = topic.meta.family;
  const question = questions.find((q) => q.id === questionId);
  const params = question?.params;
  const plan = useMemo(() => (question && params ? bundle.buildPlan(question.id, params) : undefined), [bundle, question, params]);
  const script = useMemo(() => (question && params ? bundle.solution(question.id, params) : undefined), [bundle, question, params]);

  const built = useProgress((s) => Boolean(s.built[topicId]?.[questionId]));
  const watched = useProgress((s) => Boolean(s.watched[topicId]?.[questionId]));
  const stars = useProgress((s) => s.stars[topicId]?.[questionId] ?? 0);
  const markBuilt = useProgress((s) => s.markBuilt);
  const markWatched = useProgress((s) => s.markWatched);
  const onBuilt = useCallback(() => markBuilt(topicId, questionId), [markBuilt, topicId, questionId]);
  const onWatched = useCallback(() => markWatched(topicId, questionId), [markWatched, topicId, questionId]);

  if (!question || !params || !plan || !script) return <NotFoundPage />;

  const header = (
    <div className="flex flex-col gap-3">
      <QuestionHeader topic={topic} question={question} />
      <PhaseTabs phase={phase} onChange={setPhase} done={{ understand: built || phase !== 'understand', build: built, solve: watched, try: stars > 0 }} />
    </div>
  );

  switch (phase) {
    case 'build':
      return (
        <BuildView
          key={questionId}
          family={family}
          plan={plan}
          header={header}
          prompt={loc(question.prompt(params))}
          onBuilt={onBuilt}
          onContinue={() => setPhase('solve')}
        />
      );
    case 'solve':
      return (
        <SolveView
          key={questionId}
          family={family}
          header={header}
          script={script}
          scene={bundle.scene}
          params={params}
          questionId={questionId}
          onWatched={onWatched}
          onTry={() => setPhase('try')}
        />
      );
    case 'try':
      return <TryView key={questionId} family={family} topicId={topicId} header={header} question={question} buildPlan={bundle.buildPlan} />;
    default:
      return (
        <UnderstandView
          family={family}
          header={header}
          question={question}
          params={params}
          plan={plan}
          onStart={() => setPhase('build')}
        />
      );
  }
}

export default function TopicPlayPage() {
  const { topicId = '', questionId = '' } = useParams();
  const t = useT();
  const state = useTopicBundle(topicId);
  if (state.status === 'loading')
    return (
      <div className="grid h-full min-h-[60vh] place-items-center text-muted" role="status">
        {t('play.loading')}
      </div>
    );
  if (state.status === 'error' || !state.bundle)
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <p>{t('play.loadError')}</p>
        <Link to={`/topic/${topicId}`} className="btn-ghost mt-4">
          {t('topic.back')}
        </Link>
      </div>
    );
  return <Play bundle={state.bundle} questionId={questionId} />;
}
