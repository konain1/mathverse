import { AnimatePresence, motion } from 'framer-motion';
import { CircleAlert, CircleCheck, TriangleAlert, X } from 'lucide-react';
import { useT, type MessageKey } from '@/i18n';
import type { Analysis } from '@/lib/geometry/validators';
import { useBuild } from '../BuildProvider';
import { useBuildText } from './useBuildText';

function useAnalysisLines() {
  const t = useT();
  return (a: Analysis): string[] => {
    if (a.solid) {
      const [l, b, h] = a.solid.dims;
      return [a.solid.shape === 'cube' ? t('build.feedback.solidCube', { a: l }) : t('build.feedback.solidCuboid', { l, b, h })];
    }
    if (a.faces.length === 0)
      return [a.counts.E ? t('build.feedback.linesOnly', { n: a.counts.E }) : t('build.feedback.empty')];
    return a.faces.map((f) => {
      const sorted = [...f.sides].sort((x, y) => y - x);
      if (f.shape === 'square') return t('build.feedback.faceSquare', { a: f.sides[0]! });
      if (f.shape === 'rectangle') return t('build.feedback.faceRectangle', { l: sorted[0]!, b: sorted[2]! });
      if (f.shape === 'triangle' && f.triangle)
        return t('build.feedback.faceTriangle', {
          bySides: t(`build.triangle.${f.triangle.bySides}` as MessageKey),
          byAngles: t(`build.triangle.${f.triangle.byAngles}` as MessageKey),
          sides: f.sides.join(', '),
        });
      return t('build.feedback.faceQuad', { sides: f.sides.join(', ') });
    });
  };
}

/** Result of the last step or Check. Issues are listed in words AND glow red in 3D. */
export function FeedbackCard() {
  const t = useT();
  const feedback = useBuild((s) => s.feedback);
  const dismiss = useBuild((s) => s.dismissFeedback);
  const { issueText, errorText } = useBuildText();
  const analysisLines = useAnalysisLines();

  let tone: 'ok' | 'bad' | 'warn' = 'warn';
  let title = '';
  let lines: string[] = [];
  let footer: string | undefined;
  if (feedback?.kind === 'success') {
    tone = 'ok';
    title = t('build.feedback.successTitle');
    lines = analysisLines(feedback.analysis);
  } else if (feedback?.kind === 'issues') {
    tone = 'bad';
    title = feedback.source === 'step' ? t('build.feedback.stepIssuesTitle') : t('build.feedback.issuesTitle');
    // the same message can come from several edges; say it once
    lines = [...new Set(feedback.issues.map(issueText))];
    footer = t('build.feedback.undoHint');
  } else if (feedback?.kind === 'error') {
    title = t('build.feedback.errorTitle');
    lines = [errorText(feedback.error)];
  }
  const Icon = tone === 'ok' ? CircleCheck : tone === 'bad' ? CircleAlert : TriangleAlert;
  const color = tone === 'ok' ? 'text-ok border-ok/40' : tone === 'bad' ? 'text-bad border-bad/50' : 'text-triangle border-triangle/40';

  return (
    <div aria-live="polite">
      <AnimatePresence initial={false}>
        {feedback && (
          <motion.div
            key={title + lines.join('|')}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.18 }}
            className={`glass rounded-card border p-4 ${color.split(' ')[1]}`}
          >
            <div className="flex items-start gap-3">
              <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${color.split(' ')[0]}`} aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="font-extrabold">{title}</p>
                <ul className="mt-1.5 space-y-1 text-sm text-ink">
                  {lines.map((l) => (
                    <li key={l}>{l}</li>
                  ))}
                </ul>
                {footer && <p className="mt-2 text-xs text-muted">{footer}</p>}
              </div>
              <button
                type="button"
                onClick={dismiss}
                aria-label={t('build.actions.dismiss')}
                className="-m-2 grid h-11 w-11 shrink-0 place-items-center rounded-control text-muted hover:text-ink"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
