import { defineConfig, devices } from "@playwright/test";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const webDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(webDir, "../..");
const port = 4479;
const saveDir = mkdtempSync(path.join(tmpdir(), "brass-ledger-e2e-"));

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["line"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run build --workspace @brass-ledger/web && npm run start --workspace @brass-ledger/server",
    cwd: repoRoot,
    url: `http://127.0.0.1:${port}/api/health`,
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      BRASS_LEDGER_WEB_DIST_DIR: path.join(webDir, "dist"),
      BRASS_LEDGER_SAVE_DIR: saveDir,
      PORT: String(port),
      HOST: "127.0.0.1",
      CORS_ORIGINS: `http://127.0.0.1:${port}`,
      NODE_ENV: "test",
    },
  },
});
