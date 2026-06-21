export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#091217",
        panel: "#0f1d24",
        accent: "#d4af37",
        muted: "#8aa39d",
        danger: "#e58072",
        // Stage 6 multi-screen semantic tokens, mapped onto the
        // command-console dark palette (see styles.css :root vars).
        paper: { DEFAULT: "#0f1d24", dark: "#091217" },
        ink: { DEFAULT: "#e6efe9", muted: "#8aa39d" },
        border: { DEFAULT: "#21343d", strong: "#2d4651" },
        brass: { DEFAULT: "#d4af37", light: "#e2c258", muted: "#a3841f" },
        olive: { DEFAULT: "#8a9a5b", light: "#a4b378" },
        escalation: { DEFAULT: "#e58072", muted: "#b85b4f" },
        recovery: { DEFAULT: "#6cc08c", muted: "#4f9468" },
        intel: { DEFAULT: "#5b9bd4", muted: "#3f7aab" },
      },
      fontFamily: {
        sans: ["'IBM Plex Sans'", "system-ui", "sans-serif"],
        display: ["'Space Grotesk'", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

