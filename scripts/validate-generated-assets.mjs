import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
const root = path.resolve(process.cwd(), "assets", "generated");
if (!existsSync(root)) { console.log("No generated bitmap assets to validate."); process.exit(0); }
const manifestPath = path.join(root, "manifest.json");
if (!existsSync(manifestPath)) throw new Error("Generated bitmap assets require assets/generated/manifest.json.");
const records = JSON.parse(readFileSync(manifestPath, "utf8"));
if (!Array.isArray(records)) throw new Error("Generated bitmap manifest must be an array.");
const byFile = new Map(records.map((record) => [record.fileName, record]));
const bitmaps = readdirSync(root).filter((file) => /\.(png|webp)$/i.test(file));
for (const file of bitmaps) { const record = byFile.get(file); if (!record) throw new Error(`Generated asset ${file} has no provenance record.`); if (record.licenseStatus !== "approved-for-commercial-use") throw new Error(`Generated asset ${file} is not approved for commercial release.`); if (!record.reviewer || !record.provider || !record.model || !record.modelVersion || !record.promptHash || !record.negativePromptHash || !record.seed) throw new Error(`Generated asset ${file} has incomplete provenance.`); }
console.log(`Validated ${bitmaps.length} release-ready generated bitmap asset(s).`);
