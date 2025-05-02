// tailwind.config.js
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}", // kalau pakai App Router
  ],
  theme: {
    extend: {
      fontFamily: {
        rajdhani: ['Rajdhani', 'sans-serif'],
      },
      fontWeight: {
        light: 100,
        regular: 400,
        bold: 700,
        extraBold: 900,
      },
    },
  },
  plugins: [],
};