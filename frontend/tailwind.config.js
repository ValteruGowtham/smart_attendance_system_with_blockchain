/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        beach: {
          bg: '#FEFEFE',
          primary: '#4A90E2',
          secondary: '#9C27B0',
          accent: '#4CAF50',
          text: '#212121',
          border: '#E0E0E0',
          cream: '#F5F5DC',
          sand: '#F4E4BC',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
