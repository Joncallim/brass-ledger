import { existsSync } from "node:fs";
import path from "node:path";
import http from "node:http";
import { fileURLToPath } from "node:url";
import { app as electronApp, BrowserWindow, utilityProcess } from "electron";

const moduleDir = path.dirname(fileURLToPath(import.meta.url));

function findFreePort(startPort = 4000) {
  return new Promise((resolve, reject) => {
    let port = startPort;
    const maxPort = startPort + 20;
    function tryNext() {
      if (port > maxPort) return reject(new Error("No free port found in range 4000-4020"));
      const srv = http.createServer();
      srv.on("error", () => { srv.close(); port += 1; tryNext(); });
      srv.listen(port, "127.0.0.1", () => {
        srv.close(() => resolve(port));
      });
    }
    tryNext();
  });
}

function waitForHealth(port, timeoutMs = 30000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    function check() {
      if (Date.now() - start > timeoutMs) {
        return reject(new Error(`Server did not become healthy within ${timeoutMs}ms`));
      }
      const req = http.get(`http://127.0.0.1:${port}/api/health`, (res) => {
        let data = "";
        res.on("data", (d) => { data += d; });
        res.on("end", () => {
          try {
            if (JSON.parse(data).ok) return resolve(port);
          } catch {}
          setTimeout(check, 400);
        });
      });
      req.on("error", () => setTimeout(check, 400));
      req.setTimeout(2000, () => { req.destroy(); setTimeout(check, 400); });
    }
    check();
  });
}

function resolveServerBundle() {
  const candidates = [
    path.join(moduleDir, "server", "index.js"),
    path.join(moduleDir, "..", "release", "server", "index.js"),
    path.join(moduleDir, "..", "apps", "server", "dist", "index.js"),
  ];
  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate;
  }
  throw new Error("Server bundle not found. Run npm run release first.");
}

function resolveWebDist() {
  const candidates = [
    path.join(moduleDir, "web"),
    path.join(moduleDir, "..", "release", "web"),
    path.join(moduleDir, "..", "apps", "web", "dist"),
  ];
  for (const candidate of candidates) {
    if (existsSync(path.join(candidate, "index.html"))) return candidate;
  }
  throw new Error("Web dist not found. Run npm run release or npm run build first.");
}

let serverProcess = null;

async function startServer(port) {
  const bundlePath = resolveServerBundle();
  const webDistPath = resolveWebDist();

  serverProcess = utilityProcess.fork(bundlePath, [], {
    env: {
      ...process.env,
      PORT: String(port),
      HOST: "127.0.0.1",
      BRASS_LEDGER_WEB_DIST_DIR: webDistPath,
    },
    stdio: "pipe",
    serviceName: "Brass Ledger Server",
  });

  serverProcess.stdout?.on("data", (chunk) => process.stdout.write(chunk));
  serverProcess.stderr?.on("data", (chunk) => process.stderr.write(chunk));

  serverProcess.on("exit", (code) => {
    serverProcess = null;
    if (code !== 0 && code !== null) {
      console.error(`Server exited with code ${code}`);
    }
  });

  await waitForHealth(port);
  return port;
}

function stopServer() {
  if (serverProcess) {
    serverProcess.kill();
    serverProcess = null;
  }
}

async function main() {
  await electronApp.whenReady();

  const port = await findFreePort(4000);
  await startServer(port);

  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 960,
    minHeight: 640,
    title: "Brass Ledger",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
  });

  const appUrl = `http://127.0.0.1:${port}/`;
  const appOrigin = new URL(appUrl).origin;
  win.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
  win.webContents.on("will-navigate", (event, targetUrl) => {
    if (new URL(targetUrl).origin !== appOrigin) event.preventDefault();
  });

  win.on("closed", () => {
    stopServer();
  });

  await win.loadURL(appUrl);

  electronApp.on("window-all-closed", () => {
    stopServer();
    electronApp.quit();
  });

  electronApp.on("before-quit", () => {
    stopServer();
  });
}

main().catch((error) => {
  console.error("Failed to start Brass Ledger desktop:", error);
  stopServer();
  electronApp.quit();
  process.exit(1);
});
