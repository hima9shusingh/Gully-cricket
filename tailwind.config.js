/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cricket: {
          DEFAULT: '#16A34A',
          dark: '#15803d'
        },
        navy: '#0F172A',
        accent: {
          orange: '#F97316',
          yellow: '#FACC15',
          green: '#22C55E'
        }
      }
    },
  },
  plugins: [],
}
