/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'ink-canvas': '#000f0f',
        'canvas': '#000f0f',
        'canvas-surface': '#000000',
        'surface-card': '#13302e',
        'surface-card-2': '#1f403e',
        'brand-foam': '#6fe0ed',
        'brand-cerulean': '#5198fb',
        'brand-foam-deep': '#104b55',
        'ink-near-white': '#f4f5f5',
        'ink-light': '#e5eceb',
        'ink-dim': '#6f908c',
        'ink-soft': '#4d5b7c',
        'ink-pure': '#ffffff',
        'text-light': '#f4f5f5',
        'hairline': '#e5eceb',
        'hairline-dim': '#6f908c',
      },
      fontFamily: {
        'display': ['"Plus Jakarta Sans"', 'sans-serif'],
        'body': ['Inter', 'sans-serif'],
        'mono': ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        'pill': '40px',
      }
    },
  },
  plugins: [],
}
