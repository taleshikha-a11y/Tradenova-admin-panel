/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: {
          DEFAULT: '#D8E4EE',
          light: '#DEE8F2',
          card: '#FFFFFF',
          pill: '#E9F1F8',
          border: '#CFDEEB',
        },
        brand: {
          blue: '#1E6BFB',
          dark: '#141A28',
          accent: '#2563EB',
          emerald: '#10B981',
          rose: '#F43F5E',
          amber: '#F59E0B',
        }
      },
      borderRadius: {
        '2.5xl': '20px',
        '3xl': '28px',
        '4xl': '36px',
      },
      boxShadow: {
        'card': '0 10px 30px -10px rgba(47, 79, 110, 0.08), 0 2px 6px -1px rgba(47, 79, 110, 0.04)',
        'card-hover': '0 20px 40px -12px rgba(47, 79, 110, 0.14), 0 4px 12px -2px rgba(47, 79, 110, 0.06)',
        'pill': '0 2px 8px -2px rgba(30, 107, 251, 0.15)',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
