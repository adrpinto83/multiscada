/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#0a0e1a',
          800: '#0d1224',
          700: '#111827',
          600: '#1a2235',
          500: '#243047',
        },
        cyan: {
          scada: '#00d4ff',
        },
        alarm: {
          critical: '#ff2222',
          high: '#ff4444',
          medium: '#ffaa00',
          low: '#44ff44',
        },
      },
      fontFamily: {
        mono: ['"Share Tech Mono"', 'monospace'],
        label: ['Rajdhani', 'sans-serif'],
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'spin-medium': 'spin 1.5s linear infinite',
        'spin-fast': 'spin 0.8s linear infinite',
        'pulse-alarm': 'pulse 0.5s ease-in-out infinite',
        'dash-flow': 'dashFlow 1s linear infinite',
      },
      keyframes: {
        dashFlow: {
          '0%': { strokeDashoffset: '20' },
          '100%': { strokeDashoffset: '0' },
        },
      },
    },
  },
  plugins: [],
}
