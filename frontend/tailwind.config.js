/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f4ff',
          100: '#dbe4fe',
          200: '#bfd0fe',
          300: '#93b4fd',
          400: '#6090fa',
          500: '#3b6cf6',
          600: '#2550eb',
          700: '#1d3ed8',
          800: '#1e34af',
          900: '#1e2f8a',
        }
      }
    },
  },
  plugins: [],
}
