/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{svelte,js}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'rgb(var(--primary) / <alpha-value>)',
          foreground: 'rgb(var(--on-primary) / <alpha-value>)',
          container: 'rgb(var(--primary-container) / <alpha-value>)',
          'on-container': 'rgb(var(--on-primary-container) / <alpha-value>)',
        },
        secondary: {
          DEFAULT: 'rgb(var(--secondary) / <alpha-value>)',
          foreground: 'rgb(var(--on-secondary) / <alpha-value>)',
        },
        tertiary: {
          DEFAULT: 'rgb(var(--tertiary) / <alpha-value>)',
          foreground: 'rgb(var(--on-tertiary) / <alpha-value>)',
        },
        error: {
          DEFAULT: 'rgb(var(--error) / <alpha-value>)',
          foreground: 'rgb(var(--on-error) / <alpha-value>)',
        },
        surface: {
          DEFAULT: 'rgb(var(--surface) / <alpha-value>)',
          container: 'rgb(var(--surface-container) / <alpha-value>)',
          high: 'rgb(var(--surface-high) / <alpha-value>)',
        },
        'on-surface': {
          DEFAULT: 'rgb(var(--on-surface) / <alpha-value>)',
          variant: 'rgb(var(--on-surface-variant) / <alpha-value>)',
        },
        outline: {
          DEFAULT: 'rgb(var(--outline) / <alpha-value>)',
          variant: 'rgb(var(--outline-variant) / <alpha-value>)',
        },
        status: {
          pending: 'rgb(var(--status-pending) / <alpha-value>)',
          ready: 'rgb(var(--status-ready) / <alpha-value>)',
          failed: 'rgb(var(--status-failed) / <alpha-value>)',
          warning: 'rgb(var(--status-warning) / <alpha-value>)',
          'error-row': 'rgb(var(--status-error-row) / <alpha-value>)',
        },
      },
      fontFamily: {
        sans: ['"Roboto Flex"', 'Roboto', 'system-ui', 'sans-serif'],
        jp: ['"Noto Sans JP"', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display-lg': ['2.5rem', { lineHeight: '3rem', fontWeight: '700' }],
        'display-md': ['2rem', { lineHeight: '2.5rem', fontWeight: '700' }],
        'display-sm': ['1.75rem', { lineHeight: '2.25rem', fontWeight: '700' }],
        'headline-xl': ['2rem', { lineHeight: '2.5rem', fontWeight: '700' }],
        'headline-lg': ['1.75rem', { lineHeight: '2.25rem', fontWeight: '700' }],
        'headline-sm': ['1.375rem', { lineHeight: '1.875rem', fontWeight: '600' }],
        'title-lg': ['1.25rem', { lineHeight: '1.75rem', fontWeight: '600' }],
        'title-md': ['1rem', { lineHeight: '1.5rem', fontWeight: '600' }],
        'body-lg': ['1rem', { lineHeight: '1.5rem', fontWeight: '400' }],
        'body-md': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '400' }],
        'label-lg': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '600' }],
        'label-md': ['0.75rem', { lineHeight: '1rem', fontWeight: '500' }],
      },
      borderRadius: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        '2xl': '28px',
      },
      boxShadow: {
        'level-1': '0 1px 2px rgba(0, 0, 0, 0.06)',
        'level-2': '0 2px 6px rgba(0, 0, 0, 0.08)',
        'level-3': '0 4px 12px rgba(0, 0, 0, 0.12)',
        'level-4': '0 8px 24px rgba(0, 0, 0, 0.16)',
        'level-5': '0 16px 32px rgba(0, 0, 0, 0.2)',
      },
      keyframes: {
        'page-in': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'toast-in': {
          from: { opacity: '0', transform: 'translateY(12px) scale(0.98)' },
          to: { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'modal-in': {
          from: { opacity: '0', transform: 'translateY(16px) scale(0.97)' },
          to: { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
      },
      animation: {
        'page-in': 'page-in 250ms cubic-bezier(0.2, 0, 0, 1) both',
        'toast-in': 'toast-in 200ms cubic-bezier(0.2, 0, 0, 1) both',
        'modal-in': 'modal-in 300ms cubic-bezier(0.05, 0.7, 0.1, 1) both',
        'fade-in': 'fade-in 200ms ease-out both',
      },
    },
  },
  plugins: [],
}
