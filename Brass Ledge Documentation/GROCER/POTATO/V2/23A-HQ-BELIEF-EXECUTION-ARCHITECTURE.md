---
type: v2-hq-belief-execution-architecture
status: active
---

# HQ Belief Execution Architecture

Backlink: [[README]]

This is the exact implementation/replay authority for **#100** against committed #99.

[[23-HQ-BELIEF-AND-EVIDENCE]] owns intelligence semantics. [[30-ARCHITECTURE-CONTRACT]] owns repository boundaries.

# 1. Architectural decision — pure derivation

**#100 is pure derived state.**

Do not add HQ belief/evidence/assessment/warning/public-case state to persisted `V2Session`, do not add an `hq-belief-update` ledger entry, do not increment revision for analysis, and do not bump the persisted V2 ruleset version.

All #100 products reconstruct deterministically from trusted V2 history + canonical Kestrel intelligence-model content.

Pattern: **B — pure derived readout** from [[30-ARCHITECTURE-CONTRACT]].

# 2. Canonical live phase

Keep #99 mutation ordering unchanged:

```text
intent-declaration
→ ravellan-decision C1
→ derive HQ intelligence (pure)
→ agenda / recommendations
→ command-set C1

ravellan-decision CN
→ derive HQ intelligence (pure)
→ agenda / recommendations
→ command-set CN
```

C6 follows the same pre-terminal readout principle after its Ravellan decision.

`command-set` still advances `state.cycle`.

After a command advances to N+1, the N+1 Intel brief is **not ready** until `ravellan-decision N+1` exists.

`deriveV2CurrentHqBelief` must fail closed with an error equivalent to:

`v2_hq_belief_not_ready`

Readiness is semantic (“current cycle has exactly one authoritative Ravellan decision”), not “latest entry happens to be Ravellan.”

# 3. Trust boundary

Normal belief projection accepts only:

- an authoritative live V2 session produced by normal sim/server transitions; or
- a V2 session returned by trusted replay validation.

Required import flow:

```text
raw save
→ identity/content validation
→ trusted V2 replay
→ canonical V2Session
→ derived HQ intelligence
→ player-safe projection
```

Never derive normal player intelligence directly from unverified imported ledger fields.

# 4. Package ownership

## `packages/shared`

Own strict **derived-only** schemas/types for:

- evidence implication `preparation|coercion|ambiguous`;
- diagnosticity `indicator|diagnostic`;
- warning `none|usable`;
- public-case basis `none|tentative|credible-source-sensitive`;
- six legal assessment states;
- exact assessment-change enum;
- derived snapshot / player-safe ref shapes.

None may be nested into `v2BootstrapStateSchema`, `v2SessionSchema` or ledger state snapshots.

Required change enum:

```ts
"initial"
| "unchanged"
| "narrowed"
| "strengthened"
| "weakened"
| "conflicted"
| "cleared-conflict"
| "reopened"
| "reversed"
```

## `packages/content`

Own canonical serialisable definition equivalent to:

```ts
kestrelHqBeliefModel = {
  modelId: "kestrel-hq-belief-v1",
  evidenceDefinitions: ...,
  judgementRefs: ...,
  gapWatchForRefs: ...,
  assessmentChangeRefs: ...
}
```

Validate IDs, lifecycles, supersession DAG, safe refs, and complete assessment+warning briefing map.

Copy/templates contain no hidden selector logic.

## `packages/sim`

Own:

- trusted cycle-history indexing;
- executed-order lookup;
- **authorised observation extraction from hidden verified history**;
- observation-fact → evidence mapping;
- ordinary evidence generation;
- lifecycle/supersession;
- assessment/warning/public-case reducers;
- exact assessment-change mapping;
- bounded player-safe brief derivation.

Browser/server never reproduce these rules.

# 5. Public sim API

Implement responsibilities equivalent to:

```ts
deriveV2HqBeliefAtCycle(session: V2Session, cycle: number): V2HqBeliefSnapshot

deriveV2CurrentHqBelief(session: V2Session): V2HqBeliefSnapshot

deriveV2HqBeliefHistory(session: V2Session): readonly V2HqBeliefSnapshot[]
```

Keep reducers directly unit-testable:

```ts
deriveV2HqAssessment(activeEvidence)
deriveV2HqWarning(activeEvidence)
deriveV2HqPublicCaseBasis(activeEvidence)
deriveV2HqAssessmentChange(previous, current)
```

Exact exported names may follow repository conventions; responsibilities may not move to server/web.

# 6. Trusted history index

Build one bounded internal index:

```ts
V2VerifiedCycleHistory = {
  ravellanByCycle: Map<number, V2RavellanDecisionLedgerEntry>
  commandByCycle: Map<number, V2CommandSetLedgerEntry>
}
```

Input session has already passed trusted replay. Still fail on duplicate/missing prerequisite entries rather than guessing.

When intelligence cares what HQ actually ordered, inspect authoritative:

`command-set.finalOrders`

not raw client dispositions.

Delegate and Intervene therefore resolve through the same executed-order path.

# 7. Four-layer observation boundary

Maintain this direction of dependency:

```text
verified hidden history
→ authorised observation extractor
→ bounded source fact
→ evidence mapper
→ reducers
→ player-safe brief
```

Never skip from hidden history directly to assessment/player prose.

The purpose is structural: raw hidden simulation enums are visible only inside explicitly authorised observation extractors. Evidence mapping and reducers cannot receive posture or arbitrary world state.

## Sim-private source facts

Use small semantic types equivalent to:

```ts
type V2RerouteSourceFact =
  | "auxiliary-integrated"
  | "coercive-tasking"
  | "unclear"

type V2FocusedStagingSourceFact =
  | "concentration-observed"
  | "no-concentration-observed"
```

These are not player DTOs and need not be persisted/shared unless repository style genuinely requires it.

# 8. Authorised observation extractor — C2 reroute

Only execute if C2 `finalOrders` contains `reroute-and-monitor`.

Hidden-history extractor signature equivalent to:

```ts
observeC2RerouteFact(input: {
  preparationAfterC2Decision: "none" | "developing" | "ready"
  c2Action: V2RavellanNormalAction
}): V2RerouteSourceFact
```

Inputs come only from verified **C2 `ravellan-decision`**:

- `decision.action`;
- `postState.ravellan.preparation`.

Forbidden: posture, policy row, C3/current preparation, future history, standing intent.

Mapping:

- developing|ready + `probe_shipping` → `auxiliary-integrated`;
- none + `probe_shipping|seed_deception` → `coercive-tasking`;
- otherwise → `unclear`.

Then a separate pure evidence mapper:

```ts
mapRerouteFactToEvidence(fact: V2RerouteSourceFact): EvidenceId
```

maps only to the three exact C3 reroute evidence IDs in [[23-HQ-BELIEF-AND-EVIDENCE]].

The evidence mapper cannot import/read Ravellan posture/preparation/action.

# 9. Authorised observation extractor — C3 focused staging

Only execute if C3 `finalOrders` contains `focus-staging-collection`.

At C4 result time, hidden-history extractor equivalent to:

```ts
observeC4FocusedStagingFact(input: {
  preparationAtC4ResultTime: "none" | "developing" | "ready"
}): V2FocusedStagingSourceFact
```

Input comes only from verified **C4 `ravellan-decision.postState.ravellan.preparation`**.

Forbidden: posture, C4 action, policy row, C3 tasking-time preparation, C5/current/future state.

Mapping:

- developing|ready → `concentration-observed`;
- none → `no-concentration-observed`.

Separate evidence mapper:

```ts
mapFocusedStagingFactToEvidence(fact: V2FocusedStagingSourceFact): EvidenceId
```

maps to `focused-staging-buildup` / `focused-staging-empty` only.

The mapper/reducers do not see raw preparation.

# 10. Ordinary evidence generation

No ordinary evidence extractor reads hidden posture/preparation/action.

Instantiate from query cycle + canonical content only:

- C1 opening ambiguous;
- C2 shipping ambiguous;
- C3 fixed logistics anomaly + bounded **routine-coverage** force-disposition report;
- C4 generic pressure-pattern ambiguous.

C3 routine coverage is intentionally incomplete and not derived from hidden preparation.

[[37-RAVELLAN-WORLD-EFFECT-MATRIX]] may vary safe situation prose through authorised observable manifestation. That prose never feeds back into evidence selection.

# 11. Evidence-history algorithm

For `deriveV2HqBeliefAtCycle(session, Q)`:

1. validate Q ∈ 1..6;
2. require authoritative Ravellan decision Q;
3. build verified cycle-history index;
4. instantiate ordinary evidence observed on/before Q;
5. if Q >= 3 and C2 executed reroute: derive C2 source fact → map to exactly one C3 reroute evidence item;
6. if Q >= 4 and C3 executed focused staging: derive C4 source fact → map to exactly one C4 focused evidence item;
7. later #102 may append only schema-valid explicitly authorised directed evidence through a narrow sim-owned extension seam;
8. derive supersession at Q;
9. filter active evidence by observed/active-through + supersession;
10. reduce assessment;
11. reduce warning;
12. reduce public-case basis;
13. derive previous available cycle snapshot + exact assessment change;
14. derive bounded player-safe brief refs.

No step mutates session/evidence definitions.

# 12. #102 extension seam

#100 has no implementation dependency on #102.

Provide a narrow internal composition seam so #102 can append verified `V2HqEvidence` before reducers without changing reducer semantics.

Requirements:

- no generic plugin framework;
- additional evidence must validate against the same derived evidence schema;
- extension cannot alter ordinary evidence or hidden observation permissions;
- #102 owns task/capability/result persistence;
- #100 owns analysis reduction.

# 13. Supersession/content validation

Evidence A is superseded at Q iff B exists with:

- `B.observedCycle <= Q`; and
- `B.supersedes` contains A ID.

Never infer supersession from similar topic/source.

Content validation rejects:

- duplicate evidence IDs;
- self-supersession;
- missing superseded IDs;
- supersession cycles;
- observed cycle after active-through cycle;
- invalid warning/public-case role combination refs;
- missing briefing refs.

# 14. Exact assessment-change mapping

For previous P and current C:

1. no P → `initial`;
2. P == C → `unchanged`;
3. preparation ↔ coercion directional flip → `reversed`;
4. same directional weak → coherent → `strengthened`;
5. same directional coherent → weak → `weakened`;
6. C == unclear/conflicted → `conflicted`;
7. P == unclear/conflicted and C == unclear/weak → `cleared-conflict`;
8. P unclear and C directional → `narrowed`;
9. P directional and C == unclear/weak → `reopened`.

This exhausts all 36 pairs of the six legal assessment states after equality. No fallback.

# 15. Briefing map / payload

Use exact assessment+warning gap/watch-for matrix from [[23-HQ-BELIEF-AND-EVIDENCE]].

Normal brief maximum:

- 1 judgement ref;
- <=2 basis refs;
- <=1 contrary ref;
- exactly 1 key-gap ref;
- <=1 watch-for ref;
- <=1 change ref;
- <=1 warning ref where material.

Validate all nine reachable assessment+warning combinations have exactly one authored semantic mapping. Unreachable combinations fail content validation.

# 16. Phase / historical edge cases

After C2 command advances `state.cycle = 3` but before C3 Ravellan decision:

- current HQ belief → `v2_hq_belief_not_ready`;
- never return C2 brief under C3 label.

Historical queries use historical entries. Later state cannot rewrite earlier source facts/evidence/snapshots.

# 17. Content identity

#100 does not change persisted schema/ruleset version, but derived semantics cannot drift silently.

`packages/content` exports deterministic serialisable `kestrelHqBeliefModel` with stable model ID `kestrel-hq-belief-v1` (or exact equivalent).

Definition/digest covers decision-significant semantics:

- evidence implication/diagnosticity/lifecycle/supersession;
- warning/public-case roles;
- semantic judgement/gap/watch-for/change refs;
- model version.

Locale/render-only wording may remain outside the semantic digest if repository content architecture supports stable semantic refs.

#100 tests model-definition digest directly. Do not register Kestrel prematurely in the existing V1 scenario registry.

#103 must include this definition/digest in final Kestrel `contentDigest`.

# 18. Versioning

#100 preserves:

`v2CurrentRulesetVersion = 0.4.0-prototype`

No changes to persisted bootstrap state, action-ledger union, replay transitions or migration behavior.

A later genuinely persisted V2 issue follows the normal prototype-version rule independently.

# 19. Agent implementation order

Follow unless trivial compile dependency forces a harmless reorder:

1. shared derived types;
2. canonical `kestrelHqBeliefModel` + validation/digest tests;
3. pure reducers;
4. exhaustive 36-pair change reducer;
5. verified cycle-history + final-order helpers;
6. C2 reroute source-fact extractor + evidence mapper;
7. C4 focused source-fact extractor + evidence mapper;
8. ordinary evidence generation/lifecycle/supersession;
9. historical/current/history belief APIs;
10. phase guard;
11. bounded Intel-Chief brief;
12. non-interference/history/purity tests;
13. replay/import trust-boundary tests;
14. independent tradecraft review;
15. independent replay/architecture review;
16. remediate valid findings;
17. full repository gates;
18. commit/push/update/close #100;
19. stop before #98.

# 20. Hostile tests

## Purity

- repeated derivation deep-equal;
- canonical state/hash/revision unchanged;
- expiry/supersession no mutation;
- no #100 ledger entry/version change.

## Observation boundary

- evidence mappers cannot accept/import hidden posture/preparation/action;
- fixed raw authorised extractor inputs + varied posture/policy row/seed → same source fact;
- fixed source fact always maps to same evidence;
- ordinary evidence has no hidden-state input.

## Historical integrity

- reroute C3 uses C2 history;
- focused C4 uses C4 result-time history;
- later state cannot rewrite earlier snapshots;
- Delegate/Intervene both resolve from `finalOrders`;
- action-specific world prose never changes generic evidence.

## Tradecraft separation

- coherent preparation + no warning-role evidence → warning none;
- conflicted assessment + physical warning-role evidence → warning usable;
- public-case basis not alias of warning/assessment;
- contradiction survives until expiry/explicit supersession;
- routine C3 report never reads hidden preparation.

## Phase/import

- pre-Ravellan current query fails closed;
- raw/unverified imported history cannot project;
- malformed/duplicate history cannot pass trusted replay then project.

## Content identity

- model digest deterministic;
- semantic evidence-model mutation changes digest;
- render-only copy change need not change semantic digest where refs remain identical;
- #103 dependency recorded.

# 21. Independent reviews

## Intelligence/tradecraft reviewer

Attack hidden-oracle leakage, raw-truth-to-analysis shortcuts, assessment/warning/public-case conflation, contradiction averaging, routine coverage treated as omniscient, overpowered collection, stale evidence, missing watch-for semantics, and dossier/confidence-meter presentation.

## Replay/architecture reviewer

Attack persisted #100 creep, derivation mutation, unverified-import derivation, current-state-for-history bugs, content semantic drift under same identity, browser/server analytic duplication, accidental ruleset bump, #99 replay/order regression, V1 contamination, and premature generic framework work.

All P0/P1 findings mandatory; also fix P2s involving hidden-information leakage, replay/content identity, deterministic ambiguity or player-facing misrepresentation.

# 22. Closure

#100 closes only when [[23-HQ-BELIEF-AND-EVIDENCE]] and this architecture are implemented/tested, assessment/warning/public-case are demonstrably separate, observation boundary is narrow, no persisted schema/ledger/version change occurred, both independent reviews are clear after remediation, full gates pass, commit is pushed, issue evidence is recorded, and no #98 implementation was started in the same run.
