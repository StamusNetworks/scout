import type { Config } from 'tailwindcss';
import plugin from 'tailwindcss/plugin';

export default {
  content: ['./src/**/*.{ts,tsx}'],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1600px',
      },
    },
    extend: {
      boxShadow: {
        px: '0 0 0 1px rgba(0, 0, 0, 1)',
        neumorphic:
          '1px 1px 1px 0 rgba(255, 255, 255, 0.3) inset, -2px -2px 2px 0 rgba(0, 0, 0, .4) inset',
      },
      textShadow: {
        sm: '1px 2px var(--tw-shadow-color)',
        DEFAULT: '0 2px 4px var(--tw-shadow-color)',
        lg: '0 8px 16px var(--tw-shadow-color)',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'lateral-movement': {
          from: { top: '0%' },
          to: { top: 'calc(100% - 4px)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'lateral-movement': 'lateral-movement 5s ease-in-out infinite',
        'lateral-movement-reverse':
          'lateral-movement 5s ease-in-out reverse infinite',
      },
    },
  },
  plugins: [
    require('@tailwindcss/container-queries'),
    plugin(({ matchUtilities, theme }) => {
      matchUtilities(
        {
          'text-shadow': (value) => ({
            textShadow: value,
          }),
        },
        { values: theme('textShadow') },
      );
    }),
  ],
} satisfies Config;
