import test from "node:test";
import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const script = fileURLToPath(new URL("./validate-generated-assets.mjs", import.meta.url));

async function withGeneratedAssets(files, run) {
  const root = await mkdtemp(path.join(os.tmpdir(), "brass-ledger-assets-"));
  const generated = path.join(root, "assets", "generated");
  try {
    await mkdir(generated, { recursive: true });
    await Promise.all(Object.entries(files).map(([name, contents]) => writeFile(path.join(generated, name), contents)));
    return await run(root);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

function validate(cwd) {
  return spawnSync(process.execPath, [script], { cwd, encoding: "utf8" });
}

test("generated asset validation rejects a bitmap without provenance before packaging", async () => {
  await withGeneratedAssets({ "untracked.png": "not-a-real-png" }, (root) => {
    const result = validate(root);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /require assets\/generated\/manifest\.json/);
  });
});

test("generated asset validation rejects stale provenance before packaging", async () => {
  const manifest = JSON.stringify([{
    fileName: "removed.webp",
    licenseStatus: "approved-for-commercial-use",
    reviewer: "reviewer",
    provider: "provider",
    model: "model",
    modelVersion: "version",
    promptHash: "prompt",
    negativePromptHash: "negative",
    seed: "seed",
  }]);
  await withGeneratedAssets({ "manifest.json": manifest }, (root) => {
    const result = validate(root);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /stale provenance for missing asset removed\.webp/);
  });
});
