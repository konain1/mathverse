import {
  ArrowUpFromLine,
  CircleCheck,
  CircleDot,
  Crosshair,
  Lightbulb,
  Move,
  Redo2,
  RefreshCcw,
  Rotate3d,
  Shapes,
  Slash,
  Undo2,
  type LucideIcon,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { ShapeIcon } from '@/components/ShapeIcon';
import { useT, type MessageKey } from '@/i18n';
import { cn } from '@/lib/cn';
import type { FaceIntent } from '@/lib/geometry/construction';
import { useBuild } from '../BuildProvider';
import { selectCanRedo, selectCanUndo, TOOLS, type Tool } from '../store';

const TOOL_ICON: Record<Tool, LucideIcon> = {
  point: CircleDot,
  line: Slash,
  face: Shapes,
  extrude: ArrowUpFromLine,
  move: Move,
  rotate: Rotate3d,
};
const TOOL_KEY: Record<Tool, string> = { point: 'P', line: 'L', face: 'F', extrude: 'E', move: 'M', rotate: 'R' };
const FACE_KINDS: FaceIntent[] = ['triangle', 'square', 'rectangle'];

function ToolButton({
  label,
  icon: Icon,
  active,
  onClick,
  disabled,
  shortcut,
  tone = 'default',
  tooltip,
  children,
}: {
  label: string;
  tooltip?: string;
  icon?: LucideIcon;
  active?: boolean;
  onClick: () => void;
  disabled?: boolean;
  shortcut?: string;
  tone?: 'default' | 'primary';
  children?: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      aria-keyshortcuts={shortcut}
      title={tooltip ?? (shortcut ? `${label} (${shortcut})` : label)}
      className={cn(
        'flex h-[50px] min-w-[46px] shrink-0 flex-col items-center justify-center gap-0.5 rounded-control px-1 text-[10px] font-bold transition-colors disabled:opacity-35 sm:h-[52px] sm:min-w-[52px] sm:px-2 sm:text-[11px]',
        tone === 'primary'
          ? 'bg-accent text-bg shadow-glow'
          : active
            ? 'bg-ink text-bg'
            : 'text-muted hover:bg-surface/70 hover:text-ink',
      )}
    >
      {Icon ? <Icon className="h-5 w-5" aria-hidden="true" /> : children}
      <span className="leading-none">{label}</span>
    </button>
  );
}

const Divider = () => <span aria-hidden="true" className="mx-0.5 h-8 w-px shrink-0 bg-line sm:mx-1" />;

export function Toolbar({ onHint, hintAvailable = false }: { onHint?: () => void; hintAvailable?: boolean }) {
  const t = useT();
  const tool = useBuild((s) => s.tool);
  const faceIntent = useBuild((s) => s.faceIntent);
  const canUndo = useBuild(selectCanUndo);
  const canRedo = useBuild(selectCanRedo);
  const setTool = useBuild((s) => s.setTool);
  const setFaceIntent = useBuild((s) => s.setFaceIntent);
  const undo = useBuild((s) => s.undo);
  const redo = useBuild((s) => s.redo);
  const reset = useBuild((s) => s.reset);
  const check = useBuild((s) => s.check);
  const resetCamera = useBuild((s) => s.resetCamera);

  return (
    <div className="pointer-events-none flex flex-col items-center gap-2">
      {tool === 'face' && (
        <div role="radiogroup" aria-label={t('build.faceKinds.label')} className="glass pointer-events-auto flex gap-1 rounded-card p-1 shadow-lift">
          {FACE_KINDS.map((k) => (
            <button
              key={k}
              type="button"
              role="radio"
              aria-checked={faceIntent === k}
              onClick={() => setFaceIntent(k)}
              className={cn(
                'flex min-h-[44px] items-center gap-1.5 rounded-control px-3 text-sm font-bold',
                faceIntent === k ? 'bg-accent text-bg' : 'text-muted hover:text-ink',
              )}
            >
              <ShapeIcon family={k} className="h-4 w-4" />
              {t(`build.faceKinds.${k}` as MessageKey)}
            </button>
          ))}
        </div>
      )}
      <div className="flex max-w-full flex-wrap items-center justify-center gap-1.5 sm:gap-2">
      <div
        role="toolbar"
        aria-label={t('build.tools.label')}
        className="glass pointer-events-auto flex max-w-full items-center gap-0.5 overflow-x-auto rounded-panel p-1 shadow-lift [scrollbar-width:none] sm:gap-1 sm:p-1.5"
      >
        {TOOLS.map((k) => (
          <ToolButton
            key={k}
            label={t(`build.tools.${k}` as MessageKey)}
            icon={TOOL_ICON[k]}
            active={tool === k}
            shortcut={TOOL_KEY[k]}
            onClick={() => setTool(k)}
          />
        ))}
      </div>
      <div className="glass pointer-events-auto flex max-w-full items-center gap-0.5 overflow-x-auto rounded-panel p-1 shadow-lift [scrollbar-width:none] sm:gap-1 sm:p-1.5">
        <ToolButton label={t('build.actions.undo')} icon={Undo2} onClick={undo} disabled={!canUndo} shortcut="Control+Z" />
        <ToolButton label={t('build.actions.redo')} icon={Redo2} onClick={redo} disabled={!canRedo} shortcut="Control+Shift+Z" />
        <ToolButton label={t('build.actions.reset')} icon={RefreshCcw} onClick={reset} disabled={!canUndo && !canRedo} />
        <ToolButton label={t('build.actions.camera')} tooltip={t('build.actions.resetCamera')} icon={Crosshair} onClick={resetCamera} />
        <Divider />
        <ToolButton
          label={t('build.actions.hint')}
          tooltip={hintAvailable ? undefined : t('build.actions.hintSoon')}
          icon={Lightbulb}
          onClick={() => onHint?.()}
          disabled={!hintAvailable}
        />
        <ToolButton label={t('build.actions.check')} icon={CircleCheck} onClick={check} tone="primary" />
      </div>
      </div>
    </div>
  );
}
