/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ninja: {
          950: '#06090e',
          900: '#0b1019',
          850: '#0f1724',
          800: '#141e2e',
          700: '#1e2d42',
          600: '#2d3f5a',
          border: '#1f2e45',
          neon: '#00ff9d',
          neonHover: '#00cc7d',
          crimson: '#ff2a5f',
          crimsonHover: '#e01649',
          cyan: '#00e5ff',
          amber: '#ffb703'
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'Menlo', 'Consolas', 'monospace'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'neon': '0 0 15px rgba(0, 255, 157, 0.35)',
        'neon-strong': '0 0 25px rgba(0, 255, 157, 0.6)',
        'crimson': '0 0 15px rgba(255, 42, 95, 0.4)',
        'crimson-strong': '0 0 25px rgba(255, 42, 95, 0.7)',
        'cyan': '0 0 15px rgba(0, 229, 255, 0.35)',
        'tactical': 'inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 4px 12px rgba(0, 0, 0, 0.5)'
      }
    },
  },
  plugins: [],
}
