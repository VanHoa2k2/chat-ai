/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: '#faf9f7',
        oat: '#dad4c8',
        'oat-light': '#e8e4dc',
        charcoal: '#333333',
        silver: '#888888',
        matcha: {
          50: '#f4f9f5',
          100: '#e6f2e8',
          600: '#4a9a5f',
          700: '#3d8a50',
        },
        slushie: {
          50: '#fdf2f8',
          100: '#fce7f3',
          600: '#db2777',
        },
        lemon: {
          50: '#fefce8',
          100: '#fef9c3',
          600: '#ca8a04',
        },
        ube: {
          50: '#f5f3ff',
          100: '#ede9fe',
          600: '#7c3aed',
          800: '#5b21b6',
        },
        pomegranate: {
          50: '#fef2f2',
          100: '#fee2e2',
          600: '#dc2626',
        },
      },
      fontFamily: {
        roobert: ['Roobert', 'sans-serif'],
        mono: ['Space Mono', 'monospace'],
      },
      spacing: {
        '18': '4.5rem',
      },
      borderRadius: {
        'sharp': '4px',
      },
    },
  },
  plugins: [],
}