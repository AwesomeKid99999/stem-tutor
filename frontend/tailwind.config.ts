import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        dyslexic: ['OpenDyslexic', 'Comic Sans MS', 'cursive'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          glow: "hsl(var(--primary-glow))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
          glow: "hsl(var(--accent-glow))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Gamification colors
        xp: "hsl(var(--xp-bar))",
        level: "hsl(var(--level-badge))",
        streak: "hsl(var(--streak-fire))",
      },
      backgroundImage: {
        'gradient-cosmic': 'var(--gradient-cosmic)',
        'gradient-nebula': 'var(--gradient-nebula)',
        'gradient-constellation': 'var(--gradient-constellation)',
      },
      boxShadow: {
        'cosmic': 'var(--shadow-cosmic)',
        'soft': 'var(--shadow-soft)',
        'glow': 'var(--shadow-glow)',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "var(--radius-lg)",
        "2xl": "var(--radius-xl)",
      },
      spacing: {
        'grid': 'var(--spacing-grid)',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "cosmic-glow": {
          "0%, 100%": { boxShadow: "var(--shadow-cosmic)" },
          "50%": { boxShadow: "0 4px 30px hsl(240 100% 60% / 0.25)" },
        },
        "constellation-twinkle": {
          "0%, 100%": { opacity: "0.7", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.1)" },
        },
        "typing-dots": {
          "0%, 20%": { opacity: "0" },
          "50%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
        "xp-fill": {
          from: { width: "0%" },
          to: { width: "var(--xp-width)" },
        },
        "badge-bounce": {
          "0%": { transform: "scale(0) rotate(-12deg)" },
          "50%": { transform: "scale(1.1) rotate(-6deg)" },
          "100%": { transform: "scale(1) rotate(0deg)" },
        },
        "streak-fire": {
          "0%, 100%": { transform: "scale(1) rotate(-2deg)" },
          "25%": { transform: "scale(1.05) rotate(1deg)" },
          "75%": { transform: "scale(0.95) rotate(-1deg)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "cosmic-glow": "cosmic-glow 2s infinite",
        "constellation-twinkle": "constellation-twinkle 3s ease-in-out infinite",
        "typing-dots": "typing-dots 1.5s infinite",
        "xp-fill": "xp-fill 1.5s ease-out",
        "badge-bounce": "badge-bounce 0.6s ease-out",
        "streak-fire": "streak-fire 3s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
