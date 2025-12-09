/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Logo-inspired color palette
        logo: {
          // Background - muted green from logo circle
          green: '#3E6B3F',
          'green-light': '#4A7D4B',
          'green-dark': '#2D5030',
          // Cape/Scarf reds
          red: '#C63732',
          'red-dark': '#A92E2A',
        },
        // Dog fur colors - warm golden tones
        fur: {
          light: '#F4C56A',
          main: '#E69848',
          cream: '#FBE3A8',
          dark: '#D4883A',
        },
        // UI Dark theme - using logo green as base
        dark: {
          50: '#FBE3A8',   // Cream (lightest - for primary text)
          100: '#F4C56A',  // Golden light
          200: '#E69848',  // Golden main
          300: '#D4883A',  // Golden dark
          400: '#6C727C',  // Cool gray (from goggles)
          500: '#4A7D4B',  // Light logo green
          600: '#3E6B3F',  // Logo green (main)
          700: '#2D5030',  // Dark logo green
          800: '#1E3A20',  // Deeper green
          900: '#162B18',  // Very dark green
          950: '#0F1F10',  // Darkest green (backgrounds)
        },
        // Brand accent - warm golden from dog fur
        brand: {
          50: '#FEF9E7',
          100: '#FBE3A8',
          200: '#F4C56A',
          300: '#E69848',
          400: '#D4883A',
          500: '#C67830',
          600: '#A86228',
          700: '#8A4E20',
          800: '#6C3A18',
          900: '#4E2810',
        },
        // Accent colors from logo details
        accent: {
          gold: '#F4C56A',     // Golden accent (from fur.light)
          red: '#C63732',
          'red-dark': '#A92E2A',
          pink: '#E46A63',      // Tongue pink
          peach: '#F2A27E',     // Cheek blush
          brown: '#4A2C1D',     // Nose/details
          'brown-dark': '#3A2416',
        },
        // Neutral grays from goggles
        gray: {
          light: '#E7EAEF',
          main: '#A4AAB5',
          dark: '#6C727C',
        },
        // Success - using logo green
        success: {
          400: '#5A8F5B',
          500: '#4A7D4B',
          600: '#3E6B3F',
        },
        // Error - using logo red
        error: {
          400: '#D64D48',
          500: '#C63732',
          600: '#A92E2A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}