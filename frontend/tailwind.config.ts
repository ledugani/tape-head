import type { Config } from 'tailwindcss'
import aspectRatio from '@tailwindcss/aspect-ratio'

export default {
  content: [
    './src/**/*.{ts,tsx,js,jsx,mdx}',
    './app/**/*.{ts,tsx,js,jsx,mdx}',
    './pages/**/*.{ts,tsx,js,jsx,mdx}',
    './components/**/*.{ts,tsx,js,jsx,mdx}',
    './lib/**/*.{ts,tsx,js,jsx,mdx}',
  ],
  theme: {
    extend: {
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
      },
      keyframes: {
        'accordion-down': {
          from: { maxHeight: '0' },
          to: { maxHeight: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { maxHeight: 'var(--radix-accordion-content-height)' },
          to: { maxHeight: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        'accordion-up': 'accordion-up 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [aspectRatio],
} satisfies Config

