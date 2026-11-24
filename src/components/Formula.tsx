import katex from 'katex';
import { useMemo } from 'react';
import { cn } from '@/lib/cn';

/** KaTeX formula. `tex` always comes from our own topic files, never from user input. */
export function Formula({ tex, display = true, className }: { tex: string; display?: boolean; className?: string }) {
  const html = useMemo(
    () => katex.renderToString(tex, { displayMode: display, throwOnError: false, strict: 'ignore', output: 'htmlAndMathml' }),
    [tex, display],
  );
  return <div className={cn('overflow-x-auto overflow-y-hidden', className)} dangerouslySetInnerHTML={{ __html: html }} />;
}
