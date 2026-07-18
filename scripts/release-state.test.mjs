import test from "node:test";
import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { recoverInterruptedRelease } from "./release-state.mjs";

test("recovers an interrupted replacement without deleting the last-known-good release", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "brass-ledger-release-state-"));
  const releaseDir = path.join(root, "release");
  const backupDir = path.join(root, "release-backup");

  try {
    await mkdir(backupDir);
    await writeFile(path.join(backupDir, "known-good.txt"), "preserved", "utf8");

    assert.equal(await recoverInterruptedRelease(releaseDir, backupDir), true);
    assert.equal(await readFile(path.join(releaseDir, "known-good.txt"), "utf8"), "preserved");
    await assert.rejects(() => readFile(path.join(backupDir, "known-good.txt"), "utf8"), {
      code: "ENOENT",
    });
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("leaves a stale backup alone while a release is present", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "brass-ledger-release-state-"));
  const releaseDir = path.join(root, "release");
  const backupDir = path.join(root, "release-backup");

  try {
    await mkdir(releaseDir);
    await mkdir(backupDir);

    assert.equal(await recoverInterruptedRelease(releaseDir, backupDir), false);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
