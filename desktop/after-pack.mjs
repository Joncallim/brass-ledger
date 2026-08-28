import { existsSync } from "node:fs";
import { rename } from "node:fs/promises";
import path from "node:path";

// macOS 26 arm64 exposes an electron-builder 26.x packaging regression: the
// builder renames Electron's helper bundles but leaves the Electron executable
// looking for its original `Electron Helper*.app` names.  Restore both the
// helper app and executable names before signing/DMG creation.  This runs only
// for macOS and preserves the visible Brass Ledger product name.
export default async function restoreElectronHelperNames({ appOutDir, packager }) {
  if (packager.platform.name !== "mac") return;

  const product = packager.appInfo.productFilename;
  const frameworksDir = path.join(appOutDir, `${product}.app`, "Contents", "Frameworks");
  const suffixes = ["", " (GPU)", " (Plugin)", " (Renderer)"];

  for (const suffix of suffixes) {
    const oldName = `${product} Helper${suffix}`;
    const newName = `Electron Helper${suffix}`;
    const sourceApp = path.join(frameworksDir, `${oldName}.app`);
    const targetApp = path.join(frameworksDir, `${newName}.app`);
    if (!existsSync(sourceApp) || existsSync(targetApp)) continue;

    await rename(sourceApp, targetApp);
    const sourceBinary = path.join(targetApp, "Contents", "MacOS", oldName);
    const targetBinary = path.join(targetApp, "Contents", "MacOS", newName);
    if (existsSync(sourceBinary)) await rename(sourceBinary, targetBinary);
  }
}
