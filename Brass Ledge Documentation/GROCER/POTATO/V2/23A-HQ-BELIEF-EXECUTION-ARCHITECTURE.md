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

All #100 products reconstruct deterministically from a trusted V2 session + an explicitly supplied canonical Kestrel HQ-belief model definition.

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

C6 follows the same pre-terminal readout principle.

`command-set` still advances `state.cycle`.

After command advances to N+1, N+1 Intel brief is **not ready** until `ravellan-decision N+1` exists.

Current derivation fails closed with an error equivalent to:

`v2_hq_belief_not_ready`

Readiness is semantic (“current cycle has exactly one authoritative Ravellan decision”), not “last entry is Ravellan.”

# 3. Trust boundary

Normal belief derivation accepts only:

- an authoritative live `V2Session` from normal sim/server transitions; or
- the canonical `V2Session` returned by `validateV2ReplaySkeleton(...)` after trusted identity/agenda validation.

Required import flow:

```text
raw save
→ resolve trusted live V2 identity/content
→ validateV2ReplaySkeleton(raw, trustedIdentity, trustedAgendaProvider)
→ returned canonical V2Session
→ derive HQ intelligence(session, trustedBeliefModel)
→ player-safe projection
```

Do not invent another validated-session wrapper merely for #100.

Never derive normal player intelligence directly from unverified imported ledger data.

# 4. Kestrel-only guard

#100 is not a generic intelligence framework.

The supplied model has exact:

`scenarioId = "kestrel-strait"`

Every public #100 derivation checks:

`session.identity.scenarioId === model.scenarioId`

otherwise fail closed with an error equivalent to:

`v2_hq_belief_unsupported_scenario`.

Do not silently apply Kestrel evidence rules to another V2 scenario.

# 5. Exact file placement

Unless a trivial existing naming convention forces a harmless variation, implement in:

## Shared

`packages/shared/src/v2.ts`

Add strict **derived-only** schemas/types, including the model-definition schema. `packages/shared/src/index.ts` already exports `./v2.js`; no additional barrel file is required.

## Content

Create:

`packages/content/src/v2-kestrel-hq-belief.ts`

Export it from:

`packages/content/src/index.ts`

This file owns `kestrelHqBeliefModel` and its content validation/digest helper/tests.

Do not register Kestrel in the existing V1 `scenario-registry.ts` during #100.

## Sim

Create:

`packages/sim/src/v2-hq-belief.ts`

Export it from:

`packages/sim/src/index.ts`

Do **not** put the entire #100 subsystem into the already-large `packages/sim/src/v2.ts`.

`v2-hq-belief.ts` may import V2 session/ledger/model types from `@brass-ledger/shared` and narrow helpers/types from local `./v2.js` where needed.

**Production sim must not import `@brass-ledger/content`.** `@brass-ledger/content` is only a devDependency of sim. The resolved model is supplied as a function argument.

# 6. Shared derived types

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

Evidence shape equivalent to:

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

Assessment/snapshot equivalent to:

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

These types are never nested into persisted bootstrap/session/ledger state.

# 7. Shared belief-model definition schema

Define a strict serialisable `V2HqBeliefModelDefinition` schema/type in `packages/shared/src/v2.ts`.

It must include, conceptually:

```ts
{
  modelId: "kestrel-hq-belief-v1"
  scenarioId: "kestrel-strait"
  reducerSemanticsId: "kestrel-binary-hypothesis-v1"

  triggerOrderIds: {
    rerouteAndMonitor: "reroute-and-monitor"
    focusStagingCollection: "focus-staging-collection"
  }

  rerouteSourceFactMatrix: {
    // exact preparation × normal-action keys → bounded source fact
  }

  focusedStagingSourceFactByPreparation: {
    none: "no-concentration-observed"
    developing: "concentration-observed"
    ready: "concentration-observed"
  }

  evidenceDefinitions: [...]
  judgementRefs: ...
  gapWatchForRefs: ...
  assessmentChangeRefs: ...
  warningRefs: ...
}
```

The exact serialisable shape may be made more ergonomic, but it must remain strict, bounded and Kestrel-specific.

## Why the source-fact matrices are content data

They are **decision-significant derived semantics**. If C2 preparation/action combinations map to different source facts after a software update, an old campaign could be re-analysed differently even though persisted state is identical.

Therefore the bounded Kestrel mapping tables belong to the canonical model definition and ultimately to content identity.

This is not a generic rule engine. There are exactly two small authored lookup tables for #100.

## Reducer semantics ID

The assessment/warning/public-case reducers remain ordinary explicit TypeScript, not a data-driven inference engine.

But code must require the exact known:

`reducerSemanticsId = "kestrel-binary-hypothesis-v1"`

Unknown ID fails closed.

Any future semantic reducer change that would change historical output requires a new semantics/model ID and therefore new Kestrel content identity.

Add fixed truth-table regression tests so an implementation cannot change reducer behavior while casually leaving the semantics ID untouched.

# 8. Content definition

`packages/content/src/v2-kestrel-hq-belief.ts` instantiates the shared model-definition schema.

It owns:

- exact trigger order IDs;
- exact two source-fact mapping tables;
- evidence IDs + roles/lifecycles/supersession;
- judgement refs;
- exact key-gap/watch-for refs;
- assessment-change refs;
- warning refs;
- model/reducer semantics IDs.

Copy/templates contain no arbitrary hidden selectors outside those bounded serialisable tables.

# 9. Content semantic digest

Content file exports a deterministic helper or constant equivalent to:

`kestrelHqBeliefModelDigest`

Use stable canonical serialization + SHA-256. It may implement the small stable-JSON/hash helper locally in content using Node `crypto`; **do not add a production dependency from content to sim merely to reuse `v2Sha256`**.

Digest covers the canonical serialisable model definition.

Tests:

- same definition → same digest;
- evidence implication/diagnosticity/lifecycle/supersession/warning/public-case change → digest changes;
- trigger order ID/source-fact matrix/reducer-semantics ID change → digest changes;
- semantic ref ID change → digest changes;
- render-only locale string outside the semantic definition need not affect this digest.

#103 later incorporates the full model definition/digest into Kestrel's actual content identity.

# 10. Sim API takes the model explicitly

Because sim cannot production-import content, APIs become equivalent to:

```ts
deriveV2HqBeliefAtCycle(
  session: V2Session,
  model: V2HqBeliefModelDefinition,
  cycle: number,
): V2HqBeliefSnapshot

deriveV2CurrentHqBelief(
  session: V2Session,
  model: V2HqBeliefModelDefinition,
): V2HqBeliefSnapshot

deriveV2HqBeliefHistory(
  session: V2Session,
  model: V2HqBeliefModelDefinition,
): readonly V2HqBeliefSnapshot[]
```

Lower reducers remain directly testable.

Sim validates the model schema/known `modelId`/`scenarioId`/`reducerSemanticsId` at the boundary or relies on a shared parsed type from trusted content; raw arbitrary model input must not silently enable another inference regime.

# 11. Trusted history index

Build one bounded internal index:

```ts
V2VerifiedCycleHistory = {
  ravellanByCycle: Map<number, V2RavellanDecisionLedgerEntry>
  commandByCycle: Map<number, V2CommandSetLedgerEntry>
}
```

Input session already passed trusted replay. Still fail on duplicate/missing prerequisites rather than guessing.

When intelligence cares what HQ actually ordered, inspect authoritative:

`command-set.finalOrders`

not raw dispositions.

Use trigger IDs from `model.triggerOrderIds`, never duplicated string literals in sim.

# 12. Four-layer observation boundary

```text
verified hidden history
→ authorised observation extractor
→ bounded source fact
→ evidence mapper
→ reducers
→ player-safe brief
```

Raw hidden simulation enums appear only inside authorised observation extractors. Evidence mapping/reducers never receive posture/arbitrary world state.

Sim-private source fact types:

```ts
V2RerouteSourceFact =
  | "auxiliary-integrated"
  | "coercive-tasking"
  | "unclear"

V2FocusedStagingSourceFact =
  | "concentration-observed"
  | "no-concentration-observed"
```

# 13. C2 reroute extractor

Invoke only if C2 authoritative final order matches `model.triggerOrderIds.rerouteAndMonitor`.

Extractor receives only verified C2:

- normal action;
- post-decision preparation.

No posture/policy row/current/future state/seed/intent.

It performs exact lookup in `model.rerouteSourceFactMatrix` and returns one bounded source fact.

A separate mapper maps the source fact to the exact evidence ID defined by the model. The evidence mapper cannot import/read Ravellan state.

# 14. C4 focused-staging extractor

Invoke only if C3 final order matches `model.triggerOrderIds.focusStagingCollection`.

At C4 result time, extractor receives only verified C4 post-decision preparation.

It looks up `model.focusedStagingSourceFactByPreparation` and returns one bounded source fact.

Separate mapper maps source fact to the exact focused evidence ID. Mapper/reducers never receive preparation.

# 15. Ordinary evidence

No hidden input.

Instantiate from cycle + canonical model definitions:

- C1 opening ambiguous;
- C2 shipping ambiguous;
- C3 fixed logistics anomaly + bounded routine-coverage force-disposition report;
- C4 generic pressure-pattern ambiguous.

C3 routine coverage never derives from hidden preparation.

Safe world prose from [[37-RAVELLAN-WORLD-EFFECT-MATRIX]] never feeds evidence selection.

# 16. Evidence-history algorithm

For query Q:

1. validate model/scenario/reducer semantics IDs;
2. validate Q ∈ 1..6;
3. require authoritative Ravellan decision Q;
4. build verified history index;
5. instantiate ordinary evidence observed <= Q;
6. if Q >= 3 and C2 final order equals model reroute trigger: C2 hidden facts → model lookup → source fact → evidence;
7. if Q >= 4 and C3 final order equals model focused trigger: C4 result-time hidden fact → model lookup → source fact → evidence;
8. later #102 may append only schema-valid authorised directed evidence through a narrow sim-owned extension seam;
9. calculate explicit supersession;
10. filter active evidence by lifecycle/supersession;
11. reduce intent assessment;
12. reduce warning;
13. reduce public-case basis;
14. derive previous available cycle snapshot + exact change;
15. derive bounded safe brief refs.

No mutation.

# 17. #102 extension seam

#100 has no implementation dependency on #102.

Provide a narrow internal composition seam so #102 can append verified `V2HqEvidence` before reducers without changing #100 reducer semantics.

No generic plugin framework.

# 18. Supersession / content validation

Evidence A superseded at Q iff observed B exists by Q and B explicitly lists A.

Reject model definitions with:

- duplicate evidence IDs;
- self-supersession;
- missing referenced IDs;
- supersession cycles;
- observed cycle > active-through cycle;
- invalid trigger IDs/matrix keys/source-fact values;
- invalid warning/public-case role combinations;
- incomplete briefing refs/mappings.

# 19. Exact assessment-change mapping

1. no previous → initial;
2. equal → unchanged;
3. preparation↔coercion directional flip → reversed;
4. same direction weak→coherent → strengthened;
5. same direction coherent→weak → weakened;
6. current unclear/conflicted → conflicted;
7. previous unclear/conflicted + current unclear/weak → cleared-conflict;
8. previous unclear + current directional → narrowed;
9. previous directional + current unclear/weak → reopened.

All 36 pairs are covered. No fallback.

# 20. Briefing map / payload

Use exact nine reachable assessment+warning semantics from [[23-HQ-BELIEF-AND-EVIDENCE]].

Normal maximum:

- 1 judgement;
- <=2 basis;
- <=1 contrary;
- 1 key gap;
- <=1 watch-for;
- <=1 change;
- <=1 warning ref.

# 21. Phase/historical edge cases

After C2 command advances state to C3 but before C3 Ravellan:

- current HQ query fails `v2_hq_belief_not_ready`.

Historical queries use historical entries. Later state cannot rewrite prior source facts/evidence/snapshots.

# 22. Versioning

Persisted format remains:

`0.4.0-prototype`.

No change to bootstrap state/action-ledger union/replay transitions/migration.

Derived semantic evolution is handled through the model/reducer/content identity described above, not a persisted format bump.

# 23. Exact agent implementation order

1. shared derived evidence/assessment/warning/public-case/change schemas;
2. shared strict `V2HqBeliefModelDefinition` schema;
3. create `packages/content/src/v2-kestrel-hq-belief.ts` with model, trigger IDs, two source-fact tables, refs, validation + digest tests;
4. export model from `packages/content/src/index.ts`;
5. create `packages/sim/src/v2-hq-belief.ts`;
6. export from `packages/sim/src/index.ts`;
7. implement pure reducers + truth tables;
8. implement exhaustive 36-pair change reducer;
9. implement model/scenario/reducer guards;
10. implement verified history/final-order helpers;
11. implement C2 model-driven source-fact extractor + separate mapper;
12. implement C4 focused model-driven source-fact extractor + separate mapper;
13. implement ordinary evidence/lifecycle/supersession;
14. implement historical/current/history APIs taking model argument;
15. implement phase guard;
16. implement bounded Intel-Chief brief;
17. hostile/non-interference/history/model-identity tests;
18. replay/import trust-boundary tests using the session returned from `validateV2ReplaySkeleton`;
19. independent tradecraft review;
20. independent replay/architecture review;
21. remediate valid findings;
22. full repository gates;
23. commit/push/update/close #100;
24. stop before #98.

# 24. Hostile tests

## Layering

- production sim does not import `@brass-ledger/content`;
- content does not import sim merely for hashing;
- model is explicit argument;
- Kestrel-only scenario guard works.

## Purity

- repeated derivation deep-equal;
- canonical state/hash/revision unchanged;
- no #100 ledger/version change.

## Observation boundary

- raw hidden facts only accepted by two authorised extractors;
- source-fact→evidence mappers cannot accept/import hidden Ravellan state;
- fixed raw authorised inputs + varied posture/policy row/seed → same source fact;
- fixed source fact → same evidence;
- ordinary evidence has no hidden input.

## Historical integrity

- reroute C3 uses C2 history;
- focused C4 uses C4 result-time history;
- later state cannot rewrite earlier snapshots;
- Delegate/Intervene resolve from finalOrders;
- world prose variant cannot alter generic evidence.

## Tradecraft separation

- coherent prep + no warning-role evidence → warning none;
- conflicted + physical warning-role evidence → warning usable;
- public-case basis not alias warning/assessment;
- contradiction survives until expiry/supersession;
- routine C3 report never reads hidden prep.

## Phase/import

- pre-Ravellan current query fails closed;
- unsupported scenario fails closed;
- unverified import cannot project through normal path;
- `validateV2ReplaySkeleton` output can project;
- malformed history cannot pass replay then project.

## Content identity

- model digest deterministic;
- trigger/matrix/reducer/evidence semantic mutation changes digest;
- render-only locale text outside semantic definition need not;
- #103 dependency recorded.

# 25. Independent reviews

## Intelligence/tradecraft reviewer

Attack raw-truth shortcuts, posture oracle leakage, assessment/warning/public-case conflation, contradiction averaging, routine coverage omniscience, overpowered collection, stale evidence, missing watch-for semantics, and dossier/confidence-meter presentation.

## Replay/architecture reviewer

Attack persisted #100 creep, derivation mutation, unverified-import use, current-state-for-history bugs, sim→content production dependency, content semantic drift under same identity, browser/server analytic duplication, accidental version bump, #99 replay/order regression, V1 contamination and premature generic framework work.

All P0/P1 mandatory; fix P2s involving hidden-information leakage, replay/content identity, layering, deterministic ambiguity or player-facing misrepresentation.

# 26. Closure

#100 closes only when [[23-HQ-BELIEF-AND-EVIDENCE]] and this architecture are implemented/tested; assessment/warning/public-case separate; observation boundary narrow; no persisted schema/ledger/version change; model/content identity guarded; package layering preserved; both independent reviews clear after remediation; full gates pass; commit pushed; issue evidence recorded; no #98 implementation started in same run.
