/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        positive: '#16a34a',
        negative: '#dc2626',
        neutral: '#6b7280',
        primary: '#2563eb',
        secondary: '#64748b',
      }
    },
  },
  plugins: [],
}
