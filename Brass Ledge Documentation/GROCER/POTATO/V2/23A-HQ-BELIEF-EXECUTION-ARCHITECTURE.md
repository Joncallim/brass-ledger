---
type: v2-hq-belief-execution-architecture
status: active
---

# HQ Belief Execution Architecture

Backlink: [[README]]

This is the exact implementation/replay authority for **#100** against committed #99.

- [[23-HQ-BELIEF-AND-EVIDENCE]] owns product/tradecraft semantics.
- [[23B-HQ-BELIEF-STATE-SPACE-AUDIT]] owns exhaustive algebraic/temporal/equivalence coverage.
- [[23C-HQ-BELIEF-EVIDENCE-CATALOG]] owns exact evidence definitions, #100 producer mappings and copy.
- [[23D-HQ-BELIEF-STATE-SPACE-VECTORS.json]] owns machine-readable golden counts/hashes.
- [[26-LATTICE-COLLECTION-MATRIX]] owns future #102 task persistence and collection-producer semantics.
- [[30-ARCHITECTURE-CONTRACT]] owns repository/replay boundaries.

# 1. Frozen architecture — pure read model

#100 is pure derived state.

Do **not**:

- add evidence, assessment, warning or public-case state to persisted `V2Session`;
- add an `hq-belief-update` ledger entry;
- increment revision for analysis;
- persist staleness or supersession;
- bump the persisted V2 ruleset version;
- persist a mutable `none/tentative/credible` attribution mirror.

All #100 products reconstruct from:

- a trusted replay-valid V2 history prefix; and
- an explicitly supplied, digest-verified `kestrel-hq-belief-v1` model bundle.

Persisted V2 format remains:

`0.4.0-prototype`

# 2. Scope boundary between #100 and #102

#100 production code owns:

- all 19 static evidence definitions;
- ordinary C1–C4 evidence;
- C2 reroute → C3 evidence;
- C3 focused staging → C4 evidence;
- occurrence construction/identity;
- role-specific currency and supersession;
- assessment, warning and public-case reducers;
- deltas and bounded brief derivation;
- historical/current/history APIs.

#100 production code does **not** own:

- Lattice progress or task persistence;
- C4/C5 target selection;
- target default recommendation;
- target result extraction from live task history;
- liaison persistence/obligation;
- a new task ledger discriminator.

The #100 content model predeclares the semantic meanings of future Lattice/liaison evidence so #102 cannot redefine them. A **test-only reference envelope** may instantiate those definitions from the frozen #102 design to verify the state-space vectors. That test oracle is not a production #102 implementation.

#102 later owns a separate, digest-covered `kestrel-collection-v1` producer model that references the predeclared #100 definition IDs. #103 binds both digests into final Kestrel content identity.

# 3. Canonical phase and historical cut

Keep #99 mutation order:

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

After command N advances state to N+1, current N+1 intelligence is not ready until `ravellan-decision N+1` exists.

Fail closed with an error equivalent to:

`v2_hq_belief_not_ready`

For historical cycle Q, include exactly:

- opening intent;
- Ravellan decisions through Q;
- command sets through Q−1;
- evidence results due at/before Q;
- no command Q;
- no future ledger entry/current terminal state as an analytical input.

Changing command Q or any later entry cannot change the Q snapshot.

# 4. C6 pre-manifestation cut

C6 order is:

```text
replay/persist hidden R6 decision
→ resolve any C5 task result from authorised latest-normal facts
→ derive the C6 pre-manifestation HQ snapshot and current public case
→ project the safe overt crisis family
→ derive terminal routes
```

The R6 action, policy row and terminal copy are never evidence and never grant warning.

A C5 task result may arrive at C6, but its source facts remain the C5/latest-normal cut because #99 performs no new normal action/preparation step at C6.

Player-facing C6 label:

> **What Intelligence knew immediately before the confrontation became overt.**

# 5. Trust boundary

Normal projection accepts only:

- authoritative live history produced by sim-owned transitions; or
- the canonical `V2Session` returned by trusted `validateV2ReplaySkeleton(...)` with trusted identity/agenda content.

Import flow:

```text
raw save
→ trusted live identity/content resolution
→ trusted replay validation
→ canonical session
→ exact model-bundle resolution
→ HQ derivation
→ safe player projection
```

Never derive normal player intelligence directly from unverified imported ledger fields.

Before #103 binds the belief-model digest into Kestrel content identity, #100 exposes no production server/browser Kestrel session endpoint. Its pure APIs and tests still validate scenario/model/semantic IDs.

# 6. Exact file placement

## Shared canonical JSON

Create:

`packages/shared/src/canonical-json.ts`

Export it from `packages/shared/src/index.ts`.

It is pure/browser-safe and implements the existing #99 recursive key-sorted JSON semantics for schema-parsed JSON values:

- object keys lexical;
- array order preserved;
- finite numbers only;
- `-0` normalised to `0`;
- unsupported/undefined values rejected or handled exactly as current #99 canonicalisation.

Keep #99’s public `canonicalV2Json` name in sim, but delegate it to the shared implementation. Golden tests must prove all existing #99 hashes/digests remain byte-for-byte unchanged.

## Shared V2 derived types

Modify:

`packages/shared/src/v2.ts`

Add strict **derived-only** types/schemas for:

- direction, diagnosticity and basis pattern;
- static evidence definition;
- runtime evidence occurrence;
- role-specific relevance;
- assessment and representative evidence refs;
- warning with basis occurrence;
- public-case basis;
- complete evidence/product delta;
- bounded safe Intelligence-Chief brief;
- `V2HqBeliefModelDefinition`;
- resolved model bundle.

Do not nest any #100 type in persisted bootstrap/session/action-ledger schemas.

## Content

Create:

`packages/content/src/v2-kestrel-hq-belief.ts`

Export from `packages/content/src/index.ts`.

It owns:

- exact 19 evidence definitions;
- ordinary schedule;
- reroute/focused trigger IDs and producer mappings;
- exact source/limitation/evidence/judgement/gap/watch/change/warning/public-claim copy;
- strict validation/canonicalisation;
- deterministic semantic digest;
- immutable resolved model bundle.

It does **not** own live #102 task persistence or target production.

Do not register Kestrel in the V1 scenario registry during #100.

Content uses shared canonical JSON plus local Node SHA-256; it must not add a production dependency on sim.

## Sim

Create:

`packages/sim/src/v2-hq-belief.ts`

Export from `packages/sim/src/index.ts`.

Do not put the subsystem into the existing large `v2.ts`.

Production sim must not import `@brass-ledger/content`; the resolved model is an explicit argument.

# 7. Core types

Equivalent semantics:

```ts
type V2HqDirection = "preparation" | "coercion"
type V2HqEvidenceImplication = V2HqDirection | "ambiguous"
type V2HqEvidenceDiagnosticity = "indicator" | "diagnostic"

type V2HqBasisPattern =
  | "no-direction"
  | "indicator-preparation"
  | "indicator-coercion"
  | "indicator-conflict"
  | "diagnostic-preparation-clear"
  | "diagnostic-preparation-qualified"
  | "diagnostic-coercion-clear"
  | "diagnostic-coercion-qualified"
  | "diagnostic-conflict"

type V2HqAssessment =
  | { direction: "unclear"; picture: "weak" | "conflicted"; basisPattern: V2HqBasisPattern }
  | { direction: V2HqDirection; picture: "weak" | "coherent"; basisPattern: V2HqBasisPattern }

type V2HqWarning =
  | { state: "none"; basisEvidenceInstanceId: null }
  | { state: "usable"; basisEvidenceInstanceId: string }
```

Basis pattern is internal analytical provenance, not a player confidence label.

# 8. Role-specific relevance

Use a strict role relevance equivalent to:

```ts
type V2HqRelevanceRule =
  | { kind: "none" }
  | { kind: "fixed"; observedCycle: 1|2|3|4|5; currentThroughCycle: 1|2|3|4|5|6 }
  | { kind: "result-through-terminal" }
```

Each evidence definition carries:

- `assessmentRelevance`;
- `warningRelevance`;
- `publicCaseRelevance`.

Validation:

- warning relevance exists only on preparation evidence with warning role;
- warning relevance never outlives assessment relevance;
- public relevance exists only on source-sensitive directional evidence;
- dynamic result rules instantiate only at authorised C5/C6 result points;
- stale evidence remains historical.

Exact role windows are [[23B-HQ-BELIEF-STATE-SPACE-AUDIT]] and [[23C-HQ-BELIEF-EVIDENCE-CATALOG]].

# 9. Static evidence definition

Equivalent strict shape:

```ts
type V2HqEvidenceDefinition = Readonly<{
  definitionId: V2HqEvidenceDefinitionId
  claimId: "ravellan-intent"
  questionId:
    | "ravellan-intent-general"
    | "landing-force-staging"
    | "auxiliary-tasking"
    | "operational-sequence"
  producerKind: "ordinary" | "reroute" | "focused" | "lattice" | "liaison"
  implication: "preparation" | "coercion" | "ambiguous"
  diagnosticity: "indicator" | "diagnostic"
  sourceGroupId: string
  corroborationGroupId:
    | "physical-staging"
    | "auxiliary-tasking"
    | "operational-sequence"
    | "partner-liaison"
    | null
  sourceContextRef: string
  limitationRef: string
  summaryRef: string
  warningRole: "none" | "usable"
  publicCaseRole: "none" | "source-sensitive"
  assessmentRelevance: V2HqRelevanceRule
  warningRelevance: V2HqRelevanceRule
  publicCaseRelevance: V2HqRelevanceRule
  supersessionPolicy: "explicit-only" | "replace-older-same-question"
  supersedesDefinitionIds: readonly V2HqEvidenceDefinitionId[]
}>
```

The third target ID is `operational-sequence`. Do not retain the misleading former ID `political-operational-sync`; the authorised source contains no political messaging.

# 10. Runtime occurrence and origin

Runtime evidence is derived, not persisted by #100.

Use strict origins equivalent to:

```ts
type V2CanonicalLedgerEntryRef = Readonly<{
  kind: "command-set" | "ravellan-decision"
  cycle: 1|2|3|4|5|6
  preRevision: number
  postRevision: number
  postStateHash: string
}>

type V2HqEvidenceOrigin =
  | { kind: "ordinary"; cycle: 1|2|3|4; slotId: string }
  | {
      kind: "reroute" | "focused"
      triggerEntry: V2CanonicalLedgerEntryRef
      observationEntry: V2CanonicalLedgerEntryRef
      producerSlotId: string
    }
```

#102 later adds its own strict task/liaison origins; #100 must not invent a task ledger kind.

Runtime occurrence equivalent:

```ts
type V2HqEvidence = Readonly<{
  instanceId: string
  definitionId: V2HqEvidenceDefinitionId
  origin: V2HqEvidenceOrigin
  observedCycle: 1|2|3|4|5|6
  assessmentCurrentThroughCycle: 1|2|3|4|5|6 | null
  warningCurrentThroughCycle: 1|2|3|4|5|6 | null
  publicCaseCurrentThroughCycle: 1|2|3|4|5|6 | null

  // copied from the canonical definition only
  claimId: "ravellan-intent"
  questionId: string
  implication: V2HqEvidenceImplication
  diagnosticity: V2HqEvidenceDiagnosticity
  sourceGroupId: string
  corroborationGroupId: string | null
  sourceContextRef: string
  limitationRef: string
  summaryRef: string
  warningRole: "none" | "usable"
  publicCaseRole: "none" | "source-sensitive"
}>
```

Instance ID is SHA-256 of shared canonical JSON for:

```text
{
  tag: "kestrel-hq-evidence-instance-v1",
  modelSemanticDigest,
  definitionId,
  observedCycle,
  origin
}
```

No player/free-form string controls identity. Normal DTOs never expose origin refs/revisions/hashes.

# 11. Occurrence constructor

One sim-owned helper equivalent to:

```ts
instantiateV2HqEvidence({ resolvedModel, definitionId, observedCycle, origin })
```

It:

1. resolves the exact definition;
2. validates producer kind against origin;
3. validates fixed/result timing;
4. derives all three role-current-through values;
5. copies every semantic field from the definition;
6. computes instance ID;
7. rejects caller-supplied semantic overrides.

Reject duplicate instance IDs, one ID with differing semantics, or multiple directed occurrences for the same question/result cycle.

# 12. Model representation and identity

Use closed object maps keyed by stable IDs for unordered collections.

`V2HqBeliefModelDefinition` contains at minimum:

- `modelId = kestrel-hq-belief-v1`;
- `scenarioId = kestrel-strait`;
- `reducerSemanticsId = kestrel-binary-hypothesis-v1`;
- evidence definitions by ID;
- ordinary schedule by cycle;
- reroute/focused trigger IDs;
- #100 raw-fact → source-fact → definition mappings;
- exact copy registries;
- all 15 basis-pattern/warning presentation mappings.

The content resolver:

1. strict-parses raw model data;
2. canonicalises unordered semantic collections;
3. computes SHA-256 over shared canonical JSON;
4. returns `{ definition, semanticDigest }`.

Sim recomputes the digest and rejects mismatch. It also rejects unsupported scenario/model/reducer IDs.

All decision-significant English copy is included in the prototype digest because wording affects player decisions and no localization architecture exists yet.

# 13. Trusted history index

Build one bounded canonical index:

```ts
type V2VerifiedCycleHistory = {
  intentDeclaration: V2IntentDeclarationLedgerEntry
  ravellanByCycle: ReadonlyMap<number, V2RavellanDecisionLedgerEntry>
  commandByCycle: ReadonlyMap<number, V2CommandSetLedgerEntry>
}
```

Fail on missing, duplicate or out-of-order prerequisites.

When intelligence cares what HQ actually ordered, use `command-set.finalOrders`, never raw client dispositions.

# 14. Authorised #100 observation extractors

Raw hidden Ravellan state appears only inside these two extractors.

## C2 reroute → C3

Only when authoritative C2 final orders contain the model’s reroute trigger.

Inputs only:

- C2 normal Ravellan action;
- C2 post-decision preparation.

No posture, row, seed, intent, current/future state or terminal action.

Output source fact and definition mapping are exact in [[23C-HQ-BELIEF-EVIDENCE-CATALOG]].

## C3 focused staging → C4

Only when C3 final orders contain the focused trigger.

Input only:

- C4 post-decision preparation.

No posture, C4 action/row, tasking-time state, C5/C6 state or terminal action.

Output mapping is exact in [[23C-HQ-BELIEF-EVIDENCE-CATALOG]].

Dependency direction is always:

```text
verified hidden history
→ authorised source-fact extractor
→ catalogued definition ID
→ occurrence constructor
→ role reducers
→ safe brief
```

# 15. Ordinary evidence

Ordinary evidence has no hidden-state parameter.

Instantiate only exact scheduled definition IDs for cycles at/before the query cut.

`combat-elements-dispersed` is bounded routine coverage, not omniscient hidden truth.

Action-specific C4 situation prose never feeds evidence selection or reduction.

# 16. Currentness and persistent supersession

For each role, occurrence A is current at Q iff:

- it has that role’s non-null current-through value;
- `A.observedCycle <= Q <= roleCurrentThrough`; and
- A has not been superseded by a later occurrence observed by Q.

Compute supersession from **all** occurrences observed by Q before role-current filtering.

A is superseded when later B:

- uses `replace-older-same-question` and shares A’s question; or
- explicitly lists A’s definition ID.

Supersession is permanent. A never resurrects when B becomes stale or is itself replaced.

Stale/superseded occurrences remain in historical evidence.

# 17. Reducers

## Intent

Use assessment-current occurrences only and the exact 16-row table in [[23B-HQ-BELIEF-STATE-SPACE-AUDIT]].

Return assessment plus basis pattern and deterministic representative support/contrary occurrence IDs.

## Warning

Use warning-current occurrences only.

`usable` iff current non-superseded preparation evidence has warning role. Select deterministic basis occurrence by:

1. newest observed cycle;
2. diagnostic before indicator;
3. definition ID;
4. instance ID.

## Public case

Use public-current eligible occurrences, while opposite-direction blockers include any opposite occurrence current for **assessment or public-case use**.

Credible direction D requires:

- one eligible diagnostic D;
- no current opposite direction;
- one additional eligible D occurrence from another corroboration group.

Return exactly two deterministic support IDs/groups:

1. primary diagnostic — newest, definition ID, instance ID;
2. corroborator from another group — diagnostic before indicator, newest, definition ID, instance ID.

One source is tentative. Two indicators are tentative. Directionless credible is invalid.

# 18. Complete snapshot and delta

Equivalent snapshot:

```ts
type V2HqBeliefSnapshot = Readonly<{
  cycle: 1|2|3|4|5|6
  evidenceHistory: readonly V2HqEvidence[]
  assessmentCurrentEvidenceInstanceIds: readonly string[]
  warningCurrentEvidenceInstanceIds: readonly string[]
  publicCaseCurrentEvidenceInstanceIds: readonly string[]
  assessment: V2HqAssessment
  warning: V2HqWarning
  publicCaseBasis: V2HqPublicCaseBasis
  delta: V2HqBeliefDelta
  brief: V2HqIntelligenceBrief
}>
```

Delta is total:

```ts
type V2HqBeliefDelta = Readonly<{
  assessmentChange:
    | "initial" | "unchanged" | "narrowed" | "strengthened"
    | "weakened" | "conflicted" | "cleared-conflict"
    | "reopened" | "reversed"

  warningChange:
    | "initial" | "unchanged" | "gained" | "refreshed"
    | "lost-stale" | "lost-superseded" | "lost-mixed"

  publicCaseStateChange:
    | "initial" | "unchanged" | "opened" | "strengthened"
    | "weakened" | "closed"

  publicCaseDirectionChange:
    | "initial" | "unchanged" | "established" | "clarified"
    | "became-conflicted" | "reversed" | "cleared"

  evidenceChangeCause:
    | "none" | "new-evidence" | "staleness" | "supersession" | "mixed"

  addedInstanceIds: readonly string[]
  becameAssessmentStaleInstanceIds: readonly string[]
  becameWarningStaleInstanceIds: readonly string[]
  becamePublicCaseStaleInstanceIds: readonly string[]
  newlySupersededInstanceIds: readonly string[]
}>
```

## Assessment change

Use the exact total 36-pair mapping in [[23-HQ-BELIEF-AND-EVIDENCE]]. No fallback.

## Warning change

- none→usable: gained;
- usable→none due only to warning relevance aging: lost-stale;
- usable→none due only to replacement: lost-superseded;
- usable→none with both: lost-mixed;
- usable→usable with a different basis instance: refreshed;
- otherwise unchanged.

## Public-case state change

- no previous snapshot: initial;
- same state: unchanged;
- none→non-none: opened;
- non-none→none: closed;
- tentative→credible: strengthened;
- credible→tentative: weakened.

## Public-case direction change

Apply in order:

1. no previous snapshot → initial;
2. same direction, including null → unchanged;
3. previous none/null → current directional → established;
4. previous tentative/null → current directional → clarified;
5. previous directional → current none/null → cleared;
6. previous directional → current tentative/null → became-conflicted;
7. opposite non-null directions → reversed.

The schema makes all remaining pairs impossible.

## Evidence cause

- only independent new current occurrence(s): new-evidence;
- a new occurrence replacing an older answer, with no independent staleness: supersession;
- only role currentness aging: staleness;
- more than one material cause class: mixed;
- no material evidence/product change: none.

A superseding occurrence is not automatically `mixed` merely because it is also new.

# 19. Deterministic brief

The normal brief contains:

- one judgement;
- at most two basis facts;
- at most one contrary fact;
- exactly one key gap;
- at most one watch-for;
- at most one material update line;
- a separate warning-status line;
- later, a safe public-claim label only when #101 exposes an unspent credible case.

Every displayed fact includes concise source-context and limitation copy.

## Evidence ranking

Directional assessment:

1. supporting diagnostic before indicator;
2. warning-bearing before non-warning within class;
3. newest;
4. definition ID;
5. instance ID.

Select first, then prefer a second from another question when available.

The highest-ranked opposite-direction occurrence is mandatory contrary evidence whenever one exists.

Conflicted assessment selects one preparation and one coercion representative using the same rank. If warning is usable, the warning-bearing preparation occurrence must be the preparation representative.

Unclear/weak uses the newest ambiguous occurrence or authored gap.

## Presentation mapping

Gap/watch copy is keyed by `basisPattern + warning`, not assessment alone. All 15 algebraically legal mappings must exist; impossible content combinations fail validation.

At C5/C6, warning status is explicit in ordinary language whether usable or absent. The player never infers warning-none from a missing component.

## Update-line priority

1. player-tasked/liaison report arrival;
2. warning gained/refreshed/lost;
3. public action-space change;
4. assessment direction/picture change;
5. material staleness/supersession;
6. other displayed-basis change.

Task arrival may use the update line while the separate warning/public-claim lines communicate simultaneous product changes.

# 20. Public APIs

Responsibilities equivalent to:

```ts
deriveV2HqBeliefAtCycle(
  trustedSession: V2Session,
  resolvedModel: V2ResolvedHqBeliefModel,
  cycle: 1|2|3|4|5|6,
): V2HqBeliefSnapshot

deriveV2CurrentHqBelief(
  trustedSession: V2Session,
  resolvedModel: V2ResolvedHqBeliefModel,
): V2HqBeliefSnapshot

deriveV2HqBeliefHistory(
  trustedSession: V2Session,
  resolvedModel: V2ResolvedHqBeliefModel,
): readonly V2HqBeliefSnapshot[]
```

Exact names may follow repository convention. Keep lower model validation, occurrence construction and reducers directly testable.

# 21. Future replay-provider seam

Committed #99’s trusted agenda provider currently receives only state. Once #98 recommendations depend on #100 history, replay must not hand the provider the unverified full saved session.

#98 must evolve the in-memory provider to receive a sim-created verified projection context containing:

- trusted identity;
- initial state;
- current replay state/revision;
- the already re-executed ledger prefix only.

At command cycle Q, the prefix includes Q’s verified Ravellan decision and prior commands, but not the unverified command Q or any future entry.

This future API evolution changes no persisted schema/version and does not alter #99 transition semantics. #100 need not modify the provider now.

# 22. Test-only state-space oracle

Create a test-only reference module or fixture generator outside production exports that independently reimplements the design envelope.

It may use the frozen future #102 producer tables solely to reproduce [[23D-HQ-BELIEF-STATE-SPACE-VECTORS.json]]. It must not:

- persist tasks;
- enter server/headless runtime;
- become the production reducer or producer implementation;
- be imported by shipping sim code.

Tests compare generated canonical arrays/counts/hashes to 23D. They must fail if someone replaces the generator with copied fixture output.

# 23. Exact implementation order

1. shared canonical JSON + #99 golden equivalence tests;
2. shared derived enums/discriminated schemas, including basis pattern and role relevance;
3. strict definition/occurrence/origin/model/bundle schemas;
4. content model from [[23C-HQ-BELIEF-EVIDENCE-CATALOG]];
5. content validation/canonicalisation/semantic-digest tests;
6. dedicated sim HQ-belief module/export;
7. model/scenario/digest guards;
8. trusted history index and historical cycle cut;
9. origin/ref builders and occurrence constructor;
10. ordinary producer;
11. reroute/focused authorised extractors and mappings;
12. persistent supersession and three role-current sets;
13. 16-row assessment/basis-pattern reducer;
14. warning reducer;
15. corroborated public-case reducer;
16. total assessment/warning/public/evidence delta;
17. deterministic bounded brief and 15 presentation mappings;
18. current/history APIs;
19. test-only independent state-space generator + 23D comparison;
20. hidden-information/import/content-identity mutation tests;
21. fresh intelligence/tradecraft review;
22. fresh replay/architecture review;
23. remediate all valid blocking/integrity findings;
24. full repository gates;
25. commit/push/update/close #100;
26. stop before #101.

# 24. Required #100 proof

## Pure/replay boundary

- repeated derivation deep-equal;
- state/revision/all #99 hashes unchanged;
- no #100 ledger/version mutation;
- unverified import cannot reach normal projection;
- replay-validated session can project;
- current query before current Ravellan decision fails;
- command Q/future entries do not alter historical Q.

## Model/content identity

- exact 19 definitions;
- all refs resolve exactly once;
- digest deterministic;
- any semantic mapping/relevance/reducer/copy change changes digest;
- bundle mismatch rejected;
- shared canonical JSON matches every pre-existing #99 golden hash;
- sim has no production content dependency; content has no sim dependency.

## Evidence architecture

- ordinary/reroute/focused outputs exact;
- raw hidden facts confined to authorised extractors;
- posture/R6 action/world prose cannot affect evidence;
- occurrence origin collision/semantic override rejected;
- role-specific currency exact;
- stale evidence retained;
- persistent supersession/no resurrection exact.

## Reducer/brief totality

- all 16 assessment rows;
- all 10 algebraic assessment/warning pairs;
- all 15 basis-pattern/warning mappings;
- all 36 assessment-change pairs;
- total warning/public/evidence delta functions;
- one-source/directionless credible rejected;
- contrary evidence mandatory when diagnostic direction is qualified;
- C5/C6 explicit warning-none/usable copy.

## Generated architecture vectors

- test-only oracle reproduces every count/hash in 23D;
- all 19 definitions reached in the design envelope;
- zero same-target retask value;
- focused landing upgrade 138/138;
- warning loss/refresh vectors exact.

## Compatibility

- existing #99 replay/order/tamper tests green;
- V1 schemas/import/replay/client unchanged.

# 25. Independent reviews

## Intelligence/tradecraft reviewer

Attack:

- source/method ambiguity;
- single universal evidence lifetime;
- stale reporting silently forgotten;
- diagnostic evidence acting as vote count;
- contrary evidence hidden;
- assessment/warning/public-case conflation;
- one-source public accusation;
- misleading target semantics;
- C6 hindsight leakage;
- dossier/confidence-meter presentation.

## Replay/architecture reviewer

Attack:

- persisted #100 creep;
- derivation mutation;
- unverified import or future-entry leakage;
- production implementation of #102 inside #100;
- model-bundle/content-identity mismatch;
- duplicate canonical-JSON drift;
- occurrence-origin collision/forgery;
- temporary supersession/resurrection;
- current-state-for-history bugs;
- sim/content dependency inversion;
- #99 hash/order regression;
- V1 contamination;
- generic framework creep.

All P0/P1 findings are mandatory. Also remediate P2 findings involving hidden information, replay/content identity, model coverage, deterministic ambiguity or player-facing misrepresentation.

# 26. Closure rule

#100 closes only when:

- [[23-HQ-BELIEF-AND-EVIDENCE]], this file, [[23B-HQ-BELIEF-STATE-SPACE-AUDIT]], [[23C-HQ-BELIEF-EVIDENCE-CATALOG]] and 23D agree;
- production scope stops before #102 task persistence;
- all required proof and both independent reviews pass after remediation;
- no persisted V2 shape/version changes;
- full repository gates pass;
- implementation commit is pushed and issue evidence recorded;
- no #101 implementation starts in the same run.
