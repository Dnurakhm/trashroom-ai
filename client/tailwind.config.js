/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html", // Это главный HTML-файл Vite в client/
    "./src/**/*.{js,ts,jsx,tsx}", // Все React компоненты в client/src/
  ],
  theme: {
    extend: {
      colors: {
        'brand-primary': '#ff2d75',
        'brand-primary-hover': '#ff4c8b',
        'brand-secondary': '#00e5ff',
        'brand-accent': '#ffc107',
        'dark-bg': '#0d0d0d',
        'dark-card': '#1a1a1a',
        'dark-input': '#2a2a2a',
        'light-text': '#f0f0f0',
        'subtle-text': '#a0a0a0',
      },
      fontFamily: {
        sans: ['Segoe UI', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      boxShadow: {
        'neon-primary': '0 0 5px #ff2d75, 0 0 10px #ff2d75, 0 0 15px #ff2d75',
        'neon-secondary': '0 0 5px #00e5ff, 0 0 10px #00e5ff',
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        pulseStrong: {
          '0%, 100%': { opacity: '1' , transform: 'scale(1)'},
          '50%': { opacity: '.7', transform: 'scale(1.02)' },
        }
      },
      animation: {
        wiggle: 'wiggle 1s ease-in-out infinite',
        pulseStrong: 'pulseStrong 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}