/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    '../frontend/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        figtree: ['var(--font-figtree)', 'Figtree'],
        sans: ['var(--font-figtree)', 'Figtree'],
      },
      colors: {
        primary: {
          DEFAULT: '#E51AE5',
          50: '#FDF2FF',
          100: '#FCE7FF',
          200: '#F8D0FF',
          300: '#F2A9FF',
          400: '#E973FF',
          500: '#E51AE5',
          600: '#D10BC7',
          700: '#B005A5',
          800: '#930887',
          900: '#7A0C6F',
        },
        secondary: {
          DEFAULT: '#00C2D4',
          50: '#F0FDFE',
          100: '#CCFAFE',
          200: '#99F4FD',
          300: '#66EEFB',
          400: '#33E8F9',
          500: '#00C2D4',
          600: '#00A8B8',
          700: '#008E9C',
          800: '#007480',
          900: '#005A64',
        },
        background: 'rgb(var(--background))',
        foreground: {
          DEFAULT: 'rgb(var(--foreground))',
          dark: '#FFFFFF',
        },
        border: {
          DEFAULT: 'rgb(var(--border))',
          dark: '#374151',
        },
        muted: {
          DEFAULT: 'rgb(var(--muted))',
          dark: '#1F2937',
        },
        'muted-foreground': 'rgb(var(--muted-foreground))',
        popover: 'rgb(var(--popover))',
        'popover-foreground': 'rgb(var(--popover-foreground))',
        accent: 'rgb(var(--accent))',
        'accent-foreground': 'rgb(var(--accent-foreground))',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { transform: 'translateY(20px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        slideDown: { '0%': { transform: 'translateY(-20px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        scaleIn: { '0%': { transform: 'scale(0.9)', opacity: '0' }, '100%': { transform: 'scale(1)', opacity: '1' } },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
