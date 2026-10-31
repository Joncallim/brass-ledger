import { defineConfig } from "vite";

// Phaser is one ~1.2 MB module; splitting it buys nothing for a prototype.
export default defineConfig({ base: "./", build: { chunkSizeWarningLimit: 1600 } });
