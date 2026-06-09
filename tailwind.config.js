/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#FEF3E2',
          100: '#FDE7C4',
          200: '#FBCF89',
          300: '#F8B74E',
          400: '#F6A02A',
          500: '#EA8923',
          600: '#C97318',
          700: '#A85F14',
          800: '#874C10',
          900: '#6E3D0D',
        },
        navy: {
          50:  '#E8EDF5',
          100: '#C5D0E3',
          200: '#9FB0CD',
          300: '#7990B7',
          400: '#5B78A6',
          500: '#3D6195',
          600: '#2E4D7A',
          700: '#243A5E',
          800: '#1B2B4B',
          900: '#0F1A2E',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
