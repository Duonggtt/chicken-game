/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'pulse-fast': 'pulse 1s infinite',
        'spin-slow': 'spin 3s linear infinite',
        'float': 'float 3s ease-in-out infinite',
        'explosion': 'explosion 0.5s ease-out',
      },
      transitionDuration: {
        '2000': '2000ms',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        explosion: {
          '0%': { transform: 'scale(0)', opacity: '1' },
          '100%': { transform: 'scale(2)', opacity: '0' },
        }
      },
      colors: {
        game: {
          primary: '#ff6b35',
          secondary: '#f7931e', 
          accent: '#ffde59',
          dark: '#2c3e50',
          light: '#ecf0f1'
        }
      }
    },
  },
  plugins: [],
}
