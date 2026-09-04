---
type: v2-hq-belief-execution-architecture
status: active
---

# HQ Belief Execution Architecture

Backlink: [[README]]

This is the exact implementation/replay authority for **#100** against committed #99.

- [[23-HQ-BELIEF-AND-EVIDENCE]] owns player/tradecraft semantics.
- [[23B-HQ-BELIEF-STATE-SPACE-AUDIT]] owns generated state-space counts and mutation vectors.
- [[23C-HQ-BELIEF-EVIDENCE-CATALOG]] owns exact IDs, mappings, lifetimes, copy and target defaults.
- [[26-LATTICE-COLLECTION-MATRIX]] owns future #102 task persistence/production.
- [[30-ARCHITECTURE-CONTRACT]] owns repository/replay boundaries.

# 1. Architecture decision — pure read model

#100 is pure derived state.

Do not:

- add HQ evidence, assessment, warning or public-case state to persisted `V2Session`;
- add an `hq-belief-update` ledger discriminator;
- increment revision for analysis;
- write expiry/supersession mutations;
- bump the persisted V2 ruleset version.

All products reconstruct deterministically from trusted replay-valid V2 history plus the exact resolved `kestrel-hq-belief-v1` model.

Persisted V2 format remains:

`0.4.0-prototype`

# 2. Canonical phase and information cut

Keep #99 ordering:

```text
intent-declaration
→ ravellan-decision C1
→ derive HQ intelligence
→ agenda / recommendation / player projection
→ command-set C1

ravellan-decision CN
→ derive HQ intelligence
→ agenda / recommendation / player projection
→ command-set CN
```

`command-set` still advances `state.cycle`.

After Cn command advances state to Cn+1, Cn+1 current projection is not ready until `ravellan-decision Cn+1` exists. Fail closed with a dedicated error equivalent to:

`v2_hq_belief_not_ready`

For a historical cycle Q, the analytical cut contains:

- intent declaration;
- Ravellan decisions through Q;
- command sets through Q−1 only;
- every evidence result due at/before Q;
- no command Q or future decision as an analytical input.

Future ledger entries may exist in a final session but are excluded from the Q cut.

# 3. C6 pre-manifestation cut

C6 is exact:

```text
persist/replay hidden R6 decision
→ resolve any C5 task result from its authorised C5/latest-normal facts
→ derive C6 pre-manifestation HQ snapshot and current public case
→ project the safe overt crisis family from R6
→ derive terminal routes
```

The R6 action, matched row and terminal safe copy are never evidence and never create tactical warning.

A C5 task result may be reported at C6, but its source facts come from the latest normal-world cut frozen by C5; it cannot inspect `attempt_seizure`, `threshold_challenge`, `abort_and_pressure`, or the R6 policy row.

The C6 player surface labels the snapshot as:

> **What Intelligence knew immediately before the confrontation became overt.**

It must not imply analysts are still debating whether a seizure exists after the player can visibly see one.

# 4. Trust boundary

Normal projection accepts only:

- an authoritative in-memory session produced through sim-owned transitions; or
- the canonical `V2Session` returned by `validateV2ReplaySkeleton(...)` using trusted live identity and agenda content.

Imported flow:

```text
raw save
→ trusted live identity/content resolution
→ validateV2ReplaySkeleton(...)
→ canonical V2Session
→ resolve exact belief-model bundle
→ derive HQ intelligence
→ safe projection
```

Never derive player intelligence directly from unverified imported ledger fields.

#100 does not expose a server/browser route before #103 binds Kestrel content identity. Internal pure functions still validate session/model scenario and semantic IDs.

# 5. Exact file placement

## Shared

Create:

`packages/shared/src/canonical-json.ts`

and export it from `packages/shared/src/index.ts`.

The function is pure/browser-safe and reproduces the existing recursive key-sorted JSON semantics used by #99 for schema-parsed JSON values. Arrays preserve authored order; object keys sort lexically. No Node crypto dependency enters shared.

Modify:

`packages/shared/src/v2.ts`

with strict **derived-only** #100 schemas/types. Do not nest them in V2 persisted state/action-ledger schemas.

## Existing sim canonicalization

Keep #99’s private `canonicalV2Json` API, but make it delegate to the shared canonical JSON function. Golden tests must prove every existing #99 state/session hash remains byte-for-byte unchanged.

This gives content and sim one serializer without changing persisted semantics.

## Content

Create:

`packages/content/src/v2-kestrel-hq-belief.ts`

and export it from `packages/content/src/index.ts`.

It owns:

- exact `kestrelHqBeliefModel`;
- schema validation/canonicalisation;
- exact copy registry;
- deterministic semantic digest;
- exact producer tables from [[23C-HQ-BELIEF-EVIDENCE-CATALOG]].

Do not register Kestrel in the V1 scenario registry during #100.

Content uses shared canonical JSON plus local Node SHA-256. It must not add a production dependency on sim merely to reuse hashing.

## Sim

Create:

`packages/sim/src/v2-hq-belief.ts`

and export it from `packages/sim/src/index.ts`.

Do not put the subsystem into the already-large `packages/sim/src/v2.ts`.

Production sim must not import `@brass-ledger/content`; the resolved model bundle is passed explicitly.

# 6. Shared model bundle

Use a strict resolved bundle equivalent to:

```ts
type V2ResolvedHqBeliefModel = Readonly<{
  definition: V2HqBeliefModelDefinition
  semanticDigest: string
}>
```

The content resolver:

1. strict-parses the raw model;
2. canonicalises every unordered semantic collection;
3. computes SHA-256 of shared canonical JSON;
4. returns the parsed definition plus digest.

Sim recomputes the digest on entry and rejects a mismatched bundle. It also requires:

- `modelId = "kestrel-hq-belief-v1"`;
- `scenarioId = "kestrel-strait"`;
- `reducerSemanticsId = "kestrel-binary-hypothesis-v1"`;
- `session.identity.scenarioId === model.scenarioId`.

Unknown/mismatched model fails closed.

#103 later binds this exact semantic digest into Kestrel’s canonical `contentDigest`. Until then, #100 is not a normal player-facing session endpoint.

# 7. Canonical model representation

Prefer object maps keyed by closed stable IDs rather than semantically unordered arrays.

Equivalent structure:

```ts
type V2HqBeliefModelDefinition = {
  modelId: "kestrel-hq-belief-v1"
  scenarioId: "kestrel-strait"
  reducerSemanticsId: "kestrel-binary-hypothesis-v1"

  evidenceDefinitionsById: Record<V2HqEvidenceDefinitionId, V2HqEvidenceDefinition>
  ordinaryEvidenceDefinitionIdsByCycle: Record<"1"|"2"|"3"|"4"|"5"|"6", readonly V2HqEvidenceDefinitionId[]>

  triggerOrderIds: {
    rerouteAndMonitor: "reroute-and-monitor"
    focusStagingCollection: "focus-staging-collection"
  }

  producerMappings: {
    reroute: ...
    focusedStaging: ...
    latticeLanding: ...
    latticeAuxiliary: ...
    latticeSequence: ...
    liaisonAuxiliary: ...
  }

  latticeDefaultTargetOrderByMainPriority: {
    beaconSecurity: ["landing-force-staging", "political-operational-sync", "auxiliary-tasking"]
    partnerCooperation: ["political-operational-sync", "auxiliary-tasking", "landing-force-staging"]
    ravellanUnderstanding: ["auxiliary-tasking", "political-operational-sync", "landing-force-staging"]
  }

  copy: {
    sourceContextByRef: ...
    limitationByRef: ...
    evidenceSummaryByRef: ...
    judgementByRef: ...
    gapByRef: ...
    watchForByRef: ...
    assessmentChangeByRef: ...
    evidenceChangeCauseByRef: ...
    warningByRef: ...
    publicClaimByRef: ...
  }
}
```

Exact content is [[23C-HQ-BELIEF-EVIDENCE-CATALOG]].

Canonicalisation rules:

- definition/object keys lexical;
- `supersedesDefinitionIds` lexical;
- ordinary schedule lexical;
- public support evidence/group IDs in deterministic reducer order;
- authored target recommendation arrays remain ordered because order is semantic;
- duplicate/set-equivalent entries reject rather than silently deduplicate.

# 8. Static evidence definition

Strict shape equivalent to:

```ts
type V2HqEvidenceDefinition = Readonly<{
  definitionId: V2HqEvidenceDefinitionId
  claimId: "ravellan-intent"
  questionId:
    | "ravellan-intent-general"
    | "landing-force-staging"
    | "auxiliary-tasking"
    | "political-operational-sync"
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
  lifetimeRule:
    | { kind: "fixed"; observedCycle: 1|2|3|4|5; currentThroughCycle: 1|2|3|4|5|6 }
    | { kind: "result-through-terminal" }
  supersessionPolicy: "explicit-only" | "replace-older-same-question"
  supersedesDefinitionIds: readonly V2HqEvidenceDefinitionId[]
}>
```

Validation invariants come from [[23C-HQ-BELIEF-EVIDENCE-CATALOG]].

# 9. Runtime evidence occurrence and authoritative origin

Runtime evidence is derived, never persisted by #100.

Use an internal strict origin equivalent to:

```ts
type V2HqEvidenceOrigin =
  | {
      kind: "ordinary"
      slotId: string
      cycle: 1|2|3|4
    }
  | {
      kind: "derived"
      producer: "reroute" | "focused" | "lattice" | "liaison"
      triggerEntry: V2CanonicalLedgerEntryRef
      observationEntry: V2CanonicalLedgerEntryRef
      producerSlotId: string
    }

type V2CanonicalLedgerEntryRef = {
  kind: "command-set" | "ravellan-decision" | "task-collection"
  cycle: 1|2|3|4|5|6
  preRevision: number
  postRevision: number
  postStateHash: string
}
```

`task-collection` is a future #102 origin kind, not a #100 ledger change.

Runtime occurrence equivalent to:

```ts
type V2HqEvidence = Readonly<{
  instanceId: string
  definitionId: V2HqEvidenceDefinitionId
  origin: V2HqEvidenceOrigin
  observedCycle: 1|2|3|4|5|6
  currentThroughCycle: 1|2|3|4|5|6

  // copied from canonical definition, never caller-authored
  claimId: "ravellan-intent"
  questionId: string
  implication: "preparation" | "coercion" | "ambiguous"
  diagnosticity: "indicator" | "diagnostic"
  sourceGroupId: string
  corroborationGroupId: string | null
  sourceContextRef: string
  limitationRef: string
  summaryRef: string
  warningRole: "none" | "usable"
  publicCaseRole: "none" | "source-sensitive"
}>
```

`instanceId` is SHA-256 of shared canonical JSON for:

```text
{
  tag: "kestrel-hq-evidence-instance-v1",
  modelSemanticDigest,
  definitionId,
  observedCycle,
  origin
}
```

No player/free-form string controls identity. Reject duplicate instance IDs, one ID with differing semantics, or more than one directed occurrence for the same question/result cycle.

Normal DTOs never expose origin refs, revisions or hashes.

# 10. Occurrence instantiation

One sim-owned helper equivalent to:

```ts
instantiateV2HqEvidence({
  resolvedModel,
  definitionId,
  observedCycle,
  origin,
}): V2HqEvidence
```

It:

1. resolves the canonical definition;
2. validates producer kind against origin;
3. validates fixed/result timing;
4. derives current-through cycle;
5. copies every semantic field from the definition;
6. computes the instance ID;
7. rejects any caller attempt to provide/override semantic fields.

A fixed definition only instantiates at its authored cycle. A result-through-terminal definition instantiates only through an authorised producer at C5 or C6 as catalogued.

# 11. Trusted history index

Build one bounded index from a trusted session:

```ts
type V2VerifiedCycleHistory = {
  intentDeclaration: V2IntentDeclarationLedgerEntry
  ravellanByCycle: ReadonlyMap<number, V2RavellanDecisionLedgerEntry>
  commandByCycle: ReadonlyMap<number, V2CommandSetLedgerEntry>
}
```

Still fail on duplicate/missing/out-of-order prerequisites rather than guessing.

When HQ analysis cares what the coalition actually ordered, use authoritative:

`command-set.finalOrders`

never client dispositions.

# 12. Observation boundary

Exact dependency direction:

```text
verified hidden history
→ authorised observation extractor
→ bounded source fact
→ catalog mapping to definition ID
→ occurrence instantiation
→ reducers
→ safe brief
```

Raw hidden Ravellan state appears only inside authorised extractors.

## C2 reroute extractor

Only if C2 `finalOrders` contains the model’s reroute trigger.

Raw inputs only:

- verified C2 normal Ravellan action;
- verified C2 post-decision preparation.

No posture, policy row, seed, standing intent, current/future state or terminal behavior.

## C4 focused-staging extractor

Only if C3 `finalOrders` contains the model’s focused trigger.

Raw input only:

- verified C4 post-decision preparation.

No posture, C4 action, policy row, C3 tasking-time state, C5/C6 state or future input.

Exact mappings are [[23C-HQ-BELIEF-EVIDENCE-CATALOG]].

# 13. Ordinary evidence

Ordinary evidence has no hidden-state parameter.

Instantiate only the exact definition IDs in the model schedule for cycles at/before the query cut.

`combat-elements-dispersed` is bounded routine coverage, not hidden global truth.

Action-specific C4 situation prose never feeds evidence selection or reduction.

# 14. Current relevance and persistent supersession

An occurrence is current at Q iff:

- `observedCycle <= Q <= currentThroughCycle`; and
- it is not superseded by any later occurrence observed by Q.

Stale and superseded items remain in `evidenceHistory`.

Supersession is persistent:

- a newer `replace-older-same-question` occurrence suppresses every older occurrence with the same question ID;
- explicit `supersedesDefinitionIds` also apply;
- an older item never resurrects when the newer item becomes stale or is itself superseded.

The algorithm computes supersession from the complete occurrence history observed by Q before filtering current relevance.

# 15. Exact reducers

Use [[23-HQ-BELIEF-AND-EVIDENCE]] and [[23B-HQ-BELIEF-STATE-SPACE-AUDIT]].

## Intent

Exact semantic ID:

`kestrel-binary-hypothesis-v1`

The 16-row categorical truth table is mandatory. Evidence count never decides direction.

## Warning

`usable` iff a current, non-superseded preparation occurrence has `warningRole = usable`.

## Public case

Return a strict discriminated result:

```ts
type V2HqPublicCaseBasis =
  | { state: "none"; direction: null; supportingEvidenceInstanceIds: []; supportingCorroborationGroupIds: [] }
  | { state: "tentative"; direction: "preparation" | "coercion" | null; supportingEvidenceInstanceIds: readonly string[]; supportingCorroborationGroupIds: readonly string[] }
  | {
      state: "credible-source-sensitive"
      direction: "preparation" | "coercion"
      supportingEvidenceInstanceIds: readonly [string, string]
      supportingCorroborationGroupIds: readonly [string, string]
    }
```

Credible requires exactly:

- one current source-sensitive diagnostic;
- no current opposite directional occurrence of any class;
- one additional current same-direction source-sensitive occurrence from a different corroboration group.

Selection is deterministic:

1. primary diagnostic — newest, then definition ID, then instance ID;
2. corroborator from another group — diagnostic before indicator, then newest, definition ID, instance ID.

Directionless credible is schema-invalid.

# 16. Snapshot and total delta

Snapshot equivalent to:

```ts
type V2HqBeliefSnapshot = Readonly<{
  cycle: 1|2|3|4|5|6
  evidenceHistory: readonly V2HqEvidence[]
  currentEvidence: readonly V2HqEvidence[]
  assessment: V2HqAssessment
  warning: "none" | "usable"
  publicCaseBasis: V2HqPublicCaseBasis
  delta: V2HqBeliefDelta
  brief: V2HqIntelligenceBrief
}>
```

Delta is exactly the total structure in [[23B-HQ-BELIEF-STATE-SPACE-AUDIT]], including:

- assessment change;
- warning change;
- public-case state/direction changes;
- evidence cause;
- added/stale/superseded instance IDs.

Cause derivation:

- only newly observed material occurrences → `new-evidence`;
- only previous-current items becoming stale → `staleness`;
- only replacement/supersession → `supersession`;
- more than one cause class → `mixed`;
- no material current-product/evidence-set change → `none`.

A required update cannot disappear merely because the assessment string remained unchanged while warning/public action space changed.

# 17. Assessment-change mapping

Use the exact nine-category, 36-pair mapping in [[23-HQ-BELIEF-AND-EVIDENCE]]. No catch-all/default branch.

Initial snapshot uses `initial`; identical subsequent assessment uses `unchanged` even if another product changed. The total delta still reports that other change.

# 18. Deterministic brief selection

Normal brief is bounded:

- one judgement ref;
- at most two supporting evidence entries;
- at most one contrary entry;
- exactly one gap ref;
- at most one watch-for ref;
- at most one material change line;
- at most one warning line;
- no internal public-case enum; later #101 may expose a safe claim label.

## Supporting evidence order

Directional assessment:

1. supporting diagnostics before supporting indicators;
2. warning-bearing before non-warning within the same class;
3. newest observed cycle;
4. definition ID;
5. instance ID.

Select the first, then prefer a second from a different question ID where available before taking another from the same question.

Conflicted assessment:

- select one preparation representative and one coercion representative using the same rank;
- keep deterministic direction display order `preparation`, then `coercion`.

Unclear/weak:

- select the newest ambiguous occurrence if present; otherwise rely on the gap copy.

If a diagnostic direction survives opposite indicators, the highest-ranked opposite indicator is mandatory contrary evidence.

Normal safe entries include summary, source-context and limitation refs; they exclude occurrence origins/hashes and internal diagnosticity labels.

# 19. Public API responsibilities

Exact exported names may follow repository convention, but responsibilities are:

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

Keep lower reducers and occurrence/model validation directly unit-testable.

# 20. Future #102 seam

#100 predeclares all #102 evidence definitions but does not persist tasks or manufacture their occurrences.

#102 may supply only occurrences that:

- reference an exact catalogued Lattice/liaison definition;
- carry a valid closed target/question ID;
- have a replay-verifiable task/command origin;
- use the exact result cycle and producer mapping;
- preserve catalog semantics;
- use each Lattice target at most once in Kestrel;
- do not expose a zero-cost no-task option while unused targets remain.

A merely schema-valid arbitrary evidence object is rejected.

# 21. Content identity

The semantic digest covers the entire exact catalog/model, including decision-significant English copy and Lattice default target ordering.

#103 must include this digest in Kestrel’s final `contentDigest` before any normal player-facing Kestrel session is supported.

Changing reducer semantics, evidence metadata, current relevance, producer mapping, source/corroboration grouping, supersession, copy, target defaults or state-space envelope requires a new model semantic identity/digest.

# 22. Exact implementation order

1. shared canonical JSON serializer + golden #99 equivalence tests;
2. shared #100 enums/discriminated types;
3. strict definition/occurrence/origin/model/bundle schemas;
4. content model from [[23C-HQ-BELIEF-EVIDENCE-CATALOG]];
5. canonicalisation, model validation and semantic digest tests;
6. dedicated sim HQ-belief module + export;
7. model-bundle/scenario/semantic guards;
8. trusted history index and exact cycle cut;
9. occurrence-origin/ref builders and instantiation helper;
10. ordinary producer;
11. reroute and focused authorised extractors/mappers;
12. persistent supersession/current-relevance algorithm;
13. 16-row intent, warning and corroborated public-case reducers;
14. 36-pair assessment-change reducer + total product/evidence delta;
15. deterministic bounded brief selection;
16. historical/current/history APIs;
17. exact generated state-space test from [[23B-HQ-BELIEF-STATE-SPACE-AUDIT]];
18. hidden-information/equivalence/import/content-identity mutation tests;
19. fresh tradecraft review;
20. fresh replay/architecture review;
21. remediate all valid blockers and relevant integrity findings;
22. full repository gates;
23. commit/push/update/close #100;
24. stop before #98.

# 23. Required generated proof

The implementation must reproduce every count/vector in [[23B-HQ-BELIEF-STATE-SPACE-AUDIT]], not a subset.

Also prove:

- shared canonical serializer leaves all existing #99 hashes/digests unchanged;
- production sim has no content dependency;
- content has no sim dependency;
- model bundle digest mismatch rejected;
- current query before current Ravellan decision rejected;
- unsupported scenario/model/reducer rejected;
- unverified import cannot reach normal projection;
- replay-validated session can project;
- repeated derivation deep-equal and leaves state/hash/revision unchanged;
- origin hashes never enter normal DTO;
- V1 unchanged.

# 24. Independent reviews

## Intelligence/tradecraft reviewer

Attack:

- source/method ambiguity;
- stale evidence silently forgotten;
- diagnosticity behaving like vote count;
- material contrary evidence hidden;
- warning conflated with estimate;
- one-source public accusation;
- fake Lattice choice/default;
- result timing and terminal hindsight;
- dense dossier/confidence-meter presentation.

## Replay/architecture reviewer

Attack:

- persisted #100 creep;
- derivation mutation;
- unverified import use;
- cycle-cut/future-entry leakage;
- terminal-action leakage;
- duplicate canonical serializers;
- model-bundle/content-identity mismatch;
- occurrence-origin collision/forgery;
- temporary supersession/resurrection;
- current-state-for-history bugs;
- sim/content dependency inversion;
- #99 hash/order regression;
- V1 contamination;
- generic-framework creep.

All P0/P1 findings are mandatory. Also remediate P2 findings involving hidden information, replay/content identity, deterministic ambiguity, model coverage or player-facing misrepresentation.

# 25. Closure rule

#100 closes only when:

- all three canonical contracts `23`, `23A`, `23B`, and exact catalog `23C` are implemented;
- generated counts/state vectors match;
- no omitted/dead definition remains;
- no fake same-target/no-task option exists;
- assessment, warning and public case are separate and total;
- public credibility is corroborated and freezes an exact support basis when used;
- history/currency/supersession/C6 cuts are correct;
- no persisted V2 shape/version changed;
- both independent reviews are clear after remediation;
- full gates pass;
- implementation commit is pushed and issue evidence recorded;
- no #98 implementation began in the same run.
