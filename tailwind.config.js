/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'archival-bg': '#111111',
        'archival-bg-secondary': '#1a1a1a',
        'archival-bg-tertiary': '#242424',
        'archival-text': '#eaeaea',
        'archival-muted': '#9ca3af',
        'archival-accent': '#ffffff',
        'archival-border': 'rgba(255, 255, 255, 0.1)',
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
        mono: ['"Roboto Mono"', 'monospace', '"Courier New"'],
        sans: ['"Inter"', 'sans-serif'],
      },
      boxShadow: {
        'polaroid': '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
      }
    },
  },
  plugins: [],
}

