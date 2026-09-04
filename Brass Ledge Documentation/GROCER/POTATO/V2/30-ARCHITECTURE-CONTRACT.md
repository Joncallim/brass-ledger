---
type: v2-architecture-contract
status: active
---

# V2 Architecture Contract

Backlink: [[README]]

# Ownership boundaries

`packages/shared` owns strict serialisable contracts, Zod schemas and pure browser-safe canonical JSON/readout types.

`packages/content` owns authored Kestrel data, exact semantic copy, content validation and semantic-model digests.

`packages/sim` owns all authoritative rules and deterministic derivation, including:

- Ravellan policy;
- world/action manifestation;
- HQ observation extraction, evidence occurrences and role-specific reducers;
- recommendation/dissent;
- delegated final-order derivation;
- complete command-package legality/composition;
- consequences/capability transitions;
- coalition→Ravellan observation projection;
- terminal route legality/resolution;
- replay validation.

`packages/headless` owns non-browser orchestration only.

`apps/server` owns authoritative mutation transport, `expectedRevision`, persistence, trusted content resolution and strict safe-projection delivery. It calls sim and never reimplements game rules.

`apps/web` renders strict safe projections and submits player authority. It never receives raw V2 state or becomes authority for recommendation, package legality, intelligence or terminal resolution.

# State and information separation

World truth, HQ-derived intelligence, campaign/institution state and presentation have separate types and explicit transitions/derivations.

World truth is persisted/replayable and may be read only by world/consequence functions and explicitly authorised observation extractors.

Normal adversary policy reads only:

- cycle;
- its own posture/preparation;
- persisted typed `AdversaryObservation` records.

Identity/seed are initialisation-only.

HQ intelligence follows [[23-HQ-BELIEF-AND-EVIDENCE]], [[23A-HQ-BELIEF-EXECUTION-ARCHITECTURE]], [[23B-HQ-BELIEF-STATE-SPACE-AUDIT]] and [[23C-HQ-BELIEF-EVIDENCE-CATALOG]].

For #100:

- evidence occurrences, assessment, tactical warning and public-case basis are pure derived read models;
- assessment, warning and public case may use different current-relevance windows for the same occurrence;
- raw hidden state is confined to exact observation extractors;
- narrative prose is never an analytical input;
- a normal derivation accepts an opaque replay-verified projection context, not arbitrary raw `V2Session` data.

Exact coalition→Ravellan projection is [[37A-COALITION-TO-RAVELLAN-SIGNAL-MATRIX]].

Normal presentation follows [[38-PLAYER-SAFE-PROJECTION-CONTRACT]].

# Complete command-package authority

A player submits one atomic package of dispositions/authorised choices. The client does not own the final order set.

`packages/sim` must:

1. resolve recommendations/delegated orders;
2. combine interventions, defer, task and liaison choices;
3. construct the complete final-order set;
4. validate cross-issue compatibility under [[39-KESTREL-CROSS-SYSTEM-COMPOSITION]];
5. resolve order-independent package effects and signals;
6. reject invalid packages without silently repairing another choice.

Web may use safe requirement/conflict refs to explain invalid drafts, but server/sim independently validates. Headless is held to the same contract.

The untouched all-Delegate package being legal is a content/recommendation invariant.

# Replay and compatibility

V2 is a versioned ruleset, never an in-place reinterpretation of V1.

V1 schemas, sessions, import/export, replay and client semantics remain supported and are never silently migrated to V2.

V2 replay rebuilds from canonical initial state plus the complete ordered player/system ledger, recomputes every persisted transition and verifies pre/post state, revision, hashes and final digest.

V2 identity contains immutable ruleset version and content digest. Import rejects trusted-live identity mismatch before replay.

Seeded selection is legal only where explicitly authorised.

# Canonical JSON and digest

Canonical digest uses full SHA-256 over stable key-sorted JSON tagged for V2.

The browser-safe canonical JSON algorithm belongs in `packages/shared`. The existing sim `canonicalV2Json` API delegates to it so #99 hashes remain byte-identical.

Moving the serializer is not permission to alter canonical bytes. Golden tests must preserve every existing #99 hash and digest.

The required digest envelope remains conceptually:

`{ tag, rulesetVersion, contentDigest, initialState, action, preState, postState }`

Final-session digest covers the complete ordered ledger and reconstructed final state.

# Prototype format-version rule

Whenever implementation changes persisted V2 state shape, ledger discriminator/shape, replay transition semantics or canonical persisted identity:

1. inspect the actual current `v2CurrentRulesetVersion`;
2. advance to the next repository-consistent prototype minor version;
3. prove previous payload is not silently reinterpreted;
4. add no migration unless separately authorised;
5. preserve V1.

Pure read-model or in-memory API changes do not bump the persisted format, but decision-significant derived semantics still require content/model identity protection.

# Authoritative mutation invariant

Every authoritative value follows exactly one pattern.

## Pattern A — replay-verifiable transition

A persisted mutation has explicit canonical ledger/system evidence. Trusted replay recomputes transition, state, revision and hashes.

## Pattern B — pure derived readout

The value is not persisted as authoritative state and is deterministically reconstructed from replay-verified history plus exact trusted content identity.

There is no third pattern where a value is persisted between ledger entries and trusted from the save.

Saved browser/client data never substitutes for transition evidence.

# #99 committed lifecycle

Committed #99 owns:

- first-class Ravellan state;
- `ravellan-decision` entries;
- `intent-declaration → ravellan-decision → command-set` mutation relationship;
- trusted policy recomputation;
- current persisted version `0.4.0-prototype`.

`command-set` advances state cycle by one.

No downstream issue may weaken #99 replay/order validation to store new state more conveniently.

# #100 integration

#100 uses Pattern B only:

```text
ravellan-decision CN
→ derive HQ evidence/products from verified history/model
→ build agenda/recommendation/player projection
→ command-set CN
```

The derived step:

- creates no ledger entry;
- increments no revision;
- mutates no state;
- performs no expiry write;
- preserves `0.4.0-prototype`;
- reproduces historical readouts on demand.

After a command advances to N+1, the next current brief is not ready until the N+1 Ravellan decision exists.

# Verified projection context

Derived rules that consume ledger history accept an opaque sim-owned `V2VerifiedProjectionContext`.

The context is created only:

- after trusted replay has re-executed the included prefix; or
- by a sim-owned live authoritative path using the same invariant.

The public constructor is not exported. A plain structurally matching object or arbitrary parsed `V2Session` is not accepted.

For historical cycle Q, the verified cut includes Ravellan Q and commands only through Q−1.

Before #98 closes, `V2TrustedAgendaProvider` evolves from state-only input to the verified prefix context so recommendation during replay can use #100 without seeing the unverified current/future save. This in-memory API change does not alter persisted format.

# Derived-model identity

A pure read model can still rewrite history if its semantics change under the same identity.

#100 therefore supplies a canonical `kestrel-hq-belief-v1` semantic digest covering:

- evidence definitions;
- role-specific relevance;
- source/corroboration groups;
- producer mappings;
- supersession;
- reducer/basis semantics;
- decision-significant copy;
- Lattice default target order.

#103 must bind that exact digest into Kestrel’s final content identity before normal player-facing Kestrel use.

A self-consistent but unbound model bundle is internal test/architecture input only.

# Future persisted integration

For #101 onward, each genuinely persisted value independently chooses the smallest replay-safe Pattern A integration or remains Pattern B.

Any new persisted entry requires:

- strict discriminator/schema;
- exact cycle/order validation;
- trusted recomputation and tamper rejection;
- hash/revision coverage;
- prototype version bump;
- V1 isolation.

Do not widen `ravellan-decision` to own unrelated state.

If the committed lifecycle cannot support a required mutation without material redesign, raise `BLOCKED: PRODUCT DECISION REQUIRED` before coding around it.

# Server and headless

Server/headless call the same sim transitions and read-model functions.

Neither may send/accept arbitrary derived recommendation, evidence, assessment, warning, public case or state patches.

Operational Lattice target preselection and retargeting remain authoritative sim/content semantics, not UI defaults.

# Player-safe projection

Normal endpoints never return raw world truth, truth provenance, adversary observations/actions, oracle data, private ledger fields, evidence origins/hashes or full session state.

For #100, normal players receive a bounded Intelligence-Chief brief. Internal role-current sets, basis pattern and public-case enum remain server/sim data.

Terminal truth appears only in terminal-complete debrief-safe DTOs and never rewrites historical HQ readouts.

# Recommendation integrity

Recommendation reads only the specific #100 product(s) an issue is authorised to use, standing intent, chief worldview, known commitments/institutional/public state and visible course metadata.

It never sees hidden world state, evidence origin hashes or raw observation facts.

[[24-STAFF-RECOMMENDATION-POLICY]] owns the algorithm; [[36-KESTREL-AGENDA-COURSE-MATRIX]] owns Kestrel ties.

# Reuse and non-reuse

Reuse deterministic session/replay primitives, identity/digest infrastructure, revision protection, headless execution and accessible presentation patterns.

Do not reuse as V2 semantics:

- mandatory memo packets or Chiefs stage;
- V1 scenario assumptions/predicted event preview;
- UI-owned rules;
- generic intelligence/opponent/lifecycle plugin frameworks built before a second scenario proves need.
