/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: ["class"],
  theme: {
    extend: {
      colors: {
        bg: "#F8FAFC",
        bgElevated: "#FFFFFF",
        surface: "#FFFFFF",
        surface2: "#F1F5F9",
        surfaceHover: "#E2E8F0",
        border: "#E2E8F0",
        textMain: "#0F172A",
        textDim: "#475569",
        textFaint: "#64748B",
        cyan: "#0284C7",
        violet: "#7C3AED",
        amber: "#D97706",
        green: "#16A34A",
        red: "#DC2626",
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["Inter", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
    },
  },
  plugins: [],
};
