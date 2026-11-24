import { Lightbulb } from 'lucide-react';
import { useT } from '@/i18n';
import { counts } from '@/lib/geometry/construction';
import { BuildProvider, useBuild } from '@/features/build/BuildProvider';
import { BuildCanvas } from '@/features/build/scene/BuildCanvas';
import { selectConstruction } from '@/features/build/store';
import { FeedbackCard } from '@/features/build/ui/FeedbackCard';
import { StatusLine } from '@/features/build/ui/StatusLine';
import { Toolbar } from '@/features/build/ui/Toolbar';
import { WorkspaceLayout } from '@/features/build/ui/WorkspaceLayout';

function Counts() {
  const t = useT();
  const c = useBuild(selectConstruction);
  const { V, E, F } = counts(c);
  const items = [
    [t('build.counts.vertices'), V],
    [t('build.counts.edges'), E],
    [t('build.counts.faces'), F],
  ] as const;
  return (
    <dl className="grid grid-cols-3 gap-2">
      {items.map(([label, n]) => (
        <div key={label} className="glass rounded-control px-3 py-2">
          <dt className="text-xs text-muted">{label}</dt>
          <dd className="num text-2xl font-bold">{n}</dd>
        </div>
      ))}
    </dl>
  );
}

function SandboxPanel() {
  const t = useT();
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">{t('build.sandbox.title')}</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">{t('build.sandbox.body')}</p>
      </div>
      <p className="flex gap-2 rounded-card border border-accent/40 px-3 py-2.5 text-sm">
        <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
        {t('build.sandbox.tryThis')}
      </p>
      <Counts />
      <FeedbackCard />
      <p className="text-xs text-muted">{t('build.help.camera')}</p>
      <section className="hidden lg:block">
        <h2 className="text-sm font-bold">{t('build.sandbox.shortcutsTitle')}</h2>
        <ul className="mt-2 space-y-1 text-xs text-muted">
          <li>{t('build.sandbox.shortcutTools')}</li>
          <li>{t('build.sandbox.shortcutUndo')}</li>
          <li>{t('build.sandbox.shortcutCursor')}</li>
          <li>{t('build.sandbox.shortcutEsc')}</li>
        </ul>
      </section>
    </div>
  );
}

export default function SandboxPage() {
  const t = useT();
  return (
    <BuildProvider>
      <WorkspaceLayout
        family="cube"
        canvasLabel={t('build.canvasLabel')}
        canvas={<BuildCanvas family="cube" label={t('build.canvasLabel')} />}
        toolbar={<Toolbar />}
        status={<StatusLine />}
        panel={<SandboxPanel />}
      />
    </BuildProvider>
  );
}
