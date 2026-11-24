import { useT } from '@/i18n';
import { useBuild } from '../BuildProvider';

/** One-line instruction for the current tool/draft. Announced to screen readers. */
export function StatusLine() {
  const t = useT();
  const tool = useBuild((s) => s.tool);
  const draft = useBuild((s) => s.draft);
  const faceIntent = useBuild((s) => s.faceIntent);

  let text: string;
  if (draft?.kind === 'line') text = t('build.help.lineDraft');
  else if (draft?.kind === 'face')
    text = t('build.help.faceDraft', { n: draft.picks.length + 1, total: faceIntent === 'triangle' ? 3 : 4 });
  else if (draft?.kind === 'extrude') text = t('build.help.extrudeDraft', { h: draft.height });
  else if (draft?.kind === 'move') text = t('build.help.moveDraft');
  else text = t(`build.help.${tool}`);

  return (
    <p className="text-xs font-semibold text-ink sm:text-sm" aria-live="polite">
      {text}
    </p>
  );
}
