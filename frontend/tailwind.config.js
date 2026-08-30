/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Clean, legible government-portal stack — no decorative serifs
        sans: ['"Inter"', '"Noto Sans"', 'system-ui', 'sans-serif'],
      },
      colors: {
        // ── Primary Shell (dark navy/slate) ──
        shell: {
          950: '#0B0F1A', // Deepest navy — app background
          900: '#111827', // Sidebar background
          800: '#1E2639', // Sidebar hover / secondary panels
          700: '#2D3748', // Dividers and borders
          600: '#4A5568', // Muted text on dark bg
        },
        // ── Content Area (crisp white/light gray) ──
        surface: {
          50:  '#F9FAFB', // Lightest page bg
          100: '#F3F4F6', // Card bg
          200: '#E5E7EB', // Borders/dividers in light context
          300: '#D1D5DB', // Muted text on light bg
        },
        // ── Brand accent (keep a touch of gold/amber for official feel) ──
        brand: {
          400: '#FBBF24', // Bright amber — active tabs, highlights
          500: '#F59E0B', // Primary amber — buttons
          600: '#D97706', // Hover states
        },
        // ── Compliance status colours ──
        pass:  { DEFAULT: '#16A34A', light: '#DCFCE7', border: '#BBF7D0' },
        warn:  { DEFAULT: '#D97706', light: '#FEF3C7', border: '#FDE68A' },
        fail:  { DEFAULT: '#DC2626', light: '#FEE2E2', border: '#FECACA' },
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)',
        'card-hover': '0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.06)',
        'sidebar': 'inset -1px 0 0 rgba(255,255,255,0.05)',
      },
    },
  },
  plugins: [],
}
