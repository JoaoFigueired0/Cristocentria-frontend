import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          black:     '#0A0A0A',
          white:     '#F8F6F1',
          graphite:  '#3A3A3A',
          offwhite:  '#EDE9E0',
          beige:     '#C9B99A',
          olive:     '#5C6645',
          navy:      '#1C2B4A',
          coffee:    '#6B4226',
          border:    '#E0DDD6',
          surface:   '#F8F6F1',
          surface2:  '#F0EDE6',
          muted:     '#9A9A9A',
          pix:       '#22C55E',
        },
      },
      fontFamily: {
        display: ['var(--ff-display)', 'sans-serif'],
        body:    ['var(--ff-body)',    'sans-serif'],
      },
      borderRadius: {
        sm:  '4px',
        DEFAULT: '6px',
        lg:  '12px',
        xl:  '16px',
        '2xl': '24px',
      },
      screens: {
        xs: '375px',
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1440px',
      },
      keyframes: {
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'slide-up': 'slide-up 0.3s ease-out',
        'fade-in':  'fade-in 0.25s ease-out',
        shimmer:    'shimmer 1.6s infinite linear',
      },
    },
  },
  plugins: [],
}

export default config
