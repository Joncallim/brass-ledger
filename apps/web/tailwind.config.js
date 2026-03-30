export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#091217",
        panel: "#0f1d24",
        ink: "#d7e2dc",
        accent: "#c9a227",
        muted: "#86a3a0",
        danger: "#d46a5b",
      },
      fontFamily: {
        sans: ["'IBM Plex Sans'", "system-ui", "sans-serif"],
        display: ["'Space Grotesk'", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

