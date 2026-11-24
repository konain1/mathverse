import { MotionConfig } from 'framer-motion';
import { Suspense, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { APP_NAME } from '@/config/app';
import { LANG_META, useT } from '@/i18n';
import { useSettings } from '@/state/settings';
import { Logo } from '../Logo';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ThemeToggle } from './ThemeToggle';

function PageFallback() {
  const t = useT();
  return (
    <div className="grid min-h-[60vh] place-items-center text-muted" role="status">
      {t('common.loading')}
    </div>
  );
}

/** Keeps <html> in sync with settings: data-theme, lang, theme-color. */
function useDocumentSync() {
  const theme = useSettings((s) => s.theme);
  const lang = useSettings((s) => s.lang);
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.lang = LANG_META[lang].htmlLang;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#05091a' : '#f2f6ff');
  }, [theme, lang]);
}

function useScrollTopOnNavigate() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0 });
      return;
    }
    // Pages are lazy, so the target may appear a few frames later.
    let tries = 0;
    let raf = 0;
    const seek = () => {
      const el = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (el) el.scrollIntoView({ block: 'start' });
      else if (tries++ < 60) raf = requestAnimationFrame(seek);
    };
    seek();
    return () => cancelAnimationFrame(raf);
  }, [pathname, hash]);
}

/** `workspace`: full-height app layout (no footer) for build mode. */
export function AppShell({ workspace = false }: { workspace?: boolean }) {
  const t = useT();
  useDocumentSync();
  useScrollTopOnNavigate();

  return (
    <MotionConfig reducedMotion="user">
      <div className={workspace ? 'backdrop-space flex h-dvh flex-col overflow-hidden' : 'backdrop-space flex min-h-dvh flex-col'} data-accent="cube">
        <a
          href="#main"
          className="sr-only z-50 rounded-control bg-ink px-4 py-2 text-bg focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          {t('nav.skipToContent')}
        </a>
        <header className="sticky top-0 z-40 border-b border-line/50 bg-bg/70 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-page items-center justify-between gap-3 px-4 sm:px-6">
            <Link to="/" aria-label={`${APP_NAME}, ${t('nav.home')}`} className="rounded-control">
              <Logo />
            </Link>
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              <ThemeToggle />
            </div>
          </div>
        </header>
        <main id="main" className="flex-1">
          <Suspense fallback={<PageFallback />}>
            <Outlet />
          </Suspense>
        </main>
        {!workspace && (
        <footer className="border-t border-line/50">
          <div className="mx-auto flex max-w-page flex-col gap-2 px-4 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <span className="font-bold text-ink">{APP_NAME}</span>
            <span>{t('landing.footerNote')}</span>
          </div>
        </footer>
        )}
      </div>
    </MotionConfig>
  );
}
