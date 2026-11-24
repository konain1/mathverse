import type { ShapeFamily } from '@/topics/types';

/** Outline icon per shape family. Always shown next to the shape colour so colour is never the only cue. */
export function ShapeIcon({ family, className = 'h-5 w-5' }: { family: ShapeFamily; className?: string }) {
  const common = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinejoin: 'round' as const,
    strokeLinecap: 'round' as const,
  };
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false">
      {family === 'triangle' && <path d="M12 4 21 19.5H3Z" {...common} />}
      {family === 'square' && <rect x="4.5" y="4.5" width="15" height="15" rx="1" {...common} />}
      {family === 'rectangle' && <rect x="2.5" y="7" width="19" height="10" rx="1" {...common} />}
      {family === 'cube' && (
        <g {...common}>
          <path d="M12 3 20 7.5v9L12 21l-8-4.5v-9Z" />
          <path d="M4 7.5 12 12l8-4.5M12 12v9" />
        </g>
      )}
    </svg>
  );
}
