/**
 * #101 - persistent Kestrel consequences and irreversible source use.
 *
 * Implements: 25-KESTREL-CONSEQUENCE-MATRIX sections 2-13 and 17 (state,
 * derived availability, provenance facts, C1-C5 transitions, source use),
 * 39-KESTREL-CROSS-SYSTEM-COMPOSITION sections 4-5, 7, 10-11 (promise scope,
 * C2/C5 atomic composition, ordinal aggregation) and 37A (the reverse
 * Ravellan observations that 25 section 17 requires the `command-set`
 * resolver to apply atomically).
 *
 * This is a pure function of (cycle, pre-command records, the complete final
 * order set, trusted history). It is not a generic consequence framework: it
 * only knows the concrete Kestrel order IDs of 36-KESTREL-AGENDA-COURSE-MATRIX.
 * Every effect derives from the whole final-order SET, so issue/array order
 * can never change the result. Contributions are summed per field and clamped
 * once from the pre-command state.
 */

import {
  v2AttributionSourceUseSchema,
  type V2ActionLedger,
  type V2AttributionAvailability,
  type V2AttributionSourceUse,
  type V2BeaconExposure,
  type V2CampaignRecords,
  type V2ConsequenceFact,
  type V2FinalOrder,
  type V2HqBeliefOutput,
  type V2HqPublicCaseBasis,
  type V2PartnerConsent,
  type V2RavellanObservation,
  type V2ReserveCondition,
} from "@brass-ledger/shared";
import { deriveV2BaseHqBeliefAtCycle } from "./v2-hq-belief";
import type { V2ResolvedEvidenceDef } from "./v2-hq-belief-core";
import type { V2VerifiedProjectionContext } from "./v2-hq-verified-context";

// --- errors ------------------------------------------------------------

/** A complete command set that 25/39 define as illegal or unreachable. */
export class V2ConsequenceError extends Error {
  constructor(
    readonly code: "v2_consequence_precondition" | "v2_commander_only_order" | "v2_act_without_sensitive_action" | "v2_sensitive_action_without_authority" | "v2_source_already_used" | "v2_attribution_case_unavailable" | "v2_trusted_basis_required" | "v2_malformed_basis" | "v2_contradictory_observation" | "v2_history_mismatch",
    message: string,
  ) {
    super(message);
    this.name = "V2ConsequenceError";
  }
}

/**
 * Reserve delta of `quiet-reinforce-beacon` (25 section 10, "-1 when material
 * commitment required"; 36 "dynamically crosses reserve"). Decision D51: a
 * material commitment is required exactly when the pre-package Beacon
 * preparation is still `routine` (no denial plan built, so reinforcing commits
 * reserve now). With `prepared` (paid for by C3 forward preparation or C4
 * quiet preparation), the reinforcement executes that plan at no further cost.
 * Judged on the pre-package state, so issue order cannot matter.
 */
export function quietReinforceBeaconReserveDelta(preparation: V2CampaignRecords["beaconPreparation"]): 0 | -1 {
  return preparation === "routine" ? -1 : 0;
}

// --- ordinal helpers -----------------------------------------------------

const exposureOrder = ["contained", "thin", "open"] as const satisfies readonly V2BeaconExposure[];
const reserveOrder = ["usable", "strained", "brittle"] as const satisfies readonly V2ReserveCondition[];
const partnerOrder = ["cooperative", "uneasy", "conditional", "withdrawn"] as const satisfies readonly V2PartnerConsent[];

/** Positive improves (toward index 0), negative worsens; clamps once at the bounds. */
function shiftOrdinal<T extends string>(order: readonly T[], from: T, improve: number): T {
  const index = order.indexOf(from) - improve;
  return order[Math.min(order.length - 1, Math.max(0, index))]!;
}

const signed = (delta: number): string => (delta > 0 ? `+${delta}` : `${delta}`);

type OrdinalField = "beaconExposure" | "reserveCondition" | "partnerConsent";
type Contribution = Readonly<{ orderId: string; field: OrdinalField; delta: number; conditioned: boolean }>;

// --- derived availability (25 section 3) -------------------------------------

/**
 * Attribution availability is derived, never stored: a used source is
 * unavailable, otherwise the current #100 public-case basis decides.
 */
export function deriveV2AttributionAvailability(sourceUse: V2AttributionSourceUse, currentBasis: V2HqPublicCaseBasis): V2AttributionAvailability {
  if (sourceUse.state === "used") return { state: "unavailable", reason: "source-already-used" };
  return currentBasis;
}

/** Trusted derivation of the current #100 public-case basis from a verified context. */
export type V2PublicCaseBasisProvider = (context: V2VerifiedProjectionContext, cycle: number) => V2HqPublicCaseBasis;

const noPublicCase: V2HqPublicCaseBasis = { state: "none", direction: null, supportingInstanceIds: [], supportingCorroborationGroupIds: [] };

/** Wraps the #100 derivation as a provider; a not-ready cut has no public case. */
export function createV2PublicCaseBasisProvider(
  definitions: ReadonlyMap<string, V2ResolvedEvidenceDef>,
  modelSemanticDigest: string,
): V2PublicCaseBasisProvider {
  return (context, cycle) => {
    const output: V2HqBeliefOutput = deriveV2BaseHqBeliefAtCycle(context, cycle, definitions, modelSemanticDigest);
    return output.kind === "ready" ? output.snapshot.publicCaseBasis : noPublicCase;
  };
}

// --- resolution ----------------------------------------------------------

/** Everything the resolver may know besides the complete final order set. */
export type V2ConsequenceInput = Readonly<{
  cycle: number;
  pre: V2CampaignRecords;
  finalOrders: readonly V2FinalOrder[];
  /** Validated ledger entries before this command set (reserve-deployment history). */
  priorLedger: V2ActionLedger;
  /** Lazily derives the trusted current public-case basis; called only for source use. */
  derivePublicCaseBasis: (() => V2HqPublicCaseBasis) | undefined;
}>;

export type V2ConsequenceResolution = Readonly<{
  campaign: V2CampaignRecords;
  /** New reverse observations (37A), observed at `cycle`, sorted by signal. */
  observations: readonly V2RavellanObservation[];
  /** Derived provenance facts (25 section 4); recomputed, never persisted. */
  facts: readonly V2ConsequenceFact[];
}>;

const commanderOnlyOrders: ReadonlySet<string> = new Set(["public-accusation", "request-partner-liaison", "use-attribution"]);
const partnerSensitiveOrders = ["visible-reinforce-beacon", "use-attribution"] as const;
/** The qualifying reserve-deployment course per cycle (37A). */
const reserveDeploymentOrder: Readonly<Record<number, string>> = { 2: "visible-patrol-surge", 3: "forward-reserve-preparation", 4: "press-visible-advantage" };

const latticeOrders: Readonly<Record<number, { protect: string; leave: string }>> = {
  1: { protect: "protect-lattice-c1", leave: "leave-lattice-unprotected-c1" },
  2: { protect: "protect-lattice-c2", leave: "leave-lattice-unprotected-c2" },
  3: { protect: "protect-lattice-c3", leave: "leave-lattice-unprotected-c3" },
};

/**
 * Applies exactly the 25 section 6-11 effects of the complete final order set.
 * Throws {@link V2ConsequenceError} for a package the contracts make illegal.
 */
export function resolveV2Consequences(input: V2ConsequenceInput): V2ConsequenceResolution {
  const { cycle, pre, finalOrders } = input;
  const present = new Set<string>();
  for (const order of finalOrders) {
    if (order.orderId === null) continue;
    present.add(order.orderId);
    if (commanderOnlyOrders.has(order.orderId) && order.disposition !== "intervene") {
      throw new V2ConsequenceError("v2_commander_only_order", `Order '${order.orderId}' is commander-only and can never be delegated.`);
    }
  }
  const has = (orderId: string): boolean => present.has(orderId);

  const facts: V2ConsequenceFact[] = [];
  const emissions: Array<Readonly<{ signal: V2RavellanObservation["signal"]; value: string; source: string }>> = [];
  const contributions: Contribution[] = [];
  const next: { -readonly [K in keyof V2CampaignRecords]: V2CampaignRecords[K] } = { ...pre };

  const addFact = (ruleId: string, orderIds: readonly string[], stateField: string, before: string, after: string, conditioned: boolean, contributionRef?: string): void => {
    facts.push({
      cycle: cycle as V2ConsequenceFact["cycle"], ruleId, provenance: conditioned ? "player-conditioned" : "player-caused",
      sourceOrderIds: [...orderIds], stateField, beforeRef: before, afterRef: after,
      ...(contributionRef === undefined ? {} : { contributionRef }),
    });
  };
  const contribute = (orderId: string, field: OrdinalField, delta: number, conditioned = false): void => {
    contributions.push({ orderId, field, delta, conditioned });
  };
  /** Writes a record transition and its fact. */
  const transition = <K extends keyof V2CampaignRecords>(orderIds: readonly string[], ruleId: string, field: K, after: V2CampaignRecords[K], conditioned: boolean): void => {
    const before = pre[field];
    next[field] = after;
    addFact(ruleId, orderIds, field, refOf(before), refOf(after), conditioned);
  };
  const emit = (signal: V2RavellanObservation["signal"], value: string, source: string): void => {
    emissions.push({ signal, value, source });
  };

  // Lattice investment (C1-C3): exact schedule transitions, no catch-up.
  const lattice = latticeOrders[cycle];
  if (lattice !== undefined && (has(lattice.protect) || has(lattice.leave))) {
    const orderId = has(lattice.protect) ? lattice.protect : lattice.leave;
    const current = pre.latticeInvestment;
    if (current.state !== "on-track" || current.protectedThroughCycle !== cycle - 1) {
      throw new V2ConsequenceError("v2_consequence_precondition", `Lattice order '${orderId}' requires on-track protection through cycle ${cycle - 1}.`);
    }
    transition([orderId], `${orderId}:latticeInvestment`, "latticeInvestment",
      orderId === lattice.protect
        ? (cycle === 3 ? { state: "operational" } : { state: "on-track", protectedThroughCycle: cycle as 1 | 2 })
        : { state: "unreachable", missedAtCycle: cycle as 1 | 2 | 3 },
      false);
  }

  /** Active promise is breached by the listed trigger orders (25 section 2). */
  const breachPromise = (orderId: string): void => {
    if (next.consultationPromise === "active") transition([orderId], `${orderId}:consultationPromise`, "consultationPromise", "breached", true);
  };

  if (cycle === 1) {
    if (has("reinforce-watch")) {
      contribute("reinforce-watch", "beaconExposure", +1);
      contribute("reinforce-watch", "reserveCondition", -1);
      emit("beacon_coverage_signal", "credible", "reinforce-watch");
    }
    if (has("ordinary-watch")) emit("beacon_coverage_signal", "weak", "ordinary-watch");
    if (has("formal-consultation-agreement")) {
      if (pre.consultationPromise !== "none") throw new V2ConsequenceError("v2_consequence_precondition", "Formal consultation can only create a promise from 'none'.");
      transition(["formal-consultation-agreement"], "formal-consultation-agreement:consultationPromise", "consultationPromise", "active", false);
      contribute("formal-consultation-agreement", "partnerConsent", +1);
      emit("coalition_unity_signal", "coherent", "formal-consultation-agreement");
    }
  } else if (cycle === 2) {
    const coordinatedVisibleSurge = pre.consultationPromise === "active" && has("joint-non-attributive-warning") && has("visible-patrol-surge");
    if (has("quiet-escort")) { contribute("quiet-escort", "partnerConsent", 0); emit("visible_denial_signal", "withheld", "quiet-escort"); }
    if (has("visible-patrol-surge")) {
      contribute("visible-patrol-surge", "partnerConsent", coordinatedVisibleSurge ? 0 : -1, coordinatedVisibleSurge);
      contribute("visible-patrol-surge", "reserveCondition", -1);
      emit("visible_denial_signal", "demonstrated", "visible-patrol-surge");
      emit("beacon_coverage_signal", "credible", "visible-patrol-surge");
      if (!coordinatedVisibleSurge) breachPromise("visible-patrol-surge");
    }
    if (has("reroute-and-monitor")) { contribute("reroute-and-monitor", "partnerConsent", -1); emit("visible_denial_signal", "withheld", "reroute-and-monitor"); }
    if (has("remain-silent")) contribute("remain-silent", "partnerConsent", 0);
    if (has("joint-non-attributive-warning")) { contribute("joint-non-attributive-warning", "partnerConsent", +1); emit("coalition_unity_signal", "coherent", "joint-non-attributive-warning"); }
    if (has("public-accusation")) {
      contribute("public-accusation", "partnerConsent", -1);
      emit("coalition_unity_signal", "fractured", "public-accusation");
      emit("ravellan_discovery_signal", "suspected", "public-accusation");
      breachPromise("public-accusation");
    }
  } else if (cycle === 3) {
    if (has("forward-reserve-preparation")) {
      transition(["forward-reserve-preparation"], "forward-reserve-preparation:beaconPreparation", "beaconPreparation", "prepared", false);
      contribute("forward-reserve-preparation", "reserveCondition", -1);
      emit("beacon_coverage_signal", "credible", "forward-reserve-preparation");
    }
    if (has("focus-staging-collection")) contribute("focus-staging-collection", "beaconExposure", -1);
    if (has("reassure-partner")) {
      // Improves only an uneasy/conditional partner; cannot restore withdrawn or erase a breached promise.
      contribute("reassure-partner", "partnerConsent", pre.partnerConsent === "uneasy" || pre.partnerConsent === "conditional" ? +1 : 0, true);
      emit("coalition_unity_signal", "coherent", "reassure-partner");
    }
  } else if (cycle === 4) {
    if (has("recover-reserve")) {
      contribute("recover-reserve", "reserveCondition", +1);
      contribute("recover-reserve", "beaconExposure", -1);
      emit("beacon_coverage_signal", "weak", "recover-reserve");
    }
    if (has("prepare-beacon-quietly")) {
      transition(["prepare-beacon-quietly"], "prepare-beacon-quietly:beaconPreparation", "beaconPreparation", "prepared", false);
      contribute("prepare-beacon-quietly", "beaconExposure", +1);
      contribute("prepare-beacon-quietly", "reserveCondition", -1);
      emit("beacon_coverage_signal", "credible", "prepare-beacon-quietly");
      emit("ravellan_discovery_signal", "suspected", "prepare-beacon-quietly");
    }
    if (has("press-visible-advantage")) {
      contribute("press-visible-advantage", "reserveCondition", -1);
      contribute("press-visible-advantage", "partnerConsent", -1);
      emit("visible_denial_signal", "demonstrated", "press-visible-advantage");
      emit("beacon_coverage_signal", "credible", "press-visible-advantage");
      breachPromise("press-visible-advantage");
    }
    if (has("request-partner-liaison")) {
      if (pre.liaisonObligation !== "none") throw new V2ConsequenceError("v2_consequence_precondition", "A liaison obligation can only be created from 'none'.");
      transition(["request-partner-liaison"], "request-partner-liaison:liaisonObligation", "liaisonObligation", "active", false);
    }
  } else if (cycle === 5) {
    resolveCycleFive();
  } else if (cycle === 6 && has("hold-and-expose")) {
    // Route legality beyond source/basis belongs to 27; this only persists the use.
    useSource(6, ["hold-and-expose"]);
  }

  /** Persists the irreversible use from the re-derived basis (25 section 11). */
  function useSource(usedAtCycle: 5 | 6, orderIds: readonly string[]): void {
    if (pre.attributionSourceUse.state === "used") {
      throw new V2ConsequenceError("v2_source_already_used", "The protected attribution source is already used.");
    }
    if (input.derivePublicCaseBasis === undefined) {
      throw new V2ConsequenceError("v2_trusted_basis_required", "Source use requires a trusted, sim-derived public-case basis.");
    }
    const available = deriveV2AttributionAvailability(pre.attributionSourceUse, input.derivePublicCaseBasis());
    if (available.state !== "credible-source-sensitive") {
      throw new V2ConsequenceError("v2_attribution_case_unavailable", "Source use requires a credible corroborated public case with a claim direction.");
    }
    const parsed = v2AttributionSourceUseSchema.safeParse({
      state: "used",
      usedAtCycle,
      direction: available.direction,
      supportingEvidenceInstanceIds: [...available.supportingInstanceIds],
      supportingCorroborationGroupIds: [...available.supportingCorroborationGroupIds],
    });
    if (!parsed.success) {
      throw new V2ConsequenceError("v2_malformed_basis", "The derived public-case basis is not a valid two-item corroborated source-use record.");
    }
    const used = parsed.data;
    transition(orderIds, `${orderIds[0]}:attributionSourceUse`, "attributionSourceUse", used, false);
  }

  function resolveCycleFive(): void {
    const authority = has("honour-consultation") ? "honour" : has("political-concession") ? "concession" : has("act-then-inform") ? "act" : null;
    const sensitive = partnerSensitiveOrders.some(has);
    const partnerAccessible = pre.partnerConsent !== "withdrawn";
    if (authority === "act" && !sensitive) {
      throw new V2ConsequenceError("v2_act_without_sensitive_action", "Act Then Inform is only legal with a partner-sensitive action in the package.");
    }
    if (sensitive) {
      // Immediate authority: Honour needs the pre-package rapid channel and an accessible partner.
      const immediate = authority === "act" || authority === "concession" || (authority === "honour" && pre.consultationPromise === "active" && partnerAccessible);
      if (!immediate) {
        throw new V2ConsequenceError("v2_sensitive_action_without_authority", "A partner-sensitive C5 action needs immediate authority: Honour with a rapid channel and accessible partner, Concession, or Act Then Inform.");
      }
    }

    // Beacon / reserve signed effects (25 section 10).
    if (has("quiet-reinforce-beacon")) {
      contribute("quiet-reinforce-beacon", "beaconExposure", +1);
      contribute("quiet-reinforce-beacon", "reserveCondition", quietReinforceBeaconReserveDelta(pre.beaconPreparation));
    }
    if (has("visible-reinforce-beacon")) { contribute("visible-reinforce-beacon", "beaconExposure", +1); contribute("visible-reinforce-beacon", "reserveCondition", -1); }
    if (has("keep-reserve-forward")) contribute("keep-reserve-forward", "reserveCondition", -1);
    if (has("emergency-consolidation")) { contribute("emergency-consolidation", "beaconExposure", -1); contribute("emergency-consolidation", "reserveCondition", +1); }
    for (const orderId of ["quiet-reinforce-beacon", "visible-reinforce-beacon", "keep-reserve-forward"]) {
      if (has(orderId)) transition([orderId], `${orderId}:beaconPreparation`, "beaconPreparation", "prepared", false);
    }

    // Partner authority (25 section 10 / 39 section 7).
    if (authority === "honour") {
      transition(["honour-consultation"], "honour-consultation:partnerAuthority", "partnerAuthority", partnerAccessible ? "joint" : "none", true);
      if (partnerAccessible) contribute("honour-consultation", "partnerConsent", +1);
    } else if (authority === "concession") {
      transition(["political-concession"], "political-concession:partnerAuthority", "partnerAuthority", "concession", false);
      transition(["political-concession"], "political-concession:politicalConcession", "politicalConcession", "active", false);
      contribute("political-concession", "partnerConsent", 0, true); // withdrawn is lifted to conditional below
    } else if (authority === "act") {
      transition(["act-then-inform"], "act-then-inform:partnerAuthority", "partnerAuthority", "unilateral", false);
      contribute("act-then-inform", "partnerConsent", -1); // exactly one package-level deterioration
    }
    if (authority === "honour" || authority === "concession") {
      const orderId = authority === "honour" ? "honour-consultation" : "political-concession";
      if (pre.consultationPromise === "active") transition([orderId], `${orderId}:consultationPromise`, "consultationPromise", "honoured", true);
      if (pre.liaisonObligation === "active") transition([orderId], `${orderId}:liaisonObligation`, "liaisonObligation", "fulfilled", true);
    } else if (authority === "act") {
      if (pre.consultationPromise === "active") transition(["act-then-inform"], "act-then-inform:consultationPromise", "consultationPromise", "breached", true);
      if (pre.liaisonObligation === "active") transition(["act-then-inform"], "act-then-inform:liaisonObligation", "liaisonObligation", "breached", true);
    }

    // Attribution (25 section 11).
    if (has("use-attribution")) {
      useSource(5, ["use-attribution"]);
      // The unilateral package takes its single deterioration instead of this improvement.
      const coordinated = authority === "honour" || authority === "concession";
      // D52: a coordinated package improves the partner at most one step in total, as the
      // unilateral package worsens it exactly one; Honour's +1 already is that step.
      // D53: "accessible" is judged on the pre-package partner, so a Concession that lifts a
      // withdrawn partner does not also let Use improve them.
      if (coordinated && partnerAccessible) contribute("use-attribution", "partnerConsent", authority === "concession" ? +1 : 0, true);
    }

    // 37A package-level C5 emissions: at most one value per signal.
    const visible = has("visible-reinforce-beacon");
    if (visible) emit("beacon_coverage_signal", "credible", "c5-visible-reinforce");
    else if (has("keep-reserve-forward")) emit("beacon_coverage_signal", "credible", "c5-keep-reserve-forward");
    else if (has("quiet-reinforce-beacon") && has("emergency-consolidation")) { /* mixed picture: no new coverage signal */ }
    else if (has("quiet-reinforce-beacon")) emit("beacon_coverage_signal", "credible", "c5-quiet-reinforce");
    else if (has("emergency-consolidation")) emit("beacon_coverage_signal", "weak", "c5-emergency-consolidation");
    if (visible) emit("visible_denial_signal", "demonstrated", "c5-visible-reinforce");
    if (visible || has("use-attribution")) {
      emit("ravellan_discovery_signal", "suspected", visible && has("use-attribution") ? "c5-visible-reinforce-plus-attribution" : visible ? "c5-visible-reinforce" : "c5-public-attribution");
    }
    if (authority === "honour" && partnerAccessible) emit("coalition_unity_signal", "coherent", "honour-consultation");
    else if (authority === "concession") emit("coalition_unity_signal", "coherent", "political-concession");
    else if (authority === "act") emit("coalition_unity_signal", "fractured", "act-then-inform");
  }

  // Sum every ordinal field's contributions, then clamp once from the pre-command state.
  // For C1/C3/C4 this is the deliberate order-independent reading of "improve/worsen one step": each field has at most one contribution there.
  const orders = { beaconExposure: exposureOrder, reserveCondition: reserveOrder, partnerConsent: partnerOrder } as const;
  for (const field of Object.keys(orders) as OrdinalField[]) {
    const own = contributions.filter((entry) => entry.field === field);
    if (own.length === 0) continue;
    const order: readonly string[] = orders[field];
    const net = own.reduce((sum, entry) => sum + entry.delta, 0);
    // A recovery floor is set before the signed sum (concession lifts withdrawn to conditional).
    const base = field === "partnerConsent" && pre.partnerConsent === "withdrawn" && has("political-concession") && cycle === 5 ? "conditional" : pre[field];
    const after = shiftOrdinal(order, base, net);
    (next as Record<string, unknown>)[field] = after;
    for (const entry of own) addFact(`${entry.orderId}:${field}`, [entry.orderId], field, pre[field], after, entry.conditioned, signed(entry.delta));
    addFact(`net:${field}`, [...new Set(own.map((entry) => entry.orderId))].sort(), field, pre[field], after, own.some((entry) => entry.conditioned));
  }

  // Reserve-deployment history (37A): the second qualifying cycle creates or refreshes exhaustion.
  const deployment = reserveDeploymentOrder[cycle];
  if (deployment !== undefined && has(deployment)) {
    const earlier = input.priorLedger.filter((entry) => entry.kind === "command-set"
      && reserveDeploymentOrder[entry.commandSet.cycle] !== undefined
      && entry.finalOrders.some((order) => order.orderId === reserveDeploymentOrder[entry.commandSet.cycle])).length;
    if (earlier >= 1) emit("reserve_exhaustion_signal", "suspected", deployment);
  }

  const observations = emissions
    .map((entry) => ({ signal: entry.signal, value: entry.value, observedCycle: cycle, source: entry.source }) as V2RavellanObservation)
    .sort((left, right) => (left.signal < right.signal ? -1 : left.signal > right.signal ? 1 : 0));
  facts.sort((left, right) => compare(left.stateField, right.stateField) || compare(left.ruleId, right.ruleId));
  return { campaign: next, observations, facts };
}

function compare(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

/** Stable text reference for a record value in a consequence fact. */
function refOf(value: unknown): string {
  if (typeof value === "string") return value;
  const record = value as { state: string; protectedThroughCycle?: number; missedAtCycle?: number; usedAtCycle?: number; direction?: string };
  return [record.state, record.protectedThroughCycle, record.missedAtCycle, record.usedAtCycle, record.direction].filter((part) => part !== undefined).join("/");
}
