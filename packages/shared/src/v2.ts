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

/**
 * The deliberately small state surface owned by the order contract.  Later
 * issues add world, belief, commitments, and consequences as separate fields;
 * none of those may be smuggled into this root before their contracts exist.
 */
export const v2BootstrapStateSchema = z.object({
  cycle: z.number().int().min(1),
  seed: z.string().min(1),
}).strict();
export type V2BootstrapState = z.infer<typeof v2BootstrapStateSchema>;

/** Fixed named owners keep delegation legible without making it UI-owned. */
export const v2OfficerSchema = z.enum(["intelligence", "operations", "political"]);
export type V2Officer = z.infer<typeof v2OfficerSchema>;

/**
 * Content supplies these trusted agenda definitions.  They are intentionally
 * not a player command payload: a browser may submit dispositions only.
 */
export const v2AgendaOrderSchema = z.object({
  id: z.string().min(1),
}).strict();
export type V2AgendaOrder = z.infer<typeof v2AgendaOrderSchema>;

export const v2AgendaIssueSchema = z.object({
  id: z.string().min(1),
  responsibleOfficer: v2OfficerSchema,
  recommendedOrderId: z.string().min(1),
  /** Exactly one staff recommendation plus one or two authored alternatives. */
  authoredOrders: z.array(v2AgendaOrderSchema).min(2).max(3),
  mayDefer: z.boolean(),
}).strict();
export type V2AgendaIssue = z.infer<typeof v2AgendaIssueSchema>;

export const v2DelegateDispositionSchema = z.object({
  issueId: z.string().min(1),
  kind: z.literal("delegate"),
}).strict();
export const v2InterveneDispositionSchema = z.object({
  issueId: z.string().min(1),
  kind: z.literal("intervene"),
  orderId: z.string().min(1),
}).strict();
export const v2DeferDispositionSchema = z.object({
  issueId: z.string().min(1),
  kind: z.literal("defer"),
}).strict();
export const v2IssueDispositionSchema = z.discriminatedUnion("kind", [
  v2DelegateDispositionSchema,
  v2InterveneDispositionSchema,
  v2DeferDispositionSchema,
]);
export type V2IssueDisposition = z.infer<typeof v2IssueDispositionSchema>;

/** One all-or-nothing cycle command. Agenda order is verified by the sim. */
export const v2CommandSetSchema = z.object({
  cycle: z.number().int().min(1),
  expectedRevision: z.number().int().min(0),
  dispositions: z.array(v2IssueDispositionSchema),
}).strict();
export type V2CommandSet = z.infer<typeof v2CommandSetSchema>;

/** The authoritative result stored in the ledger, never supplied by a client. */
export const v2DelegatedFinalOrderSchema = z.object({
  issueId: z.string().min(1),
  responsibleOfficer: v2OfficerSchema,
  disposition: z.literal("delegate"),
  orderId: z.string().min(1),
  interventionCost: z.literal(0),
}).strict();
export const v2IntervenedFinalOrderSchema = z.object({
  issueId: z.string().min(1),
  responsibleOfficer: v2OfficerSchema,
  disposition: z.literal("intervene"),
  orderId: z.string().min(1),
  interventionCost: z.literal(1),
}).strict();
export const v2DeferredFinalOrderSchema = z.object({
  issueId: z.string().min(1),
  responsibleOfficer: v2OfficerSchema,
  disposition: z.literal("defer"),
  orderId: z.null(),
  interventionCost: z.literal(0),
}).strict();
export const v2FinalOrderSchema = z.discriminatedUnion("disposition", [
  v2DelegatedFinalOrderSchema,
  v2IntervenedFinalOrderSchema,
  v2DeferredFinalOrderSchema,
]);
export type V2FinalOrder = z.infer<typeof v2FinalOrderSchema>;

/**
 * Every entry carries its canonical input and output evidence. Future action
 * kinds must be explicitly discriminated rather than appended as opaque data.
 */
export const v2CommandSetLedgerEntrySchema = z.object({
  kind: z.literal("command-set"),
  commandSet: v2CommandSetSchema,
  finalOrders: z.array(v2FinalOrderSchema),
  interventionCost: z.number().int().min(0).max(2),
  preState: v2BootstrapStateSchema,
  postState: v2BootstrapStateSchema,
  preRevision: z.number().int().min(0),
  postRevision: z.number().int().min(0),
  preStateHash: sha256DigestSchema,
  postStateHash: sha256DigestSchema,
}).strict();
export type V2CommandSetLedgerEntry = z.infer<typeof v2CommandSetLedgerEntrySchema>;

export const v2ActionLedgerSchema = z.array(v2CommandSetLedgerEntrySchema);
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
