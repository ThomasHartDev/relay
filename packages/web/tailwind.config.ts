import type { Config } from "tailwindcss";
import tailwindAnimate from "tailwindcss-animate";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef4ff",
          100: "#d9e5ff",
          200: "#bbd2ff",
          300: "#8db6ff",
          400: "#588dff",
          500: "#3366ff",
          600: "#1b44f5",
          700: "#1433e1",
          800: "#172cb6",
          900: "#192a8f",
          950: "#141b57",
        },
        stage: {
          prospect: "#6366F1",
          qualified: "#3B82F6",
          proposal: "#8B5CF6",
          negotiation: "#F97316",
          won: "#22C55E",
          lost: "#EF4444",
        },
        status: {
          lead: "#0EA5E9",
          "contact-prospect": "#6366F1",
          customer: "#22C55E",
          churned: "#EF4444",
          archived: "#6B7280",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)",
        "card-hover": "0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.05)",
      },
      keyframes: {
        "skeleton-pulse": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.4" },
        },
      },
      animation: {
        "skeleton-pulse": "skeleton-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [tailwindAnimate],
};

export default config;
