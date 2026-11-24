import { LANG_META, useT } from '@/i18n';
import { cn } from '@/lib/cn';
import { useSettings } from '@/state/settings';
import { LANGS } from '@/topics/types';

export function LanguageSwitcher() {
  const t = useT();
  const lang = useSettings((s) => s.lang);
  const setLang = useSettings((s) => s.setLang);
  return (
    <div role="radiogroup" aria-label={t('nav.language')} className="flex rounded-control border border-line/80 p-0.5">
      {LANGS.map((l) => (
        <button
          key={l}
          type="button"
          role="radio"
          aria-checked={lang === l}
          lang={LANG_META[l].htmlLang}
          title={LANG_META[l].label}
          onClick={() => setLang(l)}
          className={cn(
            'min-h-[40px] min-w-[40px] rounded-[0.7rem] px-2.5 text-sm font-bold transition-colors',
            lang === l ? 'bg-ink text-bg' : 'text-muted hover:text-ink',
          )}
        >
          {LANG_META[l].short}
        </button>
      ))}
    </div>
  );
}
