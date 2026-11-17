/** @type {import('tailwindcss').Config} */

// Neutral colours are CSS variables ("R G B" channels) defined in src/styles/global.css.
const token = (name) => `rgb(var(--c-${name}) / <alpha-value>)`

// Team colours are full colour values set at runtime by src/utils/theme.js, so
// opacity is applied with color-mix (e.g. bg-team/20).
const teamColor = (name) => `color-mix(in srgb, var(--${name}) calc(<alpha-value> * 100%), transparent)`

export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: token('bg'),
        surface: token('surface'),
        // Translucent whites: bg-subtle and border-line are faint by default, /50 halves them
        subtle: 'rgb(255 255 255 / calc(<alpha-value> * 0.055))',
        line: 'rgb(255 255 255 / calc(<alpha-value> * 0.075))',
        fg: token('fg'),
        muted: token('muted'),
        faint: token('faint'),
        danger: token('danger'),
        gold: token('gold'),
        silver: token('silver'),
        bronze: token('bronze'),
        team: teamColor('team'),
        'team-2': teamColor('team-2'),
        'on-team': 'var(--on-team)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        display: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
