/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'imessage-blue': '#0A7CFF',
        'imessage-gray': '#E9E9EB',
        'game-bg': '#F2F2F7',
      },
    },
  },
  plugins: [],
};