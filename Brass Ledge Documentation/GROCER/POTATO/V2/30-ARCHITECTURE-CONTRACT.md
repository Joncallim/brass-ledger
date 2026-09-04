---
type: v2-architecture-contract
status: active
---

# V2 Architecture Contract

Backlink: [[README]]

## Ownership boundaries

`packages/shared` owns serialisable strict contracts/Zod schemas and pure derived readout types.

`packages/content` owns authored Kestrel data/metadata and validation.

`packages/sim` owns all authoritative game rules and deterministic derivation, including:

- Ravellan policy;
- world/action manifestation;
- HQ evidence/assessment/warning/public-case derivation;
- recommendations/dissent;
- final delegated-order derivation;
- complete command-package legality/composition;
- consequences/capability transitions;
- coalition→Ravellan observation projection;
- terminal route legality/resolution;
- replay validation.

`packages/headless` owns non-browser orchestration only.

`apps/server` owns authoritative session mutation transport, `expectedRevision`, persistence, scenario resolution and strict safe-projection delivery. It calls sim; it does not reimplement package/game rules.

`apps/web` renders only strict safe projections and submits player authority. It never receives raw V2 state and never becomes final authority for recommendation/package legality/intelligence analysis.

## State / information separation

World truth, HQ-derived intelligence, campaign/institution state and presentation must have separate types and explicit transition/derivation functions.

World truth is persisted/replayable and may be read only by world/external/consequence/explicit observation functions authorised to inspect it.

Normal adversary policy may read only:

- cycle;
- its own persisted posture/preparation;
- persisted `AdversaryObservation` projection.

Identity/seed are initialisation-only under [[22-RAVELLAN-EXECUTABLE-POLICY]].

HQ intelligence follows [[23-HQ-BELIEF-AND-EVIDENCE]] / [[23A-HQ-BELIEF-EXECUTION-ARCHITECTURE]].

For #100 specifically, HQ evidence, intent assessment, warning and public-case basis are **pure derived readouts**, not persisted campaign state.

Directed collection may inspect only target-authorised world/action-history facts in [[23-HQ-BELIEF-AND-EVIDENCE]] and [[26-LATTICE-COLLECTION-MATRIX]], then creates ordinary derived HQ evidence. Hidden posture alone never changes sensor result.

Exact coalition→Ravellan observation projection belongs to [[37A-COALITION-TO-RAVELLAN-SIGNAL-MATRIX]].

Presentation never derives hidden facts locally. [[38-PLAYER-SAFE-PROJECTION-CONTRACT]] is the normal-player boundary.

## Complete command-package authority

A player submits one atomic command package containing dispositions/authorised player choices. That does **not** mean the client owns the final order set.

`packages/sim` must:

1. resolve authoritative recommendations/delegated final orders;
2. combine player interventions/defer/task/liaison choices;
3. construct the complete final-order set;
4. validate cross-issue compatibility under [[39-KESTREL-CROSS-SYSTEM-COMPOSITION]];
5. resolve order-independent package effects/signals;
6. reject invalid packages without silently repairing another issue.

Web may use safe requirement/conflict refs to prevent/explain an invalid draft, but server/sim independently validates. Headless policy output is held to the same contract.

The untouched all-Delegate package being legal is a content/recommendation invariant, not a client workaround.

## Replay / compatibility

V2 is a versioned ruleset, never an in-place reinterpretation of V1.

V1 schemas/sessions/import/export/replay remain supported under existing versions and are never silently migrated to V2.

V2 replay rebuilds from canonical initial state plus the complete ordered authoritative player/system ledger, recomputes/verifies every persisted transition and compares final state.

Canonical digest is full SHA-256 of stable key-sorted JSON tagged `v2`, covering ruleset/content identity, action/system sequence, pre/post states and final state.

V2 identity contains immutable canonical content digest + explicit ruleset version; import rejects live-registry mismatch before replay.

Seeded selection is legal only where a canonical contract explicitly authorises it.

Required digest envelope remains:

`{ tag, rulesetVersion, contentDigest, initialState, action, preState, postState }`

Final-session digest uses the same principle with complete ordered ledger + reconstructed final state.

## Prototype format-version rule

Pre-gate V2 formats are disposable prototypes.

Whenever implementation changes persisted V2 state shape, ledger discriminator/shape, replay transition semantics or canonical persisted identity:

1. inspect actual current `v2CurrentRulesetVersion`;
2. advance to next repository-consistent prototype minor version;
3. prove previous prototype payload is not silently reinterpreted;
4. add no migration unless separately authorised;
5. leave V1 behavior unchanged.

Do not pre-freeze numeric future versions in planning docs except where an already-committed version is being explicitly preserved.

## Authoritative mutation invariant

Every authoritative persisted mutation follows exactly one pattern:

### A. Replay-verifiable transition

Explicit canonical ledger/system evidence whose trusted replay recomputes/validates transition, state, revision and hashes.

### B. Pure derived readout

Not persisted as authoritative state; deterministically derived from already-verified state/content/history.

There is no third “persist between ledger entries and trust the save” pattern.

Saved client/browser data never substitutes for trusted transition evidence.

## #99 committed lifecycle

Committed #99 owns:

- first-class Ravellan state;
- `ravellan-decision` ledger entries;
- canonical `intent-declaration → ravellan-decision → command-set` mutation relationship;
- trusted replay recomputation;
- current V2 persisted version `0.4.0-prototype`.

`command-set` advances `state.cycle` by one.

No downstream issue may weaken #99 replay/order validation merely to make new state easier to store.

## #100 integration — resolved

#100 uses **Pattern B only**.

Canonical live flow becomes:

```text
ravellan-decision CN
→ derive HQ intelligence/readout from verified state + ledger history
→ build agenda/recommendations/player projection
→ command-set CN
```

The bracketed intelligence step:

- creates no ledger entry;
- increments no revision;
- mutates no state;
- performs no evidence-expiry write;
- does not change `v2CurrentRulesetVersion`;
- is reproduced on demand for replay-safe history/debrief/projection.

Immediately after `command-set CN` advances the state to N+1, the next-cycle HQ brief is **not ready** until `ravellan-decision C(N+1)` exists. [[23A-HQ-BELIEF-EXECUTION-ARCHITECTURE]] owns the phase guard.

#100 is therefore **not** an example for later issues that genuinely persist consequences/capabilities. #101 onward must independently decide whether each new value is Pattern A or B.

## Future persisted integration

For #101 onward, any genuinely persisted transition must inspect the actual current replay validator and choose the smallest replay-safe integration:

- narrow named system ledger entry where authoritative state genuinely changes; or
- pure derivation where persistence is unnecessary.

Any new persisted entry requires:

- strict discriminator/schema;
- exact cycle/order validation;
- replay recomputation/tamper rejection;
- hash/revision coverage;
- prototype version bump;
- V1 isolation.

Do not widen `ravellan-decision` to own unrelated state.

If the committed lifecycle cannot support a required mutation without material redesign, raise `BLOCKED: PRODUCT DECISION REQUIRED` with the concrete conflict before coding around it.

## Derived-history trust boundary

A derived rule may read authoritative historical ledger evidence only after that history is trusted.

Normal imported-save route:

```text
raw payload
→ identity/content validation
→ trusted replay validation
→ canonical V2Session
→ derived intelligence/recommendation/projection
```

Never derive player-facing HQ intelligence directly from unverified imported ledger fields.

Where a derived collection selector needs hidden historical facts, its function signature must expose **only the exact authorised facts**. Example #100 selectors in [[23A-HQ-BELIEF-EXECUTION-ARCHITECTURE]] may read C2 action/preparation or C4 preparation, but not hidden posture.

## Server mutation

Server mutation is authoritative/revision protected. One submitted cycle command package is one atomic **player-authority** mutation even where deterministic system transitions are separate ledger entries before/after it.

Headless/server call the same sim transitions/derivations. Neither client nor API may send arbitrary derived recommendations, evidence, assessment, warning or state patches.

## Player-safe projection

[[38-PLAYER-SAFE-PROJECTION-CONTRACT]] owns strict safe DTOs.

Normal endpoints never return raw world truth, truth provenance, future preparation, adversary observations/action IDs, oracle data, private ledger fields or full session state.

Agenda/legal orders/task targets/reasons/reveal derive from legitimate HQ/public state. Holding those inputs constant while changing hidden truth must produce deep-equal safe semantics.

For #100, the normal player receives a bounded Intelligence-Chief brief derived in sim, not raw evidence-selector facts/internal assessment enums.

Terminal truth is exposed only through terminal-complete debrief-safe DTOs, never raw hidden state.

## Recommendation integrity

Recommendation input is limited to derived HQ assessment/warning where authorised, standing intent, chief worldview, known commitments/institutional/public state and visible course metadata.

[[24-STAFF-RECOMMENDATION-POLICY]] owns algorithm; [[36-KESTREL-AGENDA-COURSE-MATRIX]] owns Kestrel metadata.

Recommendation output has discrete reasons/concerns/dissent, no omniscient/global score.

Changing hidden world truth alone with legitimate inputs held constant cannot change advice.

## Reuse / non-reuse

Reuse deterministic session/replay primitives, registry/content identity, action-ledger integrity, revision protection, headless runner, save tombstones and accessible presentation patterns.

Do not reuse as V2 semantics:

- mandatory memo packet;
- mandatory Chiefs stage;
- old scenario assumptions;
- UI-owned rules;
- V1 predicted-event preview;
- generic plugin/lifecycle/opponent/intelligence framework built speculatively.
