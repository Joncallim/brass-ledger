---
type: v2-hq-belief-execution-architecture
status: active
---

# HQ Belief Execution Architecture

Backlink: [[README]]

This is the exact implementation/replay authority for **#100** against committed #99. [[23-HQ-BELIEF-AND-EVIDENCE]] owns product/tradecraft semantics. [[26-LATTICE-COLLECTION-MATRIX]] owns later collection producers. [[30-ARCHITECTURE-CONTRACT]] owns repository/replay boundaries.

# 1. Architectural decision — pure projection

#100 is **pure derived state**.

Do not:

- add HQ evidence/assessment/warning/public-case state to persisted `V2Session`;
- add an `hq-belief-update` ledger entry;
- increment revision for analysis;
- bump the persisted V2 ruleset version.

All #100 products reconstruct deterministically from trusted replay-valid V2 history + an explicitly supplied canonical Kestrel belief-model definition.

Pattern: pure read projection from authoritative history.

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

After `command-set` advances to N+1, N+1 intelligence is not ready until `ravellan-decision N+1` exists.

Fail closed with equivalent `v2_hq_belief_not_ready`.

# 3. Trust / scenario boundary

Normal projection accepts only:

- authoritative live `V2Session`; or
- canonical `V2Session` returned by trusted `validateV2ReplaySkeleton(...)`.

Import flow:

```text
raw save
→ trusted live identity/content resolution
→ validateV2ReplaySkeleton(...)
→ canonical session
→ deriveV2HqBelief*(session, trustedModel)
→ safe projection
```

Never project from unverified imported ledger data.

The model is Kestrel-specific (`scenarioId = kestrel-strait`). Unsupported scenario/model/reducer semantics fail closed.

# 4. Exact file placement / dependency direction

## Shared

Modify `packages/shared/src/v2.ts`.

Add strict **derived-only** schemas/types for:

- `V2HqEvidenceDefinition`;
- runtime `V2HqEvidence` occurrence;
- assessment/warning/public-case/change/change-cause semantics;
- snapshot/safe brief refs;
- strict `V2HqBeliefModelDefinition`.

Do not nest them in persisted V2 state/ledger schemas.

## Content

Create `packages/content/src/v2-kestrel-hq-belief.ts`; export from content index.

Own canonical `kestrelHqBeliefModel`, validation and deterministic semantic digest.

Do not register Kestrel in existing V1 scenario registry during #100.

## Sim

Create `packages/sim/src/v2-hq-belief.ts`; export from sim index.

Do not put the subsystem in the already-large `packages/sim/src/v2.ts`.

**Production sim must not import `@brass-ledger/content`.** The parsed model is an explicit function argument.

Content must not import sim merely to reuse hashing.

# 5. Shared core types

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
  | "initial" | "unchanged" | "narrowed" | "strengthened"
  | "weakened" | "conflicted" | "cleared-conflict"
  | "reopened" | "reversed"

type V2HqAssessmentChangeCause =
  | "none" | "new-evidence" | "staleness" | "supersession" | "mixed"
```

Directionless credible public case is schema-invalid.

# 6. Static evidence definition

Strict serialisable shape equivalent to:

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

`currentThroughCycle` means current analytic relevance, not deletion from history.

`sourceContextRef` is player-safe collection/method context, not a confidence score.

# 7. Runtime occurrence

Derived shape equivalent to:

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

Occurrence semantic fields are copied from the canonical definition. Runtime producer supplies only authorised occurrence-time/source-ref inputs.

Deterministic instance ID distinguishes repeated observations of the same definition, conceptually `<definitionId>@c<cycle>:<source-ref>`.

# 8. Current relevance / historical retention

At query cycle Q an occurrence is current iff:

- observedCycle <= Q <= currentThroughCycle; and
- it has not been superseded by an already-observed newer occurrence.

Stale/superseded occurrences remain in historical `evidenceHistory`. Never mutate/delete them because they no longer drive the current judgement.

# 9. Same-question supersession

Directed collection uses stable question IDs.

If a newer occurrence's definition uses `replace-older-same-question`, it supersedes every older active occurrence with the same questionId, including an older occurrence of the same definition ID.

`supersedesDefinitionIds` additionally handles explicit asymmetric replacement.

Unrelated questions never auto-supersede.

This is the required #102 retasking seam: a second look updates the answer rather than stacking a vote.

# 10. Canonical model definition

Strict `V2HqBeliefModelDefinition` includes conceptually:

```ts
{
  modelId: "kestrel-hq-belief-v1"
  scenarioId: "kestrel-strait"
  reducerSemanticsId: "kestrel-binary-hypothesis-v2"

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

**Use reducer semantics ID `kestrel-binary-hypothesis-v2`, not v1.** The deep review changed reducer semantics: a diagnostic direction may survive lower-grade contrary indicators. Encoding this as a new semantic ID prevents silent historical reinterpretation.

Unknown reducer semantics ID fails closed.

# 11. Full evidence vocabulary / content identity

The model predeclares every already-approved Kestrel HQ evidence definition from [[23-HQ-BELIEF-AND-EVIDENCE]] and [[26-LATTICE-COLLECTION-MATRIX]], including ordinary, reroute, focused, Lattice and liaison definitions.

#100 implements only the producers it owns. #102 later produces occurrences using these existing definitions and cannot redefine them.

Decision-significant model data includes:

- ordinary schedule;
- trigger IDs;
- raw-fact→source-fact tables;
- source-fact→definition tables;
- question/source-context/lifetime/supersession semantics;
- reducer semantics ID;
- safe semantic refs.

All participate in the model digest. #103 later includes the model/digest in final Kestrel content identity.

# 12. Content semantic digest

Content exports deterministic equivalent `kestrelHqBeliefModelDigest` using stable canonical serialization + SHA-256 locally in content.

Semantic mutation → digest mutation, including reducer semantics v1→v2.

Render-only locale copy outside semantic refs may remain digest-neutral where supported.

# 13. Sim API

Responsibilities equivalent to:

```ts
deriveV2HqBeliefAtCycle(session, model, cycle)
deriveV2CurrentHqBelief(session, model)
deriveV2HqBeliefHistory(session, model)
```

Keep lower reducers directly unit-testable.

# 14. Trusted history index

Build bounded internal index:

```ts
type V2VerifiedCycleHistory = {
  ravellanByCycle: Map<number, V2RavellanDecisionLedgerEntry>
  commandByCycle: Map<number, V2CommandSetLedgerEntry>
}
```

Input session already passed trusted replay. Fail on duplicate/missing prerequisites rather than guessing.

When collection cares what coalition actually ordered, inspect `command-set.finalOrders`, never raw dispositions.

# 15. Observation boundary

```text
verified hidden history
→ authorised observation extractor
→ bounded source fact
→ canonical evidence definition
→ runtime occurrence
→ reducers
→ safe brief
```

Raw hidden Ravellan state appears only in authorised extractors.

## C2 reroute producer

Only if C2 finalOrders contains model reroute trigger.

Authorised hidden inputs only from verified C2 Ravellan decision:

- normal action;
- post-decision preparation.

No posture/policy row/current/future state/seed/intent.

Model mapping → source fact → exact definition → C3 occurrence.

## C4 focused producer

Only if C3 finalOrders contains model focused trigger.

Authorised hidden input only verified C4 post-decision preparation.

No posture/action/policy row/C3 tasking-time/future state.

Model mapping → source fact → exact definition → C4 occurrence.

# 16. Future #102 occurrence seam

#102 may append only runtime occurrences whose definition ID:

- exists in the supplied model;
- matches authorised target producer semantics;
- preserves all canonical definition fields;
- has legitimate deterministic task/source ref and result cycle.

A merely schema-valid arbitrary evidence object is rejected.

The seam supports newer same-question occurrences for legal retasking.

# 17. Occurrence instantiation helper

Implement one sim-owned helper equivalent to:

```ts
instantiateV2HqEvidence(definition, observedCycle, stableSourceRef)
```

Rules:

- fixed definition instantiates only at its authored cycle;
- through-terminal definition only at authorised producer result cycle;
- through-terminal currentThroughCycle = 6;
- deterministic unique instanceId;
- semantic fields copied from definition;
- runtime cannot alter implication/diagnosticity/question/source-context/warning/public-case roles.

# 18. Ordinary evidence

No hidden input. Instantiate only definitions listed by `ordinaryEvidenceDefinitionIdsByCycle` with observed cycle <= query cycle.

C3 routine force-disposition evidence never reads hidden preparation. Action-specific world prose never feeds evidence selection.

# 19. Evidence-history algorithm

For query Q:

1. validate model/scenario/reducer IDs;
2. validate Q 1..6;
3. require authoritative Ravellan decision Q;
4. build verified history index;
5. instantiate scheduled ordinary evidence observed <= Q;
6. if Q>=3 and C2 reroute executed: C2 facts → source fact → definition → C3 occurrence;
7. if Q>=4 and C3 focused executed: C4 result-time fact → source fact → definition → C4 occurrence;
8. later #102 appends only canonical model-backed directed occurrences;
9. compute same-question + explicit supersession;
10. derive current set by relevance + supersession;
11. reduce intent assessment with the **v2 categorical reducer below**;
12. reduce warning;
13. reduce public-case state + direction;
14. derive previous snapshot;
15. derive assessment-change kind + cause;
16. derive bounded safe brief refs.

No mutation.

# 20. Exact intent reducer — `kestrel-binary-hypothesis-v2`

For current, non-superseded occurrences compute:

```ts
Pdiag = any preparation diagnostic
Cdiag = any coercion diagnostic
Pind  = any preparation indicator
Cind  = any coercion indicator
```

Then exactly:

```text
Pdiag && Cdiag
→ unclear + conflicted

Pdiag && !Cdiag && Cind
→ preparation + weak

Pdiag && !Cdiag && !Cind
→ preparation + coherent

Cdiag && !Pdiag && Pind
→ coercion + weak

Cdiag && !Pdiag && !Pind
→ coercion + coherent

!Pdiag && !Cdiag && Pind && Cind
→ unclear + conflicted

!Pdiag && !Cdiag && Pind && !Cind
→ preparation + weak

!Pdiag && !Cdiag && Cind && !Pind
→ coercion + weak

no directional evidence
→ unclear + weak
```

Ambiguous occurrences do not choose direction.

**Evidence count never breaks these ties.** A diagnostic item outranks any number of opposite indicators for direction, but the surviving contrary indicators prevent `coherent` and must be surfaced in the bounded brief.

This gives diagnosticity actual categorical meaning without a weighted score.

# 21. Warning reducer

Usable iff a current preparation occurrence has warningRole usable.

Warning remains independent of intent direction/picture.

# 22. Public-case reducer

Public case is deliberately stricter than the internal estimate.

Ignore publicCaseRole none.

- no eligible direction → none/null;
- eligible evidence on both directions → tentative/null;
- one direction, no diagnostic → tentative/that direction;
- one direction + diagnostic and **no active opposite directional evidence of any class** → credible-source-sensitive/that direction.

Thus `preparation + weak` may coexist with only tentative public case if a lower-grade contrary indicator remains.

Directionless credible is impossible.

# 23. Assessment-change kind

Use exact nine-category mapping from [[23-HQ-BELIEF-AND-EVIDENCE]] across all 36 legal previous/current assessment pairs. No fallback.

# 24. Change-cause derivation

For changed assessment compare previous/current occurrence sets and return exactly one:

- new-evidence;
- staleness;
- supersession;
- mixed;
- none for initial/unchanged.

Safe copy uses both change kind + cause so timer-driven staleness never appears as unexplained analyst mood swing.

# 25. Safe brief

Bound to:

- one judgement;
- <=2 basis entries with sourceContextRef;
- <=1 contrary entry;
- exactly one gap;
- <=1 watch-for;
- <=1 change line;
- <=1 warning line;
- when #101 exposes an actionable attribution opportunity, one safe claim ref matching persisted direction.

If the categorical reducer chooses a direction despite an opposite indicator, that contrary indicator **must** be the contrary entry unless another contrary fact is more directly material by an authored deterministic rule.

No full evidence ledger, internal picture/diagnosticity/public-case enums, source facts, hidden state or confidence score.

# 26. Phase/history edge cases

After command advances to next cycle but before next Ravellan decision, current query fails `v2_hq_belief_not_ready`.

Historical queries use historical entries only. Later state cannot rewrite prior source facts/occurrences/snapshots. Stale evidence remains historical.

# 27. Versioning

Persisted V2 format remains `0.4.0-prototype`.

**The content/model semantic version changes from the previously proposed reducer v1 to `kestrel-binary-hypothesis-v2`; this is not a persisted-session ruleset bump.**

No bootstrap/session/action-ledger/replay/migration change occurs in #100.

# 28. Exact implementation order

1. shared assessment/warning/public-case/change enums/types;
2. shared evidence-definition/runtime occurrence schemas;
3. shared strict belief-model schema;
4. content model with full 23+26 vocabulary, question/source-context/schedule/mapping/supersession refs and reducer semantics v2;
5. content validation + semantic digest tests;
6. export content model;
7. create/export dedicated sim HQ-belief module;
8. implement occurrence instantiation;
9. implement exact v2 intent reducer + truth table;
10. implement warning/public-case reducers;
11. implement 36-pair assessment change + cause derivation;
12. implement model/scenario/reducer guards;
13. implement verified history/final-order helpers;
14. implement C2/C4 producers;
15. implement ordinary evidence/current relevance/supersession;
16. implement historical/current/history APIs;
17. implement phase guard + bounded brief;
18. implement strict future #102 occurrence-validation seam;
19. hostile/non-interference/history/content-identity tests;
20. replay/import tests using `validateV2ReplaySkeleton` output;
21. independent tradecraft review;
22. independent replay/architecture review;
23. remediate;
24. full repository gates;
25. commit/push/update/close #100;
26. stop before #98.

# 29. Required hostile tests

## Layering / purity

- sim production does not import content;
- content does not import sim for hashing;
- model explicit;
- unsupported scenario/model/reducer fails closed;
- repeated derivation deep-equal;
- state/hash/revision unchanged;
- no #100 ledger/persisted-version change.

## Reducer truth table

Exhaust all boolean combinations of Pdiag/Cdiag/Pind/Cind and prove the v2 mapping.

Mandatory fixtures:

- prep diagnostic + coercion indicator → preparation weak;
- coercion diagnostic + prep indicator → coercion weak;
- diagnostics both ways → unclear conflicted;
- indicators both ways only → unclear conflicted;
- diagnostic only → directional coherent;
- indicators only one side → directional weak;
- adding extra same-class indicators never changes direction by count;
- material opposite indicator is surfaced in brief when diagnostic direction survives.

## Definition / occurrence / currency

- full 23+26 definitions exactly once;
- every directional definition has sourceContextRef;
- fixed/through-terminal lifetime exact;
- stale occurrence retained historically;
- unique deterministic instance IDs;
- runtime caller cannot alter canonical semantics;
- ordinary schedule never auto-instantiates directed evidence.

## Same-question replacement

- newer same-question occurrence replaces older one including same definition ID;
- repeat collection never stacks votes;
- unrelated questions independent;
- explicit asymmetric supersession works deterministically.

## Observation / history

- raw hidden facts only in authorised extractors;
- reroute C3 uses C2 history;
- focused C4 uses C4 result-time history;
- later state never rewrites earlier snapshot;
- finalOrders is executed-order source;
- world prose cannot alter evidence;
- routine C3 report never reads hidden prep.

## Tradecraft / player semantics

- assessment-warning orthogonality;
- internal directional judgement can survive weaker contrary indicator;
- public case remains tentative while any active opposite directional evidence exists;
- directionless credible rejected;
- all 36 assessment changes;
- change causes deterministic;
- all nine assessment+warning safe mappings;
- source/method context without numeric confidence.

## Replay / identity

- pre-Ravellan query fails;
- unverified import cannot project;
- replay-validated session can project;
- semantic digest changes on reducer semantics v1→v2 and on schedule/mapping/question/source-context/lifetime/supersession/ref changes;
- existing #99 replay vectors structurally valid;
- V1 unchanged.

# 30. Independent reviews

## Intelligence/tradecraft

Attack:

- posture oracle/raw-truth shortcut;
- categorical reducer irrationality;
- diagnostic evidence still having no practical meaning;
- weak contrary evidence being hidden when a direction survives;
- assessment/warning/public-case conflation;
- directionless public claims;
- stale evidence silently forgotten;
- retasked collection stacking votes;
- routine coverage omniscience;
- source/method context absent or becoming a confidence meter;
- dossier creep.

## Replay/architecture

Attack:

- persisted #100 creep;
- mutation during derivation;
- unverified import;
- current-state-for-history bugs;
- static/runtime evidence confusion;
- same-question identity bugs;
- sim→content production dependency;
- semantic drift under same content identity;
- failure to bump reducer semantics ID after algorithm changes;
- UI/server analytic duplication;
- accidental persisted version bump;
- #99 ordering regression;
- V1 contamination;
- generic framework creep.

All P0/P1 mandatory; fix P2 findings involving hidden-information leakage, replay/content identity, layering, deterministic ambiguity or player-facing misrepresentation.

# 31. Closure

#100 closes only when:

- [[23-HQ-BELIEF-AND-EVIDENCE]] + this architecture implemented/tested;
- the v2 categorical reducer passes exhaustive truth-table tests;
- assessment/warning/directional public-case remain separate;
- stale evidence retained historically and explainably removed from current judgement;
- retasking cannot stack votes;
- observation boundary remains narrow;
- no persisted schema/ledger/version change occurred;
- content identity covers all decision-significant semantics including reducer v2;
- package layering preserved;
- both independent reviews clear after remediation;
- full gates pass;
- commit pushed and issue evidence recorded;
- no #98 implementation started in same run.
