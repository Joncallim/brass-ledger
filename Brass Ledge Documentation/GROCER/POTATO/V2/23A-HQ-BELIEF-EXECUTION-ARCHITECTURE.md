---
type: v2-hq-belief-execution-architecture
status: active
---

# HQ Belief Execution Architecture

Backlink: [[README]]

This is the exact implementation/replay authority for **#100** against committed #99.

- [[23-HQ-BELIEF-AND-EVIDENCE]] owns product/tradecraft semantics.
- [[23B-HQ-BELIEF-STATE-SPACE-AUDIT]] owns exhaustive state-space vectors and regression counts.
- [[26-LATTICE-COLLECTION-MATRIX]] owns later collection producers.
- [[30-ARCHITECTURE-CONTRACT]] owns repository/replay boundaries.

# 1. Architecture decision — pure read model

#100 is pure derived state.

Do not:

- add HQ evidence, assessment, warning or public-case state to persisted `V2Session`;
- add an `hq-belief-update` ledger entry;
- increment revision for analysis;
- persist evidence expiry/supersession;
- bump the persisted V2 ruleset version.

All products reconstruct deterministically from:

- a trusted replay-valid V2 ledger prefix;
- an explicitly supplied, digest-verified canonical Kestrel belief-model bundle.

Persisted version remains:

`0.4.0-prototype`.

# 2. Canonical phase

Keep #99 mutation ordering:

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

After command N advances state to N+1, N+1 intelligence is not ready until the N+1 Ravellan decision exists.

Fail closed with an error equivalent to:

`v2_hq_belief_not_ready`.

Readiness is semantic, not “the latest array item happens to be Ravellan.”

# 3. C6 terminal cut

Cycle 6 has a special world-manifestation cut:

```text
#99 selects hidden terminal behaviour
→ resolve any C5 collection result against authorised pre-manifestation facts
→ derive final pre-manifestation HQ snapshot
→ derive current public-case availability from snapshot + source-use state
→ project terminal behaviour as safe overt crisis family
→ player selects terminal response
```

The `ravellan-decision` is hidden policy selection; it does not mean the overt attack has already completed before the collection result arrives.

At the C6 player surface, the overt crisis family is current fact. The C6 `ravellan-intent` snapshot is labelled as the **last pre-manifestation intelligence picture** and is not presented as if HQ is still debating whether an already visible seizure exists.

# 4. Trust boundary

Normal derivation accepts only:

- authoritative live session/history from normal sim/server flow; or
- a session returned by trusted `validateV2ReplaySkeleton(...)`.

Import flow:

```text
raw save
→ trusted identity/content resolution
→ validateV2ReplaySkeleton(...)
→ canonical replay-validated session
→ derive HQ intelligence with the exact resolved model bundle
→ safe player projection
```

Never derive player intelligence directly from unverified imported ledger fields.

# 5. Historical pre-command cut-off

For historical cycle Q, use exactly:

- intent declaration;
- Ravellan decisions through Q;
- command sets through Q-1;
- due collection results through Q;
- no command set Q;
- no future entry/state.

Changing command Q, any future command/Ravellan entry, terminal truth or the final current state must not change the Q snapshot.

# 6. Verified projection context

Core #100 derivation operates on an opaque/sim-owned verified prefix responsibility equivalent to:

```ts
type V2VerifiedProjectionContext = Readonly<{
  identity: V2Identity
  initialState: V2BootstrapState
  state: V2BootstrapState
  revision: number
  verifiedLedgerPrefix: readonly V2ActionLedgerEntry[]
}>
```

Prefer an internal unique-symbol brand so arbitrary external objects are not structurally accepted by accident.

Construct it only from:

1. an authoritative live session, sliced to the requested pre-command point; or
2. the trusted replay loop after every prefix entry has been re-executed successfully.

The context for replaying command Q contains the current Q Ravellan entry and all prior commands, but not the unverified command Q entry or any later entry.

# 7. Required #98 replay-provider evolution

Committed #99's `V2TrustedAgendaProvider` currently receives only state. That is insufficient once agenda/recommendation depends on #100 history.

Before #98 closes, evolve the provider API to receive the verified projection context above rather than the untrusted full saved session.

Conceptually:

```ts
type V2TrustedAgendaProvider = (
  context: V2VerifiedProjectionContext,
) => readonly V2AgendaIssue[]
```

During replay, the validator constructs the context from the already verified prefix. The provider can derive #100 and recommendations without seeing current/future unverified ledger entries.

This is an in-memory API evolution, not a persisted ledger/schema change and does not bump the ruleset version. Existing #99 transition/order semantics remain unchanged.

# 8. Kestrel-only guard

The model is exact:

- scenario ID `kestrel-strait`;
- model ID `kestrel-hq-belief-v1`;
- reducer semantics ID `kestrel-binary-hypothesis-v1`.

Draft design iterations before implementation do not consume runtime version numbers.

Unsupported scenario/model/reducer semantics fail closed.

# 9. Exact file placement

## Shared

Modify:

`packages/shared/src/v2.ts`

Add strict **derived-only** schemas/types for:

- evidence definition;
- runtime evidence occurrence;
- assessment;
- warning with basis occurrence;
- public-case basis with direction/supporting occurrences/source groups;
- product/evidence delta;
- snapshot/internal representative refs;
- player-safe brief refs;
- strict belief-model definition;
- resolved belief-model bundle.

Do not add any #100 type to persisted bootstrap/session/action-ledger schemas.

## Content

Create:

`packages/content/src/v2-kestrel-hq-belief.ts`

Export it from `packages/content/src/index.ts`.

Own:

- canonical model definition;
- actual canonical English intelligence copy/templates for Kestrel;
- content validation;
- deterministic semantic digest;
- resolved `{ definition, digest }` bundle.

Do not register Kestrel in the existing V1 scenario registry during #100.

## Sim

Create:

`packages/sim/src/v2-hq-belief.ts`

Export it from `packages/sim/src/index.ts`.

Do not place the entire subsystem in the already-large `packages/sim/src/v2.ts`.

Production sim must not import `@brass-ledger/content`. The model bundle is an explicit argument.

Content must not import sim merely to obtain hashing.

# 10. Shared core semantics

Equivalent types:

```ts
type V2HqDirection = "preparation" | "coercion"
type V2HqEvidenceImplication = V2HqDirection | "ambiguous"
type V2HqEvidenceDiagnosticity = "indicator" | "diagnostic"
type V2HqWarningState = "none" | "usable"

type V2HqAssessment =
  | { direction: "unclear"; picture: "weak" | "conflicted" }
  | { direction: V2HqDirection; picture: "weak" | "coherent" }

type V2HqWarning =
  | { state: "none"; basisEvidenceInstanceId: null }
  | { state: "usable"; basisEvidenceInstanceId: string }

type V2HqPublicCaseBasis =
  | {
      state: "none"
      direction: null
      supportingEvidenceInstanceIds: []
      supportingSourceGroups: []
    }
  | {
      state: "tentative"
      direction: V2HqDirection | null
      supportingEvidenceInstanceIds: string[]
      supportingSourceGroups: string[]
    }
  | {
      state: "credible-source-sensitive"
      direction: V2HqDirection
      supportingEvidenceInstanceIds: string[]
      supportingSourceGroups: string[]
    }
```

Directionless credible is schema-invalid.

# 11. Static evidence definition

Strict serialisable shape equivalent to:

```ts
type V2HqEvidenceDefinition = {
  definitionId: string
  claimId: "ravellan-intent"
  questionId:
    | "ravellan-intent-general"
    | "landing-force-staging"
    | "auxiliary-tasking"
    | "political-operational-sync"
  implication: "preparation" | "coercion" | "ambiguous"
  diagnosticity: "indicator" | "diagnostic"
  producerKind: "ordinary" | "reroute" | "focused" | "lattice" | "liaison"
  sourceGroup: string
  sourceContextRef: string
  limitationRef: string
  summaryRef: string
  warningRole: "none" | "usable"
  publicCaseRole: "none" | "source-sensitive"
  lifetimeRule:
    | { kind: "fixed"; observedCycle: 1 | 2 | 3 | 4 | 5 | 6; currentThroughCycle: 1 | 2 | 3 | 4 | 5 | 6 }
    | { kind: "through-terminal" }
  supersessionPolicy: "explicit-only" | "replace-older-same-question"
  supersedesDefinitionIds: string[]
}
```

Validation invariants:

- exact canonical 19-ID set from [[23B-HQ-BELIEF-STATE-SPACE-AUDIT]];
- no extra/orphan/dead definition;
- diagnostic implies directional;
- warning usable implies preparation;
- public-case source-sensitive implies directional;
- every directional definition has sourceGroup/context/limitation;
- fixed observed <= current-through and cycles 1–6;
- directed dynamic definitions never appear in ordinary schedule;
- supersession IDs valid, sorted, unique and acyclic;
- semantic arrays are in canonical lexical order.

# 12. Runtime occurrence

Equivalent:

```ts
type V2HqEvidence = {
  instanceId: Sha256Digest
  definitionId: string
  claimId: "ravellan-intent"
  questionId: V2HqEvidenceDefinition["questionId"]
  implication: V2HqEvidenceImplication
  diagnosticity: V2HqEvidenceDiagnosticity
  producerKind: V2HqEvidenceDefinition["producerKind"]
  sourceGroup: string
  sourceContextRef: string
  limitationRef: string
  sourceRef: string
  observedCycle: 1 | 2 | 3 | 4 | 5 | 6
  currentThroughCycle: 1 | 2 | 3 | 4 | 5 | 6
  summaryRef: string
  warningRole: "none" | "usable"
  publicCaseRole: "none" | "source-sensitive"
}
```

All semantic fields copy from the canonical definition. Runtime producer supplies only authorised observed cycle/source reference.

Occurrence ID:

```ts
v2Sha256({
  tag: "v2-hq-evidence-occurrence",
  definitionId,
  observedCycle,
  sourceRef,
})
```

Duplicate tuples/IDs fail.

# 13. Evidence delta and product delta

Equivalent:

```ts
type V2HqAssessmentChange =
  | "initial" | "unchanged" | "narrowed" | "strengthened"
  | "weakened" | "conflicted" | "cleared-conflict"
  | "reopened" | "reversed"

type V2HqBeliefDelta = {
  assessmentChange: V2HqAssessmentChange
  warningChange: "initial" | "unchanged" | "acquired"
  publicCaseChanged: boolean
  evidenceChangeCause:
    | "none" | "new-evidence" | "staleness" | "supersession" | "mixed"
  addedInstanceIds: string[]
  becameStaleInstanceIds: string[]
  supersededInstanceIds: string[]
}
```

Canonical Kestrel has no warning-loss trajectory. If the generated producer envelope loses warning, fail validation rather than inventing a copy case.

The delta is computed between adjacent pre-command snapshots, not between arbitrary final states.

# 14. Canonical model definition

Strict `V2HqBeliefModelDefinition` contains at minimum:

```ts
{
  modelId: "kestrel-hq-belief-v1"
  scenarioId: "kestrel-strait"
  reducerSemanticsId: "kestrel-binary-hypothesis-v1"

  ordinaryEvidenceDefinitionIdsByCycle: {
    1: ["opening-pressure-ambiguous"]
    2: ["shipping-probe-ambiguous"]
    3: ["combat-elements-dispersed", "staging-logistics-anomaly"]
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

  evidenceDefinitions: exactly 19 canonical definitions
  judgementCopy: ...
  sourceContextCopy: ...
  limitationCopy: ...
  gapWatchForCopy: ...
  assessmentChangeCopy: ...
  warningCopy: ...
  publicClaimCopy: ...
}
```

All decision-significant English copy/templates are included in the model digest for the prototype. There is no localization system whose complexity justifies allowing wording to drift under the same content identity.

# 15. Resolved model bundle and binding

Content exports equivalent:

```ts
type V2ResolvedHqBeliefModel = {
  definition: V2HqBeliefModelDefinition
  digest: Sha256Digest
}
```

Sim recomputes `v2Sha256(definition)` and rejects a mismatched bundle.

A cross-package test proves the content-exported digest equals sim's canonical digest for the same definition.

Until #103 creates the full Kestrel content identity, #100 tests bundle integrity directly. #103 must then include/bind this exact digest into Kestrel `contentDigest`; server/headless/replay cannot resolve a different model independently by scenario string.

# 16. Canonical ordering

Semantically unordered collections are canonical before validation/digest/output:

- evidence definitions sorted by definition ID;
- ordinary schedule IDs sorted lexically;
- supersedes IDs sorted lexically;
- evidence history sorted by observed cycle, then definition ID, then instance ID;
- current evidence uses the same canonical order;
- product supporting IDs use explicit ranking, never insertion order.

Equivalent reordering of unordered input must either canonicalise to the same digest/output or fail canonical-order validation. It must not silently change semantics.

# 17. Sim APIs

Core responsibilities equivalent to:

```ts
deriveV2HqBeliefFromVerifiedContext(
  context: V2VerifiedProjectionContext,
  model: V2ResolvedHqBeliefModel,
  cycle: 1 | 2 | 3 | 4 | 5 | 6,
): V2HqBeliefSnapshot

deriveV2HqBeliefAtCycle(
  trustedSession: V2Session,
  model: V2ResolvedHqBeliefModel,
  cycle: 1 | 2 | 3 | 4 | 5 | 6,
): V2HqBeliefSnapshot

deriveV2CurrentHqBelief(
  trustedSession: V2Session,
  model: V2ResolvedHqBeliefModel,
): V2HqBeliefSnapshot

deriveV2HqBeliefHistory(
  trustedSession: V2Session,
  model: V2ResolvedHqBeliefModel,
): readonly V2HqBeliefSnapshot[]
```

Exact names may follow repository style. The verified-prefix core and historical cut-off may not be omitted.

Keep pure reducers directly testable.

# 18. Trusted history index

Build one bounded canonical index from the verified prefix:

```ts
type V2VerifiedCycleHistory = {
  ravellanByCycle: Map<number, V2RavellanDecisionLedgerEntry>
  commandByCycle: Map<number, V2CommandSetLedgerEntry>
}
```

Fail on duplicate/missing prerequisites rather than guessing.

When collection cares what HQ actually ordered, inspect authoritative:

`command-set.finalOrders`.

Never inspect raw client dispositions as executed truth.

# 19. Four-layer observation boundary

```text
verified hidden history
→ authorised observation extractor
→ bounded source fact
→ canonical evidence definition
→ runtime occurrence
→ reducers
→ safe brief
```

Raw hidden Ravellan fields appear only in the two authorised #100 extractors.

## C2 reroute

Invoke only if C2 `finalOrders` contains the model's reroute trigger.

Raw inputs only:

- C2 Ravellan normal action;
- C2 post-decision preparation.

Bounded source facts:

- `coercive-tasking`
- `unclear`

Mapping:

- preparation none + action probe/deception → coercive-tasking;
- every other authorised input → unclear.

There is no integrated/preparation source fact.

Then map source fact to exact canonical evidence definition and instantiate C3 occurrence.

## C4 result of C3 focused staging

Invoke only if C3 `finalOrders` contains the model's focused trigger.

Raw input only:

- C4 post-decision preparation.

Source facts:

- `concentration-observed`
- `no-concentration-observed`

Map developing/ready to concentration, none to no-concentration; instantiate C4 occurrence.

No posture, action ID, policy row, tasking-time or future state.

# 20. Ordinary evidence

Instantiate only definition IDs in `ordinaryEvidenceDefinitionIdsByCycle` with observed cycle <= query cycle.

No hidden state input.

C3 routine disposition evidence never reads hidden preparation. Action-specific safe world prose never feeds evidence selection.

# 21. Occurrence instantiation helper

Implement one helper equivalent to:

```ts
instantiateV2HqEvidence(
  definition,
  observedCycle,
  sourceRef,
): V2HqEvidence
```

Rules:

- fixed definition must instantiate at authored observed cycle;
- through-terminal definition only at a producer-authorised result cycle;
- through-terminal currentThroughCycle = 6;
- all semantics copied from definition;
- sourceRef is bounded generated ID, never player text;
- hash identity and duplicate detection exact.

# 22. Future #102 seam

#102 may append only occurrences whose definition:

- exists in the exact 19-definition model;
- has producerKind lattice or liaison as appropriate;
- matches #102's target/source-fact producer mapping;
- is instantiated at the authorised result cycle;
- preserves canonical semantics.

A merely schema-valid arbitrary evidence object is rejected.

#102 persists task/capability/source-use authority as needed; it does not persist a duplicate evidence/assessment history. Collection results remain pure occurrences derived from replay-valid task and Ravellan history.

Lattice target IDs are one-shot. There is no same-target retask producer in canonical Kestrel.

# 23. Supersession algorithm

For query Q, build supersession status from **all occurrences observed by Q**, not only those still current.

A is superseded if any later-observed B:

- shares A's question and B's definition uses replace-older-same-question; or
- B's definition explicitly supersedes A's definition ID.

Once superseded, A stays superseded in later snapshots. Superseded/stale B still proves that A was replaced; A never resurrects.

Reject same-cycle ambiguous replacement ties for one directed producer/question. One task/result produces one occurrence.

# 24. Evidence-history algorithm

For query Q:

1. validate resolved model bundle/digest/IDs;
2. validate Q 1–6;
3. obtain verified pre-command prefix through Q;
4. require exactly one Ravellan decision Q;
5. build canonical cycle-history index;
6. instantiate scheduled ordinary evidence observed <= Q;
7. if Q >= 3 and C2 reroute executed, derive exactly one C3 reroute occurrence;
8. if Q >= 4 and C3 focused executed, derive exactly one C4 focused occurrence;
9. later #102 appends only authorised canonical occurrences due <= Q;
10. validate unique occurrence tuples/IDs and Kestrel history bound <= 9;
11. derive persistent supersession status from all occurrences observed <= Q;
12. filter current, non-superseded occurrences and assert bound <= 4;
13. reduce assessment;
14. reduce warning plus basis occurrence;
15. reduce public-case basis/direction/supporting sources;
16. derive previous pre-command snapshot;
17. derive evidence/product delta;
18. derive deterministic representative evidence and compact safe brief.

No mutation.

# 25. Exact intent reducer

Use `kestrel-binary-hypothesis-v1` and the complete 16-row truth table in [[23B-HQ-BELIEF-STATE-SPACE-AUDIT]].

Summary:

- diagnostics both directions → unclear/conflicted;
- one diagnostic direction survives opposite indicators but becomes weak;
- one diagnostic direction with no opposite direction → coherent;
- indicators both directions only → unclear/conflicted;
- indicators one direction only → directional/weak;
- no directional evidence → unclear/weak;
- count never decides direction.

# 26. Warning reducer

Return none/null basis or usable/exact warning-bearing instance ID.

If multiple warning occurrences somehow remain current, content/history invalid because canonical landing replacement should leave at most one.

# 27. Public-case reducer

Public case is stricter than internal estimate.

For eligible current occurrences:

- no direction → none/null;
- both directions → tentative/null;
- one direction without diagnostic + independent corroboration → tentative/D;
- one direction with diagnostic + at least two distinct sourceGroups + no current opposite directional evidence → credible-source-sensitive/D.

Return all relevant supporting occurrence IDs in deterministic order. Credible basis must identify at least one diagnostic primary and one independent corroborator.

# 28. Assessment and product deltas

Assessment-change mapping remains exact over all 36 legal assessment pairs.

Evidence delta classifies additions, staleness and persistent supersession.

Warning change:

- C1 initial;
- none→usable acquired;
- otherwise unchanged;
- usable→none invalid under canonical Kestrel envelope.

`publicCaseChanged` compares the full state, direction and ordered supporting basis.

A newly acquired warning or changed actionable public case remains material even when assessmentChange is unchanged.

# 29. Deterministic representative evidence

## Directional

Basis priority:

1. supporting diagnostic;
2. supporting warning-bearing occurrence if distinct;
3. newest supporting occurrence from another sourceGroup/question;
4. newest remaining support.

Take at most two.

If opposite directional evidence exists, show its top-ranked current occurrence as the contrary fact.

## Conflicted

Show one representative per direction. Rank diagnostic, warning-bearing, newer cycle, definition ID, instance ID.

## Unclear weak

Show newest ambiguous occurrence or authored coverage-gap ref.

Never use model array order, insertion order, locale, seed or hidden truth to break ties.

# 30. Compact player-safe brief

Default command path contains:

- one judgement;
- <=2 basis facts with source context;
- <=1 contrary fact;
- one decision cue:
  - warning when usable; otherwise key gap + optional watch-for;
- <=1 material update line;
- a separate public-claim card only when later source-use authority exposes one.

Full safe gap/watch/source/limitation metadata may be available under progressive disclosure, but required play cannot become a dossier.

All canonical English intelligence copy/templates are identity-covered in the prototype.

# 31. Content semantic digest

Content exports the resolved bundle using canonical key-sorted V2 serialization and SHA-256.

Digest covers:

- exact 19 definitions;
- producer kinds;
- sourceGroup/context/limitation;
- ordinary schedule;
- trigger IDs;
- source-fact tables;
- source-fact→definition tables;
- lifetimes;
- supersession;
- reducer semantics ID;
- canonical English judgement/evidence/gap/watch/change/warning/public-claim copy.

Cross-package test asserts content digest == sim `v2Sha256(definition)`.

Any semantic/copy change changes digest. Pre-gate Kestrel does not need a localization exception.

# 32. Generated state-space test

Implement deterministic generated coverage matching [[23B-HQ-BELIEF-STATE-SPACE-AUDIT]]:

- 16 reducer rows;
- exact 19 definitions, all producer-envelope reachable;
- 9 assessment/warning pairs;
- 6 public-case forms;
- 15 composite states;
- 45 product trajectories;
- per-cycle counts 1/1/1/4/13/11;
- max history/current 9/4;
- zero useful same-target retasks;
- zero dead definitions;
- zero warning-loss trajectories;
- all nine assessment-change categories;
- product-only transitions;
- no-resurrection supersession;
- future/same-cycle noninterference.

If the generated legal full-game graph later narrows an envelope vector, #107 records why. It may not expand the envelope without an approved contract change.

# 33. Implementation order

1. Add shared assessment/warning/public-case/delta schemas.
2. Add static definition/runtime occurrence/model/bundle schemas.
3. Create the exact 19-definition content model and identity-covered copy.
4. Add validation/canonicalisation/digest tests.
5. Export content model bundle.
6. Create/export dedicated sim HQ-belief module.
7. Add verified projection-context and historical prefix slicing.
8. Implement occurrence hash/instantiation.
9. Implement reducer truth tables.
10. Implement warning/public-case support provenance.
11. Implement 36-pair assessment change + evidence/product delta.
12. Implement model/scenario/digest guards.
13. Implement cycle-history/final-order helpers.
14. Implement C2/C4 authorised producers.
15. Implement ordinary evidence/current relevance/persistent supersession.
16. Implement historical/current/history APIs.
17. Implement compact deterministic brief.
18. Implement strict future #102 occurrence seam.
19. Implement generated 23B state-space audit test.
20. Add replay/import/history-prefix tests.
21. Run independent tradecraft review.
22. Run independent replay/architecture/state-space review.
23. Remediate valid findings.
24. Run full repository gates.
25. Commit/push/update/close #100.
26. Stop before #98.

# 34. Required hostile tests

## Layering/purity

- production sim has no content dependency;
- content has no sim dependency;
- model bundle explicit and digest verified;
- unsupported scenario/model/reducer fails;
- repeated derivation deep-equal;
- state/hash/revision unchanged;
- no #100 ledger/version change.

## Prefix/future isolation

- core receives verified prefix;
- command Q/future entries cannot affect Q snapshot;
- full-session and verified-prefix derivations agree;
- replay provider receives verified prefix only;
- unverified imported ledger cannot project.

## Definition/occurrence

- exact 19 definitions;
- removed integrated definitions rejected;
- semantic arrays canonical;
- occurrence hash deterministic;
- duplicate occurrence rejected;
- runtime cannot override definition;
- resource bounds 9/4.

## Reducers/products

- exhaustive 16 truth rows;
- diagnostic vs indicator semantics exact;
- contrary evidence always shown when required;
- warning separate with exact basis;
- public case needs diagnostic + independent sourceGroup corroboration;
- coherent internal/tentative public state reachable;
- directionless credible rejected.

## Supersession/currency

- stale remains historical;
- persistent no-resurrection chain;
- same-question replacement exact;
- unrelated questions independent;
- evidence/product delta explains staleness/supersession;
- no warning-loss legal trajectory.

## Observation/history

- hidden facts only in C2/C4 extractors;
- reroute/focused historical timing exact;
- all 19 producer branches reachable in envelope;
- C3 routine coverage never reads hidden preparation;
- C4 prose never changes evidence.

## Presentation

- deterministic basis/contrary selection;
- product-only changes not suppressed;
- compact default path bounded;
- source context/limitation present without confidence meter;
- C6 last-pre-manifestation label exact.

## Content identity

- semantic and canonical-English-copy changes alter digest;
- harmless object-key reordering canonicalises;
- semantically unordered array reordering cannot silently alter digest/output;
- #103 binding dependency recorded.

# 35. Independent reviews before closure

## Intelligence/tradecraft reviewer

Attack:

- diagnostic evidence over- or under-ruling contrary reporting;
- public case requiring too little corroboration;
- source/method limitations hidden;
- warning conflated with estimate;
- stale evidence forgotten;
- superseded evidence resurrecting;
- dead collection branch;
- dossier/confidence-meter creep;
- C6 hindsight confusion.

## Replay/architecture/state-space reviewer

Attack:

- unverified/full-future history entering derivation;
- state-only agenda provider unable to reconstruct #100;
- persisted read-model creep;
- model/session digest mismatch;
- static/runtime evidence confusion;
- duplicate/ambiguous occurrence identity;
- nondeterministic ordering;
- state-space vectors not reproduced;
- resource bounds absent;
- accidental #99/V1 regression;
- generic framework creep.

All P0/P1 findings are mandatory. Also fix P2 findings involving hidden-information leakage, replay/content identity, state-space coverage, deterministic ambiguity or player-facing misrepresentation.

# 36. Rejection conditions

Reject #100 if it:

- persists the read model or mirrors current public-case availability;
- cannot derive from a verified replay prefix;
- reads same-cycle/future command data in a historical snapshot;
- accepts a self-consistent but wrong model bundle;
- retains dead integrated-auxiliary definitions;
- permits same-target Lattice retasking;
- allows one diagnostic source alone to become a credible public case;
- forgets stale evidence or resurrects superseded evidence;
- uses majority vote or blanket contrary-indicator veto;
- hides required contrary evidence;
- conflates warning/assessment/public case;
- loses product-only changes;
- uses ambiguous concatenated occurrence IDs;
- relies on array order;
- treats routine reporting as omniscient;
- parses world prose into analysis;
- exposes a dossier/confidence meter;
- changes persisted V2 format;
- contaminates V1.
