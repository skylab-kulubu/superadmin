import type { Config } from 'tailwindcss';

const config: Config = {
  theme: {
    extend: {
      colors: {
        lacivert: {
          DEFAULT: '#06032C',
          50: '#e6e5f0',
          100: '#cccbe1',
          200: '#9997c3',
          300: '#6663a5',
          400: '#332f87',
          500: '#06032C',
          600: '#050228',
          700: '#04021e',
          800: '#030114',
          900: '#02010a',
        },
        pembe: {
          DEFAULT: '#eadaff',
          50: '#faf8ff',
          100: '#f5f0ff',
          200: '#eadaff',
          300: '#d5b5ff',
          400: '#c090ff',
          500: '#ab6bff',
          600: '#9646ff',
          700: '#8121ff',
          800: '#6c00ff',
          900: '#5700cc',
        },
        yesil: {
          DEFAULT: '#27a68e',
          50: '#e6f5f2',
          100: '#ccebe5',
          200: '#99d7cb',
          300: '#66c3b1',
          400: '#33af97',
          500: '#27a68e',
          600: '#1f8572',
          700: '#176456',
          800: '#0f433a',
          900: '#07221e',
        },
      },
    },
  },
};

export default config;

