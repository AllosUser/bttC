/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,jsx}', './index.html'],
  theme: {
    extend: {
      colors: {
        'bt-dark': '#050713',
        'bt-black': '#03040B',
        'bt-navy': '#0B1328',
        'bt-green': '#00E39A',
        'bt-cyan': '#00D9FF',
        'bt-blue': '#087BFF',
        'bt-white': '#F4F7FB',
        black: '#050713',
        surface: '#0B1328',
        surface2: '#070A16',
        surface3: '#0B1024',
        accent: '#00D9FF',
        teal: '#00E39A',
        'off-white': '#F4F7FB',
        muted: 'rgba(244, 247, 251, 0.68)',
        dim: 'rgba(0, 217, 255, 0.22)',
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
