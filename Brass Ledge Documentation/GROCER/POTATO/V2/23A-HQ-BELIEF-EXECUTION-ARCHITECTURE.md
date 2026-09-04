---
type: v2-hq-belief-execution-architecture
status: active
---

# HQ Belief Execution Architecture

Backlink: [[README]]

This is the exact implementation/replay authority for **#100** against the committed #99 architecture.

[[23-HQ-BELIEF-AND-EVIDENCE]] owns intelligence semantics. [[30-ARCHITECTURE-CONTRACT]] owns repository boundaries. This document freezes how an implementation agent should wire those semantics into the current code without inventing another lifecycle.

# Architectural decision

**#100 is pure derived state.**

Do not add:

- `hqBelief` to `V2Session.state`;
- persisted evidence arrays;
- persisted assessment/warning/public-case fields;
- an `hq-belief-update` ledger discriminator;
- another revision per intelligence update;
- a V2 prototype-version bump.

All #100 products are deterministically reconstructed from already-authoritative history.

This is Pattern B (“pure derived readout”) from [[30-ARCHITECTURE-CONTRACT]].

# Why this is correct for Kestrel

The committed #99 lifecycle already persists every hidden fact #100 legitimately needs:

- cycle and standing intent in authoritative state;
- one replay-verifiable `ravellan-decision` per cycle;
- Ravellan action + preparation transition in that entry;
- complete canonical `command-set` entries;
- final resolved order IDs for both Delegate and Intervene;
- full state snapshots/hashes/revisions;
- trusted replay against live content identity.

Kestrel has only six cycles. Evidence lifetimes/supersession are deterministic and tiny. Reconstructing belief from six cycles of verified history is cheaper, safer and easier to audit than storing another mutable projection.

# Canonical live ordering after #99

Current authoritative mutation order remains:

```text
opening:
intent-declaration
→ ravellan-decision C1
→ [derive HQ belief/readout — NO ledger mutation]
→ command-set C1

C2–C5:
ravellan-decision CN
→ [derive HQ belief/readout — NO ledger mutation]
→ command-set CN

C6:
ravellan-decision C6
→ [derive HQ belief/readout — NO ledger mutation]
→ later terminal-response work owned downstream
```

`command-set` continues to advance `state.cycle` by one.

Therefore, immediately after C2 command resolution the state is C3 but the **C3 intelligence brief is not ready** until the C3 `ravellan-decision` has been appended.

Do not show a new command agenda/brief in that intermediate state.

# Required phase guard

`deriveV2CurrentHqBelief(session)` must fail closed unless:

- standing intent exists;
- `state.cycle` is 1–6;
- the authoritative ledger contains exactly one `ravellan-decision` for `state.cycle`;
- no invalid duplicate/reordered history is accepted.

Recommended error code/name:

`v2_hq_belief_not_ready`

Do not define readiness as “the latest ledger entry is Ravellan” because future system entries may legitimately sit between Ravellan and the command room. Define readiness semantically from verified cycle history.

# Trust boundary

Normal player belief projection may be called only on:

- an authoritative live in-memory V2 session produced by normal sim/server transitions; or
- a session returned by trusted V2 replay validation.

Do not expose a route that accepts arbitrary raw imported JSON and directly derives intelligence from it.

# Package ownership

## `packages/shared`

Own strict serialisable **derived** contracts only.

Add types/schemas equivalent to:

```ts
V2HqEvidenceImplication = "preparation" | "coercion" | "ambiguous"
V2HqEvidenceDiagnosticity = "indicator" | "diagnostic"
V2HqWarningState = "none" | "usable"
V2HqPublicCaseBasis = "none" | "tentative" | "credible-source-sensitive"
V2HqAssessmentChange =
  | "initial"
  | "unchanged"
  | "narrowed"
  | "strengthened"
  | "more-uncertain"
  | "reversed"
```

Derived evidence/readout schemas may be exported from shared, but they are **not nested into `v2BootstrapStateSchema` or any ledger-entry state snapshot**.

Add a strict internal/readout shape equivalent to:

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

and:

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
    state: V2HqPublicCaseBasis
    direction: "preparation" | "coercion" | null
  }
  assessmentChange: V2HqAssessmentChange
}
```

Player-safe presentation refs are a separate strict derived DTO. Do not put hidden selector facts into it.

## `packages/content`

Own the bounded Kestrel evidence catalogue and player-safe copy refs:

- metadata for each evidence ID;
- summary refs;
- key-gap refs;
- watch-for refs;
- canonical judgement text refs/meanings.

Do not put hidden selection logic in content prose/templates.

## `packages/sim`

Own:

- verified-history extraction;
- evidence-ID selection from explicitly authorised facts;
- lifecycle/supersession;
- intent reducer;
- warning reducer;
- public-case reducer;
- assessment-change classification;
- bounded reason/gap/watch-for selection.

No browser/server code reproduces these rules.

# Exact public sim API

Implement names equivalent in responsibility to:

```ts
deriveV2HqBeliefAtCycle(
  session: V2Session,
  cycle: number,
): V2HqBeliefSnapshot
```

Historical readout. Requires the queried cycle's authoritative Ravellan decision to exist.

```ts
deriveV2CurrentHqBelief(
  session: V2Session,
): V2HqBeliefSnapshot
```

Convenience wrapper around `state.cycle` with the phase guard above.

```ts
deriveV2HqBeliefHistory(
  session: V2Session,
): readonly V2HqBeliefSnapshot[]
```

Returns every cycle for which the authoritative Ravellan pre-command point exists. Used later for debrief/history and tests.

Keep lower-level reducers separately testable:

```ts
deriveV2HqAssessment(activeEvidence)
deriveV2HqWarning(activeEvidence)
deriveV2HqPublicCaseBasis(activeEvidence)
```

Exact exported names may follow repository conventions; responsibilities and boundaries are frozen.

# Verified-history extraction

Do not use client command intent as evidence of what actually happened. Use the persisted authoritative results.

## Final-order lookup

For any player choice used by intelligence derivation, inspect:

`command-set.finalOrders`

not raw `commandSet.dispositions`.

Reason:

- Delegate persists the actual authoritative recommended order in `finalOrders`;
- Intervene persists the chosen order there too;
- belief should care what HQ actually ordered, not how the UI arrived at it.

# Exact #100 hidden-fact selectors

These are the **only** #100 selectors permitted to read hidden Ravellan execution facts.

Their signatures should be narrow enough that hidden posture is not representable.

## C2 reroute monitoring

Internal selector responsibility equivalent to:

```ts
selectRerouteEvidence({
  preparationAfterC2Decision,
  c2Action,
})
```

Inputs come from the verified **C2 `ravellan-decision` entry**:

- `entry.decision.action` (must be normal C2 action);
- `entry.postState.ravellan.preparation`.

Do not use:

- C3/current preparation;
- hidden posture;
- policy-row ID;
- future action;
- player standing intent.

Only invoke if C2 authoritative `finalOrders` contains `reroute-and-monitor`.

This freezes the time-of-observation rule: the monitoring opportunity characterises the C2 pressure system, not whatever Ravellan becomes later.

## C3 focused staging collection

Internal selector responsibility equivalent to:

```ts
selectFocusedStagingEvidence({
  preparationAtC4ResultTime,
})
```

Only invoke if C3 authoritative `finalOrders` contains `focus-staging-collection`.

Result-time input comes from the verified **C4 `ravellan-decision.postState.ravellan.preparation`**.

Do not use:

- C3 preparation at tasking time;
- hidden posture;
- C4 action ID;
- policy-row ID;
- future history.

This is a deliberate collection mechanic: the commander tasks a sensor in C3; the sensor observes physical concentration at the C4 result point.

# Ordinary evidence generation

No ordinary evidence selector needs hidden posture or preparation.

Generate from queried cycle/content only:

- C1 `opening-pressure-ambiguous`;
- C2 `shipping-probe-ambiguous`;
- C3 fixed `staging-logistics-anomaly` + `combat-elements-dispersed`;
- C4 `cycle4-pressure-pattern-ambiguous`.

[[37-RAVELLAN-WORLD-EFFECT-MATRIX]] may vary the **safe situation prose** by hidden action through an authorised world-effect projection, but all C4 variants map to the same ordinary ambiguous evidence semantics.

Do not feed action-specific prose back into the analytic reducer as hidden extra evidence.

# Evidence history algorithm

For `deriveV2HqBeliefAtCycle(session, Q)`:

1. validate `Q` in 1–6;
2. require an authoritative Ravellan decision for Q;
3. create all ordinary evidence observed on/before Q;
4. if Q >= 3 and C2 final order was reroute, derive exactly one C3 reroute evidence item from the C2 selector;
5. if Q >= 4 and C3 final order was focused staging, derive exactly one C4 focused evidence item from the C4 selector;
6. later #102 may add its explicitly authorised directed evidence to the same history;
7. compute each item's status at Q from observed/active-through/supersedes rules;
8. active evidence = active + not superseded;
9. reduce assessment;
10. reduce warning;
11. reduce public-case basis;
12. derive previous-cycle snapshot where available and classify assessment change;
13. derive bounded player-safe brief refs.

Do not mutate session or evidence records while doing this.

# Supersession algorithm

Supersession is explicit by evidence ID.

At queried cycle Q, evidence A is superseded iff there exists evidence B such that:

- B.observedCycle <= Q; and
- `B.supersedes` contains A.evidenceId.

Do not supersede merely because two reports share a source group or question theme.

This prevents accidental erasure of legitimate contradiction across different collection questions.

# Assessment-change algorithm

Given previous P and current C:

1. no previous snapshot → `initial`;
2. exact direction + picture equal → `unchanged`;
3. P.direction = unclear and C.direction directional → `narrowed`;
4. same directional direction with P.picture weak and C.picture coherent → `strengthened`;
5. preparation ↔ coercion direction flip → `reversed`;
6. directional → unclear/conflicted, or same-direction coherent → weak → `more-uncertain`;
7. otherwise use the closest of the above; do not add a generic progress score.

The implementation must make every legal pair deterministic. Add a table-driven unit test over the six legal assessment states.

# Player-safe brief derivation

Implement one pure function from the belief snapshot + bounded content refs.

Maximum default payload:

- one judgement ref;
- max two basis evidence refs;
- max one contrary evidence ref;
- exactly one key-gap ref;
- zero/one watch-for ref;
- zero/one assessment-change ref;
- safe warning statement only when operationally material.

Do not send the entire evidence history to the normal browser DTO by default. Optional later detail may be derived separately.

# Phase / current-state edge cases

## After command advances the cycle, before next Ravellan decision

Example:

- C2 command finishes;
- state.cycle becomes 3;
- no C3 Ravellan entry exists yet.

`deriveV2CurrentHqBelief` must reject `v2_hq_belief_not_ready`.

Do **not** silently return the C2 brief under a C3 header.

## Historical queries

A completed later session may query C2/C3/C4 snapshots from the historical ledger. Later Ravellan state must not contaminate historical selectors.

This is why reroute uses the C2 Ravellan entry and focused collection uses the C4 entry rather than `session.state.ravellan` indiscriminately.

# Imported-session safety

Server/import flow:

```text
raw save
→ parse identity boundary
→ trusted V2 replay validation
→ canonical V2Session
→ derive HQ belief/player projection
```

Never:

```text
raw save
→ derive belief from unverified ledger
```

Belief derivation does not duplicate replay hash/revision validation. It relies on the authoritative live/replayed session contract.

# Versioning

#100 adds derived types/functions/content only.

Therefore:

- keep `v2CurrentRulesetVersion = 0.4.0-prototype`;
- `v2BootstrapStateSchema` unchanged;
- `v2ActionLedgerEntrySchema` unchanged;
- no old V2 save rejection solely because #100 code exists;
- no migration.

A later issue that persists new campaign truth must independently follow the prototype-version rule.

# Implementation order for an agent

Follow this order to minimise rework:

1. add shared derived schemas/types **without changing session state**;
2. add Kestrel evidence catalogue/content refs;
3. implement pure evidence lifecycle + reducers with table tests;
4. implement verified historical ledger helpers;
5. implement C2 reroute selector with narrow signature/tests;
6. implement C3 focused selector with narrow signature/tests;
7. implement `deriveV2HqBeliefAtCycle`;
8. implement current/history wrappers + phase guard;
9. implement player-safe Intelligence-Chief brief derivation;
10. add hidden-posture/non-interference tests;
11. add replay/import integration tests proving projection occurs only after trusted replay;
12. run full V1/V2 gates.

Do not start #98 in the same implementation run.

# Required hostile tests

Beyond [[23-HQ-BELIEF-AND-EVIDENCE]] tests, prove:

## Purity

- repeated derivation from identical session is deep-equal;
- session canonical JSON/hash/revision unchanged after derivation;
- evidence expiry does not mutate the session;
- no #100 ledger entry appears.

## Historical correctness

- later posture/preparation changes cannot rewrite earlier belief history;
- reroute C3 result uses historical C2 preparation/action, not C3/current state;
- focused C4 result uses C4 result-time preparation, not C3 tasking-time state or C5 state;
- Delegate and Intervene both resolve via `finalOrders` correctly.

## Narrow-selector isolation

- selector parameter types contain no posture;
- holding authorised selector inputs fixed while posture/policy-row/seed differ → same result;
- ordinary evidence generation has no hidden-state input.

## Phase safety

- current belief before current-cycle Ravellan decision fails closed;
- historical cycle without its required Ravellan entry fails closed;
- duplicate/malformed history cannot be accepted through trusted replay then projected.

## Compatibility

- existing #99 replay vectors remain valid;
- ruleset version remains `0.4.0-prototype`;
- V1 tests unchanged;
- no raw hidden fields in normal safe readout.

# Independent post-implementation reviews

Before #100 closes, run two fresh read-only reviews.

## Intelligence/tradecraft review

Attack:

- hidden-posture oracle leakage;
- warning accidentally inferred from broad assessment;
- public case conflated with internal judgement;
- contradiction averaged away;
- collection results that answer more than the named sensor/question permits;
- stale reporting that never expires;
- player brief that hides what does not fit or becomes a confidence meter in prose.

## Replay/architecture review

Attack:

- any new persisted #100 state;
- hidden mutation during derivation;
- deriving from unverified imported ledgers;
- using current state where historical entry is required;
- client/browser-owned analytic logic;
- accidental `0.5.0` bump despite no persisted change;
- #99 ordering/replay regression;
- V1 contamination.

Remediate valid findings before closure.

# Closure rule

#100 closes only when:

- product tests from [[23-HQ-BELIEF-AND-EVIDENCE]] are green;
- exact execution/purity/history tests above are green;
- warning/public-case/assessment are demonstrably separate;
- no hidden-posture selector exists;
- current/historical projection is deterministic;
- no persisted schema/ledger/version change occurred;
- both independent reviews have no unresolved blocker;
- repository gates pass;
- implementation commit is pushed;
- issue #100 records evidence and closes;
- implementation stops before #98.
