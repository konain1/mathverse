import { Moon, Sun } from 'lucide-react';
import { useT } from '@/i18n';
import { useSettings } from '@/state/settings';

export function ThemeToggle() {
  const t = useT();
  const theme = useSettings((s) => s.theme);
  const toggle = useSettings((s) => s.toggleTheme);
  const label = theme === 'dark' ? t('nav.themeToLight') : t('nav.themeToDark');
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className="grid h-11 w-11 place-items-center rounded-control border border-line/80 text-muted transition-colors hover:text-ink"
    >
      {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
}
