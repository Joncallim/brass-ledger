import { existsSync } from "node:fs";
import { rename } from "node:fs/promises";

/**
 * Restore the last-known-good release left behind when both the final staging
 * rename and its immediate rollback failed. The backup remains untouched if
 * restoration fails, so a later retry cannot destroy the only good artifact.
 */
export async function recoverInterruptedRelease(releaseDir, backupDir) {
  if (!existsSync(backupDir) || existsSync(releaseDir)) {
    return false;
  }

  await rename(backupDir, releaseDir);
  return true;
}
