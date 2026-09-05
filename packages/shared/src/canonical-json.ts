import { createHash } from "node:crypto";

/**
 * Stable JSON encoding for V2 replay evidence.
 *
 * Objects are key-sorted (UTF-16 code unit comparison, never locale-dependent),
 * undefined values are omitted, non-finite numbers are rejected.
 * This must reproduce the existing #99 canonical semantics byte-for-byte.
 */
export function canonicalV2Json(value: unknown): string {
  if (value === null) return "null";
  if (typeof value === "string" || typeof value === "boolean") return JSON.stringify(value);
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new TypeError("V2 canonical JSON does not permit non-finite numbers.");
    return JSON.stringify(Object.is(value, -0) ? 0 : value);
  }
  if (Array.isArray(value)) return `[${value.map(canonicalV2Json).join(",")}]`;
  if (typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>)
      .filter(([, entry]) => entry !== undefined)
      // Deliberately compare UTF-16 code units, never the process locale. JSON
      // strings preserve those code units, so this remains stable on every host.
      .sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0))
      .map(([key, entry]) => `${JSON.stringify(key)}:${canonicalV2Json(entry)}`)
      .join(",")}}`;
  }
  throw new TypeError("V2 canonical JSON does not permit unsupported values.");
}

/** SHA-256 digest of canonical V2 JSON representation. */
export function v2Sha256(value: unknown): string {
  return createHash("sha256").update(canonicalV2Json(value)).digest("hex");
}
