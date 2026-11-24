import { APP_BY, APP_NAME } from '@/config/app';

export function Logo() {
  return (
    <span className="flex items-center gap-2.5">
      <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden="true">
        <g fill="none" strokeWidth="1.8" strokeLinejoin="round">
          <path d="M16 3.5 27 9.75v12.5L16 28.5 5 22.25V9.75Z" stroke="rgb(var(--cube))" />
          <path d="M5 9.75 16 16l11-6.25M16 16v12.5" stroke="rgb(var(--cube))" opacity=".5" />
          <path d="M16 16 9.5 23h13Z" stroke="rgb(var(--triangle))" />
        </g>
        <circle cx="16" cy="16" r="1.9" fill="rgb(var(--triangle))" />
      </svg>
      <span className="flex items-baseline gap-1.5">
        <span className="text-lg font-extrabold tracking-tight">{APP_NAME}</span>
        <span className="text-xs font-semibold text-muted">{APP_BY}</span>
      </span>
    </span>
  );
}
