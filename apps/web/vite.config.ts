import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { stripAssetCrossorigin } from "./src/build/stripAssetCrossorigin";

const apiProxyTarget = process.env.VITE_API_PROXY_TARGET ?? "http://127.0.0.1:4000";

function stripAssetCrossoriginPlugin(): Plugin {
  return {
    name: "strip-asset-crossorigin",
    transformIndexHtml: {
      order: "post",
      handler: stripAssetCrossorigin,
    },
  };
}

export default defineConfig({
  plugins: [react(), stripAssetCrossoriginPlugin()],
  resolve: {
    alias: {
      "@brass-ledger/shared": path.resolve(__dirname, "../../packages/shared/src/index.ts"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: apiProxyTarget,
        changeOrigin: true,
      },
    },
  },
});
