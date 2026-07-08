import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"DM Serif Display"', 'Georgia', 'serif'],
        sans: ['"Space Grotesk"', 'ui-sans-serif', 'sans-serif'],
      },
      colors: {
        ink: {
          DEFAULT: '#ffffff',
          50: '#0a0a09',
          100: '#121110',
          200: '#201e1c',
          300: '#4a4642',
          400: '#6f6b66',
          500: '#b5b0a8',
          600: '#e2e0dc',
          700: '#eeeeec',
          800: '#f7f7f6',
          900: '#ffffff',
        },
        sienna: {
          DEFAULT: '#d32f2f',
          light: '#ef4444',
          dark: '#a01f1f',
          faint: 'rgba(211,47,47,0.1)',
        },
        cream: {
          DEFAULT: '#0a0a09',
          warm: '#201e1c',
          muted: '#4a4642',
        },
      },
      borderRadius: {
        none: '0',
        sm: '2px',
        DEFAULT: '2px',
        md: '3px',
        lg: '4px',
        xl: '4px',
        '2xl': '4px',
        full: '9999px',
      },
      boxShadow: {
        'flat': '1px 1px 0 0 #e2e0dc',
        'flat-sm': '0 1px 0 0 #e2e0dc',
        'flat-sienna': '2px 2px 0 0 #a01f1f',
        'none': 'none',
      },
      animation: {
        'enter': 'enter 0.2s ease-out',
        'slide-right': 'slideRight 0.25s ease-out',
        'count-up': 'countUp 0.4s ease-out',
        'underline-in': 'underlineIn 0.2s ease-out forwards',
      },
      keyframes: {
        enter: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideRight: {
          '0%': { opacity: '0', transform: 'translateX(-8px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        countUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        underlineIn: {
          '0%': { transform: 'scaleX(0)' },
          '100%': { transform: 'scaleX(1)' },
        },
      },
    },
  },
  plugins: [],
}
export default config
