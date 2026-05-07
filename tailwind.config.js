/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#00C853',
        secondary: '#FFD600',
        dark: '#1a1a2e',
        accent: '#00B0FF',
      },
    },
  },
  plugins: [],
}