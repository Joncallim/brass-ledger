---
type: v2-hq-belief-execution-architecture
status: active
---

# HQ Belief Execution Architecture

Backlink: [[README]]

This is the exact implementation/replay authority for **#100** against committed #99.

[[23-HQ-BELIEF-AND-EVIDENCE]] owns product/tradecraft semantics. [[26-LATTICE-COLLECTION-MATRIX]] owns later collection producers. [[30-ARCHITECTURE-CONTRACT]] owns repository/replay boundaries.

# 1. Architectural decision — pure projection

**#100 is pure derived state.**

Do not add HQ evidence/assessment/warning/public-case state to persisted `V2Session`, add an `hq-belief-update` ledger entry, increment revision for analysis or bump the persisted V2 ruleset version.

All products reconstruct deterministically from:

- trusted replay-valid V2 history; and
- an explicitly supplied canonical Kestrel HQ-belief model definition.

Pattern: **B — pure derived readout**.

# 2. Canonical phase

Keep #99 ordering:

```text
intent-declaration
→ ravellan-decision C1
→ derive HQ intelligence
→ agenda / recommendation / projection
→ command-set C1

ravellan-decision CN
→ derive HQ intelligence
→ agenda / recommendation / projection
→ command-set CN
```

C6 follows the same pre-terminal readout principle.

After `command-set` advances state to N+1, N+1 intelligence is not ready until `ravellan-decision N+1` exists.

Fail closed with equivalent:

`v2_hq_belief_not_ready`.

Readiness is semantic by current-cycle history, not “last entry is Ravellan.”

# 3. Trust boundary

Normal projection accepts only:

- authoritative live `V2Session`; or
- the canonical `V2Session` returned by trusted `validateV2ReplaySkeleton(...)`.

Import path:

```text
raw save
→ trusted live identity/content resolution
→ validateV2ReplaySkeleton(...)
→ canonical session
→ deriveV2HqBelief*(session, trustedModel)
→ safe player projection
```

No additional validated-session wrapper is required for #100.

Never project directly from unverified imported ledger data.

# 4. Kestrel-only guard

Model exact scenario:

`kestrel-strait`.

Every public #100 derivation requires `session.identity.scenarioId === model.scenarioId`; otherwise fail equivalent:

`v2_hq_belief_unsupported_scenario`.

Do not turn #100 into a generic V2 intelligence framework.

# 5. Exact file placement / layering

## Shared

Modify:

`packages/shared/src/v2.ts`

Add strict derived-only schemas/types for:

- evidence definitions;
- evidence occurrences;
- assessment/warning/public-case/change semantics;
- belief snapshot / safe brief refs;
- strict `V2HqBeliefModelDefinition`.

Do not nest these into persisted V2 bootstrap/session/ledger state.

## Content

Create:

`packages/content/src/v2-kestrel-hq-belief.ts`

Export from:

`packages/content/src/index.ts`.

Own:

- canonical `kestrelHqBeliefModel`;
- validation;
- deterministic semantic digest.

Do not register Kestrel in the existing V1 scenario registry during #100.

## Sim

Create:

`packages/sim/src/v2-hq-belief.ts`

Export from:

`packages/sim/src/index.ts`.

Do not put the subsystem into the already-large `packages/sim/src/v2.ts`.

**Production sim must not import `@brass-ledger/content`.** Sim receives the parsed model explicitly.

Content must not import sim merely to reuse hashing.

# 6. Shared core enums

Equivalent semantics:

```ts
type V2HqEvidenceImplication = "preparation" | "coercion" | "ambiguous"
type V2HqEvidenceDiagnosticity = "indicator" | "diagnostic"
type V2HqWarningState = "none" | "usable"
type V2HqDirection = "preparation" | "coercion"

type V2HqPublicCaseBasis =
  | { state: "none"; direction: null }
  | { state: "tentative"; direction: V2HqDirection | null }
  | { state: "credible-source-sensitive"; direction: V2HqDirection }

type V2HqAssessmentChange =
  | "initial"
  | "unchanged"
  | "narrowed"
  | "strengthened"
  | "weakened"
  | "conflicted"
  | "cleared-conflict"
  | "reopened"
  | "reversed"

type V2HqAssessmentChangeCause =
  | "none"
  | "new-evidence"
  | "staleness"
  | "supersession"
  | "mixed"
```

`credible-source-sensitive` with null direction is schema-invalid.

# 7. Static evidence definition

Use a strict serialisable shape equivalent to:

```ts
type V2HqEvidenceDefinition = {
  definitionId: string
  claimId: "ravellan-intent"
  questionId: string
  implication: V2HqEvidenceImplication
  diagnosticity: V2HqEvidenceDiagnosticity
  sourceGroup: string
  sourceContextRef: string
  summaryRef: string
  warningRole: "none" | "usable"
  publicCaseRole: "none" | "source-sensitive"
  lifetimeRule:
    | { kind: "fixed"; observedCycle: number; currentThroughCycle: number }
    | { kind: "through-terminal" }
  supersessionPolicy: "explicit-only" | "replace-older-same-question"
  supersedesDefinitionIds: string[]
}
```

`currentThroughCycle` means **current analytic relevance**, not deletion from history.

`sourceContextRef` is player-safe method/coverage context, not a confidence score.

# 8. Runtime evidence occurrence

Use a separate derived shape equivalent to:

```ts
type V2HqEvidence = {
  instanceId: string
  definitionId: string
  claimId: "ravellan-intent"
  questionId: string
  implication: V2HqEvidenceImplication
  diagnosticity: V2HqEvidenceDiagnosticity
  sourceGroup: string
  sourceContextRef: string
  sourceRef: string
  observedCycle: number
  currentThroughCycle: number
  summaryRef: string
  warningRole: "none" | "usable"
  publicCaseRole: "none" | "source-sensitive"
}
```

Occurrence semantic fields are copied from the canonical definition.

Caller may supply only authorised occurrence-time/source reference inputs, not change definition semantics.

Deterministic instance ID must distinguish repeated observations of the same definition, conceptually:

`<definitionId>@c<cycle>:<stable-source-ref>`.

Exact encoding may follow repository conventions.

# 9. Current relevance vs historical retention

At query cycle Q, an occurrence is current-relevant iff:

- `observedCycle <= Q <= currentThroughCycle`; and
- it has not been superseded by an already-observed newer occurrence.

Stale/superseded occurrences remain in `evidenceHistory` permanently as derived historical readout.

Never mutate/delete an occurrence simply because it is no longer current.

This allows exact historical debrief and explicit explanation that an old report became too stale to carry the current judgement.

# 10. Same-question supersession

Directed collection uses stable `questionId`.

When a newer occurrence B uses definition policy `replace-older-same-question`, at query Q it supersedes every older active occurrence A with:

- same `questionId`; and
- `A.observedCycle <= B.observedCycle <= Q`;
- stable instance ordering resolves impossible same-cycle duplicate producer bugs deterministically only for validation/error reporting, not gameplay choice.

This includes an older occurrence of the **same definition ID**.

Therefore retasking the same intelligence question updates the report rather than stacking another vote.

`supersedesDefinitionIds` additionally handles bounded explicit asymmetric supersession.

Unrelated question IDs never auto-supersede each other.

# 11. Canonical belief model definition

Strict `V2HqBeliefModelDefinition` includes conceptually:

```ts
{
  modelId: "kestrel-hq-belief-v1"
  scenarioId: "kestrel-strait"
  reducerSemanticsId: "kestrel-binary-hypothesis-v1"

  ordinaryEvidenceDefinitionIdsByCycle: {
    1: ["opening-pressure-ambiguous"]
    2: ["shipping-probe-ambiguous"]
    3: ["staging-logistics-anomaly", "combat-elements-dispersed"]
    4: ["cycle4-pressure-pattern-ambiguous"]
    5: []
    6: []
  }

  triggerOrderIds: {
    rerouteAndMonitor: "reroute-and-monitor"
    focusStagingCollection: "focus-staging-collection"
  }

  rerouteSourceFactMatrix: ...
  rerouteEvidenceDefinitionIdBySourceFact: ...
  focusedStagingSourceFactByPreparation: ...
  focusedStagingEvidenceDefinitionIdBySourceFact: ...

  evidenceDefinitions: [...]
  judgementRefs: ...
  gapWatchForRefs: ...
  assessmentChangeRefs: ...
  assessmentChangeCauseRefs: ...
  warningRefs: ...
  publicCaseClaimRefs: ...
}
```

Exact representation may be more ergonomic but these semantics are identity-covered.

# 12. Full evidence vocabulary is predeclared

`evidenceDefinitions` contains every already-approved Kestrel HQ evidence semantic definition from:

- [[23-HQ-BELIEF-AND-EVIDENCE]];
- [[26-LATTICE-COLLECTION-MATRIX]].

That includes:

- ordinary evidence;
- reroute;
- focused staging;
- Lattice landing/auxiliary/sync results;
- liaison results.

#100 implements only the producers it owns.

#102 later produces runtime occurrences using these definitions and may not redefine what those definitions mean.

# 13. Why schedule/mapping tables are content data

Do not infer ordinary evidence as “definitions with no task mapping.” `ordinaryEvidenceDefinitionIdsByCycle` is explicit.

The following decision-significant mappings belong to the canonical model rather than hidden switch statements:

- trigger order IDs;
- authorised raw-fact→bounded-source-fact tables;
- bounded-source-fact→evidence-definition tables.

Changing any can change historical HQ analysis, so they participate in semantic identity.

Reducers remain explicit TypeScript and are guarded by exact:

`reducerSemanticsId = "kestrel-binary-hypothesis-v1"`.

Unknown semantics ID fails closed.

# 14. Content semantic digest

Content exports deterministic equivalent:

`kestrelHqBeliefModelDigest`.

Use stable canonical serialization + SHA-256 in content. Node `crypto` is sufficient.

Digest covers:

- ordinary schedule;
- trigger IDs;
- source-fact mappings;
- definition mappings;
- all evidence definitions/question IDs/source-context refs/lifetimes/supersession;
- reducer semantics ID;
- decision-significant semantic refs.

Semantic mutation → digest mutation.

Render-only localized prose outside the semantic definition may remain digest-neutral where refs remain equal.

#103 later incorporates this model/digest in final Kestrel content identity.

# 15. Sim API

Equivalent responsibilities:

```ts
deriveV2HqBeliefAtCycle(session, model, cycle)
deriveV2CurrentHqBelief(session, model)
deriveV2HqBeliefHistory(session, model)
```

Lower reducers remain directly unit-testable.

Validate known model/scenario/reducer IDs at boundary or require trusted parsed model from content-aware orchestration.

# 16. Trusted history index

Build one bounded internal index:

```ts
type V2VerifiedCycleHistory = {
  ravellanByCycle: Map<number, V2RavellanDecisionLedgerEntry>
  commandByCycle: Map<number, V2CommandSetLedgerEntry>
}
```

Input session already passed trusted replay. Still fail on duplicate/missing prerequisite entries.

When HQ collection cares what coalition actually ordered, inspect:

`command-set.finalOrders`.

Never use raw client dispositions.

Use trigger IDs from model, never duplicated literals.

# 17. Four-layer observation boundary

```text
verified hidden history
→ authorised observation extractor
→ bounded source fact
→ canonical evidence definition
→ runtime occurrence
→ reducers
→ safe brief
```

Raw hidden Ravellan enums appear only in authorised extractors.

Evidence instantiation/reducers never receive posture/arbitrary hidden world state.

# 18. C2 reroute producer

Only if C2 finalOrders contains model reroute trigger.

Authorised hidden inputs only from verified C2 Ravellan decision:

- normal action;
- post-decision preparation.

No posture/policy row/current/future state/seed/standing intent.

Model raw-fact table → bounded source fact.

Model source-fact mapping → exact evidence definition.

Instantiate one C3 occurrence.

No hard-coded evidence switch in sim.

# 19. C4 focused-staging producer

Only if C3 finalOrders contains model focused trigger.

At C4 result time, authorised hidden input only:

- verified C4 post-decision preparation.

No posture/C4 action/policy row/C3 tasking-time prep/future state.

Model mapping → source fact → exact definition → one C4 occurrence.

# 20. Future #102 producer seam

#102 may append only runtime occurrences whose definition ID:

- already exists in this model;
- matches its authorised target producer semantics;
- preserves canonical definition fields;
- has a legitimate deterministic task/source reference and result cycle.

A merely schema-valid arbitrary evidence object is rejected.

The seam must support a newer occurrence for the same `questionId` so legal retasking can replace the older one.

No generic plugin framework.

# 21. Evidence instantiation helper

Implement one sim-owned helper equivalent to:

```ts
instantiateV2HqEvidence(definition, observedCycle, stableSourceRef)
```

Rules:

- fixed definition must instantiate at its authored observed cycle;
- through-terminal definition may instantiate only at an authorised producer result cycle;
- through-terminal currentThroughCycle = 6;
- deterministic unique instance ID;
- semantic fields copied from definition;
- runtime cannot change implication/diagnosticity/question/source-context/warning/public-case roles.

# 22. Ordinary evidence

No hidden input.

For query Q instantiate only definitions listed by `ordinaryEvidenceDefinitionIdsByCycle` with fixed observed cycle <= Q.

C3 routine force-disposition reporting never reads hidden preparation.

Action-specific world prose never feeds evidence selection.

# 23. Evidence-history algorithm

For query Q:

1. validate model/scenario/reducer IDs;
2. validate Q 1..6;
3. require authoritative Ravellan decision Q;
4. build verified history index;
5. instantiate scheduled ordinary evidence observed <= Q;
6. if Q>=3 and C2 reroute executed: C2 facts → source fact → definition → C3 occurrence;
7. if Q>=4 and C3 focused collection executed: C4 result-time fact → source fact → definition → C4 occurrence;
8. later #102 appends only canonical model-backed directed occurrences from verified task history;
9. compute same-question + explicit supersession;
10. derive current-relevant set by currency + supersession;
11. reduce intent assessment;
12. reduce warning;
13. reduce public-case state **and direction**;
14. derive previous snapshot;
15. derive assessment-change kind + cause;
16. derive bounded safe brief refs.

No mutation.

# 24. Reducers

Implement exactly [[23-HQ-BELIEF-AND-EVIDENCE]].

## Intent

- no current directional → unclear weak;
- both directions → unclear conflicted;
- one direction + diagnostic → directional coherent;
- one direction indicators only → directional weak.

No vote count.

## Warning

Usable iff current preparation occurrence has warningRole usable.

## Public case

Return discriminated basis:

- none/null;
- tentative + one direction or null;
- credible-source-sensitive + required direction.

Directionless credible is impossible by schema and reducer.

# 25. Assessment-change mapping

Change kind:

1. no previous → initial;
2. equal → unchanged;
3. prep↔coercion directional flip → reversed;
4. same direction weak→coherent → strengthened;
5. same direction coherent→weak → weakened;
6. current unclear/conflicted → conflicted;
7. previous unclear/conflicted + current unclear/weak → cleared-conflict;
8. previous unclear + current directional → narrowed;
9. previous directional + current unclear/weak → reopened.

All 36 legal pairs covered; no fallback.

# 26. Change-cause derivation

For a changed assessment compare previous/current occurrence sets.

Bound cause to:

- `new-evidence` — one or more newly observed occurrences materially changed the reducer and no expiry/supersession was required to explain the change;
- `staleness` — current judgement changed because previously current occurrence(s) aged out with no newer superseding occurrence driving the change;
- `supersession` — newer same-question/explicit replacement removed older current evidence and explains the change;
- `mixed` — more than one mechanism materially contributed;
- `none` for initial/unchanged.

The normal player surface still shows at most one assessment-change line; it selects content using both change kind and cause so analytical drift is explainable.

Do not expose this as a metric/history ladder.

# 27. Safe brief

Bound normal brief to:

- 1 judgement;
- <=2 basis evidence summaries with source/method context;
- <=1 contrary evidence summary;
- exactly 1 key gap;
- <=1 watch-for;
- <=1 assessment-change line;
- <=1 warning line;
- when #101 exposes an actionable attribution opportunity, one safe public-case claim ref consistent with the persisted direction.

No full evidence ledger, internal picture/diagnosticity/public-case enums, source facts, hidden state or confidence score.

# 28. Phase / historical edge cases

After C2 command advances to C3 but before C3 Ravellan decision:

- current query → `v2_hq_belief_not_ready`.

Historical queries use historical entries only. Later state cannot rewrite prior source facts/occurrences/snapshots.

Stale evidence remains in historical readout even when absent from current reducer.

# 29. Versioning

Persisted format remains:

`0.4.0-prototype`.

No bootstrap/session/action-ledger/replay/migration change in #100.

Derived semantic evolution is protected by content identity, not a persisted schema bump.

# 30. Exact implementation order

1. shared assessment/warning/public-case/change enums/types;
2. shared static evidence-definition + runtime occurrence schemas;
3. shared strict belief-model schema;
4. content model with full 23+26 evidence vocabulary, question IDs, source-context refs, schedules, trigger/mapping tables and semantic refs;
5. content validation + deterministic digest tests;
6. export content model;
7. create dedicated sim HQ-belief module + export;
8. implement canonical occurrence-instantiation helper;
9. implement reducers + public-case direction truth table;
10. implement exhaustive 36-pair change kind;
11. implement change-cause derivation;
12. implement model/scenario/reducer guards;
13. implement verified history/final-order helpers;
14. implement C2 reroute producer;
15. implement C4 focused producer;
16. implement ordinary scheduled evidence;
17. implement same-question/explicit supersession + current-relevance filtering;
18. implement historical/current/history APIs;
19. implement phase guard + bounded brief;
20. implement strict #102 occurrence-validation seam without implementing #102 task persistence;
21. hostile/non-interference/history/content-identity tests;
22. replay/import tests using `validateV2ReplaySkeleton` output;
23. independent intelligence/tradecraft review;
24. independent replay/architecture review;
25. remediate valid findings;
26. full repository gates;
27. commit/push/update/close #100;
28. stop before #98.

# 31. Required hostile tests

## Layering / purity

- sim production does not import content;
- content does not import sim for hash;
- model explicit argument;
- unsupported scenario/model/reducer fails closed;
- repeated derivation deep-equal;
- canonical state/hash/revision unchanged;
- no #100 ledger/version change.

## Definition / occurrence

- full 23+26 definition vocabulary exactly once;
- every directional definition has sourceContextRef;
- fixed vs through-terminal lifetime exact;
- stale occurrence retained historically;
- deterministic unique instance IDs;
- runtime caller cannot alter canonical semantic fields;
- ordinary schedule never auto-instantiates directed definitions.

## Same-question replacement

- newer same-question occurrence replaces older same-question occurrence, including same definition ID;
- no stacking votes from retasking;
- unrelated questions remain independent;
- explicit asymmetric supersession still works;
- replacement graph/logic deterministic and acyclic.

## Observation / history

- raw hidden facts only in authorised extractors;
- mappers/instantiator/reducers cannot accept posture/arbitrary hidden state;
- reroute C3 uses C2 history;
- focused C4 uses C4 result-time history;
- later state cannot rewrite earlier snapshot;
- finalOrders is coalition execution source;
- world prose cannot change evidence;
- routine C3 report never reads hidden prep.

## Tradecraft / player meaning

- all six assessments;
- preparation assessment + warning none;
- conflicted assessment + warning usable;
- public-case state + direction exact;
- directionless credible rejected;
- contradiction preserved;
- all 36 change kinds;
- staleness/supersession/new-evidence/mixed change causes deterministic;
- all nine assessment+warning brief mappings;
- source/method context present without a numeric confidence system.

## Replay / identity

- pre-Ravellan current query fails;
- unverified import cannot project normal path;
- replay-validated session can project;
- semantic digest changes on schedule/trigger/mapping/question/source-context/lifetime/supersession/reducer/ref mutation;
- existing #99 replay vectors structurally valid;
- V1 unchanged.

# 32. Independent reviews

## Intelligence/tradecraft

Attack:

- raw-truth shortcuts/posture oracle;
- assessment/warning/public-case conflation;
- directionless public claims;
- contrary reporting averaged away;
- source/method limitations hidden from player;
- stale evidence silently forgotten;
- retasked collection stacking as votes;
- routine coverage treated as omniscient;
- overpowered collection;
- missing watch-for/change explanation;
- confidence-meter/dossier creep.

## Replay/architecture

Attack:

- persisted #100 creep;
- mutation during derivation;
- unverified import;
- current-state-for-history bugs;
- static/runtime evidence confusion;
- same-question occurrence identity bugs;
- sim→content production dependency;
- semantic drift under same identity;
- UI/server analytic duplication;
- accidental version bump;
- #99 ordering regression;
- V1 contamination;
- generic framework creep.

All P0/P1 mandatory; fix P2 findings involving hidden-information leakage, replay/content identity, layering, deterministic ambiguity or player-facing misrepresentation.

# 33. Closure

#100 closes only when:

- [[23-HQ-BELIEF-AND-EVIDENCE]] and this architecture are implemented/tested;
- assessment, warning and directional public-case basis are demonstrably separate;
- stale evidence is historically retained and explainably removed from current judgement;
- retasking/same-question replacement cannot stack votes;
- observation boundary remains narrow;
- no persisted schema/ledger/version change occurred;
- content identity covers all decision-significant semantics;
- package layering is preserved;
- both independent reviews are clear after remediation;
- full gates pass;
- commit pushed and issue evidence recorded;
- no #98 implementation was started in the same run.
