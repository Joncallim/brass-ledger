import { existsSync } from "node:fs";
import { readdir, rename } from "node:fs/promises";
import path from "node:path";

// macOS 26 arm64 exposes an electron-builder 26.x packaging regression: the
// builder renames Electron's helper bundles but leaves the Electron executable
// looking for its original `Electron Helper*.app` names.  Restore both the
// helper app and executable names before signing/DMG creation.  This runs only
// for macOS and preserves the visible Brass Ledger product name.
export default async function restoreElectronHelperNames({ appOutDir, packager }) {
  if (packager.platform.name !== "mac") return;

  const productApp = `${packager.appInfo.productFilename}.app`;
  const frameworksDir = path.join(appOutDir, productApp, "Contents", "Frameworks");
  if (!existsSync(frameworksDir)) return;

  // electron-builder may derive helpers from productName or executableName;
  // discover the staged bundles instead of assuming which name won.
  const helpers = (await readdir(frameworksDir, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory() && / Helper(?: \([^)]*\))?\.app$/.test(entry.name) && !entry.name.startsWith("Electron Helper"));

  for (const helper of helpers) {
    const oldName = helper.name.slice(0, -".app".length);
    const suffix = oldName.slice(oldName.indexOf(" Helper") + " Helper".length);
    const newName = `Electron Helper${suffix}`;
    const sourceApp = path.join(frameworksDir, helper.name);
    const targetApp = path.join(frameworksDir, `${newName}.app`);
    if (!existsSync(sourceApp) || existsSync(targetApp)) continue;

    await rename(sourceApp, targetApp);
    const sourceBinary = path.join(targetApp, "Contents", "MacOS", oldName);
    const targetBinary = path.join(targetApp, "Contents", "MacOS", newName);
    if (existsSync(sourceBinary)) await rename(sourceBinary, targetBinary);
  }
}
