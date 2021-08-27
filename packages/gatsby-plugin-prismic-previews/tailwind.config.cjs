const tailwindCapsize = require('@themosaad/tailwindcss-capsize')

module.exports = {
  mode: 'jit',
  purge: ['./src/**/*.{ts,tsx}'],
  darkMode: false,
  theme: {
    colors: {
      black: '#000',
      white: '#fff',
      transparent: 'transparent',
      debug: '#f0f',
      slate: {
        10: '#212735',
        30: '#4a5669',
        60: '#888ca5',
        70: '#bcbecd',
        90: '#e0e2ee',
        95: '#f5f6f9',
      },
      purple: {
        40: '#34409c',
        50: '#5d6acc',
      },
      red: {
        40: '#c4133e',
        60: '#c86c82',
        80: '#ffb4b4',
        95: '#ffefef',
      },
    },
    fontSize: [12, 14, 16, 20, 24].reduce((acc, curr) => {
      acc[curr] = curr + 'px'

      return acc
    }, {}),
    fontFamily: {
      sans: ['Inter', 'sans-serif'],
      mono: ['JetBrains Mono', 'monospace'],
    },
    capsize: {
      fontMetrics: {
        sans: {
          capHeight: 2048,
          ascent: 2728,
          descent: -680,
          lineGap: 0,
          unitsPerEm: 2816,
        },
        mono: {
          capHeight: 730,
          ascent: 1020,
          descent: -300,
          lineGap: 0,
          unitsPerEm: 1000,
        },
      },
    },
    lineHeight: {
      none: '1',
      '1_1': '1.1',
      '1_4': '1.4',
      '1_5': '1.5',
    },
    extend: {
      spacing: {
        '20vh': '20vh',
      },
      minWidth: {
        '7.5rem': '7.5rem',
      },
      maxWidth: {
        '34rem': '34rem',
      },
      zIndex: {
        max: 2147483647,
      },
    },
  },
  variants: {},
  plugins: [tailwindCapsize],
}
