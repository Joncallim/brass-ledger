---
type: v2-architecture-contract
status: active
---

# V2 Architecture Contract

Backlink: [[README]]

## Boundaries

`packages/shared` owns serialisable Zod contracts and pure derived readout
types. `packages/content` owns authored Kestrel data and validation. `packages/sim`
owns deterministic transitions, recommendation derivation, adversary policy,
belief update, consequence progression, and replay validation. `packages/headless`
owns non-browser campaign/laboratory execution. `apps/server` owns session
mutation, expectedRevision checks, save persistence, and scenario resolution.
`apps/web` renders server-derived command room and consequence results only.

World truth, HQ belief, campaign/institution state, and presentation may be
represented with nested contracts but must have separate types/fields and
explicit transition functions. World truth is persisted/replayable and may be
read by world/external/consequence functions. Adversary policy reads only its
separate persisted `AdversaryObservation` projection. HQ belief is the only intelligence
input to recommendations and player-visible estimates. Presentation must never
derive hidden facts locally.

## Replay and compatibility

V2 is a versioned ruleset, not an in-place reinterpretation of V1 campaigns.
V1 schemas, sessions, import/export, and replay remain supported under their
existing versions. V2 session identity must declare a V2 scenario/content/ruleset
version; V1 sessions are never silently migrated to V2. V2 replay must rebuild
from canonical initial state plus an authoritative action ledger, verify each
pre/post transition, and compare final state. Its canonical digest is a full
SHA-256 of stable key-sorted JSON tagged `v2`, covering ruleset/content identity,
action sequence, pre-state, post-state, and final state. V2 identity includes an
immutable canonical content digest plus explicit ruleset version; import rejects
a live-registry mismatch before replay. All stochastic selection is seeded from
persisted inputs.

The required V2 digest envelope is `{ tag, rulesetVersion, contentDigest,
initialState, action, preState, postState }`; the final-session digest uses the
same envelope with the complete ordered ledger and reconstructed final state.
The stored content digest is over canonical authored V2 content after reference
resolution. #95 must publish golden vectors, a mismatch error contract, a
required-ledger discriminator for V2, and paired V1 DTO/import non-interference
tests; V1’s legacy optional-ledger path remains unchanged. A V2 player DTO does
not exist until #105 supplies a V2 world/belief projection. Its hidden-truth
non-interference test belongs to #105; #95 must not invent a presentation root
merely to make that test vacuous.

Server mutation remains authoritative and revision-protected; one cycle command
set is one atomic revisioned mutation. Headless and
server must call the same sim transition. The web client may not send arbitrary
derived recommendations or mutate a whole session.

## Player-safe projection

Once #105 exists, server endpoints return a V2 player DTO, never raw world truth, truth
provenance, future preparation, adversary observations, oracle data, or private
ledger fields. Agenda membership, legal orders, task targets, reasons, previews,
and reveal derive only from HQ belief plus public campaign state. Holding those
inputs constant while changing hidden truth must produce a deep-equal DTO.

## Recommendation integrity

Recommendation input is limited to HQ belief, standing intent, chief worldview,
known commitments, institutional state, and the visible agenda issue. Output is
`recommendedDisposition` plus an ordered, discrete list of reason references.
It contains no omniscient score. Tests must hold belief constant while changing
world truth and prove equal recommendations; they must also show different chief
views can recommend differently from the same belief.

## Reuse and non-reuse

Reuse deterministic session/replay primitives, registry resolution, action-ledger
integrity, expectedRevision, headless runner, save tombstones, and accessible
presentation patterns. Do not reuse the mandatory memo packet, mandatory Chiefs
stage, old scenario assumptions, or UI-owned game rules as V2 semantics.
