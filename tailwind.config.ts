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
        primary: {
          DEFAULT: '#2E8BC0',  // LearnUp Blue — header/footer
          50: '#f0f7fb',
          100: '#d9ecf5',
          200: '#b3d9eb',
          300: '#8dc6e1',
          400: '#5eafd3',
          500: '#2E8BC0',  // main
          600: '#2577a5',
          700: '#1d6389',
          800: '#154f6e',
          900: '#0d3b52',
          950: '#072736',
        },
        accent: {
          DEFAULT: '#5DAE50',  // Innovate Green — interactive elements
          50: '#f3faf2',
          100: '#e0f2de',
          200: '#c2e5bd',
          300: '#9dd495',
          400: '#78c36d',
          500: '#5DAE50',  // main
          600: '#4a9240',
          700: '#3a7533',
          800: '#2e5d29',
          900: '#254c22',
          950: '#122911',
        },
        cta: {
          DEFAULT: '#FFA500',  // Empower Orange — CTA buttons
          50: '#fffbeb',
          100: '#fff3c6',
          200: '#ffe588',
          300: '#ffd24a',
          400: '#ffc020',
          500: '#FFA500',  // main
          600: '#e28800',
          700: '#bb6902',
          800: '#985008',
          900: '#7d420b',
          950: '#472100',
        },
        body: {
          DEFAULT: '#707070',  // Accessible Grey — body text
          50: '#f6f6f6',
          100: '#e7e7e7',
          200: '#d1d1d1',
          300: '#b0b0b0',
          400: '#888888',
          500: '#707070',  // main
          600: '#5d5d5d',
          700: '#4f4f4f',
          800: '#454545',
          900: '#3d3d3d',
          950: '#262626',
        },
        // Social login brand colors
        kakao: '#FEE500',
        naver: '#03C75A',
      },
    },
  },
  plugins: [],
}
export default config
