/**
 * #101 persistent consequences and irreversible source use.
 * Contract: 25-KESTREL-CONSEQUENCE-MATRIX, 39-KESTREL-CROSS-SYSTEM-COMPOSITION, 37A.
 * Uses node:test like every other test in this workspace (the repo does not use Vitest).
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  v2AttributionSourceUseSchema,
  v2CampaignRecordsSchema,
  v2CurrentRulesetVersion,
  v2LatticeInvestmentSchema,
  v2OpeningCampaignRecords,
  type V2ActionLedger,
  type V2AgendaIssue,
  type V2CampaignRecords,
  type V2FinalOrder,
  type V2HqPublicCaseBasis,
  type V2Identity,
  type V2Session,
} from "@brass-ledger/shared";
import { getContextProvenance } from "./v2-hq-verified-context";
import { kestrelHqBeliefModelDigest, v2EvidenceDefinitionMap } from "@brass-ledger/content";
import {
  V2CommandValidationError,
  V2ConsequenceError,
  V2ReplayValidationError,
  V2UndecidedConsequenceError,
  canonicalV2Json,
  createV2CommandSetLedgerEntry,
  createV2IntentDeclarationLedgerEntry,
  createV2PublicCaseBasisProvider,
  createV2RavellanDecisionLedgerEntry,
  deriveV2AttributionAvailability,
  resolveV2CommandSet,
  resolveV2Consequences,
  v2FinalSessionDigest,
  v2InitialStateDigest,
  v2StateHash,
  validateV2ReplaySkeleton,
  type V2PublicCaseBasisProvider,
} from "./index";

// --- fixtures ----------------------------------------------------------------

const opening: V2CampaignRecords = v2OpeningCampaignRecords;
const withRecords = (overrides: Partial<V2CampaignRecords>): V2CampaignRecords => ({ ...opening, ...overrides });

const credibleBasis = (direction: "preparation" | "coercion"): V2HqPublicCaseBasis => ({
  state: "credible-source-sensitive", direction,
  supportingInstanceIds: ["evidence-a", "evidence-b"],
  supportingCorroborationGroupIds: ["physical-staging", "auxiliary-tasking"],
});
const tentativeBasis: V2HqPublicCaseBasis = { state: "tentative", direction: "preparation", supportingInstanceIds: ["evidence-a"], supportingCorroborationGroupIds: ["physical-staging"] };
const directionlessBasis: V2HqPublicCaseBasis = { state: "tentative", direction: null, supportingInstanceIds: [], supportingCorroborationGroupIds: [] };
const noCase: V2HqPublicCaseBasis = { state: "none", direction: null, supportingInstanceIds: [], supportingCorroborationGroupIds: [] };

/** Intervened final orders (every commander-only order must be intervened). */
function finalOrders(...ids: string[]): V2FinalOrder[] {
  return ids.map((orderId) => ({ issueId: `issue-${orderId}`, responsibleOfficer: "operations", disposition: "intervene", orderId, interventionCost: 1 }));
}

function resolve(cycle: number, pre: V2CampaignRecords, ids: string[], extra: { prior?: V2ActionLedger; basis?: V2HqPublicCaseBasis } = {}) {
  return resolveV2Consequences({
    cycle, pre, finalOrders: finalOrders(...ids), priorLedger: extra.prior ?? [],
    derivePublicCaseBasis: extra.basis === undefined ? undefined : () => extra.basis!,
  });
}

function permutations<T>(items: readonly T[]): T[][] {
  if (items.length <= 1) return [[...items]];
  return items.flatMap((item, index) => permutations([...items.slice(0, index), ...items.slice(index + 1)]).map((rest) => [item, ...rest]));
}

const signalValue = (observations: readonly { signal: string; value: string }[], signal: string) => observations.find((entry) => entry.signal === signal)?.value;

// --- AC-1: records and opening state ------------------------------------------

describe("AC-1 persistent campaign records", () => {
  it("opens with the exact 25 section 2 state", () => {
    assert.deepEqual(v2CampaignRecordsSchema.parse(opening), {
      beaconExposure: "thin", beaconPreparation: "routine", reserveCondition: "usable", partnerConsent: "cooperative",
      consultationPromise: "none", partnerAuthority: "pending", politicalConcession: "none", liaisonObligation: "none",
      latticeInvestment: { state: "on-track", protectedThroughCycle: 0 }, attributionSourceUse: { state: "unspent" },
    });
  });

  it("rejects impossible Lattice states", () => {
    for (const bad of [
      { state: "on-track", protectedThroughCycle: 0, missedAtCycle: 1 },
      { state: "unreachable", missedAtCycle: 1, protectedThroughCycle: 0 },
      { state: "on-track", protectedThroughCycle: 3 },
      { state: "unreachable", missedAtCycle: 0 },
      { state: "unreachable", missedAtCycle: 4 },
      { state: "operational", protectedThroughCycle: 2 },
      { state: "lost" },
    ]) assert.equal(v2LatticeInvestmentSchema.safeParse(bad).success, false, JSON.stringify(bad));
    for (const good of [{ state: "on-track", protectedThroughCycle: 2 }, { state: "operational" }, { state: "unreachable", missedAtCycle: 3 }]) {
      assert.equal(v2LatticeInvestmentSchema.safeParse(good).success, true);
    }
  });

  it("rejects impossible source-use records", () => {
    const used = { state: "used", usedAtCycle: 5, direction: "coercion", supportingEvidenceInstanceIds: ["a", "b"], supportingCorroborationGroupIds: ["physical-staging", "partner-liaison"] };
    assert.equal(v2AttributionSourceUseSchema.safeParse(used).success, true);
    assert.equal(v2AttributionSourceUseSchema.safeParse({ ...used, usedAtCycle: 6 }).success, true);
    for (const bad of [
      { ...used, usedAtCycle: 4 }, { ...used, usedAtCycle: 7 },
      { ...used, supportingCorroborationGroupIds: ["physical-staging", "physical-staging"] },
      { ...used, direction: "ambiguous" }, { ...used, direction: "unclear" },
      { ...used, supportingEvidenceInstanceIds: ["a"] }, { ...used, supportingEvidenceInstanceIds: ["a", "b", "c"] },
      { ...used, supportingCorroborationGroupIds: ["physical-staging", "generic-group"] },
      { ...used, extra: true }, { state: "unspent", usedAtCycle: 5 }, { state: "expired" },
    ]) assert.equal(v2AttributionSourceUseSchema.safeParse(bad).success, false, JSON.stringify(bad));
  });

  it("rejects every enum value outside the 25 section 2 sets and unknown fields", () => {
    for (const [field, value] of [
      ["beaconExposure", "closed"], ["beaconPreparation", "ready"], ["reserveCondition", "depleted"], ["partnerConsent", "hostile"],
      ["consultationPromise", "expired"], ["partnerAuthority", "shared"], ["politicalConcession", "paid"], ["liaisonObligation", "expired"],
    ] as const) assert.equal(v2CampaignRecordsSchema.safeParse({ ...opening, [field]: value }).success, false, field);
    assert.equal(v2CampaignRecordsSchema.safeParse({ ...opening, trustScore: 3 }).success, false);
    assert.equal(v2CampaignRecordsSchema.safeParse({ ...opening, publicCase: noCase }).success, false, "no persisted public-case mirror");
  });
});

// --- AC-2: C1-C5 effects -----------------------------------------------------

describe("AC-2 C1-C4 transitions", () => {
  it("C1 orders, including promise creation and the improve-only-if-below rule", () => {
    const reinforce = resolve(1, opening, ["reinforce-watch"]);
    assert.equal(reinforce.campaign.beaconExposure, "contained");
    assert.equal(reinforce.campaign.reserveCondition, "strained");
    assert.deepEqual(resolve(1, opening, ["ordinary-watch"]).campaign, opening);
    assert.equal(signalValue(resolve(1, opening, ["ordinary-watch"]).observations, "beacon_coverage_signal"), "weak");
    const formal = resolve(1, opening, ["formal-consultation-agreement"]);
    assert.equal(formal.campaign.consultationPromise, "active");
    assert.equal(formal.campaign.partnerConsent, "cooperative");
    const constructed = resolve(1, withRecords({ partnerConsent: "uneasy" }), ["formal-consultation-agreement"]);
    assert.equal(constructed.campaign.partnerConsent, "cooperative");
    assert.deepEqual(resolve(1, opening, ["informal-liaison"]).campaign, opening);
  });

  it("Lattice follows the exact schedule and never catches up", () => {
    assert.deepEqual(resolve(1, opening, ["protect-lattice-c1"]).campaign.latticeInvestment, { state: "on-track", protectedThroughCycle: 1 });
    const one = withRecords({ latticeInvestment: { state: "on-track", protectedThroughCycle: 1 } });
    const two = withRecords({ latticeInvestment: { state: "on-track", protectedThroughCycle: 2 } });
    assert.deepEqual(resolve(2, one, ["protect-lattice-c2"]).campaign.latticeInvestment, { state: "on-track", protectedThroughCycle: 2 });
    assert.deepEqual(resolve(3, two, ["protect-lattice-c3"]).campaign.latticeInvestment, { state: "operational" });
    assert.deepEqual(resolve(1, opening, ["leave-lattice-unprotected-c1"]).campaign.latticeInvestment, { state: "unreachable", missedAtCycle: 1 });
    assert.deepEqual(resolve(2, one, ["leave-lattice-unprotected-c2"]).campaign.latticeInvestment, { state: "unreachable", missedAtCycle: 2 });
    assert.deepEqual(resolve(3, two, ["leave-lattice-unprotected-c3"]).campaign.latticeInvestment, { state: "unreachable", missedAtCycle: 3 });
    assert.throws(() => resolve(2, opening, ["protect-lattice-c2"]), V2ConsequenceError, "no catch-up");
    assert.throws(() => resolve(2, withRecords({ latticeInvestment: { state: "unreachable", missedAtCycle: 1 } }), ["protect-lattice-c2"]), V2ConsequenceError);
  });

  it("C2 partner arithmetic: signed table, coordination, clamp once", () => {
    const channel = withRecords({ consultationPromise: "active" });
    // coordinated surge: 0 + 1 improves an uneasy partner, promise stays active
    const coordinated = resolve(2, withRecords({ consultationPromise: "active", partnerConsent: "uneasy" }), ["visible-patrol-surge", "joint-non-attributive-warning"]);
    assert.equal(coordinated.campaign.partnerConsent, "cooperative");
    assert.equal(coordinated.campaign.consultationPromise, "active");
    assert.equal(coordinated.campaign.reserveCondition, "strained");
    assert.equal(signalValue(coordinated.observations, "coalition_unity_signal"), "coherent");
    assert.equal(coordinated.observations.filter((entry) => entry.signal === "coalition_unity_signal").length, 1);
    // no channel: +1 and -1 net zero, nothing to breach
    const noChannel = resolve(2, withRecords({ partnerConsent: "uneasy" }), ["visible-patrol-surge", "joint-non-attributive-warning"]);
    assert.equal(noChannel.campaign.partnerConsent, "uneasy");
    assert.equal(noChannel.campaign.consultationPromise, "none");
    // uncoordinated surge with an active promise: -1 and breach
    const uncoordinated = resolve(2, channel, ["visible-patrol-surge", "remain-silent"]);
    assert.equal(uncoordinated.campaign.partnerConsent, "uneasy");
    assert.equal(uncoordinated.campaign.consultationPromise, "breached");
    // reroute + warning nets 0 but keeps both causal facts
    const rerouteWarn = resolve(2, opening, ["reroute-and-monitor", "joint-non-attributive-warning"]);
    assert.equal(rerouteWarn.campaign.partnerConsent, "cooperative");
    assert.equal(rerouteWarn.facts.filter((fact) => fact.stateField === "partnerConsent" && fact.contributionRef !== undefined).length, 2);
    // reroute + accusation: two-step deterioration where room exists, clamped otherwise
    const rerouteAccuse = resolve(2, channel, ["reroute-and-monitor", "public-accusation"]);
    assert.equal(rerouteAccuse.campaign.partnerConsent, "conditional");
    assert.equal(rerouteAccuse.campaign.consultationPromise, "breached");
    assert.equal(signalValue(rerouteAccuse.observations, "coalition_unity_signal"), "fractured");
    assert.equal(signalValue(rerouteAccuse.observations, "ravellan_discovery_signal"), "suspected");
    assert.equal(resolve(2, withRecords({ partnerConsent: "conditional" }), ["reroute-and-monitor", "public-accusation"]).campaign.partnerConsent, "withdrawn");
    assert.equal(resolve(2, withRecords({ partnerConsent: "withdrawn" }), ["reroute-and-monitor", "public-accusation"]).campaign.partnerConsent, "withdrawn");
    assert.equal(resolve(2, withRecords({ partnerConsent: "cooperative" }), ["joint-non-attributive-warning"]).campaign.partnerConsent, "cooperative");
    // quiet escort and silence do not touch the promise
    assert.equal(resolve(2, channel, ["quiet-escort", "remain-silent"]).campaign.consultationPromise, "active");
    assert.equal(resolve(2, channel, ["reroute-and-monitor", "joint-non-attributive-warning"]).campaign.consultationPromise, "active");
  });

  it("C3 orders", () => {
    const forward = resolve(3, opening, ["forward-reserve-preparation"]);
    assert.equal(forward.campaign.beaconPreparation, "prepared");
    assert.equal(forward.campaign.reserveCondition, "strained");
    assert.deepEqual(resolve(3, opening, ["hold-reserve"]).campaign, opening);
    const focus = resolve(3, opening, ["focus-staging-collection"]);
    assert.equal(focus.campaign.beaconExposure, "open");
    assert.deepEqual(focus.campaign.latticeInvestment, opening.latticeInvestment, "focused collection never touches Lattice");
    assert.equal(resolve(3, withRecords({ beaconExposure: "open" }), ["focus-staging-collection"]).campaign.beaconExposure, "open");
    assert.deepEqual(resolve(3, opening, ["maintain-current-coverage"]).campaign, opening);
    assert.equal(resolve(3, withRecords({ partnerConsent: "uneasy" }), ["reassure-partner"]).campaign.partnerConsent, "cooperative");
    assert.equal(resolve(3, withRecords({ partnerConsent: "conditional" }), ["reassure-partner"]).campaign.partnerConsent, "uneasy");
    const withdrawn = resolve(3, withRecords({ partnerConsent: "withdrawn", consultationPromise: "breached" }), ["reassure-partner"]);
    assert.equal(withdrawn.campaign.partnerConsent, "withdrawn");
    assert.equal(withdrawn.campaign.consultationPromise, "breached");
    assert.deepEqual(resolve(3, opening, ["routine-contact"]).campaign, opening);
  });

  it("C4 orders: recovery has a real cost, press always costs politics", () => {
    const recover = resolve(4, withRecords({ reserveCondition: "strained" }), ["recover-reserve"]);
    assert.equal(recover.campaign.reserveCondition, "usable");
    assert.equal(recover.campaign.beaconExposure, "open");
    const prepare = resolve(4, opening, ["prepare-beacon-quietly"]);
    assert.equal(prepare.campaign.beaconPreparation, "prepared");
    assert.equal(prepare.campaign.beaconExposure, "contained");
    assert.equal(prepare.campaign.reserveCondition, "strained");
    const press = resolve(4, withRecords({ consultationPromise: "active" }), ["press-visible-advantage"]);
    assert.equal(press.campaign.reserveCondition, "strained");
    assert.equal(press.campaign.partnerConsent, "uneasy");
    assert.equal(press.campaign.consultationPromise, "breached");
    assert.equal(resolve(4, opening, ["press-visible-advantage"]).campaign.partnerConsent, "uneasy");
    assert.equal(resolve(4, opening, ["request-partner-liaison"]).campaign.liaisonObligation, "active");
    assert.deepEqual(resolve(4, opening, ["do-not-request-liaison"]).campaign, opening);
    assert.throws(() => resolveV2Consequences({ cycle: 4, pre: opening, finalOrders: [{ ...finalOrders("request-partner-liaison")[0]!, disposition: "delegate", interventionCost: 0 }] as V2FinalOrder[], priorLedger: [], derivePublicCaseBasis: undefined }), (e: unknown) => e instanceof V2ConsequenceError && e.code === "v2_commander_only_order");
  });

  it("emits one derived fact per contribution plus the net, deterministically", () => {
    const result = resolve(2, withRecords({ consultationPromise: "active" }), ["reroute-and-monitor", "joint-non-attributive-warning"]);
    const partner = result.facts.filter((fact) => fact.stateField === "partnerConsent");
    assert.deepEqual(partner.map((fact) => fact.ruleId), ["joint-non-attributive-warning:partnerConsent", "net:partnerConsent", "reroute-and-monitor:partnerConsent"]);
    assert.deepEqual(partner.map((fact) => fact.contributionRef), ["+1", undefined, "-1"]);
    assert.ok(result.facts.every((fact) => fact.cycle === 2 && fact.provenance.startsWith("player-")));
    assert.equal(canonicalV2Json(resolve(2, withRecords({ consultationPromise: "active" }), ["reroute-and-monitor", "joint-non-attributive-warning"]).facts), canonicalV2Json(result.facts));
  });

  it("reserve-deployment history creates exhaustion at the second qualifying cycle", () => {
    const prior = [{ kind: "command-set", commandSet: { cycle: 2 }, finalOrders: finalOrders("visible-patrol-surge") }] as unknown as V2ActionLedger;
    assert.equal(signalValue(resolve(3, opening, ["forward-reserve-preparation"], { prior }).observations, "reserve_exhaustion_signal"), "suspected");
    assert.equal(signalValue(resolve(3, opening, ["forward-reserve-preparation"]).observations, "reserve_exhaustion_signal"), undefined);
    assert.equal(signalValue(resolve(3, opening, ["hold-reserve"], { prior }).observations, "reserve_exhaustion_signal"), undefined);
  });
});

describe("AC-2 C5 atomic package", () => {
  const channel = withRecords({ consultationPromise: "active", liaisonObligation: "active" });

  it("visible reinforcement with Honour and a rapid channel", () => {
    const result = resolve(5, channel, ["visible-reinforce-beacon", "honour-consultation"]);
    assert.equal(result.campaign.beaconExposure, "contained");
    assert.equal(result.campaign.reserveCondition, "strained");
    assert.equal(result.campaign.beaconPreparation, "prepared");
    assert.equal(result.campaign.partnerAuthority, "joint");
    assert.equal(result.campaign.consultationPromise, "honoured");
    assert.equal(result.campaign.liaisonObligation, "fulfilled");
    assert.equal(result.campaign.partnerConsent, "cooperative");
    assert.equal(signalValue(result.observations, "coalition_unity_signal"), "coherent");
    assert.equal(signalValue(result.observations, "visible_denial_signal"), "demonstrated");
    assert.equal(signalValue(result.observations, "ravellan_discovery_signal"), "suspected");
    assert.equal(result.observations.find((entry) => entry.signal === "beacon_coverage_signal")?.source, "c5-visible-reinforce");
    assert.equal(signalValue(result.observations, "reserve_exhaustion_signal"), undefined, "no dead C5 exhaustion signal");
  });

  it("aggregates reserve and exposure once, with clamping", () => {
    const both = resolve(5, withRecords({ reserveCondition: "strained" }), ["keep-reserve-forward", "emergency-consolidation", "hold-attribution"]);
    assert.equal(both.campaign.reserveCondition, "strained", "-1 + +1 nets zero");
    assert.equal(both.campaign.beaconExposure, "open");
    assert.equal(both.campaign.beaconPreparation, "prepared");
    assert.equal(resolve(5, withRecords({ reserveCondition: "brittle" }), ["keep-reserve-forward"]).campaign.reserveCondition, "brittle");
    assert.equal(resolve(5, withRecords({ reserveCondition: "usable", beaconExposure: "contained" }), ["emergency-consolidation", "hold-beacon-posture"]).campaign.reserveCondition, "usable");
    assert.equal(resolve(5, withRecords({ beaconExposure: "open" }), ["emergency-consolidation"]).campaign.beaconExposure, "open");
    assert.equal(resolve(5, withRecords({ beaconExposure: "contained" }), ["visible-reinforce-beacon", "act-then-inform"]).campaign.beaconExposure, "contained");
    assert.equal(signalValue(resolve(5, opening, ["emergency-consolidation"]).observations, "beacon_coverage_signal"), "weak");
    assert.equal(signalValue(resolve(5, opening, ["keep-reserve-forward", "emergency-consolidation"]).observations, "beacon_coverage_signal"), "credible");
  });

  it("preparation is idempotent", () => {
    const prepared = withRecords({ beaconPreparation: "prepared" });
    assert.equal(resolve(5, prepared, ["keep-reserve-forward"]).campaign.beaconPreparation, "prepared");
    assert.equal(resolve(5, prepared, ["hold-beacon-posture"]).campaign.beaconPreparation, "prepared");
  });

  it("authority courses: withdrawn Honour, Concession, Act Then Inform", () => {
    const withdrawn = withRecords({ partnerConsent: "withdrawn", consultationPromise: "active", liaisonObligation: "active" });
    const honour = resolve(5, withdrawn, ["honour-consultation"]);
    assert.equal(honour.campaign.partnerAuthority, "none");
    assert.equal(honour.campaign.partnerConsent, "withdrawn");
    assert.equal(honour.campaign.consultationPromise, "honoured");
    assert.equal(honour.campaign.liaisonObligation, "fulfilled");
    assert.equal(signalValue(honour.observations, "coalition_unity_signal"), undefined);
    const concession = resolve(5, withdrawn, ["political-concession"]);
    assert.equal(concession.campaign.partnerAuthority, "concession");
    assert.equal(concession.campaign.politicalConcession, "active");
    assert.equal(concession.campaign.partnerConsent, "conditional");
    assert.equal(concession.campaign.consultationPromise, "honoured");
    assert.equal(signalValue(concession.observations, "coalition_unity_signal"), "coherent");
    const act = resolve(5, channel, ["visible-reinforce-beacon", "act-then-inform"]);
    assert.equal(act.campaign.partnerAuthority, "unilateral");
    assert.equal(act.campaign.consultationPromise, "breached");
    assert.equal(act.campaign.liaisonObligation, "breached");
    assert.equal(act.campaign.partnerConsent, "uneasy", "exactly one package-level deterioration");
    assert.equal(signalValue(act.observations, "coalition_unity_signal"), "fractured");
    assert.equal(resolve(5, opening, ["honour-consultation"]).campaign.partnerAuthority, "joint");
  });

  it("package legality: Act needs a sensitive action, sensitive actions need authority", () => {
    assert.throws(() => resolve(5, opening, ["hold-beacon-posture", "act-then-inform"]), (e: unknown) => e instanceof V2ConsequenceError && e.code === "v2_act_without_sensitive_action");
    assert.throws(() => resolve(5, opening, ["visible-reinforce-beacon", "honour-consultation"]), (e: unknown) => e instanceof V2ConsequenceError && e.code === "v2_sensitive_action_without_authority", "Honour without rapid channel");
    assert.throws(() => resolve(5, withRecords({ consultationPromise: "active", partnerConsent: "withdrawn" }), ["visible-reinforce-beacon", "honour-consultation"]), V2ConsequenceError, "Honour with withdrawn partner");
    assert.throws(() => resolve(5, opening, ["visible-reinforce-beacon"]), V2ConsequenceError);
    assert.doesNotThrow(() => resolve(5, opening, ["visible-reinforce-beacon", "political-concession"]));
  });

  it("every permutation of issue order gives the identical result", () => {
    const packages: Array<[number, V2CampaignRecords, string[]]> = [
      [2, withRecords({ consultationPromise: "active", partnerConsent: "uneasy", latticeInvestment: { state: "on-track", protectedThroughCycle: 1 } }), ["visible-patrol-surge", "joint-non-attributive-warning", "protect-lattice-c2"]],
      [2, withRecords({ latticeInvestment: { state: "on-track", protectedThroughCycle: 1 } }), ["reroute-and-monitor", "public-accusation", "leave-lattice-unprotected-c2"]],
      [5, channel, ["visible-reinforce-beacon", "keep-reserve-forward", "honour-consultation", "hold-attribution"]],
      [5, channel, ["emergency-consolidation", "hold-beacon-posture", "political-concession"]],
    ];
    for (const [cycle, pre, ids] of packages) {
      const baseline = canonicalV2Json(resolve(cycle, pre, ids));
      for (const order of permutations(ids)) assert.equal(canonicalV2Json(resolve(cycle, pre, order)), baseline, order.join(","));
    }
  });

  it("the other C5 courses are unaffected by the undecided rule", () => {
    for (const ids of [["hold-beacon-posture", "keep-reserve-forward", "honour-consultation"], ["visible-reinforce-beacon", "emergency-consolidation", "act-then-inform"], ["hold-beacon-posture", "emergency-consolidation", "political-concession"]]) {
      assert.doesNotThrow(() => resolve(5, channel, ids));
    }
  });

  it("quiet-reinforce-beacon fails loudly instead of defaulting its reserve delta", () => {
    for (const ids of [["quiet-reinforce-beacon"], ["quiet-reinforce-beacon", "keep-reserve-forward", "honour-consultation"]]) {
      assert.throws(() => resolve(5, channel, ids), (e: unknown) => e instanceof V2UndecidedConsequenceError && e.ruleId === "c5-quiet-reinforce-beacon-reserve" && /BLOCKED: PRODUCT DECISION REQUIRED/.test(e.message));
    }
  });

  it.todo("BLOCKED: PRODUCT DECISION REQUIRED - 25 section 10 quiet-reinforce-beacon reserve -1 'when material commitment required' has no defined trigger (contracts 24, 25, 36, 39); implement quietReinforceBeaconReserveDelta() once decided");
});

describe("AC-2 extends the existing command-set resolver", () => {
  const issue = (id: string, recommended: string, other: string): V2AgendaIssue => ({ id, responsibleOfficer: "operations", recommendedOrderId: recommended, authoredOrders: [{ id: recommended }, { id: other }], mayDefer: false });
  const agenda = [issue("watch", "ordinary-watch", "reinforce-watch"), issue("consult", "informal-liaison", "formal-consultation-agreement")];
  const intent = { mainPriority: "beacon-security", redLine: "civilian-shipping", toleratedCost: "political-friction", defaultStyle: "quiet-preparation" } as const;
  const state = { cycle: 1, seed: "s", ravellan: { posture: "testing", preparation: "none", observations: [] }, campaign: opening, standingIntent: intent } as const;
  const command = (dispositions: unknown[]) => ({ cycle: 1, expectedRevision: 2, dispositions });
  // Placeholder entries; the last ends at `state`, as a validated prefix would.
  const prefix = (length: number) => ({ history: { initialState: state, initialStateDigest: "0".repeat(64), actionLedger: Array.from({ length }, (_, i) => ({ kind: "intent-declaration", postRevision: i + 1, postStateHash: i === length - 1 ? v2StateHash(state) : "0".repeat(64) })) as unknown as V2ActionLedger } });

  it("applies consequences from the final command set regardless of agenda or disposition order", () => {
    const dispositions = [{ issueId: "watch", kind: "intervene", orderId: "reinforce-watch" }, { issueId: "consult", kind: "intervene", orderId: "formal-consultation-agreement" }];
    const forward = resolveV2CommandSet(state, 2, agenda, command(dispositions), prefix(2));
    const reversed = resolveV2CommandSet(state, 2, [...agenda].reverse(), command([...dispositions].reverse()), prefix(2));
    assert.equal(forward.postState.cycle, 2);
    assert.equal(forward.postState.campaign.beaconExposure, "contained");
    assert.equal(forward.postState.campaign.consultationPromise, "active");
    assert.deepEqual(forward.postState.campaign, reversed.postState.campaign);
    assert.deepEqual(forward.postState.ravellan.observations, reversed.postState.ravellan.observations);
    assert.deepEqual(forward.postState.ravellan.observations.map((entry) => entry.signal), ["beacon_coverage_signal", "coalition_unity_signal"]);
    assert.ok(forward.consequenceFacts.length > 0);
  });
});

// --- AC-3: attribution -------------------------------------------------------

describe("AC-3 attribution availability and source use", () => {
  const channel = withRecords({ consultationPromise: "active" });
  const useIds = ["use-attribution", "honour-consultation"];

  it("derives availability from the #100 basis plus persisted source use only", () => {
    const used = v2AttributionSourceUseSchema.parse({ state: "used", usedAtCycle: 5, direction: "preparation", supportingEvidenceInstanceIds: ["a", "b"], supportingCorroborationGroupIds: ["physical-staging", "auxiliary-tasking"] });
    assert.deepEqual(deriveV2AttributionAvailability(used, credibleBasis("coercion")), { state: "unavailable", reason: "source-already-used" });
    assert.deepEqual(deriveV2AttributionAvailability({ state: "unspent" }, credibleBasis("coercion")), credibleBasis("coercion"));
    assert.deepEqual(deriveV2AttributionAvailability({ state: "unspent" }, tentativeBasis), tentativeBasis);
    assert.equal(Object.keys(opening).some((key) => /case|opportunity|mirror/i.test(key)), false);
  });

  it("Use persists the exact re-derived record for both directions", () => {
    for (const direction of ["preparation", "coercion"] as const) {
      const result = resolve(5, channel, useIds, { basis: credibleBasis(direction) });
      assert.deepEqual(result.campaign.attributionSourceUse, {
        state: "used", usedAtCycle: 5, direction,
        supportingEvidenceInstanceIds: ["evidence-a", "evidence-b"], supportingCorroborationGroupIds: ["physical-staging", "auxiliary-tasking"],
      });
      assert.equal(signalValue(result.observations, "ravellan_discovery_signal"), "suspected");
      assert.equal(result.observations.find((entry) => entry.signal === "ravellan_discovery_signal")?.source, "c5-public-attribution");
      assert.equal(result.campaign.partnerConsent, "cooperative");
    }
    assert.equal(resolve(5, withRecords({ consultationPromise: "active", partnerConsent: "uneasy" }), useIds, { basis: credibleBasis("coercion") }).campaign.partnerConsent, "cooperative", "coordinated Use improves an accessible partner");
    const act = resolve(5, withRecords({ partnerConsent: "cooperative" }), ["use-attribution", "act-then-inform"], { basis: credibleBasis("coercion") });
    assert.equal(act.campaign.partnerConsent, "uneasy", "unilateral package keeps its one deterioration");
    const both = resolve(5, opening, ["visible-reinforce-beacon", "use-attribution", "act-then-inform"], { basis: credibleBasis("coercion") });
    assert.equal(both.observations.find((entry) => entry.signal === "ravellan_discovery_signal")?.source, "c5-visible-reinforce-plus-attribution", "combined discovery source");
  });

  it("rejects one-source, directionless, absent and already-used cases", () => {
    for (const basis of [tentativeBasis, directionlessBasis, noCase]) {
      assert.throws(() => resolve(5, channel, useIds, { basis }), (e: unknown) => e instanceof V2ConsequenceError && e.code === "v2_attribution_case_unavailable");
    }
    const used = withRecords({ consultationPromise: "active", attributionSourceUse: resolve(5, channel, useIds, { basis: credibleBasis("coercion") }).campaign.attributionSourceUse });
    assert.throws(() => resolve(5, used, useIds, { basis: credibleBasis("preparation") }), (e: unknown) => e instanceof V2ConsequenceError && e.code === "v2_source_already_used");
    assert.throws(() => resolve(5, channel, useIds), (e: unknown) => e instanceof V2ConsequenceError && e.code === "v2_trusted_basis_required");
    const sameGroup: V2HqPublicCaseBasis = { ...credibleBasis("coercion"), supportingCorroborationGroupIds: ["physical-staging", "physical-staging"] };
    assert.throws(() => resolve(5, channel, useIds, { basis: sameGroup }), V2ConsequenceError);
  });

  it("Use is commander-only and needs authority; Hold persists nothing", () => {
    const delegated: V2FinalOrder[] = [{ issueId: "i", responsibleOfficer: "political", disposition: "delegate", orderId: "use-attribution", interventionCost: 0 }, ...finalOrders("honour-consultation")];
    assert.throws(() => resolveV2Consequences({ cycle: 5, pre: channel, finalOrders: delegated, priorLedger: [], derivePublicCaseBasis: () => credibleBasis("coercion") }), (e: unknown) => e instanceof V2ConsequenceError && e.code === "v2_commander_only_order");
    assert.throws(() => resolve(5, opening, useIds, { basis: credibleBasis("coercion") }), V2ConsequenceError, "Honour without rapid channel");
    assert.throws(() => resolve(5, channel, ["use-attribution"], { basis: credibleBasis("coercion") }), V2ConsequenceError, "no authority");
    const hold = resolve(5, channel, ["hold-attribution", "honour-consultation"], { basis: credibleBasis("coercion") });
    assert.deepEqual(hold.campaign.attributionSourceUse, { state: "unspent" });
  });

  it("C6 Hold And Expose stores usedAtCycle 6", () => {
    const result = resolve(6, opening, ["hold-and-expose"], { basis: credibleBasis("preparation") });
    assert.deepEqual(result.campaign.attributionSourceUse, {
      state: "used", usedAtCycle: 6, direction: "preparation",
      supportingEvidenceInstanceIds: ["evidence-a", "evidence-b"], supportingCorroborationGroupIds: ["physical-staging", "auxiliary-tasking"],
    });
    assert.throws(() => resolve(6, opening, ["hold-and-expose"], { basis: tentativeBasis }), V2ConsequenceError);
  });

  it("the client cannot submit a basis or direction", () => {
    const issue: V2AgendaIssue = { id: "attr", responsibleOfficer: "political", recommendedOrderId: "hold-attribution", authoredOrders: [{ id: "hold-attribution" }, { id: "use-attribution" }], mayDefer: false };
    const intent = { mainPriority: "beacon-security", redLine: "civilian-shipping", toleratedCost: "political-friction", defaultStyle: "quiet-preparation" } as const;
    const state = { cycle: 5, seed: "s", ravellan: { posture: "testing", preparation: "none", observations: [] }, campaign: opening, standingIntent: intent } as const;
    const prefix1 = { history: { initialState: state, initialStateDigest: "0".repeat(64), actionLedger: [{ kind: "intent-declaration", postRevision: 1, postStateHash: v2StateHash(state) }] as unknown as V2ActionLedger } };
    const forged = { cycle: 5, expectedRevision: 1, dispositions: [{ issueId: "attr", kind: "intervene", orderId: "use-attribution", direction: "coercion", supportingEvidenceInstanceIds: ["x", "y"] }] };
    assert.throws(() => resolveV2CommandSet(state, 1, [issue], forged, prefix1), (e: unknown) => e instanceof V2CommandValidationError && e.code === "v2_invalid_command");
    assert.throws(() => resolveV2CommandSet(state, 1, [issue], { ...forged, basis: credibleBasis("coercion"), dispositions: [{ issueId: "attr", kind: "intervene", orderId: "use-attribution" }] }, prefix1), V2CommandValidationError);
  });
});

// --- AC-4: version, replay, tamper ------------------------------------------------

describe("AC-4 versioning and trusted replay", () => {
  const identity: V2Identity = { ruleset: "v2", rulesetVersion: v2CurrentRulesetVersion, scenarioId: "kestrel-strait", contentVersion: "2026.09.02", contentDigest: "a".repeat(64) };
  const intent = { mainPriority: "beacon-security", redLine: "civilian-shipping", toleratedCost: "political-friction", defaultStyle: "quiet-preparation" } as const;
  const stubBasis: V2PublicCaseBasisProvider = () => credibleBasis("coercion");

  /** Cycle packages: delegated orders are the staff recommendation, intervened ones are alternatives. */
  type CyclePlan = { delegate: string[]; intervene?: string[] };
  const defaultPlan: CyclePlan[] = [
    { delegate: ["ordinary-watch", "formal-consultation-agreement", "protect-lattice-c1"] },
    { delegate: ["quiet-escort", "joint-non-attributive-warning", "protect-lattice-c2"] },
    { delegate: ["hold-reserve", "maintain-current-coverage", "routine-contact", "protect-lattice-c3"] },
    { delegate: ["recover-reserve", "do-not-request-liaison"] },
    { delegate: ["hold-beacon-posture", "keep-reserve-forward", "honour-consultation"], intervene: ["use-attribution"] },
  ];
  let plan: CyclePlan[] = defaultPlan;
  const agendaFor = (cycle: number): V2AgendaIssue[] => {
    const cyclePlan = plan[cycle - 1]!;
    return [
      ...cyclePlan.delegate.map((id): V2AgendaIssue => ({ id: `${id}-issue`, responsibleOfficer: "operations", recommendedOrderId: id, authoredOrders: [{ id }, { id: `${id}-alt` }], mayDefer: false })),
      ...(cyclePlan.intervene ?? []).map((id): V2AgendaIssue => ({ id: `${id}-issue`, responsibleOfficer: "political", recommendedOrderId: `${id}-hold`, authoredOrders: [{ id: `${id}-hold` }, { id }], mayDefer: false })),
    ];
  };
  const agendaProvider = (state: V2Session["state"]) => agendaFor(state.cycle);

  function buildSession(cycles: number): V2Session {
    const ravellan = { posture: "testing", preparation: "none", observations: [] } as const;
    const initialState = { cycle: 1, seed: "kestrel-seed", ravellan, campaign: opening, standingIntent: null } as const;
    const base = { id: "v2-save-1", campaignId: "v2-campaign-1", identity, initialState, updatedAt: "2026-09-02T00:00:00.000Z" };
    const ledger: V2ActionLedger = [];
    let state: V2Session["state"] = initialState;
    let revision = 0;
    const push = (entry: V2ActionLedger[number]): void => { ledger.push(entry); state = entry.postState; revision = entry.postRevision; };
    push(createV2IntentDeclarationLedgerEntry(state, revision, { cycle: 1, expectedRevision: 0, intent }));
    for (let cycle = 1; cycle <= cycles; cycle += 1) {
      push(createV2RavellanDecisionLedgerEntry(state, revision));
      const dispositions = agendaFor(cycle).map((entry) => (plan[cycle - 1]!.intervene ?? []).some((id) => `${id}-issue` === entry.id)
        ? { issueId: entry.id, kind: "intervene", orderId: entry.authoredOrders[1]!.id } : { issueId: entry.id, kind: "delegate" });
      push(createV2CommandSetLedgerEntry(state, revision, agendaFor(cycle), { cycle, expectedRevision: revision, dispositions }, {
        history: { initialState, initialStateDigest: v2InitialStateDigest(identity, initialState), actionLedger: [...ledger] }, publicCaseBasisProvider: stubBasis,
      }));
    }
    const session = { ...base, revision, state, actionLedger: ledger };
    return { ...session, initialStateDigest: v2InitialStateDigest(identity, initialState), finalStateDigest: v2FinalSessionDigest(session), } as V2Session;
  }

  /** Rewrites the last entry's post state and recomputes every hash, so only re-execution can catch it. */
  function tamper(session: V2Session, mutate: (post: V2Session["state"]) => V2Session["state"]): V2Session {
    const copy: V2Session = JSON.parse(JSON.stringify(session));
    const last = copy.actionLedger[copy.actionLedger.length - 1]!;
    last.postState = mutate(last.postState);
    last.postStateHash = v2StateHash(last.postState);
    copy.state = last.postState;
    copy.finalStateDigest = v2FinalSessionDigest(copy);
    return copy;
  }
  const rejects = (session: unknown, code: string, provider?: V2PublicCaseBasisProvider) =>
    assert.throws(() => validateV2ReplaySkeleton(session, identity, agendaProvider, provider), (e: unknown) => e instanceof V2ReplayValidationError && e.code === code);

  it("advances the prototype version exactly once, from 0.4.0 to 0.5.0", () => {
    assert.equal(v2CurrentRulesetVersion, "0.5.0-prototype");
  });

  it("replays a full five-cycle ledger and recomputes every new field", () => {
    const session = buildSession(5);
    const replayed = validateV2ReplaySkeleton(session, identity, agendaProvider, stubBasis);
    assert.deepEqual(replayed.state.campaign.attributionSourceUse.state, "used");
    assert.equal(replayed.state.campaign.consultationPromise, "honoured");
    assert.equal(replayed.state.campaign.partnerAuthority, "joint");
    assert.deepEqual(replayed.state.campaign.latticeInvestment, { state: "operational" });
    assert.equal(replayed.state.cycle, 6);
  });

  it("rejects tampered arithmetic, promise, Lattice, source basis and observation", () => {
    const session = buildSession(5);
    rejects(tamper(session, (post) => ({ ...post, campaign: { ...post.campaign, reserveCondition: "usable" } })), "v2_ledger_post_state_mismatch", stubBasis);
    rejects(tamper(session, (post) => ({ ...post, campaign: { ...post.campaign, consultationPromise: "active" } })), "v2_ledger_post_state_mismatch", stubBasis);
    rejects(tamper(session, (post) => ({ ...post, campaign: { ...post.campaign, latticeInvestment: { state: "unreachable", missedAtCycle: 3 } } })), "v2_ledger_post_state_mismatch", stubBasis);
    rejects(tamper(session, (post) => ({ ...post, campaign: { ...post.campaign, attributionSourceUse: { state: "used", usedAtCycle: 5, direction: "preparation", supportingEvidenceInstanceIds: ["evidence-a", "evidence-b"], supportingCorroborationGroupIds: ["physical-staging", "auxiliary-tasking"] } } })), "v2_ledger_post_state_mismatch", stubBasis);
    rejects(tamper(session, (post) => ({ ...post, ravellan: { ...post.ravellan, observations: post.ravellan.observations.filter((entry) => entry.signal !== "ravellan_discovery_signal") } })), "v2_ledger_post_state_mismatch", stubBasis);
    // a source use cannot be replayed without, or against a different, trusted basis
    rejects(session, "v2_ledger_transition_invalid");
    rejects(session, "v2_ledger_transition_invalid", () => directionlessBasis);
    rejects(session, "v2_ledger_post_state_mismatch", () => credibleBasis("preparation"));
    const realProvider = createV2PublicCaseBasisProvider(new Map(v2EvidenceDefinitionMap), kestrelHqBeliefModelDigest.digest);
    rejects(session, "v2_ledger_transition_invalid", realProvider);
  });

  it("rejects a non-opening initial campaign", () => {
    const session = buildSession(1);
    const initialState = { ...session.initialState, campaign: { ...opening, partnerConsent: "uneasy" as const } };
    const forged = { ...session, initialState, initialStateDigest: v2InitialStateDigest(identity, initialState) };
    rejects({ ...forged, finalStateDigest: v2FinalSessionDigest(forged) }, "v2_ledger_transition_invalid");
  });

  it("rejects earlier prototype payloads without migration", () => {
    const session = buildSession(1);
    const earlier = JSON.parse(JSON.stringify(session));
    earlier.identity.rulesetVersion = "0.4.0-prototype";
    delete earlier.initialState.campaign; delete earlier.state.campaign;
    assert.throws(() => validateV2ReplaySkeleton(earlier, identity, agendaProvider), /0\.5\.0-prototype/);
    const relabelled = JSON.parse(JSON.stringify(session));
    relabelled.identity.rulesetVersion = "0.4.0-prototype";
    assert.throws(() => validateV2ReplaySkeleton(relabelled, identity, agendaProvider));
    const noCampaign = JSON.parse(JSON.stringify(session));
    delete noCampaign.state.campaign;
    assert.throws(() => validateV2ReplaySkeleton(noCampaign, identity, agendaProvider));
  });

  it("history is required and must be the full validated prefix (live never diverges from replay)", () => {
    plan = [
      { delegate: ["ordinary-watch", "informal-liaison", "leave-lattice-unprotected-c1"] },
      { delegate: ["visible-patrol-surge", "remain-silent"] },
      { delegate: ["forward-reserve-preparation"] },
    ];
    try {
      const session = buildSession(3); // live creation with the correct prefix at every step
      assert.ok(session.state.ravellan.observations.some((entry) => entry.signal === "reserve_exhaustion_signal"));
      assert.deepEqual(validateV2ReplaySkeleton(session, identity, agendaProvider), session, "live with the correct prefix equals replay");
      // The same C3 command built live without its prefix is refused, never silently built without exhaustion.
      const cycleThree = session.actionLedger[session.actionLedger.length - 1]!;
      const empty = { initialState: session.initialState, initialStateDigest: session.initialStateDigest, actionLedger: [] as V2ActionLedger };
      // Right length but a stale tail (N5): it would otherwise write an entry replay later rejects.
      const full = session.actionLedger.slice(0, cycleThree.preRevision);
      const swapped = { ...empty, actionLedger: [...full.slice(0, -1), full[0]] as V2ActionLedger };
      for (const history of [empty, { ...empty, actionLedger: session.actionLedger.slice(0, 3) }, swapped]) {
        assert.throws(() => createV2CommandSetLedgerEntry(cycleThree.preState, cycleThree.preRevision, agendaFor(3), { cycle: 3, expectedRevision: cycleThree.preRevision, dispositions: agendaFor(3).map((entry) => ({ issueId: entry.id, kind: "delegate" })) }, { history }),
          (e: unknown) => e instanceof V2ConsequenceError && e.code === "v2_history_mismatch");
      }
    } finally {
      plan = defaultPlan;
    }
  });

  it("live contexts are live-authority; only replay stamps trusted-replay", () => {
    const seen: string[] = [];
    const spy: V2PublicCaseBasisProvider = (context) => { seen.push(getContextProvenance(context)); return credibleBasis("coercion"); };
    const session = buildSession(5);
    const lastCommand = session.actionLedger[session.actionLedger.length - 1]!;
    const history = { initialState: session.initialState, initialStateDigest: session.initialStateDigest, actionLedger: session.actionLedger.slice(0, -1) };
    createV2CommandSetLedgerEntry(lastCommand.preState, lastCommand.preRevision, agendaFor(5), { cycle: 5, expectedRevision: lastCommand.preRevision, dispositions: agendaFor(5).map((entry) => (entry.id === "use-attribution-issue" ? { issueId: entry.id, kind: "intervene", orderId: "use-attribution" } : { issueId: entry.id, kind: "delegate" })) }, { history, publicCaseBasisProvider: spy });
    validateV2ReplaySkeleton(session, identity, agendaProvider, spy);
    assert.deepEqual(seen, ["live-authority", "trusted-replay"]);
  });

  it("a malformed provider basis is a mapped rejection, not a raw schema error", () => {
    const sameGroup: V2PublicCaseBasisProvider = () => ({ ...credibleBasis("coercion"), supportingCorroborationGroupIds: ["physical-staging", "physical-staging"] });
    assert.throws(() => resolve(5, withRecords({ consultationPromise: "active" }), ["use-attribution", "honour-consultation"], { basis: sameGroup({} as never, 5) }), (e: unknown) => e instanceof V2ConsequenceError && e.code === "v2_malformed_basis");
    rejects(buildSession(5), "v2_ledger_transition_invalid", sameGroup);
  });

  it("an undecided package cannot enter a ledger", () => {
    const state = { cycle: 5, seed: "s", ravellan: { posture: "testing", preparation: "none", observations: [] }, campaign: opening, standingIntent: intent } as const;
    const agenda: V2AgendaIssue[] = [{ id: "beacon", responsibleOfficer: "operations", recommendedOrderId: "quiet-reinforce-beacon", authoredOrders: [{ id: "quiet-reinforce-beacon" }, { id: "hold-beacon-posture" }], mayDefer: false }];
    assert.throws(() => createV2CommandSetLedgerEntry(state, 1, agenda, { cycle: 5, expectedRevision: 1, dispositions: [{ issueId: "beacon", kind: "delegate" }] }, { history: { initialState: state, initialStateDigest: "0".repeat(64), actionLedger: [{ kind: "intent-declaration", postRevision: 1, postStateHash: v2StateHash(state) }] as unknown as V2ActionLedger } }), V2UndecidedConsequenceError);
  });
});
