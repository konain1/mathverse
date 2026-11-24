import { useCallback } from 'react';
import { useLang, useT, type MessageKey } from '@/i18n';
import type { OpError } from '@/lib/geometry/construction';
import type { Issue } from '@/lib/geometry/validators';

const SHAPE_KEY: Record<string, MessageKey> = {
  triangle: 'shapes.triangle',
  square: 'shapes.square',
  rectangle: 'shapes.rectangle',
  cube: 'shapes.cubeSingle',
  cuboid: 'shapes.cuboid',
};

/** Turns validator issues / op errors into sentences in the current language. */
export function useBuildText() {
  const t = useT();
  const lang = useLang();
  const issueText = useCallback(
    (issue: Issue) => {
      const vars: Record<string, string | number> = { ...issue.values };
      if (typeof vars.shape === 'string' && SHAPE_KEY[vars.shape]) {
        const name = t(SHAPE_KEY[vars.shape]!);
        vars.shape = lang === 'en' ? name.toLowerCase() : name;
      }
      if (typeof vars.what === 'string') vars.what = t(`build.what.${vars.what}` as MessageKey);
      for (const k of ['actualType', 'expectedType'] as const)
        if (typeof vars[k] === 'string' && vars[k]) vars[k] = t(`build.triangle.${vars[k]}` as MessageKey);
      return t(`build.issues.${issue.code}` as MessageKey, vars);
    },
    [t, lang],
  );
  const errorText = useCallback((e: OpError | 'below-ground') => t(`build.errors.${e}` as MessageKey), [t]);
  return { issueText, errorText };
}
