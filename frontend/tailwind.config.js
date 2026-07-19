/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563EB',
          light: '#3B82F6',
          dark: '#1D4ED8',
        },
        secondary: {
          DEFAULT: '#14B8A6',
          light: '#2DD4BF',
          dark: '#0F766E',
        },
        accent: {
          DEFAULT: '#F59E0B',
          light: '#FBBF24',
          dark: '#D97706',
        },
        background: {
          DEFAULT: '#F8FAFC',
          dark: '#0F172A',
        },
        dark: {
          DEFAULT: '#0F172A',
          card: '#1E293B',
          border: '#334155',
        },
        success: '#22C55E',
        danger: '#EF4444',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Poppins', 'sans-serif'],
      },
      boxShadow: {
        'premium': '0 10px 30px -10px rgba(0, 0, 0, 0.05)',
        'premium-hover': '0 20px 40px -15px rgba(0, 0, 0, 0.1)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.04)',
      },
      backdropBlur: {
        'xs': '2px',
      }
    },
  },
  plugins: [],
}
