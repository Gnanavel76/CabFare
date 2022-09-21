/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#ffbd30',
        inputBg: '#f8f8f8',
        inputBorder: '#E4E4E4',
        formError: '#E92B2B',
        lightBlue: '#f4f5fa'
      },
      screens: {
        '3xl': '1792px',
        '4xl': '2048px'
      }
    },
  },
  plugins: [],
}
