import { useCallback } from 'react';
import { useSettings } from '@/state/settings';
import type { Lang, LocalizedText } from '@/topics/types';
import { hinglish } from './locales/hinglish';
import { en } from './locales/en';
import { hi } from './locales/hi';
import type { MessageKey, MessageVars, Messages } from './types';

export type { MessageKey, MessageVars, Messages };

export const messages: Record<Lang, Messages> = { hinglish, en, hi };

export const LANG_META: Record<Lang, { label: string; short: string; htmlLang: string }> = {
  hinglish: { label: 'Hinglish', short: 'Hinglish', htmlLang: 'hi-Latn' },
  en: { label: 'English', short: 'EN', htmlLang: 'en' },
  hi: { label: 'हिन्दी', short: 'हिं', htmlLang: 'hi' },
};

function lookup(tree: Messages, key: string): string | undefined {
  let node: unknown = tree;
  for (const part of key.split('.')) {
    if (node && typeof node === 'object' && part in node) node = (node as Record<string, unknown>)[part];
    else return undefined;
  }
  return typeof node === 'string' ? node : undefined;
}

export function interpolate(template: string, vars?: MessageVars): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in vars ? String(vars[name]) : match,
  );
}

/** Pure translate: falls back to Hinglish, then to the key itself (never crashes the UI). */
export function translate(lang: Lang, key: MessageKey, vars?: MessageVars): string {
  const raw = lookup(messages[lang], key) ?? lookup(messages.hinglish, key) ?? key;
  return interpolate(raw, vars);
}

export function useLang(): Lang {
  return useSettings((s) => s.lang);
}

export function useT() {
  const lang = useLang();
  return useCallback((key: MessageKey, vars?: MessageVars) => translate(lang, key, vars), [lang]);
}

/** For content that ships its own translations (topic titles, narration…). */
export function useLocalize() {
  const lang = useLang();
  return useCallback(
    (text: LocalizedText, vars?: MessageVars) => interpolate(text[lang] || text.hinglish, vars),
    [lang],
  );
}
