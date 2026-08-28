import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export const generatedAssetLicenseStatuses = ["prototype-only", "approved-for-commercial-use", "rejected"] as const;
export type GeneratedAssetLicenseStatus = typeof generatedAssetLicenseStatuses[number];

/** Metadata deliberately lives beside generated files, never in campaign saves. */
export type GeneratedAssetRecord = { assetId: string; subjectId: string; provider: string; model: string; modelVersion: string; generatedAt: string; promptHash: string; negativePromptHash: string; seed: string; licenseStatus: GeneratedAssetLicenseStatus; reviewer: string | null; notes: string; fileName: string };
export type BitmapGenerationRequest = { assetId: string; subjectId: string; deterministicSeed: string; prompt: string; negativePrompt: string; fileExtension?: "png" | "webp" };
export type BitmapGenerationProvider = { provider: string; model: string; modelVersion: string; generate(request: BitmapGenerationRequest): Promise<Uint8Array> };
export type BitmapGenerationResult = { status: "disabled" } | { status: "cache-hit" | "generated"; record: GeneratedAssetRecord; filePath: string };

function hash(value: string) { return createHash("sha256").update(value).digest("hex"); }
function assertSafeFileName(fileName: string) {
  if (!/^[a-z0-9][a-z0-9._-]*\.(png|webp)$/i.test(fileName) || fileName.includes("..")) throw new Error(`Unsafe generated asset filename: ${fileName}`);
}
function assertSafeAssetId(assetId: string) {
  if (!/^[a-z0-9][a-z0-9_-]*$/i.test(assetId)) throw new Error(`Unsafe generated asset id: ${assetId}`);
}
function assertRecord(record: GeneratedAssetRecord) {
  if (!record.assetId || !record.subjectId || !record.provider || !record.model || !record.modelVersion) throw new Error("Generated asset records require an id, subject, provider, model, and model version.");
  if (!generatedAssetLicenseStatuses.includes(record.licenseStatus)) throw new Error(`Unknown generated asset license status: ${record.licenseStatus}`);
  assertSafeFileName(record.fileName);
}

export class FileBitmapAssetPipeline {
  constructor(private readonly rootDir: string) {}
  private recordsPath() { return path.join(this.rootDir, "manifest.json"); }
  async records(): Promise<GeneratedAssetRecord[]> {
    try {
      const parsed: unknown = JSON.parse(await readFile(this.recordsPath(), "utf8"));
      if (!Array.isArray(parsed)) throw new Error("Generated asset manifest must be an array.");
      parsed.forEach((entry) => assertRecord(entry as GeneratedAssetRecord));
      return parsed as GeneratedAssetRecord[];
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
      throw error;
    }
  }
  async generate(request: BitmapGenerationRequest, provider: BitmapGenerationProvider, enabled = false): Promise<BitmapGenerationResult> {
    if (!enabled) return { status: "disabled" };
    assertSafeAssetId(request.assetId);
    const extension = request.fileExtension ?? "png";
    const promptHash = hash(request.prompt), negativePromptHash = hash(request.negativePrompt), records = await this.records();
    const cached = records.find((record) => record.assetId === request.assetId && record.subjectId === request.subjectId && record.fileName.endsWith(`.${extension}`) && record.seed === request.deterministicSeed && record.promptHash === promptHash && record.negativePromptHash === negativePromptHash && record.provider === provider.provider && record.model === provider.model && record.modelVersion === provider.modelVersion);
    if (cached) return { status: "cache-hit", record: cached, filePath: path.join(this.rootDir, cached.fileName) };
    const fileName = `${request.assetId}-${promptHash.slice(0, 16)}.${extension}`;
    assertSafeFileName(fileName);
    const record: GeneratedAssetRecord = { assetId: request.assetId, subjectId: request.subjectId, provider: provider.provider, model: provider.model, modelVersion: provider.modelVersion, generatedAt: new Date().toISOString(), promptHash, negativePromptHash, seed: request.deterministicSeed, licenseStatus: "prototype-only", reviewer: null, notes: "Generated through the opt-in bitmap pipeline; commercial review required before shipping.", fileName };
    await mkdir(this.rootDir, { recursive: true });
    await writeFile(path.join(this.rootDir, fileName), await provider.generate(request));
    await writeFile(this.recordsPath(), `${JSON.stringify([...records, record], null, 2)}\n`, "utf8");
    return { status: "generated", record, filePath: path.join(this.rootDir, fileName) };
  }
}

/** Throws when an asset set is incomplete, unreviewed, rejected, or malformed. */
export function assertReleaseReadyGeneratedAssets(records: readonly GeneratedAssetRecord[], referencedFileNames: readonly string[]) {
  const byFile = new Map(records.map((record) => [record.fileName, record]));
  for (const record of records) assertRecord(record);
  for (const fileName of referencedFileNames) {
    const record = byFile.get(fileName);
    if (!record) throw new Error(`Generated asset ${fileName} has no provenance record.`);
    if (record.licenseStatus !== "approved-for-commercial-use") throw new Error(`Generated asset ${fileName} is ${record.licenseStatus}; only approved assets may ship.`);
  }
}
