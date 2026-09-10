/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        sans: ['"JetBrains Mono"', 'monospace'], // Default to mono for UI
      },
      colors: {
        parchment: '#f6f3f1',
        lakeBlue: '#2b59d1',
        periwinkle: '#cfdaf5',
        offBlack: '#242424',
        ash: '#cecac8',
        ink: '#000000',
        graphite: '#4e4d4d',
        smoke: '#797776',
        skyBlue: '#a0b5eb',
        mint: '#a7fccd',
        coral: '#ff9473',
        gold: '#ecda98',
        crimson: '#f37a0a',
        
        // Strict Compliance Colors
        pass: { DEFAULT: '#16A34A', light: '#DCFCE7', border: '#BBF7D0' },
        warn: { DEFAULT: '#D97706', light: '#FEF3C7', border: '#FDE68A' },
        fail: { DEFAULT: '#DC2626', light: '#FEE2E2', border: '#FECACA' },

        // Keeping shell/surface around for compatibility if some components still use them temporarily, but migrating away.
        shell: {
          950: '#f6f3f1', // Maps to parchment
          900: '#f6f3f1',
          800: '#cfdaf5', // Hover surface mapping
          700: '#cecac8', // Ash borders
          600: '#797776', // Smoke
        },
        surface: {
          50: '#f6f3f1',
          100: '#f6f3f1',
          200: '#cecac8',
          300: '#797776',
        },
        brand: {
          400: '#2b59d1', // Lake blue active
          500: '#2b59d1', // Lake blue primary
          600: '#1a3b94',
        }
      },
      borderRadius: {
        'card': '40px',
        'pill': '9999px',
        'lg': '16px', // Overriding generic radius to fit better if used
        'md': '16px',
      },
      boxShadow: {
        'card': 'none',
        'card-hover': 'rgba(0, 0, 0, 0.1) 0px 0px 10px 0px',
        'sidebar': 'none',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'slow-spin': 'spin 30s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}
