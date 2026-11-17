/** @type {import('tailwindcss').Config} */

// Colors are defined as CSS variables in src/styles/global.css so that one set of
// class names works in both light and dark mode (toggled with the "dark" class).
const token = (name) => `rgb(var(--c-${name}) / <alpha-value>)`

export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: token('bg'),
        surface: token('surface'),
        subtle: token('subtle'),
        line: token('line'),
        fg: token('fg'),
        muted: token('muted'),
        faint: token('faint'),
        accent: token('accent'),
        'accent-soft': token('accent-soft'),
        gold: token('gold'),
        silver: token('silver'),
        bronze: token('bronze'),
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px 0 rgb(0 0 0 / 0.04), 0 1px 3px 0 rgb(0 0 0 / 0.04)',
        pop: '0 8px 24px -6px rgb(0 0 0 / 0.18)',
      },
    },
  },
  plugins: [],
}
