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
          panel: '#0E1113',
          panel2: '#0B0D0F',
          border: '#2F3136',
          text: '#ECECEC',
          mute: '#9CA3AF',
          yellow: '#FFC700',
          ice: '#00E5FF'
        }
      },
      boxShadow: {
        glow: '0 10px 30px -8px rgba(255,199,0,.45)',
        inner: 'inset 0 1px 0 rgba(255,255,255,.04)',
        card: '0 20px 60px rgba(0,0,0,.45)'
      },
      dropShadow: {
        neon: '0 0 18px rgba(255,199,0,.45)'
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.25rem'
      },
      animation: {
        'grid-move': 'gridMove 18s linear infinite',
        'pulse-soft': 'pulseSoft 2.2s ease-in-out infinite',
        'scanline': 'scanline 8s linear infinite',
        'ring': 'ring 3s ease-in-out infinite'
      },
      keyframes: {
        gridMove: { '0%': {backgroundPosition: '0 0, 0 0'}, '100%': {backgroundPosition: '200px 200px, 200px 200px'} },
        pulseSoft: { '0%,100%': {opacity:.8, transform:'translateY(0)'}, '50%': {opacity:1, transform:'translateY(-1px)'} },
        scanline: { '0%': {transform:'translateY(-100%)'}, '100%': {transform:'translateY(100%)'} },
        ring: { '0%': {boxShadow:'0 0 0 0 rgba(255,199,0,.4)'}, '70%': {boxShadow:'0 0 0 10px rgba(255,199,0,0)'}, '100%': {boxShadow:'0 0 0 0 rgba(255,199,0,0)'} }
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