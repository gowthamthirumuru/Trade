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
        background: '#000000',
        sidebar: '#000000',
        card: '#080808',
        'card-hover': '#121212',
        'card-border': '#1a1a1a',
        'border-subtle': '#181818',
        'border-highlight': '#282828',
        
        // Brand & Status Accents matching the image
        brand: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          400: '#818CF8',
          500: '#6366F1',
          600: '#4F46E5',
          700: '#4338CA',
          violet: '#7C3AED',
          purple: '#8B5CF6',
        },
        accent: {
          cyan: '#06B6D4',
          emerald: '#10B981',
          teal: '#14B8A6',
          amber: '#F59E0B',
          yellow: '#EAB308',
          rose: '#F43F5E',
          red: '#EF4444',
          indigo: '#6366F1',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
      },
      boxShadow: {
        'glow-purple': '0 0 20px -5px rgba(124, 58, 237, 0.35)',
        'glow-cyan': '0 0 20px -5px rgba(6, 182, 212, 0.35)',
        'glow-emerald': '0 0 20px -5px rgba(16, 185, 129, 0.35)',
        'glow-card': '0 4px 20px -2px rgba(0, 0, 0, 0.7)',
      },
    },
  },
  plugins: [],
}
