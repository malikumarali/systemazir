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
          DEFAULT: '#0e0e0c',
          50: '#f5f0e8',
          100: '#e8e0d0',
          200: '#c8bca8',
          300: '#9a9188',
          400: '#6b6460',
          500: '#3d3830',
          600: '#2a2520',
          700: '#1a1712',
          800: '#141210',
          900: '#0e0e0c',
        },
        sienna: {
          DEFAULT: '#c2522a',
          light: '#e8784f',
          dark: '#8f3a1c',
          faint: 'rgba(194,82,42,0.1)',
        },
        cream: {
          DEFAULT: '#f5f0e8',
          warm: '#ede7d9',
          muted: '#c8bca8',
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
        'flat': '1px 1px 0 0 #2a2520',
        'flat-sm': '0 1px 0 0 #2a2520',
        'flat-sienna': '2px 2px 0 0 #8f3a1c',
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
