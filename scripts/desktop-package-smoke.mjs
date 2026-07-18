import { existsSync } from "node:fs";
import { mkdtemp, readdir, rm } from "node:fs/promises";
import { spawn } from "node:child_process";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distDir = path.join(rootDir, "release", "dist");

async function filesBelow(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const candidate = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await filesBelow(candidate));
    else files.push(candidate);
  }
  return files;
}

function unpackedExecutable(files) {
  if (process.platform === "darwin") {
    return files.find((file) => file.endsWith("Brass Ledger.app/Contents/MacOS/Brass Ledger"));
  }
  if (process.platform === "win32") {
    return files.find((file) => file.endsWith(path.join("win-unpacked", "Brass Ledger.exe")));
  }
  return files.find((file) =>
    file.includes(`${path.sep}linux-unpacked${path.sep}`) &&
    /^brass.*ledger/i.test(path.basename(file)) &&
    !path.basename(file).includes("."),
  );
}

function assertInstaller(files) {
  const installer = process.platform === "darwin"
    ? files.find((file) => file.endsWith(".dmg"))
    : process.platform === "win32"
      ? files.find((file) => file.endsWith(".exe") && !file.includes("win-unpacked"))
      : files.find((file) => file.endsWith(".AppImage"));
  if (!installer) throw new Error(`No platform installer found under ${distDir}`);
  console.log(`Installer: ${installer}`);
}

async function waitForHealth(timeoutMs = 30_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    for (let port = 4000; port <= 4020; port += 1) {
      try {
        const response = await fetch(`http://127.0.0.1:${port}/api/health`, {
          signal: AbortSignal.timeout(1_000),
        });
        if (response.ok && (await response.json()).ok === true) return port;
      } catch {}
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error("Packaged desktop server did not become healthy");
}

async function waitForSave(saveDir, timeoutMs = 10_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (existsSync(saveDir)) {
      const entries = await readdir(saveDir);
      if (entries.some((entry) => entry.endsWith(".json"))) return;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`Packaged desktop did not persist a session under ${saveDir}`);
}

async function waitForPortClosed(port, timeoutMs = 15_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      await fetch(`http://127.0.0.1:${port}/api/health`, {
        signal: AbortSignal.timeout(500),
      });
    } catch {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  throw new Error(`Utility server still owns port ${port} after the desktop window closed`);
}

const files = await filesBelow(distDir);
assertInstaller(files);
const executable = unpackedExecutable(files);
if (!executable) throw new Error(`No unpacked desktop executable found under ${distDir}`);
if (process.argv.includes("--package-only")) {
  console.log(`Unpacked executable: ${executable}`);
  process.exit(0);
}

const smokeRoot = await mkdtemp(path.join(os.tmpdir(), "brass-ledger-desktop-smoke-"));
const childEnv = { ...process.env };
delete childEnv.BRASS_LEDGER_SAVE_DIR;
childEnv.BRASS_LEDGER_DESKTOP_TEST_CLOSE_MS = "5000";

let expectedSaveDir;
if (process.platform === "win32") {
  childEnv.APPDATA = path.join(smokeRoot, "appdata");
  expectedSaveDir = path.join(childEnv.APPDATA, "Brass Ledger", "saves");
} else if (process.platform === "linux") {
  childEnv.XDG_DATA_HOME = path.join(smokeRoot, "xdg-data");
  expectedSaveDir = path.join(childEnv.XDG_DATA_HOME, "brass-ledger", "saves");
} else {
  childEnv.BRASS_LEDGER_SAVE_DIR = path.join(smokeRoot, "saves");
  expectedSaveDir = childEnv.BRASS_LEDGER_SAVE_DIR;
}

let child;
try {
  child = spawn(executable, [], { env: childEnv, stdio: ["ignore", "pipe", "pipe"] });
  child.stdout.on("data", (chunk) => process.stdout.write(chunk));
  child.stderr.on("data", (chunk) => process.stderr.write(chunk));
  const exited = new Promise((resolve) => child.once("exit", (code, signal) => resolve({ code, signal })));

  const port = await waitForHealth();
  const created = await fetch(`http://127.0.0.1:${port}/api/sessions`, { method: "POST" });
  if (!created.ok) throw new Error(`Session creation failed with HTTP ${created.status}`);
  await waitForSave(expectedSaveDir);

  const result = await Promise.race([
    exited,
    new Promise((_, reject) => setTimeout(() => reject(new Error("Desktop did not exit after its window closed")), 15_000)),
  ]);
  console.log(`Desktop exit: ${JSON.stringify(result)}`);
  await waitForPortClosed(port);
  console.log(`Platform save path: ${expectedSaveDir}`);
} finally {
  if (child?.exitCode === null && child?.signalCode === null) child.kill();
  await rm(smokeRoot, { recursive: true, force: true });
}
