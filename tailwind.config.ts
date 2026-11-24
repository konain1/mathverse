import type { Config } from 'tailwindcss';

/** Colours are CSS variables (RGB triplets) so the light/dark themes swap in one place: src/styles/tokens.css */
const v = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        bg: v('bg'),
        'bg-raised': v('bg-raised'),
        surface: v('surface'),
        line: v('line'),
        ink: v('ink'),
        muted: v('muted'),
        faint: v('faint'),
        triangle: v('triangle'),
        square: v('square'),
        rectangle: v('rectangle'),
        cube: v('cube'),
        accent: v('accent'),
        ok: v('ok'),
        bad: v('bad'),
      },
      fontFamily: {
        sans: ['"Nunito Variable"', '"Noto Sans Devanagari Variable"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono Variable"', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        // Modular scale (1.25) anchored at 16px
        display: ['clamp(2.5rem, 6vw, 4.5rem)', { lineHeight: '1.02', letterSpacing: '-0.025em', fontWeight: '800' }],
      },
      borderRadius: {
        panel: '1.75rem',
        card: '1.25rem',
        control: '0.875rem',
      },
      boxShadow: {
        glow: '0 0 0 1px rgb(var(--accent) / 0.35), 0 0 32px -4px rgb(var(--accent) / 0.45)',
        lift: '0 24px 60px -24px rgb(var(--shadow) / 0.55)',
      },
      maxWidth: { page: '76rem' },
    },
  },
  plugins: [],
} satisfies Config;
