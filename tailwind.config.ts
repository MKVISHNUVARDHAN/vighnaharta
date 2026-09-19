import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'deep-indigo': '#1a1a3e',
        'navy': '#0d1b2a',
        'warm-gold': '#d4a53c',
        'marigold': '#e8a317',
        'festival-orange': '#e85d26',
        'vermilion': '#d4442a',
        'ivory': '#f5f0e8',
        'muted-teal': '#2d6a6a',
        'deep-shadow': '#0a0a1a',
      },
      fontFamily: {
        display: ['Cinzel', 'serif'],
        body: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
