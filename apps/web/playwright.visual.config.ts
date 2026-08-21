import { defineConfig, devices } from "@playwright/test";

/**
 * Sprite 3 visual matrix config (issue #52, Q5): a deliberately webServer-free Playwright
 * project. The sprite matrix spec is page.setContent-only (generated data URIs), so it must
 * not trigger the full build + server boot that apps/web/playwright.config.ts starts. The
 * existing webServer project and its testDir (./e2e) are untouched; this config owns a
 * separate testDir (./e2e-visual) so the two never overlap.
 */
export default defineConfig({
  testDir: "./e2e-visual",
  timeout: 30_000,
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["line"], ["html", { open: "never" }]] : "list",
  use: {
    ...devices["Desktop Chrome"],
  },
  projects: [
    {
      name: "sprite-matrix",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
