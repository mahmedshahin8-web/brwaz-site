/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          dark: '#0f1115',
          darker: '#08090b',
          panel: '#161b22',
        },
        accent: {
          danger: '#DC143C',
          dangerDark: '#900000',
          warning: '#fbbf24',
        },
        text: {
          primary: '#e2e8f0',
          secondary: '#94a3b8',
          muted: '#64748b',
        }
      },
      boxShadow: {
        'danger': '0 0 20px rgba(220, 20, 60, 0.3)',
        'warning': '0 0 20px rgba(251, 191, 36, 0.2)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.3)',
      },
      animation: {
        'spin-slow': 'spin 4s linear infinite',
      }
    },
  },
  plugins: [],
};
