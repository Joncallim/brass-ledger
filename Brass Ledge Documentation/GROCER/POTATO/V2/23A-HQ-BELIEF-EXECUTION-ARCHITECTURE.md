---
type: v2-hq-belief-execution-architecture
status: active
---

# HQ Belief Execution Architecture

Backlink: [[README]]

This is the exact implementation/replay authority for **#100** against the committed #99 architecture.

[[23-HQ-BELIEF-AND-EVIDENCE]] owns intelligence semantics. [[30-ARCHITECTURE-CONTRACT]] owns repository boundaries. This document freezes code seams, history inputs, phase guards, identity and tests so implementation does not invent another lifecycle.

# Architectural decision

**#100 is pure derived state.**

Do not add:

- `hqBelief` to `V2Session.state`;
- persisted evidence arrays;
- persisted assessment/warning/public-case fields;
- `hq-belief-update` ledger entries;
- intelligence-driven revisions;
- a #100 V2 persisted-schema version bump.

All #100 products reconstruct deterministically from trusted V2 history + canonical Kestrel intelligence-model content.

This is Pattern B in [[30-ARCHITECTURE-CONTRACT]].

# Why pure derivation fits Kestrel

Committed #99 already persists/replays every hidden historical fact #100 legitimately needs:

- cycle + standing intent;
- one `ravellan-decision` per executed cycle;
- Ravellan action + preparation transition in that entry;
- canonical `command-set` entries;
- authoritative `finalOrders` for Delegate and Intervene;
- state snapshots/hashes/revisions;
- content identity and trusted replay.

Kestrel has only six cycles and a tiny deterministic evidence catalogue. Persisting a second mutable “belief truth” would duplicate information and create another tamper/version surface.

# Canonical live ordering

Keep #99 mutation ordering unchanged:

```text
opening:
intent-declaration
→ ravellan-decision C1
→ derive HQ intelligence/readout (no mutation)
→ build agenda/recommendations
→ command-set C1

C2–C5:
ravellan-decision CN
→ derive HQ intelligence/readout (no mutation)
→ build agenda/recommendations
→ command-set CN

C6:
ravellan-decision C6
→ derive HQ intelligence/readout (no mutation)
→ downstream terminal-response work
```

`command-set` continues to advance `state.cycle`.

Immediately after C2 command resolution, state may say C3 while no C3 Ravellan decision exists. **C3 intelligence is not ready yet.**

# Phase guard

`deriveV2CurrentHqBelief(session)` fails closed unless:

- standing intent exists;
- `state.cycle` is 1–6;
- exactly one authoritative `ravellan-decision` exists for `state.cycle`;
- the supplied session is already authoritative/trusted.

Use a dedicated derived-readout error equivalent to:

`v2_hq_belief_not_ready`

Do not define readiness as “last ledger entry is Ravellan”; future legitimate system entries may sit between Ravellan and Command Room. Define it semantically from cycle history.

# Trust boundary

Normal belief projection accepts only:

- authoritative live in-memory V2 session from normal sim/server flow; or
- `V2Session` returned by trusted V2 replay validation.

Never expose an API that derives player intelligence directly from arbitrary imported JSON.

# Package ownership

## `packages/shared`

Own strict serialisable **derived types only**.

Add equivalents of:

```ts
V2HqEvidenceImplication = "preparation" | "coercion" | "ambiguous"
V2HqEvidenceDiagnosticity = "indicator" | "diagnostic"
V2HqWarningState = "none" | "usable"
V2HqPublicCaseBasisState = "none" | "tentative" | "credible-source-sensitive"
V2HqAssessmentChange =
  | "initial"
  | "unchanged"
  | "narrowed"
  | "strengthened"
  | "weakened"
  | "conflicted"
  | "cleared-conflict"
  | "reopened"
  | "reversed"
```

Derived evidence shape equivalent to:

```ts
V2HqEvidence = {
  evidenceId: string
  claimId: "ravellan-intent"
  implication: V2HqEvidenceImplication
  diagnosticity: V2HqEvidenceDiagnosticity
  sourceGroup: string
  observedCycle: number
  activeThroughCycle: number
  supersedes: string[]
  summaryRef: string
  warningRole: "none" | "usable"
  publicCaseRole: "none" | "source-sensitive"
}
```

Derived assessment/snapshot equivalent to:

```ts
V2HqAssessment = {
  direction: "preparation" | "coercion" | "unclear"
  picture: "weak" | "conflicted" | "coherent"
}

V2HqBeliefSnapshot = {
  cycle: number
  evidenceHistory: V2HqEvidence[]
  activeEvidence: V2HqEvidence[]
  assessment: V2HqAssessment
  warning: V2HqWarningState
  publicCaseBasis: {
    state: V2HqPublicCaseBasisState
    direction: "preparation" | "coercion" | null
  }
  assessmentChange: V2HqAssessmentChange
}
```

These schemas/types are never nested into `v2BootstrapStateSchema`, `v2SessionSchema` or ledger state snapshots.

## `packages/content`

Own a bounded canonical serialisable definition equivalent to:

```ts
kestrelHqBeliefModel = {
  modelId: "kestrel-hq-belief-v1",
  evidenceDefinitions: ...,
  judgementRefs: ...,
  gapWatchForRefs: ...,
  assessmentChangeRefs: ...
}
```

Content owns:

- evidence IDs + static roles/lifecycles/supersession metadata;
- player-safe evidence summaries;
- judgement refs;
- exact key-gap/watch-for mapping refs;
- assessment-change refs.

Do not put hidden selector logic into copy/templates.

## `packages/sim`

Own:

- trusted history extraction;
- narrow hidden-fact selectors;
- ordinary evidence generation;
- lifecycle/supersession;
- assessment reducer;
- warning reducer;
- public-case reducer;
- exact assessment-change mapping;
- bounded reason/gap/watch-for selection.

Browser/server never reproduce these rules.

# Public sim API

Implement names equivalent in responsibility to:

```ts
deriveV2HqBeliefAtCycle(session: V2Session, cycle: number): V2HqBeliefSnapshot
```

Historical pre-command snapshot. Queried cycle must have its authoritative Ravellan decision.

```ts
deriveV2CurrentHqBelief(session: V2Session): V2HqBeliefSnapshot
```

Wrapper for current `state.cycle` + phase guard.

```ts
deriveV2HqBeliefHistory(session: V2Session): readonly V2HqBeliefSnapshot[]
```

Every cycle whose authoritative Ravellan pre-command point exists.

Keep lower reducers directly testable:

```ts
deriveV2HqAssessment(activeEvidence)
deriveV2HqWarning(activeEvidence)
deriveV2HqPublicCaseBasis(activeEvidence)
deriveV2HqAssessmentChange(previous, current)
```

Exact exported names may follow repository convention; responsibilities are frozen.

# Trusted history helpers

Build one bounded historical index internally rather than repeatedly scanning with slightly different logic.

Conceptually:

```ts
V2VerifiedCycleHistory = {
  ravellanByCycle: Map<number, V2RavellanDecisionLedgerEntry>
  commandByCycle: Map<number, V2CommandSetLedgerEntry>
}
```

Construction assumptions:

- input session has already passed trusted replay validation;
- still assert at most one entry of each relevant kind per cycle while building the helper;
- do not accept missing historical prerequisites for a selector.

# Authoritative player-order lookup

When intelligence cares what the coalition actually ordered, inspect:

`command-set.finalOrders`

not raw `commandSet.dispositions`.

Delegate and Intervene both therefore resolve to the authoritative executed order ID.

Add helper responsibility equivalent to:

```ts
findExecutedOrder(history, cycle, issueId): string | null
```

Missing required issue/order in a cycle that should contain it is a content/history error; do not silently treat it as “not selected”.

# Only authorised #100 hidden-fact selectors

These are the **only** #100 functions permitted to consume hidden Ravellan execution facts.

Their parameter types must make posture/policy row impossible to pass accidentally.

## C2 reroute monitoring

Equivalent signature:

```ts
selectRerouteEvidence(input: {
  preparationAfterC2Decision: "none" | "developing" | "ready"
  c2Action: V2RavellanNormalAction
}): EvidenceId
```

Only invoke if C2 authoritative final order includes `reroute-and-monitor`.

Inputs come from verified **C2 ravellan-decision**:

- `decision.action`;
- `postState.ravellan.preparation`.

Forbidden:

- posture;
- policy-row ID;
- C3/current preparation;
- future action/history;
- standing intent.

This freezes observation time: C2 monitoring characterises the C2 pressure system.

## C3 focused staging result

Equivalent signature:

```ts
selectFocusedStagingEvidence(input: {
  preparationAtC4ResultTime: "none" | "developing" | "ready"
}): EvidenceId
```

Only invoke if C3 final order includes `focus-staging-collection`.

Input comes from verified **C4 ravellan-decision post-state preparation**.

Forbidden:

- C3 tasking-time preparation;
- C4 action ID;
- posture;
- policy-row ID;
- C5/future history.

This is deliberate tasking/result timing: the commander chooses collection in C3; the sensor observes physical concentration at C4 result time.

# Ordinary evidence generation

Ordinary evidence needs no hidden selector.

Generate from query cycle + canonical content only:

- C1 opening ambiguous;
- C2 shipping ambiguous;
- C3 fixed logistics anomaly + bounded routine-force-disposition report;
- C4 generic pressure-pattern ambiguous.

The C3 force-disposition report is **routine-coverage reporting**, not global truth. Do not derive it from `ravellan.preparation`.

[[37-RAVELLAN-WORLD-EFFECT-MATRIX]] may vary safe situation prose according to authorised observable manifestation. Do not parse that prose back into analytic evidence.

# Evidence-history algorithm

For `deriveV2HqBeliefAtCycle(session, Q)`:

1. validate Q ∈ 1..6;
2. require authoritative Ravellan decision Q;
3. build verified cycle-history index;
4. instantiate ordinary evidence observed on/before Q from canonical content;
5. if Q >= 3 and C2 executed reroute, derive exactly one C3 reroute evidence item using C2 selector;
6. if Q >= 4 and C3 executed focused staging, derive exactly one C4 focused evidence item using C4 selector;
7. #102 later adds only its authorised Lattice/liaison evidence through an extension hook/API, not by editing reducer semantics;
8. calculate supersession at Q;
9. filter active evidence by observed/active-through + supersession;
10. derive intent assessment;
11. derive tactical warning;
12. derive public-case basis;
13. derive previous available cycle snapshot and exact assessment change;
14. select bounded safe brief refs.

No step mutates session or evidence definitions.

# #102 extension seam

Do not hard-code future Lattice logic into #100.

Provide a narrow optional derived-evidence extension seam equivalent to one of:

```ts
deriveV2HqBeliefAtCycle(session, cycle, { additionalEvidenceProvider })
```

or a sim-owned function composition where #102 appends verified derived evidence before reducers.

Requirements:

- base #100 behavior has no #102 dependency;
- additional evidence must parse against `V2HqEvidence`;
- extension cannot alter ordinary evidence, reducers or hidden selector permissions;
- #102 owns task/result persistence and verified history; #100 owns reduction.

If repository style makes a public provider callback awkward, keep the seam internal and expose a composed #102 function later. Do not create a generic plugin framework.

# Supersession

Evidence A is superseded at Q iff evidence B exists with:

- `B.observedCycle <= Q`; and
- `B.supersedes` contains `A.evidenceId`.

Do not infer supersession from same source group or similar wording.

Validate content:

- no evidence supersedes itself;
- every superseded ID exists;
- no duplicate evidence IDs;
- no cyclic supersession graph;
- `observedCycle <= activeThroughCycle`.

# Exact assessment-change mapping

Legal assessment states are exactly six. Use the following total algorithm:

1. no previous snapshot → `initial`;
2. exact previous/current equality → `unchanged`;
3. directional preparation ↔ coercion flip → `reversed`;
4. same directional direction weak → coherent → `strengthened`;
5. same directional direction coherent → weak → `weakened`;
6. current `unclear + conflicted` → `conflicted`;
7. previous `unclear + conflicted`, current `unclear + weak` → `cleared-conflict`;
8. previous any unclear, current directional → `narrowed`;
9. previous directional, current `unclear + weak` → `reopened`.

This covers all possible pairs after equality. No default/closest/array-order fallback.

Add a table-driven 36-pair exhaustiveness test.

# Key-gap/watch-for selection

Do not derive prose generically.

Use the exact assessment+warning matrix in [[23-HQ-BELIEF-AND-EVIDENCE]].

Validation must prove:

- every reachable assessment/warning pair maps exactly once;
- no unreachable pair is authored accidentally;
- safe refs exist in content.

# Player-safe brief function

Implement one pure function returning refs bounded to:

- 1 judgement;
- <=2 basis evidence summaries;
- <=1 contrary evidence summary;
- exactly 1 key gap;
- <=1 watch-for;
- <=1 assessment-change ref when changed;
- <=1 safe warning ref where material.

No full evidence history in normal Command Room DTO.

# Phase edge cases

## Command advances cycle before next Ravellan decision

Example:

- C2 command commits;
- `state.cycle = 3`;
- C3 Ravellan decision not yet present.

Current belief query → `v2_hq_belief_not_ready`.

Never return C2 analysis with C3 label.

## Historical readout

Later session can query prior cycles. Historical selectors use historical entries, never current Ravellan state.

# Imported-session safety

Required route:

```text
raw save
→ identity/content validation
→ trusted V2 replay
→ canonical V2Session
→ derive HQ intelligence
→ derive player projection
```

Forbidden:

```text
raw save
→ inspect saved ledger directly for player intelligence
```

# Content identity

#100 does not change persisted V2 schema/ruleset version, but its derived semantics must remain identity-safe.

`packages/content` must export a deterministic serialisable `kestrelHqBeliefModel` with stable `modelId = "kestrel-hq-belief-v1"` (or exact equivalent).

Add a deterministic model-definition digest test:

- stable definition → stable digest;
- changing evidence implication/diagnosticity/lifecycle/supersession/warning/public-case role or decision-significant safe semantic ref changes digest.

#100 must **not** register Kestrel in the existing V1 scenario registry merely to satisfy this test.

When #103 creates Kestrel's actual canonical V2 content identity, `contentDigest` must incorporate this model definition/digest. Record that as a #103 acceptance dependency.

# Versioning

Persisted format remains:

`0.4.0-prototype`

For #100:

- `v2BootstrapStateSchema` unchanged;
- `v2ActionLedgerEntrySchema` unchanged;
- replay transition semantics unchanged;
- no migration;
- no ruleset-version bump.

A later persisted-state issue follows normal prototype-version rule independently.

# Agent implementation order

Follow exactly this order unless repository compilation forces a trivial reorder:

1. add shared derived schemas/types only;
2. add canonical `kestrelHqBeliefModel` definition + content validation/digest test;
3. implement evidence content validation (IDs, lifecycles, supersession DAG, safe refs);
4. implement pure reducers + reducer tests;
5. implement exact 36-pair assessment-change reducer;
6. implement verified history index/final-order helper;
7. implement C2 reroute selector with narrow signature/tests;
8. implement C3 focused selector with narrow signature/tests;
9. implement ordinary evidence generator;
10. implement evidence-history/lifecycle/supersession;
11. implement `deriveV2HqBeliefAtCycle`;
12. implement current/history wrappers + phase guard;
13. implement bounded Intelligence-Chief brief derivation;
14. add hidden-posture/non-interference + historical-time tests;
15. add replay/import trust-boundary tests;
16. run independent tradecraft review;
17. run independent replay/architecture review;
18. remediate valid findings;
19. run full repository gates;
20. commit/push/close #100 and stop before #98.

Do not combine #98 recommendation implementation into this change.

# Required hostile tests

## Purity

- same trusted session → deep-equal snapshot repeatedly;
- session canonical JSON/hash/revision unchanged;
- expiry/supersession creates no state mutation;
- no #100 ledger entry;
- no ruleset-version change.

## Historical correctness

- later posture/preparation changes never rewrite earlier belief history;
- reroute C3 result uses C2 historical action/preparation;
- focused C4 result uses C4 result-time preparation;
- Delegate/Intervene both resolve through `finalOrders`;
- action-specific C4 situation prose cannot change generic C4 evidence semantics.

## Narrow selector isolation

- selector parameter types contain no posture/policy row;
- fixed authorised selector inputs + varied posture/seed/policy row → same result;
- ordinary evidence generation has no hidden-state parameter.

## Phase safety

- current query before current-cycle Ravellan decision fails closed;
- historical query before required Ravellan entry fails closed;
- malformed/duplicate history cannot pass trusted replay then project.

## Tradecraft separation

- coherent preparation without warning-role evidence → warning none;
- conflicted intent with active physical warning-role evidence → warning usable;
- public-case basis never aliases warning;
- routine C3 disposition report remains fixed/bounded rather than hidden-preparation-derived;
- contradiction remains visible until expiry/explicit supersession.

## Content/replay identity

- belief model definition digest deterministic;
- semantic change changes definition digest;
- #103 dependency records inclusion in Kestrel content digest;
- existing #99 persisted session schemas/replay vectors remain structurally valid;
- V1 unchanged.

# Independent reviews before closure

## Intelligence/tradecraft review

Fresh read-only reviewer attacks:

- hidden-posture oracle leakage;
- tactical warning inferred from broad judgment;
- public-case basis conflated with internal estimate;
- contradiction averaged away;
- routine coverage treated as omniscient;
- collection target answers more than its sensor permits;
- stale evidence never expiring;
- missing “what would change my mind?” content;
- brief becoming a disguised confidence meter or dossier.

## Replay/architecture review

Fresh read-only reviewer attacks:

- persisted #100 state/ledger creep;
- mutation during derivation;
- derivation from unverified imported history;
- current state used where historical entry required;
- content semantic drift under same digest;
- browser/server-owned analytic rules;
- accidental prototype version bump;
- #99 ordering/replay regression;
- V1 contamination;
- premature generic plugin/intelligence architecture.

All valid P0/P1 findings are mandatory. Also remediate P2 findings involving hidden-information leakage, replay identity, deterministic ambiguity, or player-facing misrepresentation.

# Closure rule

#100 closes only when:

- [[23-HQ-BELIEF-AND-EVIDENCE]] product tests are green;
- exact architecture/purity/history/content-identity tests above are green;
- assessment, warning and public-case basis are demonstrably separate;
- no hidden-posture selector exists;
- current/historical projection deterministic;
- no persisted schema/ledger/ruleset-version change occurred;
- both independent reviews have no unresolved blocker;
- repository gates pass;
- implementation commit pushed;
- #100 records evidence and closes;
- no #98 implementation started in the same run.
