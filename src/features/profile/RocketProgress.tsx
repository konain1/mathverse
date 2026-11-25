import { useEffect, useState } from 'react';

const STARS = Array.from({ length: 28 }, (_, i) => ({
  x: (i * 37) % 100,
  y: (i * 53) % 88,
  r: i % 5 === 0 ? 1.6 : 0.9,
  d: (i % 7) * 0.4,
}));

/** A rocket that flies from Earth (0%) to the moon (100%) as the student solves questions. */
export function RocketProgress({ pct, label }: { pct: number; label: string }) {
  const target = Math.max(0, Math.min(100, pct));
  // start on the ground, then launch to the real height so the student sees it fly
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(target));
    return () => cancelAnimationFrame(id);
  }, [target]);
  const done = target >= 100;

  return (
    <div
      role="img"
      aria-label={label}
      className="relative h-[420px] overflow-hidden rounded-card border border-line bg-[radial-gradient(ellipse_at_top,rgb(var(--accent)/0.18),transparent_60%)]"
    >
      <style>{`
        @keyframes mv-flame { 0%,100% { transform: scaleY(1); opacity: .95 } 50% { transform: scaleY(1.35); opacity: .7 } }
        @keyframes mv-twinkle { 0%,100% { opacity: .25 } 50% { opacity: 1 } }
        @keyframes mv-bob { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-4px) } }
      `}</style>

      {/* stars */}
      <svg className="absolute inset-0 h-full w-full text-ink" aria-hidden="true">
        {STARS.map((s, i) => (
          <circle key={i} cx={`${s.x}%`} cy={`${s.y}%`} r={s.r} fill="currentColor" style={{ animation: `mv-twinkle 3s ${s.d}s infinite` }} />
        ))}
      </svg>

      {/* moon */}
      <div className="absolute left-1/2 top-4 -translate-x-1/2">
        <svg width="64" height="64" viewBox="0 0 64 64" aria-hidden="true" className="text-ink">
          <circle cx="32" cy="32" r="28" fill="currentColor" opacity={done ? 1 : 0.85} />
          <circle cx="22" cy="24" r="5" className="fill-line" />
          <circle cx="40" cy="38" r="7" className="fill-line" />
          <circle cx="38" cy="18" r="3" className="fill-line" />
        </svg>
      </div>

      {/* flight path */}
      <div className="absolute bottom-16 left-1/2 top-24 -translate-x-1/2 border-l-2 border-dashed border-line" aria-hidden="true" />

      {/* rocket: bottom 56px (ground) → top 96px (moon) */}
      <div
        className="absolute left-1/2 -translate-x-1/2 transition-[bottom] duration-[1800ms] ease-out"
        style={{ bottom: `calc(56px + (100% - 56px - 150px) * ${shown / 100})` }}
      >
        <div style={{ animation: 'mv-bob 2.4s ease-in-out infinite' }}>
          <svg width="44" height="84" viewBox="0 0 44 84" aria-hidden="true">
            <g className="text-accent">
              <path d="M22 2 C34 14 36 34 34 56 L10 56 C8 34 10 14 22 2 Z" fill="currentColor" />
              <path d="M10 42 L0 62 L10 58 Z M34 42 L44 62 L34 58 Z" fill="currentColor" opacity=".75" />
            </g>
            <circle cx="22" cy="28" r="6" className="fill-bg stroke-ink" strokeWidth="2" />
            {shown > 0 && !done && (
              <g style={{ transformOrigin: '22px 58px', animation: 'mv-flame .25s ease-in-out infinite' }}>
                <path d="M13 58 Q22 84 31 58 Z" fill="#f59e0b" />
                <path d="M17 58 Q22 74 27 58 Z" fill="#fde68a" />
              </g>
            )}
          </svg>
        </div>
      </div>

      {/* Earth */}
      <div className="absolute -bottom-24 left-1/2 h-36 w-[140%] -translate-x-1/2 rounded-[50%] bg-[#2563eb]" aria-hidden="true">
        <div className="absolute left-[30%] top-3 h-6 w-16 rounded-full bg-[#16a34a]" />
        <div className="absolute right-[32%] top-5 h-5 w-10 rounded-full bg-[#16a34a]" />
      </div>

      <span className="num absolute right-3 top-3 rounded-full bg-bg/80 px-2.5 py-1 text-sm font-extrabold text-accent">{Math.round(target)}%</span>
    </div>
  );
}
