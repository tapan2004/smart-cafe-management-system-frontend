/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        coffee: {
          50: '#fdf8f6',
          100: '#f2e8e5',
          200: '#eaddd7',
          300: '#e0cec7',
          400: '#d2bab0',
          500: '#a38068',
          600: '#8c6b5d',
          700: '#75564c',
          800: '#5c433b',
          900: '#402e29',
        },
      },
    },
  },
  plugins: [],
}
