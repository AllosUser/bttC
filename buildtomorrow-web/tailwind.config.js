/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,jsx}', './index.html'],
  theme: {
    extend: {
      colors: {
        black: '#08080a',
        surface: '#0f0f12',
        surface2: '#17171c',
        surface3: '#1e1e24',
        accent: '#c8f542',
        teal: '#42f5b0',
        'off-white': '#f0ede8',
        muted: '#55555f',
        dim: '#2c2c34',
      },
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
      },
      transitionTimingFunction: {
        'expo-out': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'back-out': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'in-out-sharp': 'cubic-bezier(0.76, 0, 0.24, 1)',
      },
    },
  },
  plugins: [],
}
