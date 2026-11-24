import { Canvas, type CanvasProps } from '@react-three/fiber';
import { Component, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useT } from '@/i18n';
import { cn } from '@/lib/cn';

function hasWebGL(): boolean {
  try {
    const c = document.createElement('canvas');
    return Boolean(c.getContext('webgl2') ?? c.getContext('webgl'));
  } catch {
    return false;
  }
}

function WebGLMissing() {
  const t = useT();
  return <p className="grid h-full place-items-center p-4 text-center text-sm text-muted">{t('common.webglMissing')}</p>;
}

class CanvasBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  override state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  override render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

export interface LazyCanvasProps extends Omit<CanvasProps, 'children' | 'frameloop' | 'dpr' | 'className'> {
  children: ReactNode;
  className?: string;
  /** devicePixelRatio cap. 2 for main canvases, lower for small previews. */
  maxDpr?: number;
  /** Accessible description of what the canvas shows. */
  label?: string;
}

/**
 * Canvas that only mounts once it scrolls near the viewport and stops rendering
 * (frameloop "never") while off-screen — keeps several 3D views cheap on phones.
 */
export function LazyCanvas({ children, className, maxDpr = 2, label, gl, ...canvasProps }: LazyCanvasProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [mounted, setMounted] = useState(false);
  const supported = useMemo(hasWebGL, []);

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      setMounted(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        const visible = Boolean(entry?.isIntersecting);
        setInView(visible);
        if (visible) setMounted(true);
      },
      { rootMargin: '160px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={hostRef} className={cn('relative', className)} role={label ? 'img' : undefined} aria-label={label}>
      {!supported ? (
        <WebGLMissing />
      ) : (
        mounted && (
          <CanvasBoundary fallback={<WebGLMissing />}>
            <Canvas
              frameloop={inView ? 'always' : 'never'}
              dpr={[1, maxDpr]}
              gl={{ antialias: true, alpha: true, powerPreference: 'high-performance', ...(gl as object) }}
              {...canvasProps}
            >
              {children}
            </Canvas>
          </CanvasBoundary>
        )
      )}
    </div>
  );
}
