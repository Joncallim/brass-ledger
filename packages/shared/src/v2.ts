import { z } from "zod";

/**
 * V2 is deliberately a parallel save/replay format.  These contracts are
 * intentionally too small to express a command cycle: #96 owns orders and
 * #97 onward own state.  Rejecting unknown data here is safer than treating
 * unreviewed mechanics as opaque future payloads.
 */
export const v2RulesetTag = "v2" as const;
export const sha256DigestSchema = z.string().regex(/^[a-f0-9]{64}$/, "must be a lowercase SHA-256 digest");

export const v2IdentitySchema = z.object({
  ruleset: z.literal(v2RulesetTag),
  rulesetVersion: z.string().min(1),
  scenarioId: z.string().min(1),
  contentVersion: z.string().min(1),
  contentDigest: sha256DigestSchema,
}).strict();
export type V2Identity = z.infer<typeof v2IdentitySchema>;

/** The only V2 state legal before the turn/state-contract issues land. */
export const v2BootstrapStateSchema = z.object({
  cycle: z.literal(1),
  seed: z.string().min(1),
}).strict();
export type V2BootstrapState = z.infer<typeof v2BootstrapStateSchema>;

/**
 * A V2 ledger is required from its first save, but no V2 action is legal until
 * the authoritative order contract is implemented.  An explicit empty tuple
 * prevents a caller from smuggling an unvalidated action through this root.
 */
export const v2ActionLedgerSchema = z.tuple([]);
export type V2ActionLedger = z.infer<typeof v2ActionLedgerSchema>;

export const v2SessionSchema = z.object({
  id: z.string().min(1),
  campaignId: z.string().min(1),
  revision: z.number().int().min(0),
  identity: v2IdentitySchema,
  initialState: v2BootstrapStateSchema,
  state: v2BootstrapStateSchema,
  actionLedger: v2ActionLedgerSchema,
  initialStateDigest: sha256DigestSchema,
  finalStateDigest: sha256DigestSchema,
  updatedAt: z.string().datetime(),
}).strict();
export type V2Session = z.infer<typeof v2SessionSchema>;

export const v2SessionExportSchema = z.object({
  exportedAt: z.string().datetime(),
  session: v2SessionSchema,
}).strict();
export type V2SessionExport = z.infer<typeof v2SessionExportSchema>;

/**
 * Dispatch is based on an explicit V2 discriminator.  V1 has no discriminator
 * by design and remains parsed by its legacy schema; this helper must be called
 * before it so V2 cannot be silently stripped into a V1-shaped object.
 */
export function isV2SessionPayload(value: unknown): value is { identity?: { ruleset?: unknown } } {
  return typeof value === "object" && value !== null
    && "identity" in value
    && typeof (value as { identity?: unknown }).identity === "object"
    && (value as { identity?: { ruleset?: unknown } }).identity?.ruleset === v2RulesetTag;
}

export function isV2ExportPayload(value: unknown): value is { session?: unknown } {
  return typeof value === "object" && value !== null
    && "session" in value
    && isV2SessionPayload((value as { session?: unknown }).session);
}
