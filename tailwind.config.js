/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FFC700',
        secondary: '#1f2937',
        dark: '#111827',
        'ctd-yellow': '#FFC700',
        'ctd-yellow-dark': '#e6b300',
        ctd: {
          bg: '#0A0A0A',
          panel: '#101214',
          border: '#2F3136',
          text: '#EAEAEA',
          yellow: '#FFC700',
          ice: '#00E5FF',
          mute: '#9CA3AF'
        }
      },
      boxShadow: {
        glow: '0 8px 24px -6px rgba(255,199,0,.35)',
        inner: 'inset 0 1px 0 rgba(255,255,255,.03)'
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      animation: {
        'fade-in': 'fadeIn 1s ease-out',
        'slide-up': 'slideUp 0.8s ease-out',
        'float': 'float 3s ease-in-out infinite',
        'gradient-shift': 'gradientShift 8s ease infinite',
      },
    },
  },
  plugins: [],
}