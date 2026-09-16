/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        soft: '0 12px 30px rgba(15, 23, 42, 0.08)',
      },
      colors: {
        emergency: {
          critical: '#ef4444',
          urgent: '#f59e0b',
          nonurgent: '#22c55e',
          unknown: '#64748b',
        },
      },
    },
  },
  plugins: [],
}

