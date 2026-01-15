/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#6b7bff", // Cool Indigo
          foreground: "#ffffff",
          soft: "#dfe4ff",
          hover: "#5c6df0",
        },
        accent: {
          DEFAULT: "#22d3ee", // Cyan
          soft: "#cff7ff",
          foreground: "#062b35",
        },
        background: {
          DEFAULT: "#eef3ff",
          dark: "#0a1220",
        },
        surface: {
          DEFAULT: "#ffffff",
          dark: "#0f172a",
          muted: "#eef2f7",
          mutedDark: "#111b2f",
        },
        border: {
          DEFAULT: "#e3e7f1",
          dark: "#1e293b",
        },
        danger: {
          DEFAULT: "#ef4444",
          soft: "#fee2e2",
        },
        success: {
          DEFAULT: "#22c55e",
          soft: "#dcfce7",
        },
      },
      borderRadius: {
        lg: "14px",
        xl: "1rem",
        "2xl": "1.25rem",
        pill: "999px",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fadeIn 240ms ease-out",
        "fade-in-up": "fadeInUp 240ms ease-out",
      },
      boxShadow: {
        soft: "0 10px 30px rgba(15, 23, 42, 0.08)",
        lifted: "0 16px 40px rgba(0, 0, 0, 0.18)",
      },
    },
  },
  plugins: [],
};
