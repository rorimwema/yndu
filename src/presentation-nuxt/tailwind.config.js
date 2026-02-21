/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './app/**/*.{vue,js,ts,jsx,tsx}',
    './nuxt.config.{js,ts}',
  ],
  theme: {
    extend: {
      colors: {
        // Semantic colors for shadcn/ui compatibility
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // AgTech Prestige Palette
        'canvas': '#F0EEE9',
        'foundation': '#101417',
        'primary-deep': '#2D4746',
        'secondary-sage': '#9CAF88',
        'accent-clay': '#B36D4F',
        'neutral-50': '#F5F4F0',
        'neutral-100': '#E8E6E1',
        'neutral-200': '#D5D2CC',
        'neutral-300': '#B8B4AD',
        'neutral-400': '#8A867F',
        'neutral-500': '#6B6860',
        'neutral-600': '#4A4843',
        'neutral-700': '#2E2D2A',
        'neutral-800': '#1D1C1A',
        'neutral-900': '#101417',
        // Legacy aliases for backward compat during migration
        'flexoki-bg': '#F0EEE9',
        'flexoki-primary': '#2D4746',
        'flexoki-warning': '#B36D4F',
        'flexoki-black': '#101417',
        'flexoki-paper': '#ffffff',
        'flexoki-50': '#F5F4F0',
        'flexoki-100': '#E8E6E1',
        'flexoki-150': '#D5D2CC',
        'flexoki-200': '#D5D2CC',
        'flexoki-300': '#B8B4AD',
        'flexoki-400': '#8A867F',
        'flexoki-500': '#6B6860',
        'flexoki-600': '#4A4843',
        'flexoki-700': '#2E2D2A',
        'flexoki-800': '#1D1C1A',
        'flexoki-850': '#1D1C1A',
        'flexoki-900': '#101417',
        'flexoki-950': '#101417',
        'flexoki-muted': '#8A867F',
      },
      fontFamily: {
        sans: ['"Instrument Sans"', 'sans-serif'],
        serif: ['"Instrument Serif"', 'serif'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      transitionTimingFunction: {
        'prestige': 'cubic-bezier(0.2, 0, 0, 1)',
      },
      transitionDuration: {
        'smooth': '200ms',
      },
    },
  },
  plugins: [],
  darkMode: 'class',
};
