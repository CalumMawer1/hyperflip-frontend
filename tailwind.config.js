/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'montserrat': ['var(--font-montserrat)', 'sans-serif'],
        'ibmplex': ['var(--font-ibmplex)', 'monospace'],
        'poppins': ['var(--font-poppins)', 'sans-serif'],
        'primary': ['var(--font-tektur)', 'sans-serif'],
        'title': ['var(--font-brunoace)', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: 'rgb(4, 230, 224)',
          light: 'rgba(4, 230, 224, 0.1)',
          medium: 'rgba(4, 230, 224, 0.2)',
          dark: 'rgba(4, 230, 224, 0.3)',
        },
        secondary: {
          DEFAULT: '#8B5CF6',
          light: 'rgba(139, 92, 246, 0.1)',
          medium: 'rgba(139, 92, 246, 0.2)',
          dark: 'rgba(139, 92, 246, 0.3)',
        },
        success: {
          DEFAULT: '#10B981',
        },
        error: {
          DEFAULT: '#EF4444',
        },
        background: {
          dark: 'black',
          DEFAULT: '#0a0a0a',
          card: 'rgba(0, 0, 0, 0.6)',
          hover: 'rgba(4, 230, 224, 0.1)',
        },
        white: "#F5FEFD",
        green: "rgba(4, 230, 224, 0.85)"
      },
      animation: {
        'fall-in': 'fallIn 0.4s ease-out forwards',
        'pulse-custom': 'custom-pulse 2s infinite',
        'shimmer': 'shimmer 2s infinite',
        'aurora': 'aura 15s linear infinite',
      },
      boxShadow: {
        'glow': '0 0 15px rgba(4, 230, 224, 0.2)',
        'glow-lg': '0 0 25px rgba(4, 230, 224, 0.3)',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(to right, #04e6e0, #8B5CF6)',
      },
    },
  },
  plugins: [],
} 