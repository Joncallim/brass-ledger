import { cp, mkdir, rename, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const moduleDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(moduleDir, "..");
const releaseDir = path.join(rootDir, "release");
const stagingDir = path.join(rootDir, "release-staging");
const backupDir = path.join(rootDir, "release-backup");

const serverSrc = path.join(rootDir, "apps/server/dist/index.js");
const webSrc = path.join(rootDir, "apps/web/dist");
const cliSrc = path.join(rootDir, "apps/cli/dist/index.js");
const desktopDir = path.join(rootDir, "desktop");
const desktopMain = path.join(desktopDir, "main.mjs");
const desktopPackage = path.join(desktopDir, "package.json");
const desktopLockfile = path.join(desktopDir, "package-lock.json");

function assertFile(label, filePath) {
  if (!existsSync(filePath)) {
    console.error(`Missing ${label}: ${filePath}`);
    process.exit(1);
  }
}

assertFile("server bundle", serverSrc);
assertFile("web dist", webSrc);
assertFile("cli bundle", cliSrc);
assertFile("desktop wrapper", desktopMain);
assertFile("desktop package template", desktopPackage);
assertFile("desktop dependency lockfile", desktopLockfile);

// Stage into a temp directory then atomically replace, preserving saves
await rm(stagingDir, { recursive: true, force: true });
await mkdir(stagingDir, { recursive: true });
await mkdir(path.join(stagingDir, "server"), { recursive: true });
await mkdir(path.join(stagingDir, "cli"), { recursive: true });

await cp(serverSrc, path.join(stagingDir, "server/index.js"));
await cp(webSrc, path.join(stagingDir, "web"), { recursive: true });
await cp(cliSrc, path.join(stagingDir, "cli/brass-ledger"));

await cp(desktopMain, path.join(stagingDir, "main.mjs"));
await cp(desktopPackage, path.join(stagingDir, "package.json"));
await cp(desktopLockfile, path.join(stagingDir, "package-lock.json"));

console.log("Installing production dependencies...");
execFileSync("npm", ["ci", "--omit=dev", "--ignore-scripts"], {
  cwd: stagingDir,
  stdio: "inherit",
});

const startScript = `#!/usr/bin/env bash
set -euo pipefail

RELEASE_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$RELEASE_DIR"

export BRASS_LEDGER_WEB_DIST_DIR="$RELEASE_DIR/web"

PORT="\${PORT:-4000}"
HOST="\${HOST:-127.0.0.1}"

echo "Brass Ledger starting on http://\${HOST}:\${PORT}/"
echo "Saves: \${BRASS_LEDGER_SAVE_DIR:-per-user app data directory}"
echo "Web client: \${BRASS_LEDGER_WEB_DIST_DIR}"

exec node server/index.js
`;

const startPath = path.join(stagingDir, "start.sh");
await writeFile(startPath, startScript, { mode: 0o755 });

// Preserve existing saves from the old release directory
const oldSaves = path.join(releaseDir, "saves");
const newSaves = path.join(stagingDir, "saves");
if (existsSync(oldSaves)) {
  await cp(oldSaves, newSaves, { recursive: true });
  console.log("Migrated existing saves from previous release.");
}

// Replace the old release without discarding the last known-good artifact if
// the final rename fails.
await rm(backupDir, { recursive: true, force: true });
let previousReleaseMoved = false;
try {
  if (existsSync(releaseDir)) {
    await rename(releaseDir, backupDir);
    previousReleaseMoved = true;
  }
  await rename(stagingDir, releaseDir);
} catch (error) {
  if (previousReleaseMoved && !existsSync(releaseDir)) {
    await rename(backupDir, releaseDir);
  }
  throw error;
}
await rm(backupDir, { recursive: true, force: true });

console.log("Release assembled at %s", releaseDir);
console.log("  server/  %s", path.join(releaseDir, "server/index.js"));
console.log("  web/     %s", path.join(releaseDir, "web"));
console.log("  cli/     %s", path.join(releaseDir, "cli/brass-ledger"));
console.log("  main.mjs %s", path.join(releaseDir, "main.mjs"));
console.log("  start.sh %s", path.join(releaseDir, "start.sh"));
console.log();
console.log("Server:");
console.log("  cd release && ./start.sh");
console.log("  cd release && PORT=4001 ./start.sh");
console.log();
console.log("CLI (headless):");
console.log("  node release/cli/brass-ledger --turns 3");
console.log();
console.log("Desktop (requires Electron):");
console.log("  cd release && npm ci && npm start");
console.log("  cd release && npm run package  # packaged app in dist/");
