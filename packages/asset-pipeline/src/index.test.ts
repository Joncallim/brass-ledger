import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { FileBitmapAssetPipeline, assertReleaseReadyGeneratedAssets, type GeneratedAssetRecord } from "./index.js";

test("bitmap generation is opt-in and caches an identical seed and prompt", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "brass-ledger-assets-")); let calls = 0;
  const provider = { provider: "test", model: "image", modelVersion: "1", async generate() { calls += 1; return new Uint8Array([137, 80, 78, 71]); } };
  const request = { assetId: "warden-calm", subjectId: "warden", deterministicSeed: "seed", prompt: "portrait", negativePrompt: "text" };
  try { const pipeline = new FileBitmapAssetPipeline(directory); assert.deepEqual(await pipeline.generate(request, provider), { status: "disabled" }); assert.equal((await pipeline.generate(request, provider, true)).status, "generated"); assert.equal((await pipeline.generate(request, provider, true)).status, "cache-hit"); assert.equal(calls, 1); assert.equal((await pipeline.records())[0]?.licenseStatus, "prototype-only"); } finally { await rm(directory, { recursive: true, force: true }); }
});
test("release provenance gate accepts approved records and rejects prototype or missing records", () => {
  const record: GeneratedAssetRecord = { assetId: "a", subjectId: "warden", provider: "test", model: "image", modelVersion: "1", generatedAt: "2026-01-01T00:00:00.000Z", promptHash: "a", negativePromptHash: "b", seed: "seed", licenseStatus: "approved-for-commercial-use", reviewer: "release", notes: "reviewed", fileName: "warden.png" };
  assert.doesNotThrow(() => assertReleaseReadyGeneratedAssets([record], ["warden.png"])); assert.throws(() => assertReleaseReadyGeneratedAssets([{ ...record, licenseStatus: "prototype-only" }], ["warden.png"])); assert.throws(() => assertReleaseReadyGeneratedAssets([], ["warden.png"]));
});

test("cache identity cannot cross subjects or formats, and output ids cannot traverse", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "brass-ledger-assets-")); let calls = 0;
  const provider = { provider: "test", model: "image", modelVersion: "1", async generate() { calls += 1; return new Uint8Array([1]); } };
  try {
    const pipeline = new FileBitmapAssetPipeline(directory);
    const base = { deterministicSeed: "seed", prompt: "same", negativePrompt: "same" };
    assert.equal((await pipeline.generate({ ...base, assetId: "warden-calm", subjectId: "warden" }, provider, true)).status, "generated");
    assert.equal((await pipeline.generate({ ...base, assetId: "halden-calm", subjectId: "halden" }, provider, true)).status, "generated");
    assert.equal((await pipeline.generate({ ...base, assetId: "warden-calm", subjectId: "warden", fileExtension: "webp" }, provider, true)).status, "generated");
    assert.equal(calls, 3);
    await assert.rejects(() => pipeline.generate({ ...base, assetId: "../outside", subjectId: "warden" }, provider, true));
  } finally { await rm(directory, { recursive: true, force: true }); }
});
