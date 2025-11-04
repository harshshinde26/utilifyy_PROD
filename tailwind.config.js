/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./hooks/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        'display': ['Poppins', 'sans-serif'],
        'logo': ['Satisfy', 'cursive'],
      },
      colors: {
        'primary': '#0D1117',
        'secondary': '#161B22',
        'accent': {
          'DEFAULT': '#58A6FF',
          'hover': '#2F81F7',
        },
        'border': '#30363D',
        'text-primary': '#C9D1D9',
        'text-secondary': '#8B949E',
      },
    }
  },
  plugins: [],
}
