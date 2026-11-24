import { useEffect, useState } from 'react';
import type { BuildStepsModule, QuestionsModule, SceneModule, SolutionStepsModule } from '@/topics/contract';
import { getTopic, loadTopicModule, type RegisteredTopic } from '@/topics/registry';

export interface TopicBundle {
  topic: RegisteredTopic;
  questions: QuestionsModule['questions'];
  buildPlan: BuildStepsModule['buildPlan'];
  solution: SolutionStepsModule['solution'];
  scene: SceneModule;
}

const cache = new Map<string, Promise<TopicBundle>>();

/** Loads a topic's lazy modules once (they're separate chunks) and caches them. */
export function loadBundle(id: string): Promise<TopicBundle> {
  const hit = cache.get(id);
  if (hit) return hit;
  const topic = getTopic(id);
  const p = topic?.playable
    ? Promise.all([
        loadTopicModule<QuestionsModule>(id, 'questions'),
        loadTopicModule<BuildStepsModule>(id, 'buildSteps'),
        loadTopicModule<SolutionStepsModule>(id, 'solutionSteps'),
        loadTopicModule<SceneModule>(id, 'Scene'),
      ]).then(([q, b, s, scene]) => ({ topic, questions: q.questions, buildPlan: b.buildPlan, solution: s.solution, scene }))
    : Promise.reject(new Error(`Topic ${id} is not playable`));
  cache.set(id, p);
  p.catch(() => cache.delete(id));
  return p;
}

export function useTopicBundle(id: string) {
  const [state, setState] = useState<{ status: 'loading' | 'ready' | 'error'; bundle?: TopicBundle }>({ status: 'loading' });
  useEffect(() => {
    let live = true;
    setState({ status: 'loading' });
    loadBundle(id).then(
      (bundle) => live && setState({ status: 'ready', bundle }),
      () => live && setState({ status: 'error' }),
    );
    return () => {
      live = false;
    };
  }, [id]);
  return state;
}
